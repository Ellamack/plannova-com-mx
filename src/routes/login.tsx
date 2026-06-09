import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Loader2, Compass } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acceso — Planispherium Nova" },
      {
        name: "description",
        content: "Inicia sesión para gestionar el contenido de Planispherium Nova.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/login" }],
  }),
  component: LoginPage,
});

const labels = {
  signInTitle: { es: "Iniciar sesión", en: "Sign in" },
  signUpTitle: { es: "Crear cuenta", en: "Create account" },
  signInIntro: {
    es: "Accede para gestionar la galería y las capas.",
    en: "Sign in to manage the gallery and layers.",
  },
  signUpIntro: {
    es: "Registra la cuenta de administrador del sitio.",
    en: "Register the site administrator account.",
  },
  email: { es: "Correo electrónico", en: "Email" },
  password: { es: "Contraseña", en: "Password" },
  signIn: { es: "Entrar", en: "Sign in" },
  signUp: { es: "Registrarse", en: "Sign up" },
  loading: { es: "Procesando…", en: "Processing…" },
  toSignUp: { es: "¿Nuevo? Crear cuenta", en: "New? Create account" },
  toSignIn: { es: "¿Ya tienes cuenta? Inicia sesión", en: "Have an account? Sign in" },
  signedIn: { es: "Sesión iniciada.", en: "Signed in." },
  signedUp: {
    es: "Cuenta creada. Revisa tu correo si se requiere confirmación.",
    en: "Account created. Check your email if confirmation is required.",
  },
  signOut: { es: "Cerrar sesión", en: "Sign out" },
  alreadyIn: { es: "Ya has iniciado sesión.", en: "You are already signed in." },
  goGallery: { es: "Ir a la galería", en: "Go to the gallery" },
} as const;

function LoginPage() {
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const L = (k: keyof typeof labels) => labels[k][locale];

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSessionEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(L("signedIn"));
        navigate({ to: "/galeria" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success(L("signedUp"));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success(L("signOut"));
  };

  if (sessionEmail) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <Compass className="h-10 w-10 text-accent" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-3xl font-semibold">{L("alreadyIn")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{sessionEmail}</p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => navigate({ to: "/galeria" })}>{L("goGallery")}</Button>
          <Button variant="outline" onClick={handleSignOut}>
            {L("signOut")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <Compass className="mx-auto h-10 w-10 text-accent" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-3xl font-semibold">
          {mode === "signin" ? L("signInTitle") : L("signUpTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin" ? L("signInIntro") : L("signUpIntro")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{L("email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{L("password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? L("loading") : mode === "signin" ? L("signIn") : L("signUp")}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
        className="mt-6 text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {mode === "signin" ? L("toSignUp") : L("toSignIn")}
      </button>

      <Link
        to="/"
        className="mt-3 text-center text-xs text-muted-foreground/70 transition-colors hover:text-foreground"
      >
        ← {locale === "es" ? "Volver al inicio" : "Back home"}
      </Link>
    </section>
  );
}
