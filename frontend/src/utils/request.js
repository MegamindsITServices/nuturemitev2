import axios from "axios";
export const axiosInstance = axios.create({
  baseURL: "http://localhost:8080", // Default base URL
});

// Setup axios interceptors to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get auth data from localStorage
    const authData = localStorage.getItem("auth");
    if (authData) {
      const { token } = JSON.parse(authData);
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getConfig = async () => {
  try {
    const response = await axios.get("/api.config.json");
    const baseEndPoint = response.data.baseUrl;
    axiosInstance.defaults.baseURL = baseEndPoint;
    console.log("Using baseURL:", baseEndPoint);
  } catch (error) {
    console.log("Error fetching config:", error);
    // Fall back to default baseURL based on window location
    const isDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const baseURL = isDevelopment
      ? "http://localhost:8080"
      : "http://localhost:8080";
    axiosInstance.defaults.baseURL = baseURL;
    console.log("Using fallback baseURL:", baseURL);
  }
};
