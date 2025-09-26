import { Link, useNavigate, useParams} from "react-router-dom";
import { useState, useEffect, useRef, useContext} from "react";
import { fetchData, postData } from "../../../network/api.ts";
import { url } from "../../../network/constants.js";
import style from './../style/table.module.css';
import { TableProvider, TableContext} from "../provider/provider.jsx"
import { Header } from "../components/Header.jsx";
import { Bill } from "../components/Bill.jsx";
import { StepBackIcon} from "lucide-react";
import { ProcessingIndicator, TimeoutErrorMessageIndicator } from "../../components/components.jsx";
import { Provider, useDispatch, useSelector } from "react-redux";
import BillForm from "../components/billForm.jsx";
import { createBill, fetchBill, clearBill} from "../../dataProvider/billProvider/billSilce.js";
import { clearOrders } from "../../dataProvider/orderProvider/orderSlice.js";
import { LoadingSpinner } from "../components/components.jsx";
import { fetchTables } from "../../dataProvider/tablesProvider/tablesProvider.js";


export default function SingleTable() {
    const { id } = useParams();
    const tableId = parseInt(id, 10);
    const { tables } = useSelector((s) => s.tables);
    const [table, setTable] = useState(null);
        

  useEffect(() => {
    if (tables && tables.length > 0) {
      const foundTable = tables.find((t) => t.id === tableId);
      setTable(foundTable || null);
      console.log("Found table:", foundTable);
    }
  }, [tableId, tables]); // depend on both

  if (!table) {
    return <LoadingSpinner />;
  }

  return (
    <TableProvider>
      <DisplayTable table={table} />
    </TableProvider>
  );
}


function DisplayTable ({table}) {
    const isOccupiedRef = useRef(false);
    const navigate = useNavigate()
    const {orderStatus} = useContext(TableContext);
    const user = JSON.parse(window.localStorage.getItem('user'));
    const dispatch = useDispatch();

    const [viewsModel, setViewsModel] = useState({
        createBill: table.billIds.length === 0,
        selectBill: table.billIds.length >= 2,
    });

    const [occupyError, setOccupyError] = useState(null);
  
    const {
        bill, 
        loading, error, 
        creatingBill, 
        creatingBillError
    } = useSelector((state)=> state.bill);



    // Handle releasing and and occupying indicator 
    // handle API errors and indicate API processing
  
    const occupyTable = async()=>{
        const URL = `${url}api/occupy_table/${table.id}/`
        await postData(URL, {
                getResponse: (response) => {
                    if (response.status === "ok") {
                       isOccupiedRef.current = true;
                       return;
                      
                    }    
                    // if error happens l'm gonna display a timer components 
                    // that indicates what happened 
                    setOccupyError(`Faild to occupy the table due to"${response.message}"`);
                }  
                });


    };
   
    useEffect(()=> {
        // clear bill 
        if(isOccupiedRef.current) return;
        occupyTable();
    }, []);

    useEffect(()=> {
        if (table.billIds.length === 1) {
            dispatch(fetchBill(table.billIds.at(0)))
        }
    }, [])


    useEffect (()=> {
        // Reeceive the release from the super admin or the admin
        // this happens when the admin wants to make a force release to the table
        const socket = new WebSocket('ws://localhost:8000/ws/release/');
        socket.onmessage = (e) => {
            const updatedUser = JSON.parse(e.data);
            if (updatedUser.id === user.id && !updatedUser.has_tables) {
                navigate("/");  
            }
        };

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        }

    }, []);


    const releaseTable =  async () => {
        dispatch(clearBill());
        dispatch(clearOrders());
        if (!isOccupiedRef.current) return; // if table is not occupied, never try to release it 
        const URL = `${url}api/release_table/${table.id}/`;
        await postData(URL, {
            getResponse: (response) => {
             isOccupiedRef.current = false;
             if (response.status === "ok"){
                return;
             }
            }
        });
      
      
    }

    useEffect(()=> {
        const handleBeforeUnload =  (event) => {
            releaseTable();
            event.returnValue = '';// why do we assign this to empty string ?
        }
        // these are not gonna be called unless the event listener has been called
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pagehide', handleBeforeUnload);

        return () => {
            releaseTable()
            window.removeEventListener('pagehide', handleBeforeUnload);
            window.removeEventListener('beforeunload', handleBeforeUnload);

        }
    },[])

    // no bill -> create bill -> feed the provider 
    // have one bill ->  feed the provider 
    // have more than one bill -> render the select component -> select one bill --> feed the provider 
    const handleCompleteAction =  async() => {
        await releaseTable();
        navigate('/home');
    };


    const createTableBill = (data) => {
        data = {...data, table: table.id};
        dispatch(createBill(data));
        setViewsModel({...viewsModel, createBill: false});

    }
    const selectTableBill = (id) => {
        // Feed the provider with the selected bill  
        dispatch(fetchBill(id));
        setViewsModel({...viewsModel, selectBill: false})
    }

    const views = {
        billForm: <BillForm onSubmit={createTableBill}/>,
        selectedBill: <BillSelectionView bills={table.billIds} selectedBill={selectTableBill} />
    }


    const Processindicators = {
        "creatingBill": creatingBill && <ProcessingIndicator isLoading={creatingBill}
            message={creatingBillError}
            onIgnore={()=> console.log("Ingoring create failure")}
        
        />,
        "loadingBill":  loading && <ProcessingIndicator 
                            isLoading={loading}
                            message={error?.message}
                            onIgnore={()=> console.log("eroro")}
                            
                        />,
        "UpdatingBill": null,
    
    }


    return viewsModel.selectBill ? views.selectedBill: 
        <div className={style.tableContainer}>
                    <Header tableName={table.name}/>
                    <Bill 
                        table={table} // 
                        handleCompleteAction={handleCompleteAction}
                        orderStatus={orderStatus}             
                    />
                    {
                
                        occupyError && <TimeoutErrorMessageIndicator message={occupyError} />
                    }
                    {Processindicators.creatingBill}
                    {Processindicators.loadingBill}
                    {Processindicators.UpdatingBill}
                    {viewsModel.createBill && views.billForm}
                </div>
}


function BillSelectionView ({bills, selectedBill}) {
    return <div className={style.chooseBillContainer}>
            <div className={style.topChooseBillContainer}>
                <Link to={"/"}>
                    <StepBackIcon size={40}/>
                    <p>Back</p>
                </Link>
            </div>
            <div className={style.chooseBillContent}>
                {
                    bills.map((billId) => <button
                    key={billId}
                    type="submit" 
                    onClick={()=> selectedBill(billId)}>Check {billId}</button>)   
                }
            </div>
       
        </div>



}



