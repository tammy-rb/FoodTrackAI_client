import React, { useState, useEffect } from "react";
import axios from "axios";
import InputField from "../../../components/input_fields/InputField";
import ImageUpload from "../../../components/input_fields/ImageUpload";
import { colors, SERVER_URL } from "../../../context/globals";
import { 
    TextField, 
    Box, 
    Button, 
    Typography, 
    Grid, 
    Card, 
    CardMedia, 
    CardContent, 
    Select, 
    MenuItem 
  } from "@mui/material";
import ProductsMiniList from "../../products/components/productsMiniList";

function InitialAddMealForm({ 
    mealData, 
    setMealData, 
    setSubmissionStage, 
    onClose, 
    selectedProducts, 
    setSelectedProducts, 
    setOpenSnackbar, 
    setErrorMessage 
}) {
    const [productOptions, setProductOptions] = useState([]); // products to choose from for the meal
    const [loading, setLoading] = useState(false);
    const [imagePreviewBefore, setImagePreviewBefore] = useState(null);
    const [imagePreviewAfter, setImagePreviewAfter] = useState(null);

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
    
        // while adding item, user must upload images!
        if (!picture_after || !picture_before) {
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
    
    // handling the form data while it changed
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

    // update the list of products of the meal after changing
    const handleProductChange = (event) => {
        const selectedSkus = event.target.value;
        // insert the list only those chosen
        const selected = productOptions.filter(product => selectedSkus.includes(product.sku));
        setSelectedProducts(selected);
        setMealData(prev => ({ ...prev, products: selectedSkus }));
    };

    // move to form of product-weights
    const handleInitialSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        setSubmissionStage('product-weights');
    };
    
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
                        <ProductsMiniList products = {selectedProducts}/>
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

export default InitialAddMealForm;