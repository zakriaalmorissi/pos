import { useState, useEffect } from "react";
import style from '../style/bills.module.css';
import { StepBackIcon} from 'lucide-react'
import { Link, useNavigate } from "react-router-dom";
import  BillForm  from "../components/bill/billForm";
import { useDispatch, useSelector } from "react-redux";
import { createBill } from "../../../dataProvider/billProvider/billSilce";
import { addTakeOutBill } from "../../../dataProvider/takeOutBillsProvider/takeOutBillsProvider";
import { TimeoutErrorMessageIndicator } from "../../components/components";

import BillCard from "../components/bill/BillCard";


export function BillsHome({}) {
    const { takeOutBills } = useSelector( s => s.takeOutBills );
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [createBillErorr, setCreateBillError] = useState(null);

    const [displayBillForm, setDisplayBillForm] = useState(false);

    const onCreateBill = async (data) => {
        setCreateBillError(null);
        try {
            const bill = await dispatch(createBill(data)).unwrap();
            navigate(`/singleBill/${bill.data.id}`);
            // Update the bills 
            dispatch(addTakeOutBill(bill.data));
        } catch (err) {
            setCreateBillError(`Failed to create Bill due to ${err.message}`);
        }
       
    }

    const onCreateBillBack = () => {
         setDisplayBillForm(false);

    }

    const onBillPress = (bill) => {
        navigate(`/singleBill/${bill?.id}`);

    }

   

    return  displayBillForm? <div className={style.billFormContainer}>
        {createBillErorr && <TimeoutErrorMessageIndicator message={createBillErorr}/>}
        <BillForm 
            onSubmit={onCreateBill}
            onBack={onCreateBillBack}
            
        />
    </div> :
     <div className={style.billsHome}>
        <div className={style.billsHomeHeader}>
            <button onClick={()=> navigate("/")}>
                <StepBackIcon size={40}/>
                <p>Back</p>
            </button>
            <h2>Take out Orders</h2>

        </div>
        <div className={style.billsHomeBody}>
            <button onClick={()=> setDisplayBillForm(true)}>
                <p>New</p>
            </button>
            {
                takeOutBills.map((bill)=> {
                    return <BillCard key={bill.id} bill={bill} onPress={onBillPress}/>
                })
            }
        </div>

    </div>

}