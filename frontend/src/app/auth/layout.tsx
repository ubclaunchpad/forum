import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh w-full  bg-primary-800 flex items-center overflow-hiddne">
      <section className="flex-1 w-full min-h-screen flex-shrink-0">
        <Link href="/" passHref className="no-underline">
          <h1 className="text-5xl no-underline text-white px-20 py-20">
            Forum AI
          </h1>
        </Link>
      </section>
      <div className="flex-1 flex bg-neutral-100  min-h-screen flex-shrink-0 h-full flex-col justify-center items-center">
        {children}
      </div>
    </div>
  );
}
