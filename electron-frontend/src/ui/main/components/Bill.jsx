import {useState } from "react";
import {CircleDollarSignIcon,MenuIcon, Save, ShoppingCart, SquareCheckBig, } from "lucide-react";

import {  updateData } from "../../../network/api.ts";
import { url } from "../../../network/constants.js";
import style from './../style/table.module.css';
import { DiscountComponent, BillOptions } from "./components.jsx";
import { Menu } from "./Menu.jsx";
import { Orders } from "./Order.jsx";;
import { ProcessingIndicator, TimeoutErrorMessageIndicator} from '../../components/components.jsx';
import { useDispatch, useSelector } from "react-redux";
import { createBill, fetchBill } from "../../dataProvider/billProvider/billSilce.js";

import { createOrder } from "../../dataProvider/orderProvider/orderSlice.js";
import { updateTables } from "../../dataProvider/tablesProvider/tablesProvider.js";






 export function Bill({ 
    table,
    handleCompleteAction,
    orderStatus,
    handlePaymentAction,
    creatNewBill
 }) {
    // need to get bill updated 
    const dispatch = useDispatch();
    const {bill, creatingBillError} = useSelector((state)=> state.bill);

    // Manage views 
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMeassageModel, setErrorMessageModel] = useState({
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
    const handleOrder = async (order) => {
        const status = orderStatus === "Table service"? "dine in": "take out";
        let newData = {table: table?.id, bill: bill?.id, status: status}
        order = {...order, ...newData};
        dispatch(createOrder({data: order, billId: bill?.id}));
        if (table.billIds.length === 0) {
            updateTable();
        } else {
            /// Find the bill id in the table's bill ids
            const Id = table.billIds.find(id => id ===  bill?.id) || null;
            if (!Id) {
                updateTable();
            }

        } 
    }

    const updateTable = () => {
        // Update the bill list in the table
        const billIds = [ ...(table.billIds || [])]
        billIds.push(bill?.id);
        // Update the counted bills 
        const countedBills = billIds.length;
        // Update the table state 
        const hasOrders = table.hasOrders || true;

        const newTable = {...table, billIds: billIds, hasOrders: hasOrders, countedBills: countedBills};
        dispatch(updateTables(newTable));
    }



    // Bill discount action 
    const handleBillDiscount = async (value) => {
        hideErrorMessage();
        setIsProcessing(true);
        // update the bill discount value 
        const billUrl =  `${url}api/bill/${bill?.id}/`;
        await updateData(billUrl, {
            data: {discount: value},
            callbacks: {
                getResponse: (response) => {
                    setIsProcessing(false);
                },
                apiError: (responseError) => {
                    setErrorMessageModel({
                        show: true,
                        type: null,
                        message: `Oooh .. Failed to make a discount due to ${responseError.message}`,
                        onHide: hideProcessingIndicator

                    })

                }
            }
        })
       

    }

    // share the list of the orders, and the bill from here
   return <div className={style.mainBillContainer}>
        <div className={style.billContainer}>
                <BillLeftSide 
                    creatNewBill={creatNewBill} 
                    handleBillDiscount = {handleBillDiscount}
                     />
                    <Orders />
                <Menu handleOrder={handleOrder}/> 
            
        </div>
        <div className={style.billBottomDev}>
            <button 
                className={style.completeButton}
                type="submit"
                onClick={handleCompleteAction} >
                <Save size={40}/>
                <p>Complete</p>
            </button>
            <button className={style.paymentButton}>
                <ShoppingCart size={41}/>
                <p>Payment</p>
            </button>

        </div>
        {
            isProcessing && <ProcessingIndicator
                isLoading={isProcessing}
                message={errorMeassageModel.message}
                onIgnore={errorMeassageModel.onHide}

            />

        }  
    </div>

 }

 function BillLeftSide ({handleBillDiscount, creatNewBill}) {
    const [popUpView, setActivePopUpView] = useState("");
    
    const onCreateNewBill = () => {
        setActivePopUpView("");
        creatNewBill();
    }


    // Views 
    const views = {
        discount: (
            <DiscountComponent 
                onBack={()=> setActivePopUpView("")}
                onSubmit ={handleBillDiscount}
            />
        ),
        "menu-options": (
            <BillOptions 
                createBill={onCreateNewBill}
                onBack={()=> setActivePopUpView("")}
                billDiscount={()=> setActivePopUpView("discount")}
            
            />
        )
    }
    
    

    return  <div className={style.billSideContainer}>
                    <div className={style.sideDevContents}>
                        <button  onClick={()=> setActivePopUpView("menu-options")}>
                            <MenuIcon size={40}/>
                        </button>
                        <button>
                            <SquareCheckBig size={33}/>
                        </button>
                        <button>
                            <CircleDollarSignIcon size={35}/>    
                        </button>
            </div>
            {views[popUpView]}
                   
                 
        </div>


 }
