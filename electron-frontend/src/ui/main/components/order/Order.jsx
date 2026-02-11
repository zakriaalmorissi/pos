import { useState , useEffect, useContext, useMemo} from "react";
import style from './order.module.css';
import { CondimentsComponent, LineMarkComponent, OrderOptions, NumericKeyBoard } from "../components.jsx";
import { WarningMessage, ProcessingIndicator, TimeoutErrorMessageIndicator } from "../../../components/components.jsx";
import { useSelector, useDispatch } from "react-redux";
import { ORDER_STATES } from "./constants.js";
import useOrderHook from "./useOrder.jsx";



// this function needs to have a call back function to perform some necessary  updates to the parent component
export function Orders() {
    // Need to get bill updated according the ui the order events
    const {bill, orderProcessing, loadOrders, resetOrderProcessing, orderActions} = useOrderHook();
    const {orders} = useSelector( s => s.order)

  

    const Indicators = {
        gettingOrders: orderProcessing.type === ORDER_STATES.GETTING && (
            <ProcessingIndicator 
                isLoading={orderProcessing.processing}
                action={orderProcessing.processingMessage}
                errorMessage={orderProcessing.failure && orderProcessing.failureMessage}
                onIgnore={resetOrderProcessing}
                onRetry={loadOrders}
            />),
        onDeleting: orderProcessing.type === ORDER_STATES.DELETING &&(<ProcessingIndicator 
            isLoading={orderProcessing.processing}
            action={orderProcessing.processingMessage}
            errorMessage={orderProcessing.failure && orderProcessing.failureMessage}
            onIgnore={resetOrderProcessing}
        />)
    }
    // Override the client name 
    return  <div className={style.ordersContainer}>
        <div className={style.ordersTopContent}>
            <p>{bill?.name}</p>
        </div>
         <div className={style.ordersList}>
                {
                    orders?.map((order)=> {
                       return <OrderCard 
                            key={order?.id}
                            order={order}
                            bill={bill}
                            orderActions = {orderActions}
                        />
                    })
                }
            </div>
        <div className={style.ordersBottomContainer}>
            <div className={style.titles}>
                <p>Subtotal</p>
                <p>Bill Discount</p>
                <p>Service Charge</p>
                <p>Tax</p>
                <p>Total</p>

            </div>
            {
              bill &&  <div className={style.valuesContainer}>
                    <div className={style.subtotalContainer}> 
                        <p>{bill?.ordersLength}</p>
                        <p className={style.subtotal}>{bill?.total}</p>
                    </div>
                    <div className={style.valuesContent}> 
                        <p>{bill?.discount}</p>
                        <p>{bill.serviceCharge}</p>
                        <p>{bill.tax}</p>
                        <p className={style.total}>{bill.finalPrice}</p>
                    </div> 
                </div>

            }
            {Indicators.gettingOrders}
            {Indicators.onDeleting}
        </div>
    </div>
}


function OrderCard({order, bill, orderActions}) {
    const [activePopUp, setActivePopUp] = useState(null);
    const [warningModel, setWarningModel] = useState({ 
        show: false,
        message: "",
        orderId: null
    });
  
    const hideWarning = () => {
        setWarningModel({
            show: false,
            data: null,
            message: "",
            onContinue: null
        })
    }

    const hideActivePopUp = () => {
        if (!activePopUp)  return; 
        setActivePopUp(null);
    }
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
                message: `The ${order.name} is already delivered . Are you sure you want to delete this item ?`,
                orderId: order?.id
            })
           
        } else {
            onDeleteOrder();
        }
    }





    const popUpViews = useMemo(()=> {
      return  {
            "order-options": (
                <OrderOptions 
                    onDelete={processOrderDelete}
                    overridePrice={()=> setActivePopUp("numeric-keyboard")}
                    lineMark={()=> setActivePopUp('line-mark')}
                    addCondiments={()=> setActivePopUp('condimentsComponent')}
                    overrideQuantity={(ordr)=>  {hideActivePopUp(),orderActions.update(ordr)}}
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
                    value={order}
                    onSave={(ordr) => { hideActivePopUp(); orderActions.update(ordr) }}
                    onCancel={hideActivePopUp}
                    title={"Override Price"}
                
                />
            )
    }}, [order, activePopUp]);

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
                            bill?.discount > 0.00 && <p>discount: {bill?.discount}% off</p>
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
            popUpViews[activePopUp]
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
