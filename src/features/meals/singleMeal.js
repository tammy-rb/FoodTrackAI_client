import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Grid, Button, Paper } from '@mui/material';
import { colors, SERVER_URL } from '../../context/globals';
import ProductCard from '../products/ProductCard';
import ErrorSnackbar from '../../components/Snackbars/ErrorSnackbar';

function SingleMeal() {
    const { mealId } = useParams();
    const [meal, setMeal] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [updateMeal, setUpdateMeal] = useState(false); 

    useEffect(() => {
        const fetchMealData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${SERVER_URL}/meals/${mealId}`);
                setMeal(response.data);

                const productsResponse = await axios.get(`${SERVER_URL}/meals-products/meal/${mealId}/products`);
                setProducts(productsResponse.data);
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

    const handleUpdateProduct = (product) => {
        // Open the modal or form to update the product
        console.log('Update product:', product);
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await axios.delete(`${SERVER_URL}/meals-products/${mealId}/${productId}`);
            setProducts(products.filter((product) => product.id !== productId));
        } catch (error) {
            setErrorMessage('Failed to delete the product');
            setOpenSnackbar(true);
        }
    };

    const handleToggleUpdate = () => {
        setUpdateMeal((prevState) => !prevState);
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
                            <Grid item xs={6}>
                                <img
                                    src={`${SERVER_URL}/${meal.picture_before}`}
                                    alt="Before"
                                    width="100%"
                                    style={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                                />
                                {meal.weight_before && (
                                    <Typography sx={{ marginTop: 2, color: colors.primary }}>
                                        Before Weight: {meal.weight_before} kg
                                    </Typography>
                                )}
                            </Grid>
                            <Grid item xs={6}>
                                <img
                                    src={`${SERVER_URL}/${meal.picture_after}`}
                                    alt="After"
                                    width="100%"
                                    style={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                                />
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
                            {products.map((product) => (
                                <Grid item xs={12} sm={6} md={4} key={product.id}>
                                    <ProductCard
                                        item={product}
                                        onUpdate={updateMeal ? handleUpdateProduct : null}
                                        onRemove={updateMeal ? handleDeleteProduct : null}
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
        </Box>
    );
}

export default SingleMeal;
