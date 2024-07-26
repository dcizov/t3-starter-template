export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 lg:px-8">
      <div className="w-full max-w-[90vw] sm:max-w-[400px] lg:max-w-6xl">
        {children}
      </div>
    </main>
  );
}
