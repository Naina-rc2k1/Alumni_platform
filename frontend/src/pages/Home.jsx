import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

import { 
  Users, 
  Calendar, 
  GraduationCap, 
  Shield, 
  TrendingUp, 
  Heart,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    { icon: <Users className="icon" />, title: "Alumni Directory", description: "Connect with fellow alumni, search by graduation year, field of study, or location." },
    { icon: <Calendar className="icon" />, title: "Event Management", description: "Stay updated with alumni events, reunions, and networking opportunities." },
    { icon: <GraduationCap className="icon" />, title: "Mentorship Program", description: "Get mentored by experienced alumni or mentor current students." },
    { icon: <Shield className="icon" />, title: "Secure Platform", description: "Your data is protected with enterprise-grade security measures." }
  ];

  const stats = [
    { number: "10,000+", label: "Active Alumni" },
    { number: "500+", label: "Events Hosted" },
    { number: "1,200+", label: "Mentorship Matches" },
    { number: "50+", label: "Partner Companies" }
  ];

  const testimonials = [
    { name: "Dr. Sarah Johnson", role: "Class of 2010, Software Engineer at Google", content: "AlumniConnect helped me reconnect with my college friends and find amazing mentorship opportunities.", rating: 5 },
    { name: "Michael Chen", role: "Class of 2015, Entrepreneur", content: "The platform made it easy to organize our class reunion and stay connected with the community.", rating: 5 },
    { name: "Dr. Priya Sharma", role: "Class of 2008, Research Scientist", content: "I've been able to mentor several students through this platform. It's incredibly rewarding.", rating: 5 }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Welcome to <span>AlumniConnect</span></h1>
          <p>The centralized platform for alumni data management and engagement</p>
          <p>Connect with your alma mater, network with fellow alumni, participate in events, and contribute to the growth of your educational community through mentorship and collaboration.</p>
          
          <div className="hero-buttons">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get Started <ArrowRight className="icon-small" />
                </Link>
                <Link to="/login" className="btn btn-outline">
                  Login
                </Link>
              </>
            ) : (
              <Link
                to={
                  user?.role === 'admin'
                    ? '/admin-dashboard'
                    : user?.role === 'alumni'
                      ? '/alumni-dashboard'
                      : '/student-dashboard'
                }
                className="btn btn-primary"
              >
                Explore Platform <ArrowRight className="icon-small" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        {stats.map((stat, index) => (
          <div key={index}>
            <div className="number">{stat.number}</div>
            <div className="label">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2>Why Choose AlumniConnect?</h2>
          <p>Our platform provides comprehensive tools for alumni engagement, networking, and institutional growth.</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="section-header">
          <h2>Benefits for Everyone</h2>
          <p>AlumniConnect creates value for all stakeholders in the educational ecosystem.</p>
        </div>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="icon-circle"><GraduationCap className="icon" /></div>
            <h3>For Alumni</h3>
            <ul>
              <li><CheckCircle className="icon-small" /> Network with peers</li>
              <li><CheckCircle className="icon-small" /> Career opportunities</li>
              <li><CheckCircle className="icon-small" /> Stay connected</li>
            </ul>
          </div>

          <div className="benefit-card">
            <div className="icon-circle"><Users className="icon" /></div>
            <h3>For Students</h3>
            <ul>
              <li><CheckCircle className="icon-small" /> Mentorship programs</li>
              <li><CheckCircle className="icon-small" /> Internship opportunities</li>
              <li><CheckCircle className="icon-small" /> Career guidance</li>
            </ul>
          </div>

          <div className="benefit-card">
            <div className="icon-circle"><TrendingUp className="icon" /></div>
            <h3>For Institutions</h3>
            <ul>
              <li><CheckCircle className="icon-small" /> Enhanced reputation</li>
              <li><CheckCircle className="icon-small" /> Fundraising support</li>
              <li><CheckCircle className="icon-small" /> Community building</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="section-header">
          <h2>What Our Alumni Say</h2>
          <p>Hear from our community members about their AlumniConnect experience.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card">
              <div className="stars">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="icon-star" />
                ))}
              </div>
              <p>"{testimonial.content}"</p>
              <div>
                <div className="name">{testimonial.name}</div>
                <div className="role">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to Connect?</h2>
        <p>Join thousands of alumni who are already building stronger connections through AlumniConnect.</p>
        {!isAuthenticated && (
          <Link to="/register" className="btn btn-primary">
            Join Now <Heart className="icon-small" />
          </Link>
        )}
      </section>
    </div>
  );
};

export default Home;
