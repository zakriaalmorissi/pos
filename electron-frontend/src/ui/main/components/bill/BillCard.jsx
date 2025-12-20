import { Printer } from "lucide-react";
import './style/billCard.css'


export default function BillCard ({onPress, bill}) {
   return <div className="billCardContainer">
        <div 
            className="billCardContent"
            onClick={() => onPress(bill)}
            >
                <p>Ref: {bill.id}</p>
                <p> Client: {bill.name}</p>
                <p>Total: {bill.final_price?.toFixed(2)}</p>
        </div>
        <div className="billCardPrinter">
            <Printer/>
        </div>
    </div>
}