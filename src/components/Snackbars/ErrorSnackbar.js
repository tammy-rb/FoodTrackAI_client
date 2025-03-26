import React from 'react'
import { Snackbar, Alert } from '@mui/material';

function ErrorSnackbar({openSnackbar, setOpenSnackbar, errorMessage, setErrorMessage}) {
  return (
    <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
        >
        <Alert 
            onClose={() => {
            setOpenSnackbar(false); 
            setErrorMessage("");
            }} 
            severity="error"
        >
            {errorMessage}
        </Alert>
    </Snackbar>
  )
}

export default ErrorSnackbar