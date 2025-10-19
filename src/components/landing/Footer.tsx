"use client";

import React from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Reveal } from '@/components/anim/Reveal';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <Reveal direction="up" delay={0}>
            <div className="grid md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="md:col-span-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  TraderBro
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  AI-powered trading coaching to help you trade smarter, not harder.
                </p>
              </div>

              {/* Product */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Product
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/demo" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Demo
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Resources
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/learn" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Trading Guide
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/support" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Support
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Company
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Separator */}
        <Separator className="bg-gray-200 dark:bg-gray-700" />

        {/* Bottom Footer */}
        <div className="py-6">
          <Reveal direction="up" delay={200}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Copyright */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                © {currentYear} TraderBro — Education only. No financial advice.
              </div>

              {/* Legal Links */}
              <div className="flex items-center gap-6 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Built by traders, for traders
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Education Disclaimer - More Prominent */}
        <Reveal direction="up" delay={400}>
          <div className="pb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong className="font-semibold">Important Disclaimer:</strong> TraderBro provides educational content and tools only. We are not financial advisors and do not provide investment advice. Trading involves substantial risk of loss. Always do your own research and consult with qualified financial professionals before making any investment decisions.
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}