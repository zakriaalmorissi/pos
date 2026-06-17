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

  
    // Order actions
    const onDeleteOrderItem = async (orderItem) => {
        // Launch Failure if process takes so long 
        const thunk =  dispatch(deleteOrderItem(orderItem?.id))
        await makeAPICrud({
            thunk: thunk,
            status: PROCESSING_STATE.LOADING,
            action: ACTIONS.DELETING,
            message: `Deleting ${orderItem?.name}`,
            updateStateCallback:(values) => setProcessingOrderItemModel(values)
        })
        // Reset the state 
        resetProcessingOrderItemModel();

    }

    const sendOrderItemUpdates = async (orderItem) => {
       const thunk = dispatch(updateOrderItem({orderId: order?.id, data:orderItem})).unwrap();
        await makeAPICrud({
            thunk: thunk,
            status: PROCESSING_STATE.LOADING,
            action: ACTIONS.UPDATING,
            message: `Updating the ${orderItem?.name} item`,
            updateStateCallback: (values) => setProcessingOrderItemModel(values)
        });
        resetProcessingOrderItemModel();
    }

    const createNewOrderItem = async (orderItem) => {
        const thunk = dispatch(createOrderItem({data: orderItem}));
        await makeAPICrud({
            thunk: thunk,
            status: PROCESSING_STATE.LOADING,
            action: ACTIONS.CREATING,
            message: `Creating the ${orderItem?.name} item`,
            updateStateCallback: (values) => updateStateCallback(values)
        })
        resetProcessingOrderItemModel();
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