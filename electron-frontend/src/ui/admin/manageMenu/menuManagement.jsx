import { useSelector } from "react-redux"
import { ItemCard } from "./componets";
import './style/manageMenu.css'
import { useEffect, useState } from "react";



export default function MenuManagement () {
    const { menu } = useSelector( s => s.menu);
    const [parentItems, setParentItems] = useState([]);
    const [childItems, setChildItems] = useState([]);


    const getParentItems = () => {
        const newSet = new Set()
        // I have a list of categories dict and each category has a parent item element
        menu.map((category) => {
            if (category.parentItems) [
               category.parentItems.forEach((item)=> newSet.add({...item, category: category.name}))
            ]
            
        })
        setParentItems([...newSet])  
    }

    const getChildItems = () => {
        const newSet = new Set();
        // map over the parentItems 
        if (parentItems.length === 0) return;
        parentItems.map((item) => {
            if (item.childItems) {
                item.childItems.forEach((child) => newSet.add({...child, category: item.name}));
            }

        })
        setChildItems([...newSet])

    }


    useEffect(()=> {
        getParentItems()
    },[menu]);

    useEffect(()=> {
        getChildItems();
    }, [parentItems])

    return <div className="menu-management">
        <div className="menu-management-header">
            manageMenu  Header

        </div>
        <div className="menu-management-body">
            <ListCategories categories={menu}/>
            <ListParents parentItems={parentItems}/>
            <ListChilds childItems={childItems}/>

        </div>

    </div>

}




function ListCategories ({categories}) {

   return <div className="list-categories-container">
        <div className="list-categories-header">
            <p>ID</p>
            <p>Name</p>
            <p></p>
        </div>
        <div className="list-categories-body">
            {
                categories.map((category) => {
                    return <ItemCard key={category.id} item = {category}/>
                })
            }

        </div>
    </div>

}




function ListParents ({parentItems}) {


    


    return <div className="parent-items-container">
        <div className="parent-items-header">
            <p>ID</p>
            <p>Name</p>
            <p>Category</p>
         
        </div>
        <div className="parent-items-body">
            {
                parentItems.map((item) => <ItemCard item={item}/>)
            }

        </div>
    </div>

}

function ListChilds ({childItems}) {


    return <div className="parent-items-container">
        <div className="parent-items-header">
            <p>ID</p>
            <p>Name</p>
            <p>Category</p>
            <p>Price</p>
        </div>
        <div className="parent-items-body">
            {
                childItems.map((item) => <ItemCard item={item}/>)
            }

        </div>
    </div>
   
}