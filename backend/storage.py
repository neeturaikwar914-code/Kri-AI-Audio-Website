import os
import uuid
from fastapi import UploadFile

UPLOAD_DIR = "backend/uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


async def save_upload(file: UploadFile):
    file_id = str(uuid.uuid4())
    folder_path = os.path.join(UPLOAD_DIR, file_id)
    os.makedirs(folder_path, exist_ok=True)

    file_path = os.path.join(folder_path, file.filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return file_id, file.filename


def list_uploads():
    uploads = []
    for file_id in os.listdir(UPLOAD_DIR):
        folder = os.path.join(UPLOAD_DIR, file_id)
        if os.path.isdir(folder):
            for filename in os.listdir(folder):
                uploads.append({
                    "id": file_id,
                    "filename": filename,
                    "url": f"/uploads/{file_id}/{filename}"
                })
    return uploads