import { useState ,useMemo} from "react";
import style from './order.module.css';
import { CondimentsComponent, LineMarkComponent, OrderItemOptions, NumericKeyBoard } from "../components.jsx";
import { WarningMessage } from "../../../setup/components.jsx";
import { useSelector } from "react-redux";
import Indicator from "../Indicator.jsx";


export default function OrderItemCard({orderItem, order, orderItemActions}) {
    const [activePopUp, setActivePopUp] = useState(null);
    const [warningModel, setWarningModel] = useState({ show: false,message: ""});
  
    const hideWarning = () => {
        setWarningModel({ show:false, message: ""});
    }

    const hideActivePopUp = () => setActivePopUp(null);
    // Order modification and managements
    const onDeleteOrder = async () => {
        hideWarning();
        hideActivePopUp();
        await orderActions.delete(order);

    } 
    // Manage order Deleting // Bill related 
    const processOrderDelete = () => {
        if (order) {
            setWarningModel({
                show: true,
                message: `The ${order.name} is already delivered. Are you sure you want to delete this item ?`,
            })
           
        } else {
            onDeleteOrder();
        }
    }


    const popUpViews = useMemo(()=> {
        if (!activePopUp) return null; // Don't do anything if there is no any call for these components
      return  {
            "order-options": (
                <OrderOptions 
                    onDelete={processOrderDelete}
                    overridePrice={()=> setActivePopUp("numeric-keyboard")}
                    lineMark={()=> setActivePopUp('line-mark')}
                    addCondiments={()=> setActivePopUp('condimentsComponent')}
                    overrideQuantity={(ordr)=> {hideActivePopUp(); orderActions.update(ordr)}}
                    order={order}
                    navigateBack={hideActivePopUp}
                
                />
            ),
            condimentsComponent: (
                <CondimentsComponent 
                    order={order}
                    onBack={hideActivePopUp}
                    onSave={(ordr) => {hideActivePopUp(); orderActions.update(ordr)}}
                
                />
            ),
            "line-mark": (
                <LineMarkComponent
                    order = {order}
                    onBack={hideActivePopUp}
                    onSave={(ordr)=>  {hideActivePopUp(); orderActions.update(ordr)}}
                />),
            "numeric-keyboard": (
                <NumericKeyBoard 
                    value={order?.price}
                    onSave={(price) => { hideActivePopUp(); orderActions.update({...order, price: price}) }}
                    onCancel={hideActivePopUp}
                    title={"Override Price"}
                
                />
            )
    }}, [order, activePopUp, orderActions]);

    return <div className={style.orderCard}>
        <div>
         
        </div>
        {
           activePopUp && popUpViews[activePopUp]
        }
        {
            warningModel.show && <WarningMessage
                title={"Warning !"}
                onCancel={hideWarning}
                onContinue={onDeleteOrder}
                message={warningModel.message}
                />
        }  
    </div>


}

function OrderCardHeader({orderItem}) {
    return <div className="item-card-header">
        <div className="item-creating-time-container">
            <label>ordered:</label>
            <p>{orderItem.createdAt}</p>
        </div>
        {
         orderItem.createdAt !== orderItem.updatedAt && 
            <div className="item-updating-time-container">
                <label>updated:</label>
                <p>{orderItem.updatedAt}</p>
            </div>
        }
    </div>
}

function OrderItemBody({orderItem}) {
    return <div
                type="submit"
                onClick={()=> setActivePopUp("order-options")}
                className={style.orderBody}>
                <p className={style.orderQuntity}>{orderItem.quantity}</p>
                <div className={style.orderBodyContainer} >
                    <div  className={style.content} style={{
                    
                    }}> 
                        <p className={style.orderName}>{orderItem.name}</p> 
                        <p className={style.orderPrice}>{orderItem.totalPrice.toFixed(2)}</p>
                        <p className={style.orderStatus}>{orderItem.status === "dine in"? "D" : "T"}</p>
                    </div> 
                    <div>
 
                    <div>
                        {
                            order?.precentageDiscount > 0.00 && <p>discount: {bill?.precentageDiscount} % off</p>
                        }
                    </div>
                </div>       
                </div>
              

        </div>

}
