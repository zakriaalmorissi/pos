import {Routes , Route, useNavigate} from 'react-router-dom';
import { Home} from '../ui/home/home';
import  SingleTable  from '../ui/main/table/singleTable';
import { BillsHome } from '../ui/main/tabkeOutBills/main';
import {SingleBill} from '../ui/main/tabkeOutBills/singleBill'

export default function AppRoutes() {


    return  <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/home' element={<Home/>}/>
            <Route path='home/singleTable' element={<SingleTable/>}/>
            <Route path='/billsHome' element={<BillsHome/>}/>
            <Route path='/singleBill/:id' element={<SingleBill/>}/>
            <Route path='*' element={<h1>Page not found</h1>}/>
    </Routes>

}


export function ProtectedRoutes ()  {}