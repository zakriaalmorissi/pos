import {useNavigate} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenu } from './dataProvider/menuProvider/menuProvider';
import { fetchTables } from './dataProvider/tablesProvider/tablesProvider';
import { fetchSystem } from './dataProvider/systemProvider/system';
import style from './ui/Home.module.css';
import { postData } from './network/api';
import { url } from './network/constants';
import { fetchTakeOutBills } from './dataProvider/takeOutBillsProvider/takeOutBillsProvider';
import { ProcessingIndicator, TimeoutErrorMessageIndicator } from './ui/components/components';
import { updateTables } from './dataProvider/tablesProvider/tablesProvider';
import { cleanTable } from './dataProvider/tablesProvider/tablesProvider';
import AppRoutes from './routes/routes';


function App () {
  const {state, message} = useInitializeData();
  const { socketError } = useWebSocketTables();
  

    
    if (state !== "READY") {
        return <ProcessingIndicator 
          isLoading={state !== "READY"}
          action={message}
          errorMessage={state === "ERROR"? message: null}
          buttonLabel={"Reload"}
          onIgnore={()=> {
            // Do some logic, like reloading the data or quiting the system
             window.location.reload()

          }}
          // Provide more options 
        
        />
    }
    return <>
      <AppRoutes/>
       {socketError && <TimeoutErrorMessageIndicator message={socketError} />}
    </>


}

function useInitializeData () {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [launchingState, setLaunchingState] = useState({
    state: "INIT",
    message: null,
    
  })

  // Fetch the system data 
  useEffect(()=> {
    // First step load the system data to get the most essential data 
    const start = async () => {
    setLaunchingState({
      state: "SYSTEM",
      message: "Loading System Configurations"
    })
    try {
      await dispatch(fetchSystem()).unwrap();
      setLaunchingState({
        state: "AUTH",
        message: "Authentication..."
      })
    } catch(err) {
      setLaunchingState({
        state: "ERROR",
        message:`Failed to load system data "${err.message}"`
      })
    }
  }
    // Start ...
    start();
      
  }, [dispatch]);




  // Authenticate the user 
  useEffect(()=> {
    // Wait till system data are loaded
    if (launchingState.state !== "AUTH") return;
    refreshUserTokens();
  }, [launchingState])

  const refreshUserTokens = async () => {
    // Get the acess token
    const accessToken = window.localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return;
    }
    // Send the refresh token
    const  refreshToken =  window.localStorage.getItem('refreshToken')
    await postData(`${url}accounts/refresh/`, {
        data: { refresh: refreshToken},
        getResponse: (response) => {
          if (response.status === 'ok') {
            window.localStorage.setItem('accessToken', response.data.access);
            setLaunchingState({
              state: "LOAD_DATA",
              message: "Loading ..."
            })
          } else {
            setLaunchingState({
              state: "ERROR",
              message: "Failed to authenticate the user"
            })
            navigate('/login'); 
          }
        },
      });

  };

  // Fetch other data after authentication
  useEffect(()=> {
    // Wait till loading system data and authenication process finished
    if (launchingState.state !== "LOAD_DATA") return;
    loadTables();
    loadMenu();
    loadTakeOutBills();
  }, [launchingState, dispatch]);



  // Load Tables data
  const loadTables = async () => {
    setLaunchingState(prev => ({
        ... prev, 
        message: "Loading Tables"
      }))
    try {
      await dispatch(fetchTables()).unwrap();

    } catch (err) {
      setLaunchingState({
        state: "ERROR",
        message: `Failed to load Tables due to ${err.message}`
      })
    
    }
  }
  // Load menu data
  const loadMenu = async () => {
    // Indicate loading status
      setLaunchingState(prev => ({
        ... prev, 
        message: "Loading Menu"
      }))


    try {
      await dispatch(fetchMenu()).unwrap();

    } catch (err) {
      setLaunchingState({
        state: "ERROR",
        message: `Failed to load menu due to ${err.message}`
      })
    }
  }


  // Load take out bills 
  const loadTakeOutBills = async () => {
    setLaunchingState(prev => ({
        ... prev, 
        message: "Loading Bills"
      }))
    try {
      await dispatch(fetchTakeOutBills()).unwrap();
      setLaunchingState({
        state: "READY",
        message: null,
      })

    } catch (err) {
      setLaunchingState({
        state: "ERROR",
        message: `Failed to load bills due to ${err.message}`
      })
      

    } 
 
  }


  return launchingState;


}

function useWebSocketTables() {
  const [socketError, setSocketError] = useState(null);
  const dispatch = useDispatch();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    let socket;
    try {
      socket = new WebSocket(`ws://localhost:8000/ws/table/?token=${token}`);

      socket.onmessage = (e) => {
        try {
          const updatedTable = cleanTable(JSON.parse(e.data));
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

export default App;