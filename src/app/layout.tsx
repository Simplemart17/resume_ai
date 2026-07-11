import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResumeAI Pro - AI-Powered Resume Builder",
  description: "Create professional resumes with AI-powered optimization, beautiful templates, and instant PDF downloads. Build your perfect resume in minutes.",
  keywords: "resume builder, AI resume, professional templates, PDF generator, job application, career tools",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );

  return clerkEnabled ? <ClerkProvider>{app}</ClerkProvider> : app;
}
