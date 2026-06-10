import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderItems, deleteOrderItem, updateOrderItem, createOrderItem } from "../../../../dataProvider/orderItemProvider/orderItemProvider";
import {ACTIONS, PROCESSING_STATE} from "../../../components/constants"
import {cleanOrder} from '../../../dataProvider/orderProvider/orderSilce';
import {launchIndicatorFailureModel, launchIndicatorModel} from '../../../components/Indicator';




export default function useOrderItemHook () {
    const {order} = useSelector( s => s.order);
    const dispatch = useDispatch();
    const [processingOrderItemModel, setProcessingOrderItemModel] = useState({
            status: PROCESSING_STATE.IDLE,
            action: null,
            message: null,

    });
    const currentRequest = useRef(null);
    
    // Get the orders
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
        console.log("Load order items is called");
        const timer = launchIndicatorModel({
            status: PROCESSING_STATE.LOADING,
            action: ACTIONS.GETTING,
            message: "Getting order items ..",
            time: 600,
            setModel: (values) => setProcessingOrderItemModel(values)
        })
        const errorTimer = launchIndicatorFailureModel({
            status: PROCESSING_STATE.ERROR,
            action: ACTIONS.GETTING,
            message: "Loading order items took so long. Please check your connection",
            setModel: (values) => setProcessingOrderItemModel(values)
        })
        try {
            await thunk.unwrap();
            resetProcessingOrderItemModel();
        } catch (error) {
            if (error?.name === "AbortError") return;
            setProcessingOrderItemModel({
                status: PROCESSING_STATE.ERROR,
                action: ACTIONS.GETTING,
                message: `Failed to load order items. ${error?.hint ?? ""}`

            })
        } finally {
            clearTimeout(timer);
            clearTimeout(errorTimer);
        }
    }

  
    // Order actions
    const onDeleteOrderItem = async (orderItem) => {
       const timer = launchIndicatorModel({
        status: PROCESSING_STATE.LOADING,
        action: ACTIONS.DELETING, 
        message: `Deleting ${orderItem?.name}`,
        setModel: (values) => setProcessingOrderItemModel(values)
    });
    const errorTimer = launchIndicatorFailureModel({
        status: PROCESSING_STATE.ERROR,
        action: ACTIONS.DELETING,
        message: `Failed to delete ${orderItem.name}. Took so long to respone`,
        setModel: (values) => setProcessingOrderItemModel(values)
    })
    

        // Launch Failure if process takes so long 
        try {
            await dispatch(deleteOrderItem(orderItem?.id)).unwrap();
            resetProcessingOrderItemModel();
        } catch (error) {
            setProcessingOrderItemModel({
                status: PROCESSING_STATE.ERROR,
                action: ACTIONS.DELETING, 
                message: `Failed to delete the order item. ${error?.hint ?? ""}`
            });
        } finally {
            clearTimeout(timer);
            clearTimeout(errorTimer)
        }    
    }

    const sendOrderItemUpdates = async (orderItem) => {
        // Delibrately ignoring to show the process indicator
        const timerError = launchIndicatorFailureModel({
            status: PROCESSING_STATE.ERROR,
            action: ACTIONS.UPDATING,
            message: "Updating order item took so long",
            setModel: (values) => setProcessingOrderModel(values),
        })
        try {
            await dispatch(updateOrderItem({orderId: order?.id, data:orderItem})).unwrap();
        } catch (error) {
            // Show only failure 
            setProcessingOrderItemModel({
                status: PROCESSING_STATE.ERROR,
                action: ACTIONS.UPDATING,
                message: `Failed to update the order item ${error?.hint ?? ""}`,
            })

        } finally {
            clearTimeout(timerError);
        }
    }

    const createNewOrderItem = async (orderItem) => {
        const timer = launchIndicatorModel({
            status: PROCESSING_STATE.LOADING,
            action: ACTIONS.CREATING, 
            message: `Creating order  item...`,
            setModel: (values) => setProcessingOrderItemModel(values)

        })
        const timerError = launchIndicatorFailureModel({
            status: PROCESSING_STATE.ERROR,
            action: ACTIONS.CREATING,
            message: "Creating order item took so long ..",
            time: 3000,
            setModel: (values) => setProcessingOrderItemModel(values)
        })
        try {
            await dispatch(createOrderItem({data: orderItem})).unwrap();
            resetProcessingOrderItemModel();
        } catch (error) {
            setProcessingOrderModel({
                status: PROCESSING_STATE.ERROR,
                action: ACTIONS.CREATING,
                message: `Failed to create an order item. ${error?.hint ?? ""}`
            })
        } finally {
            clearTimeout(timer);
            clearTimeout(timerError);
        }

    }


    return {
        order: order,
        loadOrderItems: loadOrderItems,
        orderItemProcessing: processingOrderItemModel,
        resetOrderItemProcessing: resetProcessingOrderItemModel,
        orderItemActions: {
            create: createNewOrderItem,
            update: sendOrderItemUpdates,
            delete: onDeleteOrderItem

        }

    }
}