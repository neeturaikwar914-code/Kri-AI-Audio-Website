import os
from pydub import AudioSegment
from spleeter.separator import Separator

PROCESSED_DIR = "backend/uploads/processed"
os.makedirs(PROCESSED_DIR, exist_ok=True)

# Spleeter AI model - 2 stems (vocals + accompaniment)
separator = Separator('spleeter:2stems')

def process_audio(file_path: str):
    """Separate vocals & instruments and save processed files"""
    base_name = os.path.basename(file_path)
    output_path = os.path.join(PROCESSED_DIR, base_name.replace(".", "_processed."))

    # Spleeter separation
    separator.separate_to_file(file_path, PROCESSED_DIR)

    # Optional: apply audio FX with pydub (reverb/echo/bass)
    audio = AudioSegment.from_file(file_path)
    audio = audio + 3  # simple volume boost
    audio.export(output_path, format="mp3")
    print(f"Processed {file_path} -> {output_path}")