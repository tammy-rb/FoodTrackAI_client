import React from 'react';
import { Modal, Box } from '@mui/material';

// we use it for adding or updating form. so if item is not null the mode is updating..
function FormModal({ InsideForm, item, onItemSubmit, openModal, setOpenModal }) {
  return (
    <Modal open={openModal} onClose={() => setOpenModal(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "80%", md: "60%", lg: "50%" },
          bgcolor: "background.paper",
          boxShadow: 3,
          borderRadius: 3,
          maxHeight: "90vh",
          overflowY: "auto",
          p: 4,
        }}
      >
        {/* InsideForm is a dynamic form passed in as a prop, here it's AddUpdateForm */}
        <InsideForm item={item} onClose={() => setOpenModal(false)} onItemSubmit={onItemSubmit} />
      </Box>
    </Modal>
  );
}

export default FormModal;
