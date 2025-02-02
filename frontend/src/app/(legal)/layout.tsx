import { Suspense } from "react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: { segment: string[] };
}>) {
  return (
    <Suspense>
      <div className="flex flex-col justify-center items-center">
        <div className="mx-auto max-w-xl space-y-4 px-4 py-6 md:px-0 md:py-8">
          {children}
        </div>
      </div>
    </Suspense>
  );
}
