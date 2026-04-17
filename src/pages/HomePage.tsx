import { useEffect } from "react";

import { About } from "@/components/layout/home/about";
import Contact from "@/components/layout/home/contact-us";
import { Faq } from "@/components/layout/home/faq";
import { Feature } from "@/components/layout/home/feature";
import { Footer } from "@/components/layout/home/footer";
import { Hero } from "@/components/layout/home/hero";
import { HomeHeader } from "@/components/layout/home/home-header";
import LogoImageWhite from "@/assets/toggle-logo-white.png";
import { useFetchMe } from "@/services/user/user.queries";
import { useAuthStore } from "@/stores/auth/useAuthStore";

const HomePage = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: profileResponse } = useFetchMe(Boolean(accessToken));

  useEffect(() => {
    document.documentElement.classList.add("hide-scrollbar");

    return () => {
      document.documentElement.classList.remove("hide-scrollbar");
    };
  }, []);

  return (
    <>
      <HomeHeader profile={profileResponse?.data ?? null} />
      <main className="bg-background text-foreground">
        <div id="home">
          <Hero
            className="bg-[#4285f4] py-24 text-primary-foreground flex justify-center"
            heading="Discover Your DNA Story with Bloodline Testing"
            description="Bloodline - Advanced DNA testing and family heritage analysis platform that helps you uncover your genetic history, connect with relatives, and understand your ancestry. Our comprehensive DNA testing service provides detailed insights into your genetic makeup, health predispositions, and family connections through cutting-edge genomic technology and secure data management."
            button={{
              text: "Start Your Journey",
              url: "#contact",
              className: "bg-primary text-slate-950 hover:bg-cyan-300",
            }}
            reviews={{
              count: 1200,
              rating: 4.9,
              avatars: [
                {
                  src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop",
                  alt: "Customer one",
                },
                {
                  src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop",
                  alt: "Customer two",
                },
                {
                  src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop",
                  alt: "Customer three",
                },
                {
                  src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop",
                  alt: "Customer four",
                },
                {
                  src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop",
                  alt: "Customer five",
                },
              ],
            }}
          />
        </div>

        <div
          id="services"
          className="bg-white dark:bg-background flex justify-center"
        >
          <Feature
            title="Bloodline Core Services"
            description="Comprehensive DNA testing and genetic analysis services that help individuals and organizations unlock the power of genetic information with precision and security."
            buttonText="Explore Services"
            buttonUrl="#contact"
            badge="Our Services"
            features={[
              {
                id: "service-1",
                heading: "Advanced DNA Analysis",
                description:
                  "High-accuracy DNA testing for ancestry, identity verification, and legal-grade documentation support.",
                image:
                  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop",
                url: "#contact",
              },
              {
                id: "service-2",
                heading: "Secure Data Management",
                description:
                  "Enterprise-grade privacy controls and encrypted data workflows built to protect sensitive genetic information.",
                image:
                  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=800&fit=crop",
                url: "#contact",
              },
              {
                id: "service-3",
                heading: "Comprehensive Reporting",
                description:
                  "Clear, actionable reports that translate complex genomic findings into understandable insights.",
                image:
                  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop",
                url: "#contact",
              },
            ]}
          />
        </div>

        <div id="about" className="flex justify-center">
          <About
            title="About Bloodline"
            description="We are a pioneering genetic testing company with a passion for discovery, helping families and organizations make confident decisions through trusted science."
            mainImage={{
              src: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1800&h=1200&fit=crop",
              alt: "DNA researcher in a modern laboratory",
            }}
            secondaryImage={{
              src: "https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?w=1200&h=1200&fit=crop",
              alt: "Lab team discussing test results",
            }}
            breakout={{
              src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg",
              alt: "Bloodline logo",
              title: "Certified Precision Testing",
              description:
                "Our lab protocols are designed for reliability, speed, and full traceability from collection to final report.",
              buttonText: "See Services",
              buttonUrl: "#services",
            }}
            achievementsTitle="Trusted Results at Scale"
            achievementsDescription="Our numbers reflect a consistent commitment to scientific quality and customer confidence."
            achievements={[
              { label: "Tests Processed", value: "250K+" },
              { label: "Average Accuracy", value: "99.9%" },
              { label: "Client Satisfaction", value: "98%" },
              { label: "Lab Experts", value: "40+" },
            ]}
          />
        </div>

        <div id="faq" className="flex justify-center">
          <Faq
            heading="Frequently Asked Questions"
            columns={2}
            items={[
              {
                id: "faq-1",
                question: "How accurate are DNA paternity tests?",
                answer:
                  "Our paternity tests achieve 99.9%+ probability when paternity is included and 0% when excluded, following strict quality control standards.",
              },
              {
                id: "faq-2",
                question: "How long does it take to get results?",
                answer:
                  "Most reports are delivered within 3-5 business days after the laboratory receives all required samples.",
              },
              {
                id: "faq-3",
                question: "What types of DNA tests do you offer?",
                answer:
                  "We provide paternity, maternity, ancestry, relationship, and legal DNA testing packages for personal and institutional use.",
              },
              {
                id: "faq-4",
                question: "Is sample collection painful?",
                answer:
                  "No. Most tests use a painless cheek swab process that can be completed in minutes.",
              },
              {
                id: "faq-5",
                question: "Are my results confidential and secure?",
                answer:
                  "Yes. We use encrypted systems, strict access controls, and privacy-first handling policies throughout the entire workflow.",
              },
              {
                id: "faq-6",
                question: "Can I use the results for legal purposes?",
                answer:
                  "Yes. We offer legal chain-of-custody testing options that meet court and administrative requirements.",
              },
              {
                id: "faq-7",
                question: "What if I need to test someone who is deceased?",
                answer:
                  "In many cases, indirect testing can be performed using close relatives. Our specialists will guide the best available option.",
              },
              {
                id: "faq-8",
                question: "Can you support international clients?",
                answer:
                  "Yes. We provide kit shipping, sample return instructions, and online report delivery for clients in multiple regions.",
              },
            ]}
          />
        </div>

        <div
          id="how-it-works"
          className="bg-linear-to-b dark:from-slate-900 dark:to-background flex justify-center"
        >
          <Feature
            title="How It Works"
            description="Simple, fast, and accurate DNA testing in four clear steps."
            buttonText="Begin Now"
            buttonUrl="#contact"
            badge="Simple Process"
            features={[
              {
                id: "step-1",
                heading: "1. Order the Kit",
                description:
                  "Choose your test package online. We dispatch your sample kit quickly with clear instructions.",
                image:
                  "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&h=800&fit=crop",
                url: "#contact",
              },
              {
                id: "step-2",
                heading: "2. Collect the Sample",
                description:
                  "Use the included cheek swabs to collect DNA samples from participants in just a few minutes.",
                image:
                  "https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?w=1200&h=800&fit=crop",
                url: "#contact",
              },
              {
                id: "step-3",
                heading: "3. Send It Back",
                description:
                  "Return the kit to our accredited lab using the prepaid label for safe and tracked processing.",
                image:
                  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=800&fit=crop",
                url: "#contact",
              },
              {
                id: "step-4",
                heading: "4. Receive Results",
                description:
                  "Get secure digital reports and optional consultation support once your analysis is complete.",
                image:
                  "https://images.unsplash.com/photo-1535979863199-3c77338429a0?w=1200&h=800&fit=crop",
                url: "#contact",
              },
            ]}
          />
        </div>

        <div id="contact" className="flex justify-center">
          <Contact />
        </div>
      </main>
      <Footer
        className="bg-slate-950 py-20 text-slate-100 flex justify-center"
        logo={{
          src: LogoImageWhite,
          alt: "Bloodline logo",
          title: "Bloodline DNA",
          url: "#home",
        }}
        tagline="Discover your family roots with advanced and secure DNA technology."
        menuItems={[
          {
            title: "Services",
            links: [
              { text: "DNA Testing", url: "#services" },
              { text: "Ancestry Discovery", url: "#services" },
              { text: "Family Tree", url: "#services" },
              { text: "Health Screening", url: "#services" },
            ],
          },
          {
            title: "Information",
            links: [
              { text: "About Us", url: "#about" },
              { text: "FAQs", url: "#faq" },
              { text: "How It Works", url: "#how-it-works" },
              { text: "Contact", url: "#contact" },
            ],
          },
          {
            title: "Company",
            links: [
              { text: "Privacy Policy", url: "#" },
              { text: "Terms", url: "#" },
            ],
          },
          {
            title: "Connect",
            links: [
              { text: "Facebook", url: "#" },
              { text: "Instagram", url: "#" },
              { text: "LinkedIn", url: "#" },
            ],
          },
        ]}
        copyright="© 2026 Bloodline DNA. All rights reserved."
        bottomLinks={[
          { text: "Terms and Conditions", url: "#" },
          { text: "Privacy Policy", url: "#" },
        ]}
      />
    </>
  );
};

export default HomePage;
