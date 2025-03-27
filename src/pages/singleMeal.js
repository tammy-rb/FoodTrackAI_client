import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Grid, Button, Paper } from '@mui/material';
import { colors, SERVER_URL } from '../context/globals';
import ProductCard from '../features/products/ProductCard';
import ErrorSnackbar from '../components/Snackbars/ErrorSnackbar';
import FormModal from '../components/forms/FormModal'
import AddMealForm from '../features/meals/addUpdateMealForms/AddUpdateMealForm'
import CustomButton from '../components/buttons/CustomButton';
import ImageWithText from '../components/cards/imageWithText';

function SingleMeal() {
  const { mealId } = useParams();
  const [meal, setMeal] = useState(null); // current meal
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false); // error occur
  const [errorMessage, setErrorMessage] = useState(null);
  const [openModal, setOpenModal] = useState(false); 

  // fetch meal data and associated products
  const fetchMealData = async () => {
    setLoading(true);
    try {
      // Fetch meal data
      const mealResponse = await axios.get(`${SERVER_URL}/meals/${mealId}`);
      setMeal(mealResponse.data); // Set the meal data

      // Fetch products for the meal
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

  useEffect(() => {
    fetchMealData();
  }, [mealId]);

  // fetch again the new meal and products after updating
  const onUpdate = async () => {
    try {
      await fetchMealData(); 
      console.log("Meal and products updated successfully");
    } catch (error) {
      console.error(`Error fetching updated meal and products with id ${mealId}:`, error);
      setErrorMessage('Failed to fetch updated meal data');
      setOpenSnackbar(true);
    }
    setOpenModal(false); // Close modal after update
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

          {/* images of the meals with their weights */}
          <Paper sx={{ padding: 3, marginBottom: 4, backgroundColor: colors.text, color: '#000' }}>
            <Typography variant="h6" sx={{ color: colors.primary }}>Before & After Pictures:</Typography>
            <Grid container spacing={2}>
              {/* Before Image */}
              <Grid item xs={12} sm={6}>
                <ImageWithText
                  imageUrl={meal.picture_before} 
                  title="Weight Before"
                  text={meal.weight_before ? `${meal.weight_before} kg` : null} 
                />
              </Grid>

              {/* After Image */}
              <Grid item xs={12} sm={6}>
                <ImageWithText
                  imageUrl={meal.picture_after} 
                  title="Weight After"
                  text={meal.weight_after ? `${meal.weight_after} kg` : null} 
                />
              </Grid>
            </Grid>
          </Paper>


          {/* show list of products */}
          <Paper sx={{ padding: 3, backgroundColor: colors.text, color: '#000' }}>
            <Typography variant="h6" sx={{ color: colors.primary }}>Products:</Typography>
            <Grid container spacing={2}>
              {meal.products && meal.products.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <ProductCard
                    item={product}
                    weight_before={product.weight_before}
                    weight_after={product.weight_after}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* button of updating */}
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
          <CustomButton
            onClick={() => { setOpenModal(true); }}
            text="Update Meal"
            style={{
              backgroundColor: colors.primary,
              color: colors.text,
              "&:hover": {
                backgroundColor: "#1565C0",
              },
            }}
          />
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
        onItemSubmit={onUpdate} // after updating call this function
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
    </Box>
  );
}

export default SingleMeal;
