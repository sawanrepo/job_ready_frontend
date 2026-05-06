import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If no email is provided, redirect to forgot-password
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length !== 6) return;
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please ensure both passwords match exactly.",
      });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,16}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      toast({
        variant: "destructive",
        title: "Password doesn't meet requirements",
        description: "Password must be 8-16 characters long and include uppercase, lowercase, number, and special character.",
      });
      return;
    }
    
    setIsSubmitting(true);
    const success = await resetPassword(email, otp, formData.newPassword);
    if (success) {
      navigate('/login', { replace: true });
    }
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 font-poppins">Create New Password</h1>
          <p className="text-white/80 text-lg">Secure your account</p>
        </div>
        
        <Card className="shadow-strong gradient-card border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold font-poppins">Enter Reset Code & Password</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Please enter the 6-digit code sent to <br />
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center flex-col items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Reset Code</span>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={isSubmitting}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-10 h-12 sm:w-12 sm:h-14 text-lg" />
                    <InputOTPSlot index={1} className="w-10 h-12 sm:w-12 sm:h-14 text-lg" />
                    <InputOTPSlot index={2} className="w-10 h-12 sm:w-12 sm:h-14 text-lg" />
                    <InputOTPSlot index={3} className="w-10 h-12 sm:w-12 sm:h-14 text-lg" />
                    <InputOTPSlot index={4} className="w-10 h-12 sm:w-12 sm:h-14 text-lg" />
                    <InputOTPSlot index={5} className="w-10 h-12 sm:w-12 sm:h-14 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      name="newPassword"
                      placeholder="New Password (8-16 chars, A-z, 0-9, !@#)"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm New Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 gradient-primary hover:shadow-glow transition-all duration-300 font-semibold"
                disabled={isSubmitting || otp.length !== 6 || !formData.newPassword || !formData.confirmPassword}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center text-sm text-primary hover:underline font-medium">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
