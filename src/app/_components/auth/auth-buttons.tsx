"use client";

import Link from "next/link";
import { Button } from "@/app/_components/ui/button";
import { UserNav } from "@/app/_components/common/user-nav";
import type { Session } from "next-auth";

interface AuthButtonsProps {
  session: Session | null;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ session }) => {
  return (
    <div className="flex justify-end gap-2">
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
};

export default AuthButtons;
