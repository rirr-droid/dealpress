import { Card } from "@/components/ui/card";

export const metadata = {
  title: 'Terms of Service - DealPress',
  description: 'Terms of Service for DealPress',
};

export default function TermsOfServicePage() {
  const lastUpdated = 'February 24, 2026';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 md:p-12">
          <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Terms of Service</h1>
          <p className="text-sm text-[#86868b] mb-8">Last updated: {lastUpdated}</p>

          <div className="space-y-6 text-[#1d1d1f]">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-[#6e6e73] mb-4">
                By accessing and using DealPress ("Service"), you accept and agree to be bound by the terms and
                provisions of this agreement. If you do not agree to these Terms of Service, please do not use
                our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-[#6e6e73] mb-4">
                DealPress provides a software-as-a-service (SaaS) platform for managing approval workflows,
                deal approvals, and team collaboration. We reserve the right to modify, suspend, or discontinue
                the Service at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <div className="text-[#6e6e73] space-y-3">
                <p>When you create an account with us, you must provide accurate and complete information.</p>
                <p>You are responsible for:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Maintaining the security of your account and password</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Subscription and Billing</h2>
              <div className="text-[#6e6e73] space-y-3">
                <p>Some parts of the Service are billed on a subscription basis ("Subscription").</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>You will be billed in advance on a recurring and periodic basis (monthly or annually)</li>
                  <li>Billing cycles are set based on the plan you selected when purchasing a Subscription</li>
                  <li>Subscriptions automatically renew unless canceled before the renewal date</li>
                  <li>We use third-party payment processors (Stripe) to process payments</li>
                  <li>No refunds are provided for partial months of service</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Free Trial</h2>
              <p className="text-[#6e6e73] mb-4">
                We may offer a free trial for new users. At the end of the trial period, you will be charged
                unless you cancel your subscription before the trial ends.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cancellation and Termination</h2>
              <div className="text-[#6e6e73] space-y-3">
                <p>You may cancel your subscription at any time through your account settings.</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Upon cancellation, you will retain access until the end of your current billing period</li>
                  <li>We reserve the right to suspend or terminate your account for violation of these Terms</li>
                  <li>Upon termination, your right to use the Service will immediately cease</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Acceptable Use</h2>
              <div className="text-[#6e6e73] space-y-3">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Use the Service for any illegal purpose or in violation of any laws</li>
                  <li>Attempt to gain unauthorized access to any portion of the Service</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Upload malicious code, viruses, or any harmful content</li>
                  <li>Impersonate any person or entity</li>
                  <li>Harvest or collect information about other users without consent</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
              <p className="text-[#6e6e73] mb-4">
                The Service and its original content, features, and functionality are owned by DealPress and are
                protected by international copyright, trademark, and other intellectual property laws. You retain
                ownership of all data you submit to the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="text-[#6e6e73] mb-4">
                To the maximum extent permitted by law, DealPress shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages, including loss of profits, data, or
                other intangible losses resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Disclaimer</h2>
              <p className="text-[#6e6e73] mb-4">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind,
                either express or implied. We do not warrant that the Service will be uninterrupted, secure, or
                error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
              <p className="text-[#6e6e73] mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of material changes
                via email or through the Service. Continued use of the Service after changes constitutes
                acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <p className="text-[#6e6e73] mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="text-[#6e6e73] ml-4">
                <p>Email: legal@dealpress.ai</p>
                <p>Website: https://dealpress.ai</p>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
