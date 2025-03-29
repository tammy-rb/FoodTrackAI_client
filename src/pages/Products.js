import React, { useState } from "react";
import ProductCard from "../features/products/ProductCard";
import AddUpdateProductForm from '../features/products/AddUpdateProductForm';
import Items from "../components/ItemsList";
import { TextField, Button, Box } from "@mui/material";

const ProductsList = () => {
  const [sku, setSku] = useState(""); // Track SKU input
  const [queryParameter, setQueryParameter] = useState(null); // Track query state

  const handleSearch = () => {
    setQueryParameter(sku ? `sku=${sku}` : null); // Set SKU filter or reset
  };

  const handleClearSearch = () => {
    setSku(""); // Reset SKU input
    setQueryParameter(null); // Reset query to show all products
  };

  const object = { type: "Products", url_entry: "products" };

  return (
    <Items
      CardType={ProductCard}
      AddUpdateForm={AddUpdateProductForm}
      object={object}
      queryParameter={queryParameter} // Pass query parameter
      navbarContent={
        <Box display="flex" gap={1}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
          {queryParameter && ( // Show "Clear" button only when searching
            <Button variant="outlined" onClick={handleClearSearch}>
              Clear
            </Button>
          )}
        </Box>
      }
    />
  );
};

export default ProductsList;
