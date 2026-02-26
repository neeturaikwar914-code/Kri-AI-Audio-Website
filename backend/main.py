from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
from backend import ai_engine, storage

app = FastAPI(title="Kri AI Audio Engine")

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Upload endpoint
@app.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_location, "wb") as f:
        f.write(await file.read())
    result = ai_engine.process_audio(file_location)
    storage.save_result(file.filename, result)
    return {"filename": file.filename, "result": result}

# Serve frontend
FRONTEND_DIST = os.path.join(os.getcwd(), "frontend", "dist")
app.mount("/static", StaticFiles(directory=FRONTEND_DIST), name="static")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"error": "Frontend not built"}

# Local run
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)