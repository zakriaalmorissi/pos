
import { createContext, useState } from 'react';
import BootLoader from './components/BootLoader';
import AppRoutes from './routes/routes';
import { LAUNCHING_STATE } from './network/constants';

// Create a bootloader component 
// It loads system data and decides where to and what to render for the user 

export const LaunchStateContext =  createContext();


function LaunchStateProvider ({children})  {
    const [state, setInitState] = useState({
        value: LAUNCHING_STATE.INIT,
        message: null,
    })
    
  
  const changeLaunchingState = (payload) => {
  setInitState(prev => ({ ...prev, ...payload }));
  };


    return <LaunchStateContext.Provider value={{state, changeLaunchingState}}>
      {children}
    </LaunchStateContext.Provider>




}

function App () {
  return <LaunchStateProvider>
    <BootLoader>
        <AppRoutes/>
    </BootLoader>
  </LaunchStateProvider> 
    

 
}

export default App;
