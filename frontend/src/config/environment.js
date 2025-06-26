// This file contains environment-specific configuration settings
// It will be imported by config modules that need environment values

const config = {
  // API URL configurations
  apiUrl: {
    development: "https://api.nuturemite.info",
    production: "https://api.nuturemite.info",
  },

  // Image URL configurations
  imageUrl: {
    development: "https://api.nuturemite.info",
    production: "https://api.nuturemite.info",
  },

  // Get current environment
  isProduction: () => {
    const hostname = window.location.hostname;
    return !(hostname === "localhost" || hostname === "127.0.0.1");
  },

  // Get appropriate API URL based on environment
  getApiUrl: () => {
    return config.isProduction()
      ? config.apiUrl.production
      : config.apiUrl.development;
  },

  // Get appropriate image URL based on environment
  getImageUrl: () => {
    return config.isProduction()
      ? config.imageUrl.production
      : config.imageUrl.development;
  },
};

export default config;
