import {  useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ACTIONS, PROCESSING_STATE } from "../constants";
import { launchIndicatorModel } from "../models.";
//import {  clearOrders, createOrder, deleteAllOrders } from "../../../../dataProvider/orderItemProvider/orderItemProvider";
//import { updateTakeOutBill } from "../../../../dataProvider/takeOutBillsProvider/takeOutBillsProvider";
import { updateOrder, clearOrder } from "../../../dataProvider/orderProvider/orderSilce";

export default function useOrderHook (){
    const dispatch = useDispatch();
    const queuingOrderItems = useRef([]);
    const {order} = useSelector(s => s.order);
    const table = order?.table ?? null;
    // UI States 
    const [orderProcessingModel, setOrderProcessingModel] = useState({
        status: PROCESSING_STATE.IDLE,
        action: null,
        message: null
    })
    // Reset Order processing model 
    const reSetProcessingModelState = () => setOrderProcessingModel({
        status: PROCESSING_STATE.IDLE,
        action: null,
        message: null,
    })
    const makeOrderItem = async (orderItem) => {
        queuingOrderItems.current.push(orderItem);
        const status = table? "dine_in": "takeaway";
        const data = {...orderItem, table: table, order: bill?.id, status: status};
        console.log(data)
        const timer = launchIndicatorModel({
            status: PROCESSING_STATE.LOADING,
            action: ACTIONS.CREATING, 
            message: `adding ${orderItem?.name} item...`,
            setModel: (values) => setBillProcessingModel(values),
            time: 600
        })

        try {
            await dispatch(createOrderItem({orderId: order?.id, data: data})).unwrap();
            reSetProcessingModelState();
        } catch (error) {
            setBillProcessingModel({
                status: PROCESSING_STATE.ERROR,
                action: ACTIONS.UPDATING,
                message: `Failed to add the ${orderItem?.name} item. ${error?.hint ?? ""}`,

            })
        } finally {
            clearTimeout(timer);
            // Remove queuing orders;
            const storedOrderItem = queuingOrderItems.current.find(ordrItem => ordrItem.id === orderItem.id)
            if (storedOrderItems) {queuingOrderItems.current.splice(storedOrderItem, 1)};
        }
    };

    const makeOrderDiscount = async (value) => {
        const data = {discount: value};
        
        try {
            await dispatch(updateOrder({orderId: order?.id, data: data})).unwrap();
            reSetProcessingModelState();
        } catch (error) {
            setBillProcessingModel({
                status: PROCESSING_STATE.ERROR,
                action: ACTIONS.UPDATING,
                message: `Failed to make a discount. ${error?.hint ?? ""}`,
                
            })
        }
    }

    const deleteAllOrderItems = async () => { // no params
        // Delete all bill orders
        try {
           await  dispatch(deleteAllOrderItems(order?.id)).unwrap(); // needs review
        } catch (err) {
            console.log(err);
        }
    }

    const completeAction = () => {
        if (queuingOrderItems.current.length > 0) return false;
      //  if (!table) {
          // if(order) dispatch(updateTakeOutBill(bill));
       // }
       // dispatch(clearOrders()); dispatch(clearBill());

       return true;
        
    }


    return {
        order,
        makeOrderItem,
        makeOrderDiscount,
        deleteAllOrderItems,
        completeAction,
        orderProcssing: orderProcessingModel,
        resetState: reSetProcessingModelState,
    }


}