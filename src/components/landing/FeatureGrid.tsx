"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/anim/Reveal';
import AnimatedNumber from '@/components/anim/AnimatedNumber';
import {
  Brain,
  BarChart3,
  FileText,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "Image-Aware Coaching",
    description: "Drop in any chart screenshot. Our AI analyzes patterns, identifies setups, and asks targeted questions about your entry logic, risk management, and emotional state.",
    badge: "AI-Powered",
    stats: { value: 94, label: "Analysis Accuracy", suffix: "%" },
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: FileText,
    title: "Journal & Analytics",
    description: "Document every trade with screenshots, notes, and performance metrics. Track patterns in your trading behavior and get personalized insights.",
    badge: "Data-Driven",
    stats: { value: 1000, label: "Trades Tracked", suffix: "+" },
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: BarChart3,
    title: "Weekly Reports",
    description: "Receive comprehensive weekly performance analysis with win rates, PnL trends, and actionable coaching recommendations based on your trading history.",
    badge: "Automated",
    stats: { value: 7, label: "Day Analysis", suffix: "" },
    gradient: "from-green-500 to-emerald-500"
  }
];

export function FeatureGrid() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal direction="up" delay={0}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to trade smarter
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Stop guessing. Start trading with data-driven insights and personalized AI guidance.
            </p>
          </div>
        </Reveal>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Reveal key={feature.title} direction="up" delay={index * 200}>
                <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900">
                  {/* Gradient Background Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                  {/* Card Header */}
                  <CardHeader className="relative z-10 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} p-0.5`}>
                        <div className="w-full h-full rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center">
                          <IconComponent className={`w-6 h-6 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`} />
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>

                  {/* Card Content */}
                  <CardContent className="relative z-10 pt-0">
                    <CardDescription className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      {feature.description}
                    </CardDescription>

                    {/* Stats */}
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-gray-900 dark:text-white text-green-600 dark:text-green-400">
                        <AnimatedNumber
                          to={feature.stats.value}
                          suffix={feature.stats.suffix}
                        />
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {feature.stats.label}
                      </span>
                    </div>
                  </CardContent>

                  {/* Hover Effect Border */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                </Card>
              </Reveal>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <Reveal direction="up" delay={800}>
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Real-time analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span>ML-powered insights</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}