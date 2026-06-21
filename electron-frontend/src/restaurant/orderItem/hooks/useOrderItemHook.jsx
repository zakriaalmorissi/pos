import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderItems, deleteOrderItem, createOrderItem, updateOrderItem } from "../../../dataProvider/orderItemProvider/orderItemProvider";
import {ACTIONS, PROCESSING_STATE} from "../../../components/constants"
import { makeAPICrud } from "../../../utilities/utiliy";



export default function useOrderItemHook () {
    const {order} = useSelector( s => s.order);
    const dispatch = useDispatch();
    const [processingOrderItemModel, setProcessingOrderItemModel] = useState({
            status: PROCESSING_STATE.IDLE,
            action: null,
            message: null,

    });
    const currentRequest = useRef(null);
    
    // Get the order items 
    useEffect(()=> {
            loadOrderItems();
       return () => {
        currentRequest.current?.abort();
       };
    }, [order?.id]);

    const resetProcessingOrderItemModel = () => {
        setProcessingOrderItemModel({
                status: PROCESSING_STATE.IDLE,
                action: null,
                message: null,
            })
    }


    const loadOrderItems = async () => {
        if (!order) return; 
        if (currentRequest.current) {
            currentRequest.current.abort();
        }
        const thunk = dispatch(fetchOrders(order.id));
        currentRequest.current = thunk;
        await makeAPICrud({
            thunk: thunk, 
            status: PROCESSING_STATE.LOADING,
            action: ACTIONS.GETTING,
            message: "Getting order Items",
            time: 600,
            updateStateCallback: (values) => setProcessingOrderItemModel(values)
        });
        resetProcessingOrderItemModel();

    }

  



    return {
        order: order,
        loadOrderItems: loadOrderItems,
        orderItemProcessing: processingOrderItemModel,
        resetOrderItemProcessing: resetProcessingOrderItemModel,
    }
}