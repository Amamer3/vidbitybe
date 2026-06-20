import Link from "next/link";
import { Video, Users, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Video className="h-6 w-6 text-primary" />
            VidBitye
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Video meetings made{" "}
              <span className="text-primary">simple</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Host secure video calls with screen sharing and in-call chat.
              No downloads required — join from any browser.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">Start for free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Join a meeting</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">HD Video & Audio</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Crystal-clear video calls powered by LiveKit
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Screen Sharing</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Share your screen with one click during any call
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Secure by Default</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Encrypted connections and token-based room access
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <Zap className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-4 text-2xl font-bold">Ready to connect?</h2>
            <p className="mt-2 text-muted-foreground">
              Create an account and start your first meeting in under a minute.
            </p>
            <Button className="mt-6" size="lg" asChild>
              <Link href="/register">Create free account</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} VidBitye. All rights reserved.
      </footer>
    </div>
  );
}
