import { useState, useMemo} from "react";
import style from './order.module.css';
import { WarningMessage } from "../../../setup/components.jsx";
import { useSelector } from "react-redux";
import Indicator from "../Indicator.jsx";
import OrderItemOptions from "../../../components/orderItemCom/ItemOptions.jsx";
import { NumericKeyBoard } from "../../../components/components.jsx";
import { managePopsUpsHook, useCardHook } from "../hooks/useCardHook.jsx";
import { ITEM_OPTIONS_POPUP, NOTE_POPUP, NUMERIC_KEYBOARD_POPUP} from "../../../components/constants.js";


export default function OrderItemCard({orderItem}){
    const [activePopUp, setActivePopUp] = useState(null);
    const {createOrderItem, updateOrderItem, deleteOrderItem} = useCardHook();
    const { activePopUp, setActivePopUp, warningModel, setWarningModel, resetItemUIState} = managePopsUpsHook();

    // Manage order Deleting // Bill related 
    const processOrderDelete = () => {
        if (orderItem.deliverd) {
            setWarningModel({show:true, message: "item has been delivered !"});
        } else {
            deleteOrderItem();
            resetItemUIState();
        }
    }
    const updateItem = (data) => {
        resetItemUIState(); // Hides any pop-up or warning message
        updateOrderItem(data);  
    }

    // UI views 
    const popUpViews = useMemo(()=> {
        if (!activePopUp) return null; // Don't do anything if there is no any call for these components
      return  {
            ITEM_OPTIONS_POPUP: (
                <OrderItemOptions
                    onDelete={processOrderDelete}
                    overridePrice={()=> setActivePopUp(NUMERIC_KEYBOARD_POPUP)}
                    lineMark={()=> setActivePopUp(NOTE_POPUP)}
                    overrideQuantity={updateItem}
                    order={orderItem}
                    navigateBack={resetItemUIState}
                />
            ),
            NUMERIC_KEYBOARD_POPUP: (
                <NumericKeyBoard 
                    value={order?.price}
                    onSave={updateItem}
                    onCancel={resetItemUIState}
                    title={"Override Price"}
                />
            )
    }}, [order, activePopUp, orderActions]);
    // Warning components 
    const WarningToast = warningModel.show && 
        <WarningMessage
            title={"Warning !"}
            onCancel={hideWarning}
            onContinue={onDeleteOrder}
            message={warningModel.message}
        />
    
    return <div className={style.orderCard}>
        <ItemHeader orderItem={orderItem}/>
        <ItemBody orderItem={orderItem} onPress={()=>setActivePopUp(ITEM_OPTIONS_POPUP)}/>
        <ItemFooter orderItem={orderItem}/>
        {activePopUp && popUpViews[activePopUp]}
        {WarningToast}  
    </div>
}

function ItemHeader({orderItem}) {
    return <div className="item-card-header">
        <div className="item-creating-time-container">
            <label>ordered:</label>
            <p>{orderItem.createdAt}</p>
        </div>
        {
        orderItem.createdAt !== orderItem.updatedAt && 
            <div className="item-updating-time-container">
                <label>updated:</label>
                <p>{orderItem.updatedAt}</p>
            </div>
        }
    </div>
}

function ItemBody({orderItem, onPress}) {
    return <div
        type="submit"
        onClick={onPress}
        className="item-body-container">
            <p className="item-quantity">{orderItem.quantity}</p>
            <div className="body-content">
                <p className={style.orderName}>{orderItem.name}</p> 
                <p className={style.orderPrice}>{orderItem.totalPrice.toFixed(2)}</p>
                <p className={style.orderStatus}>{orderItem.status === "dine in"? "D" : "T"}</p>
            </div>
        </div>
}

function ItemFooter({orderItem}) {
    return <div className="item-footer">
    </div>
}
