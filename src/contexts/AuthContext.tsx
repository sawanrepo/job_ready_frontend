import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
  is_google_oauth?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, full_name: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<boolean>;
  updateProfile: (fullName: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
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

  const fetchMe = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: data.id.toString(),
          email: data.email,
          full_name: data.full_name,
          is_google_oauth: data.is_google_oauth
        };
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
      } else if (response.status === 401) {
        // If unauthorized, token might be expired. logout.
        logout();
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    // Fix #11: await fetchMe before setting isLoading=false so protected routes
    // never briefly render with a stale/expired token still in localStorage.
    const init = async () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        try {
          setUser(JSON.parse(userData));  // optimistic local state
          await fetchMe();               // reconcile with server (clears user on 401)
        } catch (error) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data');
          setUser(null);
        }
      }
      setIsLoading(false);  // only unblock UI after server truth is known
    };
    init();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        localStorage.setItem('access_token', data.access_token);
        
        // Extract user info from the response
        const userData = {
          id: data.user_id.toString(),
          email: data.email || email,
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
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        const data = await response.json();
        
        localStorage.setItem('access_token', data.access_token);
        
        const userData = {
          id: data.user_id.toString(),
          email: data.email || email,
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

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast({
          title: "Reset Code Sent",
          description: "If an account exists with that email, a code has been sent.",
        });
        return true;
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Request failed",
          description: errorData.detail || "Failed to send reset code",
        });
        return false;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Request failed",
        description: "Network error. Please try again.",
      });
      return false;
    }
  };

  const resetPassword = async (email: string, otp: string, new_password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, new_password }),
      });

      if (response.ok) {
        toast({
          title: "Password Reset Successful",
          description: "You can now log in with your new password.",
        });
        return true;
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Reset failed",
          description: errorData.detail || "Failed to reset password",
        });
        return false;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: "Network error. Please try again.",
      });
      return false;
    }
  };

  const updateProfile = async (fullName: string): Promise<boolean> => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ full_name: fullName }),
      });

      if (response.ok) {
        await fetchMe();
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        return true;
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Update failed",
          description: errorData.detail || "Failed to update profile",
        });
        return false;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Network error. Please try again.",
      });
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });

      if (response.ok) {
        toast({
          title: "Password Changed",
          description: "Your password has been changed successfully.",
        });
        return true;
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Change failed",
          description: errorData.detail || "Failed to change password",
        });
        return false;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Change failed",
        description: "Network error. Please try again.",
      });
      return false;
    }
  };

  const googleLogin = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-auth`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const data = await response.json();
        
        localStorage.setItem('access_token', data.access_token);
        
        const userData = {
          id: data.user_id.toString(),
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
    console.log("Initiating Google login with Client ID:", clientId);
    console.log("All Vite Env:", import.meta.env);
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
    void fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => undefined);

    localStorage.removeItem('access_token');
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
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
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
