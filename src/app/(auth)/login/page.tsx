import { LoginForm } from "./_components/login-form";
import { BookOpen, Brain, Target, TrendingUp, Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* LEFT SIDE - Visual Brand Experience - Desktop Only */}
      <div className="hidden lg:flex lg:w-[55%] relative p-12 overflow-hidden bg-gradient-to-br from-background via-muted to-secondary border-r border-border">
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full max-w-xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/90 flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold text-accent tracking-tight">Dottorio</span>
          </div>

          {/* Main content */}
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Powered by AI</span>
              </div>

              <h1 className="text-5xl font-bold leading-tight text-foreground">
                La tua preparazione<br />agli esami orali<br />inizia qui
              </h1>

              <p className="text-xl leading-relaxed text-muted-foreground">
                Sistema intelligente di studio collaborativo per studenti di medicina in tutta Italia
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-card border-2 border-border">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">12K+</div>
                <div className="text-sm text-muted-foreground">Studenti attivi</div>
              </div>

              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-card border-2 border-border">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">45K+</div>
                <div className="text-sm text-muted-foreground">Domande AI</div>
              </div>

              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-card border-2 border-border">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">98%</div>
                <div className="text-sm text-muted-foreground">Successo</div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="p-6 rounded-2xl shadow-sm bg-card border-2 border-border">
              <p className="italic mb-4 text-muted-foreground">
                "Dottorio ha trasformato completamente il mio modo di studiare. Le risposte AI sono incredibilmente accurate."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold text-white">MR</span>
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">Marco Rossi</div>
                  <div className="text-xs text-muted-foreground">5º Anno, Università di Bologna</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-muted-foreground">
            © 2026 Dottorio. Tutti i diritti riservati.
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/90 flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold text-accent">Dottorio</span>
            </div>
            <h2 className="text-3xl font-bold mb-2 text-foreground">
              Bentornato!
            </h2>
            <p className="text-muted-foreground">
              Accedi per continuare
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-foreground">
              Bentornato!
            </h2>
            <p className="text-muted-foreground">
              Accedi per continuare il tuo studio
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
