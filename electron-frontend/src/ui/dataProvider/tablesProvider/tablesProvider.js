import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "../../../network/api";
import { url } from "../../../network/constants";

// Async thunk to fetch system data
export const fetchTables = createAsyncThunk(
  "tables/fetchTables",
  async () => {
    return new Promise((resolve, reject) => {
      fetchData(`${url}api/all-tables/`, {
        getData: (res) => resolve(res),
        apiError: (err) => reject(err),
      });
    });
  }
);


export const cleanTable = (table) => {
  return {
    id: table.id,
    name: table.name,
    floorId: table.floor,
    status: table.status,
    countedBills: table.counted_bills,
    billIds: table.bill_ids || [],
    hasOrders: table.has_orders
  }
}


const tablesSlice = createSlice({
    name: "tables",
    initialState: {
        tables: [],
        loadingTables: false,
        loadingTablesError: null,
    },
    reducers: {
      updateTables: (state, action) => {
        const updatedTable = action.payload;
        const idx = state.tables.findIndex((t) => t.id === updatedTable.id);
        if (idx !== -1) {
          state.tables[idx] = { ...state.tables[idx], ...updatedTable };
        } else {
          state.tables.push(updatedTable);
      }
    },

    }, 
    extraReducers: builder => {
        builder.addCase(fetchTables.pending, (state)=> {
            state.loadingTables = true;

        })
        .addCase(fetchTables.fulfilled, (state, action)=> {
            state.tables = action.payload.data.map((table)=> cleanTable(table));
            state.loadingTables = false;
            state.loadingTablesError = null;
    
        })
        .addCase(fetchTables.rejected, (state, action)=> {
          state.loadingTablesError = `Ooops ... failed to load tables due to "${action.error?.message}"`;
        
        })
    }
})


export const {updateTables} = tablesSlice.actions;
export default tablesSlice.reducer;