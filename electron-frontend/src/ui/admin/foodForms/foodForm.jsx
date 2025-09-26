import { deleteData, fetchData, postData, updateData } from "../../../network/api.ts";
import { url } from "../../../network/constants.js";
import React,{ useContext, useEffect, useState } from 'react';
import FormProvider, { FormContext } from "./providers.jsx";
import style from '../style/form.module.css';
import {MoveRight, CornerUpLeft, StepBackIcon, Edit3} from 'lucide-react';
import { Link, useParams } from "react-router-dom";






function FoodForm() {
    const  {category} = useParams();
    const [withNewCategoryFood, setWithNewCategoryFood] = useState(false);
    const [withExistedCategoryFood, setWithExistedCategoryFood] = useState(false);

   
    const yesWithNew = () => {
        setWithNewCategoryFood(true);
        setWithExistedCategoryFood(false);
    }
    const yesWithExisted = () => {
        setWithExistedCategoryFood(true);
        setWithNewCategoryFood(false);
    }

    const onBack = () => {
        setWithExistedCategoryFood(false);
        setWithNewCategoryFood(false);
    }

    return !withExistedCategoryFood && !withNewCategoryFood? <div 
        className={style.beforeFoodFormContainer}>
        <div className={style.beforeFoodFormHeader}>
            <Link 
                className={style.navigateBackContainer} 
                to={'/admin'}
            >
                <CornerUpLeft size={36} />
                <p>Back</p>
            </Link>  
            <h2>{category}</h2>
        </div>
    
        <div className={style.beforeNewCategoryForm}>
            <p>With New Category {category}</p>
            <button 
                type="submit"
                onClick={yesWithNew}

            >
                <p>Continue</p>
                <MoveRight size={40}/>
            </button>
        </div>
        <div className={style.beforeExistedCategoryForm}>
            <p>With Existed Category {category}</p>
            <button 
                type="submit"
                onClick={yesWithExisted}
            >
                <p>Continue</p>
                <MoveRight size={40}/>
            </button>
        </div>
    </div>:<FormProvider><MainFormComponent  isWithExisted={withExistedCategoryFood} onBack={onBack}/></FormProvider> 

     // give the user optoins to either create food exits category food or with new category food 
}

function MainFormComponent ({isWithExisted, onBack}) {
    const {category} = useParams();
    const {partenItem} = useContext(FormContext);
    const [createdFood, setCreatedFood] = useState(null);
    const [condiment, setCondiment] = useState("");
    const [createdCondiments, setCreatedCondiments] = useState([]);
    const [condimentErrorMessage, setCondimentErrorMessage] = useState(null);


    const [createdChildFood, setCreatedChildFood] = useState(null);

    const onCondimentsSubmit = async (foodName) => {
        const condimentUrl = `${url}condiments-items/${foodName}/`;
        await postData(
            condimentUrl,
            {
                data: {name: condiment},
                getResponse: (response) => {
                    if (response.status ==="ok") {
                        fethCondiments();
                        return;
                        
                    }
                    console.log(response.error)
                }
            },     
        )

    }

    useEffect(()=> {
        if (createdFood === null) return;
        fethCondiments();
    }, [createdFood?.id,])


    const fethCondiments = async () => {
        const condimentUrl = `${url}condiments-items/${createdFood?.name}/`;
        await fetchData(
            condimentUrl,
            {
                getData: (response) => {
                    setCreatedCondiments(response.data);
                },
                apiError: (responseError) => {
                    console.log(responseError)
                }
            }
        )

    }

    const clearCreatedFood = (foodId) => {
        if (foodId === createdFood?.id){
            setCreatedFood(null);
            setCreatedCondiments([]);
        }

    }


   
    const getCreatedChildData = async (childItem) => {
        // This function is gonna update the created Food and give it some child items 
        if (createdFood) {
            const foodURL = `${url}child-items/${partenItem.id}/`;
            let data = {
                id: childItem.id,
                parent: createdFood.id,
            }
            await updateData(foodURL, {
                data: data,
                callbacks: {
                    getResponse: (response) => {
                        setCreatedChildFood(childItem);

                    },
                    apiError: (responseError)=> {
                        console.log(responseError) 
                    }
                }
        })
        }
    }


    return (
        <div className={style.mainFormContainer}>
            <div className={style.mainFormHeader}>
                    <button onClick={onBack}>
                            <StepBackIcon size={35}/>
                            <p>Back</p>
                    </button>
                    <h2>{category} Section</h2>

            </div>
            <div className={style.mainFormBody}>
                <div className={style.categoryFormContainer}>
                        {
                            isWithExisted? 
                            <SelectExitedCategory/>:
                            <NewCategoryForm/>
                        }
                    <div className={style.mainfoodForm}>
                            <div className={style.foodForm}>
                                <ParentItemForm getCreatedFood={(food) => setCreatedFood(food)}/>
                                <ChildItemForm createdChild={getCreatedChildData} category={createdFood}/>
                                <div className={style.condimentsContainer}>
                                    <p> Related Condiments to: {createdFood?.name}  </p>
                                    <ul className={style.condimentsContents}>
                                    {
                                        createdCondiments.map((con) => {
                                            return <li key={con.id}> {con.name} </li>
                                        })
                                    }
                                </ul>
                            </div>
                        
                        </div>
                        <div className={style.condimentFormContainer}>
                            <div className={style.condimentForm}>
                                <label htmlFor="condiment">Condiment</label>
                                <input 
                                    id="condiment"
                                    type="text"
                                    value={condiment}
                                    onChange={(e)=> setCondiment(e.target.value)}

                                />
                                <button 
                                    type="submit" 
                                    disabled = {createdFood === null} 
                                    onClick={()=> onCondimentsSubmit(createdFood?.name)}
                                >
                                    Add
                                </button>
                            </div>
                            <div className={style.condimentErrorMessage}>
            

                            </div>

                        </div>
                    </div>
                </div>
                <CreatedFoodComponent 
                    createdFood={createdFood}
                    clearCreatedFood={clearCreatedFood}
                    createdChildFood={createdChildFood}
                />

            </div>
        </div>
       
    )
}


function NewCategoryForm () {
    const {category, getParentItemValue} = useContext(FormContext);
    const [categoryErrorMessage, setCategoryErrorMessage] = useState(null);
    const [categoryName, setCategoryName] = useState("");
    const [selectedColor, setSelectColor] = useState("");
    
    const colors = [
        "red", "blue", "green", 'teal', 'purple',"gray", "black", 
        "skyblue", "brown", "yellow", "white","cyne"
        ]

    
    const onCategorySubmit = async () => {
        const categoryURL = `${url}parent-items/${category}/`;
        await postData(
            categoryURL,
            {
                data: {
                    name: categoryName,
                    color: selectedColor === ""? 'gray': selectedColor
                    
                } ,
                getResponse: (response) => {
                    if (response.status === "ok") {
                        getParentItemValue(response.data);
                        return;
                    }
                    setCategoryErrorMessage(response); 
                }
            }
        )
    }


    return (
        <div className={style.newCategoryFormContainer}>
            <div className={style.newCategoryFormContents}>
                <label htmlFor="category">Category Name</label>
                <input
                    id="category"
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                />
                <select 
                    value={selectedColor}
                    onChange={(e)=> setSelectColor(e.target.value)}
                >
                    <option value="">Give it a Color</option>
                    {colors.map((color)=> {
                        return <option key={color} value={color}>{color}</option>
                    })   }
                </select>
        
                <button
                    type="submit"
                    onClick={onCategorySubmit}
                >Create</button>    
            </div>
            <div className={style.error}>
                { 
                categoryErrorMessage?.status === "Bad request"?
                    <p>{categoryErrorMessage.error.name?.at(0)}</p>:
                <p>{ categoryErrorMessage?.message}</p> }
            </div>
        </div>
    )
}

function SelectExitedCategory () {
    const {category, partenItem, getParentItemValue} = useContext(FormContext);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");

    useEffect(()=> {
        fetchCategories();
    }, [category, partenItem])


    // Fetch categories data
    const fetchCategories = async () => {
        const URL = `${url}parent-items/${category}/`;

        await fetchData(URL, {
            getData: (response) => {
                setCategories(response.data);
            },
            apiError: (responseError) => {
                console.log(responseError);
            }
        })
    }


    const handleSelection = (event) => {
        const value = event.target.value 
        if (value === "") {
            setSelectedCategory("");
            getParentItemValue(null);

        }
        const id = Number(value);
        if (id) {
            const selected = categories.find((ca) => ca.id === id);
            setSelectedCategory(selected);
            getParentItemValue(selected);
            return;
        }    
    }



    return (
        <div className={style.selectCategoryForm}>
            <div>
                <h3>Pre-selected Category</h3>
            </div> 
            <select value={selectedCategory.id || ""} onChange={handleSelection}>
                <option value="">Select Category</option>
                {
                    categories.map(ca => {

                    return <option key={ca.id} value={ca.id} >{ca.name}</option>
                })
                }
            </select>   
       </div>

    )

}


function ParentItemForm ({getCreatedFood}) {
    const {partenItem} = useContext(FormContext)
    const [foodName, setFoodName] = useState("");
    const [price, setPrice] = useState(0);
    const [foodErrorMessage, setFoodErrorMessage] = useState(null);


    const onFoodSubmit = async () => {
        const foodURL = `${url}child-items/${partenItem.id}/`;
        await postData(
            foodURL,
            {
                data: {
                    name: foodName,
                    price: price,
                },
                getResponse: (response) => {
                    if (response.status === "ok"){
                        getCreatedFood(response.data);
                        setFoodErrorMessage(null);
                        return;   
                    }
                    setFoodErrorMessage(response)
                    console.log(response)
                }
            }   
        )
    }
    
    return <div className={style.form1AndForm2Dev}>
        <div>
            <h2>Form 1</h2>
        </div>
         <div>
                <label htmlFor="foodName">Food Name</label>
                <input
                    className={style.foodFormInputName}
                    id="foodName"
                    type="text"
                    value={foodName}
                    onChange={(e)=> setFoodName(e.target.value)}
                />
            </div>
            <div  className={style.foodFormPriceDev}>
                <label htmlFor="price">Price</label>
                <input
                    className={style.foodFormPriceInput}
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
            </div>
            <div>
                {foodErrorMessage?.status === "Bad request"?
                <p>{foodErrorMessage.error.name?.at(0) || foodErrorMessage.error.price?.at(0)}</p>:
                <p>{foodErrorMessage?.message}</p>
                
            }
            </div>
            
            <button
                type="submit"
                disabled = {partenItem === null}
                onClick={onFoodSubmit}
            > Create </button>
    </div>

}



function ChildItemForm ({createdChild, category}) {
    const {partenItem} = useContext(FormContext);
    const [foodName, setFoodName] = useState("");
    const [price, setPrice] = useState(0);
    const [foodErrorMessage, setFoodErrorMessage] = useState(null);


    const onFoodSubmit = async () => {
        const foodURL = `${url}child-items/${partenItem.id}/`;
        await postData(
            foodURL,
            {
                data: {
                    name: foodName,
                    price: price,
                },
                getResponse: (response) => {
                    if (response.status === "ok"){
                        createdChild(response.data);
                        setFoodErrorMessage(null);
                        return;   
                    }
                    setFoodErrorMessage(response)
                    console.log(response)
                }
            }   
        )
    }

    return <div className={style.form1AndForm2Dev}>
        <div>
            <h2>Form 2</h2>
            <p>This Form is Optional. You should use this Form only if you want give The food in Form 1 child Items </p>

        </div>
         <div className={style.foodFormNameDev}>
            <label htmlFor="foodName">Child Food Name:</label>
                <input
                    className={style.foodFormInputName}
                    id="foodName"
                    type="text"
                    value={foodName}
                    placeholder="(optional)"
                    onChange={(e)=> setFoodName(e.target.value)}
                />
            </div>
            <div  className={style.foodFormPriceDev}>
                <label htmlFor="price">Price</label>
                <input
                    className={style.foodFormPriceInput}
                    type="text"
                    value={price}
                    placeholder="optional"
                    onChange={(e) => setPrice(e.target.value)}
                />
            </div>
            <div>
                {foodErrorMessage?.status === "Bad request"?
                <p>{foodErrorMessage.error.name?.at(0) || foodErrorMessage.error.price?.at(0)}</p>:
                <p>{foodErrorMessage?.message}</p>
                
            }
            </div>
             <button
                type="submit"
                disabled = {category === null}
                onClick={onFoodSubmit}
            > Create </button>
                            
                       
    </div>

}


function CreatedFoodComponent ({clearCreatedFood, createdFood, createdChildFood}) {
    const {category, partenItem, getParentItemValue} =  useContext(FormContext);
    const [selectedFoods, setSelectedFood] = useState(new Set());
    const [displayButton, setDisplayButton] = useState(false);
    const [foodWithParentItems, setFoodWithParentItems] = useState([]);
    const [foodWithoutParentItems, setFoodWithoutParentItems] = useState([]);


    // handle category deleting 
    useEffect(()=> {
        fecthFoods();
    }, [createdFood, partenItem?.id, createdChildFood])

    const fecthFoods = async () => {
        const foodUrl = `${url}child-items/${partenItem?.id}/`;
        await fetchData(
            foodUrl,
            {
                getData: (response) => {
                    const itemsWithParents = response.data.filter((food)=> food.parent !== null);
                    const itemsWithoutParents = response.data.filter((food)=> food.parent === null);
                    setFoodWithParentItems(itemsWithParents);
                    setFoodWithoutParentItems(itemsWithoutParents);
                    
                },
                apiError: (responseError) => {
                    console.log(responseError);
                }
            }
        )}



    const toggleSelection = (foodId) => {
        setSelectedFood(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(foodId)){
                newSelection.delete(foodId);
                return newSelection;
            }
            newSelection.add(foodId);
            return newSelection;

        })
    }


    const deleteSelectedFoods = async () => {
        selectedFoods.forEach((foodId)=> {
            const deletedFoodUrl = `${url}child-items/${partenItem.id}/`;
            // clear the created food in the parent component
            clearCreatedFood(foodId);
            deleteData(
                deletedFoodUrl,
                {
                    data: {id: foodId},
                    callbacks: {
                        getResponse: (res) => {
                            setFoodWithParentItems(prev => prev.filter((item)=> !selectedFoods.has(item.id)));
                            setFoodWithoutParentItems(prev => prev.filter((item)=> !selectedFoods.has(item.id)))
                        },
                        apiError: (responseError) => {
                            console.log(responseError)
                        }
                    },
                }
            )});
        setSelectedFood(new Set());
     }

     const deleteCategory = async () => {
        const URL = `${url}parent-items/${category}/`;
        await deleteData(
            URL, {
                data: {id: partenItem.id},
                callbacks: {
                    getResponse: (response) => {
                        getParentItemValue(null);
                        
                    },
                    apiError: (responseError) => {
                        console.log(responseError);
                    }
                }
            }
        )

     }

    return <div className={style.createdFoodContainer}> 
            {partenItem? <div className={style.createdFood}>
                <div className={style.createdFoodHeader}>
                    <h2  
                        onClick={()=> setDisplayButton(!displayButton)}>
                        <p>{partenItem.name}</p> 
                        <Edit3 size={25}/>
                        </h2>
                    <button 
                        type="submit"
                        style={{
                            "display": displayButton? "block": "none"
                        }}
                        onClick={deleteCategory}
                        >Delete {partenItem.name}</button>
                    <button 
                        type="submit"
                        onClick={deleteSelectedFoods}
                        style={{display: selectedFoods.size === 0? 'none': 'block'}} 
                     > Delete </button>

                </div>
                <div className={style.foodContents}>  
                    <div className={style.contents}>
                        {
                            foodWithoutParentItems.map((food)=> {
                                return <p 
                                    key={food.id}
                                    ><input
                                        type="checkbox"
                                        value={food.id}
                                        onClick={(e) => toggleSelection(Number(e.target.value))}
                                />{food.name}</p>
                            })
                        }
                    </div>
                    <div className={style.createdChildFoodsContainer}>
                        <h2>Child Food</h2>
                        <div className={style.childFoodContents}> 
                            {
                                foodWithParentItems.map((food)=> {
                                    return <p 
                                        key={food.id}
                                        ><input
                                            type="checkbox"
                                            value={food.id}
                                            onClick={(e) => toggleSelection(Number(e.target.value))}
                                    />{food.name}</p>
                                })
                            }
                        </div>
                    </div>  
                </div>
                     
        </div>:
         <div className={style.noCreatedFoodIndicator}> <p>No Items</p> </div>
     }
    </div>

}

export default FoodForm;
