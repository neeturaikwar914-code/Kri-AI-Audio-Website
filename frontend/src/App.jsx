import Navbar from "./components/Navbar";
import Upload from "./components/Upload";

function App() {
  return (
    <>
      <Navbar />
      <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
        <h1>KRI AI Audio</h1>
        <Upload />
      </div>
    </>
  );
}

export default App;