import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <main className="container my-5 flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </main>
    );
  }

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setMessage('');
    try {
      const response = await api.post(`${process.env.REACT_APP_BACKEND_URL}/signup`, { email, password });
      setOtpSent(true);
      setMessage('OTP sent to your email');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await api.post(`${process.env.REACT_APP_BACKEND_URL}/verify-otp`, { email, otp });
      setMessage('Account created successfully');
      // Handle success, e.g., redirect to login
    } catch (error) {
      setError(error.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <>
      <main className="container my-5 flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="row justify-content-center w-100">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-2-strong">
              <div className="card-body p-5">
                <div className="hero text-center mb-4">
                  <h2 className="fw-bold text-primary mb-2">Create Account</h2>
                  <p className="text-muted">Join Shahbaz Trades today</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {message && (
                  <div className="alert alert-success" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {message}
                  </div>
                )}

                {!otpSent ? (
                  <form onSubmit={handleSendOtp}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        <i className="fas fa-envelope me-1"></i>Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        <i className="fas fa-lock me-1"></i>Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        <i className="fas fa-lock me-1"></i>Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="d-grid">
                      <button className="btn btn-primary btn-lg" type="submit">
                        <i className="fas fa-user-plus me-2"></i>Send OTP
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp}>
                    <div className="mb-3">
                      <label htmlFor="otp" className="form-label">
                        <i className="fas fa-key me-1"></i>Enter 6-digit OTP
                      </label>
                      <input
                        type="text"
                        id="otp"
                        name="otp"
                        className="form-control"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength="6"
                        pattern="[0-9]{6}"
                      />
                    </div>

                    <div className="d-grid">
                      <button className="btn btn-success btn-lg" type="submit">
                        <i className="fas fa-check me-2"></i>Verify & Create Account
                      </button>
                    </div>
                  </form>
                )}

                {!otpSent && (
                  <div className="text-center mt-4">
                    <p className="mb-0">Already have an account?
                      <a href="/login" className="text-primary fw-bold">Sign in</a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Signup;
