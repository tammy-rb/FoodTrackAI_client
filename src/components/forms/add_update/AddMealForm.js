import React, { useState, useEffect } from "react";
import { 
  TextField, 
  Box, 
  Button, 
  Typography, 
  Snackbar, 
  Alert, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Select, 
  MenuItem 
} from "@mui/material";
import axios from "axios";
import { colors, SERVER_URL } from "../../../context/globals";
import InputField from "../../input_fields/InputField";
import ImageUpload from "../../input_fields/ImageUpload";
import FormMealProductsSubmitting from './FormMealProductsSubmitting';

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
  const [imagePreviewBefore, setImagePreviewBefore] = useState(null);
  const [imagePreviewAfter, setImagePreviewAfter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [createdMeal, setCreatedMeal] = useState(null);

  // Fetch products
  useEffect(() => {
    const fetchProductOptions = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/products`);
        setProductOptions(response.data.items);
      } catch (error) {
        console.error("Error fetching product options:", error);
        setErrorMessage("Failed to load product options");
        setOpenSnackbar(true);
      }
    };
    fetchProductOptions();
  }, []);

  const validateForm = () => {
    const { weight_before, weight_after, picture_after, picture_before, products } = mealData;
    let errors = [];
    
    if (!weight_before || !weight_after) {
      errors.push("Please fill in weight fields");
    }

    if (parseFloat(weight_after) > parseFloat(weight_before)) {
      errors.push("After weight cannot be greater than before weight");
    }

    if (!item && (!picture_after || !picture_before)) {
      errors.push("Please upload both before and after images");
    }

    if (products.length === 0) {
      errors.push("Please select at least one product");
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join(". "));
      setOpenSnackbar(true);
      return false;
    }

    return true;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMealData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      if (type === "before") {
        setMealData(prev => ({ ...prev, picture_before: file }));
        setImagePreviewBefore(URL.createObjectURL(file));
      } else {
        setMealData(prev => ({ ...prev, picture_after: file }));
        setImagePreviewAfter(URL.createObjectURL(file));
      }
    }
  };

  const handleProductChange = (event) => {
    const selectedSkus = event.target.value;
    const selected = productOptions.filter(product => selectedSkus.includes(product.sku));
    setSelectedProducts(selected);
    setMealData(prev => ({ ...prev, products: selectedSkus }));
  };

  const handleInitialSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setSubmissionStage('product-weights');
  };

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
          />
        );
      default:
        return (
          <form onSubmit={handleInitialSubmit}>
            <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
              <Grid item xs={12}>
                <TextField 
                  label="Description" 
                  name="description" 
                  value={mealData.description} 
                  onChange={handleChange} 
                  multiline 
                  rows={4} 
                  fullWidth 
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <InputField 
                  label="Weight Before (g)" 
                  name="weight_before" 
                  type="number" 
                  value={mealData.weight_before} 
                  onChange={handleChange} 
                  required 
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <InputField 
                  label="Weight After (g)" 
                  name="weight_after" 
                  type="number" 
                  value={mealData.weight_after} 
                  onChange={handleChange} 
                  required 
                />
              </Grid>

              <Grid item xs={12}>
                <Select 
                  multiple 
                  value={mealData.products} 
                  onChange={handleProductChange} 
                  displayEmpty 
                  fullWidth
                >
                  {productOptions.map((p) => (
                    <MenuItem key={p.sku} value={p.sku}>
                      {`${p.name} (${p.sku})`}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              {/* Selected Products Display */}
              {selectedProducts.length > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ overflowY: 'auto', maxHeight: 150, width: '100%', mt: 2 }}>
                    {selectedProducts.map((product, index) => (
                      <Card key={index} sx={{ display: 'flex', mb: 1 }}>
                        <CardMedia 
                          component="img" 
                          sx={{ width: 100 }} 
                          image={`${SERVER_URL}/${product.image_url}`} 
                          alt={product.name} 
                        />
                        <CardContent>
                          <Typography>{product.name} (SKU: {product.sku})</Typography>
                          <Typography>Serving Style: {product.serving_style}</Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Grid>
              )}

              {/* Image Uploads */}
              <Grid item xs={12} display="flex" justifyContent="center" gap={2}>
                <ImageUpload 
                  imagePreview={imagePreviewBefore} 
                  handleImageChange={(e) => handleImageChange(e, 'before')} 
                  label="Before Image" 
                  fullWidth 
                />
                <ImageUpload 
                  imagePreview={imagePreviewAfter} 
                  handleImageChange={(e) => handleImageChange(e, 'after')} 
                  label="After Image" 
                  fullWidth 
                />
              </Grid>

              <Grid item xs={12} display="flex" justifyContent="center" gap={2}>
                <Button onClick={onClose} sx={{ color: colors.secondary }}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>Next</Button>
              </Grid>
            </Grid>
          </form>
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
      
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => {
            setOpenSnackbar(false); 
            setErrorMessage("");
          }} 
          severity="error"
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddMealForm;