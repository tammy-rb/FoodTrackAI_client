import React, { useState } from "react";
import { Box, IconButton, Collapse } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import GoBackButton from "../buttons/GoBack";
import { colors } from "../../context/globals";
import { useMediaQuery } from "@mui/material";

// responsive navbar for also mobiles 
const Navbar = ({ children }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [menuOpen, setMenuOpen] = useState(false);

  // open the menu of a mobile
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: isMobile ? 1 : 2,
          backgroundColor: colors.grayBackground,
          borderBottom: "1px solid #ddd",
        }}
      >
        <GoBackButton />
        {isMobile ? (
          <IconButton onClick={toggleMenu}>
            <MenuIcon />
          </IconButton>
        ) : (
          <Box sx={{ display: "flex", gap: 2 }}>{children}</Box>
        )}
      </Box>

      {/* Mobile menu that collapses/expands */}
      {isMobile && (
        <Collapse in={menuOpen}>
          <Box 
            sx={{ 
              backgroundColor: colors.grayBackground,
              p: 1.5,
              borderBottom: "1px solid #ddd",
              display: "flex",
              flexDirection: "column",
              gap: 1.5
            }}
          >
            {children}  {/** content passed to be shown in the navbar */}
          </Box>
        </Collapse>
      )}
    </>
  );
};

export default Navbar;
