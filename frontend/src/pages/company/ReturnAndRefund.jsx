import React from 'react';
import { motion } from 'framer-motion';

const ReturnAndRefund = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-center">Return & Refund Policy</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <p className="text-xl font-medium text-primary mb-2">If it's not right, we'll make it right.</p>
          
          <p className="text-gray-700 mb-6">
            Your trust means everything to us. We craft our millet-based products with love and 
            integrity — and we want you to feel that in every bite. But if something goes wrong, 
            we're here to fix it with honesty and heart.
          </p>

          <div className="space-y-8">
            {/* Section 1 */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
                <span className="bg-primary text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">1</span>
                Order Cancellation
              </h2>
              <div className="pl-11">
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
                  <p className="text-gray-700 mb-2 font-medium">Need to Cancel Your Order?</p>
                  <p className="text-gray-700 mb-3">
                    We completely understand—plans can change! If you reach out to us within 2 hours 
                    of placing your order and it hasn't been processed yet, we'll be happy to cancel it 
                    and issue a full refund.
                  </p>
                  <p className="text-gray-700">
                    However, if your order has already been processed or shipped, we won't be able to 
                    cancel it at that stage.
                  </p>
                  <p className="text-gray-700 mt-3 italic">
                    Thank you for your understanding and continued support!
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
                <span className="bg-primary text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">2</span>
                Need to Make a Return? We're Here to Help!
              </h2>
              <div className="pl-11">
                <p className="text-gray-700 mb-4">
                  If you'd like to return a product, simply give our customer care team a call or email us 
                  at <span className="text-primary font-medium">sales@nuturemite.info</span> within 48hrs of delivery. Please ensure the items are in their 
                  original condition when returning.
                </p>
                <p className="text-gray-700 mb-4 italic">
                  We're committed to making your experience smooth and hassle-free!
                </p>
                
                <p className="font-medium text-gray-800 mb-2">Return will be applicable only if:</p>
                <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-1">
                  <li>You received the wrong product</li>
                  <li>Your order was damaged in transit</li>
                  <li>An item was missing</li>
                  <li>The quality wasn't up to the mark</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
                <span className="bg-primary text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">3</span>
                How to request a refund or replacement:
              </h2>
              <div className="pl-11">
                <p className="text-gray-700 mb-2">
                  Email us at <span className="text-primary font-medium">sales@nuturemite.info</span> with:
                </p>
                <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-1">
                  <li>Your order number</li>
                  <li>A brief note on what went wrong</li>
                  <li>A photo (if relevant — for damage, etc.)</li>
                </ul>
                <p className="text-gray-700">
                  Our customer care team will get back to you with warmth and clarity within 24–48 hours.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
                <span className="bg-primary text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">4</span>
                Refund method:
              </h2>
              <div className="pl-11">
                <ul className="list-disc pl-5 text-gray-700 mb-6 space-y-1">
                  <li>Prepaid orders will be refunded to your original payment method within 5–7 business days</li>
                  <li>Cash-on-Delivery orders will be refunded via UPI or bank transfer</li>
                  <li>Alternatively, you can opt for a store credit or replacement — your choice!</li>
                </ul>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-800 mb-2">A few things to keep in mind:</p>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    <li>We can't accept returns or refunds for used/opened items unless there's a quality issue.</li>
                    <li>Refunds for bulk/discounted orders will be handled on a case-by-case basis.</li>
                    <li>If the return is due to change of mind after dispatch, return shipping charges may apply.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-medium text-primary mb-3">We're people first — just like you.</h3>
            <p className="text-gray-700 mb-2">
              No robots. No runaround. Just a team that cares and wants to see you happy.
            </p>
            <p className="text-gray-700">
              If something didn't feel right, talk to us. We'll listen, and we'll do everything we can to 
              make it better.
            </p>
          </div>
        </div>

        {/* Contact Card */}
        <motion.div 
          className="bg-primary/10 rounded-lg p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold mb-2">Need more help?</h3>
          <p className="mb-4">Our customer support team is always ready to assist you</p>
          <a 
            href="mailto:sales@nuturemite.info" 
            className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ReturnAndRefund;