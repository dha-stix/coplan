import { BuiltFor } from "@/components/home/BuiltFor";
import { Collaboration } from "@/components/home/Collaboration";
import { CtaBanner } from "@/components/home/CtaBanner";
import { Faq } from "@/components/home/Faq";
import { Features } from "@/components/home/Features";
import { Footer } from "@/components/home/Footer";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Navbar } from "@/components/home/Navbar";
import { Roles } from "@/components/home/Roles";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <BuiltFor />
        <Features />
        <Collaboration />
        <HowItWorks />
        <Roles />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
