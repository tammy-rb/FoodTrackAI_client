import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors, SERVER_URL } from '../../context/globals';  

const ImageWithText = ({ imageUrl, title, text }) => {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ width: '100%', height: 0, paddingBottom: '100%', position: 'relative' }}>
        <img
          src={`${SERVER_URL}/${imageUrl}`}
          alt={title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',  // Ensures the image covers the area without distortion
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        />
      </Box>
      {text && (
        <Typography sx={{ marginTop: 2, color: colors.primary }}>
          {title} : {text} 
        </Typography>
      )}
    </Box>
  );
};

export default ImageWithText;
