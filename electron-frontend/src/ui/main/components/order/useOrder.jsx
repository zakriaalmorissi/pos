import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, deleteOrder, updateOrder, createOrder } from "../../../../dataProvider/orderItemProvider/orderItemProvider";
import { ACTIONS, PROCESSING_STATE } from "../constants";
import { cleanBill } from "../../../../dataProvider/billProvider/billSilce";
import { launchIndicatorFailureModel, launchIndicatorModel } from "../models.";




export default function useOrderHook () {
    const { bill } = useSelector( s => s.bill);
    const dispatch = useDispatch();
    const [processingOrderModel, setProcessingOrderModel] = useState({
            status: PROCESSING_STATE.IDLE,
            action: null,
            message: null,

    });
    const currentRequest = useRef(null);
    
    // Get the orders
    useEffect(()=> {
            loadOrders();
       return () => {
        currentRequest.current?.abort();
       };
    }, [bill?.id]);

    const resetProcessingOrderModel = () => {
        setProcessingOrderModel({
                status: PROCESSING_STATE.IDLE,
                action: null,
                message: null,
            })
    }


    const loadOrders = async () => {
        if (!bill) return;
        if (currentRequest.current) {
            currentRequest.current.abort();
        }
        const thunk = dispatch(fetchOrders(bill.id));
        currentRequest.current = thunk;
        console.log("Load orders is called");
        const timer = launchIndicatorModel({
            status: PROCESSING_STATE.LOADING,
            action: ACTIONS.GETTING,
            message: "Getting orders ..",
            time: 600,
            setModel: (values) => setProcessingOrderModel(values)
        })
        const errorTimer =launchIndicatorFailureModel({
            status: PROCESSING_STATE.ERROR,
            action: ACTIONS.GETTING,
            message: "Loading orders took so long. Please check your connection",
            setModel: (values) => setProcessingOrderModel(values)
        })
        try {
            await thunk.unwrap();
            resetProcessingOrderModel();
        } catch (error) {
            if (error?.name === "AbortError") return;
            setProcessingOrderModel({
                status: PROCESSING_STATE.ERROR,
                action: ACTIONS.GETTING,
                message: `Failed to load orders. ${error?.hint ?? ""}`

            })
        } finally {
            clearTimeout(timer);
            clearTimeout(errorTimer);
        }
    }

  
    // Order actions
    const onDeleteOrder = async (order) => {
       const timer = launchIndicatorModel({
        status: PROCESSING_STATE.LOADING,
        action: ACTIONS.DELETING, 
        message: `Deleting ${order?.name}`,
        setModel: (values) => setProcessingOrderModel(values)
    });
    const errorTimer = launchIndicatorFailureModel({
        status: PROCESSING_STATE.ERROR,
        action: ACTIONS.DELETING,
        message: "Failed to delete. Took so long to respone",
        setModel: (values) => setProcessingOrderModel(values)
    })
    

        // Launch Failure if process takes so long 
        try {
            await dispatch(deleteOrder(order?.id)).unwrap();
            resetProcessingOrderModel();
        } catch (error) {
            setProcessingOrderModel({
                status: PROCESSING_STATE.ERROR,
                action: ACTIONS.DELETING, 
                message: `Failed to delete the order. ${error?.hint ?? ""}`
            });
        } finally {
            clearTimeout(timer);
            clearTimeout(errorTimer)
        }    
    }

    const sendOrderUpdates = async (order) => {
        // Delibrately ignoring to show the process indicator
        const timerError =launchIndicatorFailureModel({
            status: PROCESSING_STATE.ERROR,
            action: ACTIONS.UPDATING,
            message: "Updating order took so long",
            setModel: (values) => setProcessingOrderModel(values),
        })
        try {
            await dispatch(updateOrder({orderId: order?.id, data:order})).unwrap();
        } catch (error) {
            // Show only failure 
            setProcessingOrderModel({
                status: PROCESSING_STATE.ERROR,
                action: ACTIONS.UPDATING,
                message: `Failed to update the order ${error?.hint ?? ""}`,
            })

        } finally {
            clearTimeout(timerError);
        }
    }

    const createNewOrder = async (order) => {
        const timer = launchIndicatorModel({
            status: PROCESSING_STATE.LOADING,
            action: ACTIONS.CREATING, 
            message: `Creating order ...`,
            setModel: (values) => setProcessingOrderModel(values)

        })
        const timerError = launchIndicatorFailureModel({
            status: PROCESSING_STATE.ERROR,
            action: ACTIONS.CREATING,
            message: "Creating order took so long ..",
            time: 3000,
            setModel: (values) => setProcessingOrderModel(values)
        })
        try {
            await dispatch(createOrder({data: order})).unwrap();
            resetProcessingOrderModel();
        } catch (error) {
            setProcessingOrderModel({
                status: PROCESSING_STATE.ERROR,
                action: ACTIONS.CREATING,
                message: `Failed to create an order. ${error?.hint ?? ""}`
            })
        } finally {
            clearTimeout(timer);
            clearTimeout(timerError);
        }

    }


    return {
        bill: bill,
        loadOrders: loadOrders,
        orderProcessing: processingOrderModel,
        resetOrderProcessing: resetProcessingOrderModel,
        orderActions: {
            create: createNewOrder,
            update: sendOrderUpdates,
            delete: onDeleteOrder

        }

    }
}