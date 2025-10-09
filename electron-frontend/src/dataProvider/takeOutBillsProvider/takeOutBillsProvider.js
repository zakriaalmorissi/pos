import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "../../network/api";
import { url } from "../../network/constants";


export const fetchTakeOutBills  = createAsyncThunk(
    'takeOutBills/fetchTakeOutBills',
    async () => {
        return new Promise((resolve, reject)=> {
            fetchData(
                `${url}api/take-out-bills/`,
                {
                    getData: (res) => resolve(res),
                    apiError: (err) => reject(err)
                }
            )
        })
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

export const { addTakeOutBill } = takeOutBillsSlice.actions;
export default takeOutBillsSlice.reducer;