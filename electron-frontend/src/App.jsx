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
  const {errorMessage, isLoading} = useInitializeData();
  const { socketError } = useWebSocketTables();
  

    
    if (isLoading || errorMessage) {
        return <ProcessingIndicator 
          isLoading={isLoading}
          message={errorMessage}
          buttonLabel={"Reload"}
          onIgnore={()=> {
            // Do some logic, like reloading the data or quiting the system
             window.location.reload()

          }}
        
        />
    }
    return <>
      <AppRoutes/>
       {socketError && <TimeoutErrorMessageIndicator message={socketError} />}
    </>


}

function useInitializeData () {
  const { loadingSystemData } = useSelector(
    (state) => state.system
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the system data 
  useEffect(()=> {
    // First step load the system data to get the most essential data 
     loadSystemData();
  }, [dispatch]);

  const loadSystemData = async () => {
    try {
      await dispatch(fetchSystem()).unwrap();

    } catch(err) {
      setErrorMessage(`Failed to load system data "${err.message}"`)
    }
  }


  // Authenticate the user 
  useEffect(()=> {
    // Wait till system data are loaded
    if (loadingSystemData) return ;
    refreshUserTokens();
  }, [loadingSystemData])

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
            setIsAuthenticating(false);
          } else {
            setIsLoading(false);
            console.log(response)
            navigate('/login'); 
          }
        },
      });

  };

  // Fetch other data after authentication
  useEffect(()=> {
    // Wait till loading system data and authenication process finished
    if (loadingSystemData || isAuthenticating) return;
    loadTables();
    loadMenu();
    loadTakeOutBills();

  }, [loadingSystemData, dispatch, isAuthenticating]);

  // Load Tables data
  const loadTables = async () => {
    try {
      
      await dispatch(fetchTables()).unwrap();

    } catch (err) {
      setErrorMessage(err.message);
    }
  }
  // Load menu data
  const loadMenu = async () => {
    try {
      await dispatch(fetchMenu()).unwrap();

    } catch (err) {
      setErrorMessage(`Failed to load menue due to ${err.message}`);
    }
  }


  // Load take out bills 
  const loadTakeOutBills = async () => {
    try {
      await dispatch(fetchTakeOutBills()).unwrap();
      setIsLoading(false);

    } catch (err) {
      setErrorMessage(`Failed to load take out bills --> ${err.message}`)
    } 
 
  }


  return { errorMessage, isLoading};


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