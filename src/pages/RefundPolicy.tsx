import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-2xl shadow-strong p-8 md:p-12 overflow-hidden border border-primary/10">
          <h1 className="text-3xl font-bold mb-2 font-poppins text-primary">Refund Policy – Job Ready</h1>
          <p className="text-muted-foreground mb-8">Last Updated: May 20, 2026</p>

          <div className="prose prose-slate max-w-none space-y-8">
            <p className="text-lg leading-relaxed">
              Thank you for using Job Ready. This Refund Policy explains how payments, credit purchases, and feature-based services are handled on the Job Ready platform.
            </p>

            <hr className="border-primary/10" />

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">1. Digital Service Nature</h2>
              <p className="text-muted-foreground">Job Ready provides AI-powered digital services including resume ATS analysis, resume tailoring, and mock interview analysis. Due to the instant and computational nature of these services, most purchases are considered <strong>final once processing begins</strong>.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">2. Credit-Based and One-Time Purchases</h2>
              <p className="text-muted-foreground mb-4">Job Ready operates on a credit-based and feature-pack system. Users may purchase:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>individual feature access</li>
                <li>credit bundles</li>
                <li>combo packs</li>
                <li>or other one-time digital services</li>
              </ul>
              <p className="text-muted-foreground mt-4 font-semibold">All credits and purchased services are:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>non-transferable</li>
                <li>non-exchangeable for cash</li>
                <li>usable only within the Job Ready platform</li>
                <li>added only after successful live payment verification and credit activation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">3. Razorpay Test Mode and Blocked Credits</h2>
              <p className="text-muted-foreground mb-4">During deployment verification or payment gateway testing, Job Ready may use Razorpay test mode. Test mode payments are not treated as live paid purchases.</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Credits are not added for Razorpay test mode payments.</li>
                <li>A test mode payment message does not mean a live purchase was completed.</li>
                <li>Once live payment mode is enabled, credits are added only after successful payment verification.</li>
              </ul>
              <p className="text-muted-foreground mt-4">If you believe a live payment was completed but credits were not added, email support@jobreadyai.in from your registered email address with the Razorpay payment or order ID.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">4. Technical Failures</h2>
              <p className="text-muted-foreground mb-4">If a technical issue on Job Ready prevents successful completion of a purchased feature after credits have been deducted, the platform may:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>restore the consumed credits, or</li>
                <li>re-attempt processing the request after verification of the issue</li>
              </ul>
              <p className="text-muted-foreground mt-4 font-medium italic">Examples include AI processing failures, server-side errors, PDF generation failures, or interview analysis failures caused by system issues.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">5. Non-Refundable Situations</h2>
              <p className="text-muted-foreground mb-2">Refunds or credit restoration will generally not be provided in the following cases:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
                <li>dissatisfaction with AI-generated results</li>
                <li>incorrect or incomplete job descriptions or resumes submitted by the user</li>
                <li>poor-quality or unsupported file uploads</li>
                <li>user device, browser, microphone, or internet issues</li>
                <li>accidental purchases</li>
                <li>failure to use credits within validity (if applicable)</li>
                <li>misunderstanding of platform features</li>
                <li>interview termination due to warnings, malpractice, tab switching, or fullscreen violations</li>
                <li>missed answers caused by user delay, device issues, or unstable internet connection</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">6. Duplicate or Failed Payments</h2>
              <p className="text-muted-foreground">If a user is charged multiple times for the same transaction due to payment gateway errors or technical issues, Job Ready will investigate the transaction and may provide a monetary refund or equivalent credit restoration depending on the case.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">7. Chargebacks and Fraud</h2>
              <p className="text-muted-foreground">Any fraudulent transactions or chargeback attempts may result in account suspension, credit reversal, and restriction of platform access.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">8. Processing Time</h2>
              <p className="text-muted-foreground">Approved refunds or credit restorations may take a few business days to process depending on the payment provider or banking system.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">9. Abuse of Refund Policy</h2>
              <p className="text-muted-foreground">Job Ready reserves the right to deny refund or credit restoration requests in cases involving repeated abuse of the system, suspicious activity, attempts to exploit platform policies, or violation of Terms and Conditions.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-poppins text-foreground">10. Contact</h2>
              <p className="text-muted-foreground mb-4">For support related to payments or refund requests, contact:</p>
              <p className="font-semibold text-primary">Email: <a href="mailto:support@jobreadyai.in" className="hover:underline">support@jobreadyai.in</a></p>
              <p className="text-sm text-muted-foreground mt-2 italic">Please include: registered email address, payment reference or order ID, and a description of the issue.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
