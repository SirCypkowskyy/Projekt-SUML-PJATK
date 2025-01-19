from typing import Optional

from langchain_community.utilities.dalle_image_generator import DallEAPIWrapper
from langchain_core.documents import Document
from langchain_core.messages import AIMessage, SystemMessage
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import MessagesState
from langgraph.types import interrupt
from typing_extensions import Annotated

from .models import CharacterMoves, CharacterSpecs, CharactersSummary, Questions
from .retrievers import SHEETS_PATH, description_retriever, description_retriever_tool


# State - has messages from MessagesState
class GraphState(MessagesState):
    questions: Questions
    image_url: Optional[str]
    summary: CharactersSummary
    character_class: Optional[Annotated[str, ..., "The class of the character"]]
    document_sheet: Optional[Document]
    character_specs: Optional[CharacterSpecs]
    moves: Annotated[CharacterMoves, ..., "The moves of the character"]


# Node
def generate_questions(state: GraphState):
    model = ChatOpenAI(model="gpt-4o-mini")
    model_with_json_questions_output = model.with_structured_output(Questions)
    sys_msg = SystemMessage("""
You are helpful assistant to generate 3 helpful questions with a short guidance about how to answer them based on given information.
Those questions should be helpful to later generate a character for the tabletop RPG game called "Świat Apokalipsy".
Question should be more specific than general and should help to fill character's sheet like class, skills, items.

You will receive a 4 block of information:
1. basic information which will contain name of the character, age and other basic information.
    example: Moja postać ma na imię Max, ma 25 lat, jest wysokim, szczupłym mężczyzną o ciemnych włosach i niebieskich oczach.
2. history of the character which will contain information about the past and skills of the character gained during the past.
    example: Max urodził się w małej wiosce, gdzie jego rodzina prowadziła gospodarstwo rolne. W wieku 18 lat opuścił rodzinny dom i wyruszył w świat, aby zdobyć nowe doświadczenia. Podczas swoich podróży nauczył się walczyć i przetrwać w trudnych warunkach.
3. Character's traits which will contain information about the character's personality and other traits.
    example: Max jest odważny, lecz nieufny wobec obcych. Jest lojalny wobec swoich przyjaciół i gotów poświęcić się dla nich. Często działa impulsywnie, co prowadzi go do niebezpiecznych sytuacji.
4. Game's world information which will contain information about the world where the game takes place.
    example: Świat postapokaliptycznego przedmieścia Warszawy, gdzie przetrwali unikają stolicy.

Example of questions:
1. Co sprawiło, że Twoja postać przetrwała apokalipsę?
    Pomyśl o umiejętnościach, szczęściu lub okolicznościach, które pozwoliłyby Twojej postaci przetrwać.
2. Jakie wydarzenie z przeszłości Twojej postaci miało największy wpływ na jej obecną postawę?
    Może to być trauma, triumf lub inna sytuacja, która ukształtowała Twoją postać.
3. Kogo Twoja postać straciła podczas apokalipsy i jak to wpłynęło na jej życie?
    Zastanów się nad relacjami i więzami, które zostały zerwane.

Your output should be in Polish language and contain exactly 3 questions.
""")

    questions = model_with_json_questions_output.invoke([sys_msg] + state["messages"])
    return {"messages": [], "questions": questions}


# Node
def human_input(state: GraphState):
    human_message = interrupt("human_input")
    for i, answer in enumerate(human_message["answers"]):
        answer_t = answer["answer"]
        state["questions"]["questions"][i]["answer"] = answer_t

    return {"messages": [], "questions": state["questions"]}


# Node
def summarizer(state: GraphState):
    model = ChatOpenAI(model="gpt-4o-mini")
    model_with_json_summary_output = model.with_structured_output(CharactersSummary)

    sys_msg = SystemMessage(
        """You are helpful assistant to generate a summary of the character based on the given information.

        Your task is to generate a summary of the character based on the information provided by the user in the same language as the input.

        Your output should contain the following information:

        Wygląd (appearance) - basic information about the character's appearance, short but detailed description. 1-2 sentences.
        Opis (description) - description of the character. May contain extremely short background and basic traits. 5 sentences at most.
        """
    )

    last_human_message = state["messages"][0]

    answers = ""
    for question in state["questions"]["questions"]:
        answers += f"{question['answer']}\n"

    character_info = last_human_message.content + "\n" + answers

    summary = model_with_json_summary_output.invoke([sys_msg] + [character_info])

    text_summary = f"{summary['appearance']}\n{summary['description']}"
    ai_message = AIMessage(text_summary)
    state["messages"].append(ai_message)
    return {"messages": state["messages"], "summary": summary}


# Node
def retrieve_node(state: GraphState):
    messages = state["messages"]
    last_message = messages[-1]

    model = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    prompt = PromptTemplate(
        template="""
        You are an assistant for retrieving information about the character's description for tabletop RPG game 'Świat Apokalipsy'.
        Use the following pieces of information to retrieve the character's class description.
        information about the character to which the description should be related: \n\n {context} \n\n
        """,
        input_variables=["context"],
    )

    model_with_tools = model.bind_tools([description_retriever_tool])
    chain = prompt | model_with_tools

    response = chain.invoke({"context": last_message})

    docs = description_retriever.get_relevant_documents(last_message.content)
    # print(f"{docs=}")
    return {"messages": [response], "document_sheet": docs[0]}


# Node
def choose_class(state: GraphState):
    document = state["document_sheet"]
    class_name = document.metadata["document_id"]

    print(f"Class is {class_name}")
    return {"character_class": class_name}


# Node
def get_moves(state: GraphState):
    model = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    prompt = PromptTemplate(
        template="""
        You are an assistant for selecting moves for the given character's description for tabletop RPG game 'Świat Apokalipsy'.
        You will get a characters description and class sheet.
        Your goal is to retrieve RUCHY of class (including descriptions) and RUCHY PODSTAWOWE from class sheet, and choose the best options for the character according to the description of each category.
        
        When extracting RUCHY of the class include the description of each move.
        When extracting RUCHY PODSTAWOWE answer "Dostajesz wszystkie ruchy podstawowe".
        
        Description: \n\n {description} \n\n
        Class sheet: \n\n {class_sheet} \n\n
        """,
        input_variables=["description", "class_sheet"],
    )

    model_wth_structured_output = model.with_structured_output(CharacterMoves)
    chain = prompt | model_wth_structured_output

    character_class = state["character_class"]
    character_sheet_path = SHEETS_PATH / f"{character_class}.md"
    description = f"{state['summary']['appearance']}\n{state['summary']['description']}"
    class_sheet = character_sheet_path.read_text()
    response = chain.invoke({"description": description, "class_sheet": class_sheet})
    print(f"Character specs: {response}")
    return {"messages": state["messages"], "moves": response}


# Node
def build_character_attributes(state: GraphState):
    model = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    prompt = PromptTemplate(
        template="""
        You are an assistant for creating a character for tabletop RPG game 'Świat Apokalipsy'.
        You will get a characters description, class sheet and moves.
        Analyze the information.
        Your goal is to retrieve CECHY and SPRZĘT, and choose the best options for the character according to the description of each category.
                
        Description: \n\n {description} \n\n
        Moves: \n\n {moves} \n\n
        Class sheet: \n\n {class_sheet} \n\n
        """,
        input_variables=["description", "class_sheet", "moves"],
    )

    model_wth_structured_output = model.with_structured_output(CharacterSpecs)
    character_class = state["character_class"]
    character_sheet_path = SHEETS_PATH / f"{character_class}.md"

    description = f"{state['summary']['appearance']}\n {state['summary']['description']}"
    class_sheet = character_sheet_path.read_text()

    chain = prompt | model_wth_structured_output
    response = chain.invoke(
        {"description": description, "class_sheet": class_sheet, "moves": state["moves"]}
    )
    print(f"Character specs: {response}")
    return {"messages": state["messages"], "character_specs": response}


# Node
def generate_image(state: GraphState):
    model = ChatOpenAI(model="gpt-4o-mini", temperature=0.5)
    appearance = state["summary"]["appearance"]
    description = state["summary"]["description"]
    prompt = PromptTemplate(
        """
        Using the provided appearance and description of a character, compose a detailed and vivid description suitable for DALL-E to generate an image.
        The image should depict a fully visible character—not just the face—in a post-apocalyptic world.
        Include intricate details about the character's clothing, equipment, surroundings, and pose to create an immersive and visually striking scene.
        Image cannot contain any text or logos.
        Character should be sad and determined, with a sense of loss and hope.
        The scene should feature cinematic lighting, gritty textures, dramatic shadows, post-apocalyptic themes, a warm and dusty color palette, high-definition quality, realistic details, and bold composition --ar 16:9.

        Appearance: {appearance}
        Description: {description}
        """,
        input_variables=["appearance", "description"],
    )

    chain = prompt | model
    image_url = DallEAPIWrapper(model="dall-e-3").run(
        chain.invoke({"appearance": appearance, "description": description})
    )
    return {"messages": state["messages"], "image_url": image_url}


# Edge
def human_interrupt_new_image():
    human_message = interrupt("human_input")
    return human_message["is_new_image"] == "yes"
