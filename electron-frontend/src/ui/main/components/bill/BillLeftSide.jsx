import { useState } from "react";
import {CircleDollarSignIcon,MenuIcon, Save, ShoppingCart, SquareCheckBig, } from "lucide-react";
import { DiscountComponent, BillOptions } from "../components.jsx";
import style from './style/bill.module.css';
import { WarningMessage } from "../../../components/components.jsx";

 export function BillLeftSide ({handleBillDiscount, creatNewBill, deleteAllOrders, bill}) {
    const [popUpView, setActivePopUpView] = useState("");
   
    const onCreateNewBill = () => {
        setActivePopUpView("");
        creatNewBill();
    }

    const onBillDiscount = (data) => {
        setActivePopUpView("");
        handleBillDiscount(data);
    }

    const onDeleteAllOrders = () => {
        setActivePopUpView("");
        // Process the delete callback
        deleteAllOrders();
    }


    // Views 
    const views = {
        discount: (
            <DiscountComponent 
                onBack={()=> setActivePopUpView("")}
                onSubmit ={onBillDiscount}
                bill={bill}
            />
        ),
        "menu-options": (
            <BillOptions 
                createBill={onCreateNewBill}
                onBack={()=> setActivePopUpView("")}
                billDiscount={()=> setActivePopUpView("discount")}
                viodAll={()=> setActivePopUpView("warningMessage")}
            
            />
        ),
        "warningMessage": <WarningMessage 
             message={"This is gonna delete all of the orders !!"} 
             onCancel={()=> setActivePopUpView("menu-options")}
             onContinue={onDeleteAllOrders}
        />
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
