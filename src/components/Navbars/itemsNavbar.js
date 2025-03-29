import React from "react";
import { Box } from "@mui/material";
import GoBackButton from "../buttons/GoBack"
import {colors} from "../../context/globals"

const Navbar = ({ children }) => {
  return (
    <Box 
      sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        p: 2, 
        backgroundColor: colors.grayBackground,
        borderBottom: "1px solid #ddd",
      }}
    >
      <GoBackButton />
      <Box sx={{ display: "flex", gap: 2 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Navbar;
