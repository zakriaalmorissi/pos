import { createContext, useEffect, useState } from 'react';
import {fetchData} from '../api'
import { url } from '../constants';



let billController ;
const abortFetchingBill = () => {
    if (billController) {
        billController.abort();
        billController = null; 
    }
}


export const getBill =  async (billId) =>  {
    // Abort the bill if still loading 
    abortFetchingBill();
    let data;
    let billError;
    // This is gonna return bill data 
    await fetchData(
                `${url}api/bll/${billId}/`,
                {
                    getData: (res) =>  {
                        data = res.data;
                    },
                    apiError: (err) => {
                        billError = err.message;
                    }
                },
                undefined,
                billController,
               
            );

    return {
        data: data, error: billError
    }
}


export const BillContext = createContext();



export default function BillProvider ({children, billId}) {
    const [bill, setBill] = useState(null);
    const [billError, setBillError] = useState(null);



    useEffect(()=> {
        getBill(billId);
    }, [billId])

    const getBill =  async (billId) =>  {
    // Abort the bill if still loading 
        abortFetchingBill();
        console.log("Fetching the bill" + billId)
        // This is gonna return bill data 
        await fetchData(
                    `${url}api/bill/${billId}/`,
                    {
                        getData: (res) =>  {
                            setBill(res.data);
                            console.log(res.data)
                        },
                        apiError: (err) => {
                            setBillError(err.message)
                        }
                    },
                    undefined,
                    billController,
                
        );
    }


    const updateBill = (data) => {
        setBill(prev => ({...prev, ...data}))
    }


    const values = {bill, billError, getBill, updateBill};

    return <BillContext.Provider value={values}>
        {children}
    </BillContext.Provider>



    

}