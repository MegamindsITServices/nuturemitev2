import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { axiosInstance } from '../../utils/request';
import { toast } from "sonner";
const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 50) return 'Name must be less than 50 characters';
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Name can only contain letters and spaces';
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
    if (email.length > 100) return 'Email must be less than 100 characters';
    return '';
  };

  const validateSubject = (subject) => {
    if (!subject.trim()) return 'Subject is required';
    if (subject.trim().length < 5) return 'Subject must be at least 5 characters';
    if (subject.trim().length > 100) return 'Subject must be less than 100 characters';
    return '';
  };

  const validateMessage = (message) => {
    if (!message.trim()) return 'Message is required';
    if (message.trim().length < 10) return 'Message must be at least 10 characters';
    if (message.trim().length > 1000) return 'Message must be less than 1000 characters';
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    newErrors.name = validateName(formData.name);
    newErrors.email = validateEmail(formData.email);
    newErrors.subject = validateSubject(formData.subject);
    newErrors.message = validateMessage(formData.message);
    
    // Remove empty error messages
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';
    
    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'subject':
        error = validateSubject(value);
        break;
      case 'message':
        error = validateMessage(value);
        break;
      default:
        break;
    }
    
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Function to send message (simulate API call)
  const sendMessage = async (messageData) => {
    // Simulate API call delay
     const data = await axiosInstance.post("/api/user/enquiry/putMsg", {
        name:messageData.name,
        email:messageData.email,
        message:messageData.message
      });
      
      if (data.data.status) {
        toast.success('Response submitted');
       
      }
    
    if (success) {
      // In a real app, you would make an API call here
      console.log('Message sent successfully:', messageData);
      return { success: true, message: 'Message sent successfully!' };
    } else {
      throw new Error('Failed to send message. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Prepare message data
      const messageData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      };
      
      // Send message
      const result = await sendMessage(messageData);
      
      if (result.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        
        // Reset submitted state after 5 seconds
        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      }
    } catch (error) {
      setSubmitError(error.message || 'An error occurred while sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">Get in Touch</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions about our nutrition services or products? We're here to help you on your journey to better health.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Contact Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 h-full">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
              <p className="text-gray-600">Reach out to us through any of these channels</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-gray-600">sales@nuturemite.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <p className="text-gray-600">+91 7032383232</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-gray-600">H.No:6-264/13/A/15A, Raghavaendra Colony, Quthbullapur Road, Suchitra</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Working Hours</h3>
                  <p className="text-gray-600">Monday - Friday: 9AM - 6PM</p>
                  <p className="text-gray-600">Saturday: 10AM - 4PM</p>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="font-medium mb-3">Connect With Us</h3>
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com/Nuturemite" target="_blank" rel="noopener noreferrer" className="bg-blue-100 p-2 rounded-full hover:bg-blue-200 transition-colors">
                    <Facebook className="h-5 w-5 text-blue-600" />
                  </a>
                  <a href="https://www.youtube.com/@Nuturemitehealth" target="_blank" rel="noopener noreferrer" className="bg-blue-100 p-2 rounded-full hover:bg-blue-200 transition-colors">
                    <Youtube className="h-5 w-5 text-blue-600" />
                  </a>
                  <a href="#" className="bg-blue-100 p-2 rounded-full hover:bg-blue-200 transition-colors">
                    <Twitter className="h-5 w-5 text-blue-600" />
                  </a>
                  <a href="https://www.instagram.com/nuturemite_blog/#" target="_blank" rel="noopener noreferrer" className="bg-blue-100 p-2 rounded-full hover:bg-blue-200 transition-colors">
                    <Instagram className="h-5 w-5 text-blue-600" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
              <p className="text-gray-600">Fill out the form below and we'll get back to you as soon as possible</p>
            </div>
            
            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800">Thank you! Your message has been sent successfully. We'll get back to you soon.</span>
              </div>
            )}
            
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                <span className="text-red-800">{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Your full name"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="your.email@example.com"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="How can we help you?"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.subject ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.subject && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.subject}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Tell us more about your inquiry..."
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-vertical ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.message && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {formData.message.length}/1000 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || submitted}
                className={`w-full md:w-auto px-6 py-2 rounded-md font-medium transition-colors flex items-center justify-center ${
                  isSubmitting || submitted
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                } text-white`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    Sending...
                  </span>
                ) : submitted ? (
                  <span className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Sent!
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="rounded-xl overflow-hidden shadow-lg mb-16">
        <div className="aspect-[16/9] w-full">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55094.46868517464!2d78.39211821556088!3d17.503426428067637!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb917be1cc4e43%3A0x7531366a010b8a03!2sNuturemite!5e1!3m2!1sen!2sin!4v1747239450279!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Nuturemite Location"
          ></iframe>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
            <h3 className="text-lg font-semibold mb-2">How quickly will I receive a response?</h3>
            <p className="text-gray-600">We typically respond to all inquiries within 24-48 business hours. For urgent matters, please contact us by phone.</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Do you offer nutritional consultations online?</h3>
            <p className="text-gray-600">Yes, we offer online consultations with our registered dietitians and nutritionists. Please specify this in your message.</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
            <h3 className="text-lg font-semibold mb-2">How can I track my order?</h3>
            <p className="text-gray-600">Once your order is shipped, you'll receive a tracking number via email. You can also check the status in your account dashboard.</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Do you ship internationally?</h3>
            <p className="text-gray-600">Yes, we ship our nutritional products to many countries. Shipping rates and delivery times vary by location.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;