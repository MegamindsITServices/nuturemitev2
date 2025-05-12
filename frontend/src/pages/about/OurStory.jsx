import React from 'react';
import { 
  Calendar, 
  Milestone, 
  Award, 
  Users, 
  TrendingUp, 
  HeartHandshake, 
  Lightbulb, 
  Rocket 
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { motion } from 'framer-motion';

const OurStory = () => {
  // Company milestones
  const milestones = [
    {
      year: "2018",
      title: "Our Beginning",
      description: "Nuturemite was founded with a vision to make nutrition information accessible to everyone and provide guidance for healthier food choices.",
      icon: <Lightbulb className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    },
    {
      year: "2019",
      title: "Growing Our Team",
      description: "We expanded our team of nutrition experts, dietitians, and health professionals to provide comprehensive guidance and support.",
      icon: <Users className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    },
    {
      year: "2020",
      title: "Online Consultations",
      description: "We launched our online consultation platform, connecting clients with nutrition experts from anywhere in the world.",
      icon: <HeartHandshake className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    },
    {
      year: "2021",
      title: "Product Range Expansion",
      description: "We began offering high-quality nutritional supplements to complement our expert guidance and support wellness journeys.",
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    },
    {
      year: "2022",
      title: "Industry Recognition",
      description: "Nuturemite received industry recognition for our commitment to quality and customer satisfaction in nutrition guidance.",
      icon: <Award className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1579389083395-4507e98b5e67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    },
    {
      year: "2023",
      title: "Global Expansion",
      description: "We expanded our reach to serve clients internationally, with multi-language support and culturally-sensitive nutrition advice.",
      icon: <Rocket className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Our Journey</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          From our humble beginnings to becoming a trusted name in nutrition, explore the milestones that have shaped Nuturemite.
        </p>
      </motion.div>

      {/* Introduction Section */}
      <motion.section 
        className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="prose max-w-none"
          >
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Nuturemite is a website that offers credible information, which helps
              you in making healthy eating choices. It serves as a gateway and
              provides reliable information on nutrition, healthy eating, physical
              activity, and food safety for consumers.
            </p>
            <p className="text-gray-600 mb-6">
              Our website receives guidance from professionals like doctors, nutritionists, 
              dietitians, fitness gurus, and the best nutrition counselors, who work as a team 
              for making a healthy society.
            </p>
            
            <h3 className="text-2xl font-bold mb-4 mt-8">Our Mission</h3>
            <p className="text-gray-600 mb-6">
              Nuturemite aims to support individual health by recommending appropriate 
              foods based on body acceptability, contributing to a healthier society. 
              We provide expert advice and timely delivery of quality food supplements 
              to clients, ensuring their well-being.
            </p>
          </motion.div>
        </div>
        
        <div className="relative">
          <motion.div 
            className="rounded-xl overflow-hidden shadow-xl"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1553173975-2b5eca89c41f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
              alt="Nuturemite Story" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-primary/10 z-[-1]"></div>
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-primary/20 z-[-1]"></div>
        </div>
      </motion.section>

      {/* Timeline Section */}
      <motion.section 
        className="mb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center mb-16">Our Timeline</h2>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary/80 to-primary/20 rounded-full"></div>
          
          {/* Timeline items */}
          <div className="relative">
            {milestones.map((milestone, index) => (
              <motion.div 
                key={index}
                className={`mb-16 flex items-center justify-center ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
              >
                <div className={`relative flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  {/* Year bubble */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none">
                    <div className="relative">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg z-10">
                        <span className="text-white font-bold">{milestone.year}</span>
                      </div>
                      <div className="absolute top-1/2 transform -translate-y-1/2 w-16 h-1 bg-primary/20 hidden md:block
                        left-full origin-left"></div>
                    </div>
                  </div>
                  
                  {/* Content card */}
                  <Card className={`shadow-md hover:shadow-lg transition-shadow max-w-md w-full z-10 ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                    <div className="overflow-hidden">
                      <img 
                        src={milestone.image} 
                        alt={milestone.title}
                        className="w-full h-48 object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center mr-3">
                          {milestone.icon}
                        </div>
                        <h3 className="text-xl font-bold">{milestone.title}</h3>
                      </div>
                      <p className="text-gray-600">{milestone.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* What We Do Section */}
      <motion.section 
        className="mb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-bold text-center mb-10">What We Do</h2>
        
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-xl shadow-sm mb-8">
          <p className="text-gray-600">
            Nuturemite is the site that gives you information regarding the foods
            that boost up the health of an individual, their effects on different
            systems of our body, various food recipes, food safety, health, and
            fitness, food based on different age groups. We expose you to experts
            and professionals in fitness and health, whose suggestions can answer
            your queries, available in different languages as per customer
            requests. We also provide high-quality food supplements if required,
            based on prescriptions.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Nutritional Health Supplements</h3>
            <p className="text-gray-600">
              We provide high-quality nutrition supplements as per our professionals' suggestions, 
              ensuring quick delivery. We are committed to helping you enjoy delicious foods with 
              caution and maintaining a healthy lifestyle.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Expert Consultation</h3>
            <p className="text-gray-600">
              Connect with our team of nutritionists, dietitians, and health professionals for 
              personalized guidance tailored to your unique health needs and goals.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Health Education</h3>
            <p className="text-gray-600">
              We provide reliable information and resources to help you make informed decisions 
              about your diet, nutrition, and overall wellness.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Future Vision Section */}
      <motion.section 
        className="mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-10 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Looking Ahead</h2>
            <p className="text-lg mb-8">
              As we continue our journey, we remain committed to our founding vision of making nutrition 
              information accessible and empowering individuals to make healthier food choices. 
              The future of Nuturemite includes expanding our product range, enhancing our digital 
              platform, and reaching more communities globally.
            </p>
            <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-gray-100">
              Join Our Journey
            </Button>
          </div>
        </div>
      </motion.section>
      
      {/* Call to Action */}
      <motion.section 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.3 }}
      >
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Health Journey?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Whether you're looking for nutrition guidance, expert consultation, or quality supplements, 
          we're here to support you every step of the way.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button>Explore Our Products</Button>
          <Button variant="outline">Contact Our Experts</Button>
        </div>
      </motion.section>
    </div>
  );
};

export default OurStory;