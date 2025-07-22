import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Landing = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-light-gradient dark:bg-dark-gradient">
      {/* Header */}
      <nav className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-2 rounded-lg shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  QuickBill
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              
              <Link
                to="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary px-4 py-2 rounded-lg text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              Create Professional{' '}
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Invoices
              </span>{' '}
              in Minutes
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
              QuickBill makes invoicing simple, fast, and professional. Create stunning invoices, track payments, and manage clients all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Start Free Trial
              </Link>
              <button className="px-8 py-4 rounded-xl text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200">
                Watch Demo
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-primary-200 dark:bg-primary-800 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-16 h-16 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-20 w-12 h-12 bg-indigo-200 dark:bg-indigo-800 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-dark-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to manage invoices
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From creating professional invoices to tracking payments, QuickBill has all the tools you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Professional Templates</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose from beautiful, customizable invoice templates that make your business look professional.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Payment Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Keep track of paid and unpaid invoices. Get notifications when payments are received.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Client Management</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Organize your clients and their information in one place. Quick access to contact details and history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Invoice Templates Showcase */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Beautiful Invoice Templates
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose from our collection of professionally designed invoice templates. All templates are fully customizable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Template 1 - Modern */}
            <div className="card overflow-hidden hover:scale-105 transition-transform duration-300 group">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 h-64 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-bold text-blue-900 dark:text-blue-100">INVOICE</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">#001</div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded w-3/4"></div>
                    <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-1 bg-blue-300 dark:bg-blue-700 rounded w-1/3"></div>
                    <div className="h-1 bg-blue-300 dark:bg-blue-700 rounded w-1/4"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-1 bg-blue-300 dark:bg-blue-700 rounded w-1/4"></div>
                    <div className="h-1 bg-blue-300 dark:bg-blue-700 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Modern Blue</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Clean and professional design perfect for modern businesses.</p>
              </div>
            </div>

            {/* Template 2 - Minimalist */}
            <div className="card overflow-hidden hover:scale-105 transition-transform duration-300 group">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-6 h-64 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">Invoice</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">#002</div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                    <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="space-y-1 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between">
                    <div className="h-1 bg-gray-400 dark:bg-gray-600 rounded w-1/2"></div>
                    <div className="h-1 bg-gray-400 dark:bg-gray-600 rounded w-1/4"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-2 bg-gray-600 dark:bg-gray-400 rounded w-1/3"></div>
                    <div className="h-2 bg-gray-600 dark:bg-gray-400 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Minimalist</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Simple and clean design that focuses on content.</p>
              </div>
            </div>

            {/* Template 3 - Corporate */}
            <div className="card overflow-hidden hover:scale-105 transition-transform duration-300 group">
              <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 p-6 h-64 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100">INVOICE</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">#003</div>
                  </div>
                  <div className="bg-emerald-600 dark:bg-emerald-700 h-1 w-full mb-4 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-2 bg-emerald-200 dark:bg-emerald-800 rounded w-3/4"></div>
                    <div className="h-2 bg-emerald-200 dark:bg-emerald-800 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 -mx-6 -mb-6 p-4 space-y-1">
                  <div className="flex justify-between">
                    <div className="h-1 bg-emerald-400 dark:bg-emerald-600 rounded w-1/3"></div>
                    <div className="h-1 bg-emerald-400 dark:bg-emerald-600 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Corporate Green</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Professional template with bold accents for established businesses.</p>
              </div>
            </div>

            {/* Template 4 - Creative */}
            <div className="card overflow-hidden hover:scale-105 transition-transform duration-300 group">
              <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-6 h-64 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-bold text-purple-900 dark:text-purple-100">Invoice</div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">#004</div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded w-3/4"></div>
                    <div className="h-2 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-1 bg-purple-300 dark:bg-purple-700 rounded w-1/3"></div>
                    <div className="h-1 bg-pink-300 dark:bg-pink-700 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Creative</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Colorful design perfect for creative agencies and freelancers.</p>
              </div>
            </div>

            {/* Template 5 - Professional */}
            <div className="card overflow-hidden hover:scale-105 transition-transform duration-300 group">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 p-6 h-64 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">INVOICE</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">#005</div>
                  </div>
                  <div className="border-l-4 border-slate-600 dark:border-slate-400 pl-4 mb-4">
                    <div className="space-y-2">
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-300 dark:border-slate-600 pt-4 space-y-1">
                  <div className="flex justify-between">
                    <div className="h-1 bg-slate-400 dark:bg-slate-600 rounded w-1/2"></div>
                    <div className="h-1 bg-slate-400 dark:bg-slate-600 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Professional</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Sophisticated design for consulting and professional services.</p>
              </div>
            </div>

            {/* Template 6 - Tech */}
            <div className="card overflow-hidden hover:scale-105 transition-transform duration-300 group">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 p-6 h-64 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-bold text-cyan-900 dark:text-cyan-100">invoice.exe</div>
                    <div className="text-xs text-cyan-600 dark:text-cyan-400">#006</div>
                  </div>
                  <div className="font-mono text-xs space-y-1">
                    <div className="h-1 bg-cyan-300 dark:bg-cyan-700 rounded w-3/4"></div>
                    <div className="h-1 bg-cyan-300 dark:bg-cyan-700 rounded w-1/2"></div>
                    <div className="h-1 bg-cyan-300 dark:bg-cyan-700 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="border border-cyan-200 dark:border-cyan-800 rounded p-2 space-y-1">
                  <div className="h-1 bg-cyan-400 dark:bg-cyan-600 rounded w-full"></div>
                  <div className="h-1 bg-cyan-400 dark:bg-cyan-600 rounded w-2/3"></div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tech</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Modern tech-inspired design for software companies and developers.</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/register"
              className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Start Creating Invoices
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-700 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to streamline your invoicing?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of businesses that trust QuickBill for their invoicing needs.
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 inline-block"
          >
            Get Started Free
          </Link>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white rounded-full"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-dark-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-xl font-bold">QuickBill</span>
              </div>
              <p className="text-gray-400 mb-4">
                The easiest way to create professional invoices and manage your billing. Join thousands of businesses worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2024 QuickBill. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 