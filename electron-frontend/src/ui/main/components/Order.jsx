import { useState , useEffect} from "react";
import style from './../style/table.module.css';
import { LoadingSpinner } from "./components.jsx";
import { CondimentsComponent, LineMarkComponent, OrderOptions, NumericKeyBoard } from "./components.jsx";
import { WarningMessage, ProcessingIndicator, TimeoutErrorMessageIndicator } from "../../components/components.jsx";
import { useSelector, useDispatch } from "react-redux";
import { fetchOrders, updateOrder, deleteOrder, writeOrderNotes, cleanOrder } from "../../dataProvider/orderProvider/orderSlice.js";
import { fetchBill } from "../../dataProvider/billProvider/billSilce.js";
import { deleteData, updateData } from "../../../network/api.js";
import { url } from "../../../network/constants.js";
import { updateTables } from "../../dataProvider/tablesProvider/tablesProvider.js";


// this function needs to have a call back function to perform some necessary  updates to the parent component
export function Orders() {
    // need to get bill updated according the ui the order events
    const {bill, loading} = useSelector((state) => state.bill);
    const {orders, orderLoading, orderError} = useSelector((state)=> state.order);
    const dispatch = useDispatch();
    
    useEffect(()=> {
        if(!bill) return;
        console.log("Order fetch has been called");
        dispatch(fetchOrders(bill?.id));
    }, [loading, bill?.id]);


    // Override the client name 
    return  <div className={style.ordersContainer}>
        <div className={style.ordersTopContent}>
            <p>{bill?.name}</p>
        </div>
        { orderLoading ? <LoadingSpinner/>: <div className={style.ordersList}>
                {
                    orders?.map((order)=> {
                       return <OrderCard 
                            key={order?.id}
                            value={order}
                        />
                    })
                }
            </div>
        }
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


function OrderCard({value}) {
    const [order, setOrder] = useState(value);
    const [activePopUp, setActivePopUp] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [warningModel, setWarningModel] = useState({ 
        show: false,
        message: "",
        data: null,
        onContinue: null
    });
    const [errorMeassageModel, setErrorMessageModel] = useState({
        show: false,
        message: null,
        onIgnor: null,
    })


    const {bill} = useSelector((state)=> state.bill);
    const { tables } = useSelector(s => s.tables);
    const dispatch = useDispatch();



    useEffect(()=> {setOrder(value)},[value]);
    
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
            onIgnor: null,
        })

    }

    const hideProcessingIndicator  = ()=> {
        // As long as error message is embeded withen the process indicator we are gonna hide both
        setIsProcessing(false);
        hideErrorMessage();
    }

   
  

    // Manage order Deleting // Bill related 
    const processOrderDelete = () => {
        if (!order.isOrdered) {
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
        // Delete the order 
        await deleteData(
            `${url}api/order-view/${order?.id}/`,
            {
                data: {id: order?.id},
                callbacks: {
                    getResponse: (res) => {
                        setIsProcessing(false);
                        dispatch(deleteOrder(res.data));
                        dispatch(fetchBill(bill?.id));
                        updateTheTable();

                    },
                    apiError: (err)=> {
                        setErrorMessageModel(
                            {
                                show:false,
                                message: err.message,
                                onIgnor: hideProcessingIndicator,
                            }
                        )
                    }   
                }
            }
        )
        
    }

    const updateTheTable =  async () => {

        // I can get the table id from the bill 
        // But the bill does not have the table id when it's accesed from the take out section
        // so we will make a condition
        const restBill = await dispatch(fetchBill(bill?.id)).unwrap();
        if (restBill.data || restBill.data.table) {
            // check if the bill has got no orders any more 
            if (restBill.data.orders_length === 0) {
                // remove the bill from the table 
                const tableId = Number(restBill.data.table);
                const table = tables.find(t => t.id === tableId);
                console.log(table)
                const billIds =  table.billIds.filter(id => id !== bill?.id);
                const hasOrders = billIds.length > 0;
                const countedBills =  billIds.length;
                // update the table 
                let neTable =  dispatch(updateTables({...table,
                     billIds: billIds,
                    hasOrders: hasOrders,
                    countedBills: countedBills
                 }))
                
                 console.log(neTable);


            } 
        }

    };
  
        



    // Overriding the price problem // bill related 
    const overridePrice = async (value)=> {
        dispatch(updateOrder({orderId: order?.id, billId: bill?.id, data:{price: value}}),);
        setActivePopUp("");
        
    }

    // Overriding the quantity -> bill related 
    const overrideQuantity = async (number) => {
        if (number === order?.quantity) {
            setActivePopUp("");
            return;
        }
        dispatch(updateOrder({orderId: order?.id, billId: bill?.id, data: { quantity: number}}));
        setActivePopUp("");
    }


    // Hanlde line mark and add condiments functionalities 
    const getOrderNotes = async (values) => {
        const condiments = Object.values(values).filter(value => value !== "").join("," + '\n');
        if (condiments === "") {
            setActivePopUp("");
            return;
        }
        // l'm not gonna call the fetch bill function 
        await updateData(
            `${url}api/order-view/${order?.id}/`,
            {
                data: {condiments: condiments},
                callbacks: {
                    getResponse:(res)=> {
                        const newOrder = cleanOrder(res.data);
                        dispatch(writeOrderNotes(newOrder));
                    },
                    apiError: (err)=> {
                        setErrorMessageModel({
                            show: true,
                            message: `Ooops.. Failed to make add condiment due to ${err.message}`,
                            onIgnor: null,
                        })

                    }
                }
            }
        )
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
                message={errorMeassageModel.message}
                onIgnore={errorMeassageModel.onIgnor}
            
            />
        } 
        {
            errorMeassageModel.show && <TimeoutErrorMessageIndicator message={errorMeassageModel.message}/>
        }
      
     
    </div>


}
