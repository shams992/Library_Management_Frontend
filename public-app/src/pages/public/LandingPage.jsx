import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero } from '../../components/landing/Hero.jsx';
import { ProblemSection } from '../../components/landing/ProblemSection.jsx';
import { FeaturesSection } from '../../components/landing/FeaturesSection.jsx';
import { ProductShowcase } from '../../components/landing/ProductShowcase.jsx';
import { StudentSection } from '../../components/landing/StudentSection.jsx';
import { HowItWorks } from '../../components/landing/HowItWorks.jsx';
import { TrustSection } from '../../components/landing/TrustSection.jsx';
import { PricingSection } from '../../components/landing/PricingSection.jsx';
import { FinalCTA } from '../../components/landing/FinalCTA.jsx';
import { useHashScroll } from '../../hooks/useHashScroll.js';
import { useSettings } from '../../hooks/useSettings.js';

/**
 * The marketing narrative, in order:
 * hero → problem → features → product showcase → student section → how it works →
 * trust → pricing → final call to action.
 */
export const LandingPage = () => {
  const { hash } = useLocation();
  const { brand } = useSettings();
  useHashScroll();

  useEffect(() => {
    document.title = `${brand.name} — Library Management Software for Private Libraries`;
  }, [brand.name]);

  return (
    <>
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <ProductShowcase />
      <StudentSection />
      <HowItWorks />
      <TrustSection />
      <PricingSection />
      <FinalCTA />
      {hash ? <span id={hash.replace('#', '')} className="sr-only" /> : null}
    </>
  );
};
