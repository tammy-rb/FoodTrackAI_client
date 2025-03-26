import React from "react";
import MealCard from "../components/cards/MealCard";
import AddMealForm from "../components/forms/add_update/meals/AddMealForm"; // Import the Add/Update form for products
import { SERVER_URL } from "../context/globals"; // Your server URL context
import Items from "../components/ItemsList"

const MealsList = () => {
  // Define the necessary parameters for the generic Items component
  const object = {
    type: "Meals", 
    url_entry: "meals", // The API endpoint for meals
  };

  return (
    <Items
      CardType={MealCard}
      AddUpdateForm={AddMealForm} // Pass in the Add/Update Product Form as AddUpdateForm
      object={object} // Pass the object with URL entry and type as props
    />
  );
};

export default MealsList;

