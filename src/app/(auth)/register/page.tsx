import { RegisterForm } from "./_components/register-form";
import {
  BookOpen,
  Users,
  Brain,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";

const benefits = [
  {
    icon: Brain,
    title: "Risposte AI Intelligenti",
    description: "Ottieni risposte dettagliate e strutturate per ogni domanda d'esame",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Users,
    title: "Community Attiva",
    description: "Condividi e impara dalle esperienze di altri studenti del tuo corso",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: TrendingUp,
    title: "Traccia i Progressi",
    description: "Monitora le tue sessioni di studio e vedi i tuoi miglioramenti",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: Zap,
    title: "Accesso Immediato",
    description: "Inizia subito a studiare con migliaia di domande già disponibili",
    color: "from-amber-500 to-orange-600",
  },
];

const stats = [
  { value: "10K+", label: "Domande" },
  { value: "500+", label: "Studenti" },
  { value: "50+", label: "Professori" },
  { value: "95%", label: "Soddisfazione" },
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Left Side - Benefits (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-primary/5 via-transparent to-accent/5 p-8 xl:p-12 flex-col justify-center relative">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,90,156,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,90,156,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto">
          {/* Logo Section */}
          <div className="mb-10 animate-fade-in">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/20">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dottorio</h1>
                <p className="text-sm text-muted-foreground">Assistente AI per lo Studio</p>
              </div>
            </div>

            <h2 className="text-3xl xl:text-4xl font-bold text-foreground leading-tight mb-4">
              Preparati agli esami orali con{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                l&apos;intelligenza artificiale
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Unisciti alla community di studenti che stanno rivoluzionando il modo di prepararsi agli esami universitari.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-10 animate-slide-in-up" style={{ animationDelay: "100ms" }}>
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50"
              >
                <div className="text-2xl xl:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/30 hover:bg-card/50 hover:border-border/50 transition-all duration-300 group animate-slide-in-up"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex items-center gap-6 text-muted-foreground animate-fade-in" style={{ animationDelay: "600ms" }}>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              <span className="text-sm">Dati protetti</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-sm">100% Gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-sm">AI Avanzata</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 md:p-8 lg:p-12">
        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo (shown only on small screens) */}
          <div className="lg:hidden text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dottorio</h1>
                <p className="text-xs text-muted-foreground">Assistente AI per lo Studio</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Crea il tuo Account</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Registrati gratuitamente e inizia a studiare con l&apos;aiuto dell&apos;IA
              </p>
            </div>
          </div>

          {/* Desktop heading (shown only on large screens) */}
          <div className="hidden lg:block text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Registrazione Gratuita
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Crea il tuo Account</h2>
            <p className="text-muted-foreground">
              Inizia il tuo percorso di studio intelligente
            </p>
          </div>

          <RegisterForm />

          {/* Mobile benefits summary */}
          <div className="lg:hidden mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Cosa ottieni con Dottorio
            </h3>
            <ul className="space-y-2">
              {benefits.slice(0, 3).map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {benefit.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
