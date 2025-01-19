import dotenv
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode
from .retrievers import description_retriever_tool
from .nodes import (
    GraphState,
    generate_image,
    generate_questions,
    human_input,
    summarizer,
    retrieve_node,
    choose_class,
    build_character_attributes,
    get_moves,
)

dotenv.load_dotenv()


workflow = StateGraph(GraphState)

workflow.add_node("generate_questions", generate_questions)
workflow.add_node("human_input", human_input)
workflow.add_node("summarizer", summarizer)
workflow.add_node("retrieve_node", retrieve_node)
workflow.add_node("generate_image", generate_image)

description_retrieve_character_sheet = ToolNode([description_retriever_tool])
workflow.add_node("retrieve_character_sheet", description_retrieve_character_sheet)

workflow.add_node("choose_class", choose_class)
workflow.add_node("build_character_attributes", build_character_attributes)
workflow.add_node("get_moves", get_moves)

workflow.add_edge(START, "generate_questions")
workflow.add_edge("generate_questions", "human_input")
workflow.add_edge("human_input", "summarizer")
workflow.add_edge("summarizer", "retrieve_node")
workflow.add_edge("retrieve_node", "retrieve_character_sheet")
workflow.add_edge("retrieve_character_sheet", "choose_class")
workflow.add_edge("choose_class", "get_moves")
workflow.add_edge("get_moves", "build_character_attributes")
workflow.add_edge("build_character_attributes", "generate_image")

workflow.add_edge("generate_image", END)

checkpointer = MemorySaver()

graph = workflow.compile(checkpointer=checkpointer)
