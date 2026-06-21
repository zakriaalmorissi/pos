import { url } from "../../network/constants";

const business = {id: 1};
export const cleanOrderItem = (orderItem) => {
    if (!orderItem) return;
        // Create a formatter for relative time
    function getRelativeTime(ms) {
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
        if (!ms) return; 
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(ms / (1000 * 60));
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);  // Approximate
        const years = Math.floor(days / 365);  // Approximate

        if (seconds < 60) return rtf.format(-seconds, 'second');
        if (minutes < 60) return rtf.format(-minutes, 'minute');
        if (hours < 24) return rtf.format(-hours, 'hour');
        if (days < 30) return rtf.format(-days, 'day');
        if (days < 365) return rtf.format(-months, 'month');
        return rtf.format(-years, 'year');
    }

    const orderItemTime = getRelativeTime(Date.now() - new Date(orderItem.created_at));
    const updateTime = getRelativeTime(Date.now() - new Date(orderItem.updated_at));

  // Return the cleaned orderItem
  return {
          id: orderItem.id,
          name: orderItem.name,
          totalPrice: Number(orderItem.total_price ?? 0),
          unitPrice: Number(orderItem.unit_price ?? 0),
          order: orderItem.order,
          quantity: Number(orderItem.quantity ?? 0),
          status: orderItem.status,
          note: orderItem.note,
          delivered: orderItem.delivered,
          orderItemedAt: orderItemTime,
          updatedAt: updateTime,
      }   

}
 

export const allOrderItemsUrl = (orderId) => {
    // url of the all the items related to a specific order;
    return `${url}orders/${business.id}/${orderId}/order-items`;
}
export const orderItemUrl = (id) => {
    return `${url}orders/${business.id}/order-item-view/${id}/`;
}
export const createOrderItemUrl = (orderId) => {
    return `${url}orders/${business.id}/${orderId}/create-order-item/`;

}

