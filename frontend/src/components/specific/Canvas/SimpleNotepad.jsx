import axios from "axios";
import React, { useContext, useRef, useState } from "react";
import { FaImage, FaMicrophone, FaSave } from "react-icons/fa";
import { AuthContext } from "../../../context/AuthContext";

const SimpleNotepad = ({ boardId }) => {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  // Configure API instance
  const api = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });

  // Save content with debounce
  const saveContent = async (newContent) => {
    try {
      await api.put(`/boards/${boardId}`, { content: newContent });
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post(`/boards/${boardId}/upload`, formData);
      const imgHTML = `<img src="${res.data.url}" alt="Uploaded image" class="max-w-full h-auto my-2" />`;
      setContent((prev) => prev + imgHTML);
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  // Handle audio recording
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.start();
        setIsRecording(true);

        mediaRecorder.current.ondataavailable = (e) => {
          audioChunks.current.push(e.data);
        };

        mediaRecorder.current.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, {
            type: "audio/webm",
          });
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          try {
            const res = await api.post(`/boards/${boardId}/upload`, formData);
            const audioHTML = `
              <div class="my-2">
                <audio controls src="${res.data.url}"></audio>
              </div>
            `;
            setContent((prev) => prev + audioHTML);
          } catch (err) {
            console.error("Audio upload failed:", err);
          }

          audioChunks.current = [];
        };
      } catch (err) {
        console.error("Microphone access denied:", err);
      }
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-100 p-2 flex gap-2 border-b">
        <label className="cursor-pointer p-2 hover:bg-gray-200 rounded">
          <FaImage className="inline mr-1" />
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        <button
          onClick={toggleRecording}
          className={`p-2 hover:bg-gray-200 rounded ${
            isRecording ? "text-red-500" : ""
          }`}
        >
          <FaMicrophone className="inline mr-1" />
          {isRecording ? "Stop Recording" : "Record Audio"}
        </button>

        <button
          onClick={() => saveContent(content)}
          className="p-2 hover:bg-gray-200 rounded ml-auto"
        >
          <FaSave className="inline mr-1" />
          Save
        </button>
      </div>

      {/* Content Area */}
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={(e) => setContent(e.currentTarget.innerHTML)}
        contentEditable
        placeholder="Start typing..."
        className="flex-1 p-4 bg-white overflow-auto w-full h-full p-4 text-lg border-none resize-none focus:outline-none"
      ></div>
    </div>
  );
};

export default SimpleNotepad;
