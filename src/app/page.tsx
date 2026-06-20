import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  MonitorUp,
  Shield,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "@/components/layout/marketing-header";

function MeetingPreviewMockup() {
  return (
    <div
      aria-hidden
      className="relative mx-auto w-full max-w-lg lg:max-w-none"
    >
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/20 via-blue-400/10 to-transparent blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-zinc-950 shadow-2xl shadow-primary/10 ring-1 ring-white/10">
        <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex shrink-0 gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 sm:h-3 sm:w-3" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 sm:h-3 sm:w-3" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 sm:h-3 sm:w-3" />
          </div>
          <span className="ml-1 min-w-0 truncate font-mono text-[10px] text-zinc-500 sm:ml-2 sm:text-xs">
            vidbitye.app/meeting/abc-defg-hij
          </span>
        </div>

        <div className="grid gap-2 p-3 sm:gap-3 sm:p-4 sm:grid-cols-2">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 sm:col-span-2">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-xl font-semibold text-primary">
                K
              </div>
            </div>
            <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
              Kofi Brown (Host)
            </div>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-900">
            <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
              Guest
            </div>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-900">
            <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
              Guest
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 border-t border-zinc-800 px-4 py-3">
          {[Video, MessageSquare, MonitorUp].map((Icon, i) => (
            <span
              key={i}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-zinc-400"
            >
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: Video,
    title: "HD video & audio",
    description: "Crystal-clear calls powered by LiveKit WebRTC infrastructure.",
  },
  {
    icon: MonitorUp,
    title: "Screen sharing",
    description: "Present documents, demos, or your full screen with one click.",
  },
  {
    icon: MessageSquare,
    title: "In-call chat",
    description: "Send messages to everyone in the room without leaving the call.",
  },
  {
    icon: Zap,
    title: "Instant meetings",
    description: "Go live immediately — no scheduling required.",
  },
  {
    icon: Users,
    title: "Host controls",
    description: "Mute, remove participants, and end meetings for everyone.",
  },
  {
    icon: Shield,
    title: "Secure access",
    description: "JWT auth and token-gated rooms keep your meetings private.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create your account",
    description: "Sign up free in under a minute. No credit card required.",
  },
  {
    step: "02",
    title: "Start or schedule",
    description: "Launch an instant meeting or pick a time for later.",
  },
  {
    step: "03",
    title: "Share the code",
    description: "Invite others with your meeting link or code — they join from the browser.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <MarketingHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(37,99,235,0.15),transparent)]"
          />
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:gap-12 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-28">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.1]">
                Meet face to face,{" "}
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  from anywhere
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg lg:mx-0">
                VidBitye gives your team instant video calls, screen sharing, and chat —
                no app installs, no friction. Just sign in and go live.
              </p>

              <div className="mt-8 flex w-full max-w-sm flex-col items-stretch gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center lg:justify-start">
                <Button size="lg" className="h-12 w-full px-8 sm:w-auto" asChild>
                  <Link href="/register">
                    Start for free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full sm:w-auto"
                  asChild
                >
                  <Link href="/login">Sign in to join</Link>
                </Button>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Free to get started · Works on Chrome, Firefox, Safari, Edge
              </p>
            </div>

            <MeetingPreviewMockup />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-b bg-muted/30 py-14 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
                Everything you need for great calls
              </h2>
              <p className="mt-4 text-muted-foreground">
                Built for teams that want reliable video without the complexity of
                enterprise tools.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group rounded-2xl border bg-card p-6 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-14 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
                Up and running in minutes
              </h2>
              <p className="mt-4 text-muted-foreground">
                Three simple steps from sign-up to your first call.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:mt-14 sm:gap-8 md:grid-cols-3">
              {steps.map(({ step, title, description }) => (
                <div key={step} className="relative text-center md:text-left">
                  <span className="font-mono text-4xl font-bold text-primary/20">
                    {step}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-zinc-950 py-14 text-white sm:py-24">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <div
              aria-hidden
              className="pointer-events-none mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent"
            />
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
              Ready to connect your team?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-zinc-400">
              Create a free account and host your first meeting today. Share the
              link and bring everyone into the room.
            </p>
            <div className="mt-8 flex w-full max-w-sm flex-col items-stretch gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
              <Button size="lg" className="h-12 w-full px-8 sm:w-auto" asChild>
                <Link href="/register">
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full border-zinc-700 bg-transparent text-white hover:bg-zinc-900 hover:text-white sm:w-auto"
                asChild
              >
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 sm:py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} VidBitye. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
