import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlined from '@mui/icons-material/InfoOutlined';

export function InfoIcon({ title }: { title: string }) {
  return (
    <Tooltip title={title} arrow>
      <span aria-label="Info" role="img" style={{ display: 'inline-flex', alignItems: 'center' }}>
        <InfoOutlined fontSize="inherit" sx={{ fontSize: 16, color: 'text.secondary' }} />
      </span>
    </Tooltip>
  );
}

export default InfoIcon;
