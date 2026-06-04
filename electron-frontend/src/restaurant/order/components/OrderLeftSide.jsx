import { useState } from "react";
import {CircleDollarSignIcon,MenuIcon, Save, ShoppingCart, SquareCheckBig, } from "lucide-react";
import { DiscountComponent, OrderOptions } from "../components.jsx";
import style from './style/order.module.css';
import { WarningMessage } from "../../../components/components.jsx";

 export function OrderLeftSide ({handleOrderDiscount, createNewOrder, deleteAllOrderItems, order}) {
    const [popUpView, setActivePopUpView] = useState("");
   
    const onCreateNewOrder = () => {
        if (createNewOrder && typeof createNewOrder === "function" ) {
            setActivePopUpView("");
            createNewOrder();
        }
    }

    const onOrderDiscount = (data) => {
        setActivePopUpView("");
        handleOrderDiscount(data);
    }

    const onDeleteAllOrderItems = () => {
        setActivePopUpView("");
        // Process the delete callback
        deleteAllOrderItems();
    }


    // Views 
    const menuOptions = () => {
        switch(popUpView){
            case "discount":
                return (<DiscountComponent 
                    onBack={()=> setActivePopUpView("menuOptions")}
                    onSubmit={onOrderDiscount}
                    Order={order}
                    />);
            case "menu-options": 
                return (
                    <OrderOptions
                        createOrder={onCreateNewOrder}
                        onBack={()=> setActivePopUpView("")}
                        OrderDiscount={()=> setActivePopUpView("discount")}
                        viodAll={()=> setActivePopUpView("warningMessage")}
                    />);

            case "warningMessage": 
               return (<WarningMessage 
             message={"This is gonna delete all of the orders !!"} 
             onCancel={()=> setActivePopUpView("menu-options")}
             onContinue={onDeleteAllOrderItems}
            />);
            default: return null;
            

        }
    }   
    

    return  <div className={style.orderSideContainer}>
                    <div className={style.sideContents}>
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
