import '../style/loading.css'
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
import '../style/billComponent.css'
import { useCallback, useEffect, useState } from 'react'
import { url } from '../../../network/constants'


export function LoadingSpinner () {
    return <div className="spinner-container">
        <div className="loading-spinner">
        </div>
    </div>
}



export function OrderOptions ({ 
    onDelete, 
    overridePrice,
    overrideQuantity,
    lineMark,
    addCondiments,
    navigateBack,
    order,

}) {

   const [number, setNumber] = useState(order?.quantity);

    const incrementQuantity = () => {
        setNumber( prev => prev + 1)
    }

    const decrementQuantity = () => {
        if (number <= 1) return;
        setNumber(prev => prev -1);
    }

    const onSave = () => {
        overrideQuantity({id: order?.id, quantity: number});
    }
    return <div 
        className='pop-up-page'
        onClick={navigateBack}
        >
        <div className='order-options-container' 
            onClick={(e)=> {e.stopPropagation()}}
        
        >
        <div className='order-options-header'>
            <h3>{order?.name}</h3>
        </div>
        <div className='order-options'>
            <button 
                onClick={onDelete}
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
            <button onClick={lineMark}>
                <MessageSquareTextIcon size={43}/>
                <p>Line mark</p>
            </button>
            <button onClick={addCondiments}>
                <SaladIcon size={40}/>
                <p>Condiments</p>
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
        <div className='manage-quantity-container'>
            <label htmlFor="quantity">Override Quantity:</label>
            <div className='quantity'>
                <button 
                    onClick={decrementQuantity}
                    disabled = {number <= 1}
                >
                    <MinusSquare/>

                </button>
                 <p>{number}</p>
                <button onClick={incrementQuantity}>
                    <PlusSquare/>
                </button>

            </div>

        </div>
        <div className='order-options-bottom'>
            <button onClick={navigateBack}>
                Cancel
            </button>
            <button onClick={onSave}>
                OK
            </button>
        </div>
         

        </div>
       

    </div>

}


export function BillOptions ({
    createBill, 
    viodAll,
    onBack,
    billDiscount
    
}) {

    ///  Menu options component to manipulate the entire list of orders,
    //  and manipulate the bill

    return (
        <div className='pop-up-page'>
            <div className='bill-options-container'>
                <div className='bill-options-header'>
                    <button onClick={onBack}>
                        <StepBackIcon/>
                        <p>Back</p>
                    </button>
                    <h3>Bill Options</h3>
                </div>
                <div className='bill-options-body-container'>
                    <button onClick={billDiscount}>
                        <CircleDollarSignIcon size={40}/>
                        <p>Bill Discount</p>
                    </button>
                    <button onClick={createBill}>
                        <FilePlus2 size={40}/>
                        <p>New Check</p>
                    </button>
                    <button>
                        <Files size={40}/>
                        <p>Bill viewer</p>
                    </button>
                    <button onClick={viodAll}>
                        <Trash2Icon size={40}/>
                        <p>Void All</p>
                    </button>
                </div>

            </div>
        </div>
    )

}


export function NumericKeyBoard({onSave, onCancel, title, value}) {
    const [number, setNumber] = useState(String(value?? 0));
    const numbers = ['1','2','3','4','5','6','7','8','9','0', '00'];

    const onClick = (number) => {
        setNumber(prev => {
            const prevStr = String(prev === 0? '': prev);
            return prevStr + number;
          });
    }

    const onChange = (value) => {
        setNumber(value)
    }

    const decrementPrice = () => {
        if (number === 0) return;
        setNumber(prev => {
            const newValue = prev.slice(0, -1);
            return newValue;
        })
    }



    return <div 
        className='pop-up-page'
        onClick={onCancel}
        
    >
        <div 
            className='keyboard-container'
            onClick={(e) => {e.stopPropagation()}}
        >
            <div className='top-contents'>
                <button 
                    onClick={onCancel}
                >
                    <StepBackIcon  size={35}/>
                    <p>Back</p>
                </button>
                    <h3>{title}</h3>
                </div>
            
        
            <div className='number-input-container'>
                <input 
                    value={number}
                    onChange={(e)=> onChange(e.target.value)}
                />
                <button onClick={decrementPrice}>
                    <DeleteIcon size={38}/>
                </button>
            </div>
            <div className='keyboard-contents'>
                <div className='number-buttons-container' onClick={(e) => e.stopPropagation()}>
                    {
                        numbers.map((number)=> {
                            return <button key={number} onClick={()=> onClick(number)} >{number}</button>
                        })
                    }
                    
                </div>
                <div className='save-container' >
                    <button 
                        className='save-button'
                        onClick={()=> onSave(number)}
                    >
                        <Check size={34}/>
                    </button>
                </div>

            </div>

        </div>
        </div>




}

///////////////////////////////////////////////////////////////////////////

export function LineMarkComponent({onBack, onSave}) {
    const [values, setValues] = useState({value1: "", value2: "", value3: "", value4: ""});
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [value3, setValue3] = useState('');
    const [value4, setValue4] = useState('');

    const handleOnSave = () => {
        const values = [value1, value2, value3, value4];
        onSave(values);
    }

    return <div 
        className='pop-up-page'
        onClick={onBack}
        >
        <div 
            className='line-mark-container'
            onClick={(e)=> e.stopPropagation()}
        >
            <div className='line-mark-header-container'>
                <button onClick={onBack}>
                    <StepBackIcon size={40}/>
                    <p>Back</p>
                </button>
                <button onClick={handleOnSave}>
                    <Check size={40}/>
                    <p>Done</p>
                </button>
            </div>
            <div className='inputs-container'>
                <input type='text' value={value1}  onChange={(e)=> setValue1(e.target.value)}/>
                <input type='text' value={value2}  onChange={(e)=> setValue2(e.target.value)}/>
                <input type='text' value={value3}  onChange={(e)=> setValue3(e.target.value)}/>
                <input type='text' value={value4}  onChange={(e)=> setValue4(e.target.value)}/>

            </div>
        </div>
        
    </div>

}


export function CondimentsComponent({order,onBack, onSave}) {
    const [chosenCondiments, setChosenCondiments] = useState(new Set());
    const [condiments, setCondiments] = useState([]);
    const [displayDeleteButton, setDisplayDeleteButton] = useState(false);
    const [pressedCondiment, setPressedCondiment] = useState('');
   
    useEffect(()=> {
        loadCondiments();
    }, [order]);


    const loadCondiments = async () => {
        const condimentsURL = `${url}condiments-items/${order.name}/`
        ;
        await fetchData(
            condimentsURL, {
                getData: (response) => {
                    setCondiments(response.data);
                    console.log(response.data)
                },
                apiError: (responseError) => {
                    console.log(responseError)
                }

            }
        )
    
    }

    const addPressedCondiment = (value) => {
        setChosenCondiments(prev => {
            const newItems = new Set(prev);
            // if value already exists , just ignore it and return prev items
            if (newItems.has(value)) {
                return newItems;
            }

            newItems.add(value);
            return newItems;
        })
    }

    const onSaveSubmit = () => {
        // convet chosen condiments set into a list;
        let condiments = Array.from(chosenCondiments);
        onSave(condiments);

    }

    const handlePressedChonsenCondiment = (value) => {
        setDisplayDeleteButton(true)
        setPressedCondiment(value)


    }
     

    const deleteChosenItem  = () => {
        setChosenCondiments(prev => {
            const newItems = new Set(prev);
            if (newItems.has(pressedCondiment)) {
                newItems.delete(pressedCondiment);
                return newItems;
            }
            return newItems;
        })
        setDisplayDeleteButton(false);

    }




    return <div className='pop-up-page'>
        <div className='condiments-container'>
            <div className='condiments-top-content' >
                <button onClick={onBack}>
                    <StepBackIcon/>
                    <p>Back</p>
                </button>
                <h1>{order?.name}</h1>
                <button onClick={onSaveSubmit}>
                    <Save/>
                    <p>Done</p>
                </button>
            </div>
            <div className='condiments-main-content'>
                <div className='chosen-condiments-container'>
                   <div className='chosen-condiments-top'>
                        { 
                        
                            displayDeleteButton &&  <button
                             className='delete-button'
                             onClick={deleteChosenItem}
                            > 
                                <Trash2Icon/>
                                <p>remove</p>    
                            </button>
                        
                        }
                        <p>{pressedCondiment}</p>

                   </div>
                   <div>
                        {
                            Array.from(chosenCondiments).map((con)=> {
                                return <button key={con} onClick={()=> handlePressedChonsenCondiment(con)}>{con}</button>
                            })
                        }
                   </div>
               
                </div>
                <div className='condiments-options-container'>
                    {
                        condiments.map((con)=> {
                            return <button key={con.id} onClick={()=> addPressedCondiment(con.name)}>{con.name}</button>
                        })
                    }
                </div>

            </div>
        </div>

    </div>
   

}

export function DiscountComponent({onSubmit, onBack, bill}) {
    // perform the bill discount here 
    const values = [0, 5, 10, 15, 20, 25, 30, 40];
    // if the bill has discount do some thing
    // provide a customizable discount 

 
    return  <div className='pop-up-page'>
        <div className='discount-container'>
            <div className='discount-header'>
                <button onClick={onBack}>
                    <StepBackIcon size={40}/>
                    <p>Back</p>
                </button>
                {bill?.name && <h3>Client: {bill?.name}</h3>}
            </div>
            <div className='discount-body'>
                {
                    values.map((value) => {
                        return <button key={value} onClick={()=> onSubmit(value)}>Discount {value}%</button>
                    })
                }

            </div>
        </div>
    </div>
    

}

