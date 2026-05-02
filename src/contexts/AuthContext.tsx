import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, full_name: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  googleLogin: (code: string) => Promise<boolean>;
  initiateGoogleLogin: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        
        // Extract user info from the response
        const userData = {
          id: data.user_id || '1',
          email: email,
          full_name: data.full_name || 'User'
        };
        
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        
        return true;
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Login failed",
          description: errorData.detail || "Invalid credentials",
        });
        return false;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Network error. Please try again.",
      });
      return false;
    }
  };

  const register = async (email: string, password: string, full_name: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          full_name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        toast({
          title: "Registration successful!",
          description: "Please check your email for the verification code.",
        });
        
        return true;
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: errorData.detail || "Registration failed",
        });
        return false;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Network error. Please try again.",
      });
      return false;
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        const data = await response.json();
        
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        
        const userData = {
          id: data.user_id || '1',
          email: email,
          full_name: data.full_name || 'User'
        };
        
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        
        toast({
          title: "Email verified!",
          description: "You have successfully verified your email.",
        });
        
        return true;
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: errorData.detail || "Invalid code",
        });
        return false;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "Network error. Please try again.",
      });
      return false;
    }
  };

  const resendOtp = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your email.",
        });
        return true;
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Resend failed",
          description: errorData.detail || "Failed to resend code",
        });
        return false;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Resend failed",
        description: "Network error. Please try again.",
      });
      return false;
    }
  };

  const googleLogin = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const data = await response.json();
        
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        
        const userData = {
          id: data.user_id || '1',
          email: data.email || 'user@gmail.com',
          full_name: data.full_name || 'User'
        };
        
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        
        toast({
          title: "Welcome!",
          description: "You have successfully logged in with Google.",
        });
        
        return true;
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Google login failed",
          description: errorData.detail || "Google authentication failed",
        });
        return false;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Google login failed",
        description: "Network error. Please try again.",
      });
      return false;
    }
  };

  const initiateGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/login`;
    const scope = 'email profile';
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = googleAuthUrl;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
    
    // Clear browser history to prevent forward navigation to protected routes
    window.history.replaceState(null, '', '/login');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    verifyOtp,
    resendOtp,
    googleLogin,
    initiateGoogleLogin,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};