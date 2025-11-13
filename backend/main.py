import os
import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter
from google import genai
from dotenv import load_dotenv
from pypdf import PdfReader
from docx import Document
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
import shutil

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set")

# Configure Gemini AI client
client = genai.Client(api_key=api_key)

# Initialize ChromaDB client & collection
chroma_client = chromadb.Client()
collection = chroma_client.get_or_create_collection(name="Pukar_Collection")


app = FastAPI()



#creating a function that reads a form pdf, docs and text
def extract_text_from_file(file_path:str)->str:
    """Extract the text from the pdf, docs or text file"""
    
    ext = file_path.lower().split(".")[-1]
    
    if ext == "pdf":
        reader = PdfReader(file_path)
        text = ""
        
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
        
    elif ext == "docx":
        reader = Document(file_path)
        text = "\n".join([p.text for p in reader.paragraphs]) 
        return text
    
    elif ext == "txt":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
        
    else:
        raise ValueError("Unsupportive file format, Only pdf, docs and txt files are accepted")
    
    



def create_chunks_and_store(file_path: str, chunk_size=600, chunk_overlap=100):
    """
    Read text, split into chunks, and store in ChromaDB.
    """
   
    docs = extract_text_from_file(file_path)

    # Split into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    chunks = text_splitter.split_text(docs)

    # Store chunks in ChromaDB
    collection.add(
        ids=[f"id{i}" for i in range(len(chunks))],
        documents=chunks
    )

    print(f"✅ Stored {len(chunks)} chunks in ChromaDB.")
    return chunks


def summarize(text: str) -> str:
    
    prompt = f"""
    Summarize the following document clearly and concisely:
    {text}
    
    Summary:
    """
    
    response = client.models.generate_content(
        model = "gemini-2.5-flash",
        contents=prompt
        
    )
    return response.text.strip()

def rag_query(question: str, k: int = 3) -> str:
    """
    Retrieve top-k chunks from ChromaDB and generate an answer using Gemini.
    """
    # Retrieve top-k relevant chunks
    results = collection.query(
        query_texts=[question],
        n_results=k
    )
    retrieved_chunks = results["documents"][0]
    context = "\n".join(retrieved_chunks)

    # Strong prompt to prevent hallucination
    prompt = f"""
You are an assistant that answers questions using ONLY the provided context. 
Do NOT use your own knowledge or make assumptions.
If the answer is not present in the context, respond: "This information is not present in the given file".

Context:
{context}

Question:
{question}
Answer:
"""

    # Generate answer
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text.strip()

def translate_to_nepali(text:str) ->str:
    prompt=f"""
    Translate this response in nepali language
    {text}
    Neplai Translation:
    
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text.strip()

@app.post("/upload")
async def upload_document(file:UploadFile=File(...)):
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
        
    #create chunk and store
    num_chunk = create_chunks_and_store(file_path)
    
    #Extract actual content for summarization if needed
    text = extract_text_from_file(file_path)
    
    #delete temp file
    os.remove(file_path)
    
    return{"message":"file processed", "chunks_created":num_chunk, "text_length":len(text.split())}


@app.post("/summarize")
async def summarize_document(file: UploadFile=File(...)):
     file_path = f"temp_{file.filename}"
     with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

     text = extract_text_from_file(file_path)
     summary = summarize(text)
     os.remove(file_path)
     return {"summary":summary}
 
@app.post("/ask")
async def ask_question(question: str = Form(...), k: int = Form(3)):
    answer = rag_query(question, k)
    return {"answer": answer}


@app.post("/translate")
async def translate_text(text: str = Form(...)):
    nepali = translate_to_nepali(text)
    return {"nepali_translation": nepali}
    




if __name__ == "__main__":
    # 1️⃣ Chunk and store essay
    create_chunks_and_store("essay.txt", chunk_size=600, chunk_overlap=100)

    # 2️⃣ Ask a question using RAG
    question = "Which country is the most powerful country in the world?"
    answer = rag_query(question, k=3)
    print("\n🔹 Question:", question)
    print("🔹 Answer:", answer)
    nepali_rag = translate_to_nepali(answer)
    print(nepali_rag)
     
    actual_content = extract_text_from_file("essay.txt")
    summary = summarize("essay.txt")
    print("Summary of the given document is :\n", summary)
    nepali_summary = translate_to_nepali(summary)
    print(nepali_summary)
    
