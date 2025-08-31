import { createTheme } from '@mui/material/styles';
import { red, indigo, teal, grey } from '@mui/material/colors';

export type PaletteMode = 'light' | 'dark';

export function createAppTheme(mode: PaletteMode = 'light') {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: indigo[600] },
      secondary: { main: teal[600] },
      error: { main: red[600] },
      background: { default: isDark ? '#0f1115' : '#ffffff', paper: isDark ? '#12161c' : '#ffffff' },
      divider: isDark ? 'rgba(255,255,255,0.12)' : grey[200],
    },
    shape: { borderRadius: 10 },
  });
}

const theme = createAppTheme('light');
export default theme;
