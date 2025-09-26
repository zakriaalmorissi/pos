import { useState, useEffect } from "react";
import { url } from "../../../network/constants";
import style from '../style/bills.module.css'
import { fetchData, postData } from "../../../network/api";
import { StepBackIcon} from 'lucide-react'
import { Link, useNavigate } from "react-router-dom";
import  BillForm  from "../components/billForm";



export function BillsHome({}) {
    const [bills, setBills] = useState([]);
    const navigate = useNavigate();

    const [displayBillForm, setDisplayBillForm] = useState(false);
    const [createdBill, setCreatedBill] = useState(null);
    

    useEffect(()=> {
        loadBills();
    },[]);


    const loadBills = async () => {
        const billsUrl = `${url}api/bills/`;
        await fetchData(billsUrl, 
            {
                getData: (response) => {
                    setBills(response.data)
                    console.log(response)

                },
                apiError:(responseError) => {
                    console.log(responseError)

                }
            }
        )
    }


    const onCreateBill = async (data) => {
        const billURL = `${url}api/create_bill/`;
        await postData(
            billURL,
            {
                data: data,
                getResponse: (response) => {
                    console.log(response)
                    if (response.status === "ok"){
                        setCreatedBill(response.data);
                        navigate(`/singleBill/${response.data.id}`)

                    }

                },

            }

        )

    }



    return  displayBillForm? <div className={style.billFormContainer}>
        <BillForm onSubmit={onCreateBill}/>
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
                bills.map((bill)=> {
                    return <Link 
                        key={bill.id}
                        className={style.singleBillContainer}
                        to={`/singleBill/${bill.id}`}
                        > 
                        <p>Ref: {bill.id}</p>
                        <p>Client: {bill.name}</p>
                    </Link>
                })
            }
        </div>

    </div>

}