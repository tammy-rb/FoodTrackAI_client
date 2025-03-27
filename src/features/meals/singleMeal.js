import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Grid, Button, Paper } from '@mui/material';
import { colors, SERVER_URL } from '../../context/globals';
import ProductCard from '../products/ProductCard';
import ErrorSnackbar from '../../components/Snackbars/ErrorSnackbar';
import FormModal from '../../components/FormModal'
import AddMealForm from '../meals/addMealForms/AddMealForm'

function SingleMeal() {
  const { mealId } = useParams();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [updateMeal, setUpdateMeal] = useState(false);
  const [openModal, setOpenModal] = useState(false); // Manage modal state

  useEffect(() => {
    const fetchMealData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${SERVER_URL}/meals/${mealId}`);
        setMeal(response.data); // Set the meal data

        const productsResponse = await axios.get(`${SERVER_URL}/meals-products/meal/${mealId}/products`);
        setMeal((prevMeal) => ({
          ...prevMeal,
          products: productsResponse.data, // Set the products inside the meal object
        }));
      } catch (error) {
        console.error(`Error fetching meal with id ${mealId}:`, error);
        setErrorMessage('Failed to fetch meal data');
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMealData();
  }, [mealId]);

  const handleToggleUpdate = () => {
    setUpdateMeal((prevState) => !prevState);
    setOpenModal(true); // Open the modal when the user clicks update
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Box sx={{ backgroundColor: colors.background, padding: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: colors.primary, fontWeight: 'bold' }}>
        Meal Details
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          <Paper sx={{ padding: 3, marginBottom: 4, backgroundColor: colors.text, color: '#000' }}>
            <Typography variant="h6" sx={{ color: colors.primary }}>Meal Description:</Typography>
            <Typography sx={{ marginTop: 1 }}>{meal.description}</Typography>
          </Paper>

          <Paper sx={{ padding: 3, marginBottom: 4, backgroundColor: colors.text, color: '#000' }}>
            <Typography variant="h6" sx={{ color: colors.primary }}>Before & After Pictures:</Typography>
            <Grid container spacing={2}>
                {/* Before Image */}
                <Grid item xs={12} sm={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ width: '100%', height: 0, paddingBottom: '100%', position: 'relative' }}>
                    <img
                    src={`${SERVER_URL}/${meal.picture_before}`}
                    alt="Before"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover', // Ensures the image covers the area without distortion
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    />
                </Box>
                {meal.weight_before && (
                    <Typography sx={{ marginTop: 2, color: colors.primary }}>
                    Before Weight: {meal.weight_before} kg
                    </Typography>
                )}
                </Grid>

                {/* After Image */}
                <Grid item xs={12} sm={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ width: '100%', height: 0, paddingBottom: '100%', position: 'relative' }}>
                    <img
                    src={`${SERVER_URL}/${meal.picture_after}`}
                    alt="After"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover', // Ensures the image covers the area without distortion
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    />
                </Box>
                {meal.weight_after && (
                    <Typography sx={{ marginTop: 2, color: colors.primary }}>
                    After Weight: {meal.weight_after} kg
                    </Typography>
                )}
                </Grid>
            </Grid>
            </Paper>


          <Paper sx={{ padding: 3, backgroundColor: colors.text, color: '#000' }}>
            <Typography variant="h6" sx={{ color: colors.primary }}>Products:</Typography>
            <Grid container spacing={2}>
              {meal.products && meal.products.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <ProductCard
                    item={product}
                    // No need for handleUpdateProduct or handleDeleteProduct unless needed
                    weight_before={meal.weight_before}
                    weight_after={meal.weight_after}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: updateMeal ? colors.secondary : colors.primary,
                color: colors.text,
                '&:hover': {
                  backgroundColor: updateMeal ? '#FB8C00' : '#1565C0',
                },
              }}
              onClick={handleToggleUpdate}
            >
              {updateMeal ? 'Cancel Update' : 'Update Meal'}
            </Button>
          </Box>
        </>
      )}

      <ErrorSnackbar
        openSnackbar={openSnackbar}
        setOpenSnackbar={setOpenSnackbar}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />

      {/* Add the FormModal for updating the meal */}
      <FormModal
        InsideForm={AddMealForm}
        item={meal} // Pass the existing meal item
        onItemAdded={setMeal} // Update the meal after the form submission
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
    </Box>
  );
}

export default SingleMeal;
