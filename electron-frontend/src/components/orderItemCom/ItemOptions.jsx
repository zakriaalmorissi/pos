import { 
    Trash2Icon, CircleDollarSignIcon,
    MessageSquareTextIcon, SaladIcon, AlarmSmokeIcon, 
    Rocket, StepBackIcon,
    DeleteIcon,
    Check,
    FilePlus2,
    Files,
    Save,
    PlusSquare,
    MinusSquare,
} from 'lucide-react'

import { useCallback, useEffect, useState } from 'react'
import { ManageQuantity, PopUpPage } from '../components';
import "../style/style.css"

export default function OrderItemOptions ({ 
    onDelete, 
    overridePrice,
    overrideQuantity,
    addNote,
    navigateBack,
    orderItem,
}) {
    

    const onOverrideQuantity = (value) => {
        if (value === orderItem.quantity) return; 
        overrideQuantity({id: orderItem.id, quantity: value});
    }
    return <PopUpPage onBack={navigateBack}>
        <div 
            className='order-item-options-container'
            onClick={(e) => {e.stopPropagation()}}
        >
            <OptionsHeader orderItem={orderItem}/>
            <OptionsBody 
                orderItem={orderItem}
                onDelete={onDelete}
                overridePrice={overridePrice}
                addNote={addNote}
            />
            <OptionsFooter 
                orderItem={orderItem}
                onBack={navigateBack}
                onSave={onOverrideQuantity}
            />
        </div>
    </PopUpPage>
}


function OptionsHeader({orderItem}) {
    return <div className='options-header'>
        <p>{orderItem?.name}</p>
    </div>
}

function OptionsBody({
    orderItem,
    onDelete, 
    overridePrice,
    addNote,
    fireLater, 
    release
}) {
  
    return <div className='options-body-container'>
            <button 
                onClick={() => onDelete({id: orderItem.id})}
            >
                <Trash2Icon size={42} />
                <p>Void line</p>
            </button>
            <button 
                onClick={overridePrice}
            >
                <CircleDollarSignIcon size={43}/>
                <p>Price override</p>     
            </button>
            <button onClick={addNote}>
                <MessageSquareTextIcon size={43}/>
                <p>Add Notes</p>
            </button>
            <button>
                <AlarmSmokeIcon size={42}/>
                <p>Fire Later</p>
            </button>
            <button>
                <Rocket/>
                <p>Release Fire</p>
            </button>
    </div>

}



function OptionsFooter({orderItem, onBack, onSave}) {
    const [number, setNumber] = useState(orderItem?.quantity? orderItem?.quantity: 0);
    const incrementQuantity = () => {
        setNumber( prev => prev + 1)
    }

    const decrementQuantity = () => {
        if (number <= 1) return;
        setNumber(prev => prev -1);
    }
    return <div className='options-footer'>
        <ManageQuantity 
            number={orderItem?.quantity}
            decrement={decrementQuantity}
            increment={incrementQuantity}
            />
        <div className='options-footer-bottom'>
            <button onClick={onBack}>
                Cancel
            </button>
            <button onClick={()=> onSave(number)}>
                OK
            </button>
        </div>
    </div>

}
