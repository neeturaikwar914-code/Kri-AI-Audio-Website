// frontend/src/components/StemPlayer.jsx
import React, { useRef, useState } from "react";

export default function StemPlayer({ label, src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="stem-card">
      <h4>{label}</h4>

      <audio ref={audioRef} src={src} />

      <div className="controls">
        <button onClick={togglePlay}>
          {isPlaying ? "Pause" : "Play"}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
        />

        <a href={src} download>
          Download
        </a>
      </div>
    </div>
  );
}