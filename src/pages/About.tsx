import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Instagram, 
  Linkedin, 
  Mail, 
  ArrowLeft,
  Target,
  Users,
  Award,
  Zap
} from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  const handleSocialClick = (platform: string) => {
    // These would be replaced with actual social media URLs
    const urls = {
      instagram: 'https://instagram.com/jobready',
      linkedin: 'https://linkedin.com/company/jobready',
      email: 'mailto:hello@jobready.com'
    };
    
    if (platform === 'email') {
      window.location.href = urls.email;
    } else {
      window.open(urls[platform as keyof typeof urls], '_blank');
    }
  };

  const handleFeedback = () => {
    // This would open a feedback form or redirect to a feedback system
    window.open('mailto:feedback@jobready.com?subject=Feedback for Job Ready', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold font-poppins">About Job Ready</h1>
          </div>
        </header>

        <div className="container py-12 space-y-12">
          {/* Hero Section */}
          <section className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold font-poppins gradient-text">
              Empowering Your Career Journey
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Job Ready is your ultimate companion in the competitive job market. We leverage cutting-edge AI 
              to help professionals create standout resumes and increase their chances of landing dream jobs.
            </p>
          </section>

          {/* Product Details */}
          <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-md transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>ATS Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Our AI analyzes your resume against ATS systems, ensuring maximum compatibility and visibility.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-md transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Tailoring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Instantly customize your resume for any job description with AI-powered content adaptation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-md transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Expert Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Get professional feedback and industry best practices to enhance your job application strategy.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-md transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Success Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Monitor your application success rate and continuously improve your job search strategy.
                </CardDescription>
              </CardContent>
            </Card>
          </section>

          {/* Mission Statement */}
          <section className="bg-secondary/30 rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-3xl font-bold mb-6 font-poppins">Our Mission</h3>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              We believe everyone deserves a fair chance at their dream job. Our mission is to democratize 
              access to professional resume optimization tools, helping job seekers of all backgrounds 
              compete effectively in today's digital-first hiring landscape.
            </p>
          </section>

          {/* Contact & Social Section */}
          <section className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-4 font-poppins">Connect With Us</h3>
              <p className="text-muted-foreground">
                We'd love to hear from you. Reach out for feedback, questions, or just to say hello!
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Button
                onClick={handleFeedback}
                variant="outline"
                size="lg"
                className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-primary/5 transition-colors"
              >
                <MessageSquare className="h-8 w-8 text-primary" />
                <div className="space-y-1">
                  <div className="font-semibold">Give Feedback</div>
                  <div className="text-sm text-muted-foreground">Share your thoughts</div>
                </div>
              </Button>

              <Button
                onClick={() => handleSocialClick('instagram')}
                variant="outline"
                size="lg"
                className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-primary/5 transition-colors"
              >
                <Instagram className="h-8 w-8 text-primary" />
                <div className="space-y-1">
                  <div className="font-semibold">Instagram</div>
                  <div className="text-sm text-muted-foreground">Follow our journey</div>
                </div>
              </Button>

              <Button
                onClick={() => handleSocialClick('linkedin')}
                variant="outline"
                size="lg"
                className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-primary/5 transition-colors"
              >
                <Linkedin className="h-8 w-8 text-primary" />
                <div className="space-y-1">
                  <div className="font-semibold">LinkedIn</div>
                  <div className="text-sm text-muted-foreground">Professional updates</div>
                </div>
              </Button>

              <Button
                onClick={() => handleSocialClick('email')}
                variant="outline"
                size="lg"
                className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-primary/5 transition-colors"
              >
                <Mail className="h-8 w-8 text-primary" />
                <div className="space-y-1">
                  <div className="font-semibold">Email Us</div>
                  <div className="text-sm text-muted-foreground">Direct contact</div>
                </div>
              </Button>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12">
            <h3 className="text-3xl font-bold mb-4 font-poppins">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their careers with Job Ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/register')}
                size="lg"
                className="gradient-primary hover:shadow-glow transition-all duration-300"
              >
                Get Started Free
              </Button>
              <Button 
                onClick={() => navigate('/login')}
                variant="outline"
                size="lg"
              >
                Sign In
              </Button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;