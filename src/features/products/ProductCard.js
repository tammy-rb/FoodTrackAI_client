import React from "react";
import { Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import { renderProductAttribute, CardMediaComponent } from "../../components/cards/utils";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ProductCard = ({ item, onRemove, onUpdate, weight_before, weight_after }) => {
  return (
    <Card sx={{ backgroundColor: "white", boxShadow: 3, borderRadius: 2 }}>
      <CardMediaComponent alt={item.name} img_url={item.image_url} />

      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {item.name}
        </Typography>

        {/* Render product attributes using utility function */}
        {renderProductAttribute("SKU", item.sku)}
        {renderProductAttribute("Category", item.category)}
        {renderProductAttribute("Dosage", item.dosage && `${item.dosage} mg`)}
        {renderProductAttribute(
          "Unit",
          `${item.unit} ${item.weight_per_unit ? `(${item.weight_per_unit}g)` : ''}${item.calories_per_unit ? `, ${item.calories_per_unit} kcal` : ''}`
        )}
        {renderProductAttribute("Serving Style", item.serving_style)}

        {/* Conditionally Render Weight Before & After */}
        {weight_before !== undefined && renderProductAttribute("Weight Before", `${weight_before}g`)}
        {weight_after !== undefined && renderProductAttribute("Weight After", `${weight_after}g`)}

        {/* Icon Buttons for Update and Remove */}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
          {/* Optional Update Icon */}
          {onUpdate && (
            <IconButton onClick={() => onUpdate(item)} color="primary">
              <EditIcon />
            </IconButton>
          )}
          {/* Optional Remove Icon */}
          {onRemove && (
            <IconButton onClick={() => onRemove(item.id)} color="secondary">
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
