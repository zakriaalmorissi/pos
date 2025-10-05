import { useState, useEffect } from "react";
import style from './../style/table.module.css';
import { useSelector, useDispatch } from "react-redux";



export function Menu ({handleOrder}) {
    const [items, setItems] = useState([]);
    const [itemsWithoutParents, setItemsWithuotParents] = useState([]);
    const [childItems, setChildItems] = useState([]);
    const { menu } = useSelector(state => state.menu);
  

    const getItems = (name) => {
        window.localStorage.setItem('lastItem', name);
        let newItems = menu.find((item) => item.name === name)
        setItems(newItems?.parentItems);
        // Clear fetched items 
        setItemsWithuotParents([]);
        setChildItems([]);
   
    }

    
    useEffect(()=> {
        const getLastFecthedItem = window.localStorage.getItem('lastItem');
        if (!getLastFecthedItem) return;
        getItems(getLastFecthedItem);
    }, []);


       // Fetch items according to thier parent id;
    const fetchChildItems = async (parentId) => {
            let itms = items.find(parent => parent.id === parentId);
                // Items that don't have parents, but some of them have children
            setItemsWithuotParents(itms.childItems.filter((item)=> !item.parent))
        setChildItems([]);
    }

    const disPlayChildren = (item) => {
        if (item.children) {
            setChildItems(item.children.map(child => ({...child, color: item.color})))
            setItemsWithuotParents([]);
            return;
        
        }
        handleOrder(item)
    }


    // Dispaly the price of the item in the UI
    return (
         <div className={style.foodContainer}>
               <div className={style.categories}>
                    {
                        menu.map((category)=> {
                            return <button 
                                key={category.id}
                                type="submit" 
                                onClick={()=>  getItems(category.name)}
                                style={{
                                    'width': "100%",
                                    'height': '4rem',
                                    backgroundColor: "green",
                                    color: 'white',
                                    fontSize: "1.2rem"
                                }}
                                 >
                                {category.name}
                            </button>
                        })}
               </div>
                <div className={style.itemsContainer}>
                        <div className={style.foodAndDrinkContainer}>
                            {
                                items?.map((item)=> {
                                    return <button 
                                        key={item.id}
                                        type="submit"
                                        style={{
                                            'height': '5rem',
                                            'backgroundColor': item.color,
                                            'fontWeight': '800',
                                            'fontSize': '1.1rem',
                                            'color': item.color === 'white'? 'black': item.color === "yellow" ? 'black': 'white'
                                        }}
                                        onClick={()=> fetchChildItems(item.id)}
                                        >
                                        {item.name}
                                    </button>
                                })
                            }
                        </div>
                    
                    <ChildItems disPlayItems={disPlayChildren} items={itemsWithoutParents}/>
                    <ChildItems disPlayItems={disPlayChildren} items={childItems}/>
                </div>
            </div>
    );

}                    


function ChildItems({disPlayItems, items}){

    return (
        <div className={style.foodAndDrinkContainer}>
        {
            items.map((item) => {
                return <button 
                    className="button"
                    key={item.id}
                    onClick={()=>  disPlayItems(item)}
                    style={{
                        'height': '6rem',
                        'backgroundColor': item.color,
                        'fontWeight': '800',
                        'fontSize': '1.1rem' ,
                        'textTransform':'capitalize',
                        'color': item.color === 'white'? 'black': item.color === "yellow" ? 'black': 'white'

                       
                    }}
                > 
                <p>{item.name}</p>
                {
                    item.children === null 
                     && <p>{item.price}</p>
                
                } 
                </button>
            })
        }
    </div>
    )



}