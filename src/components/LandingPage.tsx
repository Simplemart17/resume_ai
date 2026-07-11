import { FiFileText, FiDownload, FiZap, FiArrowRight, FiCheck, FiUpload, FiEdit3, FiShare2 } from 'react-icons/fi';
import Link from 'next/link';
import { TemplatePreview } from './TemplatePreview';
import { TEMPLATES } from '@/config/templates';
import { LogoMark } from './Logo';
import { TemplatesModalProvider, TemplatesModalTrigger } from './landing/TemplatesModal';

export function LandingPage() {
  const features = [
    {
      icon: <FiFileText className="w-8 h-8" />,
      title: "Professional Templates",
      description: "Choose from 4+ beautifully designed resume templates or upload your own custom template."
    },
    {
      icon: <FiZap className="w-8 h-8" />,
      title: "AI-Powered Optimization",
      description: "Get intelligent suggestions to improve your resume and match job requirements perfectly."
    },
    {
      icon: <FiDownload className="w-8 h-8" />,
      title: "High-Quality PDF Export",
      description: "Download your resume as a professional PDF that looks exactly like your chosen template."
    },
    {
      icon: <FiEdit3 className="w-8 h-8" />,
      title: "Easy Resume Builder",
      description: "Build your resume step-by-step with our intuitive interface and real-time preview."
    },
    {
      icon: <FiUpload className="w-8 h-8" />,
      title: "Custom Template Upload",
      description: "Upload your own resume template and generate PDFs in your unique style."
    },
    {
      icon: <FiShare2 className="w-8 h-8" />,
      title: "Job Application Auto-Fill",
      description: "Extract information from your resume to quickly fill job application forms."
    }
  ];

  return (
    <TemplatesModalProvider>
      <div className="min-h-screen bg-white">
        {/* Navigation */}

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-up">
                Create Your Perfect Resume with{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Power
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-up animation-delay-200">
                Build professional resumes with our AI-powered platform. Choose from beautiful templates,
                optimize for job descriptions, and download high-quality PDFs in minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up animation-delay-400">
                <Link
                  href="/builder"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Start Building Now <FiArrowRight className="w-5 h-5" />
                </Link>

                <TemplatesModalTrigger className="text-gray-600 hover:text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold border border-gray-300 hover:border-gray-400 transition-all duration-200 flex items-center gap-2">
                  <FiFileText className="w-5 h-5" />
                  View Templates
                </TemplatesModalTrigger>
              </div>

              <div className="mt-12 flex justify-center items-center gap-8 text-sm text-gray-500 animate-fade-up animation-delay-600">
                <div className="flex items-center gap-2">
                  <FiCheck className="w-4 h-4 text-green-500" />
                  No Credit Card Required
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="w-4 h-4 text-green-500" />
                  Free Templates
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="w-4 h-4 text-green-500" />
                  AI-Powered
                </div>
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Land Your Dream Job
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our comprehensive platform provides all the tools you need to create, optimize, and share your professional resume.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                >
                  <div className="text-blue-600 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates Section */}
        <section id="templates" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Professional Resume Templates
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose from our collection of professionally designed templates or upload your own custom design.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="h-48 p-4 bg-gray-50">
                    <TemplatePreview templateId={template.id} className="h-full" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {template.description}
                    </p>
                    <Link
                      href="/builder"
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors duration-200 block text-center"
                    >
                      Use Template
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Start for free and upgrade when you need more features. No hidden fees, no surprises.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-4">$0</div>
                  <p className="text-gray-600 mb-6">Perfect for getting started</p>

                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center gap-3">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">3 Resume Templates</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">Basic AI Optimization</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">PDF Download</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">5 Downloads/month</span>
                    </li>
                  </ul>

                  <Link
                    href="/builder"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors duration-200 block text-center"
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 shadow-xl relative">
                <div className="absolute top-4 right-4">
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>

                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Pro</h3>
                  <div className="text-4xl font-bold mb-4">$9.99</div>
                  <p className="text-blue-100 mb-6">Everything you need to succeed</p>

                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center gap-3">
                      <FiCheck className="w-5 h-5 text-green-400" />
                      <span className="text-blue-100">All Resume Templates</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FiCheck className="w-5 h-5 text-green-400" />
                      <span className="text-blue-100">Advanced AI Optimization</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FiCheck className="w-5 h-5 text-green-400" />
                      <span className="text-blue-100">Custom Template Upload</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FiCheck className="w-5 h-5 text-green-400" />
                      <span className="text-blue-100">Unlimited Downloads</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FiCheck className="w-5 h-5 text-green-400" />
                      <span className="text-blue-100">Cover Letter Generator</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FiCheck className="w-5 h-5 text-green-400" />
                      <span className="text-blue-100">Priority Support</span>
                    </li>
                  </ul>

                  <Link
                    href="/builder"
                    className="w-full bg-white text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 block text-center"
                  >
                    Start Pro Trial
                  </Link>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-4">Custom</div>
                  <p className="text-gray-600 mb-6">For teams and organizations</p>

                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center gap-3">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">Everything in Pro</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">Team Management</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">Custom Branding</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">API Access</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">Dedicated Support</span>
                    </li>
                  </ul>

                  <Link
                    href="/builder"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors duration-200 block text-center"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Build Your Perfect Resume?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Join thousands of job seekers who have successfully landed their dream jobs with our AI-powered resume builder.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/builder"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Start Building Now <FiArrowRight className="w-5 h-5" />
                </Link>
                <TemplatesModalTrigger className="text-white border border-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 flex items-center gap-2">
                  <FiFileText className="w-5 h-5" />
                  View Examples
                </TemplatesModalTrigger>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2.5 mb-2">
                  <LogoMark size={32} />
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    ResumeAI Pro
                  </span>
                </span>
                <p className="text-gray-400 max-w-md">
                  The most advanced AI-powered resume builder that helps you create professional resumes and land your dream job.
                </p>
              </div>

              <nav aria-label="Footer" className="flex flex-wrap gap-6">
                <Link href="/builder" className="text-gray-400 hover:text-white transition-colors">
                  Resume Builder
                </Link>
                <Link href="/optimize" className="text-gray-400 hover:text-white transition-colors">
                  AI Optimizer
                </Link>
                <Link href="/autofill" className="text-gray-400 hover:text-white transition-colors">
                  Auto-Fill
                </Link>
              </nav>
            </div>

            <div className="border-t border-gray-800 mt-10 pt-8 text-center">
              <p className="text-gray-400">
                © {new Date().getFullYear()} ResumeAI Pro. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </TemplatesModalProvider>
  );
}
