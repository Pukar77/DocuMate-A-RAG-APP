import { useState } from "react";
import axios from "axios";

interface UploadFileProps {
  onFileUploaded: (fileId: string) => void;
}

function UploadFile({ onFileUploaded }: UploadFileProps) {
  const [file, setFile] = useState<File | null>(null);
  const [inputData, setInputData] = useState<string>("");
  const [dataAyo, setDataAyo] = useState<boolean>(false);
  const [fileId, setFileId] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [translation, setTranslation] = useState<string>("");

  // Loading states
  const [uploading, setUploading] = useState<boolean>(false);
  const [asking, setAsking] = useState<boolean>(false);
  const [summarizing, setSummarizing] = useState<boolean>(false);
  const [translating, setTranslating] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/upload", formData);
      console.log("✅ File upload response:", res.data);

      if (res.data) {
        setDataAyo(true);
        onFileUploaded(res.data.file_id);
      }
    } catch (error) {
      console.error("❌ File upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAsking(true);

    const formData = new FormData();
    formData.append("question", inputData);
    formData.append("k", "3");

    try {
      const res = await axios.post("http://127.0.0.1:8000/ask", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Question response:", res.data);
      setAnswer(res.data.answer);
    } catch (error) {
      console.error("❌ Question request failed:", error);
    } finally {
      setAsking(false);
    }
  };

  const handle_summarize = async () => {
    if (!file) return;
    setSummarizing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/summarize", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Summary", res.data.summary);
      setSummary(res.data.summary);
    } catch (e) {
      console.log("Some error occurred");
    } finally {
      setSummarizing(false);
    }
  };

  const handle_translation = async () => {
    if (!answer) return;
    setTranslating(true);

    const formData = new FormData();
    formData.append("text", answer);

    try {
      const res = await axios.post("http://127.0.0.1:8000/translate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Translation:", res.data.nepali_translation);
      setTranslation(res.data.nepali_translation);
    } catch (e) {
      console.log("Some error occurred", e);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-center mb-4">File Q&A System</h1>

      {/* File Upload */}
      <div className="flex items-center space-x-3">
        <input
          type="file"
          className="border border-gray-300 rounded px-3 py-2 w-full"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          onClick={handleUpload}
          className={`px-4 py-2 rounded transition cursor-pointer ${
            uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {dataAyo && (
        <div className="space-y-4">
          {/* Ask Question */}
          <form onSubmit={handleQuestion} className="flex space-x-3">
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400"
            />
            <button
              type="submit"
              className={`px-4 py-2 rounded transition cursor-pointer ${
                asking ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              } text-white`}
              disabled={asking}
            >
              {asking ? "Asking..." : "Ask"}
            </button>
          </form>

          {/* Summarize */}
          <button
            onClick={handle_summarize}
            className={`px-4 py-2 rounded transition cursor-pointer ${
              summarizing ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"
            } text-white`}
            disabled={summarizing}
          >
            {summarizing ? "Summarizing..." : "Summarize"}
          </button>

          {/* Answer Card */}
          {answer && (
            <div className="p-4 bg-white rounded shadow-md border border-gray-200">
              <h3 className="font-semibold mb-2 cursor-pointer">Answer:</h3>
              <p className="mb-3">{answer}</p>
              <button
                onClick={handle_translation}
                className={`px-3 py-1 rounded transition cursor-pointer ${
                  translating ? "bg-gray-400" : "bg-yellow-500 hover:bg-yellow-600"
                } text-white`}
                disabled={translating}
              >
                {translating ? "Translating..." : "Translate to Nepali"}
              </button>
            </div>
          )}

          {/* Summary Card */}
          {summary && (
            <div className="p-4 bg-white rounded shadow-md border border-gray-200">
              <h3 className="font-semibold mb-2">Summary:</h3>
              <p>{summary}</p>
            </div>
          )}
        </div>
      )}

      {/* Translation Card */}
      {translation && (
        <div className="p-4 bg-white rounded shadow-md border border-gray-200">
          <h3 className="font-semibold mb-2 ">Nepali Translation:</h3>
          <p>{translation}</p>
        </div>
      )}
    </div>
  );
}

export default UploadFile;
