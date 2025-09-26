import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import { fetchData, postData,  updateData } from "../../../network/api";
import { url } from "../../../network/constants";


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
        return new Promise ((reslove, reject) => {
            fetchData(
                `${url}api/bill/${billId}/`,
                {
                    getData: (res) => {reslove(res)},
                    apiError: (error) => {
                        reject(error)
                        rejectWithValue(error)}
                },
                undefined,
                billController
            );
        });
    }
);


export const createBill = createAsyncThunk(
    'bill/createBill',
    async( data ) => {
            return new Promise((reslove, reject)  => {
                    postData(
                        `${url}api/create-bill/`,
                        {
                         data: data,
                         getResponse: (res) => {
                            if (res.status === "ok"){
                                reslove(res)
                            } else {
                                reject(res)
                             }
                        },
                        }
                    );
            });
        }
)

export const updateBill = createAsyncThunk(
    'bill/updateBill',
    ({billId, data}) => {
        return new Promise((reslove, reject) => {
            updateData(
                `${url}api/bill/${billId}/`,
                {
                    data: data,
                    callbacks: {
                        getResponse: (res) => reslove(res),
                        apiError: (error) => reject(error)
                    }
                
                }
            );

        });
    }

)
// Reducer, action creater , action types
const billSlice = createSlice({
    name: "bill",
    initialState: {
        bill: null,
        loading: false, error: null, 
        creatingBill: false, creatingBillError: null,
        updateError: null, loadingUpdate: false,},
    reducers: {
        // add the things i want here 
        clearBill: (state) => {
            if (state.loading) abortFetchingBill();
            state.bill = null;
            state.error = null;
            state.creatingBillError = null;
            state.updateError = null;
            state.loading = false;
            state.creatingBill = false;
            state.loadingUpdate = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchBill.pending, (state) => {
            if (!state.bill){
                state.loading = true
            }
          
        })
        .addCase(fetchBill.fulfilled, (state, action)=> {
         
            state.loading = false;
            state.bill = action.payload.data;
    
            
        
        })
        .addCase(fetchBill.rejected, (state, action) => {
            state.error = action.error.message

        });
        // Create bill
        builder.addCase(createBill.pending, (state)=> {
            state.creatingBill = true;

        })
        .addCase(createBill.fulfilled, (state, action)=> {
            state.bill = action.payload.data;
            state.creatingBill = false;
        })
        .addCase(createBill.rejected, (state, action)=> {
            state.creatingBillError = action.error.message
            console.log(action.payload)
        })

        // Update bill 
        builder.addCase(updateBill.pending, (state)=> {
            state.loadingUpdate = true;

        })
        .addCase(updateBill.fulfilled, (state, action)=> {
            state.loadingUpdate = false;
            state.bill = {...state.bill, customer_number: action.payload.data.customer_number}
        })
        .addCase (updateBill.rejected, (state, action)=> {
            state.updateError = action.error.message
        })


    }
})


export const {clearBill} = billSlice.actions;
export default billSlice.reducer;




