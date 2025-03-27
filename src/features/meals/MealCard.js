import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, Grid, IconButton } from '@mui/material';
import { SERVER_URL } from '../../context/globals';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const MealCard = ({ item, onRemove, onUpdate }) => {
  // Handler for remove action
  const handleRemove = () => {
    if (onRemove) {
      onRemove(item.id); // Pass the meal ID to remove it
    }
  };

  // Handler for update action
  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate(item); // Pass the entire item for updating
    }
  };

  return (
    <Card sx={{ backgroundColor: 'white', boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
      <Grid container>
        {/* Left side - Images */}
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            sx={{ width: '100%', height: 200, objectFit: 'cover' }}
            image={`${SERVER_URL}/${item.picture_before}`}
            alt="Meal Before"
          />
          <CardMedia
            component="img"
            sx={{ width: '100%', height: 200, objectFit: 'cover', marginTop: '8px' }}
            image={`${SERVER_URL}/${item.picture_after}`}
            alt="Meal After"
          />
        </Grid>

        {/* Right side - Details */}
        <Grid item xs={12} md={6}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Meal ID: {item.id}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {item.description}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Initial Weight: {item.weight_before}g
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Final Weight: {item.weight_after}g
            </Typography>
            
            {/* Display Products */}
            {item.products && item.products.length > 0 && (
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Products in the Meal:
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {item.products && item.products.map((product, index) => (
                <Chip key={index} label={product} color="primary" variant="outlined" />
              ))}
            </Box>

            {/* Buttons for Update and Remove */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <IconButton onClick={handleRemove} color="secondary">
                <DeleteIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
};

export default MealCard;
