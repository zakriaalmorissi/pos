import { useRef, useState } from "react";
import { Save, ShoppingCart } from "lucide-react";
import style from './style/bill.module.css';
import { Menu } from "./Menu.jsx";
import { Orders } from "../order/Order.jsx";;
import { ProcessingIndicator, TimeoutErrorMessageIndicator, TimeoutMessageIndicator} from '../../../components/components.jsx';
import { useDispatch, useSelector } from "react-redux";
import { clearOrders, createOrder } from "../../../../dataProvider/orderProvider/orderSlice.js";
import { updateTables } from "../../../../dataProvider/tablesProvider/tablesProvider.js";
import { fetchBill, updateBill, clearBill } from "../../../../dataProvider/billProvider/billSilce.js";
import { deleteData } from "../../../../network/api.js";
import { url } from "../../../../network/constants.js";
import { updateTakeOutBill } from "../../../../dataProvider/takeOutBillsProvider/takeOutBillsProvider.js";
import { BillLeftSide } from "./BillLeftSide.jsx";

 export function Bill({ 
    table,
    handleCompleteAction,
    orderStatus,
    handlePaymentAction,
    creatNewBill
 }) {
    // need to get bill updated 
    const dispatch = useDispatch();

    const queuingOrders = useRef([]);

    const {bill} = useSelector( s => s.bill)

     const {orders,} = useSelector( s => s.order)
    // Manage views W
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOrdering, setIsOrdering ] = useState(false);

    const [errorMessageModel, setErrorMessageModel] = useState({
        show: false,
        type: null,
        message: null,
        onHide: null,
    })

    const hideErrorMessage  = () => {
        setErrorMessageModel({
            show: false,
            type: null,
            message: null,
            onHide: null,
        })
    }



    const hideProcessingIndicator  = ()=> {
        // As long as error message is embeded withen the process indicator we are gonna hide both
        hideErrorMessage();
        setIsProcessing(false);
    }



    // Perform the order action
    const handleOrder = async (value) => {
        let { order, timer} = beforMakingOrder(value);
        try {
            await dispatch(createOrder({data: order})).unwrap();
         
        } catch (err) {
            setErrorMessageModel({
                show: true,
                type: "creatingOrderError",
                message: `Ooops.. Failed to make an order ! ${err.message} `,
                onHide: null

            })
            
        } finally {
         
            // Remove the order from the queuing list 
            const storedOrder =  queuingOrders.current.findIndex(ordr => ordr.id === order.id )
            if  (storedOrder !== -1) queuingOrders.current.splice(storedOrder, 1);
        }


        try {
            await dispatch(fetchBill(bill?.id)).unwrap();

        } catch (err) {
            // Reset the bill if sth went wrong
            resetBill();
        } finally {
            afterMakingOrder(timer);
        }
      
     

    }

    const beforMakingOrder = ( value ) => {
        queuingOrders.current.push(value)
        //  If the order takes long time to be posted, display an indicator 
      
        const timer = setTimeout(()=> {
             setIsOrdering(true);
        }, 600);

        hideErrorMessage()
        const status = orderStatus === "Table service"? "dine in": "take out";
        let newData = {table: table?.id, status: status, bill: bill?.id }
        let order = {...value, ...newData};

        return {
            order,
            timer,
          
        }

    }

    const afterMakingOrder = (timer, ) => {
        clearTimeout(timer);
        setIsOrdering(false); 

        // Break the process if the table doesn't exist 
        if (!table ) return;
        // Then check if the current bill doesn't exist in the table's billIds list 
        const findbill = table.bills.find((bl) => bl.id === bill?.id);
        if (!findbill) {
            updateTable();
        }

    }

    const updateTable = () => {
        // Update the bill list in the table
        const bills = [ ...(table.bills || [])]
        bills.push(bill);

        // Update the counted bills 
        const countedBills = bills.length;
        // Update the table state 
        const hasOrders = table.hasOrders || true;

        const newTable = {...table, bills: bills, hasOrders: hasOrders, countedBills: countedBills};
        dispatch(updateTables(newTable));
    }



    // Bill discount action 
    const handleBillDiscount = async (value) => {
        setIsProcessing(true);
        try {
            await dispatch(updateBill({billId: bill?.id, data: {discount: value}})).unwrap();
            hideProcessingIndicator();
            dispatch(fetchBill(bill?.id));

        } catch (err) {
            console.log(err)
    
            setErrorMessageModel({
                        show: true,
                        type: "Discounting",
                        message: `Oooh .. Failed to make a discount due to ${err.message}`,
                        onHide: hideProcessingIndicator

                })
        }

      
    
    }

    const deleteAllOrders = async () => {
        // Get all the current orders 
        // Set process Indicator 
        setIsProcessing(true);
            Promise.all(
                orders.map( async (order) => {
                    return new Promise((reslove, reject) => {
                        deleteData(
                            `${url}api/order-view/${order.id}/`,
                            {
                                data: {id: order.id},
                                callbacks: {
                                    getResponse: (res) => reslove(res),
                                    apiError: (err) => reject(err)
                                }
                            }
                        )
                    });
                })
            ).then( async (res) => {
                setIsProcessing(false);
                dispatch(clearOrders())
                const bll =  await dispatch(fetchBill(bill?.id)).unwrap();
                // update the table
            }).catch((err) => {
                setErrorMessageModel({
                    show: true,
                    type: "deletingFailure",
                    message: `Faild to delete orders due to ${err.message}`,
                    onHide: hideProcessingIndicator,
                })
            })
    }

    // Sync updates before leaving the bill 
    const onHandleCompletion = () => {
        // If there any queuing orders waiting to be handled , prevent the user from leaving the screen
        if (queuingOrders.current.length > 0) return;
        
        // If the bills has no orders at all , remove it from the table 
        // if the bill has no table, just delete the bill from the backend and remove it from the cache
        if (table) {
            if (bill?.orders_length === 0) {
              
                const bills = table.bills.filter((bl) => bl.id !== bill?.id);
                const hasOrders = bills.length > 0;
                const countedBills = bills.length;
                dispatch(updateTables({id: table.id, bills: bills, hasOrders: hasOrders, countedBills: countedBills}))
        

            }
            
        } else {
            // Otherwise bill is a takeout bill 
            dispatch(updateTakeOutBill(bill))
        }

        
        // complete the process
        handleCompleteAction()
        // Clear out all orders and bill data from the cache
        resetBill()
     
    }


    const resetBill = () => {
        dispatch(clearBill())
        dispatch(clearOrders())
    }


    const errorIndicator = {
        creatingOrderError: (errorMessageModel.type === "creatingOrderError" 
           && <TimeoutErrorMessageIndicator message = {errorMessageModel.message}/>),
        deletingFailure: (errorMessageModel.type === "deletingFailure"
            && <TimeoutErrorMessageIndicator message={ errorMessageModel.message}/>
         ),
        
    }



   return <div className={style.mainBillContainer}>
      
        <div className={style.billContainer}>
                <BillLeftSide 
                    creatNewBill={creatNewBill} 
                    handleBillDiscount = {handleBillDiscount}
                    deleteAllOrders={deleteAllOrders}
                    bill={bill}
                     />
                    <Orders />
                <Menu handleOrder={handleOrder}/> 
            
        </div>
        <div className={style.billBottomDev}>
            <button 
                className={style.completeButton}
                type="submit"
                onClick={onHandleCompletion} >
                <Save size={40}/>
                <p>Complete</p>
            </button>
            <button className={style.paymentButton}>
                <ShoppingCart size={41}/>
                <p>Payment</p>
            </button>

        </div>
        {
            isProcessing  && <ProcessingIndicator
                isLoading={isProcessing}
                message={errorMessageModel.message}
                onIgnore={errorMessageModel.onHide}

            />

        } 
        {
            errorIndicator.creatingOrderError || 
            errorIndicator.deletingFailure
        }
        {
            isOrdering && <TimeoutMessageIndicator message={" Making Order ....."} />
        }
      
    </div>

 }
