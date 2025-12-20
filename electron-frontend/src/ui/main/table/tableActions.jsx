import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateTables } from "../../../dataProvider/tablesProvider/tablesProvider";
import { cleanOrder, clearOrders } from "../../../dataProvider/orderProvider/orderSlice";
import { clearBill } from "../../../dataProvider/billProvider/billSilce";
import { useReducer } from "react";


export function usetableWebSocketReleasingListener (table) {
     const user = JSON.parse(window.localStorage.getItem('user'));
     const navigate = useNavigate()
     const dispatch = useDispatch();

    useEffect (()=> {
        // Reeceive the release from the super admin or the admin
        // this happens when the admin wants to make a force release to the table
        const socket = new WebSocket('ws://localhost:8000/ws/release/');
        socket.onmessage = (e) => {
            const updatedUser = JSON.parse(e.data);
            if (updatedUser.id === user.id && !updatedUser.has_tables) {
                // Update the current table 
                dispatch(updateTables(table));
                navigate("/");  
              
            }
        };

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        }

    }, []);


}


export function useTableWebSocket(table) {
    const [ socketError, setSocketError ] = useState(null);
    const [isProcessing, setIsProcessing] = useState({type: "occupying"});
    const [data, setData] = useState(null);
    const token = localStorage.getItem("accessToken")
    const dispatch = useDispatch();
    const navigate = useNavigate()
 

    useEffect(()=> {
            occupyTable()
        }, []);

        const occupyTable = () => {
            setIsProcessing({type: "occupying"})
            const socket = new WebSocket(`ws://localhost:8000/ws/table/?token=${token}`);
            socket.onopen = () => {
                let updateTableStatus = {
                    action: "occupy",
                    payload: {...table, status: "occupied"}
                }
                socket.send(JSON.stringify(updateTableStatus));  
            }
            socket.onmessage = (event) => {
                if (event.data === "occupied") setIsProcessing({type: ""});
              
            }

            socket.onerror = (err) => {
               setIsProcessing({"type": ""});
               setSocketError("Failed to occupy the table");

            }

            dispatch(clearBill())
            dispatch(clearOrders())

        }

        const releaseTable = ()  => {
            setIsProcessing({type: "releasing"})
            const socket = new WebSocket(`ws://localhost:8000/ws/table/?token=${token}`);
            socket.onopen = () => {
            let updateTableStatus = {
                action: "release",
                payload: {id: table?.id}
            }
            socket.send(JSON.stringify(updateTableStatus)); 
        }

            navigate("/home")
        }

   

        useEffect(()=> {
            const handleBeforeUnload =  (event) => {
                releaseTable();
                event.returnValue = '';
            }
            // these are not gonna be called unless the event listener has been called
            window.addEventListener('beforeunload', handleBeforeUnload);
            window.addEventListener('pagehide', handleBeforeUnload);

            return () => {

                window.removeEventListener('pagehide', handleBeforeUnload);
                window.removeEventListener('beforeunload', handleBeforeUnload);

         }
         },[]);


        const tableAction = {releaseTable: releaseTable, occupyTable: occupyTable,}


    return {socketError, isProcessing, data, tableAction}

}