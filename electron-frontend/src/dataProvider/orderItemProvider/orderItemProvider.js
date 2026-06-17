import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import { cleanOrder } from "../orderProvider/orderServices";
import { overrideOrder } from "../orderProvider/orderSilce";
import api, { AbortRequestError, NetworkError } from "../../network/API";
import { allOrderItemsUrl, createOrderItemUrl, orderItemUrl } from "./orderItemService";
import { updateRelatedOrder, updateRelatedOrderWhenDeletingItems } from "./utility";
// ✅ Update orderItem (price, quantity, condiments, etc.)

export const updateOrderItem = createAsyncThunk(
  "orderItem/updateOrderItem",
  async ({ orderItemId, data}, {rejectWithValue, dispatch}) => {
    const URL = orderItemUrl(orderItemId);
    try {
      const response = await api.put({
        url: URL,
        data: data
      })
      // Related data like order must be updated accordingly
      return updateRelatedOrder(response, dispatch);
    } catch (error) {
      if (error instanceof NetworkError) {
        return rejectWithValue({message: error.message, hint: error.hint});
      } else if (error instanceof AbortRequestError) {
        return rejectWithValue({aborted: true});
      };
      return rejectWithValue(error);
    }
  }
);




export const createOrderItem = createAsyncThunk(
    "orderItem/createOrderItem",
   async ({orderId, data}, {rejectWithValue, dispatch}) => {
      const URL = createOrderItemUrl(orderId);
      try {
        const response = await api.post({
          url: URL,
          data: data
        })
      return updateRelatedOrder(response, dispatch);
       } catch (error) {
      if (error instanceof NetworkError) {
            return rejectWithValue({message: error.message, hint: error.hint});
        }
        if (error instanceof AbortRequestError) {
          return rejectWithValue({aborted: true});
        }
          return rejectWithValue(error);
    }
   }
)



export const fetchOrderItems = createAsyncThunk(
    "orderItem/fetchOrderItems",
    async (orderId, {rejectWithValue, signal}) => {
    const URL = allOrderItemsUrl(orderId);
    try {
      const response = await api.get({
        url: URL,
        signal: signal
      })
      return response;
    } catch (error) {
      if (error instanceof NetworkError) {
        return rejectWithValue({message: error.message, hint: error.hint});
      } else if (error instanceof AbortRequestError) {
        return rejectWithValue({aborted: true});
      };
      return rejectWithValue(error);
    }
    }
);


export const deleteOrderItem = createAsyncThunk (
  "orderItem/deleteOrderItem",
  async (orderItemId, {dispatch, rejectWithValue}) => {
    const URL =  orderItemUrl(orderItemId);
    try {
      const response = await api.delete({
        url: URL,
      })
    return updateRelatedOrderWhenDeletingItems(response, dispatch);
    } catch (error) {
      if (error instanceof NetworkError) {
        return rejectWithValue({message: error.message, hint: error.hint});
      }
      return rejectWithValue(error);
    }
  }
);

export const deleteAllorderItems = createAsyncThunk(
  'orderItem/deleteAllorderItems',
  async(billId, {dispatch, rejectWithValue, signal}) => {
    const URL = `api/delete-all-orderItems/${billId}/`;
    try {
      const response = await api.delete({
        url: URL,
        signal: signal
      })
      return response;
    } catch (error) {
      if (error instanceof AbortRequestError) {
        return rejectWithValue({aborted: true});
      } else if (error instanceof NetworkError) {
        return rejectWithValue({message: error?.message, hint: error?.hint});
    }
    return rejectWithValue(error);
  }
  }
);




const orderItemSlice = createSlice({
    name: "orderItem",
    initialState: {
      orderItems: [],
       orderItemsStatus: "dine in" ,
       orderItemLoading: false,
       orderItemError: null,
       onDeleting: false,
       deleteError: null,
      },
    reducers: {
        clearOrderItems: (state) => {
            state.orderItems =  [];
            state.orderItemLoading = false;
            state.orderItemError = null;
        },
        removeOrderItem: (state, orderItem) => {
          // remove the orderItem from the list 
          const orderItemId = Number(orderItem.payload);
          const indexorderItem = state.orderItems.findIndex( orderItem => orderItem.id === orderItemId);
          if (indexorderItem !== -1) {
            state.orderItems.splice(indexorderItem, 1);
          }
        },
        writeOrderItemNotes: (state, data) => {
          const orderItemId = Number(data.payload.id);
          const indexorderItem = state.orderItems.findIndex( orderItem => orderItem.id === orderItemId);
           if (indexorderItem !== -1) {
              state.orderItems[indexorderItem] = data.payload;
           }  
        },
        changeOrderItemsStatus: (state) => {
          state.orderItemsStatus = state.orderItemsStatus === "dine in"? "take out": "dine in";
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchorderItems.pending, (state)=> {
            state.orderItems = [];
            state.orderItemError = null;
            state.orderItemLoading = true;
         
        })
        .addCase(fetchorderItems.fulfilled, (state, action)=> {
          state.orderItems = action.payload.reduce((acc, orderItem)=> {
            const cleaned = cleanorderItem(orderItem);
            if (cleaned.bill === action.meta.arg) {
              acc.push(cleaned);
            }
            return acc;
          }, [])
          state.orderItemLoading = false;
        })
        .addCase(fetchorderItems.rejected, (state, action)=> {
          if (action.meta.aborted) return;
            state.orderItemError = `Failed get orderItems. ${action.payload?.hint ?? ""}`;
            state.orderItemLoading = false;
          
        })
        // create orderItem 
        builder.addCase(createorderItem.pending, (state)=> {
            state.orderItemError = null;

        })
        .addCase(createorderItem.fulfilled, (state, action)=> {
            const orderItem = action.payload;
            state.orderItems.push(cleanorderItem(orderItem));
          
        })
        .addCase(createorderItem.rejected, (state, action)=> {
            state.orderItemError = `Failed to make orderItem due to ${action.payload?.hint?? ""}`;
            state.orderItemLoading = false;
  
        })

        // update orderItem 
        builder.addCase(updateorderItem.fulfilled, (state, action)=> {
            let neworderItem = action.payload;
            state.orderItems = state.orderItems.map((orderItem) => orderItem.id === neworderItem.id ?
              cleanorderItem(neworderItem): orderItem)


        })
        .addCase(updateorderItem.rejected, (state, action)=> {
          state.orderItemError = `Failed to update the orderItem. ${action.payload?.hint?? ""}`;

        })
        .addCase(deleteAllorderItems.fulfilled, (state, action) => {
          state.orderItems = [];
        })
    }


})


export const {clearOrderItems, removeOrderItem, writeOrderItemNotes, changeOrderItemsStatus } = orderItemSlice.actions;
export default orderItemSlice.reducer; 