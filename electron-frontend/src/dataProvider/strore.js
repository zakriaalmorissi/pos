import { configureStore } from "@reduxjs/toolkit";
import  billSlice from './billProvider/billSilce';
import orderSlice from './orderProvider/orderSlice';
import  systemSlice from "./systemProvider/system";
import  tablesSilce from './tablesProvider/tablesProvider';
import catalogSlice from './catalogProvider/catalogProvider'
import takeOutBillsSlice from "./takeOutBillsProvider/takeOutBillsProvider";



const store = configureStore({
    reducer: {
        system: systemSlice,
        bill: billSlice,
        order: orderSlice,
        floors: tablesSilce,
        catalog: catalogSlice,
        takeOutBills: takeOutBillsSlice
    }
})

export default store;