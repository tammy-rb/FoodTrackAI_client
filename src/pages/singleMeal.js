import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Container, 
  CircularProgress,
  Button 
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import GoBackButton from '../components/buttons/GoBack';
import { colors, SERVER_URL } from '../context/globals';
import ProductCard from '../features/products/ProductCard';
import ErrorSnackbar from '../components/Snackbars/ErrorSnackbar';
import FormModal from '../components/forms/FormModal';
import AddMealForm from '../features/meals/addUpdateMealForms/AddUpdateMealForm';
import ImageWithText from '../components/cards/imageWithText';
import ConfirmationDialog from '../components/dialogs/ConfirmationDialog'
function SingleMeal() {
  const navigate = useNavigate();
  const { mealId } = useParams();

  // State Management
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch Meal Data
  const fetchMealData = async () => {
    setLoading(true);
    try {
      const [mealResponse, productsResponse] = await Promise.all([
        axios.get(`${SERVER_URL}/meals/${mealId}`),
        axios.get(`${SERVER_URL}/meals-products/meal/${mealId}/products`),
      ]);
      
      setMeal({
        ...mealResponse.data,
        products: productsResponse.data,
      });
    } catch (error) {
      console.error(`Error fetching meal with id ${mealId}:`, error);
      setErrorMessage('Failed to fetch meal data');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Delete Meal
  const handleDeleteMeal = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${SERVER_URL}/meals/${mealId}`);
      navigate('/features/meals');
    } catch (error) {
      console.error(`Error deleting meal with id ${mealId}:`, error);
      setErrorMessage('Failed to delete meal');
      setOpenSnackbar(true);
    } finally {
      setDeleting(false);
      setOpenDeleteDialog(false);
    }
  };

  // Update Meal
  const onUpdate = async () => {
    try {
      await fetchMealData(); 
      setOpenModal(false);
    } catch (error) {
      console.error(`Error fetching updated meal and products with id ${mealId}:`, error);
      setErrorMessage('Failed to fetch updated meal data');
      setOpenSnackbar(true);
    }
  };

  useEffect(() => {
    fetchMealData();
  }, [mealId]);

  // Loading State
  if (loading) {
    return (
      <Container 
        maxWidth="md" 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress color="primary" size={60} />
      </Container>
    );
  }

  // Render Meal Details
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        color="primary" 
        gutterBottom 
        sx={{ fontWeight: 'bold', textAlign: 'center' }}
      >
        Meal Details
      </Typography>

      {/* Meal Description */}
      <Paper 
        elevation={3} 
        sx={{ 
          padding: 3, 
          marginBottom: 3, 
          backgroundColor: 'background.paper' 
        }}
      >
        <Typography variant="h6" color="primary" gutterBottom>
          Meal Description
        </Typography>
        <Typography variant="body1">{meal.description}</Typography>
      </Paper>

      {/* Before & After Images */}
      <Paper 
        elevation={3} 
        sx={{ 
          padding: 3, 
          marginBottom: 3, 
          backgroundColor: 'background.paper' 
        }}
      >
        <Typography variant="h6" color="primary" gutterBottom>
          Before & After Pictures
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <ImageWithText
              imageUrl={meal.picture_before} 
              title="Weight Before"
              text={meal.weight_before ? `${meal.weight_before} g` : null} 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <ImageWithText
              imageUrl={meal.picture_after} 
              title="Weight After"
              text={meal.weight_after ? `${meal.weight_after} g` : null} 
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Products List */}
      <Paper 
        elevation={3} 
        sx={{ 
          padding: 3, 
          backgroundColor: 'background.paper' 
        }}
      >
        <Typography variant="h6" color="primary" gutterBottom>
          Products
        </Typography>
        <Grid container spacing={2}>
          {meal.products?.map((product) => (
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

      {/* Action Buttons */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2, 
          mt: 4 
        }}
      >
        <GoBackButton/>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => setOpenModal(true)}
        >
          Update Meal
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setOpenDeleteDialog(true)}
        >
          Delete Meal
        </Button>
      </Box>

      {/* Error Snackbar */}
      <ErrorSnackbar
        openSnackbar={openSnackbar}
        setOpenSnackbar={setOpenSnackbar}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />

      {/* Update Meal Modal */}
      <FormModal
        InsideForm={AddMealForm}
        item={meal}
        onItemSubmit={onUpdate}
        openModal={openModal}
        setOpenModal={setOpenModal}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={openDeleteDialog}
        title="Delete Meal"
        message="Are you sure you want to delete this meal? This action cannot be undone."
        onCancel={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteMeal}
        confirmText="Delete"
        loading={deleting}
      />
    </Container>
  );
}

export default SingleMeal;
