import { Printer } from "lucide-react";
import './style/orderCard.css'


export default function OrderCard ({onPress, order}) {
   return <div className="orderCardContainer">
        <div 
            className="orderCardContent"
            onClick={() => onPress(order)}
            >
                <p>Ref: {order.id}</p>
                <p> Client: {order.name}</p>
                <p>Total: {order.final_price?.toFixed(2)}</p>
        </div>
        <div className="orderCardPrinter">
            <Printer/>
        </div>
    </div>
}