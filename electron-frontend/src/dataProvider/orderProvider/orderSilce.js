import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import api from "../../network/API";
import { url } from "../../network/constants";
import { NetworkError, AbortRequestError } from "../../network/API";
import {  updateTables } from "../tablesProvider/tablesProvider";
import { cleanTable } from "../tablesProvider/tableModels";
import { cleanOrder, createOrderURL, orderURL } from "./orderServices";




export const fetchOrder =  createAsyncThunk(
    "order/fetchOrder",
    async (orderId, {rejectWithValue, signal}) => {
        const URL =  orderURL(orderId);
        try {
           const response = await api.get({
            url: URL,
            signal: signal
           })
        return cleanOrder(response);

        } catch (error) {
            if (error instanceof NetworkError) {
                const rejectValue = {message: error.message, hint: error.hint};
                return rejectWithValue(rejectValue);
            }
            if (error instanceof AbortRequestError) {
                return  rejectWithValue({message: error?.message ?? "Request was aborted"});
            }
            else if (error instanceof AbortRequestError) return;
           return rejectWithValue(error);

           
        }
    }
);

export const createOrder = createAsyncThunk(
    'order/createOrder',
    async( data ,{rejectWithValue, dispatch}) => {
         const URL = createOrderURL();
         try {
            const response = await api.post({
                url: URL,
                data: data
            })
            // There are so many other things to do here;
            if (response.table) {
                const table = cleanTable(response.table);
                dispatch(updateTables(table));
                return cleanOrder(response);
           }
            return cleanOrder(response); // already parsed from json format 
         } catch (error) {
            if (error instanceof NetworkError) {
                const rejectValue = {message: error.message, hint: error.hint};
                return rejectWithValue(rejectValue);
            } else if(error instanceof AbortRequestError) {
                return rejectWithValue({message: error?.message})
            }
            // return my customized error messages
           return rejectWithValue(error)
         }
         
        }
)

export const updateOrder = createAsyncThunk(
    'order/updateOrder',
   async ({orderId, data}, {rejectWithValue, dispatch}) => {
    console.log(data);
        const URL =  orderURL(orderId);
        try {
          const response = await api.put({
            url: URL,
            data: data, 
          });
        return cleanOrder(response);
        } catch (error) {
            return rejectWithValue(error);
        }

     
    }

)
// Reducer, action creater , action types
const orderSlice = createSlice({
    name: "order",
    initialState: {
        order: null,
        loading: false, 
        loadingOrderError: null, 
        creatingOrder: false, 
        creatingOrderError: null,
        updateError: null, 
        loadingUpdate: false,},
    reducers: {
        clearOrder: (state) => {
            state.order = null;
            state.loadingOrderError = null;
            state.creatingOrderError = null;
            state.updateError = null;
            state.loading = false;
            state.creatingOrder = false;
            state.loadingUpdate = false;
        },
        overrideOrder: (state, action) => {
            console.log(action)
            state.order = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchorder.pending, (state) => {
            if (state.order) return;
            state.loading = true;
            state.loadingOrderError = null;
    
        })
        .addCase(fetchorder.fulfilled, (state, action)=> {
            state.order = action.payload;
            state.loading = false;
        })
        .addCase(fetchorder.rejected, (state, action) => {
            state.loadingOrderError = `Failed to fetch order. ${action.payload?.hint ?? ""}`;
            state.loading = false;

        });
        // Create order
        builder.addCase(createorder.pending, (state)=> {
            state.creatingOrder = true;
            state.creatingOrderError = null;

        })
        .addCase(createOrder.fulfilled, (state, action)=> {
            state.order = action.payload;
            console.log(action)
            state.creatingOrder = false;
        })
        .addCase(createOrder.rejected, (state, action)=> {
            state.creatingOrder = false;
            const error = `Oops.. Failed to create a order. ${action.payload?.hint ?? "Unexpected Error happened"}`;
            state.creatingOrderError = error;

        })

        // Update order 
        builder.addCase(updateOrder.pending, (state)=> {
            state.loadingUpdate = true;
            state.updateError = null;

        })
        .addCase(updateOrder.fulfilled, (state, action)=> {
            state.loadingUpdate = false;
            const order = action.payload
            state.order = {...state.order, ...order};
        })
        .addCase (updateOrder.rejected, (state, action)=> {
            const error = `Oops... Failed to update the order. ${action.payload?.hint ?? ""}`;
            state.updateError = error;
            state.loadingUpdate = false

        })


    }
})


export const {clearOrder, overrideOrder} = orderSlice.actions;
export default orderSlice.reducer;




