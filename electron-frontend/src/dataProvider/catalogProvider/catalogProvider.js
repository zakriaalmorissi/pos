import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { url } from "../../network/constants";
import api, { NetworkError } from "../../network/API";
// Async thunk to fetch system data
export const fetchCatalog = createAsyncThunk(
  "catalog/fetchCatalog",
  async (__,{rejectWithValue}) => {
    const URL = `${url}products/catalog-view/`;
    try {
      const response = await api.get({url: URL});
      console.log("getting Catalog")
      console.log(response)
      return response;
      
    } catch (error) {
      if (error instanceof NetworkError) {
        return rejectWithValue({message: error.message, hint: error?.hint});
      }
      return rejectWithValue(error);
    }
  }
);


const cleanCatalog = (values) => {
   return values.map((value)=> {
    return {
      id: value.id,
      name: value.name,
      business: value.business,
      parentItems: cleanParentItems(value.products),

    };

  })
  
}

const cleanParentItems = (values) => {
   return values.map((value)=> {
      return {
        id: value.id,
        category: value.category,
        name: value.name,
        iActive: value.is_active,
        childItems: cleanChildItems(value.variants)
      }
    });

}

const cleanChildItems = (values) => {
  
  return values.map( item => {
    return {
      id: item.id,
      name: item.name,
      unitPrice: item.price,
      product: item.product,
      note: item.modifier_groups


    }
  });

}


const catalogSlice = createSlice({
    name: "catalog",
    initialState: {
        catalog: [],
        loadingCatalog: false,
        loadingCatalogError: null,
    },
    reducers: {
      resetCatalog:(state) => {
        state.catalog = [],
        state.loadingCatalog = false,
        state.loadingCatalogError = null
      }
    },
    extraReducers: builder => {
        builder.addCase(fetchCatalog.pending, (state)=> {
            state.loadingCatalog = true;
        })
        .addCase(fetchCatalog.fulfilled, (state, action)=> {
            state.catalog = cleanCatalog(action.payload);
            state.loadingCatalog = false;
    
        })
        .addCase(fetchCatalog.rejected, (state, action)=> {
            state.loadingCatalogError = `Oooops ... failed to load Catalog due to ${action.payload?.hint}`;

        })
    }
})


export const { resetCatalog } = catalogSlice.actions;
export default catalogSlice.reducer;
