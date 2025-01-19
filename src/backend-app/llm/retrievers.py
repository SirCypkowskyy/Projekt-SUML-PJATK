from pathlib import Path
from langchain.tools.retriever import create_retriever_tool
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_openai.embeddings import OpenAIEmbeddings
from langchain_text_splitters import MarkdownHeaderTextSplitter
from core.config import settings
import os

SHEETS_PATH = Path("data/karty-postaci/")
sheets = SHEETS_PATH.glob("*.md")

# Dodanie api openai dla langchain
if not os.environ.get("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY

split_document = []
for sheet in sheets:
    with open(sheet, "r", encoding='utf-8') as f:
        raw_markdown = f.read()
        # sheets_raw.append(f.read())

    document_id = sheet.stem

    document = Document(page_content=raw_markdown, metadata={"document_id": document_id})

    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
        ("####", "Header 4"),
    ]
    markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on, strip_headers=False)

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

main_retriever = vectorstore.as_retriever(search_kwargs={"k": 10}, search_type="similarity")

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
