import { useState } from "react";
import UploadFile from "./components/uploadfile";
import Navbar from "./Navbar";


function App() {
  const [fileId, setFileId] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex justify-center items-start py-20">
      <Navbar/>
      {!fileId ? (
        <UploadFile onFileUploaded={setFileId} />
      ) : (
        <></>
      )}
    </div>
  );
}

export default App;
