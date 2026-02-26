// frontend/src/api.js
import axios from "axios";

// Base URL for your backend
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://kri-ai-meta.onrender.com";

// Upload audio file
export const uploadAudio = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
};

// Extract stems (vocals, drums, bass, etc.)
export const extractStems = async (fileId) => {
  try {
    const response = await axios.post(`${BASE_URL}/extract_stems`, { file_id: fileId });
    return response.data; // { vocals: url, drums: url, bass: url, other: url }
  } catch (error) {
    console.error("Stem Extraction Error:", error);
    throw error;
  }
};

// Apply audio effects
export const applyEffect = async (fileId, effect) => {
  try {
    const response = await axios.post(`${BASE_URL}/apply_effect`, { file_id: fileId, effect });
    return response.data; // { processed_file: url }
  } catch (error) {
    console.error("Audio Effect Error:", error);
    throw error;
  }
};

// List all uploaded files
export const getUploads = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/uploads`);
    return response.data; // [{ id, filename, url }]
  } catch (error) {
    console.error("Get Uploads Error:", error);
    throw error;
  }
};