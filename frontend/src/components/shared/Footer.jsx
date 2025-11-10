// frontend/src/components/shared/Footer.jsx
import React from 'react';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

// Import logo images
import mlawLogo from '../../assets/logos/mlaw.jpg';
import supremeLogo from '../../assets/logos/supreme.png';
import nalsaLogo from '../../assets/logos/nalsa.jpg';

const Footer = ({ language = 'en', darkMode = false }) => {
  // Contact information
  const contactInfo = {
    address: language === 'en' 
      ? '123 Legal Education Street, New Delhi, India 110001'
      : '123 कानूनी शिक्षा सड़क, नई दिल्ली, भारत 110001',
    phone: '+91-11-1234-5678',
    email: 'contact@legalquest.gov.in'
  };

  // Government department links with actual logos
  const governmentLinks = [
    {
      name: language === 'en' ? 'Ministry of Law & Justice' : 'कानून और न्याय मंत्रालय',
      url: 'https://lawmin.gov.in',
      logo: mlawLogo
    },
    {
      name: language === 'en' ? 'Supreme Court of India' : 'भारत का सर्वोच्च न्यायालय',
      url: 'https://main.sci.gov.in',
      logo: supremeLogo
    },
    {
      name: language === 'en' ? 'National Legal Services Authority' : 'राष्ट्रीय विधिक सेवा प्राधिकरण',
      url: 'https://nalsa.gov.in',
      logo: nalsaLogo
    }
  ];

  const quickLinks = [
    { label: language === 'en' ? 'About' : 'के बारे में', href: '#about' },
    { label: language === 'en' ? 'Contact' : 'संपर्क', href: '#contact' },
    { label: language === 'en' ? 'Terms' : 'नियम', href: '#terms' },
    { label: language === 'en' ? 'Privacy' : 'गोपनीयता', href: '#privacy' }
  ];

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {language === 'en' ? 'Quick Links' : 'त्वरित लिंक'}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {language === 'en' ? 'Contact Us' : 'हमसे संपर्क करें'}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{contactInfo.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="hover:text-indigo-400 transition-colors"
                >
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="hover:text-indigo-400 transition-colors"
                >
                  {contactInfo.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Government Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {language === 'en' ? 'Government Resources' : 'सरकारी संसाधन'}
            </h3>
            <ul className="space-y-3">
              {governmentLinks.map((dept, index) => (
                <li key={index}>
                  <a
                    href={dept.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-indigo-400 transition-colors group"
                  >
                    {dept.logo ? (
                      <img
                        src={dept.logo}
                        alt={dept.name}
                        className="w-10 h-10 object-contain bg-white dark:bg-gray-800 rounded p-1"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white text-xs font-bold">
                        {dept.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm flex-1">{dept.name}</span>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p>
            {language === 'en' 
              ? '© 2025 LegalQuest. All rights reserved.'
              : '© 2025 LegalQuest। सभी अधिकार सुरक्षित।'}
          </p>
          <p className="mt-2 text-gray-500">
            {language === 'en'
              ? 'Educational content for learning constitutional rights'
              : 'संवैधानिक अधिकार सीखने के लिए शैक्षिक सामग्री'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

