import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import { url } from "../../network/constants";
import { cleanBill, overrideBill, updateBill } from "../billProvider/billSilce";
import api, { AbortRequestError, NetworkError } from "../../network/API";

// ✅ Update orderItem (price, quantity, condiments, etc.)

export const updateOrderItem = createAsyncThunk(
  "orderItem/updateOrderItem",
  async ({ orderItemId, data}, {rejectWithValue}) => {
    const URL =   `${url}api/order-item-view/${orderItemId}/`;
    try {
      const response = await api.put({
        url: URL,
        data: data
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




export const createOrderItem = createAsyncThunk(
    "orderItem/createorderItem",
   async ({billId, data}, {rejectWithValue, dispatch}) => {
      const URL = `${url}orderItems/1/${billId}/create-orderItem-item/`;
      try {
        const response = await api.post({
          url: URL,
          data: data
        })
        const bill = cleanBill(response.bill);
        if (bill) {
          dispatch(overrideBill(bill));
        }
      return response.orderItem;
       } catch (error) {
      if (error instanceof NetworkError) {
            return rejectWithValue({message: error.message, hint: error.hint});
          }
          return rejectWithValue(error);
    }
   }
)



export const fetchOrderItems = createAsyncThunk(
    "orderItem/fetchOrderItems",
    async (billId, {rejectWithValue, signal}) => {
    console.log("fecthing orderItems is called");
    console.log(`Current bill is ${billId}`);
    const URL = `${url}order-items/1/${billId}/orderItem-items/`;
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


export const deleteorderItem = createAsyncThunk (
  "orderItem/deleteOrderItem",
  async (orderItemId, {dispatch, rejectWithValue}) => {
    const URL = `${url}api/order-item-view/${orderItemId}/`;
    try {
      const response = await api.delete({
        url: URL,
      })
      const bill = cleanBill(response.bill);
       dispatch(removeorderItem(orderItemId));
       dispatch(overrideBill(bill));
      return response;
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
    const URL = `${url}api/delete-all-orderItems/${billId}/`;
    try {
      const response = await api.delete({
        url: URL,
        signal: signal
      })
      const bill = cleanBill(response.bill);
      console.log(bill)
      /// Override the bill data
      if (bill) {
        dispatch(overrideBill(bill));
      }
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

export const cleanorderItem = (orderItem) => {
  if (!orderItem) return;
  /// Clean the fetched orderItem to make it more readable following the javascript naming convention
    // Create a formatter for relative time
  function getRelativeTime(ms) { const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
        if (!ms) return; 
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(ms / (1000 * 60));
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);  // Approximate
        const years = Math.floor(days / 365);  // Approximate

        if (seconds < 60) return rtf.format(-seconds, 'second');
        if (minutes < 60) return rtf.format(-minutes, 'minute');
        if (hours < 24) return rtf.format(-hours, 'hour');
        if (days < 30) return rtf.format(-days, 'day');
        if (days < 365) return rtf.format(-months, 'month');
        return rtf.format(-years, 'year');
    }

  const orderItemTime = getRelativeTime(Date.now() - new Date(orderItem.created_at));
  let condiments = orderItem.condiments.split(",");
  const updateTime = getRelativeTime(Date.now() - new Date(orderItem.updated_at));

  // Return the cleaned orderItem
  return {
          id: orderItem.id,
          name: orderItem.name,
          totalPrice: Number(orderItem.total_price ?? 0),
          unitPrice: Number(orderItem.unit_price ?? 0),
          bill: orderItem.bill,
          quantity: Number(orderItem.quantity ?? 0),
          status: orderItem.status,
          isorderItemed: orderItem.is_orderItemed,
          hasTable: orderItem.has_table,
          condiments: condiments,
          orderItemedAt: orderItemTime,
          updatedAt: updateTime,
      }
   
}


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
        clearorderItems: (state) => {
            state.orderItems =  [];
            state.orderItemLoading = false;
            state.orderItemError = null;
        },
        removeorderItem: (state, orderItem) => {
          // remove the orderItem from the list 
          const orderItemId = Number(orderItem.payload);
          const indexorderItem = state.orderItems.findIndex( orderItem => orderItem.id === orderItemId);
          if (indexorderItem !== -1) {
            state.orderItems.splice(indexorderItem, 1);
          }
        },
        writeorderItemNotes: (state, data) => {
          const orderItemId = Number(data.payload.id);
          const indexorderItem = state.orderItems.findIndex( orderItem => orderItem.id === orderItemId);
           if (indexorderItem !== -1) {
              state.orderItems[indexorderItem] = data.payload;
           }  
        },
        changeorderItemsStatus: (state) => {
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


export const {clearorderItems, removeorderItem, writeorderItemNotes, changeorderItemsStatus } = orderItemSlice.actions;
export default orderItemSlice.reducer; 