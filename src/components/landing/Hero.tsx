"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/anim/Reveal';
import { TerminalChart } from './TerminalChart';
import { ArrowRight, BookOpen, TrendingUp } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(0, 0, 0, 0.05) 25%, rgba(0, 0, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 0, 0, 0.05) 25%, rgba(0, 0, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05) 76%, transparent 77%, transparent)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <Reveal direction="up" delay={0}>
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  You&apos;ve lost enough.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                    Learn to trade — with an AI coach.
                  </span>
                </h1>
              </div>
            </Reveal>

            <Reveal direction="up" delay={200}>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                TraderBro reads your chart screenshots, asks the right follow-ups, and drafts step-by-step plans you can execute and journal.
              </p>
            </Reveal>

            <Reveal direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/sign-up" className="flex items-center gap-2">
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 dark:border-gray-600 px-8 py-4 text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  <Link href="/sign-in" className="flex items-center gap-2">
                    Sign In
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="px-8 py-4 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  <Link href="/learn" className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Read the Guide
                  </Link>
                </Button>
              </div>
            </Reveal>

            <Reveal direction="up" delay={600}>
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>Built by traders, for traders</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Content - Terminal Chart */}
          <Reveal direction="right" delay={800}>
            <div className="flex justify-center lg:justify-end">
              <TerminalChart className="w-full max-w-md" />
            </div>
          </Reveal>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></div>
    </section>
  );
}