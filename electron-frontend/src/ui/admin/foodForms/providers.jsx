import { createContext, useState } from "react"
import { useParams } from "react-router-dom";


/// This provider is gonna store created patentItems, also category value {food or drink}

export const FormContext = createContext();



function  FormProvider ({children}) {
    const {category} = useParams(); // Food or Drink 
    const [partenItem, setParentItem] = useState(null); // Items of either food or drink


    const getParentItemValue = (value) => {
        setParentItem(value);
    }

    const values = {category, partenItem, getParentItemValue};

    return <>
        <FormContext.Provider value={values}>
            {children}
        </FormContext.Provider>
    </>

}


export  default FormProvider;
