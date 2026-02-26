import React, { useState } from "react";
import { uploadAudio } from "./api";
import "./app.css";
import StemPlayer from "./components/StemPlayer";

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file!");
    const res = await uploadAudio(file);
    setResult(res.result);
  };

  return (
    <div className="app">
      <h1>Kri AI Audio Web</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload & Process</button>
      {result && <StemPlayer stems={result} />}
    </div>
  );
}