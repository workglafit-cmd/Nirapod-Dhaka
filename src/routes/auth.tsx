import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2,
  LogIn,
  UserPlus,
  PhoneCall,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  ArrowLeft,
  Activity,
  HeartPulse,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/app-context";
import { useAuth, dashboardPathFor } from "@/lib/auth";
import { BrandMark, LangToggle } from "@/components/Chrome";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  mode: z.enum(["login", "signup"]).catch("login"),
  type: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Log in or sign up — Nirapod Dhaka" },
      {
        name: "description",
        content:
          "Create a Nirapod Dhaka account to report hazards, track their resolution and use emergency SOS.",
      },
      { property: "og:title", content: "Log in or sign up — Nirapod Dhaka" },
      {
        property: "og:description",
        content: "Sign in to report hazards and use emergency SOS in Dhaka.",
      },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(20),
  emergency_contact_name: z.string().trim().min(2).max(100),
  emergency_contact_phone: z.string().trim().min(6).max(20),
});

function AuthPage() {
  const search = Route.useSearch();
  const { session, role, loading } = useAuth();
  const navigate = useNavigate();
  const { lang, t } = useApp();

  const isAuthorityAuth = search.type === "authority";
  const isSignup = isAuthorityAuth ? false : search.mode === "signup";

  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Redirect when loaded, session exists, and role is determined.
    if (!loading && session && role !== null) {
      void navigate({ to: dashboardPathFor(role), replace: true });
    }
  }, [session, role, loading, navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      if (isSignup) {
        const parsed = signupSchema.safeParse(Object.fromEntries(fd));
        if (!parsed.success) {
          toast.error(
            lang === "bn" ? "সব ঘর সঠিকভাবে পূরণ করুন" : "Please fill every field correctly",
          );
          return;
        }
        const { email, password, ...meta } = parsed.data;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/map", data: meta },
        });
        if (error) throw error;
        
        if (data.session) {
          toast.success(lang === "bn" ? "অ্যাকাউন্ট তৈরি হয়েছে" : "Account created successfully");
        } else {
          // Fallback if backend still requires it
          toast.success(t("checkEmail"));
          void (navigate as any)({ search: { mode: "login" } });
        }
      } else {
        const email = String(fd.get("email") ?? "").trim();
        const password = String(fd.get("password") ?? "");
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary-deep">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <BrandMark />

          <div className="flex items-center gap-3">
            <LangToggle />
            <Link
              to="/map"
              className="tap-target hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all shadow-xs"
            >
              <ArrowLeft className="size-3.5" />
              <span>{t("browseMap")}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        {/* Background Ambient Decorative Lights */}
        <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-primary/15 blur-3xl animate-wash" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-infra/15 blur-3xl" />

        <div className="relative mx-auto w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Brand Showcase Section (Desktop/Tablet) */}
          <div className="lg:col-span-5 hidden lg:flex flex-col justify-center space-y-8 pr-2">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-tint/80 px-3.5 py-1.5 text-xs font-semibold text-primary-deep shadow-xs backdrop-blur-xs">
                <Sparkles className="size-3.5 text-primary" />
                <span>{lang === "bn" ? "স্মার্ট সিটি সিকিউরিটি প্ল্যাটফর্ম" : "Smart City Safety Platform"}</span>
              </div>
              <h1 className="font-display text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-foreground">
                {lang === "bn" ? "নিরাপদ ঢাকার নাগরিক নেটওয়ার্ক" : "Building a Safer Dhaka, Together."}
              </h1>
              <p className="text-sm xl:text-base text-muted-foreground leading-relaxed">
                {lang === "bn" 
                  ? "রাস্তার ঝুঁকি রিপোর্ট করুন, লাইভ রেজোলিউশন ট্র্যাক করুন এবং মুহূর্তের মধ্যেই আপনার জরুরি কন্টাক্টের সাথে যুক্ত থাকুন।" 
                  : "Report urban hazards, track live resolution by city authorities, and access instantaneous Emergency SOS protection."}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md shadow-xs">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-deep">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {lang === "bn" ? "সরাসরি কর্তৃপক্ষ সংযোগ" : "Direct Authority Dispatch"}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === "bn" ? "রিপোর্ট সরাসরি সিটি কর্পোরেশন ও ট্রাফিক কন্ট্রোলে পৌঁছায়" : "Automated routing to Dhaka North & South City Corporations"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md shadow-xs">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-infra-tint text-infra-deep">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {lang === "bn" ? "পয়েন্টনির্ভুল জিওফেন্সিং" : "Dhaka Geo-Restriction"}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === "bn" ? "ঢাকা মেট্রোপলিটন এলাকার ভেতরের নিখুঁত জিপিএস ভেরিফিকেশন" : "Strict boundary protection for verified Dhaka location reports"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md shadow-xs">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-crime-tint text-crime-deep">
                  <ShieldAlert className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {lang === "bn" ? "১-ট্যাপে জরুরি এসওএস" : "1-Tap Emergency SOS"}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === "bn" ? "আপনার নিবন্ধিত পরিচিতি ও নিকটস্থ থানায় দ্রুত সতর্কতা" : "Instant alert notification with live GPS tracking to loved ones"}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Counter Badge */}
            <div className="inline-flex items-center justify-between rounded-2xl border border-resolved/30 bg-resolved-tint/50 p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-resolved opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-resolved" />
                </span>
                <span className="text-xs font-semibold text-resolved-deep">
                  {lang === "bn" ? "সক্রিয়ভাবে ৫০+ ওয়ার্ড কাভার করছে" : "Active & Live in 50+ Dhaka Wards"}
                </span>
              </div>
              <span className="text-xs font-bold text-foreground">100% Verifiable</span>
            </div>
          </div>

          {/* Right Auth Form Box */}
          <div className="lg:col-span-7 w-full max-w-md mx-auto lg:max-w-none">
            <div className="relative rounded-3xl border border-border/80 bg-card/90 p-6 sm:p-8 shadow-elevated backdrop-blur-xl animate-slide-in-up transition-all">
              
              {/* Segmented Auth Mode Switcher / Authority Banner */}
              {isAuthorityAuth ? (
                <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 p-3.5 text-center text-xs sm:text-sm font-semibold text-primary-deep flex items-center justify-center gap-2 shadow-xs">
                  <Building2 className="size-4 text-primary" />
                  <span>{lang === "bn" ? "কর্তৃপক্ষ ড্যাশবোর্ড পোর্টাল" : "Official Authority Login Portal"}</span>
                </div>
              ) : (
                <div className="mb-6 grid grid-cols-2 rounded-2xl bg-muted/80 p-1 border border-border/50 shadow-inner">
                  <Link
                    to="/auth"
                    search={{ mode: "login" }}
                    className={cn(
                      "tap-target flex items-center justify-center rounded-xl py-2 text-xs sm:text-sm font-semibold transition-all duration-200",
                      !isSignup
                        ? "bg-card text-foreground shadow-xs border border-border/40"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <LogIn className="size-3.5 mr-1.5" />
                    {t("login")}
                  </Link>
                  <Link
                    to="/auth"
                    search={{ mode: "signup" }}
                    className={cn(
                      "tap-target flex items-center justify-center rounded-xl py-2 text-xs sm:text-sm font-semibold transition-all duration-200",
                      isSignup
                        ? "bg-card text-foreground shadow-xs border border-border/40"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <UserPlus className="size-3.5 mr-1.5" />
                    {t("signup")}
                  </Link>
                </div>
              )}

              {/* Form Title & Description */}
              <div className="mb-6 space-y-1">
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {isAuthorityAuth
                    ? (lang === "bn" ? "অফিশিয়াল লগ ইন" : "Authority Portal Sign In")
                    : isSignup
                    ? t("signup")
                    : t("login")}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isAuthorityAuth
                    ? (lang === "bn" ? "আপনার প্রশাসনিক ইমেইল ও পাসওয়ার্ড দিন" : "Enter your official administrative credentials to access command center")
                    : isSignup
                    ? t("signupDesc")
                    : t("loginDesc")}
                </p>
              </div>

              {/* Main Form */}
              <form onSubmit={onSubmit} className="space-y-4 animate-slide-in-up">
                <Field
                  name="email"
                  label={t("email")}
                  type="email"
                  placeholder="hello@example.com"
                  icon={Mail}
                  required
                />

                  <Field
                    name="password"
                    label={t("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    icon={Lock}
                    endElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    }
                    required
                  />

                  {/* Signup Fields */}
                  {isSignup && (
                    <>
                      <Field
                        name="full_name"
                        label={t("fullName")}
                        placeholder={lang === "bn" ? "রফিকুল ইসলাম" : "Rafiqul Islam"}
                        icon={User}
                        required
                      />

                      <Field
                        name="phone"
                        label={t("phone")}
                        type="tel"
                        placeholder="+8801XXXXXXXXX"
                        icon={Phone}
                        required
                      />

                      {/* Emergency Contact Security Card */}
                      <div className="rounded-2xl border border-primary/20 bg-primary-tint/40 p-4 space-y-3.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-primary-deep uppercase tracking-wider">
                            <ShieldAlert className="size-4 text-sos" />
                            <span>{t("emergencyContact")}</span>
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground bg-card/80 px-2 py-0.5 rounded-full border border-border/50">
                            {lang === "bn" ? "এসওএস এর জন্য" : "Required for SOS"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-snug">
                          {t("emergencyWhy")}
                        </p>

                        <div className="space-y-3 pt-1">
                          <Field
                            name="emergency_contact_name"
                            label={t("emergencyContactName")}
                            placeholder={lang === "bn" ? "আমেনা বেগম" : "Amina Begum"}
                            icon={User}
                            required
                          />
                          <Field
                            name="emergency_contact_phone"
                            label={t("emergencyContactPhone")}
                            type="tel"
                            placeholder="+8801XXXXXXXXX"
                            icon={PhoneCall}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Primary Action Button */}
                  <button
                    type="submit"
                    disabled={busy}
                    className="tap-target group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm sm:text-base font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary-deep hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none mt-2"
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : isSignup ? (
                      <UserPlus className="size-4" aria-hidden />
                    ) : (
                      <LogIn className="size-4" aria-hidden />
                    )}
                    <span>{isSignup ? t("signup") : t("login")}</span>
                  </button>
                </form>

              {/* Form Footer Links */}
              <div className="mt-6 pt-5 border-t border-border/50 flex flex-col items-center justify-center gap-2.5 text-xs sm:text-sm">
                {!isAuthorityAuth && (
                  <Link
                    to="/auth"
                    search={{ mode: isSignup ? "login" : "signup" }}
                    className="tap-target font-semibold text-primary-deep hover:underline underline-offset-4 transition-colors"
                  >
                    {isSignup ? t("haveAccount") : t("needAccount")}
                  </Link>
                )}

                {isAuthorityAuth ? (
                  <Link
                    to="/auth"
                    search={{ mode: "login" }}
                    className="tap-target text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                  >
                    {lang === "bn" ? "নাগরিক সাইন ইন এ যান" : "Switch to Citizen Sign In"}
                  </Link>
                ) : (
                  <Link
                    to="/auth"
                    search={{ type: "authority" }}
                    className="tap-target text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                  >
                    {lang === "bn" ? "কর্তৃপক্ষ বা অফিশিয়াল লগ ইন" : "Authority & Official Sign In"}
                  </Link>
                )}

                <Link
                  to="/map"
                  className="tap-target sm:hidden text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                >
                  {t("browseMap")}
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  icon: Icon,
  endElement,
  ...rest
}: {
  name: string;
  label: string;
  type?: string;
  icon?: React.ElementType;
  endElement?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-xs sm:text-sm font-semibold text-foreground">
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-muted-foreground pointer-events-none">
            <Icon className="size-4" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          className={cn(
            "tap-target w-full rounded-xl border border-input bg-background/80 px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 shadow-xs placeholder:text-muted-foreground/60",
            Icon ? "pl-10" : "",
            endElement ? "pr-10" : ""
          )}
          {...rest}
        />
        {endElement && (
          <div className="absolute right-3.5 flex items-center">
            {endElement}
          </div>
        )}
      </div>
    </div>
  );
}

