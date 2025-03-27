import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import axios from "axios";
import { colors, SERVER_URL } from "../../../context/globals";
import FormMealProductsSubmitting from './FinalAddMealForm';
import InitialAddMealForm from "./InitialAddMealForm";
import ErrorSnackbar from "../../../components/Snackbars/ErrorSnackbar";

const AddMealForm = ({ onClose, onItemSubmit, item }) => { 
  // the meal item. empty if adding mode, if updating mide - fill with original values
  const [mealData, setMealData] = useState({
    description: item?.description || "",
    picture_before: item?.picture_before || null,
    picture_after: item?.picture_after || null,
    weight_before: item?.weight_before || "",
    weight_after: item?.weight_after || "",
    products: item?.products || [],
  });

  // mode to define which form to show 
  const [submissionStage, setSubmissionStage] = useState('initial'); // 'initial', 'product-weights', 'complete'
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false); // show error message
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]); // the products chosen for the meal
  const [oldProducts, setOldProducts] = useState(null);
  const [updateMode, setUpdateMode] = useState(false);

  // if updating - fill the relevant.
  useEffect(() => {
    if (item) {
      setUpdateMode(true);
      setMealData(item);
      setSelectedProducts(item.products || []);
      setOldProducts(item.products);
      console.log(item.products)
    }
  }, [item]);

  // Function to handle meal creation or update, return the meal created/ updates
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
      
      let response;
      if (item?.id) { // updating
        formData.append("meal_id", item.id);
        response = await axios.put(`${SERVER_URL}/meals/${item.id}`, formData);
      } else { // creating
        response = await axios.post(`${SERVER_URL}/meals`, formData);
      }

      return response.data;
    } catch (error) {
      console.error("Error submitting meal:", error);
      setErrorMessage("Failed to submit the meal");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Render the correct form based on the submission stage
  const renderForm = () => {
    switch (submissionStage) {
      case 'product-weights':
        return (
          <FormMealProductsSubmitting
            selectedProducts={selectedProducts}
            onSubmit={handleMealCreation}
            onCancel={() => setSubmissionStage('initial')}
            setOpenSnackbar={setOpenSnackbar}
            setErrorMessage={setErrorMessage}
            oldProducts={oldProducts}
            updateMode={updateMode}
            onItemSubmit={onItemSubmit} 
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
            updateMode={updateMode}
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
      <Typography variant="h6" sx={{ mb: 3, mt: 2 }}>
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
