import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  User, 
  Save, 
  Key, 
  Check, 
  UserPlus, 
  Lock, 
  BadgeCheck, 
  ShieldCheck, 
  Fingerprint,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userPreferenceAPI, userAPI } from '../api/axios';
import StatusAlert from './shared/StatusAlert';
import { cn } from '../lib/utils';

const Settings = () => {
  const { user, login, appConfig, refreshUserData } = useAuth();
  const { auth } = appConfig;

  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setUserId(user.userId || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const isEmailPresent = user?.email && user.email !== '';

  const handleUpdateUsername = async (e) => {
    if (e) e.preventDefault();

    const usernameRegex = /^[a-z0-9]+$/;
    if (!usernameRegex.test(username)) {
      setProfileError('Username can only contain lowercase letters and numbers');
      return;
    }

    setProfileSuccess('');
    setProfileError('');
    setLoading(true);
    try {
      const response = await userPreferenceAPI.updateUsername(userId, username);
      if (response.status === 200 && response.data.success) {
        await login({ ...user, username: username })
        setProfileSuccess('Username updated successfully');
      } else {
        setProfileError(response.data.error || 'Failed to update settings');
      }
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSecurityError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setSecurityError('Passwords do not match');
      return;
    }
    setSecurityError('');
    setSecuritySuccess('');
    setLoading(true);
    try {
      const response = await userAPI.linkEmail(userId, email, password, confirmPassword);
      if (response.status === 200) {
        setOtpSent(response.data.data.otpSent);
        setSecuritySuccess('Verification OTP sent successfully');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setOtpSent(true);
        setSecuritySuccess('OTP sent to ' + email);
      } else {
        setSecurityError(error.response?.data?.message || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');
    setLoading(true);
    try {
      const response = await userAPI.verifyUpdateOtp(email, otp);
      if (response.status === 201 || response.status === 200) {
        setSecuritySuccess('Email linked successfully');
        setOtpSent(false);
        setPassword('');
        setConfirmPassword('');
        setOtp('');
        await refreshUserData();
      } else {
        setSecurityError(response.data.message || 'Verification failed');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setOtpSent(true);
        setSecuritySuccess('OTP already sent to ' + email);
        return
      }
      setSecurityError(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-8 md:pt-16 pb-20">
      <div className="container mx-auto px-4 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* PROFILE HEADER */}
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-primary/20 border-4 border-card overflow-hidden">
                {user?.profile ? (
                  <img src={user.profile} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  username?.charAt(0).toUpperCase() || <User size={40} />
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center border-2 border-card shadow-lg">
                <Fingerprint size={16} />
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-1">Account Settings</h1>
            <p className="text-sm font-medium text-muted-foreground">Manage your profile and security credentials</p>
          </div>

          <div className="space-y-8">
            {/* PERSONAL INFO SECTION */}
            <div className="p-8 rounded-[2.5rem] bg-card border border-border shadow-xl shadow-black/5">
              <div className="flex items-center gap-3 mb-8">
                <BadgeCheck className="text-primary h-6 w-6" />
                <h2 className="text-xl font-black tracking-tight">Personal Info</h2>
              </div>

              <form onSubmit={handleUpdateUsername} className="space-y-6">
                <StatusAlert success={profileSuccess} error={profileError} className="mb-6" />

                {auth.email && (
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                    <div className="relative opacity-60">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="email"
                        disabled
                        className="input pl-12 h-14 rounded-2xl bg-muted/50 border-border cursor-not-allowed"
                        value={user?.email || 'Not Provided'}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Username</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      required
                      className="input pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:bg-background transition-all"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                  Save Changes
                </button>
              </form>
            </div>

            {/* SECURITY SECTION */}
            {auth.email && !isEmailPresent && (
              <div className="p-8 rounded-[2.5rem] bg-card border border-border shadow-xl shadow-black/5">
                <div className="flex items-center gap-3 mb-8">
                  <ShieldCheck className="text-primary h-6 w-6" />
                  <h2 className="text-xl font-black tracking-tight">
                    {otpSent ? "Verify Security" : "Security Linking"}
                  </h2>
                </div>

                <StatusAlert success={securitySuccess} error={securityError} className="mb-6" />

                <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-6">
                  {!otpSent ? (
                    <>
                      <p className="text-sm font-medium text-muted-foreground mb-2 px-1">
                        Secure your account access by linking a verified email address.
                      </p>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Link Email</label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                              type="email"
                              required
                              className="input pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:bg-background"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                              type="password"
                              required
                              className="input pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:bg-background"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                              type="password"
                              required
                              className="input pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:bg-background"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                      >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2" />}
                        Initialize Verification
                      </button>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-4 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20">
                        A 6-digit code has been sent to <span className="underline">{email}</span>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Verification Code</label>
                        <div className="relative">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <input
                            type="text"
                            required
                            maxLength={6}
                            className="input pl-12 h-16 text-center text-2xl font-black tracking-[0.8em] rounded-2xl bg-muted/30 border-border/50 focus:bg-background"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                      >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />}
                        Complete Linking
                      </button>

                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="w-full text-sm font-black text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
                      >
                        <ChevronLeft size={16} /> Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;