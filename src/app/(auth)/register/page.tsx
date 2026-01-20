import { RegisterForm } from "./_components/register-form";
import { getTranslations } from "next-intl/server";
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

const benefitIcons = [Brain, Users, TrendingUp, Zap];
const benefitColors = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-green-600",
  "from-amber-500 to-orange-600",
];

export default async function RegisterPage() {
  const t = await getTranslations("registerPage");
  const tCommon = await getTranslations("common");

  const benefits = [
    {
      icon: benefitIcons[0],
      title: t("benefits.aiAnswers.title"),
      description: t("benefits.aiAnswers.description"),
      color: benefitColors[0],
    },
    {
      icon: benefitIcons[1],
      title: t("benefits.community.title"),
      description: t("benefits.community.description"),
      color: benefitColors[1],
    },
    {
      icon: benefitIcons[2],
      title: t("benefits.progress.title"),
      description: t("benefits.progress.description"),
      color: benefitColors[2],
    },
    {
      icon: benefitIcons[3],
      title: t("benefits.instant.title"),
      description: t("benefits.instant.description"),
      color: benefitColors[3],
    },
  ];

  const stats = [
    { value: "10K+", label: t("stats.questions") },
    { value: "500+", label: t("stats.students") },
    { value: "50+", label: t("stats.professors") },
    { value: "95%", label: t("stats.satisfaction") },
  ];

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
                <h1 className="text-3xl font-bold text-foreground">{tCommon("appName")}</h1>
                <p className="text-sm text-muted-foreground">{t("tagline")}</p>
              </div>
            </div>

            <h2 className="text-3xl xl:text-4xl font-bold text-foreground leading-tight mb-4">
              {t("heroTitle")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                {t("heroHighlight")}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("heroDescription")}
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
              <span className="text-sm">{t("trustBadges.dataProtected")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-sm">{t("trustBadges.free")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-sm">{t("trustBadges.advancedAI")}</span>
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
                <h1 className="text-2xl font-bold text-foreground">{tCommon("appName")}</h1>
                <p className="text-xs text-muted-foreground">{t("tagline")}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">{t("createAccount")}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("registerFreeStart")}
              </p>
            </div>
          </div>

          {/* Desktop heading (shown only on large screens) */}
          <div className="hidden lg:block text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              {t("freeRegistration")}
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t("createAccount")}</h2>
            <p className="text-muted-foreground">
              {t("startStudying")}
            </p>
          </div>

          <RegisterForm />

          {/* Mobile benefits summary */}
          <div className="lg:hidden mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              {t("whatYouGet")}
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
