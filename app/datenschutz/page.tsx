import type { Metadata } from "next";
import { LegalPage, Todo } from "@/components/Legal";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  alternates: { canonical: "/datenschutz" },
  robots: { index: false, follow: true },
};

export default function Datenschutz() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <p>
        Hier erfahren Sie, welche Daten wir verarbeiten, wenn Sie diese Website besuchen oder uns eine Anfrage senden.
      </p>

      <h2>Verantwortlicher</h2>
      <p>
        <Todo>Firmenname, Anschrift und Mailadresse des Verantwortlichen</Todo>
      </p>

      <h2>Besuch der Website</h2>
      <p>
        Beim Aufruf der Seite verarbeitet unser Hosting Anbieter technisch notwendige Daten (zum Beispiel IP Adresse,
        Datum, Uhrzeit, aufgerufene Seite, Browsertyp), um die Seite auszuliefern und sicher zu betreiben. Rechtsgrundlage
        ist unser berechtigtes Interesse am sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO). Wir setzen keine Cookies zu
        Werbe oder Analysezwecken ein und verwenden keine Trackingdienste.
      </p>

      <h2>Anfrage über das Formular</h2>
      <p>
        Wenn Sie uns Ihren Personalbedarf melden, verarbeiten wir die Angaben, die Sie eingeben: Betrieb, Ansprechperson,
        Mailadresse, Telefonnummer (freiwillig), Bundesland, gesuchte Positionen, Anzahl, Starttermin, Unterkunft,
        gewünschtes Deutschniveau und Ihre Nachricht. Wir nutzen diese Daten, um Ihre Anfrage zu beantworten und ein
        Angebot vorzubereiten.
      </p>
      <p>
        Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sowie die Anbahnung eines Vertrags (Art. 6 Abs.
        1 lit. b DSGVO). Sie können die Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.
      </p>
      <p>
        Speicherdauer: Wir löschen Anfragen, aus denen kein Vertrag entsteht, spätestens nach <Todo>Frist festlegen,
        zum Beispiel 12 Monate</Todo>. Bei einem Vertrag gelten die gesetzlichen Aufbewahrungsfristen.
      </p>

      <h2>Empfänger und Dienstleister</h2>
      <ul>
        <li>Vercel Inc. (Hosting der Website, Serverstandort Frankfurt)</li>
        <li>Upstash Inc. (Speicherung der Anfragen in einer Datenbank)</li>
        <li>Google Ireland Limited (Versand der Benachrichtigungsmail über Gmail)</li>
      </ul>
      <p>
        Mit den Dienstleistern bestehen Vereinbarungen zur Auftragsverarbeitung. Soweit Daten in die USA übermittelt werden,
        stützen wir uns auf Standardvertragsklauseln beziehungsweise das EU US Data Privacy Framework.{" "}
        <Todo>Angaben mit Rechtsberatung prüfen</Todo>
      </p>

      <h2>Ihre Rechte</h2>
      <p>
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und
        Widerspruch. Wenden Sie sich dafür an die oben genannte Kontaktadresse. Sie können sich außerdem bei der
        österreichischen Datenschutzbehörde beschweren (dsb.gv.at).
      </p>
    </LegalPage>
  );
}
