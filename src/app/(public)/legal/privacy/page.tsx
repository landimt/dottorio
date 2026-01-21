import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Dottorio",
  description: "Informativa sulla privacy di Dottorio - Piattaforma collaborativa per studenti universitari",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Torna alla Home
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Ultima modifica: 21 gennaio 2026 | Versione: 1.0.0
        </p>
      </div>

      <div className="prose prose-sm max-w-none space-y-8">
        {/* 1. Introduzione */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Introduzione</h2>
          <p className="text-muted-foreground leading-relaxed">
            Benvenuto su <strong>Dottorio</strong>, la piattaforma collaborativa dedicata agli studenti universitari italiani.
            La protezione dei tuoi dati personali è una nostra priorità assoluta. Questa Privacy Policy spiega come raccogliamo,
            utilizziamo, conserviamo e proteggiamo le tue informazioni personali in conformità con:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
            <li><strong>GDPR</strong> (Regolamento UE 2016/679)</li>
            <li><strong>Codice Privacy Italiano</strong> (D.Lgs. 196/2003 modificato dal D.Lgs. 101/2018)</li>
            <li><strong>Linee Guida del Garante Privacy</strong></li>
            <li><strong>AI Act</strong> (Regolamento UE 2024/1689) per la trasparenza sull'uso dell'IA</li>
          </ul>
        </section>

        {/* 2. Titolare del Trattamento */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Titolare del Trattamento</h2>
          <div className="bg-muted/30 p-6 rounded-lg border space-y-3">
            <p className="font-semibold text-foreground">Dottorio</p>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Sede legale: [Indirizzo completo]</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Email: privacy@dottorio.com</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4 mt-0.5 shrink-0" />
              <span>PEC: dottorio@pec.it</span>
            </div>
          </div>
        </section>

        {/* 3. Dati Raccolti */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Dati Personali Raccolti</h2>

          <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Dati forniti direttamente da te</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Registrazione:</strong> Nome completo, email istituzionale, password (criptata), università, corso di laurea, anno accademico</li>
            <li><strong>Profilo:</strong> Foto profilo (facoltativa), biografia, preferenze</li>
            <li><strong>Contenuti:</strong> Domande d'esame, risposte, commenti, appunti condivisi</li>
            <li><strong>Interazioni:</strong> Like, salvataggi, segnalazioni</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Dati raccolti automaticamente</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Dati tecnici:</strong> Indirizzo IP (conservato per 21 giorni), tipo di browser, sistema operativo, dispositivo</li>
            <li><strong>Cookie:</strong> Cookie di sessione, preferenze, analytics (solo con tuo consenso)</li>
            <li><strong>Log di attività:</strong> Timestamp di accesso, azioni eseguite sulla piattaforma</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Dati generati dall'IA</h3>
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              <strong>⚠️ Trasparenza AI Act:</strong> Utilizziamo intelligenza artificiale (Claude by Anthropic)
              per generare risposte alle domande d'esame. Le interazioni con l'IA vengono registrate per migliorare
              il servizio e garantire qualità. Le risposte generate dall'IA sono sempre contrassegnate con un badge visibile.
            </p>
          </div>
        </section>

        {/* 4. Finalità del Trattamento */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Finalità del Trattamento e Base Giuridica</h2>

          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4 py-2">
              <h4 className="font-semibold text-foreground">Esecuzione del contratto (Art. 6(1)(b) GDPR)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Fornitura dei servizi della piattaforma, gestione account, generazione risposte IA, condivisione contenuti educativi
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h4 className="font-semibold text-foreground">Consenso (Art. 6(1)(a) GDPR)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Cookie analytics, marketing, notifiche push (puoi revocare il consenso in qualsiasi momento)
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4 py-2">
              <h4 className="font-semibold text-foreground">Legittimo interesse (Art. 6(1)(f) GDPR)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Sicurezza della piattaforma, prevenzione frodi, miglioramento servizi, analisi statistiche anonime
              </p>
            </div>

            <div className="border-l-4 border-red-500 pl-4 py-2">
              <h4 className="font-semibold text-foreground">Obbligo legale (Art. 6(1)(c) GDPR)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Conservazione log per sicurezza informatica, risposta a richieste autorità giudiziarie
              </p>
            </div>
          </div>
        </section>

        {/* 5. Condivisione Dati */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Condivisione dei Dati</h2>

          <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Con altri utenti</h3>
          <p className="text-muted-foreground">
            I contenuti che pubblichi (domande, risposte, commenti) sono visibili agli altri studenti della tua università e corso.
            Il tuo nome e università sono sempre visibili nei tuoi contenuti pubblici.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Con fornitori di servizi (Data Processors)</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Anthropic (Claude AI):</strong> Per generazione risposte IA - USA (adequacy decision e clausole contrattuali standard)</li>
            <li><strong>Hosting provider:</strong> [Nome provider] - UE</li>
            <li><strong>Email service:</strong> [Nome servizio] - UE</li>
            <li><strong>Analytics:</strong> Google Analytics (con anonimizzazione IP) - solo con consenso</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3 italic">
            Tutti i fornitori sono vincolati da Data Processing Agreements (DPA) conformi al GDPR.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Trasferimenti extra-UE</h3>
          <p className="text-muted-foreground">
            I trasferimenti verso paesi extra-UE (es. Anthropic/USA) sono protetti da:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
            <li>Decisioni di adeguatezza della Commissione Europea</li>
            <li>Clausole contrattuali standard (SCC)</li>
            <li>Garanzie supplementari per sicurezza dei dati</li>
          </ul>
        </section>

        {/* 6. Conservazione */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Periodo di Conservazione</h2>

          <div className="bg-muted/30 rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold">Tipo di dato</th>
                  <th className="text-left p-3 font-semibold">Periodo conservazione</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-3 text-muted-foreground">Dati account</td>
                  <td className="p-3 text-muted-foreground">Fino a cancellazione account</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">Contenuti pubblicati</td>
                  <td className="p-3 text-muted-foreground">Fino a cancellazione manuale</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">Indirizzo IP registrazione</td>
                  <td className="p-3 text-muted-foreground font-semibold text-orange-600">21 giorni (poi cancellato automaticamente)</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">Cookie consent</td>
                  <td className="p-3 text-muted-foreground">12 mesi</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">Log di sicurezza</td>
                  <td className="p-3 text-muted-foreground">6 mesi (obbligo legale)</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">Backup</td>
                  <td className="p-3 text-muted-foreground">30 giorni (poi cancellati)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground mt-4 italic">
            Al termine del periodo di conservazione, i dati vengono cancellati o anonimizzati in modo irreversibile.
          </p>
        </section>

        {/* 7. I Tuoi Diritti GDPR */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">7. I Tuoi Diritti (GDPR)</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">✅ Diritto di Accesso (Art. 15)</h4>
              <p className="text-sm text-muted-foreground">
                Ottenere copia di tutti i tuoi dati personali
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">✏️ Diritto di Rettifica (Art. 16)</h4>
              <p className="text-sm text-muted-foreground">
                Correggere dati inesatti o incompleti
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">🗑️ Diritto di Cancellazione (Art. 17)</h4>
              <p className="text-sm text-muted-foreground">
                Richiedere cancellazione dati ("diritto all'oblio")
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">🔒 Diritto di Limitazione (Art. 18)</h4>
              <p className="text-sm text-muted-foreground">
                Limitare il trattamento in situazioni specifiche
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">📦 Diritto di Portabilità (Art. 20)</h4>
              <p className="text-sm text-muted-foreground">
                Ricevere dati in formato strutturato (JSON)
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">⛔ Diritto di Opposizione (Art. 21)</h4>
              <p className="text-sm text-muted-foreground">
                Opporti al trattamento per marketing o legittimo interesse
              </p>
            </div>
          </div>

          <div className="bg-muted/50 p-5 rounded-lg border border-border mt-6">
            <h4 className="font-semibold text-foreground mb-2">Come esercitare i tuoi diritti</h4>
            <p className="text-sm text-muted-foreground">
              Puoi esercitare questi diritti in qualsiasi momento inviando una richiesta a{" "}
              <strong>privacy@dottorio.com</strong>. Ti risponderemo entro <strong>30 giorni</strong> come
              previsto dal GDPR (Art. 12). Il servizio è <strong>completamente gratuito</strong>.
            </p>
          </div>
        </section>

        {/* 8. Sicurezza */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Misure di Sicurezza</h2>
          <p className="text-muted-foreground mb-4">
            Implementiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Crittografia:</strong> HTTPS/TLS per tutte le comunicazioni, password hashate con bcrypt</li>
            <li><strong>Accesso limitato:</strong> Solo personale autorizzato può accedere ai dati personali</li>
            <li><strong>Backup sicuri:</strong> Backup giornalieri criptati, conservati per 30 giorni</li>
            <li><strong>Monitoraggio:</strong> Log di sicurezza, rilevamento anomalie, audit periodici</li>
            <li><strong>Data Breach:</strong> Piano di risposta agli incidenti, notifica entro 72h al Garante se necessario</li>
          </ul>
        </section>

        {/* 9. Cookie */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Cookie e Tecnologie Simili</h2>
          <p className="text-muted-foreground mb-3">
            Per informazioni dettagliate sui cookie utilizzati, consulta la nostra{" "}
            <Link href="/legal/cookies" className="text-primary hover:underline font-medium">
              Cookie Policy
            </Link>.
          </p>
          <p className="text-muted-foreground">
            Puoi gestire le tue preferenze cookie in qualsiasi momento tramite il banner presente sulla homepage
            o dalle impostazioni del tuo browser.
          </p>
        </section>

        {/* 10. Minori */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Utenti Minorenni</h2>
          <p className="text-muted-foreground">
            Dottorio è destinato a studenti universitari. Gli utenti di età inferiore a 18 anni possono utilizzare
            la piattaforma solo con il consenso dei genitori o tutori legali. Se veniamo a conoscenza di dati raccolti
            da minori di 14 anni senza consenso parentale, procederemo immediatamente alla cancellazione.
          </p>
        </section>

        {/* 11. Modifiche */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Modifiche alla Privacy Policy</h2>
          <p className="text-muted-foreground">
            Ci riserviamo il diritto di modificare questa Privacy Policy in qualsiasi momento. Le modifiche sostanziali
            ti verranno comunicate via email e tramite banner sulla piattaforma. La versione aggiornata sarà sempre
            disponibile su questa pagina con data e numero di versione aggiornati.
          </p>
        </section>

        {/* 12. Reclami */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Reclami al Garante Privacy</h2>
          <p className="text-muted-foreground mb-4">
            Se ritieni che il trattamento dei tuoi dati violi il GDPR, hai il diritto di presentare reclamo all'autorità di controllo:
          </p>
          <div className="bg-muted/30 p-5 rounded-lg border">
            <p className="font-semibold text-foreground">Garante per la Protezione dei Dati Personali</p>
            <p className="text-sm text-muted-foreground mt-2">Piazza Venezia, 11 - 00187 Roma</p>
            <p className="text-sm text-muted-foreground">Tel: +39 06.696771</p>
            <p className="text-sm text-muted-foreground">Email: garante@gpdp.it</p>
            <p className="text-sm text-muted-foreground">PEC: protocollo@pec.gpdp.it</p>
            <p className="text-sm text-muted-foreground">Web: <a href="https://www.garanteprivacy.it" className="text-primary hover:underline">www.garanteprivacy.it</a></p>
          </div>
        </section>

        {/* 13. Contatti */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">13. Contatti</h2>
          <p className="text-muted-foreground mb-4">
            Per qualsiasi domanda su questa Privacy Policy o sul trattamento dei tuoi dati personali:
          </p>
          <div className="bg-primary/5 p-5 rounded-lg border border-primary/20">
            <p className="font-semibold text-foreground mb-3">📧 Email: <span className="text-primary">privacy@dottorio.com</span></p>
            <p className="text-sm text-muted-foreground">
              Ti risponderemo entro 48 ore lavorative. Per richieste urgenti relative a data breach o violazioni,
              contattaci immediatamente.
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t">
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/legal/terms" className="text-primary hover:underline">
            Termini di Servizio
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/legal/cookies" className="text-primary hover:underline">
            Cookie Policy
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/" className="text-primary hover:underline">
            Torna alla Home
          </Link>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          © 2026 Dottorio. Tutti i diritti riservati.
        </p>
      </div>
    </div>
  );
}
