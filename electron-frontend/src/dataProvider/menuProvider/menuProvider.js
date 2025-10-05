import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "./../../network/api";
import { url } from "./../../network/constants";

// Async thunk to fetch system data
export const fetchMenu = createAsyncThunk(
  "menu/fetchMenu",
  async () => {
    return new Promise((resolve, reject) => {
      fetchData(`${url}menu-view/`, {
        getData: (res) => resolve(res),
        apiError: (err) => reject(err),
      });
    });
  }
);


const cleanMenu = (values) => {
   return values.map((value)=> {
    return {
      id: value.id,
      name: value.name,
      parentItems: cleanParentItems(value.parent_items),

    };

  })
  
}

const cleanParentItems = (values) => {
   return values.map((value)=> {
      return {
        id: value.id,
        category: value.category,
        name: value.name,
        color: value.color,
        childItems: cleanChildItems(value.child_items, value.color)
      }
    });

}

const cleanChildItems = (values, color) => {
  return values.map( item => {
    return {
      ...item, color: color,
    }
  });

}


const menuSlice = createSlice({
    name: "menu",
    initialState: {
        menu: [],
        loadingMenu: false,
        loadingMenuError: null,
    },
    reducers: {
      resetMenu:(state) => {
        state.menu = [],
        state.loadingMenu = false,
        state.loadingMenuError = null
      }
    },
    extraReducers: builder => {
        builder.addCase(fetchMenu.pending, (state)=> {
            state.loadingMenu = true;
        })
        .addCase(fetchMenu.fulfilled, (state, action)=> {
            state.menu = cleanMenu(action.payload.data);
            state.loadingMenu = false;
    
        })
        .addCase(fetchMenu.rejected, (state, action)=> {
            state.loadingMenuError = `Oooops ... failed to load Menu due to ${action.error.message}`;

        })
    }
})


export const { resetMenu } = menuSlice.actions;
export default menuSlice.reducer;
