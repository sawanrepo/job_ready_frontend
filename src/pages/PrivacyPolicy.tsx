import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-2xl shadow-strong p-8 md:p-12 overflow-hidden border border-primary/10">
          <h1 className="text-3xl font-bold mb-2 font-poppins text-primary">Privacy Policy - Job Ready</h1>
          <p className="text-muted-foreground mb-8">Last Updated: May 21, 2026</p>

          <div className="prose prose-slate max-w-none space-y-8">
            <p className="text-lg leading-relaxed">
              This Privacy Policy explains how Job Ready collects, uses, stores, and protects information when you use our AI-powered career preparation platform, including resume analysis, resume tailoring, mock interviews, audio interviews, payments, and account services.
            </p>

            <hr className="border-primary/10" />

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">We may collect information you provide directly or generate while using the platform, including:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>account details such as name, email address, login method, and verification status;</li>
                <li>uploaded resumes, job descriptions, profile summaries, skills, work experience, and related career content;</li>
                <li>audio/video interview recordings, transcripts, interview answers, AI-generated evaluations, warnings, and session activity;</li>
                <li>payment order IDs, payment status, purchased credit records, and transaction metadata from payment providers;</li>
                <li>technical information such as request logs, device/browser metadata, IP-derived security data, timestamps, and error logs.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">2. How We Use Information</h2>
              <p className="text-muted-foreground mb-4">We use information to provide and improve Job Ready services, including to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>create and secure user accounts;</li>
                <li>send OTP, verification, and password reset emails;</li>
                <li>analyze resumes, generate ATS feedback, tailor resumes, and prepare downloadable outputs;</li>
                <li>run audio/video mock interviews and generate AI-based feedback;</li>
                <li>manage free usage limits, purchased credits, payment verification, refunds, and abuse prevention;</li>
                <li>monitor platform reliability, debug issues, prevent fraud, and enforce Terms and Conditions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">3. AI Processing</h2>
              <p className="text-muted-foreground">Job Ready uses third-party AI services to process resumes, job descriptions, interview responses, and related content. AI-generated outputs may include scores, recommendations, tailored resume content, interview feedback, and summaries. You should avoid uploading information that is unnecessary for career preparation or that you do not have permission to process.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">4. Third-Party Services</h2>
              <p className="text-muted-foreground mb-4">We may use trusted third-party providers for services such as:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>authentication and login support, including Google OAuth where enabled;</li>
                <li>payment processing and payment verification, including Razorpay;</li>
                <li>AI processing, transcription, file processing, and cloud infrastructure;</li>
                <li>email delivery for verification, OTP, and support-related communication;</li>
                <li>database, storage, logging, monitoring, and security operations.</li>
              </ul>
              <p className="text-muted-foreground mt-4">These providers process information only as needed to deliver their services to Job Ready, subject to their own policies and legal obligations.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">5. Data Retention</h2>
              <p className="text-muted-foreground mb-4">We keep information only for as long as reasonably needed for platform functionality, security, compliance, and dispute handling.</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Job Ready may keep only the latest ATS analysis, tailored resume, interview result, and generated artifacts associated with your account.</li>
                <li>Older records, temporary files, recordings, generated outputs, or processing artifacts may be deleted automatically.</li>
                <li>Some payment, security, audit, and support records may be retained longer where required for fraud prevention, accounting, legal, or operational reasons.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">6. Security</h2>
              <p className="text-muted-foreground">We use reasonable technical and organizational safeguards to protect user information, including access controls, secure authentication practices, HTTPS-based communication where deployed, and restricted processing of sensitive account data. No online system can be guaranteed to be completely secure, and users are responsible for keeping account credentials confidential.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">7. Cookies and Local Storage</h2>
              <p className="text-muted-foreground">Job Ready may use cookies, browser storage, and authentication tokens to keep users signed in, protect sessions, remember application state, and support security features. Disabling these technologies may prevent some features from working correctly.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">8. Payments</h2>
              <p className="text-muted-foreground">Payment card, UPI, bank, or wallet details are handled by payment providers and are not stored directly by Job Ready. We may store transaction identifiers, order IDs, payment status, amount, plan or credit type, and related verification records to provide credits, resolve disputes, and prevent fraud.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">9. Your Choices and Requests</h2>
              <p className="text-muted-foreground mb-4">You may contact us to request help with account information, data access, correction, deletion, or privacy-related concerns. Some requests may be limited by security, legal, fraud-prevention, payment, or technical retention requirements.</p>
              <p className="text-muted-foreground">For account or privacy support, email <a href="mailto:support@jobreadyai.in" className="text-primary font-semibold hover:underline">support@jobreadyai.in</a> from your registered email address.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">10. Children's Privacy</h2>
              <p className="text-muted-foreground">Job Ready is intended for users who are legally capable of using career preparation services and entering into applicable terms. We do not knowingly collect information from children where parental or guardian consent is required by law.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">11. Changes to This Policy</h2>
              <p className="text-muted-foreground">We may update this Privacy Policy from time to time. Updated versions will be posted on this page with a revised Last Updated date. Continued use of Job Ready after updates means you accept the revised policy.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">12. Contact</h2>
              <p className="text-muted-foreground">For privacy questions or legal inquiries, contact us at <a href="mailto:contact@jobreadyai.in" className="text-primary font-semibold hover:underline">contact@jobreadyai.in</a>. For support requests, email <a href="mailto:support@jobreadyai.in" className="text-primary font-semibold hover:underline">support@jobreadyai.in</a>.</p>
              <p className="font-semibold text-primary">Feedback: <a href="mailto:feedback@jobreadyai.in" className="hover:underline">feedback@jobreadyai.in</a></p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;