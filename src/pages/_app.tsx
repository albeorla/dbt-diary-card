import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Geist } from "next/font/google";
import { api } from "~/utils/api";
import dynamic from "next/dynamic";
import Head from "next/head";

import "~/styles/globals.css";

const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  const [routeMsg, setRouteMsg] = useState<string>("");
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStart = (url: string) => {
      setRouteMsg(`Navigating to ${url}`);
    };
    const handleDone = () => {
      setRouteMsg(`Page loaded`);
      // Move focus to main content for a11y
      window.setTimeout(() => mainRef.current?.focus(), 0);
    };
    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleDone);
    router.events.on("routeChangeError", handleDone);
    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleDone);
      router.events.off("routeChangeError", handleDone);
    };
  }, [router.events]);

  const isActive = (href: string) => router.pathname === href;

  return (
    <SessionProvider session={session}>
      <div className={geist.className}>
        <Head>
          <title>DBT Diary Card</title>
        </Head>
        <header className="sticky top-0 z-20 border-b bg-white/90 px-4 py-3 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <Link href="/dashboard" className="mr-1 text-base font-semibold text-gray-900 hover:underline">
                DBT Diary Card
              </Link>
              <RoleAwareNavNoSSR isActive={isActive} />
            </div>
            <HeaderAuthNoSSR />
          </nav>
        </header>
        <div aria-live="polite" className="sr-only" role="status">
          {routeMsg}
        </div>
        <div ref={mainRef} tabIndex={-1}>
          <Component {...pageProps} />
        </div>
      </div>
    </SessionProvider>
  );
};

function RoleAwareNav({ isActive }: { isActive: (href: string) => boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { status } = useSession();
  const { data } = api.org.state.useQuery(undefined, { enabled: mounted && status === "authenticated" });
  // Render stable placeholders during SSR/first paint to avoid hydration mismatch
  if (!mounted) {
    return (
      <>
        <span className="inline-block h-4 w-16 animate-pulse rounded bg-gray-200" />
      </>
    );
  }
  const role = data?.role;
  return (
    <>
      {role === "USER" && (
        <>
          <Link className={`hover:underline ${isActive("/dashboard") ? "font-semibold" : "text-gray-700"}`} href="/dashboard">
            Dashboard
          </Link>
          <Link className={`hover:underline ${isActive("/diary") ? "font-semibold" : "text-gray-700"}`} href="/diary">
            Diary
          </Link>
          <Link className={`hover:underline ${isActive("/history") ? "font-semibold" : "text-gray-700"}`} href="/history">
            History
          </Link>
        </>
      )}
      {role === "MANAGER" && (
        <Link className={`hover:underline ${isActive("/manager") ? "font-semibold" : "text-gray-700"}`} href="/manager">
          Manager Overview
        </Link>
      )}
      {role === "ADMIN" && (
        <Link className={`hover:underline ${isActive("/admin/org") ? "font-semibold" : "text-gray-700"}`} href="/admin/org">
          Admin Overview
        </Link>
      )}
    </>
  );
}

function HeaderAuth() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { data: session } = useSession();
  if (!mounted) {
    return <span className="inline-block h-4 w-12 animate-pulse rounded bg-gray-200" />;
  }
  if (!session) {
    return (
      <button
        className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-800 hover:bg-gray-50"
        onClick={() => void signIn()}
      >
        Sign in
      </button>
    );
  }
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="truncate max-w-[160px] text-gray-700">{session.user?.name ?? session.user?.email}</span>
      <button
        className="rounded bg-gray-800 px-3 py-1 text-white hover:bg-black"
        onClick={() => void signOut({ callbackUrl: "/signin" })}
      >
        Sign out
      </button>
    </div>
  );
}

export default api.withTRPC(MyApp);

const RoleAwareNavNoSSR = dynamic(async () => RoleAwareNav, { ssr: false });
const HeaderAuthNoSSR = dynamic(async () => HeaderAuth, { ssr: false });
