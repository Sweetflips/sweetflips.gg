import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | SweetFlips",
  description: "Privacy Policy for SweetFlips - operated by Sweetflips Holdings Limited, Malta",
};

export default function PrivacyPolicyPage() {
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-white">Privacy Policy</h1>
        
        <div className="space-y-8 text-gray-300">
          <p className="text-sm text-gray-400">
            Last updated: December 17, 2025
          </p>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">1. Introduction</h2>
            <p className="mb-4">
              Sweetflips Holdings Limited (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), a company registered in Malta with its registered office at Capital Business Centre, Entrance A, Floor 1, Triq Taz-Zwejt, San Gwann, SGN 3000, Malta, is committed to protecting your privacy.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website sweetflips.gg (the &quot;Website&quot;). Please read this Privacy Policy carefully. By using our Website, you consent to the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">2. Data Controller</h2>
            <p className="mb-2">
              <strong>Company Name:</strong> Sweetflips Holdings Limited
            </p>
            <p className="mb-2">
              <strong>Registered Office:</strong> Capital Business Centre, Entrance A, Floor 1, Triq Taz-Zwejt, San Gwann, SGN 3000, Malta
            </p>
            <p>
              <strong>Jurisdiction:</strong> Malta
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">3. Information We Collect</h2>
            
            <h3 className="mb-2 text-lg font-medium text-white">3.1 Information You Provide</h3>
            <p className="mb-4">
              We may collect information you voluntarily provide when you:
            </p>
            <ul className="mb-4 list-disc pl-6 space-y-2">
              <li>Create an account or register on our Website</li>
              <li>Subscribe to newsletters or marketing communications</li>
              <li>Contact us with inquiries or feedback</li>
              <li>Participate in promotions, contests, or giveaways</li>
            </ul>
            <p className="mb-4">
              This information may include your name, email address, username, and any other information you choose to provide.
            </p>

            <h3 className="mb-2 text-lg font-medium text-white">3.2 Information Automatically Collected</h3>
            <p className="mb-4">
              When you visit our Website, we may automatically collect certain information, including:
            </p>
            <ul className="mb-4 list-disc pl-6 space-y-2">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Other technical information through cookies and similar technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">4. How We Use Your Information</h2>
            <p className="mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="mb-4 list-disc pl-6 space-y-2">
              <li>To provide, operate, and maintain our Website</li>
              <li>To improve, personalize, and expand our Website</li>
              <li>To understand and analyze how you use our Website</li>
              <li>To communicate with you, including for customer service and support</li>
              <li>To send you marketing and promotional communications (with your consent where required)</li>
              <li>To detect and prevent fraud and abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">5. Legal Basis for Processing (GDPR)</h2>
            <p className="mb-4">
              If you are located in the European Economic Area (EEA), our legal basis for collecting and using your personal information depends on the specific context:
            </p>
            <ul className="mb-4 list-disc pl-6 space-y-2">
              <li><strong>Consent:</strong> Where you have given consent for specific purposes</li>
              <li><strong>Contract:</strong> Where processing is necessary for a contract with you</li>
              <li><strong>Legitimate Interests:</strong> Where processing is in our legitimate interests and not overridden by your rights</li>
              <li><strong>Legal Obligation:</strong> Where we need to comply with a legal obligation</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">6. Sharing of Information</h2>
            <p className="mb-4">
              We may share your information in the following circumstances:
            </p>
            <ul className="mb-4 list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> With third-party vendors who provide services on our behalf (e.g., hosting, analytics)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to respond to legal process</li>
              <li><strong>Protection of Rights:</strong> To protect our rights, privacy, safety, or property</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> In other cases where you have given consent</li>
            </ul>
            <p>
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">7. Cookies and Tracking Technologies</h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to collect and track information about your use of our Website. For more information about our use of cookies, please see our <a href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">8. Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements. When determining the retention period, we consider the nature and sensitivity of the data, the purposes for processing, and applicable legal requirements.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">9. Your Rights</h2>
            <p className="mb-4">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul className="mb-4 list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> The right to access your personal information</li>
              <li><strong>Rectification:</strong> The right to correct inaccurate or incomplete information</li>
              <li><strong>Erasure:</strong> The right to request deletion of your personal information</li>
              <li><strong>Restriction:</strong> The right to restrict processing of your personal information</li>
              <li><strong>Portability:</strong> The right to receive your personal information in a portable format</li>
              <li><strong>Objection:</strong> The right to object to processing of your personal information</li>
              <li><strong>Withdraw Consent:</strong> The right to withdraw consent at any time</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the information provided below.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. When we transfer your information, we take appropriate safeguards to ensure your information remains protected in accordance with this Privacy Policy and applicable law.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">11. Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">12. Children&apos;s Privacy</h2>
            <p>
              Our Website is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can take appropriate action.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">13. Third-Party Links</h2>
            <p>
              Our Website may contain links to third-party websites. This Privacy Policy does not apply to those websites. We encourage you to review the privacy policies of any third-party websites you visit.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">14. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">15. Contact Us</h2>
            <p className="mb-2">
              If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:
            </p>
            <p className="mb-2">
              <strong>Sweetflips Holdings Limited</strong>
            </p>
            <p className="mb-2">
              Capital Business Centre, Entrance A, Floor 1
            </p>
            <p className="mb-2">
              Triq Taz-Zwejt, San Gwann, SGN 3000
            </p>
            <p className="mb-4">
              Malta
            </p>
            <p>
              You also have the right to lodge a complaint with the Office of the Information and Data Protection Commissioner in Malta if you believe your data protection rights have been violated.
            </p>
          </section>
        </div>
      </div>
    </DefaultLayout>
  );
}
