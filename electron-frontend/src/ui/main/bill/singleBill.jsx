import { useParams, useNavigate } from "react-router-dom";
import { url } from "../../../network/constants";
import { Bill } from "../components/Bill";
import style from '../style/bills.module.css'
import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { clearBill, fetchBill } from "../../../dataProvider/billProvider/billSilce";
import { clearOrders } from "../../../dataProvider/orderProvider/orderSlice";



/// 
/// Provider for bills without tables 
/// Provider for Tables ,
// Provider for users
// Provider for menus
// Note: fetch them all while launching the system






export function SingleBill () {
    const {id} = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(null)
    const dispatch = useDispatch();

    const handleCompleteAction = () => {
        navigate('/billsHome')
        dispatch(clearBill());
        dispatch(clearOrders());
        
    }

    useEffect(()=> {
        dispatch(fetchBill(id));
    }, []);



    return <div className={style.singleBill}>
    <div className={style.singleBillHeader}>
        <h1>Bill Header</h1>
       
        {
            bill && <div className={style.billDataContainer}> 
                <h3>Client :{bill.name}</h3>
                <h3>OrderNumber: {bill.id}</h3>
            </div>        
            
        }
        <div className={style.printerContainer}>
            <Printer 
                    onClick={() => console.log("Printed")}
                    size={40}
                    fontSize={10}
                    fontWeight={10}
                    color="white"
            />
        </div>
    </div>
    <Bill 
        handleCompleteAction={handleCompleteAction}
        alreadyhasBills={true}
        orderStatus={'take out'}
    />
</div>

}