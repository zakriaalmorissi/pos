import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { data, useSearchParams } from "react-router-dom";
import { ACTIONS, PROCESSING_STATE } from "../../../components/constants";
import { createOrder, fetchOrder, updateOrder } from "../../../dataProvider/OrderProvider/OrderSilce";
import { changeOrdersStatus } from "../../../dataProvider/orderProvider/orderSlice";
import { makeAPICrud } from "../../../utilities/utiliy";



export default function useTableHook(){
    const [searchParams] = useSearchParams();
    const tableId = Number(searchParams.get("tableId"));
    const tablesGroupId = Number(searchParams.get("tablesGroupId"));
    const {tableGroups} = useSelector( s => s.tableGroups); // floors is a list by default;
    // Get the table;
    const table = useMemo(()=> { // Note: of course, table can be null 
        if (!tableId || !tablesGroupId) return null; // Event if the any of their value is zero, return null;
        const tablesGroup = tableGroups.find( tg => tg.id === tablesGroupId);
        return tablesGroup?.tables.find(tble => tble.id === tableId) ?? null;
       
    }, [tableGroups, tableId, tablesGroupId]);

    const dispatch = useDispatch();
    ///  Declare states 
    const [processingTableModel, setProcessingTableModel] = useState({
        status: PROCESSING_STATE.IDLE,
        action: null,
        message: null,
    });

    const [selectedOrder, setSelectOrder] = useState(null);
    const [addOrder, setAddOrder] = useState(false);
    // Derived state but it must listen to user interactions
    const viewDpn = table?.orders.length;
    const view = useMemo(() => {
        if (!table) return null; //  guard
        const count = table.orders.length ?? 0;
        if (addOrder) return "createOrder";
        if (count === 0) return "createOrder";
        if (count === 1)  return "displayOrder";
        return selectedOrder ? "displayOrder": "selectOrder";

    }, [viewDpn, selectedOrder, addOrder]);
    // Ref for a borting the order 
    const activeOrderRequest = useRef(null);
 
    const firstTableOrder =  table?.orders[0];
    // Get the order id 
    const orderToLoad = 
        view === "displayOrder"
        ? selectedOrder?.id 
            ?? firstTableOrder?.id: null;

const resetModelProcessingState = () => {
    setProcessingTableModel({
        status: PROCESSING_STATE.IDLE,
        action: null,
        message: null,
    })
}

// Auto load data if there is any selected Order or table has only one Order
    useEffect(() => {
        if (!orderToLoad) return;
        // Load the Order 
        getTableOrder(orderToLoad);
        // Abort the request 
        return () => activeOrderRequest.current?.abort();
    }, [orderToLoad]);


    const createTableOrder = async (Order) => {
        const data = {...Order, table: table?.id};
        const timer = launchIndicatorModel({
            status: PROCESSING_STATE.LOADING,
            action: ACTIONS.CREATING,
            message: "Creating a new Order ..",
            setModel: (values) => setProcessingTableModel(values)
        });
        const timerError = launchIndicatorFailureModel({
            status: PROCESSING_STATE.ERROR,
            action: ACTIONS.CREATING,
            message: "Took so long to create the Order. Please check the network",
            setModel: (values) => setProcessingTableModel(values),
        });
        const thunk = dispatch(createOrder(data));
        await makeAPICrud({
            thunk: thunk,
            status: PROCESSING_STATE.LOADING,
            action: ACTIONS.CREATING,
            message: "Creating an order",
            time: 300,
            responseData: (data) => setSelectOrder(data),
            updateStateCallback: (values) => setProcessingTableModel(values),
        })
        resetModelProcessingState();
        setAddOrder(false);
    }

    const getTableOrder = async (orderId) => {
        if (activeOrderRequest.current) {
            activeOrderRequest.current?.abort();
        }
        // Save the Order active fetch request
        const requestThunk = dispatch(fetchOrder(orderId));
        activeOrderRequest.current = requestThunk;
        await makeAPICrud({
            thunk:requestThunk,
            action: ACTIONS.GETTING,
            status: PROCESSING_STATE.LOADING,
            message: "Loading Order",
            time: 300,
            updateStateCallback: (values) => setProcessingTableModel(values)
        })

        resetModelProcessingState();
    }

    const updateTableOrder = async (order) => {
        const thunk = dispatch(updateOrder({orderId: order?.id, data: order}));
        await makeAPICrud({
            thunk: thunk,
            status: PROCESSING_STATE.LOADING,
            action: ACTIONS.GETTING,
            message: "updating the order",
            time: 500,
            updateStateCallback: (values) => setProcessingTableModel(values),
        })
        resetModelProcessingState();
    }

    const selectTableOrder = (Order) => setSelectOrder(Order);
    // For adding more than one Order for the current table;
    const addNewTableOrder = () => setAddOrder(true);
    const changeTableOrdersStatus = () => dispatch(changeOrdersStatus());



return {
        table,
        view,
        tableCrud: {
            getTableOrder, 
            createTableOrder,
            selectTableOrder,
            updateTableOrder, 
            addNewTableOrder,
        },
        changeTableOrdersStatus,
        resetModelProcessingState,
        tableProcessing: processingTableModel,
    }
}