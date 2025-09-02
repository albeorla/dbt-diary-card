import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import ModernCard from './ModernCard';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  loading?: boolean;
  emptyState?: {
    icon?: string;
    message: string;
    description?: string;
  };
  height?: number | string;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  action,
  loading,
  emptyState,
  height = 300,
}: ChartCardProps) {
  const showEmptyState = !loading && emptyState;

  return (
    <ModernCard
      title={title}
      subtitle={subtitle}
      action={action}
      sx={{
        '& canvas': {
          maxHeight: height,
        },
      }}
    >
      <Box
        sx={{
          height: typeof height === 'number' ? `${height}px` : height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {loading ? (
          <Box sx={{ width: '100%', height: '100%' }}>
            <Skeleton variant="rectangular" width="100%" height="60%" sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-around' }}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" width="15%" height="40px" />
              ))}
            </Box>
          </Box>
        ) : showEmptyState ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              px: 2,
            }}
          >
            {emptyState.icon && (
              <Typography
                sx={{
                  fontSize: '3rem',
                  mb: 2,
                  opacity: 0.7,
                }}
              >
                {emptyState.icon}
              </Typography>
            )}
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              {emptyState.message}
            </Typography>
            {emptyState.description && (
              <Typography variant="body2" color="text.secondary">
                {emptyState.description}
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ width: '100%', height: '100%' }}>{children}</Box>
        )}
      </Box>
    </ModernCard>
  );
}
