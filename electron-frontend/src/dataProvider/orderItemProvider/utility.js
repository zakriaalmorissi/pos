import { cleanOrder } from "../orderProvider/orderServices"
import { overrideOrder } from "../orderProvider/orderSilce";
import { removeOrderItem } from "./orderItemProvider";




export const updateRelatedOrder = (data, dispatch) => {
    // Update the order accordingly, for example when creating, updating, order deleting an order item
    const order = cleanOrder(data.order);
    if (order) {
        dispatch(overrideOrder(order))
    }
    return data;
}


export const updateRelatedOrderWhenDeletingItems = (data, dispatch) => {
    const order = cleanOrder(data.order);
    if (order) dispatch(overrideOrder(order));
    // override order items 
    dispatch(removeOrderItem(data));

    return data;

}