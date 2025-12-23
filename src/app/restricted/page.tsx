'use client';

import { useState } from 'react';

type ModalType = 'terms' | 'privacy' | null;

export default function RestrictedPage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0a12] px-4">
      <div className="max-w-lg text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
          <svg
            className="h-10 w-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="mb-4 text-3xl font-bold text-white">
          Content Not Available
        </h1>

        {/* Description */}
        <p className="mb-6 text-gray-400">
          We&apos;re sorry, but the content on this website is not available in your
          region due to local regulations regarding online gambling content.
        </p>

        <p className="mb-8 text-sm text-gray-500">
          Sweetflips Holdings Limited complies with all applicable gambling laws
          and regulations. We do not promote, market, or provide gambling-related
          content to residents of jurisdictions where such content is prohibited
          or restricted.
        </p>

        {/* Divider */}
        <div className="mb-8 border-t border-gray-800"></div>

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <button
            onClick={() => setActiveModal('terms')}
            className="text-gray-400 transition-colors hover:text-primary hover:underline"
          >
            Terms of Service
          </button>
          <span className="text-gray-600">|</span>
          <button
            onClick={() => setActiveModal('privacy')}
            className="text-gray-400 transition-colors hover:text-primary hover:underline"
          >
            Privacy Policy
          </button>
        </div>

        {/* Company Info */}
        <p className="mt-8 text-xs text-gray-600">
          © {new Date().getFullYear()} Sweetflips Holdings Limited | Malta
        </p>
      </div>

      {/* Modal */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-[#1a1625] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {activeModal === 'terms' && <TermsContent />}
            {activeModal === 'privacy' && <PrivacyContent />}
          </div>
        </div>
      )}
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-8 text-gray-200">
      <h1 className="mb-8 text-3xl font-bold text-white">Terms of Service</h1>
      <p className="text-sm text-gray-400">Last updated: December 17, 2025</p>

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
        <p className="mb-2"><strong>Company Name:</strong> Sweetflips Holdings Limited</p>
        <p className="mb-2"><strong>Registered Office:</strong> Capital Business Centre, Entrance A, Floor 1, Triq Taz-Zwejt, San Gwann, SGN 3000, Malta</p>
        <p className="mb-2"><strong>Jurisdiction:</strong> Malta</p>
        <p><strong>Contact:</strong> For any inquiries, please contact us through the information provided on our Website.</p>
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
        <p className="mb-4">To the fullest extent permitted by applicable law:</p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li>We are not liable for any losses, damages, or claims arising from your use of third-party gambling or entertainment websites.</li>
          <li>We do not guarantee the accuracy, completeness, or reliability of any information provided on our Website.</li>
          <li>We are not responsible for the actions, policies, or practices of any third-party websites linked from our Website.</li>
          <li>Your use of our Website is at your own risk.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">7. Responsible Gambling</h2>
        <p className="mb-4">We strongly advocate for responsible gambling. If you choose to engage in gambling activities through third-party websites:</p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li>Only gamble with money you can afford to lose</li>
          <li>Never chase your losses</li>
          <li>Set limits on your gambling activities</li>
          <li>Take breaks and monitor the time you spend gambling</li>
          <li>Seek help if you believe you may have a gambling problem</li>
        </ul>
        <p>If you or someone you know has a gambling problem, please seek help from professional organizations in your jurisdiction.</p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">8. Intellectual Property</h2>
        <p>
          All content on our Website, including but not limited to text, graphics, logos, images, and software, is the property of Sweetflips Holdings Limited or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without our prior written consent.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">9. User Conduct</h2>
        <p className="mb-4">You agree not to:</p>
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
        <p className="mb-2">If you have any questions about these Terms, please contact us at:</p>
        <p className="mb-2"><strong>Sweetflips Holdings Limited</strong></p>
        <p className="mb-2">Capital Business Centre, Entrance A, Floor 1</p>
        <p className="mb-2">Triq Taz-Zwejt, San Gwann, SGN 3000</p>
        <p>Malta</p>
      </section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-8 text-gray-200">
      <h1 className="mb-8 text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="text-sm text-gray-400">Last updated: December 17, 2025</p>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">1. Introduction</h2>
        <p className="mb-4 text-gray-200">
          Sweetflips Holdings Limited (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), a company registered in Malta with its registered office at Capital Business Centre, Entrance A, Floor 1, Triq Taz-Zwejt, San Gwann, SGN 3000, Malta, is committed to protecting your privacy.
        </p>
        <p className="text-gray-200">
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website sweetflips.gg (the &quot;Website&quot;). Please read this Privacy Policy carefully. By using our Website, you consent to the practices described in this policy.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">2. Data Controller</h2>
        <p className="mb-2"><strong>Company Name:</strong> Sweetflips Holdings Limited</p>
        <p className="mb-2"><strong>Registered Office:</strong> Capital Business Centre, Entrance A, Floor 1, Triq Taz-Zwejt, San Gwann, SGN 3000, Malta</p>
        <p><strong>Jurisdiction:</strong> Malta</p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">3. Information We Collect</h2>
        
        <h3 className="mb-2 text-lg font-medium text-white">3.1 Information You Provide</h3>
        <p className="mb-4">We may collect information you voluntarily provide when you:</p>
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
        <p className="mb-4">When you visit our Website, we may automatically collect certain information, including:</p>
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
        <p className="mb-4">We use the information we collect for the following purposes:</p>
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
        <p className="mb-4">If you are located in the European Economic Area (EEA), our legal basis for collecting and using your personal information depends on the specific context:</p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li><strong>Consent:</strong> Where you have given consent for specific purposes</li>
          <li><strong>Contract:</strong> Where processing is necessary for a contract with you</li>
          <li><strong>Legitimate Interests:</strong> Where processing is in our legitimate interests and not overridden by your rights</li>
          <li><strong>Legal Obligation:</strong> Where we need to comply with a legal obligation</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">6. Sharing of Information</h2>
        <p className="mb-4">We may share your information in the following circumstances:</p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li><strong>Service Providers:</strong> With third-party vendors who provide services on our behalf (e.g., hosting, analytics)</li>
          <li><strong>Legal Requirements:</strong> When required by law or to respond to legal process</li>
          <li><strong>Protection of Rights:</strong> To protect our rights, privacy, safety, or property</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          <li><strong>With Your Consent:</strong> In other cases where you have given consent</li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">7. Cookies and Tracking Technologies</h2>
        <p className="mb-4">
          We use cookies and similar tracking technologies to collect and track information about your use of our Website. For more information about our use of cookies, please see our Cookie Policy.
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
        <p className="mb-4">Depending on your location, you may have certain rights regarding your personal information:</p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li><strong>Access:</strong> The right to access your personal information</li>
          <li><strong>Rectification:</strong> The right to correct inaccurate or incomplete information</li>
          <li><strong>Erasure:</strong> The right to request deletion of your personal information</li>
          <li><strong>Restriction:</strong> The right to restrict processing of your personal information</li>
          <li><strong>Portability:</strong> The right to receive your personal information in a portable format</li>
          <li><strong>Objection:</strong> The right to object to processing of your personal information</li>
          <li><strong>Withdraw Consent:</strong> The right to withdraw consent at any time</li>
        </ul>
        <p>To exercise any of these rights, please contact us using the information provided below.</p>
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
        <p className="mb-2">If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:</p>
        <p className="mb-2"><strong>Sweetflips Holdings Limited</strong></p>
        <p className="mb-2">Capital Business Centre, Entrance A, Floor 1</p>
        <p className="mb-2">Triq Taz-Zwejt, San Gwann, SGN 3000</p>
        <p className="mb-4">Malta</p>
        <p>You also have the right to lodge a complaint with the Office of the Information and Data Protection Commissioner in Malta if you believe your data protection rights have been violated.</p>
      </section>
    </div>
  );
}
