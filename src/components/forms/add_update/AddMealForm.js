import React, { useState, useEffect } from "react";
import { TextField, Box, Button, Typography, Snackbar, Alert, Grid, Card, CardMedia, CardContent, Select, MenuItem } from "@mui/material";
import axios from "axios";
import { colors, SERVER_URL } from "../../../context/globals";
import InputField from "../../input_fields/InputField";
import SelectField from "../../input_fields/SelectField";
import ImageUpload from "../../input_fields/ImageUpload";

const AddMealForm = ({ onClose, onItemAdded, item }) => {
  const [mealData, setMealData] = useState({
    description: "",
    picture_before: null,
    picture_after: null,
    weight_before: "",
    weight_after: "",
    products: [],
  });

  const [imagePreviewBefore, setImagePreviewBefore] = useState(null);
  const [imagePreviewAfter, setImagePreviewAfter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // get all products to make  list to chhose from
  useEffect(() => {
    const fetchProductOptions = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/products`);
        setProductOptions(response.data.items);
      } catch (error) {
        console.error("Error fetching product options:", error);
      }
    };
    fetchProductOptions();
  }, []);

  const validateForm = () => {
    const { weight_before, weight_after, picture_after, picture_before } = mealData;
    let err = false
    if (!weight_before || !weight_after) {
      setErrorMessage("Please fill in all required fields.");
      err = true
    } // if adding meal - must upload an image
    if (!item && (!picture_after || !picture_before)){
      setErrorMessage("Please upload images.");
      err = true
    }
    if (weight_after < weight_before){
      setErrorMessage("weights are not valid");
      err = true
    }
    if (err){
      setOpenSnackbar(true);
      return false;
    }
    return true;
  };

  //handle change in meal data
  const handleChange = (event) => setMealData({ ...mealData, [event.target.name]: event.target.value });

  // update the new image in the data form, change the preview to this image.
  // there are 2 types of image- before and after
  const handleImageChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      if (type === "before") {
        setMealData({ ...mealData, picture_before: file });
        setImagePreviewBefore(URL.createObjectURL(file));
      } else {
        setMealData({ ...mealData, picture_after: file });
        setImagePreviewAfter(URL.createObjectURL(file));
      }
    }
  };

  // add sekected products to the list of products of the meal according to its sku
  const handleProductChange = (event) => {
    const selectedSkus = event.target.value;
    const selected = productOptions.filter(product => selectedSkus.includes(product.sku));
    setSelectedProducts(selected);
    setMealData({ ...mealData, products: selectedSkus });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const formData = new FormData();
    Object.entries(mealData).forEach(([key, value]) => {
      if (key !== "picture_before" && key !== "picture_after") {
        formData.append(key, value);
      }
    });

    if (mealData.picture_before) formData.append("meal_pictures", mealData.picture_before);
    if (mealData.picture_after) formData.append("meal_pictures", mealData.picture_after);

    try {
      const response = await axios.post(`${SERVER_URL}/meals`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      // here add the loop code to post objects like: {   meal_id: 1, product_id: 1, weight_before: 500, weight_after: 450 },  to serverurl/meals-products
      // do it for all products the user chose. 
      onItemAdded(response.data);
      onClose();
    } catch (error) {
      console.error("Error submitting meal:", error);
      setErrorMessage("Failed to submit the meal.");
      setOpenSnackbar(true);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ 
      textAlign: "center",
      overflowY: 'auto',
      width: '100%',
      maxWidth: 600, 
      margin: '0 auto', // Center the box
      p: { xs: 2, sm: 4 }, 
      boxSizing: 'border-box', 
      overflowX: 'hidden',
    }}>
        <Typography variant="h6" sx={{ mb: 3, mt:2, textAlign: 'center' }}>Add New Meal</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ justifyContent: 'center' }}> {/* Reduced spacing */}
            {/* Description Field */}
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


            {/* Weight Fields (Before and After) */}
              <Grid item xs={12} sm={12}>
                <InputField  label="Weight Before (g)" name="weight_before" type="number" value={mealData.weight_before} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={12}>
                <InputField label="Weight After (g)" name="weight_after" type="number" value={mealData.weight_after} onChange={handleChange} required/>
              </Grid>

            {/* Product Select Field */}
            <Grid item xs={12}>
              <Select
                multiple
                value={mealData.products}
                onChange={handleProductChange}
                displayEmpty
                sx={{
                  width: '100%',
                  '& .MuiSelect-select': {
                    whiteSpace: 'normal',  // Allow wrapping inside the input field
                    overflow: 'hidden',   // Hide overflowed content
                    textOverflow: 'ellipsis', // Show ellipsis if text overflows
                  }
                }}
              >
                {productOptions.map((p) => (
                  <MenuItem key={p.sku} value={p.sku}>
                    {`${p.name} (${p.sku})`}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* Selected Products Display */}
            <Box sx={{ overflowY: 'auto', maxHeight: 150, width: '100%', mt: 2 }}>
              {selectedProducts.map((product, index) => (
                <Card key={index} sx={{ display: 'flex', mb: 1 }}>
                  <CardMedia component="img" sx={{ width: 100 }} image={`${SERVER_URL}/${product.image_url}`} alt={product.name} />
                  <CardContent>
                    <Typography>{product.name} (SKU: {product.sku})</Typography>
                    <Typography>Serving Style: {product.serving_style}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Image Uploads */}
            <Grid item xs={12} sm={6} display="flex" justifyContent="center" gap={2}>
              <ImageUpload imagePreview={imagePreviewBefore} handleImageChange={(e) => handleImageChange(e, 'before')} label="Before Image" fullWidth />
              <ImageUpload imagePreview={imagePreviewAfter} handleImageChange={(e) => handleImageChange(e, 'after')} label="After Image" fullWidth />
            </Grid>

            {/* Submit / Cancel Buttons */}
            <Grid item xs={12} display="flex" justifyContent="center" gap={2}>
              <Button onClick={onClose} sx={{ color: colors.secondary }}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ ml: 2 }}>
                {loading ? "Uploading..." : "Add Meal"}
              </Button>
            </Grid>
          </Grid>
        </form>
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
          <Alert onClose={() => setOpenSnackbar(false)} severity="error">{errorMessage}</Alert>
        </Snackbar>
      </Box>
  );
};

export default AddMealForm;


/*import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Snackbar, Alert, Grid } from "@mui/material";
import axios from "axios";
import { colors, SERVER_URL } from "../../../context/globals";
import InputField from "../../input_fields/InputField";
import SelectField from "../../input_fields/SelectField";
import ImageUpload from "../../input_fields/ImageUpload";

// Form component for adding meals
const AddMealForm = ({ onClose, onItemAdded }) => {
  const [mealData, setMealData] = useState({
    description: "",
    picture_before: null,
    picture_after: null,
    weight_before: "",
    weight_after: "",
    products: [], // Assuming the products are inputted as strings (could be a multi-select field if necessary)
  });
  const [imagePreviewBefore, setImagePreviewBefore] = useState(null);
  const [imagePreviewAfter, setImagePreviewAfter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [productOptions, setProductOptions] = useState([]); // Products to choose from

  useEffect(() => {
    const fetchProductOptions = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/products`);
        // Assuming the response data contains an array of products in `items`
        const productItems = response.data.items;
  
        // Map through the product items to extract the names (or any other properties you want)
        const productNames = productItems.map(p => p.name);
  
        // Set the product names to state (if that's what you're trying to do)
        setProductOptions(productNames);
      } catch (error) {
        console.error("Error fetching product options:", error);
      }
    };
  
    fetchProductOptions();
  }, []);
  
  // Check all fields user enters are valid
  const validateForm = () => {
    const { description, weight_before, weight_after } = mealData;
    if (!weight_before || !weight_after) {
      setErrorMessage("Please fill in all required fields.");
      setOpenSnackbar(true);
      return false;
    }
    return true;
  };

  // Update mealData when any field changes
  const handleChange = (event) => setMealData({ ...mealData, [event.target.name]: event.target.value });

  // Handle image changes (Before and After images)
  const handleImageChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      if (type === "before") {
        setMealData({ ...mealData, picture_before: file });
        setImagePreviewBefore(URL.createObjectURL(file));
      } else {
        setMealData({ ...mealData, picture_after: file });
        setImagePreviewAfter(URL.createObjectURL(file));
      }
    }
  };

  // Handle product selection
  const handleProductChange = (event) => {
    const selectedProducts = event.target.value;
    setMealData({ ...mealData, products: selectedProducts });
  };

  // Submit the form (Add new meal)
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const formData = new FormData();
    Object.entries(mealData).forEach(([key, value]) => {
      if (key !== "picture_before" && key !== "picture_after") {
        formData.append(key, value);
      }
    });

    // Append images if they are changed
    if (mealData.picture_before) {
      formData.append("meal_pictures", mealData.picture_before);
    }
    if (mealData.picture_after) {
      formData.append("meal_pictures", mealData.picture_after);
    }
    formData.delete('products')

    try {
      // Add new meal
      const response = await axios.post(`${SERVER_URL}/meals`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      onItemAdded(response.data); // Update the meal list
      onClose();
    } catch (error) {
      console.error("Error submitting meal:", error);
      setErrorMessage("Failed to submit the meal.");
      setOpenSnackbar(true);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ p: 4, maxWidth: 500, bgcolor: "white", borderRadius: 2, textAlign: "center", boxShadow: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Add New Meal</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <InputField label="Description" name="description" value={mealData.description} onChange={handleChange}  />
            <InputField label="Weight Before (g)" name="weight_before" type="number" value={mealData.weight_before} onChange={handleChange} required = "true"/>
            <InputField label="Weight After (g)" name="weight_after" type="number" value={mealData.weight_after} onChange={handleChange} required = "true" />
            <SelectField
              label="Products"
              name="products"
              value={mealData.products}
              onChange={handleProductChange}
              options={productOptions}
              multiple
              required
            />
            <Grid item xs={12} display="flex" justifyContent="center" alignItems="center">
              <ImageUpload imagePreview={imagePreviewBefore} handleImageChange={(event) => handleImageChange(event, "before")} required = "true" label="Before Image" />
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="center" alignItems="center">
              <ImageUpload imagePreview={imagePreviewAfter} handleImageChange={(event) => handleImageChange(event, "after")} required = "true" label="After Image" />
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between">
              <Button onClick={onClose} sx={{ color: colors.secondary }}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>{loading ? "Uploading..." : "Add Meal"}</Button>
            </Grid>
          </Grid>
        </form>
        {/* show error message if error *//*}
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
          <Alert onClose={() => setOpenSnackbar(false)} severity="error">{errorMessage}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AddMealForm;

*/