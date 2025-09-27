import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff, User, Lock, Mail, Shield, GraduationCap, Users } from 'lucide-react';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'alumni'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password, formData.role);
      if (result.success) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      value: 'alumni',
      label: 'Alumni',
      icon: <GraduationCap className="h-5 w-5" />,
      description: 'Graduated students'
    },
    {
      value: 'student',
      label: 'Current Student',
      icon: <Users className="h-5 w-5" />,
      description: 'Currently enrolled'
    },
    {
      value: 'admin',
      label: 'Administrator',
      icon: <Shield className="h-5 w-5" />,
      description: 'Platform administrator'
    }
  ];

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h2>Sign in to AlumniConnect</h2>
          <p>
            Or <Link to="/register" className="link">create a new account</Link>
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="role-selection">
            {roleOptions.map((option) => (
              <label
                key={option.value}
                className={`role-option ${formData.role === option.value ? 'active' : ''}`}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={formData.role === option.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="role-icon">{option.icon}</div>
                <div className="role-text">
                  <div className="role-label">{option.label}</div>
                  <div className="role-desc">{option.description}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Email Field */}
          <div className="input-group">
            <Mail className="input-icon" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="input-field"
            />
          </div>

          {/* Password Field */}
          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="input-field"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Remember & Forgot */}
          <div className="form-footer">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Signing in...' : <><User className="btn-icon" /> Sign in</>}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="demo-credentials">
          <h3>Demo Credentials:</h3>
          <div><strong>Admin:</strong> admin@alumniconnect.edu / admin123</div>
          <div><strong>Alumni:</strong> alumni@alumniconnect.edu / alumni123</div>
          <div><strong>Student:</strong> student@alumniconnect.edu / student123</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
