import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Snackbar, Alert, Grid } from "@mui/material";
import axios from "axios";
import { colors, SERVER_URL } from "../../../context/globals";
import InputField from "../../input_fields/InputField";
import SelectField from "../../input_fields/SelectField";
import ImageUpload from "../../input_fields/ImageUpload";

// Form component for adding and updating products
// if item is null = meaning adding state. else = updating this item.
const AddUpdateProductForm = ({ onClose, onItemAdded, item }) => {
  const [productData, setProductData] = useState({
    sku: "", name: "", category: "", unit: "", dosage: "",
    weight_per_unit: "", calories_per_unit: "", serving_style: "Regular", image_url: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, unitsResponse] = await Promise.all([
          axios.get(`${SERVER_URL}/products/categories`),
          axios.get(`${SERVER_URL}/products/units`),
        ]);
        setCategories(categoriesResponse.data);
        setUnits(unitsResponse.data);
      } catch (error) {
        console.error("Error fetching categories/units:", error);
      }
    };
    fetchData();
  }, []);

  // Pre-fill form with existing item data if it's an update
  useEffect(() => {
    if (item) {
      setProductData({
        sku: item.sku || "",
        name: item.name || "",
        category: item.category || "",
        unit: item.unit || "",
        dosage: item.dosage || "",
        weight_per_unit: item.weight_per_unit || "",
        calories_per_unit: item.calories_per_unit || "",
        serving_style: item.serving_style || "Regular",
        image_url: null, // Reset image for update
      });
      setImagePreview(item.image_url ? `${SERVER_URL}/${item.image_url}` : null);
    }
  }, [item]);

  // check all fields user enters are valid, and all required fields are not empty.
  // if not - show error message on screen
  const validateForm = () => {
    const { sku, name, category, unit, image_url } = productData;
    if (!sku || !name || !category || !unit) {
      setErrorMessage("Please fill in all required fields.");
      setOpenSnackbar(true);
      return false;
    }
    if (!image_url && !item) {
      setErrorMessage("Please upload an image.");
      setOpenSnackbar(true);
      return false;
    }
    return true;
  };

  // update the productData object if changed
  const handleChange = (event) => setProductData({ ...productData, [event.target.name]: event.target.value });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProductData({ ...productData, image_url: file });
      setImagePreview(URL.createObjectURL(file)); // Update the preview
    }
  };

  // submit the query, distinguish update and adding
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return; // Stop the submission if validation fails
    }

    // Prepare FormData for submission
    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
      if (key !== "image_url") {
        formData.append(key, value);
      }
    });

    // Append the image if it was changed
    if (productData.image_url) {
      formData.append("image_url", productData.image_url);
    }

    try {
      let response;
      if (item?.id) {
        // Update item
        response = await axios.put(`${SERVER_URL}/products/${item.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        // Add new item
        response = await axios.post(`${SERVER_URL}/products`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      }
      onItemAdded(response.data); // Update the item list
      onClose();
    } catch (error) {
      console.error("Error submitting item:", error);
      setErrorMessage("Failed to submit the item.");
      setOpenSnackbar(true);
    }
    setLoading(false);
  };

  return (
      <Box sx={{ p: 4, maxWidth: 500, textAlign: "center", boxShadow: 3, overflowY: 'auto',}}>
        <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>{item ? "Update Item" : "Add New Item"}</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <InputField label="SKU" name="sku" value={productData.sku} onChange={handleChange} required />
            <InputField label="Name" name="name" value={productData.name} onChange={handleChange} required />
            <SelectField label="Category" name="category" value={productData.category} onChange={handleChange} options={categories} />
            <SelectField label="Unit" name="unit" value={productData.unit} onChange={handleChange} options={units} required />
            <InputField label="Dosage" name="dosage" type="number" value={productData.dosage} onChange={handleChange} />
            <InputField label="Weight per Unit" name="weight_per_unit" type="number" value={productData.weight_per_unit} onChange={handleChange} />
            <InputField label="Calories per Unit" name="calories_per_unit" type="number" value={productData.calories_per_unit} onChange={handleChange} />
            <SelectField label="Serving Style" name="serving_style" value={productData.serving_style} onChange={handleChange} options={["Regular", "Ground"]} required />
            <Grid item xs={12} display="flex" justifyContent="center" alignItems="center">
              <ImageUpload imagePreview={imagePreview} handleImageChange={handleImageChange} required={!item} /> {/* image upload required only in adding state */}
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between">
              <Button onClick={onClose} sx={{ color: colors.secondary }}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>{loading ? "Uploading..." : item ? "Update Item" : "Add Item"}</Button>
            </Grid>
          </Grid>
        </form>
        {/* show error message if error */}
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
          <Alert onClose={() => setOpenSnackbar(false)} severity="error">{errorMessage}</Alert>
        </Snackbar>
      </Box>
  );
};

export default AddUpdateProductForm;
