import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, deleteOrder, updateOrder, createOrder } from "../../../../dataProvider/orderProvider/orderSlice";
import { ORDER_STATES, PROCESSING_STATE } from "./constants";
import { cleanBill } from "../../../../dataProvider/billProvider/billSilce";




export default function useOrderHook () {
    const { bill } = useSelector( s => s.bill);
    const dispatch = useDispatch();
    const [processingOrderModel, setProcessingOrderModel] = useState({
            status: PROCESSING_STATE.IDLE,
            action: null,
            message: null,

    });
    


    // Get the orders
    useEffect(()=> {
            loadOrders();
    }, [bill?.id]);

    const resetProcessingOrderModel = () => {
        setProcessingOrderModel({
                status: PROCESSING_STATE.IDLE,
                action: null,
                message: null,
                         
            })
    }


    const launchProcessingModel = ({action, message, time}) => {
       return setTimeout(() => {
            setProcessingOrderModel({
               status: PROCESSING_STATE.LOADING,
               action: action,
               message: message,

            })
        }, time? time:300);
    }

    const launchProcessingFailure = ({action, message, time}) => {
        // This is gonna be launched if the request takes so long to respone
        return setTimeout(()=> {
            setProcessingOrderModel({
                status: PROCESSING_STATE.ERROR,
                action: action,
                message: message
            })
        },time? time: 6000)
    }



    const loadOrders = async () => {
        if (!bill) return;
        const timer = launchProcessingModel({
            action: ORDER_STATES.GETTING,
            message: "Getting orders ..",
            time: 600
        })
        const errorTimer = launchProcessingFailure({
            action: ORDER_STATES.GETTING,
            message: "Loading orders took so long. Please check your connection",
        })
        try {
            await dispatch(fetchOrders(bill?.id)).unwrap();
            resetProcessingOrderModel();
        } catch (error) {
            setProcessingOrderModel({
                status: PROCESSING_STATE.ERROR,
                action: ORDER_STATES.GETTING,
                message: `Failed to load orders. ${error?.hint ?? ""}`

            })
        } finally {
            clearTimeout(timer);
            clearTimeout(errorTimer);
        }
    }

  
    // Order actions
    const onDeleteOrder = async (order) => {
       const timer = launchProcessingModel({
        action: ORDER_STATES.DELETING, 
        message: `Deleting ${order?.name}`});
    const errorTimer = launchProcessingFailure({
        action: ORDER_STATES.DELETING,
        message: "Failed to delete. Took so long to respone",
    })
    

        // Launch Failure if process takes so long 
        try {
            await dispatch(deleteOrder(order?.id)).unwrap();
            resetProcessingOrderModel();
        } catch (error) {
            setProcessingOrderModel({
                status: PROCESSING_STATE.ERROR,
                action: ORDER_STATES.DELETING, 
                message: `Failed to delete the order. ${error?.hint ?? ""}`
            });
        } finally {
            clearTimeout(timer);
            clearTimeout(errorTimer)
        }    
    }

    const sendOrderUpdates = async (order) => {
        // Delibrately ignoring to show the process indicator
        const timerError = launchProcessingFailure({
            action: ORDER_STATES.UPDATING,
            message: "Updating order took so long"
        })
        try {
            await dispatch(updateOrder({orderId: order?.id, data:order})).unwrap();
        } catch (error) {
            // Show only failure 
            setProcessingOrderModel({
                status: PROCESSING_STATE.ERROR,
                action: ORDER_STATES.UPDATING,
                message: `Failed to update the order ${error?.hint ?? ""}`,
            })

        } finally {
            clearTimeout(timerError);
        }
    }

    const createNewOrder = async (order) => {
        const timer = launchProcessingModel({
            action: ORDER_STATES.CREATING,
            message: "Creating order .."

        })
        const timerError =  launchProcessingFailure({
            action: ORDER_STATES.CREATING,
            message: "Creating order took so long ..",
            time: 3000,
        })
        try {
            await dispatch(createOrder({data: order})).unwrap();
            resetProcessingOrderModel();
        } catch (error) {
            setProcessingOrderModel({
                status: PROCESSING_STATE.ERROR,
                action: ORDER_STATES.CREATING,
                message: `Failed to create an order. ${error?.hint ?? ""}`
            })
        } finally {
            clearTimeout(timer);
            clearTimeout(timerError);
        }

    }


    return {
        bill: cleanBill(bill),
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