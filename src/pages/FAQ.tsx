import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Shield, Zap, FileText, Users, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const FAQ = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
    {
      question: "How do Mock Interviews work?",
      answer: "Mock Interviews allow you to practice your skills in a simulated environment. You'll be presented with industry-standard questions and record your responses via video. Our AI then analyzes your communication, technical knowledge, and confidence to provide actionable feedback.",
    },
    {
      question: "What is a Rapid Fire Interview?",
      answer: "The Rapid Fire Interview is an audio-only session designed to test your quick thinking. You'll get 10 questions in quick succession, and you'll provide your answers using your microphone. It's a great way to build confidence and refine your verbal communication.",
    },
    {
      question: "Can I retake a question during an interview?",
      answer: "In the Mock Interview (Video), you have the option to 'Retake' your answer before submitting it for evaluation. However, in the Rapid Fire Interview (Audio), the emphasis is on quick response, so we encourage you to go with your first instinct!",
    },
    {
      question: "How do I see my interview performance?",
      answer: "After completing an interview, you'll be redirected to a detailed Results page. You'll see scores for communication, technical skills, problem-solving, and confidence, along with specific strengths, weaknesses, and suggestions for improvement.",
    },
    {
      question: "Do I need a camera for all interviews?",
      answer: "No. While the Mock Interview requires a camera for full video analysis, the Rapid Fire Interview is audio-only and only requires a working microphone. You can choose the format that best suits your practice needs.",
    },
    {
      question: "How do credits work?",
      answer: "Credits are feature-specific. ATS credits are used for ATS checks, resume tailoring credits are used for tailoring, audio interview credits are used for Rapid Fire interviews, and video interview credits are used for video mock interviews. Credits are deducted when a feature starts processing.",
    },
    {
      question: "When are purchased credits added to my account?",
      answer: "Purchased credits are added only after the payment is verified successfully by Razorpay and Job Ready confirms that.",
    },
    {
      question: "What should I do if payment succeeds but credits are not added?",
      answer: "Please note the payment or order ID shown by Razorpay and contact support from the same registered email address. If the issue is caused by Job Ready or payment verification, we will investigate and may add credits or restore access after verification.",
    },
    {
      question: "Can I get a refund after using a credit?",
      answer: "Credits used for completed digital services are generally non-refundable because AI processing starts immediately. If a technical issue on Job Ready prevents completion after a credit is deducted, we may restore the credit after reviewing the issue.",
    },
    {
      question: "What happens if I run out of time during a video interview question?",
      answer: "If you recorded an answer, the system will submit the available recording when time expires. If you did not record anything, the question is marked as not answered within the time limit and the interview continues to the next question.",
    },
    {
      question: "What happens if I disconnect during an interview?",
      answer: "You can resume an unfinished active session from the interview setup page. Video interviews may provide limited resume grace for genuine interruptions, but refreshing repeatedly will not continuously extend your timer.",
    },
    {
      question: "Why is fullscreen required during interviews?",
      answer: "Fullscreen mode helps maintain a focused practice environment. Exiting fullscreen, switching tabs, or similar activity may trigger warnings. Too many warnings can end the interview and prevent result generation.",
    },
    {
      question: "Are interview warnings reversible?",
      answer: "Warnings are generated from interview activity such as fullscreen exit or tab changes. They are not automatically reversible during the session. If you believe a technical issue caused a warning, contact support with details after the session.",
    },
    {
      question: "Does Job Ready guarantee a job or interview call?",
      answer: "No. Job Ready provides preparation tools, feedback, resume analysis, and practice interviews. Hiring decisions depend on employers, market conditions, your profile, and many factors outside the platform.",
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
                {isAuthenticated ? (
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="gradient-primary hover:shadow-glow transition-all duration-300"
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
