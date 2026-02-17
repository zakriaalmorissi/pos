import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { data, useSearchParams } from "react-router-dom";
import { launchIndicatorFailureModel, launchIndicatorModel } from "../components/models.";
import { ACTIONS, PROCESSING_STATE } from "../components/constants";
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

    
    const viewDpn = table?.bills.length 
    const [selectedBill, setSelectBill] = useState(null);
    // Derived state but must listen to user interactions
    const view = useMemo(() => {
        if (!table) return null;
        const count = table.bills.length ?? 0;
        if (count === 0) return "createBill";
        if (count === 1)  return "displayBill";
        return selectedBill ? "displayBill": "selectBill";

    }, [viewDpn, selectedBill]);
 
    
const firstTableBill =  table?.bills[0];
const billToLoad = view === "displayBill"? selectedBill?.id ?? firstTableBill?.id: null;

const resetModelProcessingState = () => {
    setProcessingTableModel({
        status: PROCESSING_STATE.IDLE,
        action: null,
        message: null,
    })
}


useEffect(() => {
    if (!billToLoad) return;
    // Load the bill 
    getTableBill(billToLoad);
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

const getTableBill = async (billId) => {
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
        await dispatch(fetchBill(billId)).unwrap();
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


const updateTableBill = async (bill) => {
    try {
        await dispatch(updateBill({billId: bill?.id, data: bill})).unwrap();
        resetModelProcessingState();
    } catch (error) {
        setProcessingTableModel({
            status: PROCESSING_STATE.ERROR,
            action: ACTIONS.UPDATING,
            message: `Failed update bill. ${error?.hint ?? ""}`,
        })
    }
}

const selectTableBill = (bill) => {
    setSelectBill(bill);
}


const changeTableOrdersStatus = () => dispatch(changeOrdersStatus());



return {
        table: table,
        tableCrud: {
            getTableBill, 
            createTableBill, 
            selectTableBill,
            updateTableBill
        },
        changeTableOrdersStatus,
        tableProcessing: processingTableModel,
        view: view,
        resetModelProcessingState: resetModelProcessingState
    }
}