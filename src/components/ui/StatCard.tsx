import React from 'react';
import { Box, Typography, type SxProps, type Theme } from '@mui/material';
import ModernCard from './ModernCard';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  sx?: SxProps<Theme>;
}

const trendColors = {
  up: 'success.main',
  down: 'error.main',
  neutral: 'text.secondary',
};

const trendIcons = {
  up: '↗️',
  down: '↘️',
  neutral: '→',
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'default',
  sx,
}: StatCardProps) {
  return (
    <ModernCard
      variant="elevated"
      color={color}
      sx={{
        p: 2.5,
        minHeight: 160,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            {title}
          </Typography>
          <Typography
            variant="h3"
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2rem' },
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box
            sx={{
              ml: 2,
              p: 1.5,
              borderRadius: 1.5,
              backgroundColor: `${color === 'default' ? 'primary' : color}.main`,
              color: 'white',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 48,
              minHeight: 48,
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          mt: 2,
          pt: 1.5,
          borderTop: 1,
          borderColor: 'divider',
          minHeight: 36, // Ensures consistent height even without trend data
        }}
      >
        {trend ? (
          <>
            <Typography
              variant="body2"
              sx={{
                color: trendColors[trend.direction],
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <span>{trendIcons[trend.direction]}</span>
              {trend.value > 0 ? '+' : ''}
              {trend.value}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {trend.label}
            </Typography>
          </>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.75rem', opacity: 0.6 }}
          >
            No trend data
          </Typography>
        )}
      </Box>
    </ModernCard>
  );
}
