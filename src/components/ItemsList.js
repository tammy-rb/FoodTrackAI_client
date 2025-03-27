import React, { useEffect, useState, useCallback } from "react";
import { Box, Button, Grid, Typography, CircularProgress } from "@mui/material";
import { colors, SERVER_URL } from "../context/globals";
import axios from "axios";
import { Link } from "react-router-dom";
import FormModal from './forms/FormModal'; // Import the FormModal component
import CustomButton from "./buttons/CustomButton";

const Items = ({ CardType, AddUpdateForm, object, destination = false }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const limit = 9;

  const fetchItems = useCallback(async () => {
    if (loading || page > totalPages) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${SERVER_URL}/${object.url_entry}?page=${page}&limit=${limit}`
      );
      const newItems = response.data.items;
      
      setItems((prev) => {
        const itemMap = new Map(prev.map((item) => [item.id, item]));
        newItems.forEach((item) => itemMap.set(item.id, item));
        return Array.from(itemMap.values());
      });

      setTotalPages(response.data.totalPages);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error(`Error fetching ${object.type}:`, error);
    } finally {
      setLoading(false);
    }
  }, [loading, page, totalPages]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchItems();
    }, { rootMargin: "100px" });

    const target = document.getElementById("load-more-trigger");
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, [fetchItems]);

  const handleRemove = async (id) => {
    try {
      await axios.delete(`${SERVER_URL}/${object.url_entry}/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(`Error deleting ${object.type}:`, error);
    }
  };

  const handleUpdateItem = (item) => {
    setSelectedItem(item);
    setOpenModal(true);
  };

  const handleItemAdded = (item) => {
    setOpenModal(false);
    setItems((prev) => {
      const itemIndex = prev.findIndex((it) => parseInt(it.id) === parseInt(item.id));
      if (itemIndex !== -1) {
        prev[itemIndex] = item;
        return [...prev];
      }
      return [item, ...prev];
    });
  };

  return (
    <Box sx={{ p: 4, backgroundColor: colors.background, minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ mb: 3, color: colors.primary, fontWeight: "bold" }}>
        {object.type}
      </Typography>
      <CustomButton
        onClick={() => {
          setSelectedItem(null);
          setOpenModal(true);
        }}
        text={`Add ${object.type}`}  // Pass a custom text prop for the button
      />
      {/* mapping card to any item. it will be a link card if destination is true */}
      <Grid container spacing={3}>
        {items.map((i) => (
          <Grid item xs={12} sm={6} md={4} key={`${i.id}-${Math.random()}`}>
            {destination ? (
              <Link to={`./${i.id}`} style={{ textDecoration: "none" }}>
                <CardType item={i} onRemove={handleRemove} onUpdate={handleUpdateItem} />
              </Link>
            ) : (
              <CardType item={i} onRemove={handleRemove} onUpdate={handleUpdateItem} />
            )}
          </Grid>
        ))}
      </Grid>
      <div id="load-more-trigger" style={{ height: "50px", width: "100%" }}></div>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Use FormModal and pass AddUpdateForm as the InsideForm */}
      <FormModal
        InsideForm={AddUpdateForm}
        item={selectedItem}
        onItemSubmit={handleItemAdded}
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
    </Box>
  );
};

export default Items
