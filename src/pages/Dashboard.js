import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid } from "@mui/material";
import AnimatedSquareButton from "../components/buttons/AnimatedSquareButton";
import { colors } from "../context/globals"; // Import colors

const Dashboard = () => {
  const navigate = useNavigate();

  const features = [
    { title: "Products", path: "/products" },
    { title: "Meals", path: "/meals" },
    { title: "Statistics", path: "/statistics" },
    { title: "Upload Image", path: "/upload" },
  ];

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: colors.primary, // Use color from globals
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Grid
        container
        spacing={3}
        sx={{
          width: "80%", // Make it responsive by reducing width
          maxWidth: "1200px", // Limit max width for larger screens
        }}
      >
        {features.map((feature, index) => (
          <Grid
            item
            xs={12}  // On mobile, each item takes full width
            sm={6}   // On medium screens, 2 items per row
            md={3}   // On large screens, 4 items per row
            key={index}
          >
            <AnimatedSquareButton
              title={feature.title}
              onClick={() => navigate("/features" + feature.path)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
