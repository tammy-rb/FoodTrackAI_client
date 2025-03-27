import React from "react";
import { Button } from "@mui/material";
import { colors } from "../../context/globals";

const AnimatedSquareButton = ({ title, onClick }) => {
  return (
    <Button
      variant="contained"
      fullWidth
      sx={{
        height: { xs: "120px", sm: "150px" }, // Adjust height based on screen size
        fontSize: { xs: "1rem", sm: "1.2rem" }, // Adjust font size on smaller screens
        backgroundColor: colors.background,
        color: colors.primary,
        fontWeight: "bold",
        borderRadius: "15px",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: "#f5f5f5",
          transform: "scale(1.05)",
        },
        "&:active": {
          transform: "scale(0.95)",
        },
      }}
      onClick={onClick}
    >
      {title}
    </Button>
  );
};

export default AnimatedSquareButton;
