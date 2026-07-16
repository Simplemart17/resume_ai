import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDocument, type LegalSection } from '@/components/legal/LegalDocument';

const EFFECTIVE_DATE = 'July 16, 2026';
const CONTACT = 'privacy@simplemart.dev';
const JURISDICTION = 'Province of Manitoba and the federal laws of Canada applicable therein';

export const metadata: Metadata = {
  title: 'Terms of Service — ResumeAI Pro',
  description:
    'The terms that govern your use of ResumeAI Pro, including accounts, purchases, acceptable use, and AI-generated content.',
  robots: { index: true, follow: true },
};

const sections: LegalSection[] = [
  {
    id: 'acceptance',
    heading: 'Acceptance of terms',
    body: (
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of the ResumeAI Pro
        website and services (the &quot;Service&quot;), operated by ResumeAI Pro (&quot;we,&quot;
        &quot;us,&quot; or &quot;our&quot;). By accessing or using the Service, you agree to be bound
        by these Terms and by our{' '}
        <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not use the Service.
      </p>
    ),
  },
  {
    id: 'the-service',
    heading: 'The Service',
    body: (
      <p>
        ResumeAI Pro provides tools to build, format, score, and optimize resumes, generate cover
        letters, and assist with job applications. We may add, change, or remove features at any
        time. Some features rely on third-party providers and may require you to supply your own API
        key.
      </p>
    ),
  },
  {
    id: 'eligibility',
    heading: 'Eligibility',
    body: (
      <p>
        You must be at least 16 years old, or the age of majority in your jurisdiction, to use the
        Service. By using the Service you represent that you meet this requirement and that the
        information you provide is accurate.
      </p>
    ),
  },
  {
    id: 'accounts',
    heading: 'Accounts and authentication',
    body: (
      <>
        <p>
          Some features require an account. You may create one using a supported sign-in method,
          including Google Sign-In. You are responsible for maintaining the confidentiality of your
          account and for all activity that occurs under it.
        </p>
        <p>
          You agree to provide accurate information and to notify us of any unauthorized use of your
          account. We may suspend or terminate accounts that violate these Terms.
        </p>
      </>
    ),
  },
  {
    id: 'purchases',
    heading: 'Purchases and payments',
    body: (
      <>
        <p>
          Paid tiers are offered as one-time purchases and are processed by our payment provider
          (Stripe). Current pricing and the features included in each tier are shown on our pricing
          page and may change for future purchases. Prices are stated in the currency shown at
          checkout.
        </p>
        <p>
          Access to paid features is granted after your payment is confirmed. Except where required
          by applicable law, purchases are non-refundable. You are responsible for any taxes that may
          apply to your purchase.
        </p>
      </>
    ),
  },
  {
    id: 'byo-key',
    heading: 'Bring-your-own-key AI features',
    body: (
      <p>
        AI-powered features may require you to provide your own API key from a third-party AI
        provider. You are solely responsible for obtaining that key, keeping it secure, complying
        with the provider&apos;s terms, and paying any charges the provider bills you for your usage.
        We are not responsible for costs, limits, or actions taken by the AI provider on your
        account.
      </p>
    ),
  },
  {
    id: 'your-content',
    heading: 'Your content',
    body: (
      <>
        <p>
          You retain ownership of the resume content and other materials you create or upload
          (&quot;Your Content&quot;). You grant us a limited, non-exclusive license to store,
          process, and transmit Your Content solely to provide the Service to you, including sending
          it to the AI provider when you initiate an AI feature.
        </p>
        <p>
          You represent that you have the right to submit Your Content and that it does not infringe
          the rights of any third party.
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    heading: 'Acceptable use',
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>use the Service for any unlawful, fraudulent, or harmful purpose;</li>
          <li>
            submit false, misleading, or fraudulent information, including in resumes or job
            applications;
          </li>
          <li>
            attempt to disrupt, overload, reverse engineer, or gain unauthorized access to the
            Service or its systems;
          </li>
          <li>infringe the intellectual property or privacy rights of others; or</li>
          <li>use automated means to scrape or abuse the Service beyond permitted use.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'ai-disclaimer',
    heading: 'AI-generated content',
    body: (
      <p>
        AI features produce automated suggestions that may be inaccurate, incomplete, or unsuitable
        for your situation. You are responsible for reviewing and verifying any AI-generated output
        before relying on or submitting it. We do not guarantee any particular outcome, including
        interviews, job offers, or applicant-tracking-system results.
      </p>
    ),
  },
  {
    id: 'intellectual-property',
    heading: 'Intellectual property',
    body: (
      <p>
        The Service, including its software, design, templates, and branding, is owned by ResumeAI
        Pro and protected by intellectual property laws. Except for Your Content, you may not copy,
        modify, distribute, or create derivative works from the Service without our permission.
      </p>
    ),
  },
  {
    id: 'third-party',
    heading: 'Third-party services',
    body: (
      <p>
        The Service integrates with third-party providers, including Google, Clerk, Stripe, OpenAI,
        Supabase, and Adzuna. Your use of those services is governed by their own terms and privacy
        policies. We are not responsible for the availability, content, or practices of third-party
        services.
      </p>
    ),
  },
  {
    id: 'disclaimers',
    heading: 'Disclaimers',
    body: (
      <p>
        The Service is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of
        any kind, whether express or implied, including warranties of merchantability, fitness for a
        particular purpose, and non-infringement. We do not warrant that the Service will be
        uninterrupted, error-free, or secure.
      </p>
    ),
  },
  {
    id: 'liability',
    heading: 'Limitation of liability',
    body: (
      <p>
        To the maximum extent permitted by law, ResumeAI Pro and its operators will not be liable for
        any indirect, incidental, special, consequential, or punitive damages, or for lost profits or
        data, arising from your use of the Service. Our total liability for any claim relating to the
        Service will not exceed the amount you paid us, if any, in the twelve months before the claim
        arose.
      </p>
    ),
  },
  {
    id: 'indemnification',
    heading: 'Indemnification',
    body: (
      <p>
        You agree to indemnify and hold harmless ResumeAI Pro and its operators from any claims,
        damages, losses, or expenses (including reasonable legal fees) arising from your use of the
        Service, Your Content, or your violation of these Terms or applicable law.
      </p>
    ),
  },
  {
    id: 'termination',
    heading: 'Termination',
    body: (
      <p>
        You may stop using the Service at any time. We may suspend or terminate your access if you
        violate these Terms or if we discontinue the Service. Provisions that by their nature should
        survive termination — including ownership, disclaimers, and limitation of liability — will
        survive.
      </p>
    ),
  },
  {
    id: 'changes',
    heading: 'Changes to these terms',
    body: (
      <p>
        We may update these Terms from time to time. When we do, we will revise the effective date at
        the top of this page. Your continued use of the Service after an update constitutes
        acceptance of the revised Terms.
      </p>
    ),
  },
  {
    id: 'governing-law',
    heading: 'Governing law',
    body: (
      <p>
        These Terms are governed by the laws of the {JURISDICTION}, without regard to conflict-of-law
        principles. You agree to submit to the exclusive jurisdiction of the courts located in
        Manitoba, Canada for any dispute arising from these Terms or the Service.
      </p>
    ),
  },
  {
    id: 'contact',
    heading: 'Contact us',
    body: (
      <p>
        If you have questions about these Terms, contact us at{' '}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="legal"
      title="Terms of Service"
      intro="The terms that govern your use of ResumeAI Pro — accounts, purchases, acceptable use, and AI-generated content."
      effectiveDate={EFFECTIVE_DATE}
      strip={{ token: 'terms', text: `effective ${EFFECTIVE_DATE} · v1.0` }}
      sections={sections}
    />
  );
}
