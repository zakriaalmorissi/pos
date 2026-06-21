import { makeAPICrud } from "../../../utilities/utiliy";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderItems, deleteOrderItem, createOrderItem, updateOrderItem } from "../../../dataProvider/orderItemProvider/orderItemProvider";
import {ACTIONS, PROCESSING_STATE} from "../../../components/constants"

export function useCardHook () {
    const dispatch = useDispatch();
    const [processingOrderItemModel, setProcessingOrderItemModel] = useState({
            status: PROCESSING_STATE.IDLE,
            action: null,
            message: null,

    });

    const resetProcessingOrderItemModel = () => {
        setProcessingOrderItemModel({
            status: PROCESSING_STATE.IDLE,
            action: null,
            message: null,
        })
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
        createOrderItem: createNewOrderItem,
        updateOrderItem: sendOrderItemUpdates,
        deleteOrderItem: onDeleteOrderItem,
    }
}

export function managePopsUpsHook() {
    const [activePopUp, setActivePopUp] = useState(null);
    const [warningModel, setWarningModel] = useState({show:false, message:""});
    
    const resetItemUIState = () => {
        setActivePopUp(null);
        if (warningModel.show) setWarningModel({show:false, message:""});
    }
    
    return {
        activePopUp,
        setActivePopUp,
        warningModel,
        setWarningModel,
        resetItemUIState
    }
}




