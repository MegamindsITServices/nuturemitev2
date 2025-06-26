import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Mail, Phone, MapPin } from 'lucide-react';

const TermsAndConditions = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const sections = [
    {
      id: 'account-terms',
      title: '1. Account Terms',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">1.1. Account Creation:</h4>
            <p className="text-gray-600">When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Site.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">1.2. Account Security:</h4>
            <p className="text-gray-600">You are responsible for safeguarding the password that you use to access the Site and for any activities or actions under your password, whether your password is with our Site or a third-party service. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">1.3. Eligibility:</h4>
            <p className="text-gray-600">You must be at least 18 years of age or the legal age of majority in your jurisdiction to create an account and make purchases on our Site.</p>
          </div>
        </div>
      )
    },
    {
      id: 'products-services',
      title: '2. Products and Services',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">2.1. Product Descriptions:</h4>
            <p className="text-gray-600">We strive to be as accurate as possible in the description of our products. However, we do not warrant that product descriptions or other content of this Site are accurate, complete, reliable, current, or error-free. All products are subject to availability.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">2.2. Pricing:</h4>
            <p className="text-gray-600">All prices are listed in Indian Rupees (INR) and are inclusive of GST (18%) unless otherwise stated. Prices are subject to change without notice. We reserve the right to correct any errors in pricing or product descriptions.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">2.3. Health Information Disclaimer:</h4>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <ul className="text-gray-700 space-y-2">
                <li>• Our products are dietary supplements and health foods. They are not intended to diagnose, treat, cure, or prevent any disease.</li>
                <li>• The information provided on this Site (including product descriptions, blog posts, FAQs, etc.) is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.</li>
                <li>• Always consult with a qualified physician or healthcare professional before starting any new diet, supplement, or exercise program, especially if you are pregnant, nursing, have a medical condition, or are taking any medication. Nuturemite is not liable for any adverse reactions or health issues arising from the use of our products without professional medical consultation.</li>
              </ul>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">2.4. Product Availability:</h4>
            <p className="text-gray-600">We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at any time without notice, at the sole discretion of us. We reserve the right to discontinue any product at any time.</p>
          </div>
        </div>
      )
    },
    {
      id: 'orders-payment',
      title: '3. Orders and Payment',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">3.1. Order Acceptance:</h4>
            <p className="text-gray-600">Your placement of an order does not necessarily assure that we will accept your order. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in the description or price of the product, error in your order, or if fraud or an unauthorized or illegal transaction is suspected.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">3.2. Payment:</h4>
            <p className="text-gray-600">All payments must be made through the payment gateways provided on our Site. By providing a credit card or other payment method, you represent and warrant that you are authorized to use the designated payment method and that you authorize us (or our third-party payment processor) to charge your payment method for the total amount of your order.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">3.3. Order Cancellation by User:</h4>
            <p className="text-gray-600">You may cancel an order before it has been dispatched. Please refer to our Refund Policy for details on how to request a cancellation.</p>
          </div>
        </div>
      )
    },
    {
      id: 'shipping-delivery',
      title: '4. Shipping and Delivery',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">4.1. Shipping Policy:</h4>
            <p className="text-gray-600">All aspects of shipping, including costs, estimated delivery times, and zones, are governed by our Shipping Policy. By placing an order, you agree to the terms outlined in our Shipping Policy.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">4.2. Risk of Loss:</h4>
            <p className="text-gray-600">All products purchased from the Site are made pursuant to a shipment contract. This means that the risk of loss and title for such products pass to you upon our delivery to the carrier.</p>
          </div>
        </div>
      )
    },
    {
      id: 'returns-refunds',
      title: '5. Returns and Refunds',
      content: (
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">5.1. Refund Policy:</h4>
          <p className="text-gray-600">Our policy on returns and refunds is detailed in our Refund Policy. By making a purchase, you agree to the terms outlined in our Refund Policy.</p>
        </div>
      )
    },
    {
      id: 'intellectual-property',
      title: '6. Intellectual Property',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">6.1. Ownership:</h4>
            <p className="text-gray-600">The Site and its original content, features, and functionality are and will remain the exclusive property of Nuturemite and its licensors. The Site is protected by copyright, trademark, and other laws of both India and foreign countries.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">6.2. Trademarks:</h4>
            <p className="text-gray-600">Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Nuturemite.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">6.3. User-Generated Content:</h4>
            <p className="text-gray-600">If you submit content (e.g., product reviews, comments) to the Site, you grant Nuturemite a non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content throughout the world in any media. You represent and warrant that you own or otherwise control all the rights to the content that you post; that the content is accurate; that use of the content you supply does not violate this policy and will not cause injury to any person or entity.</p>
          </div>
        </div>
      )
    }
  ];

  const otherSections = [
    {
      title: '7. Links to Other Websites',
      content: 'Our Site may contain links to third-party websites or services that are not owned or controlled by Nuturemite. Nuturemite has no control over and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that Nuturemite shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services. We strongly advise you to read the terms and conditions and privacy policies of any third-party websites or services that you visit.'
    },
    {
      title: '8. Termination',
      content: 'We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Site will immediately cease. If you wish to terminate your account, you may simply discontinue using the Site or contact us for account deletion.'
    },
    {
      title: '9. Limitation of Liability',
      content: 'In no event shall Nuturemite, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Site; (ii) any conduct or content of any third party on the Site; (iii) any content obtained from the Site; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.'
    },
    {
      title: '10. Disclaimer',
      content: 'Your use of the Site is at your sole risk. The Site is provided on an "AS IS" and "AS AVAILABLE" basis. The Site is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance. Nuturemite does not warrant that a) the Site will function uninterrupted, secure, or available at any particular time or location; b) any errors or defects will be corrected; c) the Site is free of viruses or other harmful components; or d) the results of using the Site will meet your requirements.'
    },
    {
      title: '11. Governing Law & Jurisdiction',
      content: 'These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any dispute arising out of or in connection with these Terms, your use of the Site, or the purchase of products shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana.'
    },
    {
      title: '12. Severability',
      content: 'If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.'
    },
    {
      title: '13. Entire Agreement',
      content: 'These Terms constitute the entire agreement between us regarding our Site, and supersede and replace any prior agreements we might have between us regarding the Site.'
    },
    {
      title: '14. Changes to These Terms',
      content: 'We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days\' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Site after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Site.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Terms & Conditions</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <p className="text-gray-700 leading-relaxed">
            Please read these Terms & Conditions ("Terms") carefully before using the Nuturemite website (the "Site") operated by Nuturemite ("us," "we," or "our").
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            Your access to and use of the Site is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Site.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            <strong>By accessing or using the Site, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Site.</strong>
          </p>
        </div>

        {/* Expandable Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                {expandedSections[section.id] ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedSections[section.id] && (
                <div className="px-6 pb-6">
                  {section.content}
                </div>
              )}
            </div>
          ))}

          {/* Other sections (non-expandable) */}
          {otherSections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h2>
              <p className="text-gray-700 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">15. Contact Us</h2>
          <p className="text-gray-700 mb-4">If you have any questions about these Terms, please contact us:</p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Nuturemite</h3>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span>Sales@nuturemite.info</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>+91 7032383232</span>
              </div>
              <div className="flex items-start text-gray-600">
                <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                <span>H.NO:6-264/13/A/15A Raghavaendra Colony, Quthbullapur Road, Suchitra Pincode: 500055</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            © 2025 Nuturemite. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;