import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Mail, 
  Phone, 
  Users, 
  Award, 
  Truck, 
  Target, 
  CheckCircle, 
  Package, 
  Shield, 
  TrendingUp,
  Globe,
  Star,
  MessageCircle
} from 'lucide-react';

const BusinessPage = () => {
  const [expandedFAQ, setExpandedFAQ] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    interest: '',
    message: ''
  });

  const toggleFAQ = (index) => {
    setExpandedFAQ(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = () => {
    // Handle form submission logic here
    if (formData.name && formData.email && formData.phone && formData.interest) {
      alert('Thank you for your interest! We will contact you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        interest: '',
        message: ''
      });
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const benefits = [
    {
      icon: <Award className="h-6 w-6" />,
      title: "IIMR Collaboration",
      description: "Access to cutting-edge research and product development in millets and broader health & wellness."
    },
    {
      icon: <Package className="h-6 w-6" />,
      title: "Diverse Product Range",
      description: "From millet cookies and energy bars to premium dry fruits, nutritious flours, and advanced supplements."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Quality Assurance",
      description: "FSSAI certified products ensuring top-notch quality and safety across our expanding portfolio."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Competitive Pricing",
      description: "Attractive margins for distributors and bulk buyers with flexible pricing structures."
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Marketing Support",
      description: "Access to promotional materials and co-branding opportunities for enhanced market presence."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Training & Resources",
      description: "Comprehensive product training and dedicated sales support for your success."
    }
  ];

  const faqs = [
    {
      question: "What is the lead time for bulk orders?",
      answer: "Typically, 7-10 business days, depending on order size and customization requirements."
    },
    {
      question: "Do you offer credit terms for distributors?",
      answer: "Yes, credit terms are available upon successful credit assessment and mutually agreed terms."
    },
    {
      question: "Can I get samples before placing a bulk order?",
      answer: "Absolutely! Contact us via email or phone to request product samples."
    },
    {
      question: "How does Nuturemite support its distributors with marketing?",
      answer: "We provide access to promotional materials, digital assets, and offer co-branding opportunities. Our team can also offer insights for local market penetration."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Partner with Nuturemite
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-green-100">
              Pioneering Millet-Based Nutrition & Holistic Wellness
            </p>
            <p className="text-lg max-w-4xl mx-auto text-blue-100 leading-relaxed">
              In collaboration with the Indian Institute of Millets Research (IIMR), we're at the forefront of bringing innovative, natural, and wholesome products to the market. Join us in revolutionizing health and wellness through sustainable nutrition.
            </p>
            {/* <div className="mt-8">
              <button 
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Start Partnership Today
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Why Collaborate Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Collaborate with Nuturemite?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our growing network of partners and unlock exceptional opportunities in the health and wellness market
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">{benefit.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Partnership Options */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Bulk Purchasing */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
              <div className="flex items-center mb-6">
                <Package className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Bulk Purchasing Options</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Flexible MOQ</p>
                    <p className="text-gray-600">Starting from 100 units (varies per product category)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Custom Packaging</p>
                    <p className="text-gray-600">Private labeling and customized packaging options</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Logistics Support</p>
                    <p className="text-gray-600">Efficient delivery systems across India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Distributor Program */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
              <div className="flex items-center mb-6">
                <Globe className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Distributor Program</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Territorial Rights</p>
                    <p className="text-gray-600">Area exclusivity based on performance and market potential</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Incentive Schemes</p>
                    <p className="text-gray-600">Performance-based rewards and bonuses</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Dedicated Account Manager</p>
                    <p className="text-gray-600">Personalized support for your business needs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h3 className="text-3xl font-bold mb-8">Get in Touch</h3>
              <p className="text-xl text-gray-300 mb-8">
                Interested in partnering with Nuturemite? Let's discuss how we can grow together.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-green-600 p-3 rounded-lg mr-4">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-gray-300">sales@nuturemite.info</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-blue-600 p-3 rounded-lg mr-4">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-gray-300">+91-7032383232</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            {/* <div className="bg-white rounded-2xl p-8 text-gray-900">
              <h4 className="text-2xl font-bold mb-6">Send us a Message</h4>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Company Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  name="interest"
                  value={formData.interest}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Partnership Interest</option>
                  <option value="bulk-purchasing">Bulk Purchasing</option>
                  <option value="distributor">Distributor Program</option>
                  <option value="both">Both Options</option>
                  <option value="other">Other</option>
                </select>
                
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us about your business and requirements"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                
                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Send Message
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h3>
          <p className="text-xl text-gray-600">
            Common questions from our business partners
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h4 className="text-lg font-semibold text-gray-900">{faq.question}</h4>
                {expandedFAQ[index] ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedFAQ[index] && (
                <div className="px-6 pb-4">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Partner with Nuturemite?
          </h3>
          <p className="text-xl mb-8 text-green-100">
            Join our mission to revolutionize health and wellness through sustainable nutrition
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
             href={`https://mail.google.com/mail/?view=cm&to=sales@nuturemite.info`}
              className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Email Us Now
            </a>
            <a
              href="tel:+917032383232"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-green-600 transform hover:scale-105 transition-all duration-300"
            >
              Call Us Today
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPage;