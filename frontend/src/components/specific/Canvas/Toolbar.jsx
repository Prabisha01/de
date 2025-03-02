import axios from "axios";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FaDownload,
  FaFilePdf,
  FaGripVertical,
  FaImage,
  FaMicrophone,
  FaPen,
  FaStickyNote,
  FaTextHeight,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { AuthContext } from "../../../context/AuthContext";

const Toolbar = ({ boardId, onAddElement, drawingMode, setDrawingMode }) => {
  const { user } = useContext(AuthContext);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const toolbarRef = useRef(null);
  const mediaRecorder = useRef(null);
  const [recording, setRecording] = useState(false);

  // Configure axios instance
  const api = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    headers: {
      Authorization: `Bearer ${user?.token}`,
      "Content-Type": "application/json",
    },
  });

  // Drag handling
  const handleDragStart = (e) => {
    isDragging.current = true;
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    document.addEventListener("mousemove", handleDragging);
    document.addEventListener("mouseup", handleDragEnd);
    e.preventDefault();
  };

  const handleDragging = useCallback((e) => {
    if (!isDragging.current) return;

    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;

    // Immediate visual update
    if (toolbarRef.current) {
      toolbarRef.current.style.left = `${newX}px`;
      toolbarRef.current.style.top = `${newY}px`;
    }

    setPosition({
      x: Math.max(0, Math.min(newX, window.innerWidth - 200)),
      y: Math.max(0, Math.min(newY, window.innerHeight - 300)),
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleDragging);
    document.removeEventListener("mouseup", handleDragEnd);
  }, [handleDragging]);

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleDragging);
      document.removeEventListener("mouseup", handleDragEnd);
    };
  }, [handleDragging, handleDragEnd]);

  // Element creation
  const createElement = async (type, data) => {
    try {
      const elementData = {
        type,
        ...data,
        position: data.position || { x: 100, y: 100 },
        size: data.size || { width: 200, height: 200 },
        createdAt: new Date().toISOString(),
      };

      const res = await api.post(`/boards/${boardId}/elements`, elementData);

      if (!res.data?._id) {
        throw new Error("Invalid element response");
      }

      onAddElement(res.data);
      return res.data;
    } catch (err) {
      console.error(`Error creating ${type}:`, err);
      throw err;
    }
  };

  // Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      toast.info("Uploading image...", { autoClose: false });
      const uploadRes = await api.post(`/boards/${boardId}/upload`, formData);

      await createElement("image", {
        src: uploadRes.data.url,
        meta: {
          originalName: file.name,
          size: file.size,
          type: file.type,
        },
      });
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error(
        `Upload failed: ${err.response?.data?.message || err.message}`
      );
    } finally {
      e.target.value = null;
      toast.dismiss();
    }
  };

  // PDF upload
  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      toast.info("Uploading PDF...", { autoClose: false });
      const res = await api.post(`/boards/${boardId}/pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await createElement("pdf", {
        url: res.data.url,
        meta: { fileName: file.name },
      });
      toast.success("PDF uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload PDF");
      console.error("PDF upload error:", err);
    } finally {
      e.target.value = null;
      toast.dismiss();
    }
  };

  // Sticker creation
  const createSticker = (shape) =>
    createElement("sticker", {
      shape,
      color: "#FFD700",
    });

  // Voice recording
  const toggleRecording = async () => {
    if (recording) {
      mediaRecorder.current?.stop();
      setRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorder.current = new MediaRecorder(stream, {
          mimeType: "audio/ogg; codecs=opus",
        });
        mediaRecorder.current.start();

        mediaRecorder.current.ondataavailable = async (e) => {
          const audioFile = new File([e.data], "recording.ogg", {
            type: "audio/ogg; codecs=opus",
          });

          const formData = new FormData();
          formData.append("file", audioFile);

          try {
            const uploadRes = await api.post(
              `/boards/${boardId}/upload`,
              formData
            );
            await createElement("audio", { src: uploadRes.data.url });
          } catch (err) {
            toast.error("Failed to upload audio");
          }
        };

        mediaRecorder.current.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
        };
        setRecording(true);
      } catch (err) {
        toast.error("Microphone access required");
      }
    }
  };

  // PDF export
  const handleExportPDF = async () => {
    try {
      const res = await api.get(`/boards/${boardId}/export`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `board-${boardId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF exported successfully");
    } catch (err) {
      toast.error("Failed to export PDF");
    }
  };

  return (
    <div
      ref={toolbarRef}
      className="fixed bg-white/90 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-gray-300/50 cursor-grab active:cursor-grabbing select-none touch-none"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleDragStart}
    >
      <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
        <FaGripVertical className="text-gray-400 mr-2" />
        <h3 className="text-sm font-semibold text-gray-600">Tools</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">
          <ToolbarButton
            icon={<FaTextHeight />}
            onClick={() => createElement("text", { content: "New Text" })}
            tooltip="Add Text"
          />
          <ToolbarButton
            icon={<FaImage />}
            onClick={() => document.getElementById("image-upload").click()}
            tooltip="Add Image"
          />
          <input
            type="file"
            id="image-upload"
            hidden
            accept="image/*"
            onChange={handleImageUpload}
          />
          <ToolbarButton
            icon={<FaFilePdf />}
            onClick={() => document.getElementById("pdf-upload").click()}
            tooltip="Add PDF"
          />
          <input
            type="file"
            id="pdf-upload"
            hidden
            accept="application/pdf"
            onChange={handlePDFUpload}
          />
        </div>

        <div className="space-y-3">
          <ToolbarButton
            icon={<FaStickyNote />}
            onClick={() => createSticker("circle")}
            tooltip="Circle Sticker"
          />
          <ToolbarButton
            icon={<FaStickyNote className="rotate-45" />}
            onClick={() => createSticker("square")}
            tooltip="Square Sticker"
          />
          <ToolbarButton
            icon={<FaMicrophone />}
            onClick={toggleRecording}
            tooltip={recording ? "Stop Recording" : "Record Voice Memo"}
            active={recording}
          />
          <ToolbarButton
            icon={<FaPen />}
            onClick={() => setDrawingMode(!drawingMode)}
            tooltip={drawingMode ? "Exit Drawing" : "Start Drawing"}
            active={drawingMode}
          />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <ToolbarButton
          icon={<FaDownload />}
          onClick={handleExportPDF}
          tooltip="Export Board as PDF"
          className="w-full justify-center bg-blue-50 hover:bg-blue-100 text-blue-600"
        />
      </div>
    </div>
  );
};

const ToolbarButton = ({
  icon,
  onClick,
  tooltip,
  active = false,
  className = "",
}) => (
  <button
    className={`p-2.5 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center ${
      active ? "bg-blue-100 text-blue-600" : "text-gray-600"
    } ${className} relative group`}
    onClick={onClick}
  >
    {icon}
    <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
      {tooltip}
    </span>
  </button>
);

export default Toolbar;
