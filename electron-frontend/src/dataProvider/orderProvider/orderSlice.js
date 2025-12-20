import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import { fetchData, updateData , postData, deleteData} from "./../../network/api";
import { url } from "./../../network/constants";
import { fetchBill } from "../billProvider/billSilce";

// ✅ Update order (price, quantity, condiments, etc.)

export const updateOrder = createAsyncThunk(
  "order/updateOrder",
  async ({ orderId, billId, data}, {dispatch}) => {
    return new Promise((resolve, reject) => {
      updateData(
        `${url}api/order-view/${orderId}/`,
        {
          data: data,
          callbacks: {
            getResponse: (res) => {
              // After updating → refresh bill
              resolve(res);
            },
            apiError: (err) => reject(err),
          },
        }
      );
    });
  }
);




export const createOrder = createAsyncThunk(
    "order/createOrder",
   async ({data}) => {
        return new Promise((resolve, reject)=> {
            postData(
                `${url}api/create-order/`,
                {
                    data: data,
                    getResponse: (res) => {
                        if (res.status === "ok"){
                            resolve(res);
                        } else {
                            reject(res);
                        }
                    }
                }
            )
        })
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
    async (billId) => {
    controller = new AbortController();
        return new Promise((resolve, reject)=> {
            fetchData(
                `${url}api/orders-view/${billId}/`,
                {
                  getData: (res)=> resolve(res),
                  apiError: (error) => reject(error)
                },
                undefined,
                controller,
            )
        })
    }
);


export const deleteOrder = createAsyncThunk (
  "order/deleteOrder",
  async (orderId, {dispatch}) => {
    return new Promise((resolve, reject)=> {
       deleteData(
        `${url}api/order-view/${orderId}/`,
        {
          data: {id: orderId},
          callbacks: {
            getResponse: (res) => {
              dispatch(removeOrder(orderId));
              resolve(res);
            },
            apiError: (err) => reject(err)

          }
        }
       )

    });
  }
);

export const cleanOrder = (order) => {
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
          totalPrice: order.total_price,
          price: order.price,
          bill: order.bill,
          quantity: order.quantity,
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
            state.orders = action.payload.data.map((order)=> {
              return cleanOrder(order);
            });
            state.orderLoading = false;
        })
        .addCase(fetchOrders.rejected, (state, action)=> {
            state.orders = [];
            state.orderError = action.error;
          
        })
        // create Order 
        builder.addCase(createOrder.pending, (state)=> {
            state.orderError = null;
            ///
        })
        .addCase(createOrder.fulfilled, (state, action)=> {
            const order = action.payload.data;
            state.orders.push(cleanOrder(order));
          
        })
        .addCase(createOrder.rejected, (state, action)=> {
            state.orderError = `Failed to make order due to ${action.error.message}`;
            console.log(action);
        })

        // update order 
        builder.addCase(updateOrder.fulfilled, (state, action)=> {
            let newOrder = action.payload.data;
            state.orders = state.orders.map((order) => order.id === newOrder.id ?
              cleanOrder(newOrder): order)


        })
        .addCase(updateOrder.rejected, (state, action)=> {
            console.log(action.error);
        })
    }


})


export const {clearOrders, removeOrder, writeOrderNotes } = orderSlice.actions;

export default orderSlice.reducer; 