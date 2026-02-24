import { Card } from "@/components/ui/card";

export const metadata = {
  title: 'Privacy Policy - DealPress',
  description: 'Privacy Policy for DealPress',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'February 24, 2026';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 md:p-12">
          <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Privacy Policy</h1>
          <p className="text-sm text-[#86868b] mb-8">Last updated: {lastUpdated}</p>

          <div className="space-y-6 text-[#1d1d1f]">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-[#6e6e73] mb-4">
                DealPress ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <div className="text-[#6e6e73] space-y-4">
                <div>
                  <h3 className="font-semibold text-[#1d1d1f] mb-2">2.1 Information You Provide</h3>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Account information (name, email address, company name)</li>
                    <li>Payment information (processed securely through Stripe)</li>
                    <li>Approval request data and workflow information</li>
                    <li>Communications with our support team</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1d1d1f] mb-2">2.2 Automatically Collected Information</h3>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Log data (IP address, browser type, device information)</li>
                    <li>Usage data (features used, time spent, interactions)</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <div className="text-[#6e6e73]">
                <p className="mb-3">We use the collected information to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Provide, maintain, and improve our Service</li>
                  <li>Process transactions and send related information</li>
                  <li>Send administrative information, updates, and security alerts</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze usage and trends</li>
                  <li>Detect, prevent, and address technical issues and fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
              <div className="text-[#6e6e73] space-y-4">
                <p>We may share your information with:</p>
                <div>
                  <h3 className="font-semibold text-[#1d1d1f] mb-2">4.1 Service Providers</h3>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Stripe (payment processing)</li>
                    <li>Supabase (database and authentication)</li>
                    <li>Resend (email delivery)</li>
                    <li>Vercel (hosting)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1d1d1f] mb-2">4.2 Legal Requirements</h3>
                  <p>We may disclose your information if required by law or in response to valid requests by public authorities.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1d1d1f] mb-2">4.3 Business Transfers</h3>
                  <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-[#6e6e73] mb-4">
                We implement appropriate technical and organizational security measures to protect your
                information. However, no method of transmission over the Internet is 100% secure. We use:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-[#6e6e73]">
                <li>SSL/TLS encryption for data in transit</li>
                <li>Encryption at rest for sensitive data</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
              <p className="text-[#6e6e73] mb-4">
                We retain your information for as long as your account is active or as needed to provide you
                services. We will retain and use your information as necessary to comply with our legal
                obligations, resolve disputes, and enforce our agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
              <div className="text-[#6e6e73]">
                <p className="mb-3">Depending on your location, you may have the following rights:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data in a portable format</li>
                  <li>Object to or restrict certain processing</li>
                  <li>Withdraw consent where applicable</li>
                </ul>
                <p className="mt-4">To exercise these rights, please contact us at privacy@dealpress.ai</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
              <div className="text-[#6e6e73] space-y-3">
                <p>We use cookies and similar tracking technologies to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Understand how you use our Service</li>
                  <li>Keep you signed in</li>
                </ul>
                <p className="mt-3">
                  You can control cookies through your browser settings. Disabling cookies may limit functionality.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Third-Party Links</h2>
              <p className="text-[#6e6e73] mb-4">
                Our Service may contain links to third-party websites. We are not responsible for the privacy
                practices of these sites. We encourage you to read their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
              <p className="text-[#6e6e73] mb-4">
                Our Service is not intended for children under 13. We do not knowingly collect personal
                information from children under 13. If you believe we have collected such information, please
                contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
              <p className="text-[#6e6e73] mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure
                appropriate safeguards are in place to protect your information in accordance with this Privacy
                Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. California Privacy Rights (CCPA)</h2>
              <div className="text-[#6e6e73] space-y-3">
                <p>If you are a California resident, you have additional rights under the CCPA:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Right to know what personal information is collected</li>
                  <li>Right to know if personal information is sold or disclosed</li>
                  <li>Right to opt-out of the sale of personal information (we do not sell your data)</li>
                  <li>Right to deletion of personal information</li>
                  <li>Right to non-discrimination for exercising your rights</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. European Privacy Rights (GDPR)</h2>
              <p className="text-[#6e6e73] mb-4">
                If you are in the European Economic Area (EEA), you have rights under the General Data Protection
                Regulation (GDPR), including the right to access, rectify, erase, restrict processing, data
                portability, and to object to processing. You also have the right to lodge a complaint with a
                supervisory authority.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Changes to This Privacy Policy</h2>
              <p className="text-[#6e6e73] mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the "Last updated" date. You are advised to
                review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Contact Us</h2>
              <p className="text-[#6e6e73] mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="text-[#6e6e73] ml-4">
                <p>Email: privacy@dealpress.ai</p>
                <p>Website: https://dealpress.ai</p>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
