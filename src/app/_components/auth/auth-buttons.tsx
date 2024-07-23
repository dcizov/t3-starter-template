"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

import { Button } from "@/app/_components/ui/button";
import { UserNav } from "@/app/_components/common/user-nav";

export default function AuthButtons() {
  const { data: session } = useSession();
  return (
    <div className="flex justify-end gap-4">
      {session && session.user ? (
        <UserNav />
      ) : (
        <>
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/register">Sign up</Link>
          </Button>
        </>
      )}
    </div>
  );
}
