'use client'
import * as React from 'react';
import { Box, Typography, Button, TextField, Dialog, Container } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridToolbarContainer } from '@mui/x-data-grid';
// import { DataGridPro, useGridApiRef } from '@mui/x-data-grid-pro';
import { randomId } from '@mui/x-data-grid-generator';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { firestore } from '@/firebase';
import { collection, getDocs, query, getDoc, updateDoc, setDoc, doc, deleteDoc } from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import { DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export default function Home() {
  const [rows, setRows] = useState([]);
  const [popupOpen, setOpen] = React.useState(false);
  const hasInitialized = useRef(false);

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#3094bc',
      },
      secondary: {
        main: '#bc5830',
      },
    },
  });

  const columns = [
    { field: 'item', headerName: 'Pantry Item', width: 200, editable: true },
    { field: 'quantity', headerName: '# of Item', width: 140, type: 'number', editable: true, alignItems: "center", justifyContent: "center"},
    {
      field: 'actions',
      headerName: 'Delete',
      width: 75,
      cellClassName: 'actions',
      type: 'actions',
      getActions: ({ id }) => [
        <GridActionsCellItem
          key={id}
          icon={<DeleteIcon />}
          label="Delete"
          color="inherit"
          onClick={handleDeleteClick(id)}
        />,
      ],
    }
  ];

  const handleDeleteClick = (id) => async () => {
    const currRow = rows.find((row) => row.id === id);
    await updateItem(currRow.item, 0, false);
    setRows(rows.filter((row) => row.id !== id));
  };

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const inventoryList = docs.docs.map(doc => ({ name: doc.id, ...doc.data() }));
    setRows(inventoryList.map(item => ({ id: randomId(), item: item.name, quantity: item.quantity })));
  };

  const updateItem = async (item, count, addBool) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    count = parseInt(count);
    if (addBool) {
      const objIndex = rows.findIndex(row => row.item === item);
      if (objIndex !== -1) {
        rows[objIndex].quantity += count;
        setRows([...rows]);
        count += docSnap.data().quantity;
      }
    }
    if (docSnap.exists()) {
      if (count <= 0) {
        setRows(rows.filter((row) => row.item !== item));
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, { quantity: count });
      }
    } else {
      await setDoc(docRef, { quantity: count });
    }
    await updateInventory();
  };

  const processRowUpdate = async (newRow, oldRow) => {
    if (newRow.item !== oldRow.item) {
      const docRef = doc(collection(firestore, 'pantry'), oldRow.item);
      await deleteDoc(docRef);
    }
    await updateItem(newRow.item, newRow.quantity, false);
    return newRow;
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      updateInventory();
      hasInitialized.current = true;
    }
  }, []);

  function EditToolbar(props) {
    const { setRows } = props;
    return (
      <GridToolbarContainer>
        <Button color="primary" startIcon={<AddIcon />} onClick={handleClickOpen}>
          Add Item
        </Button>
      </GridToolbarContainer>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          height: 400,
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
          '& .hover-effect': {
            transition: 'all 0.3s ease-in-out',
          },
          '& .hover-effect:hover': {
            transform: 'scale(1.3)',
          },
        }}
      >
        <Typography
          variant="h1"
          align='center'
          sx={{
            p: 3,
            fontSize: '10rem',
            background: 'linear-gradient(45deg, #66ff66 30%, #6699ff 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',

          }}
          className="hover-effect"
        >
          Pantry Tracker
        </Typography>
        <Typography
          variant="h4"
          align='center'
          
          sx={{
            p: 1,
            fontSize: '2rem',
            background: 'linear-gradient(45deg, #6699ff 30%, #66ff66 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            border: "1px solid",
            borderColor: '#f0f0f0', 
          }}
          className="hover-effect typing"
        >
          Keep track of your pantry inventory.
        </Typography>
      </Box>
      <Dialog
        open={popupOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const name = formJson.name;
            const quantity = parseInt(formJson.quantity);
            updateItem(name, quantity, true);
            handleClose();
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '1.4rem',
          '& .hover-effect': {
            transition: 'all 0.3s ease-in-out',
          },
          '& .hover-effect:hover': {
            transform: 'scale(1.6)',
          },
          }} className="hover-effect"
        >
          Add Item
        </DialogTitle>

        <DialogContent>
          <DialogContentText>Please add the item name as well as the quanitity</DialogContentText>
          <TextField required name="name" label="Pantry Item" fullWidth margin="dense" />
          <TextField required name="quantity" type="Quantity" label="Quantity" fullWidth margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button type="submit">Add to List</Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <Container sx={{ p: 2 }}>
        <DataGrid
          sx={{
            m: 5,
            border: "10px solid",
            borderColor: '#f0f0f0', 
            borderRadius: 10
          }}
          rows={rows}
          columns={columns}
          editMode="row"
          processRowUpdate={processRowUpdate}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          slots={{
            toolbar: EditToolbar,
          }}
          slotProps={{
            toolbar: { setRows },
          }}
          pageSizeOptions={[5, 10, 15, 20]}
        />
      </Container>
    </ThemeProvider>
  );
}
