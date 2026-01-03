import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "./../../network/api";
import { url } from "./../../network/constants";

// Async thunk to fetch system data
export const fetchTables = createAsyncThunk(
  "floors/fetchTables",
  async () => {
    return new Promise((resolve, reject) => {
      fetchData(`${url}api/floors/`, {
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
    countedBills: table.counted_bills ,
    bills: table.bills || [],
    hasOrders: table.has_orders
  }
}




const tablesSlice = createSlice({
    name: "floors",
    initialState: {
        floors: [],
        tables: [],
        loadingTables: false,
        loadingTablesError: null,
    },
    reducers: {
      updateTables: (state, action) => {
        const updatedTable = action.payload;
        for (const floor of state.floors) {
          const idx = floor.tables.findIndex(t => t.id === updatedTable.id);
          if (idx !== -1) {
            floor.tables[idx] = {
              ...floor.tables[idx],
              ...updatedTable,
            };
            return;
          }
        }
    },

    }, 
    extraReducers: builder => {
        builder.addCase(fetchTables.pending, (state)=> {
            state.loadingTables = true;

        })
        .addCase(fetchTables.fulfilled, (state, action)=> {
            state.floors = action.payload.data?.map(floor => ({
                ...floor, tables: 
                floor.tables.map((table) => cleanTable(table))
              })
            )
        
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