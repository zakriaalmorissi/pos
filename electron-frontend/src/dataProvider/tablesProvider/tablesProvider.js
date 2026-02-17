import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { url } from "./../../network/constants";
import api, { AbortRequestError, NetworkError } from "../../network/API";
import { cleanTable } from "./tableModels";

// Async thunk to fetch system data
export const fetchTables = createAsyncThunk(
  "floors/fetchTables",
  async (__, {rejectWithValue}) => {
    const URL = `${url}api/floors/`;
    try {
      return await api.get({url: URL});
    } catch (error) {
       if (error instanceof NetworkError) {
        return rejectWithValue({message: error.message, hint: error?.hint});
       }
       if (error instanceof AbortRequestError) return;
       return rejectWithValue(error);
    }
  }
);






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
          const idx = floor.tables.findIndex(t => t.id === updatedTable?.id);
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
            state.floors = action.payload?.map(floor => ({
                ...floor, tables: 
                floor.tables.map((table) => cleanTable(table))
              })
            )
            state.loadingTables = false;
            state.loadingTablesError = null;
    
        })
        .addCase(fetchTables.rejected, (state, action)=> {
          state.loadingTablesError = `Ooops ... failed to load tables due to "${action.payload?.message}"`;
          state.loadingTables = false;
        
        })
    }
})

    
export const {updateTables} = tablesSlice.actions;
export default tablesSlice.reducer;