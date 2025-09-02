import React from 'react';
import { Paper, Box, Typography, type SxProps, type Theme } from '@mui/material';

interface ModernCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
  variant?: 'elevated' | 'outlined' | 'gradient';
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

const variantStyles = {
  elevated: {
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    border: 'none',
  },
  outlined: {
    boxShadow: 'none',
    border: 1,
    borderColor: 'divider',
  },
  gradient: {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
    border: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
};

const colorStyles = {
  default: {},
  primary: {
    borderColor: 'primary.main',
    '& .MuiTypography-h6': { color: 'primary.main' },
  },
  success: {
    borderColor: 'success.main',
    '& .MuiTypography-h6': { color: 'success.main' },
  },
  warning: {
    borderColor: 'warning.main',
    '& .MuiTypography-h6': { color: 'warning.main' },
  },
  error: {
    borderColor: 'error.main',
    '& .MuiTypography-h6': { color: 'error.main' },
  },
};

export default function ModernCard({
  title,
  subtitle,
  children,
  action,
  sx,
  variant = 'elevated',
  color = 'default',
}: ModernCardProps) {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow:
            variant === 'elevated'
              ? '0 10px 16px -4px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.1)'
              : undefined,
        },
        ...variantStyles[variant],
        ...colorStyles[color],
        ...sx,
      }}
    >
      {(title || subtitle || action) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: title || subtitle ? 2 : 0,
          }}
        >
          <Box>
            {title && (
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && <Box sx={{ ml: 2 }}>{action}</Box>}
        </Box>
      )}
      {children}
    </Paper>
  );
}
