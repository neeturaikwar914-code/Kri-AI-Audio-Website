// frontend/src/App.jsx
import React, { useState } from "react";
import { uploadAudio, extractStems, applyEffect, getUploads } from "./api";
import StemPlayer from "./components/StemPlayer";
import "./app.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [stems, setStems] = useState({});
  const [loading, setLoading] = useState(false);
  const [effect, setEffect] = useState("");

  // File select
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  // Upload audio
  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file!");
    setLoading(true);
    try {
      const data = await uploadAudio(selectedFile);
      alert("File uploaded successfully!");
      setSelectedFile(null);
      await fetchUploads();
    } catch (err) {
      alert("Upload failed. Check console.");
      console.error(err);
    }
    setLoading(false);
  };

  // Fetch all uploads
  const fetchUploads = async () => {
    try {
      const data = await getUploads();
      setUploads(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Extract stems
  const handleExtractStems = async (fileId) => {
    setLoading(true);
    try {
      const data = await extractStems(fileId);
      setStems((prev) => ({ ...prev, [fileId]: data }));
    } catch (err) {
      console.error(err);
      alert("Stem extraction failed.");
    }
    setLoading(false);
  };

  // Apply audio effect
  const handleEffect = async (fileId) => {
    if (!effect) return alert("Select an effect!");
    setLoading(true);
    try {
      const data = await applyEffect(fileId, effect);
      setStems((prev) => ({ ...prev, [fileId]: { ...prev[fileId], processed: data.processed_file } }));
      alert("Effect applied!");
    } catch (err) {
      console.error(err);
      alert("Failed to apply effect.");
    }
    setLoading(false);
  };

  // Load uploads on first render
  React.useEffect(() => { fetchUploads(); }, []);

  return (
    <div className="app-container">
      <h1>Kri AI Audio Studio</h1>

      <div className="upload-section">
        <input type="file" onChange={handleFileChange} accept="audio/*" />
        <button onClick={handleUpload} disabled={loading}>{loading ? "Uploading..." : "Upload Audio"}</button>
      </div>

      <div className="effect-section">
        <label>Choose Effect:</label>
        <select value={effect} onChange={(e) => setEffect(e.target.value)}>
          <option value="">--Select--</option>
          <option value="reverb">Reverb</option>
          <option value="echo">Echo</option>
          <option value="bassboost">Bass Boost</option>
          <option value="vocal-remove">Vocal Remove</option>
        </select>
      </div>

      <div className="uploads-list">
        <h2>Uploaded Files</h2>
        {uploads.length === 0 && <p>No files uploaded yet.</p>}
        {uploads.map((file) => (
          <div key={file.id} className="upload-item">
            <p>{file.filename}</p>
            <button onClick={() => handleExtractStems(file.id)} disabled={loading}>Extract Stems</button>
            <button onClick={() => handleEffect(file.id)} disabled={loading || !stems[file.id]}>Apply Effect</button>

            {stems[file.id] && (
              <div className="stems-player">
                <StemPlayer label="Vocals" src={stems[file.id].vocals} />
                <StemPlayer label="Drums" src={stems[file.id].drums} />
                <StemPlayer label="Bass" src={stems[file.id].bass} />
                <StemPlayer label="Other" src={stems[file.id].other} />
                {stems[file.id].processed && <StemPlayer label="Processed" src={stems[file.id].processed} />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;