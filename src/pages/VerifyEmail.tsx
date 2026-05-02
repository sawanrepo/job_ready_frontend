import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { verifyOtp, resendOtp, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If no email is provided, redirect to register
    if (!email) {
      navigate('/register', { replace: true });
    }
    
    // If already authenticated, redirect to dashboard
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [email, isAuthenticated, authLoading, navigate]);

  // Timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length !== 6) return;
    
    setIsVerifying(true);
    const success = await verifyOtp(email, otp);
    if (success) {
      navigate('/dashboard', { replace: true });
    }
    setIsVerifying(false);
  };

  const handleResend = async () => {
    if (!email || countdown > 0) return;
    
    setIsResending(true);
    const success = await resendOtp(email);
    if (success) {
      setCountdown(120); // 2 minutes cooldown
    }
    setIsResending(false);
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 font-poppins">Verify Your Email</h1>
          <p className="text-white/80 text-lg">We've sent a code to your inbox</p>
        </div>
        
        <Card className="shadow-strong gradient-card border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold font-poppins">Enter OTP</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Please enter the 6-digit code sent to <br />
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={isVerifying}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 gradient-primary hover:shadow-glow transition-all duration-300 font-semibold"
                disabled={isVerifying || otp.length !== 6}
              >
                {isVerifying ? 'Verifying...' : 'Verify Email'}
                {!isVerifying && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
            
            <div className="mt-6 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={isResending || countdown > 0}
                className="w-full h-10 border-primary/20 hover:bg-primary/5"
              >
                {isResending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : countdown > 0 ? (
                  `Resend code in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
                ) : (
                  'Resend Code'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
