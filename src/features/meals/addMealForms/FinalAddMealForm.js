import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardContent,
} from '@mui/material';
import axios from 'axios';
import { SERVER_URL } from '../../../context/globals';
import InputField from '../../../components/input_fields/InputField';

const FormProductsSubmitting = ({ selectedProducts, onSubmit, onCancel, setOpenSnackbar, setErrorMessage }) => {
  const [productWeights, setProductWeights] = useState(
    selectedProducts.map(product => ({
      id: product.id,
      sku: product.sku,
      weight_before: '',
      weight_after: ''
    }))
  );

  const [loading, setLoading] = useState(false);

  // make products null or float up to their values
  const parseWeights = (product) => {
    const weightBefore = product.weight_before!='' ? parseFloat(product.weight_before) : null;
    const weightAfter = product.weight_after!='' ? parseFloat(product.weight_after) : null;
    return {weightBefore, weightAfter}
  }

  // chnaging weights of the products in the list
  const handleChange = (index, field, value) => {
    setProductWeights(prevWeights => {
      const updatedWeights = [...prevWeights];
      updatedWeights[index][field] = value;
      return updatedWeights;
    });
  };

  const validateWeights = () => {
    let error = null;

    // check for each product that the weights are valid
    productWeights.forEach((product, index) => {
  
      const {weightBefore, weightAfter} = parseWeights(product);

      // Compare weights only if both are entered
      if (weightBefore !== null && weightAfter !== null && weightAfter > weightBefore) {
        setErrorMessage("weight after cannot be less than weight before");
        setOpenSnackbar(true);   
        return false;   
      }
    });
    return  true;
  };

  const handleSubmit = async () => {

    if (!validateWeights()){return;}

    setLoading(true);
    try {
      // Call onSubmit to create the meal first
      const meal = await onSubmit();

      if (!meal) {
        throw new Error('Meal creation failed');
      }

      // Submit product weights for the meal (only for products with weights)
      await Promise.all(
        productWeights
          .map(async (product) => {
            const {weightBefore, weightAfter} = parseWeights(product);
            const item = {
              meal_id: meal.id, 
              product_id: product.id, 
              weight_before: weightBefore,
              weight_after: weightAfter
            };
            await axios.post(`${SERVER_URL}/meals-products`, item);
          })
      );

      // Reset form or close if successful
      onCancel();
    } catch (error) {
      console.error("Error submitting product weights:", error);
      setErrorMessage(error.response?.data?.message || "Failed to submit product weights");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        {selectedProducts.map((product, index) => (
          <Box key={product.id} sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              {product.name} (SKU: {product.sku})
            </Typography>
            <InputField
              label="Weight Before (Optional)"
              type="number"
              value={productWeights[index].weight_before}
              onChange={(e) => handleChange(index, 'weight_before', e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <InputField
              label="Weight After (Optional)"
              type="number"
              value={productWeights[index].weight_after}
              onChange={(e) => handleChange(index, 'weight_after', e.target.value)}
              fullWidth
            />
          </Box>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button 
            variant="outlined" 
            onClick={onCancel}
            disabled={loading}
          >
            Back
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Add Meal"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FormProductsSubmitting;