import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/FeatureCard';
import { useNavigate } from 'react-router-dom';
import { FileSearch, Zap, HelpCircle, ArrowRight, Info, ShoppingBag } from 'lucide-react';
import Footer from '@/components/Footer';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-white font-bold text-xl font-poppins">Job Ready</div>
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/about')}
              className="text-white hover:bg-white/10"
            >
              <Info className="h-4 w-4 mr-2" />
              About Us
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/shop')}
              className="text-white hover:bg-white/10"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Shop
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/faq')}
              className="text-white hover:bg-white/10"
            >
              FAQ
            </Button>

          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative gradient-hero py-24 px-4 text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="animate-float">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-poppins">
              Job Ready
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 font-medium">
              We make you Job Ready
            </p>
            <p className="text-lg mb-10 text-white/80 max-w-2xl mx-auto leading-relaxed">
              Transform your career with AI-powered resume analysis and tailoring. 
              Stand out in the competitive job market with resumes optimized for success.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/login')}
              className="bg-white text-primary hover:bg-white/90 shadow-strong font-semibold px-8"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-600 font-semibold px-8 transition-all duration-300"
            >
              Join Today
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-poppins">
              Your Career Success Toolkit
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to give you the competitive edge in today's job market
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="ATS Resume Check"
              description="Analyze your resume for job match compatibility and get detailed feedback on how to improve your ATS score."
              icon={FileSearch}
              actionText="Check Your Resume"
              actionPath="/ats-check"
              gradient
            />
            
            <FeatureCard
              title="Resume Tailoring"
              description="Create job-specific resumes instantly. Our AI adapts your experience to match any job description perfectly."
              icon={Zap}
              actionText="Tailor Resume"
              actionPath="/tailor-resume"
              gradient
            />
            
            <FeatureCard
              title="FAQ & Support"
              description="Find answers to common questions and learn best practices for job applications and resume optimization."
              icon={HelpCircle}
              actionText="Get Help"
              actionPath="/faq"
              gradient
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have successfully landed their dream jobs with Job Ready.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/register')}
            className="gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-3 text-lg font-semibold"
          >
            Start Your Journey
          </Button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Landing;