import React from "react";
import { Box, Card, CardMedia, CardContent, Typography } from "@mui/material";
import { SERVER_URL } from "../../../context/globals";

const ProductsMiniList = ({ products }) => {
  if (!products.length) return null;

  return (
    <Box sx={{ overflowY: "auto", maxHeight: 150, width: "100%", mt: 2 }}>
      {products.map((product, index) => (
        <Card key={index} sx={{ display: "flex", mb: 1 }}>
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
  );
};

export default ProductsMiniList;
