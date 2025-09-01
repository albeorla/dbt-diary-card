import { createTheme } from '@mui/material/styles';

export type PaletteMode = 'light' | 'dark';

export function createAppTheme(mode: PaletteMode = 'light') {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: '#2563eb' }, // blue-600
      secondary: { main: '#db2777' }, // pink-600
      error: { main: '#dc2626' }, // red-600
      background: {
        default: isDark ? '#020617' : '#f8fafc', // slate-950, slate-50
        paper: isDark ? '#0f172a' : '#ffffff', // slate-900, white
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#0f172a', // slate-100, slate-900
        secondary: isDark ? '#94a3b8' : '#475569', // slate-400, slate-600
      },
      divider: isDark ? '#1e293b' : '#e2e8f0', // slate-800, slate-200
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: [
        'Inter',
        'ui-sans-serif',
        'system-ui',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ].join(','),
      h1: {
        fontSize: '2.25rem',
        fontWeight: 700,
        lineHeight: '2.5rem',
      },
      h2: {
        fontSize: '1.875rem',
        fontWeight: 700,
        lineHeight: '2.25rem',
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 700,
        lineHeight: '2rem',
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 700,
        lineHeight: '1.75rem',
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: '1.75rem',
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: '1.5rem',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: '1.5rem',
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
  });
}

const theme = createAppTheme('light');
export default theme;
