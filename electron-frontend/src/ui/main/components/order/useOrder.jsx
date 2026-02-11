import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, deleteOrder, updateOrder, createOrder } from "../../../../dataProvider/orderProvider/orderSlice";
import { ORDER_STATES } from "./constants";import { TABLE_STATES } from "../../../../network/constants";
;




export default function useOrderHook () {
    const { bill } = useSelector( s => s.bill);
    const dispatch = useDispatch();
    const [processingOrderModel, setProcessingOrderModel] = useState({
        type: null,
        processing: false,
        processingMessage: null,
        failure: false,
        failureMessage: null,

    });
    

    
    const cleanBill = (bill) => {
        if (!bill) return null;
        return  {
            id: bill?.id,
            name: bill?.name,
            ordersLength: bill?.orders_length,
            discount: Number(bill?.read_only_discount)?.toFixed(2),
            serviceCharge: Number(bill?.service_charge).toFixed(2),
            tax: Number(bill?.tax).toFixed(2),
            total: Number(bill?.total),
            finalPrice: Number(bill?.final_price).toFixed(2)
        }
    }


    // Get the orders
    useEffect(()=> {
            loadOrders();
    }, [bill?.id]);

    const resetProcessingOrderModel = () => {
        setProcessingOrderModel({
                type: null,
                processing: false,
                processingMessage: null,
                failure: false,
                failureMessage: null,
            })
    }


    const lanchProcessingModel = ({action, message, time}) => {
       return setTimeout(() => {
            setProcessingOrderModel({
                type: action, 
                processing:true,
                processingMessage: message,
                failure: false,
                failureMessage: null

            })
        }, time? time:200);
    }

    const loadOrders = async () => {
        if (!bill) return;
        const timer = lanchProcessingModel({
            action: ORDER_STATES.GETTING,
            message: "Getting orders ..",
            time: 600
        })
        try {
            await dispatch(fetchOrders(bill?.id)).unwrap();
            clearTimeout(timer);
            resetProcessingOrderModel();
        } catch (error) {
            setProcessingOrderModel(prev => ({
                ...prev,
                processing: false,
                processingMessage: null,
                failure: true,
                failureMessage: `Failed to load orders. ${error?.hint ?? ""}`

            }))
        }
    }


  

    // Order actions
    const onDeleteOrder = async (order) => {
       const timer = lanchProcessingModel({
        action: ORDER_STATES.DELETING, 
        message: `Deleting ${order?.name}`});

        // Launch Failure if process takes so long 
        try {
             await dispatch(deleteOrder(order?.id)).unwrap();
            clearTimeout(timer);
            resetProcessingOrderModel();
        } catch (error) {
            setProcessingOrderModel({
                type: ORDER_STATES.DELETING, 
                processing: false,
                processingMessage: null,
                failure: true,
                failureMessage: `Failed to delete the order. ${error?.hint ?? ""}`
            });
        }     
    }

    const sendOrderUpates = async (order) => {

        try {
            await dispatch(updateOrder({orderId: order?.id, data:order})).unwrap();
            resetProcessingOrderModel();
        } catch (error) {
            setProcessingOrderModel(prev => ({ ...prev,
                processing: false,
                failure: true, 
                failureMessage: `Failed to update order. ${error?.hint ?? ""}`
             }))
        }
    }

    const createNewOrder = async (order) => {
        try {
            await dispatch(createOrder({data: order})).unwrap();
            resetProcessingOrderModel();
        } catch (error) {
            setProcessingOrderModel(prev => ({ ...prev,
                processing: false,
                failure: true, 
                failureMessage: `Failed to create order. ${error?.hint ?? ""}`
             }))

        }

    }



    return {
        bill: cleanBill(bill),
        loadOrders: loadOrders,
        orderProcessing: processingOrderModel,
        resetOrderProcessing: resetProcessingOrderModel,
        orderActions: {
            create: async (order) => await createNewOrder(order),
            delete: async (order) =>  await onDeleteOrder(order),
            update: async (order) => await sendOrderUpates(order),

        }

    }
}