import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-primary/10 py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <img src="/logo.png" alt="Job Ready" className="h-14 w-auto object-contain" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering your career journey with AI-driven insights and tools. Get Job Ready today.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 font-poppins text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">Shop</Link></li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold mb-4 font-poppins text-foreground">Tools</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/ats-check" className="text-muted-foreground hover:text-primary transition-colors">ATS Check</Link></li>
              <li><Link to="/tailor-resume" className="text-muted-foreground hover:text-primary transition-colors">Resume Tailor</Link></li>
              <li><Link to="/interview" className="text-muted-foreground hover:text-primary transition-colors">Mock Interview</Link></li>
              <li><Link to="/audio-interview" className="text-muted-foreground hover:text-primary transition-colors">Audio Interview</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 font-poppins text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="text-muted-foreground hover:text-primary transition-colors">Refund Policy</Link></li>
              <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><a href="mailto:support@jobreadyai.in" className="text-muted-foreground hover:text-primary transition-colors">Support</a></li>
              <li><a href="mailto:contact@jobreadyai.in" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
              <li><a href="mailto:feedback@jobreadyai.in" className="text-muted-foreground hover:text-primary transition-colors">Feedback</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary/5 text-center text-sm text-muted-foreground">
          <p>© {currentYear} Job Ready. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
