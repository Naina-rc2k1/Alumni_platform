import React from 'react';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Logo and Description */}
          <div className="footer-logo-section">
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">AlumniConnect</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              A centralized platform for alumni data management and engagement. 
              Connect with your alma mater, network with fellow alumni, and contribute 
              to the growth of your educational community.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="footer-icon">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="footer-icon">
                <Phone className="h-5 w-5" />
              </a>
              <a href="#" className="footer-icon">
                <MapPin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="footer-link">Home</a></li>
              <li><a href="/alumni" className="footer-link">Alumni Directory</a></li>
              <li><a href="/events" className="footer-link">Events</a></li>
              <li><a href="/mentorship" className="footer-link">Mentorship</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-contact">
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-gray-300">
              <p>Government of Punjab</p>
              <p>Department of Higher Education</p>
              <p>Email: info@alumniconnect.edu</p>
              <p>Phone: +91-XXX-XXXX-XXX</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 AlumniConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
