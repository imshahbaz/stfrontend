import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Key, UserPlus, Check, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { userAPI } from '../api/axios';
import AuthWrapper from './shared/AuthWrapper';
import StatusAlert from './shared/StatusAlert';
import { cn } from '../lib/utils';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setMessage('');
    try {
      const response = await userAPI.signup(email, password, confirmPassword);
      if (response.status === 200) {
        setOtpSent(response.data.data.otpSent);
        setMessage(response.data.message || 'OTP sent to your email');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setOtpSent(true);
        setMessage('OTP sent to ' + email);
      } else {
        setError(error.response?.data?.message || 'Failed to send OTP');
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await userAPI.verifyOtp(email, otp);
      if (response.status === 201 || response.status === 200) {
        navigate('/login');
      } else {
        setError(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <AuthWrapper
      title="Create Account"
      subtitle="Join the elite community of traders"
      isLogin={false}
    >
      <StatusAlert success={message} error={error} className="mb-6" />

      {!otpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                required
                className="input pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:bg-background"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="input pl-12 pr-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:bg-background"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="input pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:bg-background"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="space-y-2 text-center">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Enter 6-digit OTP</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                required
                maxLength={6}
                className="input pl-12 h-16 text-center text-2xl font-black tracking-[1em] rounded-2xl bg-muted/30 border-border/50 focus:bg-background"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn w-full h-14 rounded-2xl text-lg font-black bg-green-500 text-white shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Check className="mr-2 h-5 w-5" />
            Verify & Create
          </button>

          <button
            type="button"
            onClick={() => setOtpSent(false)}
            className="w-full text-sm font-black text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <ChevronLeft size={16} /> Change Email / Try Again
          </button>
        </form>
      )}

      {!otpSent && (
        <div className="text-center mt-8">
          <p className="text-sm font-semibold text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-black hover:underline underline-offset-4 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </AuthWrapper>
  );
};

export default Signup;