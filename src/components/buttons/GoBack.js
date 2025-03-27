// src/components/GoBackButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const GoBackButton = ({ customText, customColor, customVariant }) => {
  const navigate = useNavigate();

  return (
    <Button
      variant={customVariant || 'outlined'}  // Default is 'outlined'
      color={customColor || 'primary'}  // Default is 'primary'
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate(-1)}  // Go back to the previous page
    >
      {customText || 'Go Back'}  {/* Default text is 'Go Back' */}
    </Button>
  );
};

export default GoBackButton;
