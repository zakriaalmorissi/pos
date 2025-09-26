import { configureStore } from "@reduxjs/toolkit";
import  billSlice from './billProvider/billSilce';
import orderSlice from './orderProvider/orderSlice';
import  systemSlice from "./systemProvider/system";
import  tablesSilce from './tablesProvider/tablesProvider';
import menuSlice from './menuProvider/menuProvider'



const store = configureStore({
    reducer: {
        system: systemSlice,
        bill: billSlice,
        order: orderSlice,
        tables: tablesSilce,
        menu: menuSlice
    }
})

export default store;