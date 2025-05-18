import React from "react";
import { Heart, Users, Award, Star, Shield, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";

const About = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 },
  };

  // Values section data
  const values = [
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Passion for Nutrition",
      description:
        "We're deeply committed to improving lives through better nutrition and education.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Customer-Centric",
      description:
        "Your health journey is our priority. We provide personalized guidance and support.",
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Quality Excellence",
      description:
        "We source only the highest quality ingredients for our supplements and recommendations.",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Scientific Integrity",
      description:
        "Our advice is grounded in scientific research and evidence-based practices.",
    },
  ];

  // FAQs data
  const faqs = [
    {
      question: " When will I receive my order?",
      answer:
        " Orders are typically processed within 1–2 business days and delivered within 3–7 business days depending on your location",
    },
    {
      question: "Can I cancel or modify my order after placing it? ",
      answer:
        "If your order hasn’t been dispatched yet, we can help you modify or cancel it. Just write to us at sales@nuturemite.com within 2 hours of placing the order.",
    },
    {
      question: " I received the wrong or damaged item. What should I do?",
      answer:
        " We’re so sorry! Please email us with your order ID and a photo of the product, and we’ll make it right. ",
    },
    {
      question: "Are your products suitable for kids? ",
      answer:
        "Absolutely. Our products are made with clean, simple ingredients and no junk — perfect for all age groups",
    },
    {
      question: "Are your products gluten-free?",
      answer:
        "Yes! All our millet-based products are naturally gluten-free. We ensure they’re processed in a clean environment to avoid contamination.",
    },
    {
      question: "Do you ship across India? ",
      answer:
        "Yes, we currently deliver to most pincodes across India. If you’re unsure about your location, just drop us a message!",
    },
    {
      question: "How I will track my order? ",
      answer:
        "Once your order is placed, you’ll receive a confirmation email and SMS with tracking details. You can use that link to follow your order in real-time. ",
    },
    {
      question: "Still have questions? ",
      answer:
        "We’re just a message away. Write to us at sales@nuturemite.info , and we’ll get back to you within 24 hours. You can also check our social media pages for updates and millet magic!",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Hero Section */}
      <motion.section
        className="text-center mb-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          About Nuturemite
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          We're dedicated to improving lives through proper nutrition, expert
          guidance, and quality supplements.
        </p>
      </motion.section>

      {/* Mission & Vision Section */}
      <motion.section
        className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="order-2 md:order-1">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              Nuturemite aims to support individual health by recommending
              appropriate foods based on body acceptability, contributing to a
              healthier society. We provide expert advice and timely delivery of
              quality food supplements to clients, ensuring their well-being.
            </p>

            <h2 className="text-3xl font-bold mb-6 mt-10">Our Vision</h2>
            <p className="text-gray-600 mb-6">
              We at Nuturemite respect and appreciate all health care
              professionals who dedicate time to their clients. We believe in
              partnerships with health care professionals and focus on our
              mission, which is truly important and meaningful to us. We are
              eager to hear from you regarding health queries and strive to
              achieve our vision through customer and employee satisfaction.
            </p>

            <Button className="mt-4 flex items-center">
              Learn More <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        <div className="order-1 md:order-2 relative">
          <motion.div
            className="rounded-xl overflow-hidden shadow-xl"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <img
              src="https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
              alt="Healthy Food"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-primary/10 z-[-1]"></div>
          <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-primary/20 z-[-1]"></div>
        </div>
      </motion.section>

      {/* What & Who We Are Section */}
      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-xl shadow-sm"
            {...fadeIn}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">What We Do</h2>
            <p className="text-gray-600">
              Nuturemite is the site that gives you information regarding the
              foods that boost up the health of an individual, their effects on
              different systems of our body, various food recipes, food safety,
              health, and fitness, food based on different age groups. We expose
              you to experts and professionals in fitness and health, whose
              suggestions can answer your queries, available in different
              languages as per customer requests. We also provide high-quality
              food supplements if required, based on prescriptions.
            </p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-xl shadow-sm"
            {...fadeIn}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-4">Who We Are</h2>
            <p className="text-gray-600">
              We, through our website Nuturemite, bring experts in nutrition and
              health care to guide you on proper nutrition, food choices to keep
              yourself fit and healthy, owing to disease symptoms or chronic
              suffering. We provide nutritional benefits about foods, and guide
              you to have the right food, at the right time, in the right way as
              per your body requirements. Our registered dietitians and
              nutritionists design various nutrition programs to raise awareness
              about nutritious foods and their role in preventing chronic
              diseases.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Values Section */}
      <motion.section
        className="mb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Consultation Section */}
      <motion.section
        className="mb-20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl p-8"
        {...fadeIn}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Consultation</h2>
          <p className="text-gray-600 mb-8">
            We offer online consultations with high-profile professionals in
            health care, diet, fitness, etc., who address your concerns and
            provide appropriate guidance. Our timely response ensures your
            health is not neglected.
          </p>
          <Button size="lg">Book a Consultation</Button>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="mb-20"
        {...fadeIn}
        transition={{ duration: 0.8, delay: 1.0 }}
      >
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="bg-primary/10 text-primary font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="bg-white text-gray-700">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        className="mb-20"
        {...fadeIn}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <h2 className="text-3xl font-bold text-center mb-12">
          What Our Clients Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <Card
              key={item}
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6">
                  "Nuturemite has completely transformed my relationship with
                  food. The personalized nutrition plan has helped me feel more
                  energized and healthier than ever before."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <span className="font-semibold text-primary">
                      {String.fromCharCode(64 + item)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">Happy Client {item}</p>
                    <p className="text-sm text-gray-500">
                      Nutrition Program Client
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white p-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.3 }}
      >
        <h2 className="text-3xl font-bold mb-4">
          Ready to Start Your Health Journey?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of individuals who have improved their lives through
          our nutrition guidance and supplements.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            className="bg-white text-primary hover:bg-gray-100"
          >
            View Our Products
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent border-white hover:bg-white/10"
          >
            Contact Us Today
          </Button>
        </div>
      </motion.section>
    </div>
  );
};

export default About;
