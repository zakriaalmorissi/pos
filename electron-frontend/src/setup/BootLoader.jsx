 import { useEffect, useState } from "react"
import { LAUNCHING_STATE, url } from "../network/constants"
import { useDispatch } from "react-redux"

import { fetchTables } from "../dataProvider/tablesProvider/tablesProvider"
import { fetchCatalog } from '../dataProvider/catalogProvider/catalogProvider';
import { updateTables } from '../dataProvider/tablesProvider/tablesProvider';
import { cleanTable } from "../dataProvider/tablesProvider/tableModels"
import { useContext } from "react"
import { LaunchStateContext } from "../App"
import './style.css'



function LaunchingSystemIndicator ({
  message,
}) {



  return <div className="launching-system-indicator">
      <div className="launching-system-header" >
          <p>{message}</p>
      </div>
      <div className="launching-system-body">
        <span></span>
        <span></span>
        <span></span>
      </div>

  </div>

  
}




export default function  BootLoader ({children}) {
    const {state, message} = useInitializeData()
    const { socket, } = useWebSocketTables()



    
    return children;
    }



function useInitializeData () {
  const {state, changeLaunchingState} = useContext(LaunchStateContext)
    const dispatch = useDispatch();



  
    // Authenticate the user 
    useEffect(()=> {
        if (state.value === LAUNCHING_STATE.AUTH) {
          console.log("Authenticating ....")
           authenticateUser()
        };
    },[state.value]);


    const authenticateUser = async () => {
        const accessToken = window.localStorage.getItem('accessToken');
        if (!accessToken) {
            changeLaunchingState({
                value: LAUNCHING_STATE.LOGIN,
                message: "Needs Loging in .."
            })
            return;
        }

        const  refreshToken =  window.localStorage.getItem('refreshToken')
        await postData(`${url}accounts/refresh/`, {
                data: { refresh: refreshToken},
                getResponse: (response) => {
                  if (response.status === 'ok') {
                    // Store the new access token 
                    window.localStorage.setItem('accessToken', response.data.access);
                    changeLaunchingState({
                        value: LAUNCHING_STATE.LOAD_DATA, 
                        message: "Loading  Data...."
                    })
                
                  } else {
                    changeLaunchingState({
                        value: LAUNCHING_STATE.LOGIN,
                        message: "Logging in ..."
                    })
                 
                  }
                }
        })

    }

    // 3. Load the data like tables, catalog, and bills
    useEffect(()=> {
        // Load the data 
        loadData();

    }, [state.value]);

    const loadData = async () => {
        try {
        await Promise.all([
            dispatch(fetchTables()).unwrap(),
            dispatch(fetchCatalog()).unwrap(),
        ]
          
        )
        changeLaunchingState({
            value: LAUNCHING_STATE.READY,
            message: "Completed"
        })

        } catch (err) {
            
        changeLaunchingState({
            value: LAUNCHING_STATE.ERROR,
            message: `Faild to get data due to ${err?.hint ?? ""}`
            
        })

    }
  }





    return {
        state: state.value,
        message: state.message
    }

    


}



function useWebSocketTables() {
  const [socketError, setSocketError] = useState(null);
  const dispatch = useDispatch();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    let socket;
    // Catch the error properly 
    try {
      socket = new WebSocket(`ws://localhost:8000/ws/table/?token=${token}`);

      socket.onmessage = (e) => {
        try {
          const updatedTable = cleanTable(JSON.parse(e.data));
         // console.log(updatedTable)
          dispatch(updateTables(updatedTable));
        } catch (err) {
          console.error('Failed to parse WS message', err);
        }
      };

      socket.onerror = (error) => {
        setSocketError('Ooops .. Failed to connect to other devices !');
      };

      socket.onclose = (event) => {
        if (!event.wasClean) {
          setSocketError('Connection closed unexpectedly');
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket', err);
      setSocketError('Ooops .. Failed to connect to other devices !');
    }

    return () => {
      try {
        if (socket) socket.close();
      } catch (err) {
        // ignore
      }
    };
  }, []);

  return [socketError];
}




