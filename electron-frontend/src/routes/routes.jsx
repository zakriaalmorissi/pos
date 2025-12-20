import {Routes , Route, useNavigate} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Home} from '../ui/home';
import FoodForm from '../ui/admin/foodForms/foodForm';
import AdminHome from '../ui/admin/admin';
import TablesForm from '../ui/admin/tablesForm/tablesForm';
import  SingleTable  from '../ui/main/table/singleTable';
import { BillsHome } from '../ui/main/tabkeOutBills/main';
import {SingleBill} from '../ui/main/tabkeOutBills/singleBill'
import { LoginForm } from '../ui/admin/userForm/login';
import { RegisterForm } from '../ui/admin/userForm/register';
import { ListDevices } from '../ui/admin/userManagement/userDevices';
import { RegisterUser } from '../ui/admin/userManagement/registerUser';
import { ListUsers } from '../ui/admin/userManagement/users';
import MenuManagement from '../ui/admin/manageMenu/menuManagement';

export default function AppRoutes() {


    return  <Routes>
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
                    <Route path='/menu-management' element={<MenuManagement/>}/>
    
    </Routes>

}