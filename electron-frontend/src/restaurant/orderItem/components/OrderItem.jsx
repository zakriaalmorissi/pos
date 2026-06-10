import { useState ,useMemo} from "react";
import style from './order.module.css';
import { CondimentsComponent, LineMarkComponent, OrderItemOptions, NumericKeyBoard } from "../components.jsx";
import { WarningMessage } from "../../../setup/components.jsx";
import { useSelector } from "react-redux";
import Indicator from "../Indicator.jsx";

// this function needs to have a call back function to perform some necessary  updates to the parent component
export function OrderItems() {
    // Need to get bill updated according the ui the order events
    const {order, orderItemProcessing, loadOrderItems, resetOrderItemProcessing, orderItemActions} = useOrderHook();
    const {orderItems} = useSelector( s => s.orderItems)

  
    // Override the client name 
    return  <div className={style.ordersContainer}>
        <div className={style.ordersTopContent}>
            <p>{order?.name}</p>
        </div>
         <div className={style.orderItemsList}>
                {
                    orderItems?.map((orderItem)=> {
                       return <OrderCard 
                            key={orderItem?.id}
                            orderItem={orderItem}
                            order={order}
                            orderItemActions = {orderItemActions}
                        />
                    })
                }
            </div>
        <div className={style.ordersBottomContainer}>
    
            <Indicator 
                processingModel={orderItemProcessing}
                resetState={resetOrderItemProcessing}
                callbacks={{retryFetch: loadOrderItems}}
            />
        </div>
    </div>
}


function OrderCard({order, bill, orderActions}) {
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
        if (order.isOrdered) {
            setWarningModel({
                show: true,
                message: `The ${order.name} is already delivered. Are you sure you want to delete this item ?`,
            })
           
        } else {
            onDeleteOrder();
        }
    }


    const popUpViews = useMemo(()=> {
        if (!activePopUp) return null; // Don't do any thing if there is no any call for these components
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
            <div className={style.orderCardHeader}>
                <label htmlFor="orderTime">Ordered:</label>
                <p> {order.orderedAt} </p>
                {  
                    order.orderedAt !== order.updatedAt && <div
                        style={
                            {
                                "width": "30%",
                                "display": "flex",
                                "gap": "0.5rem"
                            } 
                    }    
                >
                    <label htmlFor="updateTime">Updated:</label>
                    <p>{order.updatedAt}</p>
                </div>
                }
                
            </div>
            <div
                type="submit"
                onClick={()=> setActivePopUp("order-options")}
                className={style.orderBody}  >
                <p className={style.orderQuntity}>{order.quantity}</p>
                <div className={style.orderBodyContainer} >
                    <div  className={style.content} style={{
                    
                    }}> 
                        <p className={style.orderName}>{order.name}</p> 
                        <p className={style.orderPrice}>{order.totalPrice.toFixed(2)}</p>
                        <p className={style.orderStatus}>{order.status === "dine in"? "D" : "T"}</p>
                    </div> 
                    <div>
                    {
                        order.hasTable &&  <p>{order.status === "take out"? "** " + order.status: null}</p>
                    }
                    <div>
                        {
                            bill?.precentageDiscount > 0.00 && <p>discount: {bill?.precentageDiscount} % off</p>
                        }
                        {
                            order.condiments.map((con)=> <p key={con}>- {con}</p>)
                        }
                    </div>
                </div>       
                </div>
              

            </div>
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
