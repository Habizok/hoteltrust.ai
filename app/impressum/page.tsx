import type { Metadata } from "next";
import { LegalPage, Todo } from "@/components/Legal";

export const metadata: Metadata = {
  title: "Impressum",
  alternates: { canonical: "/impressum" },
  robots: { index: false, follow: true },
};

export default function Impressum() {
  return (
    <LegalPage title="Impressum">
      <p>Angaben gemäß § 5 ECG, § 63 GewO und § 25 MedienG.</p>

      <h2>Medieninhaber und Diensteanbieter</h2>
      <p>
        <Todo>vollständiger Firmenname und Rechtsform</Todo>
        <br />
        <Todo>Straße und Hausnummer</Todo>
        <br />
        <Todo>Postleitzahl und Ort, Land</Todo>
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: <Todo>Telefonnummer</Todo>
        <br />
        Mail: <Todo>Mailadresse</Todo>
      </p>

      <h2>Unternehmensdaten</h2>
      <ul>
        <li>
          Unternehmensgegenstand: Personalvermittlung für Hotellerie und Gastronomie
        </li>
        <li>
          UID Nummer: <Todo>falls vorhanden</Todo>
        </li>
        <li>
          Firmenbuchnummer und Firmenbuchgericht: <Todo>falls vorhanden</Todo>
        </li>
        <li>
          Gewerbeberechtigung und zuständige Behörde: <Todo>Gewerbe und Behörde</Todo>
        </li>
        <li>
          Mitgliedschaft: <Todo>Wirtschaftskammer, falls zutreffend</Todo>
        </li>
      </ul>

      <h2>Streitbeilegung</h2>
      <p>
        Verbraucher können Beschwerden an die Online Streitbeilegungsplattform der EU richten. Wir bieten Leistungen
        ausschließlich an Unternehmen an.
      </p>
    </LegalPage>
  );
}
