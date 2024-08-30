import Image from "next/image";
import { Card, CardContent } from "@/app/_components/ui/card";
import VerifyEmailForm from "@/app/_components/auth/forms/verify-email-form";

export default function VerifyEmailPage() {
  return (
    <Card className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://placehold.co/1920x1080"
          alt="Image"
          width={1920}
          height={1080}
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <CardContent className="flex items-center justify-center py-8 sm:py-12">
        <VerifyEmailForm />
      </CardContent>
    </Card>
  );
}
