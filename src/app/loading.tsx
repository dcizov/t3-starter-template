import { LoaderCircle } from "lucide-react";

// TODO: add loader to individual pages instead of the root layout and replace with skeleton
export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
