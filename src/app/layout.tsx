import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { SiteFooter } from "@/components/SiteFooter";

// Three type voices: display (headlines), sans (body/UI), mono (the machine
// layer — ATS readouts, labels, scores). See globals.css for the token map.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const TITLE = "ResumeAI Pro — written for people, read by machines";
const DESCRIPTION =
  "Most resumes are screened by software before a person sees them. Build a cleanly typeset resume, score it against any job description, and fix what the parser can't see — before you apply.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "ResumeAI Pro",
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "ResumeAI Pro",
    type: "website",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Clerk is optional: without its env vars the app runs in "no accounts"
  // mode and ClerkProvider (which throws without a publishable key) is
  // omitted entirely.
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const app = (
    <html lang="en">
      <body
        className={`${bricolage.variable} ${instrument.variable} ${plexMono.variable} antialiased`}
      >
        <Navigation />
        {children}
        <SiteFooter />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#16181d",
              border: "1px solid rgb(22 24 29 / 0.14)",
              borderRadius: "3px",
              boxShadow: "0 1px 2px rgb(22 24 29 / 0.05), 0 12px 24px -16px rgb(22 24 29 / 0.18)",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#1e7a4e", secondary: "#ffffff" } },
            error: { iconTheme: { primary: "#b3372b", secondary: "#ffffff" } },
          }}
        />
      </body>
    </html>
  );

  return clerkEnabled ? <ClerkProvider>{app}</ClerkProvider> : app;
}
