import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import { fetchData } from "./../../network/api";
import api from "../../network/API";
import { url } from "./../../network/constants";
import { cleanOrder } from "../orderProvider/orderSlice";
import { AwardIcon, Option } from "lucide-react";










// Create a bort controller to avoid late responses that causes memory leak and unwanted results;
let billController ;
const abortFetchingBill = () => {
    if (billController) {
        billController.abort();
        billController = null; 
    }
}


export const fetchBill =  createAsyncThunk(
    "bill/fetchbill",
    async (billId, {rejectWithValue}) => {
        billController = new AbortController();
        const URL =  `${url}api/bill/${billId}/`;
        try {
           const response = await api.get({
            url: URL,
            controller: billController
           })
        
        return response;

        } catch (error) {
            console.log(error);
            return rejectWithValue(error);
        }
    }
);


export const createBill = createAsyncThunk(
    'bill/createBill',
    async( data ,{rejectWithValue}) => {
         const URL =  `${url}api/create-bill/`;
         try {
            const response = await api.post({
                url: URL,
                data: data
            })
            return response; // already parsed from json format 
         } catch (error) {
            // return my customized error messages
           return rejectWithValue(error)
         }
         
        }
)

export const updateBill = createAsyncThunk(
    'bill/updateBill',
   async ({billId, data}, {rejectWithValue}) => {
        const URL =  `${url}api/bill/${billId}/`;
        console.log(data);
        try {
          const response = await api.put({
            url: URL,
            data: data,
          })
        return response;
        } catch (error) {
            return rejectWithValue(error);
        }

     
    }

)
// Reducer, action creater , action types
const billSlice = createSlice({
    name: "bill",
    initialState: {
        bill: null,
        orders: [],
        loading: false, 
        loadingBillError: null, 
        creatingBill: false, 
        creatingBillError: null,
        updateError: null, 
        loadingUpdate: false,},
    reducers: {
        clearBill: (state) => {
            abortFetchingBill();
            state.bill = null;
            state.loadingBillError = null;
            state.creatingBillError = null;
            state.updateError = null;
            state.orders = [];
            state.loading = false;
            state.creatingBill = false;
            state.loadingUpdate = false;
        },
        overrideBill: (state, action) => {
            state.bill = action.payload;
            state.orders = action.payload.orders?.map(order => cleanOrder(order)) || [];
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchBill.pending, (state) => {
            if (state.bill) return;
            state.loading = true;
    
        })
        .addCase(fetchBill.fulfilled, (state, action)=> {
            state.bill = action.payload;
            state.orders = action.payload.orders?.map(order => cleanOrder(order)) || [];
            state.loading = false;
        })
        .addCase(fetchBill.rejected, (state, action) => {
            state.loadingBillError = `Failed to fetch bill due to ${action.payload?.message}`;
            console.log(action)

        });
        // Create bill
        builder.addCase(createBill.pending, (state)=> {
            state.creatingBill = true;
            state.creatingBillError = null;

        })
        .addCase(createBill.fulfilled, (state, action)=> {
            state.bill = action.payload;
            console.log(action)
            state.creatingBill = false;
        })
        .addCase(createBill.rejected, (state, action)=> {
            state.creatingBill = false;
            const error = `Oops.. Failed to create a bill. ${action.payload?.hint ?? "Unexpected Error happened"}`;
            state.creatingBillError = error;

        })

        // Update bill 
        builder.addCase(updateBill.pending, (state)=> {
            state.loadingUpdate = true;
            state.updateError = null;

        })
        .addCase(updateBill.fulfilled, (state, action)=> {
            state.loadingUpdate = false;
            console.log(action)
            state.bill = {...state.bill, customer_number: action.payload?.customer_number}
        })
        .addCase (updateBill.rejected, (state, action)=> {
            const error = `Oops... Failed to update the bill. ${action.payload?.hint ?? ""}`;
            state.updateError = error;
            state.loadingUpdate = false

        })


    }
})


export const {clearBill, overrideBill} = billSlice.actions;
export default billSlice.reducer;




