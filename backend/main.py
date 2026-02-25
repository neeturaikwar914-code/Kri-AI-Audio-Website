import os
import uuid
import shutil
import asyncio
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ai_engine import process_audio_stems  # We will build this next
from storage import upload_to_s3         # For permanent storage

app = FastAPI(title="KRI-LION PRO ENGINE")

# 1. FIX CORS (Essential for Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. IN-MEMORY DATABASE (Tracks every user's process)
# In a pro app, you'd use Redis, but this works perfectly for now.
jobs = {}

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- BACKGROUND WORKER ---
async def run_ai_job(job_id: str, input_path: str):
    """The heavy lifting happens here without freezing the server"""
    try:
        # Update Status: AI Starting
        jobs[job_id].update({"status": "AI_PROCESSING", "progress": 30})
        
        # Call the AI Engine (Demucs + Librosa)
        # We pass the job_id so we can create a unique folder
        result = process_audio_stems(input_path, f"processed/{job_id}")
        
        if result["status"] == "Success":
            jobs[job_id].update({
                "status": "COMPLETED",
                "progress": 100,
                "bpm": result["bpm"],
                "stems": result["stems"] # Links to the audio files
            })
        else:
            jobs[job_id].update({"status": "FAILED", "error": result.get("message")})
            
    except Exception as e:
        jobs[job_id].update({"status": "ERROR", "error": str(e)})
    finally:
        # Clean up the original upload to save space on Render
        if os.path.exists(input_path):
            os.remove(input_path)

# --- ROUTES ---

@app.get("/")
def health():
    return {"status": "KRI-LION AI ONLINE", "version": "2.0.0"}

@app.post("/upload")
async def upload_audio(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # Create a unique ID for this session
    job_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{job_id}{file_extension}")

    # Save the file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Initialize the job state
    jobs[job_id] = {
        "status": "UPLOADING",
        "progress": 10,
        "filename": file.filename
    }

    # Start the AI in the background!
    background_tasks.add_task(run_ai_job, job_id, file_path)

    return {"job_id": job_id}

@app.get("/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]