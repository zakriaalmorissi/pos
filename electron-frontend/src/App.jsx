import {Routes , Route, useNavigate} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Home} from './ui/home';
import FoodForm from './ui/admin/foodForms/foodForm';
import AdminHome from './ui/admin/admin';
import TablesForm from './ui/admin/tablesForm/tablesForm';
import  SingleTable  from './ui/main/table/singleTable';
import { BillsHome } from './ui/main/bill/main';
import { SingleBill } from './ui/main/bill/singleBill';
import { LoginForm } from './ui/admin/userForm/login';
import { RegisterForm } from './ui/admin/userForm/register';
import { ListDevices } from './ui/admin/userManagement/userDevices';
import { RegisterUser } from './ui/admin/userManagement/registerUser';
import { ListUsers } from './ui/admin/userManagement/users';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenu } from './dataProvider/menuProvider/menuProvider';
import { fetchTables } from './dataProvider/tablesProvider/tablesProvider';
import { fetchSystem } from './dataProvider/systemProvider/system';
import style from './ui/Home.module.css';
import { postData } from './network/api';
import { url } from './network/constants';
import { AwardIcon } from 'lucide-react';
import { fetchTakeOutBills } from './dataProvider/takeOutBillsProvider/takeOutBillsProvider';


function App () {
  const { systemData, loadingSystemData, loadingSystemDataError } = useSelector(
    (state) => state.system
  );
  const { loadingTables, loadingTablesError } = useSelector((state) => state.tables);
  const { loadingMenu, loadingMenuError } = useSelector((state) => state.menu);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // Fetch system info on mount
  useEffect(() => {
    dispatch(fetchSystem());
  }, [dispatch]);

  // Authenticate the user when system data finishes loading
  useEffect(() => {
    if (loadingSystemData) return;
    refreshUserTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingSystemData]);

  const refreshUserTokens = async () => {
    const accessToken = window.localStorage.getItem('accessToken');
    if (!accessToken) {
      setIsAuthenticating(false);
      navigate('/login');
      return;
    }

    try {
      // assume postData returns a Promise
      await postData(`${url}accounts/refresh/`, {
        data: { refresh: window.localStorage.getItem('refreshToken') },
        getResponse: (response) => {
          if (response.status === 'ok') {
            window.localStorage.setItem('accessToken', response.data.access);
            setIsAuthenticating(false);
          } else {
            navigate('/login'); 
          }
        },
      });
    } catch (err) {
      // network or unexpected error
      console.error('refresh token failed', err);
      navigate('/login');
    }
  };

  // Load other data once authentication and system data are ready
  useEffect(() => {
    if (loadingSystemData || isAuthenticating) return;
    dispatch(fetchTables());
    dispatch(fetchMenu());
    loadTakeOutBills()
  
  }, [loadingSystemData, dispatch, isAuthenticating]);

  const loadTakeOutBills = async () => {
    try {
       await dispatch(fetchTakeOutBills()).unwrap();
    } catch (err) {
      console.log(err)
    } 
 
  }

  // Sync loading state
  useEffect(() => {
    setIsLoading(loadingSystemData || loadingTables || loadingMenu);
  }, [loadingSystemData, loadingTables, loadingMenu]);

  // Sync error message
  useEffect(() => {
    setErrorMessage(loadingSystemDataError || loadingTablesError || loadingMenuError);
  }, [loadingSystemDataError, loadingTables ,loadingTablesError, loadingMenuError]);

  function LoadingSystemInfoIndicator() {
    return (
      <div className={style.loadingSystemInfoIndicator}>
        {!errorMessage && (
          <div>
            <p>Loading .....</p>
            <div className={style.indicator}>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        {errorMessage && (
          <div>
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
    );
  }
    if (isLoading) {
        return <LoadingSystemInfoIndicator/>
    }
    return <>
            <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='/home' element={<Home/>}/>
                <Route path='/admin' element={<AdminHome/>}/>
                <Route path='/food/:category' element={<FoodForm/>}/>
                <Route path='/tablesForm' element={<TablesForm/>}/>
                <Route path='home/singleTable/:id' element={<SingleTable/>}/>
                <Route path='/billsHome' element={<BillsHome/>}/>
                <Route path='/singleBill/:id' element={<SingleBill/>}/>
                <Route path='/login' element={<LoginForm/>}/>
                <Route path='/register' element={<RegisterForm/>}/>
                <Route path='/devices' element={<ListDevices/>}/>
                <Route path='/add-user' element={<RegisterUser/>}/>
                <Route path='*' element={<h1>Page not found</h1>}/>
                <Route path='/list-users' element={<ListUsers/>} />

            </Routes>
      
    </>


}

export default App;