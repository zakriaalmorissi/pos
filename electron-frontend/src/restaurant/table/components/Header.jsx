import { Table, Printer, User, RefreshCcw } from "lucide-react"
import style from './../style/table.module.css';
import { NumericKeyBoard } from "../../../components/components.js";
import { useDispatch, useSelector} from "react-redux";
import { useState } from "react";

export function Header ({tableName, overrideBillCustomer, changeOrderStatus}) {
    // Manage the state of the order items (take away or dine in)
    // Show the table name 
    const [dispalyNumericKeyboard, setDisplayNumericKeyboard] = useState(false);
    const {bill} = useSelector(s => s.bill);
    const {ordersStatus} = useSelector( s => s.order);
    // need to get the bill updated 
    const onOverrideBillCustomer = (value) => {
        setDisplayNumericKeyboard(false);
        overrideBillCustomer({...bill, customerNumber: value});
    }

    return (
        <div className={style.tableHeader}> 
            <h1>Table Header</h1>
                <div className={style.billHeaderInfo}>
                    <button type="submit" onClick={changeOrderStatus}> {ordersStatus} </button>
                    <Printer 
                        onClick={() => console.log("Printed")}
                        size={40}
                        fontSize={10}
                        fontWeight={10}
                        
                    />
                    <div className={style.tableNumberDev}> 
                        <Table
                            size={40}
                          
                        />
                        <p>{tableName}</p>
                    </div>
                    <div className={style.tableCustomerNumberDev}> 
                        <User
                            onClick={()=> setDisplayNumericKeyboard(true)}
                            size={40}
                        />
                        <p>{bill?.customerNumber}</p>
                    </div>
                    <RefreshCcw
                        size={40}
                        color="green"
                    
                    /> 
                </div>
        {dispalyNumericKeyboard && 
            <NumericKeyBoard
                value={bill?.customerNumber}
                onCancel={()=> setDisplayNumericKeyboard(false)}
                onSave={onOverrideBillCustomer}
                title={"Table Customers"}
        />}
        </div>
    )
}