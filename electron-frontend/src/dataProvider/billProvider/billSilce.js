import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import api from "../../network/API";
import { url } from "./../../network/constants";
import { NetworkError, AbortRequestError } from "../../network/API";
import {  updateTables } from "../tablesProvider/tablesProvider";
import { cleanTable } from "../tablesProvider/tableModels";





 export const cleanBill = (bill) => {
        if (!bill) return null;
        return  {
            id: bill.id,
            name: bill.name,
            table: bill.table,
            ordersLength: bill.orders_length ?? 0,
            customerNumber: bill.customer_number,
            discount: Number(bill.read_only_discount ?? 0),
            precentageDiscount: Number(bill.discount ?? 0),
            serviceCharge: Number(bill.service_charge ?? 0),
            tax: Number(bill.tax?? 0),
            total: Number(bill.total ?? 0),
            finalPrice: Number(bill.final_price?? 0),
            createdAt: bill.created_at ?? 0,
            updatedAt: bill.updated_at ?? 0
        }
    }


export const fetchBill =  createAsyncThunk(
    "bill/fetchbill",
    async (billId, {rejectWithValue, signal}) => {
        const URL =  `${url}orders/1/single-order/${billId}/`;
        try {
           const response = await api.get({
            url: URL,
            signal: signal
           })
        return cleanBill(response);

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

export const createBill = createAsyncThunk(
    'bill/createBill',
    async( data ,{rejectWithValue, dispatch}) => {
         const URL = `${url}orders/1/create-order`;
         try {
            const response = await api.post({
                url: URL,
                data: data
            })
          
            if (response.table) {
                const table = cleanTable(response.table);
                dispatch(updateTables(table));
                console.log(cleanBill(response))
                return cleanBill(response);
           }
            return cleanBill(response); // already parsed from json format 
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

export const updateBill = createAsyncThunk(
    'bill/updateBill',
   async ({billId, data}, {rejectWithValue, dispatch}) => {
    console.log(data);
        const URL =  `${url}orders/1/single-order/${billId}/`;
        try {
          const response = await api.put({
            url: URL,
            data: data,
          });
        return cleanBill(response);
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
        loading: false, 
        loadingBillError: null, 
        creatingBill: false, 
        creatingBillError: null,
        updateError: null, 
        loadingUpdate: false,},
    reducers: {
        clearBill: (state) => {
            state.bill = null;
            state.loadingBillError = null;
            state.creatingBillError = null;
            state.updateError = null;
            state.loading = false;
            state.creatingBill = false;
            state.loadingUpdate = false;
        },
        overrideBill: (state, action) => {
            console.log(action)
            state.bill = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchBill.pending, (state) => {
            if (state.bill) return;
            state.loading = true;
            state.loadingBillError = null;
    
        })
        .addCase(fetchBill.fulfilled, (state, action)=> {
            state.bill = action.payload;
            state.loading = false;
        })
        .addCase(fetchBill.rejected, (state, action) => {
            state.loadingBillError = `Failed to fetch bill. ${action.payload?.hint ?? ""}`;
            state.loading = false;

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
            const bill = action.payload
            state.bill = {...state.bill, ...bill};
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




