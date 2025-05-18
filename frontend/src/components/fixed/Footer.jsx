import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <footer className="w-full bg-black text-white pt-8 pb-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Section with Logo, Address and Newsletter */}
        <div className="flex flex-col lg:flex-row justify-between items-start mb-10">
          {/* Logo and Contact Info */}
          <div className="mb-8 lg:mb-0">
            {/* Logo */}
            <div className="mb-6">
              <img
                src="/images/logo.png"
                alt="Nuturemite Logo"
                className="w-20 h-20 object-cover"
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-white mt-1 flex-shrink-0" />
                <span className="text-sm">
                  H.No:6-264/13/A/15A, Raghavaendra Colony, Quthbullapur
                  Road,Suchitra 500055
                </span>
              </div>
              {/* <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-white mt-1 flex-shrink-0" />
                <span className="text-sm">
                 5-5-35/201/NR.PRASHANTI NAGER, NEAR GANESH KANTA, Kukatpally Circle No 24, Hyderabad, Telangana-500072
                </span>
              </div> */}

              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-white" />
                <span className="text-sm">+91 70323 83232</span>
              </div>

              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-white" />
                <span className="text-sm">sales.nuturemite.info</span>
              </div>
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="w-full lg:w-auto">
            <p className="text-sm mb-4">
              Subscribe to our newsletter for updates and special offers!
            </p>
            <div className="flex">
              <div className="relative rounded-full flex-1 mr-1">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="rounded-full bg-gray-900 border-gray-700 text-sm pl-4 pr-4 py-2 w-full"
                />
              </div>
              <Button className="bg-white text-black hover:bg-gray-200 rounded-full text-xs font-medium px-6">
                SUBSCRIBE
              </Button>
            </div>
            {/* <div className="flex justify-end items-center mt-4">
              <span className="text-xs mr-2">FSSAI License No - 11521998000649</span>
              <img src="/api/placeholder/50/30" alt="FSSAI Logo" className="h-8" />
            </div> */}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6 border-t border-gray-800">
          {/* Company Column */}
          <div>
            <h3 className="text-white font-medium mb-4">Company</h3>
            <ul className="space-y-2">              <li>
                <Link to="/faqs" className="text-gray-400 hover:text-white text-sm">
                  Help & FAQs
                </Link>
              </li><li>
                <Link to="/return-and-refund" className="text-gray-400 hover:text-white text-sm">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Expertise Column */}
          <div>
            <h3 className="text-white font-medium mb-4">Our Expertise</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Product
                </Link>
              </li>
              <li>
                <Link
                  to="/combos"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Combos
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Information Column */}
          <div>
            <h3 className="text-white font-medium mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/our-story"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Our Story
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6 py-6 border-t border-gray-800">
          <Link
            to="https://www.facebook.com/Nuturemite/"
            className="text-gray-400 hover:text-white"
          >
            <Facebook className="h-5 w-5" />
          </Link>
          <Link
            to="https://www.instagram.com/nuturemite_blog/"
            className="text-gray-400 hover:text-white"
          >
            <Instagram className="h-5 w-5" />
          </Link>
          <Link
            to="https://www.youtube.com/channel/UCX1EgOA4GP0PJO893cHtbbA"
            className="text-gray-400 hover:text-white"
          >
            <Youtube className="h-5 w-5" />
          </Link>
          <Link
            to="https://x.com/nuturemite"
            className="text-gray-400 hover:text-white"
          >
            <Twitter className="h-5 w-5" />
          </Link>
          <Link
            to="https://www.linkedin.com/showcase/nuturemite/about/"
            className="text-gray-400 hover:text-white"
          >
            <Linkedin className="h-5 w-5" />
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center pt-4 text-xs text-gray-500">
          © 2025, Nuturemite
        </div>

        {/* Chat Support Icon - Bottom Right */}
        {/* <div className="fixed bottom-4 right-4">
          <div className="relative">
            <div className="absolute -top-2 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              1
            </div>
            <div className="bg-white rounded-full p-2 shadow-lg">
              <img src="/api/placeholder/40/40" alt="Support Avatar" className="w-10 h-10 rounded-full" />
            </div>
          </div>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
