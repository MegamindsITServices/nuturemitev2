import React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "../../components/ui/accordion";

const Faqs = () => {
  // Animation settings
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  };
  
  // FAQs data
  const faqs = [
    {
      question: "When will I receive my order?",
      answer: "Orders are typically processed within 1–2 business days and delivered within 3–7 business days depending on your location"
    },
    {
      question: "Can I cancel or modify my order after placing it?",
      answer: "If your order hasn't been dispatched yet, we can help you modify or cancel it. Just write to us at sales@nuturemite.com within 2 hours of placing the order."
    },
    {
      question: "I received the wrong or damaged item. What should I do?",
      answer: "We're so sorry! Please email us with your order ID and a photo of the product, and we'll make it right."
    },
    {
      question: "Are your products suitable for kids?",
      answer: "Absolutely. Our products are made with clean, simple ingredients and no junk — perfect for all age groups"
    },
    {
      question: "Are your products gluten-free?",
      answer: "Yes! All our millet-based products are naturally gluten-free. We ensure they're processed in a clean environment to avoid contamination."
    },
    {
      question: "Do you ship across India?",
      answer: "Yes, we currently deliver to most pincodes across India. If you're unsure about your location, just drop us a message!"
    },
    {
      question: "How I will track my order?",
      answer: "Once your order is placed, you'll receive a confirmation email and SMS with tracking details. You can use that link to follow your order in real-time."
    },
    {
      question: "Still have questions?",
      answer: "We're just a message away. Write to us at sales@nuturemite.info, and we'll get back to you within 24 hours. You can also check our social media pages for updates and millet magic!"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Hero Section */}
      <motion.section
        className="text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Find answers to the most common questions about our products, ordering process, and more.
        </p>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="mb-20"
        {...fadeIn}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-gray-200 rounded-lg overflow-hidden mb-4"
              >
                <AccordionTrigger className="bg-primary/10 text-primary font-semibold p-4 hover:no-underline hover:bg-primary/20">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="bg-white text-gray-700 p-4 pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-gray-600 mb-6">
            Our customer support team is here to help with any other questions you might have.
          </p>
          <a 
            href="mailto:sales@nuturemite.info" 
            className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </motion.section>
    </div>
  );
};

export default Faqs;