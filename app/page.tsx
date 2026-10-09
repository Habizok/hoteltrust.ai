import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Faq, Hungarian, Positions, Problem, Process, Terms, TrustStrip, Why } from "@/components/Sections";
import { FormSection } from "@/components/FormSection";
import { Footer } from "@/components/Footer";
import { de } from "@/lib/content/de";
import { SITE } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${SITE.url}/#organisation`,
      name: SITE.name,
      url: SITE.url,
      description: de["meta.desc"],
      areaServed: { "@type": "Country", name: "Österreich" },
      knowsLanguage: ["de", "hu"],
      serviceType: "Personalvermittlung für Hotellerie und Gastronomie",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      inLanguage: "de-AT",
    },
    {
      "@type": "FAQPage",
      mainEntity: [1, 2, 3, 4, 5, 6, 7].map((i) => ({
        "@type": "Question",
        name: de[`faq.${i}.q` as keyof typeof de],
        acceptedAnswer: { "@type": "Answer", text: de[`faq.${i}.a` as keyof typeof de] },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <Header />
      <main id="inhalt">
        <Hero />
        <TrustStrip />
        <Problem />
        <Process />
        <Positions />
        <Why />
        <Hungarian />
        <Terms />
        <Faq />
        <FormSection />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
