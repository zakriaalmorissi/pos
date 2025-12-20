import { useState } from "react";
import style from './style/createBill.module.css';
import  {StepBack} from 'lucide-react'


export  default function BillForm ({onSubmit, onBack}) {
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
            <div className={style.createBillHeader}>
                <button 
                    className={style.backButton}
                    onClick={onBack}>
                    <StepBack/>
                    <p>Back</p>
                </button>
                <h2>Create Bill</h2>
            </div>
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
            <button 
                className={style.submitButton}
                type="submit" onClick={handleSubmit} >Ok</button>
        </div>
    </div>
}


