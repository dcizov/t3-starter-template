import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function ErrorCard() {
  return (
    <div className="w-full max-w-[350px] space-y-6">
      <CardHeader className="space-y-1 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <CardTitle className="text-2xl font-bold sm:text-3xl">
          Oops! Something went wrong!
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground sm:text-base">
          Please try again later.
        </CardDescription>
        <CardFooter className="flex justify-center pt-4">
          <Button variant="default" size="sm" asChild>
            <Link href="/signin">Back to sign in</Link>
          </Button>
        </CardFooter>
      </CardHeader>
    </div>
  );
}
