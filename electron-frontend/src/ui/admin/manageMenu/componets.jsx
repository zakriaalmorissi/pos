import './style/manageMenu.css'

export function MenuForm () {
    return <div className="menu-form">

    </div>
}


export function ItemCard ({item, onPressed}) {
    // if item is null
    return <div className="item-card">
            <p>{item?.id}</p>
            <p>{item?.name}</p>
            <p>{item?.category}</p>  
            {item?.price && <p>{item.price}</p>}  
    </div>
}