import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileSearch, Zap, Download, LogOut, User, Video } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: FileSearch,
      title: 'ATS Resume Check',
      description: 'Analyze your resume compatibility with job descriptions',
      path: '/ats-check',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Zap,
      title: 'Tailor Resume',
      description: 'Create job-specific resumes instantly with AI',
      path: '/tailor-resume',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      icon: Download,
      title: 'Download History',
      description: 'Access your previously tailored resumes',
      path: '/downloads',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: Video,
      title: 'Mock Interview',
      description: 'Practice with AI-driven video mock interviews',
      path: '/interview',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-white shadow-soft border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gradient font-poppins">Job Ready</h1>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Welcome, {user?.full_name}</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/settings')}
              className="text-muted-foreground hover:text-foreground"
            >
              Settings
            </Button>
            <Button
              variant="outline"
              onClick={logout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 font-poppins">
            Welcome back, {user?.full_name}!
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose a tool to accelerate your job search
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group cursor-pointer transition-all duration-300 hover:shadow-strong hover:-translate-y-2 gradient-card border-0"
              onClick={() => navigate(feature.path)}
            >
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className={`p-4 rounded-full ${feature.bg} group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-3 font-poppins">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <Button
                  className="w-full gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Card className="gradient-card border-0 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold mb-4 font-poppins">
                Need Help Getting Started?
              </h3>
              <p className="text-muted-foreground mb-6">
                Check out our FAQ section for tips and best practices
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/faq')}
                className="hover:bg-primary hover:text-primary-foreground"
              >
                Visit FAQ
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;