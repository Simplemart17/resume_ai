import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDocument, type LegalSection } from '@/components/legal/LegalDocument';

const EFFECTIVE_DATE = 'July 16, 2026';
const CONTACT = 'privacy@simplemart.dev';

export const metadata: Metadata = {
  title: 'Privacy Policy — ResumeAI Pro',
  description:
    'How ResumeAI Pro collects, uses, stores, and shares your information, including data received through Google Sign-In.',
  robots: { index: true, follow: true },
};

const sections: LegalSection[] = [
  {
    id: 'overview',
    heading: 'Overview',
    body: (
      <>
        <p>
          ResumeAI Pro (&quot;ResumeAI Pro,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
          provides tools to build, optimize, and export resumes. This Privacy Policy explains what
          information we collect when you use our website and services (the &quot;Service&quot;), how
          we use and share it, and the choices you have.
        </p>
        <p>
          By using the Service, you agree to the collection and use of information in accordance with
          this policy. If you do not agree, please do not use the Service.
        </p>
      </>
    ),
  },
  {
    id: 'information-we-collect',
    heading: 'Information we collect',
    body: (
      <>
        <p>We collect the following categories of information:</p>
        <ul>
          <li>
            <strong>Account information.</strong> When you create an account or sign in — including
            signing in with Google — we receive your name, email address, and profile picture from
            your chosen sign-in provider. Authentication is handled by our identity provider (Clerk),
            and we store an account identifier associated with you.
          </li>
          <li>
            <strong>Resume content you provide.</strong> The personal details, work history,
            education, skills, summaries, and other text you enter into the builder, and the files
            (PDF, DOCX, or TXT) you upload to be parsed. This content is provided by you and may
            include contact information and employment history.
          </li>
          <li>
            <strong>Job descriptions.</strong> Text you paste to score or optimize a resume against a
            role.
          </li>
          <li>
            <strong>Purchase records.</strong> If you buy a paid tier, our payment processor (Stripe)
            handles your card details. We do not receive or store your full card number; we retain a
            record of the purchase, such as the tier, a payment session identifier, and the date.
          </li>
          <li>
            <strong>AI API keys.</strong> If you provide your own AI provider API key, it is stored
            in your browser (session storage, or local storage only if you opt into persistence) and
            sent to our server solely to make the request you initiated. We do not store your API key
            in our database.
          </li>
          <li>
            <strong>Usage and technical data.</strong> Basic request metadata, including your IP
            address, which we use to apply rate limits and protect the Service from abuse.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'google-user-data',
    heading: 'Google user data and Limited Use',
    body: (
      <>
        <p>
          If you sign in with Google, we access a limited set of information from your Google Account
          through Google Sign-In: your basic profile (name and profile picture) and your email
          address. We use this information only to:
        </p>
        <ul>
          <li>create and secure your ResumeAI Pro account;</li>
          <li>authenticate you when you sign in; and</li>
          <li>display your identity (such as your name or email) within the Service.</li>
        </ul>
        <p>
          We do <strong>not</strong> use Google user data for advertising, and we do{' '}
          <strong>not</strong> sell it. We do not share it with third parties except our
          sub-processors as needed to operate the Service, or as required by law.
        </p>
        <p>
          <strong>Limited Use disclosure.</strong> ResumeAI Pro&apos;s use and transfer of
          information received from Google APIs to any other app will adhere to the{' '}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
        <p>
          You can review or revoke ResumeAI Pro&apos;s access to your Google Account at any time from
          your{' '}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Account permissions page
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    heading: 'How we use your information',
    body: (
      <>
        <p>We use the information we collect to:</p>
        <ul>
          <li>provide, operate, and maintain the Service, including building and exporting resumes;</li>
          <li>authenticate you and maintain your account and purchased entitlements;</li>
          <li>process purchases and grant access to paid features;</li>
          <li>
            generate AI-assisted results — such as resume optimizations and cover letters — when you
            initiate them, by sending the relevant text to our AI provider;
          </li>
          <li>prevent fraud and abuse, including rate limiting; and</li>
          <li>comply with legal obligations and enforce our Terms of Service.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'ai-processing',
    heading: 'AI processing of your content',
    body: (
      <>
        <p>
          When you use AI features (such as resume optimization or cover letter generation), the
          resume text and job description you submit are sent to our AI provider (OpenAI) to generate
          the result. If you supply your own API key, the request is made using your key under your
          own account with that provider.
        </p>
        <p>
          The AI provider&apos;s handling of that data is governed by its own terms and privacy
          policy. We do not use your resume content to train AI models.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-share',
    heading: 'How we share information',
    body: (
      <>
        <p>
          We do not sell your personal information. We share information only with service providers
          (&quot;sub-processors&quot;) that help us operate the Service, and only as needed for that
          purpose:
        </p>
        <ul>
          <li>
            <strong>Google</strong> — sign-in and authentication (when you choose Google Sign-In).
          </li>
          <li>
            <strong>Clerk</strong> — user authentication and account management.
          </li>
          <li>
            <strong>Supabase</strong> — database storage for account, purchase, and usage records.
          </li>
          <li>
            <strong>Stripe</strong> — payment processing.
          </li>
          <li>
            <strong>OpenAI</strong> — AI generation for optimization and cover letter features.
          </li>
          <li>
            <strong>Adzuna</strong> — job search results, where such features are used.
          </li>
        </ul>
        <p>
          We may also disclose information if required by law, to protect our rights or the safety of
          others, or in connection with a merger, acquisition, or sale of assets.
        </p>
      </>
    ),
  },
  {
    id: 'data-retention',
    heading: 'Data retention',
    body: (
      <p>
        We retain account and purchase records for as long as your account is active and as needed to
        provide the Service, resolve disputes, and meet legal, tax, or accounting requirements.
        Resume content you enter is retained to provide the Service to you. You may request deletion
        of your account and associated data as described below.
      </p>
    ),
  },
  {
    id: 'security',
    heading: 'Data security',
    body: (
      <p>
        We use reasonable technical and organizational measures to protect your information,
        including transport encryption (HTTPS) and server-side handling of secret keys. Sensitive
        credentials, such as payment details, are handled by our payment processor and are never
        stored on our servers. No method of transmission or storage is completely secure, and we
        cannot guarantee absolute security.
      </p>
    ),
  },
  {
    id: 'your-rights',
    heading: 'Your rights and choices',
    body: (
      <>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>access, correct, or update the personal information we hold about you;</li>
          <li>request deletion of your account and personal information;</li>
          <li>withdraw consent where processing is based on consent; and</li>
          <li>
            revoke third-party sign-in access, such as Google, from that provider&apos;s account
            settings.
          </li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{' '}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. We will respond within a reasonable time and
          as required by applicable law.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    heading: "Children's privacy",
    body: (
      <p>
        The Service is not directed to children under 16, and we do not knowingly collect personal
        information from them. If you believe a child has provided us with personal information,
        please contact us and we will take steps to delete it.
      </p>
    ),
  },
  {
    id: 'international',
    heading: 'International data transfers',
    body: (
      <p>
        We operate from Canada and use service providers that may store and process your information
        in other countries. Where required, we take steps to ensure your information receives an
        adequate level of protection when transferred across borders.
      </p>
    ),
  },
  {
    id: 'changes',
    heading: 'Changes to this policy',
    body: (
      <p>
        We may update this Privacy Policy from time to time. When we do, we will revise the effective
        date at the top of this page. Material changes will be reflected here, and your continued use
        of the Service after an update constitutes acceptance of the revised policy.
      </p>
    ),
  },
  {
    id: 'contact',
    heading: 'Contact us',
    body: (
      <p>
        If you have questions about this Privacy Policy or our handling of your information, contact
        us at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. You can also review our{' '}
        <Link href="/terms">Terms of Service</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="legal"
      title="Privacy Policy"
      intro="What we collect, how we use it, and the choices you have — including the data we receive through Google Sign-In."
      effectiveDate={EFFECTIVE_DATE}
      strip={{ token: 'privacy', text: `effective ${EFFECTIVE_DATE} · v1.0` }}
      sections={sections}
    />
  );
}
