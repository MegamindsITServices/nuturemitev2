import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
  const phoneNumber = "+1234567890"; // Replace with your WhatsApp number
  const message = "Hello! I'm interested in your services."; // Default message

  return (
    <a
      href={`https://wa.me/7032383232`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-10 right-6 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 flex items-center justify-center"
      style={{ width: "50px", height: "50px", zIndex: 1000 }}
    >
      <FaWhatsapp size={30} />
    </a>
  );
};

export default WhatsAppButton;
