from langchain_openai.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from pathlib import Path
from typing import List, Optional, Union, Dict
from langchain.tools.retriever import create_retriever_tool
from langchain_community.utilities.dalle_image_generator import DallEAPIWrapper
from langchain_core.documents import Document
from langchain_core.messages import AIMessage, SystemMessage
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_text_splitters import MarkdownHeaderTextSplitter
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode
from langgraph.types import Command, interrupt
from pydantic import Field
from typing_extensions import Annotated, TypedDict
from core.config import settings
import os

if not os.environ.get("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY

# Ścieżka do plików z kartami postaci
sheets_path = Path("data/karty-postaci/")
if not sheets_path.exists():
    sheets_path.mkdir(parents=True, exist_ok=True)
    # Tworzymy przykładowy plik markdown jeśli katalog jest pusty
    example_file = sheets_path / "przyklad.md"
    example_content = """# Przykładowa Karta Postaci
## OPIS POSTACI
To jest przykładowy opis postaci.

## CECHY
- Siła: +1
- Zręczność: -1

## RUCHY
- Ruch 1: Opis ruchu 1
- Ruch 2: Opis ruchu 2

## SPRZĘT
- Sprzęt 1: Opis sprzętu 1
- Sprzęt 2: Opis sprzętu 2
"""
    example_file.write_text(example_content, encoding='utf-8')

sheets = sheets_path.glob("*.md")
split_document = []
for sheet in sheets:
    with open(sheet, "r", encoding='utf-8') as f:
        raw_markdown = f.read()

    document_id = sheet.stem
    document = Document(page_content=raw_markdown, metadata={
                        "document_id": document_id})

    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
        ("####", "Header 4"),
    ]
    markdown_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on, strip_headers=False)

    splits = markdown_splitter.split_text(document.page_content)
    for chunk_id, split in enumerate(splits):
        chunk_document = Document(
            page_content=split.page_content,
            metadata={
                **document.metadata,
                **split.metadata,
                "chunk_id": chunk_id,
            },
        )
        split_document.append(chunk_document)


vectorstore = Chroma.from_documents(split_document, OpenAIEmbeddings())

main_retriever = vectorstore.as_retriever(
    search_kwargs={"k": 10}, search_type="similarity")
main_retriever_tool = create_retriever_tool(
    main_retriever,
    "retrieve_character_sheet",
    "Search and return information about how to create given character for tabletop RPG game 'Świat Apokalipsy'.",
)

description_retriever = vectorstore.as_retriever(
    search_kwargs={"k": 1, "filter": {"Header 2": "OPIS POSTACI"}}, search_type="mmr"
)
description_retriever_tool = create_retriever_tool(
    description_retriever,
    "describe_character_sheet",
    "Search and return information about characters description for tabletop RPG game 'Świat Apokalipsy'.",
)

# Modele danych


class Answer(TypedDict):
    """Answer to a question"""
    answer: Annotated[str, ..., "The answer to the question"]


class Question(TypedDict):
    """Question to ask the user"""
    question: Annotated[str, ..., "The question to ask the user"]
    guidance: Annotated[str, ...,
                        "Guidance to help the user answer the question"]
    answer: Annotated[Optional[str], ...]


class Questions(TypedDict):
    """List of questions to ask the user"""
    questions: List[Question] = Field(
        description="The questions to ask the user", min_length=3)


class CharactersSummary(TypedDict):
    """Summary of the characters in the story"""
    appearance: Annotated[str, ...,
                          "Description of the character's appearance"]
    description: Annotated[str, ..., "Description of the character"]


class Move(TypedDict):
    """Moves of the character"""
    name: Annotated[str, ..., "The name of the move"]
    description: Annotated[str, ..., "The description of the move"]


class Stuff(TypedDict):
    """Stuff (Sprzęt) of the character"""
    name: Annotated[str, ..., "The name of the stuff"]
    additional_info: Annotated[str, ...,
                               "The additional information about the stuff"]
    isRemovable: Annotated[bool, ...,
                           "Whether the stuff can be removed"] = False
    isWeapon: Annotated[bool, ..., "Whether the stuff is a weapon"] = False
    options: Optional[List[Dict[str, str]]] = None


class CharacterMoves(TypedDict):
    """Character moves"""
    basic_moves: Annotated[Union[str, list[Move]],
                           "Dostajesz wszystkie ruchy podstawoweThe basic moves of the character"]
    class_moves: Annotated[list[Move], ..., "The class moves of the character"]


class CharacterTraits(TypedDict):
    """Character traits"""
    name: Annotated[str, ..., "The name of the trait"]
    modifier: Annotated[str, ...,
                        "The modifier of the trait. ex. -1, 0, +1, +2"]


class CharacterSpecs(TypedDict):
    """Specifications of the character"""
    name: Annotated[str, ..., "The name of the character"]
    traits: Annotated[list[CharacterTraits], ...,
                      "The set of characteristics. Zestaw cech postaci"]
    moves: Annotated[CharacterMoves, ..., "The moves of the character"]
    stuffs: Annotated[list[Stuff], ..., "The stuffs of the character"]

# Stan grafu


class GraphState(MessagesState):
    questions: Questions
    image_url: Optional[str]
    summary: CharactersSummary
    character_class: Optional[Annotated[str, ...,
                                        "The class of the character"]]
    document_sheet: Optional[Document]
    character_specs: Optional[CharacterSpecs]


# Inicjalizacja modeli
model = ChatOpenAI(model="gpt-4o-mini")
model_with_json_questions_output = model.with_structured_output(Questions)
model_with_json_summary_output = model.with_structured_output(
    CharactersSummary)

# Węzły grafu


def generate_questions(state: GraphState):
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

    questions = model_with_json_questions_output.invoke(
        [sys_msg] + state["messages"])
    return {"messages": [], "questions": questions}


def human_input(state: GraphState):
    human_message = interrupt("human_input")
    for i, answer in enumerate(human_message["answers"]):
        answer_t = answer["answer"]
        print(state["questions"]["questions"])
        state["questions"]["questions"][i]["answer"] = answer_t

    print(state["questions"])
    return {"messages": [], "questions": state["questions"]}


def summarizer(state: GraphState):
    sys_msg = SystemMessage(
        """You are helpful assistant to generate a summary of the character based on the given information.

        Your task is to generate a summary of the character based on the information provided by the user in the same language as the input.

        Your output should contain the following information:

        Wygląd (appearance) - basic information about the character's appearance, short but detailed description. 1-2 sentences.
        Opis (description) -  description of the character. May contain extremely short background and basic traits. 5 sentences at most.
        """
    )

    last_human_message = state["messages"][0]
    answers = ""
    for question in state["questions"]["questions"]:
        answers += f"{question['answer']}\n"

    character_info = last_human_message.content + "\n" + answers
    summary = model_with_json_summary_output.invoke(
        [sys_msg] + [character_info])

    text_summary = f"{summary['appearance']}\n{summary['description']}"
    ai_message = AIMessage(text_summary)
    state["messages"].append(ai_message)
    return {"messages": state["messages"], "summary": summary}


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
    print(f"{docs=}")
    return {"messages": [response], "document_sheet": docs[0]}


def choose_class(state: GraphState):
    document = state["document_sheet"]
    class_name = document.metadata["document_id"]
    print(f"Class is {class_name}")
    return {"character_class": class_name}


def build_character_attributes(state: GraphState):
    model = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    prompt = PromptTemplate(
        template="""
        You are an assistant for creating a character for tabletop RPG game 'Świat Apokalipsy'.
        You will get a characters description and appearance.
        Your goal is to retrieve CECHY, RUCHY and SPRZĘT and choose the best options for the character according to the description of each category.
        Also extract the character's name from the description.

        Description: \n\n {description} \n\n
        Class sheet: \n\n {class_sheet} \n\n
        """,
        input_variables=["description", "class_sheet"],
    )

    model_wth_structured_output = model.with_structured_output(CharacterSpecs)
    character_class = state["character_class"]
    character_sheet_path = sheets_path / f"{character_class}.md"

    description = f"{state['summary']['appearance']}\n {state['summary']['description']}"
    class_sheet = character_sheet_path.read_text()

    chain = prompt | model_wth_structured_output
    response = chain.invoke(
        {"description": description, "class_sheet": class_sheet})
    return {"messages": state["messages"], "character_specs": response}


def generate_image(state: GraphState):
    appearance = state["summary"]["appearance"]
    description = state["summary"]["description"]
    prompt = f"""
        Using the provided {appearance} and {description} of a character, compose a detailed and vivid description suitable for DALL-E to generate an image.
        The image should depict a fully visible character—not just the face—in a post-apocalyptic world.
        Include intricate details about the character's clothing, equipment, surroundings, and pose to create an immersive and visually striking scene.
        The scene should feature cinematic lighting, gritty textures, dramatic shadows, post-apocalyptic themes, a warm and dusty color palette, high-definition quality, realistic details, and bold composition --ar 16:9.
        """

    image_url = DallEAPIWrapper(model="dall-e-3").run(prompt)
    return {"messages": state["messages"], "image_url": image_url}


# Tworzenie grafu
workflow = StateGraph(GraphState)

workflow.add_node("generate_questions", generate_questions)
workflow.add_node("human_input", human_input)
workflow.add_node("summarizer", summarizer)
workflow.add_node("retrieve_node", retrieve_node)
workflow.add_node("generate_image", generate_image)

description_retrieve_character_sheet = ToolNode([description_retriever_tool])
workflow.add_node("retrieve_character_sheet",
                  description_retrieve_character_sheet)

workflow.add_node("choose_class", choose_class)
workflow.add_node("build_character_attributes", build_character_attributes)

# Dodawanie krawędzi
workflow.add_edge(START, "generate_questions")
workflow.add_edge("generate_questions", "human_input")
workflow.add_edge("human_input", "summarizer")
workflow.add_edge("summarizer", "retrieve_node")
workflow.add_edge("retrieve_node", "retrieve_character_sheet")
workflow.add_edge("retrieve_character_sheet", "choose_class")
workflow.add_edge("choose_class", "build_character_attributes")
workflow.add_edge("build_character_attributes", "generate_image")
workflow.add_edge("generate_image", END)

# Kompilacja grafu
checkpointer = MemorySaver()
graph = workflow.compile(checkpointer=checkpointer)
