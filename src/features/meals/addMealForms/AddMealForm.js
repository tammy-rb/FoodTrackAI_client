import React, { useState } from "react";
import { Box, Typography, } from "@mui/material";
import axios from "axios";
import { colors, SERVER_URL } from "../../../context/globals";
import FormMealProductsSubmitting from './FinalAddMealForm';
import InitialAddMealForm from "./InitialAddMealForm";
import ErrorSnackbar from "../../../components/Snackbars/ErrorSnackbar";

const AddMealForm = ({ onClose, onItemAdded, item }) => {
  const [mealData, setMealData] = useState({
    description: "",
    picture_before: null,
    picture_after: null,
    weight_before: "",
    weight_after: "",
    products: [],
  });

  const [submissionStage, setSubmissionStage] = useState('initial'); // 'initial', 'product-weights', 'complete'
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false); // show error message
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]); // the products chosen for the meal

  // post a meal without its products.
  const handleMealCreation = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(mealData).forEach(([key, value]) => {
        if (key !== "picture_before" && key !== "picture_after" && value) {
          formData.append(key, value);
        }
      });

      if (mealData.picture_before) formData.append("meal_pictures", mealData.picture_before);
      if (mealData.picture_after) formData.append("meal_pictures", mealData.picture_after);

      const response = await axios.post(`${SERVER_URL}/meals`, formData);
      
      // Return the created meal data
      return response.data;
    } catch (error) {
      console.error("Error submitting meal:", error);
      setErrorMessage("Failed to submit the meal");
      setOpenSnackbar(true);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      // This will be called by the product weights form
      const meal = await handleMealCreation();
      onItemAdded(meal);
      onClose();
      return meal;
    } catch (error) {
      // Error handling is done in handleMealCreation
      return null;
    }
  };

  const renderForm = () => {
    switch(submissionStage) {
      case 'product-weights':
        return (
          <FormMealProductsSubmitting 
            selectedProducts={selectedProducts} 
            onSubmit={handleFinalSubmit} 
            onCancel={() => setSubmissionStage('initial')}
            setOpenSnackbar={setOpenSnackbar}
            setErrorMessage={setErrorMessage}         
          />
        );
      default:
        return (
          <InitialAddMealForm
            mealData={mealData}
            setMealData={setMealData}
            setSubmissionStage={setSubmissionStage}
            onClose={onClose}
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            setOpenSnackbar={setOpenSnackbar}
            setErrorMessage={setErrorMessage}
            item={item}
          />
        );
    }
  };

  return (
    <Box sx={{ 
      textAlign: "center", 
      overflowY: 'auto', 
      width: '100%', 
      maxWidth: 600, 
      margin: '0 auto', 
      p: { xs: 2, sm: 4 }, 
      boxSizing: 'border-box', 
      overflowX: 'hidden' 
    }}>
      <Typography variant="h6" sx={{ mb: 3, mt:2 }}>
        {submissionStage === 'product-weights' ? 'Add Product Weights' : 'Add New Meal'}
      </Typography>
      
      {renderForm()}
      
      <ErrorSnackbar
        openSnackbar={openSnackbar}
        setOpenSnackbar={setOpenSnackbar}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </Box>
  );
};

export default AddMealForm;