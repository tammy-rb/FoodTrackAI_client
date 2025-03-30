import React, { useState } from "react";
import ProductCard from "../features/products/ProductCard";
import AddUpdateProductForm from "../features/products/AddUpdateProductForm";
import Items from "../components/ItemsList";
import { TextField, Button, Box } from "@mui/material";
import { useMediaQuery } from "@mui/material";

const ProductsList = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [sku, setSku] = useState(""); // Track SKU input
  const [name, setName] = useState("");
  const [queryParameter, setQueryParameter] = useState(null); // Track query state

  const handleSearch = () => {
    const params = [];
    if (sku) params.push(`sku=${sku}`);
    if (name) params.push(`name=${name}`);

    setQueryParameter(params.length ? params.join("&") : null);
  };

  const handleClearSearch = () => {
    setSku(""); // Reset SKU input
    setName(""); // Reset name input
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
        <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={1}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
