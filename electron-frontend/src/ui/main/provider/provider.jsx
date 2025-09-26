import { createContext, useState } from "react";




export const TableContext = createContext();

 export function TableProvider ({children}) {
    const [orderStatus, setTableStatus] = useState("Table service");

    const changeOrderStatus = () => {
        setTableStatus(prev => prev === "Table service"? "Take out": "Table service");
    }

    const values = {orderStatus, changeOrderStatus}


    return <TableContext.Provider value={values}>
        {children}
    </TableContext.Provider>

}