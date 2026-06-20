import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>You&apos;re offline</CardTitle>
          <CardDescription>
            VidBitye needs an internet connection for video meetings. Reconnect and try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/">Try again</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
