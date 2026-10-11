import { Header, Hero } from "./components";
import {
  AboutSection,
  BenefitsSection,
  ContactSection,
  Footer,
  Marquee,
  ProcessSection,
  ServicesSection,
  TechnologiesSection,
} from "./sections";
import { WorkCatalog } from "./work-catalog";

export default function HomeApp() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <WorkCatalog />
        <ServicesSection />
        <BenefitsSection />
        <ProcessSection />
        <TechnologiesSection />
        <Marquee />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
