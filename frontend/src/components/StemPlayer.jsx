import React, { useEffect, useRef, useState, useMemo } from 'react';
import WaveSurfer from 'wavesurfer.js';

const TRACK_CONFIG = [
  { id: 'vocals', label: '🎤 VOCALS', color: '#00f2ff' },
  { id: 'drums', label: '🥁 DRUMS', color: '#bc13fe' },
  { id: 'bass', label: '🎸 BASS', color: '#ff0055' },
  { id: 'other', label: '🎹 OTHER', color: '#ffffff' }
];

export default function StemPlayer({ stems }) {
  const containerRefs = useRef({});
  const wavesurferInstances = useRef({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [volumes, setVolumes] = useState({ vocals: 1, drums: 1, bass: 1, other: 1 });

  useEffect(() => {
    let readyCount = 0;

    // 1. Initialize all 4 tracks
    TRACK_CONFIG.forEach((track) => {
      const ws = WaveSurfer.create({
        container: containerRefs.current[track.id],
        waveColor: '#1a1a1a',
        progressColor: track.color,
        cursorColor: track.color,
        barWidth: 2,
        height: 60,
        url: stems[track.id], // Load stem from S3/Backend
      });

      // 2. Sync Seek/Click events
      ws.on('interaction', () => {
        const time = ws.getCurrentTime();
        Object.values(wavesurferInstances.current).forEach(instance => {
          if (instance !== ws) instance.setTime(time);
        });
      });

      ws.on('ready', () => {
        readyCount++;
        if (readyCount === TRACK_CONFIG.length) setIsReady(true);
      });

      wavesurferInstances.current[track.id] = ws;
    });

    // Cleanup on unmount
    return () => {
      Object.values(wavesurferInstances.current).forEach(ws => ws.destroy());
    };
  }, [stems]);

  // Master Play/Pause
  const togglePlayback = () => {
    Object.values(wavesurferInstances.current).forEach(ws => {
      isPlaying ? ws.pause() : ws.play();
    });
    setIsPlaying(!isPlaying);
  };

  // Individual Volume Control
  const handleVolumeChange = (id, val) => {
    const numericVal = parseFloat(val);
    setVolumes(prev => ({ ...prev, [id]: numericVal }));
    wavesurferInstances.current[id].setVolume(numericVal);
  };

  return (
    <div className="mixer-card fade-in">
      <div className="mixer-controls">
        <button 
          className={`btn-neon ${!isReady ? 'disabled' : ''}`} 
          onClick={togglePlayback}
          disabled={!isReady}
        >
          {!isReady ? 'LOADING STEMS...' : isPlaying ? 'PAUSE MIXER' : 'PLAY ALL'}
        </button>
      </div>

      <div className="stems-layout">
        {TRACK_CONFIG.map(track => (
          <div key={track.id} className="stem-row">
            <div className="stem-meta">
              <span className="label">{track.label}</span>
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={volumes[track.id]}
                onChange={(e) => handleVolumeChange(track.id, e.target.value)}
                className="volume-slider"
              />
            </div>
            <div 
              ref={el => containerRefs.current[track.id] = el} 
              className="waveform-container"
            />
          </div>
        ))}
      </div>
    </div>
  );
}