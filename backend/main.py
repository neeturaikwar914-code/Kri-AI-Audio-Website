
from fastapi import FastAPI, UploadFile, File
import shutil
import os
from ai_engine import separate_audio

app = FastAPI()

os.makedirs("uploads", exist_ok=True)

@app.get("/")
def home():
    return {"status": "Backend Running 🚀"}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    file_path = f"uploads/{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = separate_audio(file_path)

    return {"message": "Processing Done ✅", "output": result}