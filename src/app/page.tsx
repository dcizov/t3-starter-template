import Link from "next/link";
import { PanelsTopLeft } from "lucide-react";
import { ModeToggle } from "@/app/_components/common/mode-toggle";
import { HydrateClient } from "@/trpc/server";
import AuthButtons from "./_components/auth/auth-group-buttons";
import { auth } from "@/server/auth";

export default async function Home() {
  const year = new Date().getFullYear();
  const session = await auth();

  return (
    <HydrateClient>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-[50] w-full border-b border-border/40 bg-background/95 backdrop-blur-sm dark:bg-black/[0.6]">
          <div className="container flex h-14 items-center">
            <Link
              href="/"
              className="flex items-center justify-start transition-opacity duration-300 hover:opacity-85"
            >
              <PanelsTopLeft className="mr-3 h-6 w-6" />
              <span className="font-bold">Acme Inc</span>
              <span className="sr-only">Acme Inc</span>
            </Link>
            <nav className="ml-auto flex items-center gap-4">
              <ModeToggle />
              <AuthButtons session={session} />
            </nav>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center">
          <div className="container relative pb-10">
            <section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-6">
              <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
                This is the start of something new
              </h1>
              <span className="max-w-[750px] text-center text-lg font-light text-foreground">
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                diam nonumy eirmod tempor invidunt ut labore et dolore magna
                aliquyam erat, sed diam voluptua. At vero eos et accusam et
                justo duo dolores et ea.
              </span>
            </section>
          </div>
        </main>
        <footer className="border-t border-border/40 py-6 md:py-0">
          <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
              © Acme Inc {year}, All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </HydrateClient>
  );
}
