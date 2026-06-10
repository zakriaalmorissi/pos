import { OrderItems } from "../../orderItem/components/OrderItem";



export function OrderBody({order}) {
    return <div className="order-body-content">
        <OrderItems/>
        <div className="calculations">
            <div className="calculation-names-container">
                <p>Subtotal</p>
                <p>Order Discount</p>
                <p>Service Charge</p>
                <p>Tax</p>
                <p>Total</p>

            </div>
            <div className="calculation-values-container">
                <p>{order?.subtotal?.toFixed(2)}</p>
                <p>{order?.discount.toFixed(2)}</p>
                <p>{order.serviceCharge.toFixed(2)}</p>
                <p>{order.tax.toFixed(2)}</p>
                <p>{order.total.toFixed(2)}</p>
            </div>
        </div> 
    </div>

}


