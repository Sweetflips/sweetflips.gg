import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | SweetFlips",
  description: "Terms of Service for SweetFlips - operated by Sweetflips Holdings Limited, Malta",
};

export default function TermsOfServicePage() {
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-white">Terms of Service</h1>
        
        <div className="space-y-8 text-gray-200">
          <p className="text-sm text-gray-400">
            Last updated: December 17, 2025
          </p>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">1. Introduction</h2>
            <p className="mb-4 text-gray-200">
              Welcome to SweetFlips. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the SweetFlips website located at sweetflips.gg (the &quot;Website&quot;), operated by Sweetflips Holdings Limited (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), a company registered in Malta.
            </p>
            <p className="text-gray-200">
              By accessing or using our Website, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Website.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">2. Company Information</h2>
            <p className="mb-2">
              <strong>Company Name:</strong> Sweetflips Holdings Limited
            </p>
            <p className="mb-2">
              <strong>Registered Office:</strong> Capital Business Centre, Entrance A, Floor 1, Triq Taz-Zwejt, San Gwann, SGN 3000, Malta
            </p>
            <p className="mb-2">
              <strong>Jurisdiction:</strong> Malta
            </p>
            <p>
              <strong>Contact:</strong> For any inquiries, please contact us through the information provided on our Website.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">3. Eligibility</h2>
            <p className="mb-4">
              You must be at least 18 years of age (or the age of majority in your jurisdiction, whichever is higher) to use our Website. By using our Website, you represent and warrant that you meet these eligibility requirements.
            </p>
            <p>
              You are responsible for ensuring that your use of our Website complies with all applicable laws and regulations in your jurisdiction. We do not endorse or encourage illegal gambling or any activities that violate local laws.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">4. Restricted Territories</h2>
            <p className="mb-4">
              <strong>Important:</strong> Our Website and the content provided herein are not intended for, and do not constitute an offer or invitation to, residents of jurisdictions where online gambling is prohibited, restricted, or requires specific licensing that we do not hold.
            </p>
            <p className="mb-4">
              We explicitly do not promote, market, or provide gambling-related content or affiliate services to residents of the following countries (this list is not exhaustive):
            </p>
            <ul className="mb-4 list-disc pl-6 space-y-2">
              <li><strong>The Netherlands (Nederland)</strong> - Online gambling advertising is strictly regulated under Dutch law (Wet op de kansspelen). We do not target Dutch residents.</li>
              <li><strong>United Arab Emirates (UAE)</strong> - Gambling is prohibited under UAE law. We do not target UAE residents.</li>
              <li>Any other jurisdiction where online gambling or gambling advertising is prohibited or restricted by law.</li>
            </ul>
            <p className="mb-4">
              If you are located in any restricted territory, you must not use our Website or access any gambling-related content or links. By using our Website, you confirm that you are not located in a restricted territory and that accessing our content is legal in your jurisdiction.
            </p>
            <p>
              We are committed to full compliance with all applicable gambling laws and regulations. We actively work to ensure our content is not directed at jurisdictions where it would be unlawful.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">5. Nature of Our Services</h2>
            <p className="mb-4">
              SweetFlips is an entertainment and content platform. We provide information about online casinos, gaming, and related entertainment services. We may feature affiliate links to third-party gambling and entertainment websites.
            </p>
            <p className="mb-4">
              <strong>Important:</strong> We do not operate any gambling services ourselves. Any gambling activities are conducted by third-party operators subject to their own terms, conditions, and licensing requirements.
            </p>
            <p>
              We do not take responsibility for any losses from gameplay on casinos and entertainment websites promoted on our site. Please gamble responsibly and only bet or wager with money you can afford to lose.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">6. Disclaimer of Liability</h2>
            <p className="mb-4">
              To the fullest extent permitted by applicable law:
            </p>
            <ul className="mb-4 list-disc pl-6 space-y-2">
              <li>We are not liable for any losses, damages, or claims arising from your use of third-party gambling or entertainment websites.</li>
              <li>We do not guarantee the accuracy, completeness, or reliability of any information provided on our Website.</li>
              <li>We are not responsible for the actions, policies, or practices of any third-party websites linked from our Website.</li>
              <li>Your use of our Website is at your own risk.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">7. Responsible Gambling</h2>
            <p className="mb-4">
              We strongly advocate for responsible gambling. If you choose to engage in gambling activities through third-party websites:
            </p>
            <ul className="mb-4 list-disc pl-6 space-y-2">
              <li>Only gamble with money you can afford to lose</li>
              <li>Never chase your losses</li>
              <li>Set limits on your gambling activities</li>
              <li>Take breaks and monitor the time you spend gambling</li>
              <li>Seek help if you believe you may have a gambling problem</li>
            </ul>
            <p>
              If you or someone you know has a gambling problem, please seek help from professional organizations in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">8. Intellectual Property</h2>
            <p>
              All content on our Website, including but not limited to text, graphics, logos, images, and software, is the property of Sweetflips Holdings Limited or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">9. User Conduct</h2>
            <p className="mb-4">
              You agree not to:
            </p>
            <ul className="mb-4 list-disc pl-6 space-y-2">
              <li>Use our Website for any illegal purpose or in violation of any applicable laws</li>
              <li>Attempt to gain unauthorized access to our systems or networks</li>
              <li>Interfere with or disrupt the operation of our Website</li>
              <li>Use automated systems or software to extract data from our Website without permission</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">10. Third-Party Links</h2>
            <p>
              Our Website may contain links to third-party websites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We strongly advise you to read the terms and conditions and privacy policies of any third-party websites you visit.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">11. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Any changes will be effective immediately upon posting on our Website. Your continued use of our Website following the posting of changes constitutes your acceptance of such changes. We encourage you to review these Terms periodically.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Malta, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of our Website shall be subject to the exclusive jurisdiction of the courts of Malta.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">13. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">14. Contact Us</h2>
            <p className="mb-2">
              If you have any questions about these Terms, please contact us at:
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
            <p>
              Malta
            </p>
          </section>
        </div>
      </div>
    </DefaultLayout>
  );
}
