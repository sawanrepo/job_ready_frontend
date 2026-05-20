import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-2xl shadow-strong p-8 md:p-12 overflow-hidden border border-primary/10">
          <h1 className="text-3xl font-bold mb-2 font-poppins text-primary">Terms and Conditions – Job Ready</h1>
          <p className="text-muted-foreground mb-8">Last Updated: May 20, 2026</p>

          <div className="prose prose-slate max-w-none space-y-8">
            <p className="text-lg leading-relaxed">
              Welcome to Job Ready. These Terms and Conditions (“Terms”) govern your access to and use of the Job Ready platform and services. By accessing or using Job Ready, you agree to be bound by these Terms. If you do not agree with these Terms, please do not use the platform.
            </p>

            <hr className="border-primary/10" />

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">1. About Job Ready</h2>
              <p className="text-muted-foreground mb-4">Job Ready is an AI-powered career preparation platform that provides services including:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Resume ATS analysis</li>
                <li>AI-based resume tailoring</li>
                <li>Mock interview analysis</li>
                <li>Audio/video interview evaluation</li>
                <li>Career preparation and job readiness tools</li>
              </ul>
              <p className="text-muted-foreground mt-4 italic">The platform uses artificial intelligence technologies to generate analysis, recommendations, and feedback.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">2. Eligibility</h2>
              <p className="text-muted-foreground mb-2">By using Job Ready, you confirm that:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>you are legally capable of entering into a binding agreement under applicable law,</li>
                <li>the information you provide is accurate and complete,</li>
                <li>you will use the platform only for lawful purposes.</li>
              </ul>
              <p className="text-muted-foreground mt-4">If you are using the platform on behalf of an organization, you represent that you have authority to bind that organization to these Terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">3. User Accounts</h2>
              <p className="text-muted-foreground mb-4">Certain features may require account registration.</p>
              <p className="text-muted-foreground mb-2">You are responsible for:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>maintaining the confidentiality of your account credentials,</li>
                <li>restricting unauthorized access to your account,</li>
                <li>all activities conducted under your account.</li>
              </ul>
              <p className="text-muted-foreground mt-4">You agree to notify Job Ready immediately if you suspect unauthorized access or misuse of your account. Job Ready is not responsible for losses resulting from failure to maintain account security.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">4. AI-Generated Content Disclaimer</h2>
              <p className="text-muted-foreground mb-4">Job Ready uses AI models to generate ATS scores, resume suggestions, interview evaluations, and related outputs.</p>
              <p className="text-muted-foreground mb-2 font-semibold">Users acknowledge that:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>AI-generated content may contain inaccuracies, omissions, or limitations,</li>
                <li>outputs are generated automatically and may not always reflect professional, legal, or hiring standards,</li>
                <li>results are provided for informational and career-assistance purposes only,</li>
                <li>Job Ready does not guarantee interview calls, job offers, hiring success, or career outcomes.</li>
              </ul>
              <p className="text-muted-foreground mt-4">Users are solely responsible for reviewing and verifying all generated content before using it for professional purposes.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">5. User Content</h2>
              <p className="text-muted-foreground mb-4">Users may upload resumes, job descriptions, interview recordings, audio, video, text, and related materials (“User Content”).</p>
              <p className="text-muted-foreground mb-2 font-semibold">By uploading User Content, you confirm that:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>you own the content or have permission to use it,</li>
                <li>the content does not violate applicable laws or third-party rights,</li>
                <li>the content does not contain malicious, harmful, or illegal material.</li>
              </ul>
              <p className="text-muted-foreground mt-4">Users retain ownership of their uploaded content. You grant Job Ready a limited right to process uploaded content solely for providing platform functionality and improving service reliability.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">6. Interview Recording & AI Processing Consent</h2>
              <p className="text-muted-foreground mb-4">By using interview-related features, you consent to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>audio/video recording and processing,</li>
                <li>AI-based speech analysis,</li>
                <li>AI-generated interview evaluation and feedback.</li>
              </ul>
              <p className="text-muted-foreground mt-4 font-medium italic">You understand that interview analysis may involve processing through third-party AI providers and infrastructure services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">7. Limited Data Retention</h2>
              <p className="text-muted-foreground mb-4">To minimize unnecessary data retention, Job Ready may store only the latest:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>ATS analysis,</li>
                <li>tailored resume,</li>
                <li>interview result,</li>
                <li>generated artifacts associated with a user account.</li>
              </ul>
              <p className="text-muted-foreground mt-4">Older records, temporary files, and generated outputs may be automatically deleted without prior notice. While Job Ready takes reasonable measures to protect user data, permanent storage and availability of generated content are not guaranteed.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">8. Payments, Credits, and Purchases</h2>
              <p className="text-muted-foreground mb-4">Certain features on Job Ready may require payment or credits to access.</p>
              <p className="text-muted-foreground mb-2">Job Ready may offer:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>free usage limits,</li>
                <li>one-time purchases,</li>
                <li>feature-specific credits,</li>
                <li>bundled or combo packs.</li>
              </ul>
              <p className="text-muted-foreground mt-4 font-semibold">Users acknowledge that:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>credits and purchased feature access may have usage limitations,</li>
                <li>free usage limits may reset periodically,</li>
                <li>purchased digital services and credits may be non-refundable except as described in the Refund Policy.</li>
              </ul>
              <p className="text-muted-foreground mt-4 italic">Payments are processed through third-party payment providers. Job Ready is not responsible for failures caused by external payment systems.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">9. Payment Verification and Credit Activation</h2>
              <p className="text-muted-foreground mb-4">Job Ready adds purchased credits only after payment verification is completed successfully through the payment gateway and the transaction is confirmed as valid.</p>
              <p className="text-muted-foreground mb-2 font-semibold">Users acknowledge that:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>payment completion screens from third-party gateways do not by themselves guarantee credit activation,</li>
                <li>credits are added only after Job Ready verifies the payment signature, amount, currency, order ownership, and successful capture status,</li>
                <li>credit activation may be delayed or blocked if verification is incomplete, disputed, duplicated, suspicious, or unverifiable,</li>
                <li>Job Ready may reject or reverse credit allocation for fraudulent, replayed, manipulated, or invalid payment transactions.</li>
              </ul>
              <p className="text-muted-foreground mt-4">Users must not replay payment IDs, manipulate payment verification data, or attempt to obtain credits without a valid confirmed payment.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">10. Interview Rules, Warnings, and Session Integrity</h2>
              <p className="text-muted-foreground mb-4">Interview features are intended for honest practice under realistic constraints. Video and audio interviews may enforce timers, recording limits, fullscreen requirements, warning counts, and malpractice checks.</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Exiting fullscreen, switching tabs, or similar activity may generate warnings.</li>
                <li>Too many warnings may terminate the interview and prevent result generation.</li>
                <li>If a question is not answered within the time limit, Job Ready may mark it as unanswered and continue the interview flow.</li>
                <li>Resume or recovery grace, if provided, may be limited and may not reset repeatedly on refresh.</li>
              </ul>
              <p className="text-muted-foreground mt-4">Job Ready may restrict or discard sessions where abuse, automation, manipulation, or repeated policy violations are detected.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">11. Acceptable Use</h2>
              <p className="text-muted-foreground mb-2">Users agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>misuse or abuse the platform,</li>
                <li>upload malicious, harmful, or illegal content,</li>
                <li>attempt unauthorized access to systems or accounts,</li>
                <li>interfere with platform operations,</li>
                <li>exploit or overload platform infrastructure,</li>
                <li>use bots, automation, or scraping tools without authorization,</li>
                <li>attempt prompt injection or manipulation of AI systems,</li>
                <li>reverse engineer, copy, or reproduce platform functionality without permission,</li>
                <li>attempt to bypass usage limits, payment systems, or security protections.</li>
              </ul>
              <p className="text-muted-foreground mt-4">Job Ready reserves the right to suspend or terminate accounts involved in abusive, suspicious, or fraudulent activity.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">12. Third-Party Services</h2>
              <p className="text-muted-foreground">Job Ready may rely on third-party providers including AI model providers, authentication services, payment gateways, cloud infrastructure providers, and analytics or monitoring services. Job Ready is not responsible for outages, delays, inaccuracies, or failures caused by third-party services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">13. Service Availability</h2>
              <p className="text-muted-foreground mb-4">Job Ready aims to provide reliable and uninterrupted service; however, uninterrupted availability is not guaranteed.</p>
              <p className="text-muted-foreground mb-2">The platform may experience:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>maintenance periods,</li>
                <li>processing delays,</li>
                <li>AI provider downtime,</li>
                <li>temporary interruptions,</li>
                <li>infrastructure failures.</li>
              </ul>
              <p className="text-muted-foreground mt-4">Features may be modified, suspended, or discontinued at any time without liability.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">14. Intellectual Property</h2>
              <p className="text-muted-foreground">All platform software, code, branding, logos, design elements, interfaces, and proprietary functionality belong to Job Ready unless otherwise stated. Users may not copy, distribute, resell, reproduce, reverse engineer, or commercially exploit any part of the platform without written permission.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">15. Limitation of Liability</h2>
              <p className="text-muted-foreground">To the maximum extent permitted by law, Job Ready shall not be liable for hiring or recruitment outcomes, job application results, career losses, indirect or consequential damages, AI-generated inaccuracies, loss of uploaded or generated data, temporary service interruptions, or third-party service failures. The platform is provided on an “as is” and “as available” basis without warranties of any kind.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">16. Account Suspension or Termination</h2>
              <p className="text-muted-foreground">Job Ready reserves the right to suspend, restrict, or terminate accounts that violate these Terms, engage in abuse or fraudulent activity, create security risks, misuse AI systems or platform infrastructure, or violate applicable laws. Job Ready may also remove uploaded content associated with such accounts.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">17. Modifications to Services or Terms</h2>
              <p className="text-muted-foreground">Job Ready may modify, update, suspend, or discontinue any part of the platform or these Terms at any time. Continued use of the platform after updates constitutes acceptance of the revised Terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">18. Governing Law</h2>
              <p className="text-muted-foreground">These Terms shall be governed by and interpreted in accordance with the laws of India. Any disputes arising in relation to these Terms shall be subject to the jurisdiction of competent courts in India.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">19. Contact Information</h2>
              <p className="text-muted-foreground">For questions, support requests, or legal inquiries regarding these Terms, contact:</p>
              <p className="font-semibold text-primary">Email: [leave for now]</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
