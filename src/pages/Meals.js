import React from "react";
import MealCard from "../features/meals/MealCard";
import AddMealForm from '../features/meals/addMealForms/AddMealForm'
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
      destination = {true} // card will be links
    />
  );
};

export default MealsList;

