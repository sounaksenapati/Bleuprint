import Link from "next/link";
import { Cpu } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-gray-200">
      <nav className="border-b border-white/[0.06] bg-[#0A0A0F]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6">
          <Link href="/" className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text font-bold text-transparent">
              Bleuprint
            </span>
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-sm text-gray-400">Privacy Policy</span>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-gray-600">Last updated: February 1, 2025</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-100">
          Privacy Policy
        </h1>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-400">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-200">
              1. Data We Collect
            </h2>
            <p>
              We collect information you provide directly: email address, name,
              and project data you create on the platform. We also collect usage
              data including pages visited, features used, and device
              information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-200">
              2. How We Use Your Data
            </h2>
            <p>
              Your data is used to provide and improve the Service, communicate
              with you about your account, and analyze usage patterns to enhance
              our AI models and user experience.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-200">
              3. Data Sharing
            </h2>
            <p>
              We do not sell your personal data. We may share data with service
              providers (hosting, analytics, AI processing) who are bound by
              confidentiality agreements. We may disclose data if required by
              law.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-200">
              4. Your Projects
            </h2>
            <p>
              Project data you create on Bleuprint remains yours. We do not use
              individual project designs to train our AI models without explicit
              consent. Anonymized, aggregated data may be used to improve the
              platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-200">
              5. Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your
              data, including encryption in transit and at rest. However, no
              system is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-200">
              6. Your Rights
            </h2>
            <p>
              Under GDPR and CCPA, you have the right to access, correct,
              delete, or export your data. Contact us at{" "}
              <a
                href="mailto:privacy@bleuprint.app"
                className="text-purple-400"
              >
                privacy@bleuprint.app
              </a>{" "}
              to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-200">
              7. Cookies
            </h2>
            <p>
              We use essential cookies for authentication and session management.
              We use analytics cookies to understand how the platform is used.
              You can disable non-essential cookies in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-200">
              8. Contact
            </h2>
            <p>
              For privacy-related concerns, contact us at{" "}
              <a
                href="mailto:privacy@bleuprint.app"
                className="text-purple-400"
              >
                privacy@bleuprint.app
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
