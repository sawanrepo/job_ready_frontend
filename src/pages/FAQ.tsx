import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Shield, Zap, FileText, Users, Clock } from 'lucide-react';

const FAQ = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "What is Job Ready?",
      answer: "Job Ready is an AI-powered platform designed to help job seekers optimize their resumes for success. We provide ATS compatibility analysis and resume tailoring services to help you stand out in today's competitive job market.",
    },
    {
      question: "Is my data secure?",
      answer: "Yes, your data security is our top priority. We do not store resumes permanently on our servers. All uploaded documents are processed securely and deleted after analysis. Your personal information is encrypted and protected according to industry standards.",
    },
    {
      question: "How do I tailor my resume?",
      answer: "Simply upload your current resume in PDF format and paste the job description you're targeting. Our AI will analyze both documents and create a tailored version that highlights relevant skills and experiences while maintaining your authentic professional voice.",
    },
    {
      question: "What is ATS compatibility?",
      answer: "ATS (Applicant Tracking System) compatibility refers to how well your resume can be read and ranked by automated systems that many companies use to screen applications. Our tool analyzes your resume against job requirements and provides a compatibility score with improvement suggestions.",
    },
    {
      question: "How accurate is the ATS scoring?",
      answer: "Our ATS scoring system is based on industry best practices and common ATS algorithms. While we strive for high accuracy, results may vary depending on the specific ATS system used by employers. Our tool provides valuable insights to improve your resume's performance across most systems.",
    },
    {
      question: "Can I use Job Ready for multiple job applications?",
      answer: "Absolutely! You can use Job Ready to tailor your resume for as many different job applications as needed. Each tailored resume is optimized for the specific job description you provide, maximizing your chances of success for each application.",
    },
    {
      question: "What file formats are supported?",
      answer: "Currently, we support PDF files for resume uploads. This ensures the best compatibility and formatting preservation during the analysis and tailoring process.",
    },
    {
      question: "How long does the analysis take?",
      answer: "Most analyses are completed within 30-60 seconds. Resume tailoring may take slightly longer depending on the complexity of the job description and resume content.",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze your resume for optimal job matching",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security",
    },
    {
      icon: Clock,
      title: "Instant Results",
      description: "Get your analysis and tailored resume in under a minute",
    },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-white shadow-soft border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-gradient font-poppins">FAQ & Support</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10">
              <HelpCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4 font-poppins">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about Job Ready
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="gradient-card border-0 text-center">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2 font-poppins">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Accordion */}
        <Card className="gradient-card border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-poppins">Common Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Card className="gradient-card border-0">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 font-poppins">
                Ready to Get Started?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of professionals who have successfully landed their dream jobs with Job Ready.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/register')}
                  className="gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  Get Started Today
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FAQ;