import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { type AppType } from 'next/app';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Inter } from 'next/font/google';
import { api } from '~/utils/api';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import '~/styles/globals.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import theme, { createAppTheme, type PaletteMode } from '~/styles/theme';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const inter = Inter({
  subsets: ['latin'],
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  const [routeMsg, setRouteMsg] = useState<string>('');
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
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleDone);
    router.events.on('routeChangeError', handleDone);
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleDone);
      router.events.off('routeChangeError', handleDone);
    };
  }, [router.events]);

  const isActive = (href: string) => router.pathname === href;

  const [mode, setMode] = useState<PaletteMode>('light');
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Prefer saved theme, else system
    const saved =
      typeof window !== 'undefined'
        ? (localStorage.getItem('theme-mode') as PaletteMode | null)
        : null;
    if (saved === 'light' || saved === 'dark') setMode(saved);
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      setMode('dark');
    setMounted(true);
  }, []);
  const muiTheme = mounted ? createAppTheme(mode) : theme;

  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <div className={inter.className}>
          <Head>
            <title>DBT Diary Card</title>
          </Head>
          <AppBar
            position="sticky"
            color="transparent"
            elevation={0}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              backdropFilter: 'blur(6px)',
              bgcolor:
                muiTheme.palette.mode === 'dark'
                  ? 'rgba(2, 6, 23, 0.7)'
                  : 'rgba(248, 250, 252, 0.7)',
            }}
          >
            <Toolbar sx={{ px: 2 }}>
              <Container
                maxWidth="lg"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Link href="/dashboard">
                    <Typography
                      variant="h6"
                      component="span"
                      color="text.primary"
                      sx={{ fontWeight: 700 }}
                    >
                      DBT Diary Card
                    </Typography>
                  </Link>
                  <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
                    <RoleAwareNavNoSSR isActive={isActive} />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    aria-label="Toggle theme"
                    onClick={() => {
                      setMode((m) => {
                        const next = m === 'light' ? 'dark' : 'light';
                        try {
                          localStorage.setItem('theme-mode', next);
                        } catch {}
                        return next;
                      });
                    }}
                  >
                    {mode === 'dark' ? (
                      <LightModeIcon fontSize="small" />
                    ) : (
                      <DarkModeIcon fontSize="small" />
                    )}
                  </IconButton>
                  <HeaderAuthNoSSR />
                </Box>
              </Container>
            </Toolbar>
          </AppBar>
          <div aria-live="polite" className="sr-only" role="status">
            {routeMsg}
          </div>
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <div ref={mainRef} tabIndex={-1}>
              <Component {...pageProps} />
            </div>
          </Container>
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
};

function RoleAwareNav({ isActive }: { isActive: (href: string) => boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { status } = useSession();
  const { data } = api.org.state.useQuery(undefined, {
    enabled: mounted && status === 'authenticated',
  });
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
      {role === 'USER' && (
        <>
          <Link
            className={`hover:underline ${isActive('/dashboard') ? 'font-semibold' : 'text-gray-700'}`}
            href="/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className={`hover:underline ${isActive('/diary') ? 'font-semibold' : 'text-gray-700'}`}
            href="/diary"
          >
            Diary
          </Link>
          <Link
            className={`hover:underline ${isActive('/history') ? 'font-semibold' : 'text-gray-700'}`}
            href="/history"
          >
            History
          </Link>
        </>
      )}
      {role === 'MANAGER' && (
        <Link
          className={`hover:underline ${isActive('/manager') ? 'font-semibold' : 'text-gray-700'}`}
          href="/manager"
        >
          Manager Overview
        </Link>
      )}
      {role === 'ADMIN' && (
        <Link
          className={`hover:underline ${isActive('/admin/org') ? 'font-semibold' : 'text-gray-700'}`}
          href="/admin/org"
        >
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
      <Button variant="outlined" size="small" onClick={() => void signIn()}>
        Sign in
      </Button>
    );
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {session.user?.name ?? session.user?.email}
      </Typography>
      <Button
        variant="contained"
        size="small"
        onClick={() => void signOut({ callbackUrl: '/signin' })}
      >
        Sign out
      </Button>
    </Box>
  );
}

export default api.withTRPC(MyApp);

const RoleAwareNavNoSSR = dynamic(async () => RoleAwareNav, { ssr: false });
const HeaderAuthNoSSR = dynamic(async () => HeaderAuth, { ssr: false });
