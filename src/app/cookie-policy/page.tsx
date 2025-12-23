import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | SweetFlips",
  description: "Cookie Policy for SweetFlips - operated by Sweetflips Holdings Limited, Malta",
};

export default function CookiePolicyPage() {
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-white">Cookie Policy</h1>
        
        <div className="space-y-8 text-gray-300">
          <p className="text-sm text-gray-400">
            Last updated: December 17, 2025
          </p>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">1. Introduction</h2>
            <p className="mb-4">
              This Cookie Policy explains how Sweetflips Holdings Limited (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), a company registered in Malta with its registered office at Capital Business Centre, Entrance A, Floor 1, Triq Taz-Zwejt, San Gwann, SGN 3000, Malta, uses cookies and similar tracking technologies on our website sweetflips.gg (the &quot;Website&quot;).
            </p>
            <p>
              By continuing to use our Website, you consent to our use of cookies as described in this policy. You can manage your cookie preferences as explained below.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">2. What Are Cookies?</h2>
            <p className="mb-4">
              Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
            </p>
            <p>
              Cookies can be &quot;persistent&quot; (remaining on your device until they expire or you delete them) or &quot;session&quot; cookies (deleted when you close your browser).
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">3. Types of Cookies We Use</h2>
            
            <h3 className="mb-2 text-lg font-medium text-white">3.1 Essential Cookies</h3>
            <p className="mb-4">
              These cookies are necessary for the Website to function properly. They enable core functionality such as security, network management, and account access. You cannot opt out of these cookies as the Website would not function properly without them.
            </p>

            <h3 className="mb-2 text-lg font-medium text-white">3.2 Performance and Analytics Cookies</h3>
            <p className="mb-4">
              These cookies help us understand how visitors interact with our Website by collecting and reporting information anonymously. They allow us to measure and improve the performance of our Website.
            </p>

            <h3 className="mb-2 text-lg font-medium text-white">3.3 Functionality Cookies</h3>
            <p className="mb-4">
              These cookies enable enhanced functionality and personalization, such as remembering your preferences (e.g., language or region). They may be set by us or by third-party providers whose services we have added to our pages.
            </p>

            <h3 className="mb-2 text-lg font-medium text-white">3.4 Targeting and Advertising Cookies</h3>
            <p className="mb-4">
              These cookies may be set through our Website by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites. They work by uniquely identifying your browser and device.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">4. Third-Party Cookies</h2>
            <p className="mb-4">
              Some cookies on our Website are placed by third parties. These include:
            </p>
            <ul className="mb-4 list-disc pl-6 space-y-2">
              <li><strong>Analytics Providers:</strong> Such as Google Analytics, to help us understand how visitors use our Website</li>
              <li><strong>Social Media Platforms:</strong> When you interact with social media features on our Website</li>
              <li><strong>Advertising Partners:</strong> To deliver relevant advertisements</li>
            </ul>
            <p>
              We do not control third-party cookies. Please refer to the respective privacy policies of these third parties for more information about their cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">5. Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-600">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="border border-gray-600 px-4 py-2 text-left text-white">Cookie Name</th>
                    <th className="border border-gray-600 px-4 py-2 text-left text-white">Type</th>
                    <th className="border border-gray-600 px-4 py-2 text-left text-white">Purpose</th>
                    <th className="border border-gray-600 px-4 py-2 text-left text-white">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-600 px-4 py-2">Session Cookie</td>
                    <td className="border border-gray-600 px-4 py-2">Essential</td>
                    <td className="border border-gray-600 px-4 py-2">Maintains user session</td>
                    <td className="border border-gray-600 px-4 py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-600 px-4 py-2">_ga</td>
                    <td className="border border-gray-600 px-4 py-2">Analytics</td>
                    <td className="border border-gray-600 px-4 py-2">Google Analytics - distinguishes users</td>
                    <td className="border border-gray-600 px-4 py-2">2 years</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-600 px-4 py-2">_gid</td>
                    <td className="border border-gray-600 px-4 py-2">Analytics</td>
                    <td className="border border-gray-600 px-4 py-2">Google Analytics - distinguishes users</td>
                    <td className="border border-gray-600 px-4 py-2">24 hours</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-600 px-4 py-2">preferences</td>
                    <td className="border border-gray-600 px-4 py-2">Functionality</td>
                    <td className="border border-gray-600 px-4 py-2">Stores user preferences</td>
                    <td className="border border-gray-600 px-4 py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">6. Managing Your Cookie Preferences</h2>
            <p className="mb-4">
              You have the right to decide whether to accept or reject cookies. You can manage your cookie preferences in the following ways:
            </p>
            
            <h3 className="mb-2 text-lg font-medium text-white">6.1 Browser Settings</h3>
            <p className="mb-4">
              Most web browsers allow you to control cookies through their settings. You can typically find these settings in the &quot;Options&quot; or &quot;Preferences&quot; menu of your browser. You can set your browser to:
            </p>
            <ul className="mb-4 list-disc pl-6 space-y-2">
              <li>Block all cookies</li>
              <li>Accept all cookies</li>
              <li>Block third-party cookies</li>
              <li>Clear all cookies when you close your browser</li>
              <li>Open a &quot;private browsing&quot; session</li>
            </ul>
            <p className="mb-4">
              Please note that blocking cookies may impact the functionality of our Website.
            </p>

            <h3 className="mb-2 text-lg font-medium text-white">6.2 Opt-Out Links</h3>
            <p className="mb-4">
              You can opt out of certain third-party cookies by visiting:
            </p>
            <ul className="mb-4 list-disc pl-6 space-y-2">
              <li>Google Analytics Opt-out: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://tools.google.com/dlpage/gaoptout</a></li>
              <li>Your Online Choices (EU): <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.youronlinechoices.eu</a></li>
              <li>Network Advertising Initiative: <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://optout.networkadvertising.org</a></li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">7. Other Tracking Technologies</h2>
            <p className="mb-4">
              In addition to cookies, we may use other tracking technologies such as:
            </p>
            <ul className="mb-4 list-disc pl-6 space-y-2">
              <li><strong>Web Beacons:</strong> Small graphic images that allow us to track user behavior</li>
              <li><strong>Pixel Tags:</strong> Small pieces of code embedded in web pages or emails</li>
              <li><strong>Local Storage:</strong> Data stored in your browser&apos;s local storage</li>
            </ul>
            <p>
              These technologies are used for similar purposes as cookies and can be managed through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">8. Changes to This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business practices. Any changes will be posted on this page with an updated revision date. We encourage you to review this Cookie Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">9. Contact Us</h2>
            <p className="mb-2">
              If you have any questions about this Cookie Policy, please contact us at:
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
              For more information about how we handle your personal data, please see our <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </section>
        </div>
      </div>
    </DefaultLayout>
  );
}
