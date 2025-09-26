import {useState } from "react";
import {CircleDollarSignIcon,MenuIcon, Save, ShoppingCart, SquareCheckBig, } from "lucide-react";

import { postData, updateData } from "../../../network/api.ts";
import { url } from "../../../network/constants.js";
import style from './../style/table.module.css';
import { DiscountComponent, LoadingSpinner, BillOptions } from "./components.jsx";
import { Menu } from "./Menu.jsx";
import { Orders } from "./Order.jsx";;
import { ProcessingIndicator, TimeoutErrorMessageIndicator} from '../../components/components.jsx';
import { useDispatch, useSelector } from "react-redux";
import { createBill, fetchBill } from "../../dataProvider/billProvider/billSilce.js";

import { createOrder } from "../../dataProvider/orderProvider/orderSlice.js";






 export function Bill({ 
    table,
    handleCompleteAction,
    orderStatus,
    handlePaymentAction,
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


    // Handle bill form submittion
    async  function handleBillCreation (formData) {
        let data = formData;
        data.table = table.id;
        dispatch(createBill(data));
    }


    // Perform the order action
    const handleOrder = async (order) => {
        const status = orderStatus === "Table service"? "dine in": "take out";
        let newData = {table: table?.id, bill: bill?.id, status: status}
        order = {...order, ...newData};
        dispatch(createOrder({data: order, billId: bill?.id}));
        // Update the table status
        console.log(table);
        
    }
    const creatNewBill  = () => {
    
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
                createBill={creatNewBill}
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
