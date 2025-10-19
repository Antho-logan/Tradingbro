"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Reveal } from '@/components/anim/Reveal';
import {
  Upload,
  MessageCircle,
  Target,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    number: 1,
    icon: Upload,
    title: "Drop in your chart",
    description: "Upload a screenshot or paste an image of any trading chart. Our AI instantly recognizes patterns, indicators, and price action.",
    details: ["Support for all chart types", "Automatic pattern recognition", "Multi-timeframe analysis"]
  },
  {
    number: 2,
    icon: MessageCircle,
    title: "Get AI coaching",
    description: "Our AI asks targeted questions about your trading plan, risk management, and emotional state. It's like having a pro trader in your corner.",
    details: ["Personalized questions", "Risk assessment", "Psychology insights"]
  },
  {
    number: 3,
    icon: Target,
    title: "Execute with confidence",
    description: "Receive a step-by-step trading plan with entry points, stop losses, and targets. Track results and improve over time.",
    details: ["Actionable trading plans", "Risk-reward calculations", "Performance tracking"]
  }
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal direction="up" delay={0}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              From chart analysis to confident execution in three simple steps.
            </p>
          </div>
        </Reveal>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Reveal key={step.number} direction="up" delay={index * 200}>
                <div className="relative">
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800 -translate-x-1/2"></div>
                  )}

                  <Card className="h-full relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden group">
                    {/* Number Badge */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {step.number}
                    </div>

                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <CardHeader className="relative z-10 pb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-0.5 mb-4">
                        <div className="w-full h-full bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center">
                          <IconComponent className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        {step.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {step.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="relative z-10 pt-0">
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    {/* Hover Effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </Card>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* CTA Section */}
        <Reveal direction="up" delay={800}>
          <Card className="bg-gradient-to-br from-blue-600 to-purple-600 border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}></div>
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Ready to stop losing and start learning?
                </h3>
                <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
                  Join thousands of traders who&apos;ve improved their performance with AI-powered coaching.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href="/sign-up" className="flex items-center gap-2">
                      Start Free Trial
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg transition-all duration-300"
                  >
                    <Link href="/demo">
                      Watch Demo
                    </Link>
                  </Button>
                </div>

                <div className="mt-6 text-sm text-blue-100">
                  No credit card required • 14-day free trial • Cancel anytime
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}