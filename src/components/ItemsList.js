import React, { useEffect, useState, useCallback } from "react";
import { Box, Button, Grid, Typography, CircularProgress, Modal } from "@mui/material";
import { colors, SERVER_URL } from "../context/globals";
import axios from "axios";

const Items = ({ CardType, AddUpdateForm, object }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const limit = 9;

  // Fetch items with pagination
  const fetchItems = useCallback(async () => {
    if (loading || page > totalPages) return;
    setLoading(true);
    try {
      const response = await axios.get(`${SERVER_URL}/${object.url_entry}?page=${page}&limit=${limit}`);
      setItems((prev) => [...prev, ...response.data.items]); 
      setPage((prev) => prev + 1);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(`Error fetching ${object.type}:`, error);
    }
    setLoading(false);
  }, [loading, page, totalPages]);

  // Infinite scrolling setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchItems();
        }
      },
      { rootMargin: "100px" }
    );

    const target = document.getElementById("load-more-trigger");
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, [fetchItems]);

  // Remove an item
  const handleRemove = async (id) => {
    try {
      await axios.delete(`${SERVER_URL}/${object.url_entry}/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(`Error deleting ${object.type}:`, error);
    }
  };

  // Open modal to add or update an item
  const handleUpdateItem = (item) => {
    setSelectedItem(item);
    setOpenModal(true);
  };

  const handleItemAdded = (item) => {
    setOpenModal(false);
    if (selectedItem) {
      setItems((prev) =>
        prev.map((it) => (parseInt(it.id) === parseInt(item.id) ? item : it))
      );
    } 
  };

  return (
    <Box sx={{ p: 4, backgroundColor: colors.background, minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ mb: 3, color: colors.primary, fontWeight: "bold" }}>
        {object.type}
      </Typography>
      <Button
        variant="contained"
        sx={{ mb: 3, backgroundColor: colors.primary, color: "white", "&:hover": { backgroundColor: colors.secondary } }}
        onClick={() => {
          setSelectedItem(null);
          setOpenModal(true);
        }}
      >
        Add {object.type}
      </Button>
      <Grid container spacing={3}>
        {items.map((i) => (
          <Grid item xs={12} sm={6} md={4} key={i.id}>
            <CardType item={i} onRemove={handleRemove} onUpdate={handleUpdateItem} />
          </Grid>
        ))}
      </Grid>
      <div id="load-more-trigger" style={{ height: "50px", width: "100%" }}></div>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      )}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '80%', md: '60%', lg: '50%' },
            bgcolor: 'background.paper',
            boxShadow: 3,  // Soft shadow for better depth
            borderRadius: 3,  // Rounded corners for the modal
            maxHeight: '90vh',
            overflowY: 'auto',
            p: 4,  // Increased padding for content
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <AddUpdateForm
            item={selectedItem}
            onClose={() => setOpenModal(false)}
            onItemAdded={handleItemAdded}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default Items;
