import axios from "axios";

const API = axios.create({
  // Replace the placeholder with your actual Render backend URL
  baseURL: "https://kri-lion.onrender.com"
});

export default API;