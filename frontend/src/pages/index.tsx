import React from 'react';
import { Header } from '../components/layout/header';
import { HeroSection } from '../components/landing/hero-section';
import { FeatureHighlight } from '../components/landing/feature-highlight';
import { Footer } from '../components/layout/footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeatureHighlight />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;