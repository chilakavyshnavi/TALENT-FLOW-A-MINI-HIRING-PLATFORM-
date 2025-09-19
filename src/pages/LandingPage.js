import React from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import Features from '../components/Features';
import About from '../components/About';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Candidate Management',
    description: 'Efficiently manage and track candidates throughout the hiring process.'
  },
  {
    icon: Briefcase,
    title: 'Job Posting',
    description: 'Create and manage job postings with detailed requirements and descriptions.'
  },
  {
    icon: FileText,
    title: 'Assessment Builder',
    description: 'Build custom assessments to evaluate candidate skills and competencies.'
  },
  {
    icon: TrendingUp,
    title: 'Analytics Dashboard',
    description: 'Get insights into your hiring process with comprehensive analytics.'
  }
];

const benefits = [
  'Streamline your hiring process',
  'Reduce time-to-hire by 50%',
  'Improve candidate experience',
  'Make data-driven hiring decisions',
  'Collaborate with your team effectively',
  'Track hiring metrics and performance'
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <Features />
      <About />
      <Footer />
    </div>
  );
};

export default LandingPage;