import {  useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ACTIONS, PROCESSING_STATE } from "../constants";
import { launchIndicatorModel } from "../models.";
import {  clearOrders, createOrder, deleteAllOrders } from "../../../../dataProvider/orderItemProvider/orderItemProvider";
import { clearBill, updateBill } from "../../../../dataProvider/billProvider/billSilce";
import { updateTakeOutBill } from "../../../../dataProvider/takeOutBillsProvider/takeOutBillsProvider";


export default function useBillHook (){
    const dispatch = useDispatch();
    const queuingOrders = useRef([]);
    const {bill} = useSelector(s => s.bill);
    const table = bill?.table ?? null;
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
        const status = table? "dine_in": "takeaway";
        const data = {...order, table: table, order: bill?.id, status: status};
        console.log(data)
        const timer = launchIndicatorModel({
            status: PROCESSING_STATE.LOADING,
            action: ACTIONS.CREATING, 
            message: "Making Order ..",
            setModel: (values) => setBillProcessingModel(values),
            time: 600
        })

        try {
            await dispatch(createOrder({billId: bill?.id,data: data})).unwrap();
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

    const deleteOrders = async () => { // no params
        // Delete all bill orders
        try {
           await  dispatch(deleteAllOrders(bill?.id)).unwrap();
        } catch (err) {
            console.log(err);
        }
    }

    const completeAction = () => {
        if (queuingOrders.current.length > 0) return;
        if (!table) {
           if(bill) dispatch(updateTakeOutBill(bill));
        }
        dispatch(clearOrders()); dispatch(clearBill());
        
    }


    return {
        bill,
        makeOrder,
        makeBillDiscount,
        deleteOrders,
        completeAction,
        billProcssing: billProcessingModel,
        resetState: reSetProcessingModelState,
    }


}