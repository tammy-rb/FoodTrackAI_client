import React, { useEffect, useState, useCallback } from "react";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import { colors, SERVER_URL } from "../context/globals";
import axios from "axios";
import { Link } from "react-router-dom";
import FormModal from './forms/FormModal';
import CustomButton from "./buttons/CustomButton";
import Navbar from "./Navbars/itemsNavbar"

const Items = ({ 
  CardType, 
  AddUpdateForm, 
  object, 
  destination = false,
  navbarContent = null,// Custom components for the navbar
  queryParameter = null
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const limit = 9;

  const fetchItems = useCallback(async () => {
    if (loading) return; // Prevent duplicate requests
    
    setLoading(true);
    try {
      const url = queryParameter 
        ? `${SERVER_URL}/${object.url_entry}?${queryParameter}`  // No pagination if searching
        : `${SERVER_URL}/${object.url_entry}?page=${page}&limit=${limit}`;
      console.log(url)
      const response = await axios.get(url);
      const newItems = response.data.items;
  
      setItems(queryParameter ? newItems : (prev) => {
        const itemMap = new Map(prev.map((item) => [item.id, item]));
        newItems.forEach((item) => itemMap.set(item.id, item));
        return Array.from(itemMap.values());
      });
  
      if (!queryParameter) {
        setTotalPages(response.data.totalPages);
        setPage((prevPage) => prevPage + 1);
      }
      else{
        setTotalPages(1);
        setPage(1);
      }
    } catch (error) {
      console.error(`Error fetching ${object.type}:`, error);
    } finally {
      setLoading(false);
    }
  }, [loading, page, totalPages, object.url_entry, queryParameter]);
  
  useEffect(() => {
    fetchItems(); // Fetch items whenever queryParameter or page changes
  }, [queryParameter]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && page <= totalPages) fetchItems();
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
      {/* Navbar Section */}
      <Navbar>{navbarContent}</Navbar>

      {/* Header Section */}
      <Typography variant="h4" sx={{ color: colors.primary, fontWeight: "bold", mt: 2, mb: 3, textAlign: "center" }}>
        {object.type}
      </Typography>

      {/* Add Button */}
      <CustomButton
        onClick={() => {
          setSelectedItem(null);
          setOpenModal(true);
        }}
        text={`Add ${object.type}`}
      />

      {/* Items Grid */}
      <Grid container spacing={3}>
        {items.map((i) => (
          <Grid item xs={12} sm={6} md={4} key={i.id}>
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

      {/* Infinite Scroll Trigger */}
      <div id="load-more-trigger" style={{ height: "50px", width: "100%" }}></div>
      
      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Add/Update Modal */}
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

export default Items;
