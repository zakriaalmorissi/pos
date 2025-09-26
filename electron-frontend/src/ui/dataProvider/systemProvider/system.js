import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "../../../network/api";
import { url } from "../../../network/constants";

// Async thunk to fetch system data
export const fetchSystem = createAsyncThunk(
  "system/fetchSystem",
  async () => {
    return new Promise((resolve, reject) => {
      fetchData(`${url}accounts/setup/`, {
        getData: (res) => resolve(res),
        apiError: (err) => reject(err),
      });
    });
  }
);
const systemSlice = createSlice({
  name: "system",
  initialState: {
    systemData: null,
    loadingSystemData: true,
    loadingSystemDataError: null,
  },
  reducers: {
  

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystem.pending, (state) => {
        state.loadingSystemData = true;

      })
      .addCase(fetchSystem.fulfilled, (state, action) => {
        state.systemData = action.payload.data;
        state.loadingSystemData = false;
      })
      .addCase(fetchSystem.rejected, (state, action) => {
        state.loadingSystemDataError = `Awwaaa ... Failed to Load System Data Due to "${action.error?.message}"`;
      });
  },
});


export default systemSlice.reducer;
