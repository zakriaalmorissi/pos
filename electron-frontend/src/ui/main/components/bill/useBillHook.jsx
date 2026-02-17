import {  useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ACTIONS, PROCESSING_STATE } from "../constants";
import { launchIndicatorModel } from "../models.";
import {  clearOrders, createOrder } from "../../../../dataProvider/orderProvider/orderSlice";
import { clearBill, updateBill } from "../../../../dataProvider/billProvider/billSilce";
import { updateTakeOutBill } from "../../../../dataProvider/takeOutBillsProvider/takeOutBillsProvider";


export default function useBillHook (){
    const dispatch = useDispatch();
    const queuingOrders = useRef([]);
    const {bill} = useSelector(s => s.bill);
    const table = bill?.table ?? null;
    const {ordersStatus} = useSelector(s => s.order);
    // UI States 
    const [billProcessingModel, setBillProcessingModel] = useState({
        status: PROCESSING_STATE.IDLE,
        action: null,
        message: null
    })
    const reSetProcessingModelState = () => setBillProcessingModel({
        status: PROCESSING_STATE.IDLE,
        action: null,
        message: null,
    })
    const makeOrder = async (order) => {
        queuingOrders.current.push(order);
        const status = table? ordersStatus : "take out";
        const data = {...order, table: table, bill: bill?.id, status: status};
        const timer = launchIndicatorModel({
            status: PROCESSING_STATE.LOADING,
            action: ACTIONS.CREATING, 
            message: "Making Order ..",
            setModel: (values) => setBillProcessingModel(values),
            time: 600
        })

        try {
            await dispatch(createOrder({data: data})).unwrap();
            reSetProcessingModelState();
        } catch (error) {
            setBillProcessingModel({
                status: PROCESSING_STATE.ERROR,
                action: ACTIONS.UPDATING,
                message: `Failed to make an order. ${error?.hint ?? ""}`,

            })
        } finally {
            clearTimeout(timer);
            // Remove queuing orders;
            const storedOrder = queuingOrders.current.find(ordr => ordr.id === order.id)
            if (storedOrder) {queuingOrders.current.splice(storedOrder, 1)};
        }
    };

    const makeBillDiscount = async (value) => {
        const data = {...bill, discount: value};
        
        try {
            await dispatch(updateBill({billId: bill?.id, data: data})).unwrap();
            reSetProcessingModelState();
        } catch (error) {
            setBillProcessingModel({
                status: PROCESSING_STATE.ERROR,
                action: ACTIONS.UPDATING,
                message: `Failed to make a discount. ${error?.hint ?? ""}`,
                
            })
        }
    }

    const deleteAllOrders = async () => { // no params
        // Delete all bill orders
    }

    const completeAction = () => {
        if (queuingOrders.current.length > 0) return;
        if (!table) {
            dispatch(updateTakeOutBill(bill));
        }
        dispatch(clearOrders()); dispatch(clearBill());
        
    }


    return {
        bill,
        makeOrder,
        makeBillDiscount,
        deleteAllOrders,
        completeAction,
        billProcssing: billProcessingModel,
        resetState: reSetProcessingModelState,
    }


}