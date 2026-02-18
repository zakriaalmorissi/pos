import { useState } from "react";
import {CircleDollarSignIcon,MenuIcon, Save, ShoppingCart, SquareCheckBig, } from "lucide-react";
import { DiscountComponent, BillOptions } from "../components.jsx";
import style from './style/bill.module.css';
import { WarningMessage } from "../../../components/components.jsx";

 export function BillLeftSide ({handleBillDiscount, createNewBill, deleteAllOrders, bill}) {
    const [popUpView, setActivePopUpView] = useState("");
   
    const onCreateNewBill = () => {
        if (createNewBill && typeof createNewBill === "function" ) {
            setActivePopUpView("");
            createNewBill();
        }
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
    const menuOptions = () => {
        switch(popUpView){
            case "discount":
                return (<DiscountComponent 
                    onBack={()=> setActivePopUpView("menuOptions")}
                    onSubmit={onBillDiscount}
                    bill={bill}
                    />);
            case "menu-options": 
                return (
                    <BillOptions
                        createBill={onCreateNewBill}
                        onBack={()=> setActivePopUpView("")}
                        billDiscount={()=> setActivePopUpView("discount")}
                        viodAll={()=> setActivePopUpView("warningMessage")}
                    />);

            case "warningMessage": 
               return (<WarningMessage 
             message={"This is gonna delete all of the orders !!"} 
             onCancel={()=> setActivePopUpView("menu-options")}
             onContinue={onDeleteAllOrders}
            />);
            default: return null;
            

        }
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
            { menuOptions && menuOptions() }
                   
                 
        </div>


 }
