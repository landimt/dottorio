import { RegisterForm } from "./_components/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center shadow-lg border-2 border-green-200">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h1 className="text-2xl font-medium text-foreground">Dottorio</h1>
              <p className="text-sm text-muted-foreground">Assistente AI per lo Studio</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl text-foreground">Crea il tuo Account</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Registrati gratuitamente e inizia a studiare con l&apos;aiuto dell&apos;IA.
            </p>
          </div>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
