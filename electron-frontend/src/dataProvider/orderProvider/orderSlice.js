import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import { fetchData, updateData , postData, deleteData} from "./../../network/api";
import { url } from "./../../network/constants";
import { overrideBill } from "../billProvider/billSilce";
import api, { NetworkError } from "../../network/API";

// ✅ Update order (price, quantity, condiments, etc.)

export const updateOrder = createAsyncThunk(
  "order/updateOrder",
  async ({ orderId, data}, {rejectWithValue}) => {
    const URL =   `${url}api/order-view/${orderId}/`;
    try {
      const response = await api.put({
        url: URL,
        data: data
      })

      return response;
    } catch (error) {
      if (error instanceof NetworkError) {
        return rejectWithValue({message: error.message, hint: error.hint});
      }
      return rejectWithValue(error);
    }
  }
);




export const createOrder = createAsyncThunk(
    "order/createOrder",
   async ({data}, {rejectWithValue}) => {
      const URL = `${url}api/create-order/`;
      try {
        const response = await api.post({
          url: URL,
          data: data
        })

      return response;
       } catch (error) {
      if (error instanceof NetworkError) {
            return rejectWithValue({message: error.message, hint: error.hint});
          }
          return rejectWithValue(error);
    }
   }
)


// 
let controller; 
export const abortFetchingOrder = () => {
    if (controller) {
      controller.abort();
      controller = null;
  }
}

export const fetchOrders = createAsyncThunk(
    "order/fetchOrders",
    async (billId, {rejectWithValue}) => {
    controller = new AbortController();
    const URL =   `${url}api/orders-view/${billId}/`;
    try {
      const response = await api.get({
        url: URL,
        controller: controller
      })

      return response;
    } catch (error) {
      if (error instanceof NetworkError) {
        return rejectWithValue({message: error.message, hint: error.hint});
      }
      return rejectWithValue(error);
    }
    }
);


export const deleteOrder = createAsyncThunk (
  "order/deleteOrder",
  async (orderId, {dispatch, rejectWithValue}) => {
    const URL =   `${url}api/order-view/${orderId}/`;
    try {
      const response = await api.delete({
        url: URL,
      })
       dispatch(removeOrder(orderId));
       dispatch(overrideBill(response.bill));
      return response;
    } catch (error) {
      console.log(error)
      if (error instanceof NetworkError) {
        return rejectWithValue({message: error.message, hint: error.hint});
      }
      return rejectWithValue(error);
    }
  }
);

export const cleanOrder = (order) => {
  if (!order) return;
  /// Clean the fetched order to make it more readable following the javascript naming convention
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

  const orderTime = getRelativeTime(Date.now() - new Date(order.created_at));
  let condiments = order.condiments.split(",");
  const updateTime = getRelativeTime(Date.now() - new Date(order.updated_at));

  // Return the cleaned order
  return {
          id: order.id,
          name: order.food_name,
          totalPrice: Number(order.total_price ?? 0),
          price: Number(order.price ?? 0),
          bill: order.bill,
          quantity: Number(order.quantity ?? 0),
          status: order.status,
          isOrdered: order.is_ordered,
          hasTable: order.has_table,
          condiments: condiments,
          orderedAt: orderTime,
          updatedAt: updateTime,
      }
   
}


const orderSlice = createSlice({
    name: "order",
    initialState: {
      orders: [],
       orderLoading: false,
       orderError: null,
       onDeleting: false,
       deleteError: null,
      },
    reducers: {
        clearOrders: (state) => {
            abortFetchingOrder();
            state.orders = [];
            state.orderLoading = false;
            state.orderError = null;
        },
        removeOrder: (state, order) => {
          // remove the order from the list 
          const orderId = Number(order.payload);
          const indexOrder = state.orders.findIndex( order => order.id === orderId);
          if (indexOrder !== -1) {
            state.orders.splice(indexOrder, 1);
          }
        },
        writeOrderNotes: (state, data) => {
          const orderId = Number(data.payload.id);
          const indexOrder = state.orders.findIndex( order => order.id === orderId);
           if (indexOrder !== -1) {
              state.orders[indexOrder] = data.payload;
           }

          
          
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchOrders.pending, (state)=> {
            state.orders = [];
            state.orderError = null;
            state.orderLoading = true;
         
        })
        .addCase(fetchOrders.fulfilled, (state, action)=> {
          state.orders = [];
            state.orders = action.payload.map((order)=> {
              return cleanOrder(order);
            });
            state.orderLoading = false;
        })
        .addCase(fetchOrders.rejected, (state, action)=> {
            state.orders = [];
            state.orderError = `Failed get orders. ${action.payload?.hint ?? ""}`;
            state.orderLoading = false;
          
        })
        // create Order 
        builder.addCase(createOrder.pending, (state)=> {
            state.orderError = null;

        })
        .addCase(createOrder.fulfilled, (state, action)=> {
            const order = action.payload;
            state.orders.push(cleanOrder(order));
          
        })
        .addCase(createOrder.rejected, (state, action)=> {
            state.orderError = `Failed to make order due to ${action.payload?.hint?? ""}`;
            state.orderLoading = false;
  
        })

        // update order 
        builder.addCase(updateOrder.fulfilled, (state, action)=> {
            let newOrder = action.payload;
            state.orders = state.orders.map((order) => order.id === newOrder.id ?
              cleanOrder(newOrder): order)


        })
        .addCase(updateOrder.rejected, (state, action)=> {
          state.orderError = `Failed to update the order. ${action.payload?.hint?? ""}`;

        })
    }


})


export const {clearOrders, removeOrder, writeOrderNotes } = orderSlice.actions;

export default orderSlice.reducer; 