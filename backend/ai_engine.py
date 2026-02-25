import os
import subprocess
import librosa
import soundfile as sf

def process_audio_stems(input_path, output_folder):
    """
    Separates audio into 4 stems and extracts music data.
    """
    try:
        # 1. MUSIC ANALYSIS (BPM & Key)
        # We do this first because it's fast and gives the user data immediately
        y, sr = librosa.load(input_path)
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        
        # 2. NEURAL SEPARATION (Demucs)
        # We use 'mdx_extra' - it's the high-quality model Moises-level apps use
        # Output will be: output_folder/mdx_extra/filename/vocals.wav, etc.
        os.makedirs(output_folder, exist_ok=True)
        
        # This command triggers the AI model
        command = [
            "python3", "-m", "demucs.separate",
            "-n", "mdx_extra",
            "--mp3", # Convert to mp3 to save space/bandwidth
            "--mp3-bitrate", "256",
            "-o", output_folder,
            input_path
        ]
        
        subprocess.run(command, check=True)

        # 3. LOCATE FILES
        # Demucs creates a nested folder structure: output_folder/mdx_extra/input_name/
        input_filename = os.path.basename(input_path).replace(os.path.splitext(input_path)[1], "")
        final_dir = os.path.join(output_folder, "mdx_extra", input_filename)

        stems = {
            "vocals": f"{final_dir}/vocals.mp3",
            "drums": f"{final_dir}/drums.mp3",
            "bass": f"{final_dir}/bass.mp3",
            "other": f"{final_dir}/other.mp3"
        }

        # Verify all files exist
        for part, path in stems.items():
            if not os.path.exists(path):
                raise Exception(f"AI failed to generate {part} track.")

        return {
            "status": "Success",
            "bpm": int(tempo),
            "stems": stems
        }

    except Exception as e:
        print(f"AI Engine Error: {str(e)}")
        return {"status": "Error", "message": str(e)}

def shift_pitch(file_path, steps):
    """
    Optional: Professional tool to change the key of a stem
    steps: integer (e.g., -2 for two semitones down)
    """
    y, sr = librosa.load(file_path)
    y_shifted = librosa.effects.pitch_shift(y, sr=sr, n_steps=steps)
    output_path = file_path.replace(".mp3", "_shifted.mp3")
    sf.write(output_path, y_shifted, sr)
    return output_path