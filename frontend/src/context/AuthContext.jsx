import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟢 Load token from localStorage when app starts
  const storedToken = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      if (!storedToken) {
        console.warn("⚠️ No token found in localStorage.");
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        console.log("🔵 Using stored token:", storedToken);
        const response = await axios.get("http://localhost:5000/api/v1/users/getMe", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        console.log("✅ Fetched User Data:", response.data);

        // 🟢 Store token inside user object
        setUser({ ...response.data.data, token: storedToken });
      } catch (error) {
        console.error("🔴 Not logged in", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/v1/users/login", { username, password });

      if (res.data.token) {
        console.log("🔵 Saving token:", res.data.token);
        localStorage.setItem("token", res.data.token);

        // 🟢 Save token inside user object
        setUser({ ...res.data.user, token: res.data.token });
      }

      return res.data;
    } catch (error) {
      console.error("🔴 Login Failed", error.response?.data);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/api/v1/users/logout");
      localStorage.removeItem("token");
      setUser(null);
    } catch (error) {
      console.error("🔴 Logout Failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
