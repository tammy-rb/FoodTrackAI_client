import React from "react";
import MealCard from "../features/meals/MealCard";
import AddMealForm from '../features/meals/addUpdateMealForms/AddUpdateMealForm';
import Items from "../components/ItemsList";

const MealsList = () => {
  const object = { type: "Meals", url_entry: "meals" };

  return (
    <Items
      CardType={MealCard}
      AddUpdateForm={AddMealForm}
      object={object}
      destination={true} 
      navbarContent={null} // Meals only have the GoBackButton
    />
  );
};

export default MealsList;
