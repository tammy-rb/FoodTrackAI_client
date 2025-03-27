import React from 'react';
import { Button } from '@mui/material';
import {colors} from '../../context/globals'
const CustomButton = ({
  onClick,
  text,
  backgroundColor = colors.primary,
  color = 'white',
  hoverBackgroundColor = '#1565C0',
  variant = 'contained',
  sx = {mb: 2},
  ...props
}) => {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      sx={{
        backgroundColor: backgroundColor,
        color: color,
        '&:hover': {
          backgroundColor: hoverBackgroundColor,
        },
        ...sx, // You can pass additional styles via sx prop
      }}
      {...props} // Other props can be passed to the Button component
    >
      {text}
    </Button>
  );
};

export default CustomButton;
