import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Cookie, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy | Dottorio",
  description: "Informativa sui cookie utilizzati da Dottorio",
};

export default function CookiePolicyPage() {
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
          <Cookie className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Cookie Policy</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Ultima modifica: 21 gennaio 2026 | Versione: 1.0.0
        </p>
      </div>

      <div className="prose prose-sm max-w-none space-y-8">
        {/* 1. Cosa sono i cookie */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Cosa sono i Cookie</h2>
          <p className="text-muted-foreground leading-relaxed">
            I <strong>cookie</strong> sono piccoli file di testo che vengono memorizzati sul tuo dispositivo
            (computer, tablet, smartphone) quando visiti un sito web. I cookie permettono al sito di riconoscere
            il tuo dispositivo e memorizzare alcune informazioni sulle tue preferenze o azioni passate.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Questa Cookie Policy spiega come <strong>Dottorio</strong> utilizza i cookie in conformità con:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
            <li><strong>Direttiva ePrivacy</strong> (Direttiva 2002/58/CE modificata dalla 2009/136/CE)</li>
            <li><strong>GDPR</strong> (Regolamento UE 2016/679)</li>
            <li><strong>Linee Guida del Garante Privacy italiano</strong></li>
          </ul>
        </section>

        {/* 2. Tipi di Cookie */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Tipologie di Cookie</h2>

          <h3 className="text-xl font-semibold mb-3 mt-4">2.1 In base alla durata</h3>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-semibold text-foreground">Cookie di Sessione</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Vengono cancellati automaticamente alla chiusura del browser. Servono per la navigazione e l'utilizzo sicuro della piattaforma.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h4 className="font-semibold text-foreground">Cookie Persistenti</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Rimangono sul dispositivo per un periodo definito (giorni, mesi o anni). Servono per ricordare le tue preferenze tra sessioni diverse.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-3 mt-6">2.2 In base alla finalità</h3>
          <div className="space-y-3">
            <div className="border-l-4 border-emerald-500 pl-4 py-2">
              <h4 className="font-semibold text-foreground">🔒 Cookie Tecnici (Necessari)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Essenziali per il funzionamento della piattaforma. <strong>Non richiedono consenso</strong> secondo il Garante Privacy.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-semibold text-foreground">📊 Cookie Analytics</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Raccolgono informazioni anonime sull'utilizzo del sito. <strong>Richiedono consenso</strong>.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <h4 className="font-semibold text-foreground">🎯 Cookie Marketing</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Utilizzati per mostrare pubblicità personalizzata. <strong>Richiedono consenso</strong>.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-3 mt-6">2.3 In base al proprietario</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Cookie di prima parte:</strong> Installati direttamente da Dottorio</li>
            <li><strong>Cookie di terze parti:</strong> Installati da servizi esterni (es. Google Analytics, CDN)</li>
          </ul>
        </section>

        {/* 3. Cookie Utilizzati */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Cookie Utilizzati da Dottorio</h2>

          {/* Cookie Necessari */}
          <div className="bg-muted/50 p-5 rounded-lg border border-border mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Cookie className="w-5 h-5 text-foreground" />
              🔒 Cookie Necessari (Sempre Attivi)
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Questi cookie sono essenziali per il funzionamento della piattaforma e <strong>non possono essere disattivati</strong>.
              Non richiedono il tuo consenso secondo il Garante Privacy (Provvedimento n. 229/2014).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-semibold">Nome Cookie</th>
                    <th className="text-left p-3 font-semibold">Finalità</th>
                    <th className="text-left p-3 font-semibold">Durata</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white dark:bg-background">
                  <tr>
                    <td className="p-3 font-mono text-xs">next-auth.session-token</td>
                    <td className="p-3">Gestione autenticazione e sessione utente</td>
                    <td className="p-3">30 giorni</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">next-auth.csrf-token</td>
                    <td className="p-3">Protezione da attacchi CSRF</td>
                    <td className="p-3">Sessione</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">next-auth.callback-url</td>
                    <td className="p-3">Reindirizzamento dopo login</td>
                    <td className="p-3">Sessione</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">dottorio_cookie_consent</td>
                    <td className="p-3">Memorizza preferenze cookie</td>
                    <td className="p-3">12 mesi</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">NEXT_LOCALE</td>
                    <td className="p-3">Preferenza lingua (IT/EN)</td>
                    <td className="p-3">12 mesi</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">theme</td>
                    <td className="p-3">Preferenza tema (light/dark)</td>
                    <td className="p-3">12 mesi</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Cookie Analytics */}
          <div className="bg-muted/50 p-5 rounded-lg border border-border mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Cookie className="w-5 h-5 text-foreground" />
              📊 Cookie Analytics (Richiede Consenso)
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Questi cookie raccolgono informazioni <strong>aggregate e anonime</strong> su come gli utenti utilizzano
              la piattaforma (pagine visitate, tempo di permanenza, percorsi di navigazione). Ci aiutano a migliorare
              l'esperienza utente.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-semibold">Servizio</th>
                    <th className="text-left p-3 font-semibold">Cookie</th>
                    <th className="text-left p-3 font-semibold">Finalità</th>
                    <th className="text-left p-3 font-semibold">Durata</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white dark:bg-background">
                  <tr>
                    <td className="p-3">Google Analytics 4</td>
                    <td className="p-3 font-mono text-xs">_ga</td>
                    <td className="p-3">Identificatore utente anonimo</td>
                    <td className="p-3">2 anni</td>
                  </tr>
                  <tr>
                    <td className="p-3">Google Analytics 4</td>
                    <td className="p-3 font-mono text-xs">_ga_*</td>
                    <td className="p-3">Stato sessione</td>
                    <td className="p-3">2 anni</td>
                  </tr>
                  <tr>
                    <td className="p-3">Google Analytics 4</td>
                    <td className="p-3 font-mono text-xs">_gid</td>
                    <td className="p-3">Identificatore sessione</td>
                    <td className="p-3">24 ore</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-muted/30 rounded border border-border">
              <p className="text-xs text-muted-foreground">
                <strong>ℹ️ Nota:</strong> Google Analytics è configurato con <strong>anonimizzazione IP</strong>{" "}
                (anonymizeIP: true) in conformità con le linee guida del Garante Privacy. Gli indirizzi IP vengono
                troncati prima dell'elaborazione.
              </p>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Maggiori informazioni:{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Privacy Policy
              </a>
            </p>
          </div>

          {/* Cookie Marketing */}
          <div className="bg-muted/50 p-5 rounded-lg border border-border">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Cookie className="w-5 h-5 text-foreground" />
              🎯 Cookie Marketing (Richiede Consenso)
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Al momento non utilizziamo cookie marketing o pubblicitari.</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Se in futuro decideremo di utilizzare cookie per pubblicità personalizzata o remarketing,
              richiederemo il tuo consenso esplicito tramite il banner cookie e aggiorneremo questa policy.
            </p>
          </div>
        </section>

        {/* 4. Base Giuridica */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Base Giuridica</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-emerald-600 font-bold shrink-0">✓</span>
              <div>
                <strong className="text-foreground">Cookie Necessari:</strong>
                <span className="text-muted-foreground"> Non richiedono consenso (Provv. Garante n. 229/2014) - necessari per fornire il servizio richiesto</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold shrink-0">✓</span>
              <div>
                <strong className="text-foreground">Cookie Analytics/Marketing:</strong>
                <span className="text-muted-foreground"> Richiedono consenso preventivo e informato (Art. 122 Codice Privacy + GDPR)</span>
              </div>
            </li>
          </ul>
        </section>

        {/* 5. Come Gestiamo il Consenso */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Come Gestiamo il Tuo Consenso</h2>

          <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Banner Cookie</h3>
          <p className="text-muted-foreground">
            Al primo accesso a Dottorio, visualizzi un <strong>banner cookie</strong> che ti permette di:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
            <li><strong>Accetta Tutti:</strong> Attiva cookie necessari + analytics + marketing</li>
            <li><strong>Rifiuta:</strong> Attiva solo cookie necessari</li>
            <li><strong>Personalizza:</strong> Scegli singolarmente quali cookie attivare</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Gestione Preferenze</h3>
          <div className="bg-muted/30 p-5 rounded-lg border">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Puoi modificare le tue preferenze cookie in qualsiasi momento:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                  <li>Clicca sull'icona cookie nel footer della homepage</li>
                  <li>Vai su <strong>Impostazioni → Privacy → Gestisci Cookie</strong></li>
                  <li>Elimina i cookie dal tuo browser (vedi sezione successiva)</li>
                </ul>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Revoca del Consenso</h3>
          <p className="text-muted-foreground">
            Puoi <strong>revocare il consenso</strong> ai cookie analytics/marketing in qualsiasi momento senza
            che ciò pregiudichi l'utilizzo della piattaforma. I cookie necessari continueranno a funzionare
            per garantire le funzionalità essenziali.
          </p>
        </section>

        {/* 6. Come Disabilitare i Cookie */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Come Disabilitare i Cookie dal Browser</h2>
          <p className="text-muted-foreground mb-4">
            Puoi configurare il tuo browser per bloccare o eliminare i cookie. Ecco come fare nei principali browser:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">🌐 Google Chrome</h4>
              <p className="text-sm text-muted-foreground">
                Impostazioni → Privacy e sicurezza → Cookie e altri dati dei siti
              </p>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-2 inline-block"
              >
                Guida ufficiale →
              </a>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">🦊 Mozilla Firefox</h4>
              <p className="text-sm text-muted-foreground">
                Preferenze → Privacy e sicurezza → Cookie e dati dei siti web
              </p>
              <a
                href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox-desktop"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-2 inline-block"
              >
                Guida ufficiale →
              </a>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">🍎 Safari</h4>
              <p className="text-sm text-muted-foreground">
                Preferenze → Privacy → Gestisci dati dei siti web
              </p>
              <a
                href="https://support.apple.com/it-it/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-2 inline-block"
              >
                Guida ufficiale →
              </a>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">🔷 Microsoft Edge</h4>
              <p className="text-sm text-muted-foreground">
                Impostazioni → Cookie e autorizzazioni del sito → Gestisci ed elimina cookie
              </p>
              <a
                href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-2 inline-block"
              >
                Guida ufficiale →
              </a>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border border-border mt-4">
            <p className="text-sm text-muted-foreground">
              <strong>⚠️ Attenzione:</strong> Disabilitando tutti i cookie, alcune funzionalità della piattaforma
              potrebbero non funzionare correttamente (es. login, preferenze, salvataggi).
            </p>
          </div>
        </section>

        {/* 7. Cookie di Terze Parti */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Cookie di Terze Parti</h2>
          <p className="text-muted-foreground mb-4">
            Dottorio utilizza servizi di terze parti che possono installare cookie sul tuo dispositivo:
          </p>

          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-semibold text-foreground">Google Analytics</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Analytics e statistiche anonime - Privacy Policy:{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  policies.google.com/privacy
                </a>
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <h4 className="font-semibold text-foreground">Anthropic (Claude AI)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Intelligenza artificiale - Privacy Policy:{" "}
                <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  anthropic.com/privacy
                </a>
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-4 italic">
            Non abbiamo controllo sui cookie installati da terze parti. Ti consigliamo di consultare le loro
            privacy policy per informazioni dettagliate.
          </p>
        </section>

        {/* 8. Aggiornamenti */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Aggiornamenti della Cookie Policy</h2>
          <p className="text-muted-foreground">
            Questa Cookie Policy potrebbe essere aggiornata periodicamente per riflettere cambiamenti nei cookie
            utilizzati o nelle normative vigenti. Controlla regolarmente questa pagina per eventuali modifiche.
            La data di ultima modifica è sempre indicata in alto.
          </p>
          <p className="text-muted-foreground mt-3">
            In caso di modifiche sostanziali, ti informeremo tramite banner sulla piattaforma.
          </p>
        </section>

        {/* 9. Contatti */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Contatti</h2>
          <p className="text-muted-foreground mb-4">
            Per domande su questa Cookie Policy o sulla gestione dei tuoi dati:
          </p>
          <div className="bg-primary/5 p-5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <strong>Email:</strong> privacy@dottorio.com
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>DPO (Data Protection Officer):</strong> dpo@dottorio.com
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t">
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/legal/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/legal/terms" className="text-primary hover:underline">
            Termini di Servizio
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
