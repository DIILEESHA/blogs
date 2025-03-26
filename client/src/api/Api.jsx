import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// Auth endpoints
export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const signupUser = async (name, email, password) => {
  try {
    const response = await api.post("/auth/signup", { name, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userType");
  localStorage.removeItem("username");
  localStorage.removeItem("userId");
};

// Feedback endpoints
export const createFeedback = async (feedbackData) => {
  try {
    const response = await api.post("/feedback", feedbackData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getFeedbacks = async () => {
  try {
    const response = await api.get("/feedback");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserFeedbacks = async () => {
  try {
    const response = await api.get("/feedback/my-feedbacks");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateFeedback = async (id, feedbackData) => {
  try {
    if (!id) {
      throw new Error("Feedback ID is required");
    }
    
    const response = await api.put(`/feedback/${id}`, feedbackData);
    return response.data;
  } catch (error) {
    console.error("Update feedback error:", error);
    throw error.response?.data || error;
  }
};

// Example delete feedback API function
export const deleteFeedback = async (id) => {
  try {
    const response = await api.delete(`/feedback/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
// Vlog endpoints
export const createVlog = async (vlogData) => {
  try {
    const response = await api.post("/vlogs", vlogData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getVlogs = async () => {
  try {
    const response = await api.get("/vlogs");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getVlogById = async (id) => {
  try {
    const response = await api.get(`/vlogs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateVlog = async (id, vlogData) => {
  try {
    if (!id) {
      throw new Error("Vlog ID is required");
    }
    const response = await api.put(`/vlogs/${id}`, vlogData);
    return response.data;
  } catch (error) {
    console.error("Update vlog error:", error);
    throw error.response?.data || error;
  }
};

export const deleteVlog = async (id) => {
  try {
    const response = await api.delete(`/vlogs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};