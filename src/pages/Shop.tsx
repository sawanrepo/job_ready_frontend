import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ShoppingBag, 
  Zap, 
  FileSearch, 
  Mic, 
  Video, 
  Check, 
  Sparkles, 
  TrendingUp, 
  Rocket, 
  Crown,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';


interface PackItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  icon: any;
  items: string[];
  popular?: boolean;
  limitedOffer?: boolean;
  offerSummary?: {
    old: string;
    current: string;
  };
  color: string;
  bg: string;
}

const Shop = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    status: 'success' | 'error';
    title: string;
    message: string;
  }>({
    open: false,
    status: 'success',
    title: '',
    message: '',
  });
  const { user } = useAuth();

  const showPaymentDialog = (status: 'success' | 'error', title: string, message: string) => {
    setPaymentDialog({ open: true, status, title, message });
  };

  const individualPacks: PackItem[] = [
    {
      id: 'ats_one_time',
      name: 'ATS Check',
      description: 'Single detailed ATS scan',
      price: 9,
      icon: FileSearch,
      items: ['3 ATS Compatibility Reports', 'Keyword Optimization Tips'],
      limitedOffer: true,
      offerSummary: { old: '1 ATS check', current: '3 ATS checks' },
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      id: 'tailor_one_time',
      name: 'Resume Tailor',
      description: 'AI-powered job tailoring',
      price: 19,
      icon: Zap,
      items: ['3 Professionally Tailored PDFs', 'Targeted Keyword Injection'],
      limitedOffer: true,
      offerSummary: { old: '1 resume tailor', current: '3 resume tailors' },
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      id: 'audio_one_time',
      name: 'Audio Interview',
      description: 'Quick AI audio practice',
      price: 39,
      icon: Mic,
      items: ['3 Rapid-Fire Sessions', 'Detailed Audio Feedback'],
      limitedOffer: true,
      offerSummary: { old: '1 rapid interview', current: '3 rapid interviews' },
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      id: 'video_one_time',
      name: 'Video Interview',
      description: 'Full video mock session',
      price: 39,
      originalPrice: 89,
      icon: Video,
      items: ['1 Full Mock Interview', 'AI Behavioral Analysis'],
      limitedOffer: true,
      color: 'text-red-600',
      bg: 'bg-red-50'
    }
  ];

  const bundles: PackItem[] = [
    {
      id: 'starter_pack',
      name: 'Starter Pack',
      description: 'Perfect for your first application',
      price: 13,
      originalPrice: 39,
      icon: TrendingUp,
      items: ['3 ATS Checks', '1 Resume Tailoring'],
      popular: true,
      limitedOffer: true,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      id: 'resume_boost_pack',
      name: 'Resume Boost',
      description: 'Optimize multiple versions',
      price: 25,
      originalPrice: 89,
      icon: Rocket,
      items: ['5 ATS Checks', '3 Resume Tailorings'],
      limitedOffer: true,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      id: 'interview_pack',
      name: 'Interview Ready',
      description: 'Ace the speaking rounds',
      price: 49,
      originalPrice: 139,
      icon: Crown,
      items: ['2 Audio Interviews', '1 Video Interview'],
      limitedOffer: true,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      id: 'combo_pack',
      name: 'Ultimate Combo',
      description: 'Full career transformation',
      price: 99,
      originalPrice: 249,
      icon: Sparkles,
      items: ['5 ATS Checks', '5 Tailorings', '2 Audio', '1 Video'],
      limitedOffer: true,
      color: 'text-pink-600',
      bg: 'bg-pink-50'
    }
  ];

  const handlePurchase = async (packId: string) => {
    setLoading(packId);
    try {
      const orderData = await apiClient.createOrder(packId);
      
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: "INR",
        name: "Job Ready",
        description: `Purchase ${packId.replace('_', ' ')}`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            await apiClient.verifyPayment({
              ...response,
              plan_name: packId
            });
            showPaymentDialog(
              'success',
              'Credits Added Successfully',
              'Your purchased credits have been added to your account.'
            );
          } catch (error: any) {
            showPaymentDialog(
              'error',
              'Credits Not Added',
              `Failed to add credits due to: ${error.message || 'Something went wrong with payment verification.'}`
            );
          }
        },
        prefill: {
          name: user?.full_name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      showPaymentDialog(
        'error',
        'Order Creation Failed',
        error.message || 'Could not initiate payment.'
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-secondary/30">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">

        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1 text-sm rounded-full">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Job Ready Store
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins text-gradient">
            Power Up Your Career
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from individual packs or save more with our hand-picked value bundles
          </p>
          <Badge className="mt-4 bg-amber-100 text-amber-700 border border-amber-200 px-4 py-1 rounded-full">
            Limited offer for early users
          </Badge>
        </div>

        {/* Value Bundles */}
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold font-poppins">Value Bundles</h2>
            <Badge variant="outline" className="ml-2 border-primary/20 text-primary">Best Savings</Badge>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bundles.map((pack) => (
              <Card 
                key={pack.id} 
                className={`relative group transition-all duration-300 hover:shadow-strong hover:-translate-y-1 gradient-card border-0 overflow-hidden ${pack.popular ? 'ring-2 ring-primary/20' : ''}`}
              >
                {pack.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg shadow-soft">
                      Popular
                    </div>
                  </div>
                )}
                <CardHeader>
                  <div className={`p-3 rounded-xl ${pack.bg} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                    <pack.icon className={`h-6 w-6 ${pack.color}`} />
                  </div>
                  {pack.limitedOffer && (
                    <Badge className="mb-3 w-fit bg-amber-100 text-amber-700 border border-amber-200 text-[10px] uppercase tracking-wider">
                      Limited Offer
                    </Badge>
                  )}
                  <CardTitle className="font-poppins">{pack.name}</CardTitle>
                  <CardDescription>{pack.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    {pack.originalPrice && (
                      <span className="text-sm font-semibold text-muted-foreground line-through">Rs. {pack.originalPrice}</span>
                    )}
                    <span className="text-3xl font-bold">Rs. {pack.price}</span>
                  </div>
                  <ul className="space-y-2">
                    {pack.items.map((item, i) => (
                      <li key={i} className="flex items-center text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full gradient-primary hover:shadow-glow"
                    onClick={() => handlePurchase(pack.id)}
                    disabled={loading === pack.id}
                  >
                    {loading === pack.id ? 'Processing...' : 'Buy Bundle'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Individual Packs */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold font-poppins">Individual Packs</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {individualPacks.map((pack) => (
              <Card 
                key={pack.id} 
                className="group transition-all duration-300 hover:shadow-strong hover:-translate-y-1 bg-white/50 backdrop-blur-sm border-primary/10"
              >
                <CardHeader className="pb-4">
                  <div className={`p-3 rounded-xl ${pack.bg} w-fit mb-4`}>
                    <pack.icon className={`h-6 w-6 ${pack.color}`} />
                  </div>
                  {pack.limitedOffer && (
                    <Badge className="mb-3 w-fit bg-amber-100 text-amber-700 border border-amber-200 text-[10px] uppercase tracking-wider">
                      Limited Offer
                    </Badge>
                  )}
                  <CardTitle className="text-lg font-poppins">{pack.name}</CardTitle>
                  <CardDescription className="text-xs">{pack.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-baseline gap-2">
                    {pack.originalPrice && (
                      <span className="text-sm font-semibold text-muted-foreground line-through">Rs. {pack.originalPrice}</span>
                    )}
                    <span className="text-2xl font-bold">Rs. {pack.price}</span>
                  </div>
                  {pack.offerSummary && (
                    <div className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                      <span className="line-through text-muted-foreground">{pack.offerSummary.old}</span>
                      <span className="mx-2">-&gt;</span>
                      <span>{pack.offerSummary.current}</span>
                    </div>
                  )}
                  <ul className="space-y-2 mb-2">
                    {pack.items.map((item, i) => (
                      <li key={i} className="flex items-center text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-primary mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/20 hover:bg-primary/5 group-hover:bg-primary group-hover:text-white transition-all"
                    onClick={() => handlePurchase(pack.id)}
                    disabled={loading === pack.id}
                  >
                    {loading === pack.id ? '...' : 'Purchase'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-16 text-center text-muted-foreground text-sm flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Secure payments via Razorpay</span>
          </div>
          <p className="max-w-md">
            Purchased credits are added to your account instantly and never expire. 
            Individual packs are perfect for one-time needs, while bundles offer significant savings.
          </p>
        </div>
      </div>
      <Dialog
        open={paymentDialog.open}
        onOpenChange={(open) => setPaymentDialog((current) => ({ ...current, open }))}
      >
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="items-center text-center">
            <div className={`mb-2 flex h-14 w-14 items-center justify-center rounded-full ${paymentDialog.status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
              {paymentDialog.status === 'success' ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            <DialogTitle className="font-poppins text-2xl">{paymentDialog.title}</DialogTitle>
            <DialogDescription className="text-center text-base leading-relaxed">
              {paymentDialog.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              className="min-w-[120px] gradient-primary"
              onClick={() => setPaymentDialog((current) => ({ ...current, open: false }))}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shop;
