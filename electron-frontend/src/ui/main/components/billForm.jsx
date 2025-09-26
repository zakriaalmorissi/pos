import { useState } from "react";
import style from '../style/table.module.css';


export  default function BillForm ({onSubmit}) {
    const [customerName, setCustomerName] = useState('');
    const [numberOfCustomer, setNumberOfCustomer] = useState('');
    

    const handleSubmit = ()=> {
        onSubmit({
            name: customerName,
            customer_number: numberOfCustomer || 0
        })
    
    }

       return <div className={style.createBillPage}> 
        <div className={style.createBillContainer}>
            <h2>Create Bill</h2>
            <p>Enter customer details to create a new bill</p>
            <input
                type="text"
                placeholder="Customer Name (optional)"
                value={customerName}
                onChange={(e)=> setCustomerName(e.target.value)}
            />
            <input 
                type="text"
                placeholder ="Number of customers"
                value={numberOfCustomer}
                onChange={(e)=> setNumberOfCustomer(e.target.value)} 
            />
            <button type="submit" onClick={handleSubmit} >Ok</button>
        </div>
    </div>
}


