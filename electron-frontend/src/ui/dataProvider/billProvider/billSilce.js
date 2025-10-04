import {createSlice, createAsyncThunk, isRejectedWithValue} from "@reduxjs/toolkit";
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
    async (billId) => {
        billController = new AbortController();
        return new Promise((reslove, reject) => {
          fetchData(
                `${url}api/bill/${billId}/`,
                {
                    getData: (res) => reslove(res),
                    apiError: (err) => reject(err)
                },
                undefined,
                billController,
               
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
        loading: false, 
        loadingBillError: null, 
        creatingBill: false, 
        creatingBillError: null,
        updateError: null, 
        loadingUpdate: false,},
    reducers: {
        clearBill: (state) => {
            if (state.loading) abortFetchingBill();
            state.bill = null;
            state.loadingBillError = null;
            state.creatingBillError = null;
            state.updateError = null;
            state.loading = false;
            state.creatingBill = false;
            state.loadingUpdate = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchBill.pending, (state) => {
            if (state.bill) return;
            state.loading = true;
        
        })
        .addCase(fetchBill.fulfilled, (state, action)=> {
            state.bill = action.payload.data;
            state.loading = false;
        })
        .addCase(fetchBill.rejected, (state, action) => {
            state.loadingBillError = `Failed to fetch bill due to ${action.error?.message}`;
            console.log(action)

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
            state.creatingBillError = action.error

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




