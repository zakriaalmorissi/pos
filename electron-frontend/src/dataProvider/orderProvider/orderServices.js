import { url } from "../../network/constants";


const business = {id: 1} // temporary feed
export const cleanOrder = (order) => {
    if (!order) return null;
    // Clean the order according to the business type

    return {
        id: order.id,
        name: order.name,
        table: order.table,
        orderItemsLength: order.order_items_length ?? 0,
        discount: Number(order.discount || 0),
        subtotal: Number(order.subtotal || 0),
        total: Number(order.total || 0),
        tax: Number(order.tax || 0),
        status: order.status,
        isPaid: order.is_paid,
        serviceCharge: order.service_charge,
        createdAt: order.created_at,
        updatedAt: order.updated_at,

    }

}


export const orderURL = (orderId) => {
    return `${url}orders/${business.id}/single-order/${orderId}/`;
}

export const createOrderURL = () => {
    return `${url}orders/${business.id}/create-order/`;

}

