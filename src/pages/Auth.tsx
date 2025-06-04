
import React, { useState } from 'react';
import { FileText, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

type AuthMode = 'login' | 'signup' | 'forgot-password';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { signUp, signIn, signInWithProvider, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'Passwords do not match' });
          return;
        }
        
        const { data, error } = await signUp(formData.email, formData.password, formData.fullName);
        
        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else {
          setMessage({ 
            type: 'success', 
            text: 'Account created! Please check your email to verify your account.' 
          });
        }
      } else if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setMessage({ type: 'error', text: 'Invalid email or password. Please try again.' });
          } else {
            setMessage({ type: 'error', text: error.message });
          }
        }
      } else if (mode === 'forgot-password') {
        const { error } = await resetPassword(formData.email);
        
        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else {
          setMessage({ 
            type: 'success', 
            text: 'Password reset link sent to your email!' 
          });
        }
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setMessage(null);
    
    const { error } = await signInWithProvider(provider);
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
    }
    
    setIsLoading(false);
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 'weak', color: 'bg-red-500', width: '33%' };
    if (password.length < 10) return { strength: 'medium', color: 'bg-yellow-500', width: '66%' };
    return { strength: 'strong', color: 'bg-green-500', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'forgot-password': return 'Reset Password';
      default: return 'Sign In';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup': return 'Start organizing your documents today';
      case 'forgot-password': return 'Enter your email to receive a reset link';
      default: return 'Continue to your document workspace';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 aurora-bg" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Logo and Branding */}
          <div className="text-center mb-8 animate-fade-in">
            <Link to="/" className="inline-block">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 logo-hover">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold gradient-text mb-2">DocuFlow</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {mode === 'login' ? 'Welcome back!' : mode === 'signup' ? 'Join DocuFlow today' : 'Reset your password'}
            </p>
          </div>

          {/* Main Form Card */}
          <div className="glass-effect dark:glass-effect-dark rounded-3xl p-8 animate-scale-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {getTitle()}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {getSubtitle()}
              </p>
            </div>

            {/* Success/Error Messages */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-900 dark:text-white font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="pl-12 h-12 rounded-xl border-2 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 dark:text-white font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-12 h-12 rounded-xl border-2 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {mode !== 'forgot-password' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900 dark:text-white font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-12 pr-12 h-12 rounded-xl border-2 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  {/* Password Strength Indicator for Signup */}
                  {mode === 'signup' && formData.password && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Password strength</span>
                        <span className={`font-medium ${
                          passwordStrength.strength === 'weak' ? 'text-red-500' :
                          passwordStrength.strength === 'medium' ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: passwordStrength.width }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-white font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-12 h-12 rounded-xl border-2 focus:border-blue-500 transition-all duration-200"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="text-right">
                  <button 
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-200 interactive-scale"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing in...' : mode === 'signup' ? 'Creating account...' : 'Sending reset link...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Social Login - Only show for login and signup */}
            {mode !== 'forgot-password' && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-background text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                    className="h-12 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('github')}
                    disabled={isLoading}
                    className="h-12 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </Button>
                </div>
              </div>
            )}

            {/* Toggle Auth Mode */}
            <div className="mt-6 text-center">
              {mode === 'forgot-password' ? (
                <p className="text-gray-600 dark:text-gray-400">
                  Remember your password?
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="ml-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="ml-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
