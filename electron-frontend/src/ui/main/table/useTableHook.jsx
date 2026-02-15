import { act, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { launchIndicatorFailureModel, launchIndicatorModel } from "../components/models.";
import { ACTIONS, PROCESSING_STATE } from "../components/constants";
import { createBill, fetchBill } from "../../../dataProvider/billProvider/billSilce";



export default function useTableHook(){
    const [searchParams] = useSearchParams();
    const tableId = Number(searchParams.get("tableId"));
    const floorId = Number(searchParams.get("floorId"));
    const {floors} = useSelector( s => s.floors); // floors is a list by default;
    // Get the table;
    const table = useMemo(()=> { // Note: of course, table can be null 
        console.log("Memo table is called")
        if (!tableId || !floorId) return null;
        const floor = floors.find(flr => flr.id === floorId);
        const table = floor?.tables.find(tble => tble.id === tableId);
        return table;
    }, [floorId, tableId, floors]);

    const dispatch = useDispatch();

    ///  Declare states 
    const [processingTableModel, setProcessingTableModel] = useState({
        status: PROCESSING_STATE.IDLE,
        action: null,
        message: null,
    });
    
    const [selectedBill, setSelectBill] = useState(null);

    // Derived state but must listen to user interactions
    const view = useMemo(() => {
        console.log("memo view is called")
        if (!table) return null;
        const count = table.bills.length;
        if (count === 0) return "createBill";
        if (count === 1)  return "displayBill";
        return selectedBill ? "displayBill": "selectBill";

    }, [table?.bills.length, selectedBill]);
    // if there are more than one bill display the bill 
    // if there is only one bill display the table directly 
    // if nothing display the create bill form 

const resetModelProcessingState = () => {
    setProcessingTableModel({
        status: PROCESSING_STATE.IDLE,
        action: null,
        message: null,
    })
}


useEffect(() => {
    // Auto display the table 
    if (view !== "displayBill" || !table) return;
    const billToLoad = selectedBill ? selectedBill:
        table.bills[0];
    if (!billToLoad) return;
    // Load the bill 
    getTableBill(billToLoad);
}, [table, view, selectedBill]);


const createTableBill = async (bill) => {
    const data = {...bill, table: table?.id};
    const timer = launchIndicatorModel({
        status: PROCESSING_STATE.LOADING,
        action: ACTIONS.CREATING,
        message: "Creating a new bill ..",
        setModel: (values) => setProcessingTableModel(values)
    });
    const timerError = launchIndicatorFailureModel({
        status: PROCESSING_STATE.ERROR,
        action: ACTIONS.CREATING,
        message: "Took so long to create the bill. Pleaze check the network",
        setModel: (values) => setProcessingTableModel(values),
    });
    try {        

        await dispatch(createBill(data)).unwrap();
        resetModelProcessingState();
    } catch (error) {
        setProcessingTableModel({
            status: PROCESSING_STATE.ERROR,
            action: ACTIONS.CREATING,
            message: `Failed to create Bill. ${error?.hint ?? ""}`
        })
    } finally {
        clearTimeout(timer); 
        clearTimeout(timerError);
    }
}

const getTableBill = async (bill) => {
    const timer = launchIndicatorModel({
        status: PROCESSING_STATE.LOADING,
        action: ACTIONS.GETTING,
        message: "Loading Bill ..",
        setModel: (values) => setProcessingTableModel(values)
    });
    const timerError = launchIndicatorFailureModel({
        status: PROCESSING_STATE.ERROR,
        action: ACTIONS.GETTING,
        message: "Took so long to Load the bill. Please check the network",
        setModel: (values) => setProcessingTableModel(values),
    });
    try {
        await dispatch(fetchBill(bill?.id)).unwrap();
        // Reset the processing model
        resetModelProcessingState();
    } catch (error) {
        setProcessingTableModel({
            status: PROCESSING_STATE.ERROR,
            action: ACTIONS.GETTING,
            message: `Failed to load Bill. ${error?.hint ?? ""}`
        })
        
    } finally {
        clearTimeout(timer);
        clearTimeout(timerError);
    }
}

const selectTableBill = (bill) => {
    setSelectBill(bill);
}


    return {
        table: table,
        tableCrud: {
            getTableBill, createTableBill, selectTableBill

        },
        tableProcessing: processingTableModel,
        view: view,
        resetModelProcessingState: resetModelProcessingState
    }
}