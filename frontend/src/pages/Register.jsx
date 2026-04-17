import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff, GraduationCap, Users, Shield } from 'lucide-react';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'alumni', phone: '', location: '', graduationYear: '',
    fieldOfStudy: '', currentPosition: '', company: '',
    studentId: '', department: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData);
      if (result.success) {
        toast.success('Registration successful!');
        const role = result.role;
        if (role === 'admin') navigate('/admin-dashboard');
        else if (role === 'alumni') navigate('/alumni-dashboard');
        else navigate('/student-dashboard');
      } else toast.error(result.error);
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'alumni', label: 'Alumni', icon: <GraduationCap />, description: 'Graduated students' },
    { value: 'currentStudent', label: 'Current Student', icon: <Users />, description: 'Currently enrolled' },
    { value: 'admin', label: 'Administrator', icon: <Shield />, description: 'Platform administrator' }
  ];

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Join AlumniConnect</h2>
          <p>Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-500">Sign in here</Link></p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {/* Role selection */}
          <div className="role-selection">
            {roleOptions.map((role) => (
              <div
                key={role.value}
                className={`role-option ${formData.role === role.value ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, role: role.value})}
              >
                <div className="icon">{role.icon}</div>
                <div>
                  <div>{role.label}</div>
                  <div style={{fontSize: '0.75rem', color: formData.role === role.value ? '#2563eb' : '#6b7280'}}>{role.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Name & Email */}
          <label>Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required />
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />

          {/* Phone & Location */}
          <label>Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" />
          <label>Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Enter your location" />

          {/* Alumni fields */}
          {formData.role === 'alumni' && (
            <>
              <label>Graduation Year</label>
              <input type="number" name="graduationYear" value={formData.graduationYear} onChange={handleChange} placeholder="e.g., 2020" />
              <label>Field of Study</label>
              <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} placeholder="e.g., Computer Science" />
              <label>Current Position</label>
              <input type="text" name="currentPosition" value={formData.currentPosition} onChange={handleChange} placeholder="e.g., Software Engineer" />
              <label>Company</label>
              <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="e.g., Google" />
            </>
          )}

          {/* Student fields */}
          {(formData.role === 'currentStudent' || formData.role === 'student') && (
            <>
              <label>Student ID</label>
              <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} placeholder="Enter your student ID" />
              <label>Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g., Computer Science" />
            </>
          )}

          {/* Password */}
          <label>Password</label>
          <div style={{position: 'relative'}}>
            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required />
            <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff /> : <Eye />}
            </span>
          </div>

          <label>Confirm Password</label>
          <div style={{position: 'relative'}}>
            <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required />
            <span className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </span>
          </div>

<div className="terms">
  <label htmlFor="terms">
    <input type="checkbox" id="terms" name="terms" required />
    I agree to the <span>Terms and Conditions</span> and <span>Privacy Policy</span>
  </label>
</div>





          {/* Submit */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
