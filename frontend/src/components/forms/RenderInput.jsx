const AUTH_METHIDS = {
  OTP: "otp",
  EMAIL: "email",
  WHATSAPP: "whatsapp",
};

export const useInputValidation = () => {
  const validate = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phone && phoneRegex.test(phone);
  };
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email && emailRegex.test(email);
  };
  const validateOtp = (otp) => {
    const otpRegex = /^\d{6}$/;
    return otp && otpRegex.test(otp);
  };
  return {
    validate,
    validateEmail,
    validateOtp,
  };
};
