import { AlertTriangle, ArrowLeft, FileText } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termini di Servizio | Dottorio",
  description: "Termini e condizioni d'uso della piattaforma Dottorio",
};

export default function TermsOfServicePage() {
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
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Termini di Servizio</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Ultima modifica: 21 gennaio 2026 | Versione: 1.0.0
        </p>
      </div>

      <div className="prose prose-sm max-w-none space-y-8">
        {/* Alert importante */}
        <div className="bg-muted/50 p-5 rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-foreground text-lg mb-2">
                Informazioni Importanti sull'uso dell'IA
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dottorio utilizza intelligenza artificiale per generare risposte alle domande d'esame.
                Le risposte IA sono fornite <strong>solo a scopo didattico ed educativo</strong> e{" "}
                <strong>non sostituiscono lo studio personale</strong>. L'IA può commettere errori:
                verifica sempre le informazioni con fonti ufficiali (libri di testo, docenti, materiale del corso).
                Dottorio non è responsabile per errori, imprecisioni o conseguenze derivanti dall'uso delle risposte IA.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Accettazione */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Accettazione dei Termini</h2>
          <p className="text-muted-foreground leading-relaxed">
            Benvenuto su <strong>Dottorio</strong> ("Piattaforma", "Servizio", "noi"). Questi Termini di Servizio
            ("Termini") costituiscono un accordo legalmente vincolante tra te ("utente", "studente", "tu") e Dottorio.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            <strong>Utilizzando la Piattaforma, accetti integralmente questi Termini.</strong> Se non accetti questi
            Termini, non sei autorizzato a utilizzare il Servizio. La registrazione implica l'accettazione esplicita
            tramite checkbox obbligatorio.
          </p>
        </section>

        {/* 2. Definizioni */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Definizioni</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li><strong>"Piattaforma":</strong> Il sito web e l'applicazione Dottorio</li>
            <li><strong>"Contenuto Utente":</strong> Domande d'esame, risposte, commenti, appunti caricati dagli utenti</li>
            <li><strong>"Contenuto IA":</strong> Risposte generate dall'intelligenza artificiale (Claude by Anthropic)</li>
            <li><strong>"Rappresentante":</strong> Studente rappresentante di classe con permessi aggiuntivi</li>
            <li><strong>"Servizio":</strong> L'insieme delle funzionalità offerte da Dottorio</li>
          </ul>
        </section>

        {/* 3. Elegibilità */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Elegibilità e Registrazione</h2>

          <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Requisiti</h3>
          <p className="text-muted-foreground">Per utilizzare Dottorio devi:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
            <li>Essere uno studente universitario iscritto a un'università italiana</li>
            <li>Avere almeno 18 anni (o 16 anni con consenso parentale)</li>
            <li>Possedere un'email istituzionale valida (@università.it)</li>
            <li>Fornire informazioni veritiere e accurate</li>
            <li>Accettare Privacy Policy e Termini di Servizio</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Account</h3>
          <p className="text-muted-foreground">
            Sei responsabile per la sicurezza del tuo account e password. Devi notificarci immediatamente in caso
            di accesso non autorizzato. Non puoi condividere il tuo account con altri o creare account multipli.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Verifica email</h3>
          <p className="text-muted-foreground">
            L'email istituzionale serve a verificare la tua identità e affiliazione universitaria. Dottorio si riserva
            il diritto di verificare periodicamente la validità dell'affiliazione universitaria.
          </p>
        </section>

        {/* 4. Uso del Servizio */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Uso Consentito della Piattaforma</h2>

          <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Finalità educativa</h3>
          <p className="text-muted-foreground">
            Dottorio è una piattaforma collaborativa per <strong>studio e condivisione di conoscenza</strong> tra
            studenti universitari. Puoi:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
            <li>Cercare e studiare domande d'esame pregresse</li>
            <li>Pubblicare domande d'esame che hai sostenuto</li>
            <li>Generare risposte con l'IA per scopo didattico</li>
            <li>Rispondere alle domande di altri studenti</li>
            <li>Collaborare con compagni di corso</li>
            <li>Salvare domande per studio personale</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Uso vietato</h3>
          <p className="text-muted-foreground mb-2">È <strong>severamente vietato</strong>:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>❌ Utilizzare contenuti per scopi commerciali senza autorizzazione</li>
            <li>❌ Pubblicare contenuti offensivi, diffamatori, discriminatori</li>
            <li>❌ Copiare o plagiare contenuti di altri utenti</li>
            <li>❌ Caricare materiale protetto da copyright senza permesso</li>
            <li>❌ Tentare di violare la sicurezza della piattaforma</li>
            <li>❌ Utilizzare bot, scraper o sistemi automatici non autorizzati</li>
            <li>❌ Impersonare altri utenti o fornire informazioni false</li>
            <li>❌ Condividere contenuti d'esame durante lo svolgimento dell'esame (cheating)</li>
            <li>❌ Vendere o scambiare account</li>
          </ul>
        </section>

        {/* 5. Contenuto Utente */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Contenuto Utente</h2>

          <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Proprietà intellettuale</h3>
          <p className="text-muted-foreground">
            Tu mantieni la proprietà del contenuto che pubblichi. Tuttavia, concedendo l'accesso a Dottorio,
            ci garantisci una <strong>licenza mondiale, non esclusiva, gratuita e trasferibile</strong> per
            utilizzare, riprodurre, distribuire e visualizzare il tuo contenuto sulla piattaforma.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Responsabilità</h3>
          <p className="text-muted-foreground">
            Sei l'unico responsabile per il contenuto che pubblichi. Garantisci che:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
            <li>Possiedi i diritti sul contenuto o hai il permesso di pubblicarlo</li>
            <li>Il contenuto non viola diritti di terzi (copyright, privacy, etc.)</li>
            <li>Il contenuto è accurato e non fuorviante</li>
            <li>Il contenuto rispetta le leggi italiane ed europee</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Moderazione</h3>
          <p className="text-muted-foreground">
            Dottorio si riserva il diritto (ma non l'obbligo) di rivedere, modificare o rimuovere qualsiasi
            contenuto che violi questi Termini o sia ritenuto inappropriato. Gli utenti possono segnalare
            contenuti problematici tramite il sistema di moderazione.
          </p>
        </section>

        {/* 6. Intelligenza Artificiale */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Utilizzo dell'Intelligenza Artificiale</h2>

          <div className="bg-muted/50 p-5 rounded-lg border border-border mb-4">
            <h4 className="font-semibold text-foreground mb-2">
              🤖 Trasparenza AI Act (Regolamento UE 2024/1689)
            </h4>
            <p className="text-sm text-muted-foreground">
              In conformità con l'<strong>AI Act europeo</strong>, ti informiamo che Dottorio utilizza
              il modello di intelligenza artificiale <strong>Claude (Anthropic)</strong> per generare
              risposte alle domande d'esame. Tutte le risposte generate dall'IA sono contrassegnate
              con un <strong>badge visibile</strong> per garantire trasparenza.
            </p>
          </div>

          <h3 className="text-xl font-semibold mb-3 mt-4">6.1 Natura del servizio IA</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>L'IA fornisce risposte <strong>probabilistiche</strong> basate su pattern nei dati di addestramento</li>
            <li>Le risposte sono generate in tempo reale e possono variare tra richieste simili</li>
            <li>L'IA non ha accesso a database di esami universitari ufficiali</li>
            <li>Le risposte sono basate su conoscenza generale, non su materiale specifico del tuo corso</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Limitazioni e disclaimer</h3>
          <div className="bg-muted/50 p-5 rounded-lg border border-border">
            <p className="text-sm text-foreground font-semibold mb-2">
              IMPORTANTE - LIMITAZIONE DI RESPONSABILITÀ
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
              <li>L'IA può generare informazioni <strong>errate, incomplete o obsolete</strong></li>
              <li>Le risposte IA <strong>non sono verificate da docenti</strong> o esperti del settore</li>
              <li>Dottorio <strong>non garantisce l'accuratezza</strong> delle risposte IA</li>
              <li>Le risposte IA <strong>non sostituiscono</strong> lo studio su libri di testo e materiale ufficiale</li>
              <li><strong>Verifica sempre</strong> le informazioni prima di utilizzarle in esami o lavori accademici</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Esclusione di responsabilità</h3>
          <p className="text-muted-foreground font-semibold">
            DOTTORIO E I SUOI FORNITORI DI IA (ANTHROPIC) NON SONO RESPONSABILI PER:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
            <li>Errori o imprecisioni nelle risposte generate dall'IA</li>
            <li>Voti bassi o bocciature agli esami derivanti dall'uso di contenuti IA</li>
            <li>Danni accademici, professionali o economici derivanti dall'uso del servizio IA</li>
            <li>Violazioni del regolamento accademico derivanti dall'uso inappropriato dell'IA</li>
          </ul>
        </section>

        {/* 7. Proprietà Intellettuale */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Proprietà Intellettuale di Dottorio</h2>
          <p className="text-muted-foreground">
            Tutti i diritti di proprietà intellettuale sulla Piattaforma (design, logo, codice, interfaccia, algoritmi)
            appartengono a Dottorio o ai suoi licenzianti. È vietato:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
            <li>Copiare, modificare o distribuire il software della piattaforma</li>
            <li>Decompilare, eseguire reverse engineering o estrarre codice sorgente</li>
            <li>Rimuovere copyright, marchi o avvisi proprietari</li>
            <li>Utilizzare il nome "Dottorio" o il logo senza autorizzazione scritta</li>
          </ul>
        </section>

        {/* 8. Sospensione e Cancellazione */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Sospensione e Cancellazione Account</h2>

          <h3 className="text-xl font-semibold mb-3 mt-4">8.1 Sospensione da parte di Dottorio</h3>
          <p className="text-muted-foreground">
            Ci riserviamo il diritto di sospendere o terminare il tuo account <strong>con effetto immediato</strong> se:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
            <li>Violi questi Termini di Servizio</li>
            <li>Pubblichi contenuti illegali o inappropriati</li>
            <li>Tenti di violare la sicurezza della piattaforma</li>
            <li>Utilizzi il servizio per attività fraudolente</li>
            <li>Ricevi molteplici segnalazioni da altri utenti</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">8.2 Cancellazione volontaria</h3>
          <p className="text-muted-foreground">
            Puoi cancellare il tuo account in qualsiasi momento dalle impostazioni. La cancellazione comporta:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
            <li>Eliminazione permanente dei dati personali entro 30 giorni</li>
            <li>I tuoi contenuti pubblici rimarranno visibili in forma anonima (per utilità della comunità)</li>
            <li>Impossibilità di recuperare l'account dopo la cancellazione</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">8.3 Effetti della terminazione</h3>
          <p className="text-muted-foreground">
            Alla terminazione dell'account, perdi immediatamente l'accesso a tutti i contenuti salvati,
            cronologia, statistiche e funzionalità premium (se presenti).
          </p>
        </section>

        {/* 9. Disclaimer */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Esclusioni di Garanzia</h2>

          <div className="bg-muted/50 p-5 rounded-lg border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              IL SERVIZIO È FORNITO "<strong>COSÌ COM'È</strong>" E "<strong>COME DISPONIBILE</strong>".
              DOTTORIO NON FORNISCE GARANZIE DI ALCUN TIPO, ESPLICITE O IMPLICITE, INCLUSE MA NON LIMITATE A:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground mt-3">
              <li>Garanzie di commerciabilità o idoneità a un particolare scopo</li>
              <li>Garanzie che il servizio sarà ininterrotto, sicuro o privo di errori</li>
              <li>Garanzie sull'accuratezza o affidabilità del contenuto</li>
              <li>Garanzie che i difetti saranno corretti</li>
            </ul>
          </div>
        </section>

        {/* 10. Limitazione di Responsabilità */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Limitazione di Responsabilità</h2>

          <p className="text-muted-foreground mb-3">
            <strong>NEI LIMITI CONSENTITI DALLA LEGGE ITALIANA</strong>, Dottorio non sarà responsabile per:
          </p>

          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Danni indiretti:</strong> Perdita di profitti, dati, opportunità, reputazione</li>
            <li><strong>Danni accademici:</strong> Voti bassi, bocciature, sanzioni disciplinari</li>
            <li><strong>Interruzioni del servizio:</strong> Downtime, manutenzione, problemi tecnici</li>
            <li><strong>Contenuto di terzi:</strong> Contenuto pubblicato da altri utenti o generato dall'IA</li>
            <li><strong>Violazioni:</strong> Uso non autorizzato del tuo account da parte di terzi</li>
            <li><strong>Decisioni:</strong> Decisioni prese sulla base del contenuto della piattaforma</li>
          </ul>

          <p className="text-muted-foreground mt-4 text-sm italic">
            In ogni caso, la nostra responsabilità totale non supererà l'importo pagato (se presente)
            per l'uso del servizio negli ultimi 12 mesi.
          </p>
        </section>

        {/* 11. Indennizzo */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Indennizzo</h2>
          <p className="text-muted-foreground">
            Accetti di indennizzare e tenere indenne Dottorio, i suoi dirigenti, dipendenti e partner da
            qualsiasi reclamo, danno, perdita, responsabilità e spesa (incluse le spese legali) derivanti da:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
            <li>Il tuo uso della piattaforma</li>
            <li>Violazione di questi Termini</li>
            <li>Violazione di diritti di terzi</li>
            <li>Contenuto che pubblichi</li>
          </ul>
        </section>

        {/* 12. Modifiche */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Modifiche ai Termini</h2>
          <p className="text-muted-foreground">
            Ci riserviamo il diritto di modificare questi Termini in qualsiasi momento. Le modifiche sostanziali
            ti verranno comunicate via email con almeno <strong>30 giorni di preavviso</strong>. L'uso continuato
            della piattaforma dopo le modifiche costituisce accettazione dei nuovi Termini.
          </p>
          <p className="text-muted-foreground mt-3">
            Se non accetti le modifiche, puoi cancellare il tuo account prima della data di entrata in vigore.
          </p>
        </section>

        {/* 13. Legge Applicabile */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">13. Legge Applicabile e Foro Competente</h2>
          <p className="text-muted-foreground mb-3">
            Questi Termini sono regolati dalla <strong>legge italiana</strong>. Qualsiasi controversia relativa
            a questi Termini o all'uso del Servizio sarà di competenza esclusiva del{" "}
            <strong>Tribunale di [Città sede legale]</strong>.
          </p>
          <p className="text-muted-foreground">
            In caso di conflitto tra la versione italiana e traduzioni in altre lingue, prevarrà la versione italiana.
          </p>
        </section>

        {/* 14. Varie */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">14. Disposizioni Generali</h2>

          <h3 className="text-xl font-semibold mb-3 mt-4">14.1 Intero accordo</h3>
          <p className="text-muted-foreground">
            Questi Termini, insieme alla Privacy Policy e Cookie Policy, costituiscono l'intero accordo
            tra te e Dottorio.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">14.2 Divisibilità</h3>
          <p className="text-muted-foreground">
            Se una clausola di questi Termini è ritenuta invalida o inapplicabile, le restanti clausole
            rimarranno in vigore.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">14.3 Rinuncia</h3>
          <p className="text-muted-foreground">
            La mancata applicazione di un diritto o disposizione non costituisce rinuncia a tale diritto.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">14.4 Cessione</h3>
          <p className="text-muted-foreground">
            Non puoi cedere o trasferire questi Termini senza il nostro consenso scritto. Dottorio può
            cedere questi Termini in caso di fusione, acquisizione o vendita di asset.
          </p>
        </section>

        {/* 15. Contatti */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">15. Contatti</h2>
          <p className="text-muted-foreground mb-4">
            Per domande su questi Termini di Servizio, contattaci:
          </p>
          <div className="bg-primary/5 p-5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground"><strong>Email legale:</strong> legal@dottorio.com</p>
            <p className="text-sm text-muted-foreground"><strong>Email supporto:</strong> support@dottorio.com</p>
            <p className="text-sm text-muted-foreground mt-2">
              Risponderemo entro 48 ore lavorative.
            </p>
          </div>
        </section>

        {/* Accettazione */}
        <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 p-6 rounded-lg border-2 border-primary/30 mt-8">
          <h3 className="font-bold text-lg mb-3">Accettazione</h3>
          <p className="text-sm text-muted-foreground">
            Utilizzando Dottorio, confermi di aver letto, compreso e accettato integralmente questi Termini di Servizio,
            la <Link href="/legal/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link> e
            la <Link href="/legal/cookies" className="text-primary hover:underline font-medium">Cookie Policy</Link>.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t">
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/legal/privacy" className="text-primary hover:underline">
            Privacy Policy
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
