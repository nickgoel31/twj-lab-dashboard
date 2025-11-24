// components/cms/types.ts
import { ReactNode } from 'react';

// --- Your Provided Types ---
export type PlanType = {
  id: number;
  name: string;
  description: string;
  featured: boolean;
  price: string;
  features: string[];
  featuresNotIncluded?: string[];
  everythingIncludedPrev?: boolean;
};

export type PricingPlanType = {
  title: string;
  plans: PlanType[];
};

export type OurWorkType = {
    id: number;
    heroLine?: string;
    companyLogo: string;
    companyName: string;
    description: string;
    services: string[];
    heroImage: string;
    industry: string;
    location: string;
    website: string;
    projectDuration: string;
    problemStatement: string;
    solution: string;
    results: string;
    testimonial?: {
        quote: string;
        author: string;
        designation: string;
    };
    media?: string[];
    data?: {
        conversionRateIncrease?: string;
        trafficGrowth?: string;
        userGrowth?: string;
    };
}

// --- General CMS Types ---
export type TabType = 'services' | 'pricing' | 'portfolio' | 'usecases';

// We'll keep Service generic for now if you still need it
export type Service = { 
  id: number; 
  title: string; 
  desc: string; 
  icon: string 
};