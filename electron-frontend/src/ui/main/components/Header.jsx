import { Table, Printer, User, RefreshCcw } from "lucide-react"
import style from './../style/table.module.css';
import { useContext, useState } from "react";
import { TableContext } from "../provider/provider";
import { NumericKeyBoard } from "../components/components";
import { TimeoutErrorMessageIndicator } from "../../components/components.jsx";
import { useSelector, useDispatch } from "react-redux";
import { updateBill } from "../../../dataProvider/billProvider/billSilce.js";


export function Header ({tableName}) {
    const {bill, updateError} = useSelector((state)=> state.bill)
    const {orderStatus, changeOrderStatus} = useContext(TableContext);
    const [dispalyNumericKeyboard, setDisplayNumericKeyboard] = useState(false);
    const dispatch = useDispatch();

    // need to get the bill updated 
    const overrideBillCustomer = (value) => {
        dispatch(updateBill({billId: bill?.id, data: {customer_number: value}}))
        setDisplayNumericKeyboard(false);
    }

    return (
        <div className={style.tableHeader}> 
            <h1>Table Header</h1>
            {
                bill !== null && <div className={style.billHeaderInfo}>
                    <button type="submit" onClick={changeOrderStatus} style={{
                        backgroundColor: orderStatus === "Take out" && "red",
                        color: orderStatus === "Take out" &&  "white"
                    }}> {orderStatus} </button>
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
                        <p>{bill?.customer_number}</p>
                    </div>
                    <RefreshCcw
                        size={40}
                        color="green"
                    
                    /> 
                </div>
            }
        {dispalyNumericKeyboard && 
            <NumericKeyBoard
                value={bill?.customer_number}
                onCancel={()=> setDisplayNumericKeyboard(false)}
                onSave={overrideBillCustomer}
                title={"Table Customers"}
        
        />}
        {
            updateError && <TimeoutErrorMessageIndicator message={updateError?.message}/>
        }
        </div>
    )
}