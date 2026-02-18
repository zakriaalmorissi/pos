import { Save, ShoppingCart } from "lucide-react";
import style from './style/bill.module.css';
import { Menu } from "./Menu.jsx";
import { Orders } from "../order/Order.jsx";;
import { BillLeftSide } from "./BillLeftSide.jsx";
import useBillHook from "./useBillHook.jsx";
import Indicator from "../Indicator.jsx";

 export function Bill({ 
    handleCompleteAction,
    handlePaymentAction,
    addNewBill
 }) {
  const {
    bill, 
    makeOrder, makeBillDiscount,
    deleteAllOrders, 
    completeAction, billProcssing,
    resetState
    } = useBillHook();

   return <div className={style.mainBillContainer}>
        <div className={style.billContainer}>
                <BillLeftSide 
                    createNewBill={addNewBill} 
                    handleBillDiscount = {makeBillDiscount}
                    deleteAllOrders={deleteAllOrders}
                    bill={bill}
                     />
                    <Orders />
                <Menu handleOrder={makeOrder}/> 
            
        </div>
        <div className={style.billBottomDev}>
            <button 
                className={style.completeButton}
                type="submit"
                onClick={() => {completeAction(); handleCompleteAction()}} >
                <Save size={40}/>
                <p>Complete</p>
            </button>
            <button className={style.paymentButton}>
                <ShoppingCart size={41}/>
                <p>Payment</p>
            </button>

        </div> 
        <Indicator
            processingModel={billProcssing}
            resetState={resetState}
        />
    </div>

 }
