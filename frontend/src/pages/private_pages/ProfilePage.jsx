import axios from "axios";
import { useContext, useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaEdit,
  FaEnvelope,
  FaPalette,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { AuthContext } from "../../context/AuthContext";

const ProfilePage = () => {
  const { user: authUser } = useContext(AuthContext);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Update handleImageChange to create preview
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async () => {
    if (!image) {
      alert("Please select an image!");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("profilePicture", image);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/v1/users/updateProfilePicture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Safe state update with null check
      setUser((prevUser) => {
        if (!prevUser) {
          return {
            profilePicture: response.data.data,
            username: "Unknown User",
            email: "",
            createdAt: new Date(),
            boardsCount: 0,
            collaborations: 0,
          };
        }
        return {
          ...prevUser,
          profilePicture: response.data.data,
        };
      });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      setImage(null);
    }
  };

  // In the img tag, add cache busting and ensure absolute URL
  <img
    src={
      user?.profilePicture ? (
        `http://localhost:5000${user.profilePicture}`
      ) : (
        <FaUser />
      )
    }
    alt="Profile"
    className="w-32 h-32 rounded-full border-4 border-cyan-100"
  />;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser?._id) return;

      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/v1/users/getMe`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUser(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile data.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (authUser) fetchUserProfile();
  }, [authUser]);

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-center p-6 text-red-500">{error}</div>;
  if (Object.keys(user).length === 0)
    return <div className="text-center p-6">Could not load profile.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-200 h-28 object-cover"
                />
              ) : user?.profilePicture ? (
                <img
                  src={`http://localhost:5000${user.profilePicture}`}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <FaUser className="text-gray-400 text-4xl" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="fileInput"
              />

              <button
                className="absolute bottom-0 right-0 border-4 border-cyan-200 bg-cyan-500 p-2 rounded-tl hover:bg-cyan-600 transition"
                onClick={() => document.getElementById("fileInput").click()}
              >
                <FaEdit className="text-white text-xl" />
              </button>

              {image && (
                <button
                  onClick={uploadProfilePicture}
                  className="mt-2 bg-teal-500 text-white px-4 py-1 rounded"
                >
                  {uploading ? "Uploading..." : "Save"}
                </button>
              )}
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-cyan-800 mb-2">
                {user?.username}
              </h1>
              <div className="flex gap-4 justify-center md:justify-start">
                <button className="bg-cyan-500 text-white px-6 py-2 rounded-full hover:bg-cyan-600 flex items-center gap-2">
                  <FaPalette />
                  <span>My Boards</span>
                </button>
                <button className="border-2 border-cyan-500 text-cyan-600 px-6 py-2 rounded-full hover:bg-cyan-50 flex items-center gap-2">
                  <FaUsers />
                  <span>Collaborations</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <StatCard
            icon={<MdWorkspaces />}
            value={user?.boardsCount || 0}
            label="Boards Created"
          />

          <StatCard
            icon={<FaUsers />}
            value={user.collaborations || 0}
            label="Collaborations"
          />
        </div>

        {/* Personal Info Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-cyan-800 mb-6">
            Personal Information
          </h2>
          <div className="space-y-4">
            <InfoCard
              icon={<FaUser />}
              label="Full Name"
              value={user.username}
            />
            <InfoCard icon={<FaEnvelope />} label="Email" value={user.email} />
            <InfoCard
              icon={<FaCalendarAlt />}
              label="Member Since"
              value={new Date(user.createdAt).toDateString()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 hover:bg-cyan-50 rounded-xl transition">
    <div className="p-3 bg-cyan-100 rounded-full text-cyan-600">{icon}</div>
    <div>
      <p className="text-sm text-cyan-800">{label}</p>
      <p className="font-medium text-cyan-800">{value}</p>
    </div>
  </div>
);

const StatCard = ({ icon, value, label }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-cyan-100 rounded-full text-cyan-600 text-2xl">
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-cyan-800">{value}</h3>
        <p className="text-cyan-800">{label}</p>
      </div>
    </div>
  </div>
);

export default ProfilePage;
