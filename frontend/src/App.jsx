import React, { useState, useEffect } from "react";
import { uploadAudio, getRecentUploads, splitStems } from "./api";
import "./app.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stems, setStems] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    const res = await getRecentUploads();
    setRecent(res || []);
  };

  const handleUpload = async (e) => {
    const audioFile = e.target.files[0];
    if (!audioFile) return;
    setFile(audioFile);
    setLoading(true);

    try {
      const uploadRes = await uploadAudio(audioFile);
      const stemRes = await splitStems(uploadRes.fileId);
      setStems(stemRes.stems);
      fetchRecent();
    } catch (err) {
      console.error(err);
      alert("Error processing audio!");
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Kri-AI Audio 2.0</h1>
      </header>

      <section className="upload-section">
        <input type="file" accept="audio/*" onChange={handleUpload} />
        {loading && <div className="loader">Processing...</div>}
      </section>

      {stems.length > 0 && (
        <section className="stems-section">
          <h2>Stems</h2>
          {stems.map((stem, i) => (
            <div key={i} className="stem">
              <p>{stem.name}</p>
              <audio controls src={stem.url}></audio>
              <a href={stem.url} download>
                Download
              </a>
            </div>
          ))}
        </section>
      )}

      {recent.length > 0 && (
        <section className="recent-section">
          <h2>Recent Uploads</h2>
          <ul>
            {recent.map((r, i) => (
              <li key={i}>{r.filename}</li>
            ))}
          </ul>
        </section>
      )}

      <footer>
        <p>Powered by Kri-AI 2.0 🌐</p>
      </footer>
    </div>
  );
}