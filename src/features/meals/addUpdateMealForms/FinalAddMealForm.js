import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Card, CardContent } from '@mui/material';
import axios from 'axios';
import { SERVER_URL } from '../../../context/globals';
import InputField from '../../../components/input_fields/InputField';

const FormProductsSubmitting = ({ 
  selectedProducts, 
  onSubmit, 
  onCancel, 
  setOpenSnackbar, 
  setErrorMessage, 
  oldProducts, 
  updateMode,
  onItemSubmit
}) => {
  const [productWeights, setProductWeights] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize product weights with existing data
  useEffect(() => {
    const updatedWeights = selectedProducts.map(product => {
      const existingProduct = oldProducts?.find(p => p.id === product.id);
      return {
        id: product.id,
        sku: product.sku,
        weight_before: existingProduct ? existingProduct.weight_before : '',
        weight_after: existingProduct ? existingProduct.weight_after : ''
      };
    });
    setProductWeights(updatedWeights);
  }, [selectedProducts, oldProducts]);

  const parseWeights = (product) => {
    const weightBefore = product.weight_before !== '' ? parseFloat(product.weight_before) : null;
    const weightAfter = product.weight_after !== '' ? parseFloat(product.weight_after) : null;
    return { weightBefore, weightAfter };
  };

  const handleChange = (index, field, value) => {
    setProductWeights(prevWeights => {
      const updatedWeights = [...prevWeights];
      updatedWeights[index][field] = value;
      return updatedWeights;
    });
  };

  // Validate that weight_after is not greater than weight_before
  const validateWeights = () => {
    for (const product of productWeights) {
      const { weightBefore, weightAfter } = parseWeights(product);
      if (weightBefore !== null && weightAfter !== null && weightAfter > weightBefore) {
        setErrorMessage("Weight after cannot be greater than weight before");
        setOpenSnackbar(true);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateWeights()) return;

    setLoading(true);
    try {
      const meal = await onSubmit();
      if (!meal) throw new Error('Meal creation failed');

      const selectedProductIds = new Set(productWeights.map(p => p.id));

      // Process weight updates for each selected product
      await Promise.all(
        productWeights.map(async (product) => {
          const { weightBefore, weightAfter } = parseWeights(product);
          const item = {
            meal_id: meal.id,
            product_id: product.id,
            weight_before: weightBefore,
            weight_after: weightAfter
          };

          const existingProduct = oldProducts?.find(p => p.id === product.id);
          const url = `${SERVER_URL}/meals-products/${meal.id}`;

          if (existingProduct) {
            await axios.put(`${url}/${existingProduct.id}`, item);
          } else {
            await axios.post(`${SERVER_URL}/meals-products`, item);
          }
        })
       
      );

      if (oldProducts && oldProducts.length > 0){
        // Remove products that were unselected
        await Promise.all(
          oldProducts
            .filter(p => !selectedProductIds.has(p.id)) // Missing in selected products
            .map(async (product) => {
              await axios.delete(`${SERVER_URL}/meals-products/${meal.id}/${product.id}`);
            })
        );
      }
      onItemSubmit(meal);
      onCancel();  // Close the form after submission
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
        {productWeights.map((product, index) => (
          <Box key={product.id} sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              {product.name} (SKU: {product.sku})
            </Typography>
            <InputField
              label="Weight Before (Optional)"
              type="number"
              value={product.weight_before}
              onChange={(e) => handleChange(index, 'weight_before', e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <InputField
              label="Weight After (Optional)"
              type="number"
              value={product.weight_after}
              onChange={(e) => handleChange(index, 'weight_after', e.target.value)}
              fullWidth
            />
          </Box>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="outlined" onClick={onCancel} disabled={loading}>
            Back
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? "Uploading..." : updateMode ? "Update Meal" : "Add Meal"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FormProductsSubmitting;
