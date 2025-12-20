import { useState , useEffect, useContext} from "react";
import style from './order.module.css';
import { LoadingSpinner } from "../components.jsx";
import { CondimentsComponent, LineMarkComponent, OrderOptions, NumericKeyBoard } from "../components.jsx";
import { WarningMessage, ProcessingIndicator, TimeoutErrorMessageIndicator } from "../../../components/components.jsx";
import { useSelector, useDispatch } from "react-redux";
import { updateOrder, deleteOrder, writeOrderNotes, cleanOrder, fetchOrders } from "../../../../dataProvider/orderProvider/orderSlice.js";
import { fetchBill } from "../../../../dataProvider/billProvider/billSilce.js";



// this function needs to have a call back function to perform some necessary  updates to the parent component
export function Orders() {
    // Need to get bill updated according the ui the order events
    const {bill} =  useSelector(s => s.bill);
    const {orderError } = useSelector(s => s.order);
    const dispatch = useDispatch();
    const {orders, orderLoading } = useSelector( s => s.order)

    useEffect (() => {
        if (!bill?.id) return;
        dispatch(fetchOrders(bill?.id))
    }, [bill?.id,])

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
                        <p>{bill?.orders_length}</p>
                        <p className={style.subtotal}>{bill?.total}</p>
                    </div>
                    <div className={style.valuesContent}> 
                        <p>{bill?.read_only_discount.toFixed(2)}</p>
                        <p>{bill?.service_charge.toFixed(2)}</p>
                        <p>{bill?.tax.toFixed(2)}</p>
                        <p className={style.total}>{bill?.final_price.toFixed(2)}</p>
                    </div> 
                </div>

            }
            {orderError && <TimeoutErrorMessageIndicator message={orderError?.message}/>}
        </div>
    </div>
}


function OrderCard({order}) {
    const [activePopUp, setActivePopUp] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [warningModel, setWarningModel] = useState({ 
        show: false,
        message: "",
        data: null,
        onContinue: null
    });
    const [errorMessageModel, setErrorMessageModel] = useState({
        show: false,
        message: null,
        onIgnore: null,
    })


    const { bill } = useSelector( s => s.bill);
    const dispatch = useDispatch();

    
    const hideWarning = () => {
        setWarningModel({
            show: false,
            data: null,
            message: "",
            onContinue: null
        })
    }

    const hideErrorMessage = ()=> {
        setErrorMessageModel({
            show: false,
            message: null,
            onIgnore: null,
        })

    }

    const hideProcessingIndicator  = ()=> {
        // As long as error message is embeded withen the process indicator we are gonna hide both
        setIsProcessing(false);
        hideErrorMessage();
    }

    // Manage order Deleting // Bill related 
    const processOrderDelete = () => {
        if (order.isOrdered) {
            setWarningModel({
                show: true,
                message: `The ${order.name} is already delivered . Are you sure you want to delete this item ?`,
                data: order,
                onContinue:  onDeleteOrder,
            })
            return;
        }
        // If the order is not delivered, call the delete fun without warning
        onDeleteOrder();
    }


    // Order modification and managements
    const onDeleteOrder = async () => {
        hideWarning();
        setIsProcessing(true);
        setActivePopUp("");
        try {
            await dispatch(deleteOrder(order?.id)).unwrap();
            await  dispatch(fetchBill(bill?.id)).unwrap();
            setIsProcessing(false);

        } catch (error) {
            setErrorMessageModel({
                message: error.message,
                onIgnore: hideProcessingIndicator
            })
        }     
        
    }

  

    // Overriding the price problem // bill related 
    const overridePrice = (value)=> {
        dispatch(updateOrder({orderId: order?.id, data:{price: value}}),);
        dispatch(fetchBill(bill?.id));
        setActivePopUp("");
        
    }

    // Overriding the quantity -> bill related 
    const overrideQuantity = async (number) => {
        setActivePopUp("");
        if (number === order?.quantity) {
            return;
        }
        // if the order update went succefully , refetch the bill
        try {

            await dispatch(updateOrder({orderId: order?.id, data: { quantity: number}})).unwrap();
            dispatch(fetchBill(bill?.id)).unwrap();

        } catch (err) {
            console.log(err)
        }

    }


    // Handle line mark and add condiments functionalities 
    const getOrderNotes =  async (values) => {
        const condiments = Object.values(values).filter(value => value !== "").join("," + '\n');
        if (condiments === "") {
            setActivePopUp("");
            return;
        }

        try {

        // Send the update to the backend
        const updated = await dispatch(updateOrder({
            orderId: order?.id, 
            data: {condiments: condiments}
            })).unwrap();

        // Update the current state after successfully update
        const cleanedOrder = cleanOrder(updated.data);
        dispatch(writeOrderNotes(cleanedOrder));

        } catch (err) {
            setErrorMessageModel({
                            show: true,
                            message: `Ooops.. Failed to make add condiment due to ${err.message}`,
                            onIgnor: null,
                        })
        }
        // 
        setActivePopUp("");   
    }


    const popUpViews = {
            "order-options": (
                <OrderOptions 
                    onDelete={processOrderDelete}
                    overridePrice={()=> setActivePopUp("numeric-keyboard")}
                    lineMark={()=> setActivePopUp('line-mark')}
                    addCondiments={()=> setActivePopUp('condimentsComponent')}
                    overrideQuantity={overrideQuantity}
                    order={order}
                    navigateBack={() => setActivePopUp("")}
                
                />
            ),
            condimentsComponent: (
                <CondimentsComponent 
                    order={order}
                    onBack={()=> setActivePopUp("")}
                    onSave={getOrderNotes}
                
                />
            ),
            "line-mark": (
                <LineMarkComponent
                    onBack={()=> setActivePopUp('')}
                    onSave={getOrderNotes}
                />),
            "numeric-keyboard": (
                <NumericKeyBoard 
                    value={order?.price}
                    onSave={overridePrice}
                    onCancel={()=> setActivePopUp("")}
                    title={"Override Price"}
                
                />
            )
    
    }
    return <div className={style.orderCard}>
        <div>
            <div className={style.orderCardHeader}>
                <label htmlFor="orderTime">Ordered:</label>
                <p> {order.orderedAt} </p>
                {  order.orderedAt !== order.updatedAt && <div
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
                onContinue={warningModel.onContinue}
                message={warningModel.message}
                />
        }  
        {
            isProcessing && <ProcessingIndicator 
                isLoading={isProcessing}
                message={errorMessageModel.message}
                onIgnore={errorMessageModel.onIgnore}
            
            />
        } 
        {
            errorMessageModel.show && <TimeoutErrorMessageIndicator message={errorMessageModel.message}/>
        }
      
    </div>


}
