import React from "react";
import ProductCard from "../features/products/ProductCard";
import AddUpdateProductForm from '../features/products/AddUpdateProductForm';
import Items from "../components/ItemsList";
import { TextField, Button } from "@mui/material";

const ProductsList = () => {
  const object = { type: "Products", url_entry: "products" };

  return (
    <Items
      CardType={ProductCard}
      AddUpdateForm={AddUpdateProductForm}
      object={object}
      navbarContent={
        <>
          <TextField variant="outlined" size="small" placeholder="Search by name" />
          <TextField variant="outlined" size="small" placeholder="Search by SKU" />
          <Button variant="contained">Search</Button>
        </>
      }
    />
  );
};

export default ProductsList;
