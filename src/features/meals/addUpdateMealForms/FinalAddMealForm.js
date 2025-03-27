import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Card, CardContent, Grid } from '@mui/material';
import axios from 'axios';
import { SERVER_URL } from '../../../context/globals';
import InputField from '../../../components/input_fields/InputField';

/**
 * FormProductsSubmitting Component
 * 
 * Allows users to add or update product weights for a meal
 * Handles weight tracking, validation, and submission
 */
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
  // State management for product weights and loading
  const [productWeights, setProductWeights] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize product weights when products change
  useEffect(() => {
    const updatedWeights = selectedProducts.map(product => {
      const existingProduct = oldProducts?.find(p => p.id === product.id);
      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        image_url: product.image_url,
        weight_before: existingProduct ? existingProduct.weight_before : '',
        weight_after: existingProduct ? existingProduct.weight_after : ''
      };
    });
    setProductWeights(updatedWeights);
  }, [selectedProducts, oldProducts]);

  /**
   * Parse weight values, converting empty strings to null
   * @param {Object} product - Product with weight information
   * @returns {Object} Parsed weight values
   */
  const parseWeights = (product) => {
    const weightBefore = product.weight_before !== '' ? parseFloat(product.weight_before) : null;
    const weightAfter = product.weight_after !== '' ? parseFloat(product.weight_after) : null;
    return { weightBefore, weightAfter };
  };

  /**
   * Update product weight in state
   * @param {number} index - Index of the product
   * @param {string} field - Field to update (weight_before/weight_after)
   * @param {string} value - New value for the field
   */
  const handleChange = (index, field, value) => {
    setProductWeights(prevWeights => {
      const updatedWeights = [...prevWeights];
      updatedWeights[index][field] = value;
      return updatedWeights;
    });
  };

  /**
   * Validate that weight_after is not greater than weight_before
   * @returns {boolean} Validation result
   */
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

  /**
   * Handle submission of product weights
   * Validates weights, creates/updates meal, and manages product associations
   */
  const handleSubmit = async () => {
    if (!validateWeights()) return;

    setLoading(true);
    try {
      const meal = await onSubmit(); // Create or update the meal
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

          if (existingProduct) { // Update an existing product
            await axios.put(`${url}/${existingProduct.id}`, item);
          } else {  // Add a new product to the meal
            await axios.post(`${SERVER_URL}/meals-products`, item);
          }
        })
      );

      // Remove unselected products from the meal
      if (oldProducts && oldProducts.length > 0) {
        await Promise.all(
          oldProducts
            .filter(p => !selectedProductIds.has(p.id))
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
    <Card sx={{ maxWidth: 600, margin: 'auto' }}>
      <CardContent>
        {productWeights.map((product, index) => (
          <Box key={product.id} sx={{ 
            mb: 3, 
            p: 2, 
            border: '1px solid #e0e0e0', 
            borderRadius: 2 
          }}>
            <Grid container spacing={2} alignItems="center">
              {/* Product Image */}
              <Grid item xs={3}>
                <Box sx={{ 
                  borderRadius: 2, 
                  overflow: 'hidden', 
                  boxShadow: 1 
                }}>
                  <img 
                    src={`${SERVER_URL}/${product.image_url}`} 
                    alt={product.name} 
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      objectFit: 'cover' 
                    }}
                  />
                </Box>
              </Grid>

              {/* Product Details and Weight Inputs */}
              <Grid item xs={9}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {product.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                  SKU: {product.sku}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <InputField
                    label="Weight Before"
                    type="number"
                    value={product.weight_before}
                    onChange={(e) => handleChange(index, 'weight_before', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                  <InputField
                    label="Weight After"
                    type="number"
                    value={product.weight_after}
                    onChange={(e) => handleChange(index, 'weight_after', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        ))}

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 3 
        }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={onCancel} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading 
              ? "Processing..." 
              : (updateMode ? "Update Meal" : "Add Meal")
            }
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// With React.memo - prevents re-render if props are the same
export default React.memo(FormProductsSubmitting);