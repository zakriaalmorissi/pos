import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { url } from "../../network/constants";
import api from '../../network/API'


export const fetchTakeOutBills  = createAsyncThunk(
    'takeOutBills/fetchTakeOutBills',
    async () => {
        const URL = `${url}`
        return  api.get(

        )
    }
);



const takeOutBillsSlice = createSlice(
    {
        name: "takeOutBills",
        initialState: {
            takeOutBills: [], 
            isLoadingTakeOutBills: false,
             loadingTakeOutBillsError: null 
            },
        reducers: {
            addTakeOutBill: (state, action) => {
                state.takeOutBills.push(action.payload);
            }, 
            updateTakeOutBill: (state, action) => {
                const updatedBill = action.payload;
                state.takeOutBills = state.takeOutBills
                .map(bill => bill.id === updatedBill.id ?
                    updatedBill: bill
                )
               
            }
        },
        extraReducers: builder => {
            builder.addCase(fetchTakeOutBills.pending, (state)=> {
                state.isLoadingTakeOutBills = true;
                state.loadingTakeOutBillsError = null;
            })
            .addCase(fetchTakeOutBills.fulfilled, (state, action)=> {
                state.takeOutBills = action.payload.data;
                state.isLoadingTakeOutBills = false;

            })
            .addCase(fetchTakeOutBills.rejected, (state, action)=> {
                state.loadingTakeOutBillsError = action.error,
                state.isLoadingTakeOutBills = false;
            })
        }
    }
)

export const { addTakeOutBill, updateTakeOutBill } = takeOutBillsSlice.actions;
export default takeOutBillsSlice.reducer;