import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AuthWrapper from './shared/AuthWrapper';
import StatusAlert from './shared/StatusAlert';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const response = await authAPI.login(email, password);
      if (response.status === 200) {
        login(response.data.data);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <AuthWrapper
      title="Welcome Back"
      subtitle="Sign in to continue your trading journey"
      isLogin={true}
    >
      <StatusAlert error={error} className="mb-6" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="email">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              id="email"
              type="email"
              required
              className="input pl-12 h-14 bg-muted/30 border-border/50 focus:bg-background transition-all rounded-2xl font-semibold"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="password">
            Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              className="input pl-12 pr-12 h-14 bg-muted/30 border-border/50 focus:bg-background transition-all rounded-2xl font-semibold"
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

        <div className="text-right px-1">
          <Link
            to="/forgot-password"
            className="text-xs font-black text-primary hover:underline underline-offset-4 tracking-tight"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
        >
          <LogIn className="mr-2 h-5 w-5" />
          Sign In
        </button>
      </form>

      <div className="text-center mt-8">
        <p className="text-sm font-semibold text-muted-foreground">
          New to Shahbaz Trades?{' '}
          <Link to="/signup" className="text-primary font-black hover:underline underline-offset-4 transition-colors">
            Create Account
          </Link>
        </p>
      </div>
    </AuthWrapper>
  );
};

export default Login;