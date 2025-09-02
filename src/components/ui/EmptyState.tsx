import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
  };
  size?: 'small' | 'medium' | 'large';
}

const sizeConfig = {
  small: {
    iconSize: '2.5rem',
    titleVariant: 'h6' as const,
    py: 3,
  },
  medium: {
    iconSize: '3.5rem',
    titleVariant: 'h5' as const,
    py: 4,
  },
  large: {
    iconSize: '4.5rem',
    titleVariant: 'h4' as const,
    py: 6,
  },
};

export default function EmptyState({
  icon = '📊',
  title,
  description,
  action,
  size = 'medium',
}: EmptyStateProps) {
  const config = sizeConfig[size];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: config.py,
        px: 3,
      }}
    >
      <Typography
        sx={{
          fontSize: config.iconSize,
          mb: 2,
          opacity: 0.7,
          filter: 'grayscale(0.3)',
        }}
      >
        {icon}
      </Typography>

      <Typography
        variant={config.titleVariant}
        color="text.secondary"
        sx={{
          mb: description ? 1 : action ? 3 : 0,
          fontWeight: 600,
        }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: action ? 3 : 0,
            maxWidth: 400,
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>
      )}

      {action && (
        <Button variant={action.variant || 'contained'} onClick={action.onClick} sx={{ mt: 1 }}>
          {action.label}
        </Button>
      )}
    </Box>
  );
}
