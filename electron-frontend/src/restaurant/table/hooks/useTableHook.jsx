import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { data, useSearchParams } from "react-router-dom";
import { launchIndicatorFailureModel, launchIndicatorModel } from "../../../components/models.";
import { ACTIONS, PROCESSING_STATE } from "../../../components/constants";
import { createBill, fetchBill, updateBill } from "../../../dataProvider/billProvider/billSilce";
import { changeOrdersStatus } from "../../../dataProvider/orderProvider/orderSlice";



export default function useTableHook(){
    const [searchParams] = useSearchParams();
    const tableId = Number(searchParams.get("tableId"));
    const floorId = Number(searchParams.get("floorId"));
    const {floors} = useSelector( s => s.floors); // floors is a list by default;
    // Get the table;
    const table = useMemo(()=> { // Note: of course, table can be null 
        if (!tableId || !floorId) return null; // Event if the any of their value is zero, return null;
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
    const [addBill, setAddBill] = useState(false);
    // Derived state but must listen to user interactions
    const viewDpn = table?.bills.length 
    const view = useMemo(() => {
        if (!table) return null;
        const count = table.bills.length ?? 0;
        if (addBill) return "createBill";
        if (count === 0) return "createBill";
        if (count === 1)  return "displayBill";
        return selectedBill ? "displayBill": "selectBill";

    }, [viewDpn, selectedBill, addBill]);
    // Save a ref for fetching the bill abort it accordingly
    const activeBillRequest = useRef(null);
 
    
const firstTableBill =  table?.bills[0];
const billToLoad = view === "displayBill"? selectedBill?.id ?? firstTableBill?.id: null;

const resetModelProcessingState = () => {
    setProcessingTableModel({
        status: PROCESSING_STATE.IDLE,
        action: null,
        message: null,
    })
}

// Auto load data if there is any selected bill or table has only one bill
useEffect(() => {
    if (!billToLoad) return;
    // Load the bill 
    getTableBill(billToLoad);
    // Abort the request 
    return () => activeBillRequest.current?.abort();
}, [billToLoad]);


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
        message: "Took so long to create the bill. Please check the network",
        setModel: (values) => setProcessingTableModel(values),
    });
    try {        

        const currentBill = await dispatch(createBill(data)).unwrap();
        setSelectBill(currentBill);
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
        setAddBill(false);
    }
}

const getTableBill = async (billId) => {
    if (activeBillRequest.current) {
        activeBillRequest.current?.abort();
    }
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

    // Save the bill active fetch request
    const requestThunk = dispatch(fetchBill(billId));
    activeBillRequest.current = requestThunk;
    try {
        await requestThunk.unwrap();
        // Reset the processing model
        resetModelProcessingState();
    } catch (error) {
        if (error.name === "AbortError") return; // This is not a real error;
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


const updateTableBill = async (bill) => {
    try {
        const newBill = await dispatch(updateBill({billId: bill?.id, data: bill})).unwrap();
        console.log(newBill)
        resetModelProcessingState();
    } catch (error) {
        setProcessingTableModel({
            status: PROCESSING_STATE.ERROR,
            action: ACTIONS.UPDATING,
            message: `Failed to update bill. ${error?.hint ?? ""}`,
        })
    }
}

const selectTableBill = (bill) => setSelectBill(bill);
// For adding more than one bill for the current table;
const addNewTableBill = () => setAddBill(true);

const changeTableOrdersStatus = () => dispatch(changeOrdersStatus());



return {
        table: table,
        tableCrud: {
            getTableBill, 
            createTableBill,
            selectTableBill,
            updateTableBill, 
            addNewTableBill,
        },
        changeTableOrdersStatus,
        tableProcessing: processingTableModel,
        view: view,
        resetModelProcessingState: resetModelProcessingState
    }
}