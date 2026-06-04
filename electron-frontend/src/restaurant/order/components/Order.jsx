import { Save, ShoppingCart } from "lucide-react";
import style from './style/order.module.css';
import { Menu } from "./Menu.jsx";
import { orderItem} from "../orderItem/OrderItem.jsx";;
import { OrderLeftSide } from "./OrderLeftSide.jsx";
import useBillHook from "./useBillHook.js";
import Indicator from "../Indicator.jsx";

 export function Order({ 
    handleCompleteAction, // Handle releasing the table and printing the orders 
    handlePaymentAction,
    addNewOrder // if the order is inside a table, give the ablitiy to create more than one order for each table 
 }) {
  const {
    order, 
    makeOrderItem, makeOrderDiscount,
    deleteOrderItems, // Delete all items 
    completeAction, orderProcssing,
    resetState // Reset the order state if a certain task
    } = useOrderHook();

   return <div className={style.mainOrderContainer}>
        <div className={style.orderBodyContainer}>
                <OrderLeftSide 
                    createNewOrder={addNewOrder} 
                    handleOrderDiscount = {makeOrderDiscount}
                    deleteAllOrderItem={deleteOrderItems}
                    order={order}
                     />

                <Menu handleOrder={makeOrderItem}/> 
            
        </div>
        <div className={style.orderBottomContainer}>
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
            processingModel={orderProcssing}
            resetState={resetState}
        />
    </div>

 }
