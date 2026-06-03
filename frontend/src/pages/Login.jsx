import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowLeft, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setErrorMsg('');
    
    const res = await login(email, password);
    setLoading(false);
    
    if (res.success) {
      if (res.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setErrorMsg(res.message || 'Login failed. Please verify credentials.');
    }
  };

  // Simulated Google Sign In for Hackathon Demonstrability
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    
    // Simulate a Google verification response payload
    const mockGooglePayload = {
      credential: 'mock_google_sso_token_xyz_123',
      email: 'john.doe.google@gmail.com',
      name: 'John Doe (Google)',
      imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
    };

    const res = await loginWithGoogle(mockGooglePayload);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.message || 'Google Authentication failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      
      {/* Glow Backdrops */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-100/35 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl p-8">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-xs font-bold mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        <div className="text-center mb-8">
          <h2 className="font-heading text-2xl font-extrabold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500 text-sm">Access your MediRoute patient file or admin portal</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@mediroute.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3.5 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-primary-500/10"
          >
            {loading ? 'Logging in...' : (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
          <span className="relative bg-white px-3 text-slate-400 text-xs font-semibold">Or continue with</span>
        </div>

        {/* Google SSO Button */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all text-sm shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.6-6.887 4.6-4.33 0-7.86-3.585-7.86-8s3.53-8 7.86-8c2.46 0 4.105 1.025 5.047 1.926l3.253-3.13C18.427 1.845 15.61.96 12.24.96c-6.14 0-11.11 4.97-11.11 11.11s4.97 11.11 11.11 11.11c6.41 0 10.67-4.505 10.67-10.86 0-.73-.08-1.285-.175-1.745H12.24z"/>
          </svg>
          Google Account
        </button>

        {/* Register Redirect */}
        <p className="mt-8 text-center text-slate-500 text-xs">
          New to MediRoute AI?{' '}
          <Link to="/signup" className="text-primary-500 font-bold hover:underline">
            Create an Account
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
