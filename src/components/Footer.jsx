import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiActivity, FiHeart, FiMail, FiPhone, FiMapPin } = FiIcons;

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-900 text-white py-12 mt-16"
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <SafeIcon icon={FiActivity} className="text-2xl text-blue-400" />
              <span className="text-xl font-bold">NEET Predictor</span>
            </div>
            <p className="text-gray-400 text-sm">
              Helping medical aspirants predict their NEET ranks and find the best colleges for their future.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Rank Predictor</a></li>
              <li><a href="#" className="hover:text-white transition-colors">College Predictor</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cutoff Analysis</a></li>
              <li><a href="#" className="hover:text-white transition-colors">NEET Counseling</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">NEET Syllabus</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Previous Papers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Study Materials</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mock Tests</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiMail} />
                <span>info@neetpredictor.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiPhone} />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiMapPin} />
                <span>New Delhi, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>
            Made with <SafeIcon icon={FiHeart} className="inline text-red-500 mx-1" /> for NEET aspirants
          </p>
          <p className="mt-2">
            © 2024 NEET Predictor. All rights reserved. | Disclaimer: Predictions are based on historical data and trends.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;