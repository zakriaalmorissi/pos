import { useState, useMemo} from "react";
import style from '../style/orderItem.module.css'
import { WarningMessage } from "../../../setup/components.jsx";
import { useSelector } from "react-redux";
import Indicator from "../../../components/Indicator.jsx";
import OrderItemCard from "./OrderItemCard.jsx";
import useOrderItemHook from '../hooks/useOrderItemHook.jsx'

export function OrderItems() {
    const {orderItemProcessing, loadOrderItems, resetOrderItemProcessing, orderItemActions} = useOrderItemHook();
    const {orderItems} = useSelector( s => s.orderItems)

    return  <div className={style.ordersContainer}>
         <div className={style.orderItemsList}>
                {
                    orderItems?.map((orderItem)=> {
                       return <OrderItemCard 
                            key={orderItem?.id}
                            orderItem={orderItem}
                            orderItemActions = {orderItemActions}
                        />
                    })
                }
            </div>
        <div className={style.ordersBottomContainer}>
            <Indicator 
                processingModel={orderItemProcessing}
                resetState={resetOrderItemProcessing}
                callbacks={{retryFetch: loadOrderItems}}
            />
        </div>
    </div>
}

