import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import SimpleNotepadToolbar from "./SimpleNotepadToolbar";
import { toast } from "react-toastify";

const MainCanvas = () => {
  const { boardId } = useParams();
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const token = user?.token || localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Unauthorized access. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchBoardData = async () => {
      try {
        const contentResponse = await axios.get(
          `http://localhost:5000/api/v1/boards/${boardId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (contentResponse.data.success) {
          setContent(contentResponse.data.data.content || "");
        }

        const imageResponse = await axios.get(
          `http://localhost:5000/api/v1/boards/${boardId}/images`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (imageResponse.data.success) {
          setUploadedImages(imageResponse.data.images || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load board data");
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, [boardId, token]);

  const saveContent = async () => {
    if (!token) return;
    if (!content.trim()) {
      toast.error(" Please enter some text before saving.");
      return;
    }

    setIsSaving(true);
    try {
      await axios.put(
        `http://localhost:5000/api/v1/boards/${boardId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(" Content saved successfully!");
    } catch (err) {
      console.error(" Error saving content:", err.response?.data || err);
      toast.error(" Error saving content.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(" File size should not exceed 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsUploading(true);
      const response = await axios.post(
        `http://localhost:5000/api/v1/boards/${boardId}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success && response.data.url) {
        toast.success(" Image uploaded successfully!");
        setUploadedImages([...uploadedImages, response.data.url]);
      } else {
        toast.error(" Image upload failed!");
      }
    } catch (err) {
      console.error(" Error uploading image:", err.response?.data || err);
      toast.error(" Error uploading image.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.canvasContainer}>
      <SimpleNotepadToolbar onSave={saveContent} />

      {isSaving && <p style={styles.savingText}>Saving content...</p>}
      {isUploading && <p style={styles.uploadingText}>Uploading image...</p>}

      <div style={styles.mainContainer}>
        {/* Left Section: Uploaded Images */}
        <div style={styles.imageContainer}>
         
          <div style={styles.imageGrid}>
            {uploadedImages.length > 0 ? (
              uploadedImages.map((img, index) => (
                <img key={index} src={img} alt={`Uploaded ${index}`} style={styles.largeImage} />
              ))
            ) : (
              <p style={styles.noImages}>No images uploaded yet.</p>
            )}
          </div>
          <label style={styles.uploadButton}>
            Upload Image
            <input type="file" style={{ display: "none" }} accept="image/*" onChange={handleImageChange} />
          </label>
        </div>

        {/* Right Section: Editable Content */}
        <div style={styles.editor}>
          <h3 style={styles.sectionTitle}>Write Content</h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            style={styles.textArea}
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  canvasContainer: {
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f8f9fa",
    padding: "16px",
  },
  mainContainer: {
    display: "flex",
    gap: "20px",
    height: "80vh",
  },
  imageContainer: {
    width: "40%",
    padding: "16px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    overflowY: "auto",
  },
  imageGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    justifyContent: "flex-start",
    padding: "10px 0",
  },
  largeImage: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #ccc",
    transition: "transform 0.2s ease-in-out",
  },
  uploadButton: {
    cursor: "pointer",
    background: "linear-gradient(to right, #4f46e5, #9333ea)",
    color: "white",
    padding: "6px 12px", 
    fontSize: "12px", 
    width: "60%", 
    borderRadius: "6px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    display: "block",
    margin: "10px auto",
  },
  editor: {
    flex: "1",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
  },
  textArea: {
    flex: 1,
    padding: "12px",
    fontSize: "16px",
    backgroundColor: "#f5f5f5",
    color: "#000",
    border: "1px solid #ccc",
    borderRadius: "6px",
    resize: "none",
    outline: "none",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  savingText: {
    textAlign: "center",
    color: "#16a34a",
    fontWeight: "bold",
    marginTop: "10px",
  },
  uploadingText: {
    textAlign: "center",
    color: "#dc2626",
    fontWeight: "bold",
    marginTop: "10px",
  },
};

export default MainCanvas;
