'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiDownload, FiZap, FiArrowRight, FiCheck, FiUpload, FiEdit3, FiShare2, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { TemplatePreview } from './TemplatePreview';

export function LandingPage() {
  const [showTemplates, setShowTemplates] = useState(false);

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

  const templates = [
    {
      id: "modern-professional",
      name: "Modern Professional",
      description: "Clean, contemporary design perfect for tech and business roles",
      color: "from-blue-500 to-purple-600"
    },
    {
      id: "classic-traditional",
      name: "Classic Traditional",
      description: "Traditional format ideal for conservative industries",
      color: "from-gray-600 to-gray-800"
    },
    {
      id: "creative-designer",
      name: "Creative Designer",
      description: "Bold, colorful design great for creative professionals",
      color: "from-pink-500 to-orange-500"
    },
    {
      id: "executive-premium",
      name: "Executive Premium",
      description: "Sophisticated layout for senior-level positions",
      color: "from-indigo-600 to-blue-700"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Create Your Perfect Resume with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Power
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Build professional resumes with our AI-powered platform. Choose from beautiful templates,
              optimize for job descriptions, and download high-quality PDFs in minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/builder"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Start Building Now <FiArrowRight className="w-5 h-5" />
              </Link>

              <button
                onClick={() => setShowTemplates(true)}
                className="text-gray-600 hover:text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold border border-gray-300 hover:border-gray-400 transition-all duration-200 flex items-center gap-2"
              >
                <FiFileText className="w-5 h-5" />
                View Templates
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 flex justify-center items-center gap-8 text-sm text-gray-500"
            >
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
            </motion.div>
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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
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
              </motion.div>
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
            {templates.map((template, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
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
              </motion.div>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg"
            >
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
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 shadow-xl relative"
            >
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
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg"
            >
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
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
              <button
                onClick={() => setShowTemplates(true)}
                className="text-white border border-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 flex items-center gap-2"
              >
                <FiFileText className="w-5 h-5" />
                View Examples
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                ResumeAI Pro
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                The most advanced AI-powered resume builder that helps you create professional resumes and land your dream job.
              </p>
              {/* <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div> */}
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} ResumeAI Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Template Modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTemplates(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-6xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Professional Resume Templates
                  </h3>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {templates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors duration-300"
                    >
                      <div className="h-64 p-6 bg-gray-50">
                        <TemplatePreview templateId={template.id} className="h-full" />
                      </div>
                      <div className="p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {template.name}
                        </h4>
                        <p className="text-gray-600 mb-4">
                          {template.description}
                        </p>
                        <Link
                          href="/builder"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200 block text-center"
                          onClick={() => setShowTemplates(false)}
                        >
                          Use This Template
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <Link
                    href="/builder"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center gap-2"
                    onClick={() => setShowTemplates(false)}
                  >
                    Start Building Your Resume <FiArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
