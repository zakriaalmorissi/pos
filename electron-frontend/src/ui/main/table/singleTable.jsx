import { useParams} from "react-router-dom";
import { useState, useEffect, useContext} from "react";
import style from './../style/table.module.css';
import { TableProvider, TableContext} from "../provider/provider.jsx"
import { Header } from "./Header.jsx";
import { Bill } from "../components/bill/Bill.jsx";
import { StepBackIcon} from "lucide-react";
import { ProcessingIndicator} from "../../components/components.jsx";
import { useDispatch, useSelector } from "react-redux";
import BillForm from "../components/bill/billForm.jsx";
import { createBill, fetchBill} from "../../../dataProvider/billProvider/billSilce.js";
import { LoadingSpinner } from "../components/components.jsx";
import BillCard from "../components/bill/BillCard.jsx";
import {  useTableWebSocket, usetableWebSocketReleasingListener } from "./tableActions.jsx";




export default function SingleTable() {
    const { id } = useParams();
    const tableId = Number(id);
    const {tables} = useSelector(s => s.tables);
    const [table, setTable] = useState(null);
 


    useEffect(()=> {
        const foundTable = tables.find(t=> t.id === tableId);
        setTable(foundTable || null);
        
    }, [id, tables]);
    if (!table) {
        return <LoadingSpinner/>
    }

  return (
    <TableProvider>
      <DisplayTable table={table} />
    </TableProvider>
  );
}


function DisplayTable ({table}) {
    
    const {orderStatus} = useContext(TableContext);
    const dispatch = useDispatch();
    const socketListener =  usetableWebSocketReleasingListener(table);
    const {socketError, isProcessing, data, tableAction} =  useTableWebSocket(table)
   
 

    const [viewsModel, setViewsModel] = useState({
        createBill: table.bills.length === 0,
        selectBill: table.bills.length !== 0,
    });

    const [occupyError, setOccupyError] = useState(null);
    const {
        bill, 
        loading, loadingBillError, 
        creatingBill, 
        creatingBillError
    } = useSelector((state)=> state.bill);

    // Fetch the bill if only one exists

    const createTableBill = (data) => {
        data = {...data, table: table.id};
        dispatch(createBill(data));
        setViewsModel({...viewsModel, createBill: false});
    }

    const selectTableBill = (bill) => {
        // Feed the provider with the selected bill  
        dispatch(fetchBill(bill.id));
        setViewsModel({...viewsModel, selectBill: false})
    }


    // Display the bill form 
    const onCreateNewBill = () => {
        setViewsModel(prev => ({...prev, createBill: true}))

    }
    const views = {
        billForm: <BillForm 
            onSubmit={createTableBill}
            onBack={tableAction.releaseTable}
        />,
        selectedBill: <BillSelectionView 
            table={table}
            bills={table.bills} 
            onBack={tableAction.releaseTable}
            selectedBill={selectTableBill} />
    }

    const billFailure = async () => {
        // Clear the bill error and other cache data 
        // Nagivate home and release the table 
        tableAction.releaseTable();
    }

    const Processindicators = {
        "creatingBill": creatingBill && <ProcessingIndicator isLoading={creatingBill}
            message={creatingBillError?.message}
            onIgnore={billFailure}
        
        />,
        "loadingBill":  loading && <ProcessingIndicator 
                            isLoading={loading}
                            message={loadingBillError}
                            onIgnore={billFailure}
                            
                        />,
        "UpdatingBill": null,
    
    }



    return viewsModel.selectBill ? views.selectedBill: 
        
        <div className={style.tableContainer}>
    
            <Header tableName={table.name}/>
            <Bill 
                table={table} // 
                orderStatus={orderStatus} 
                handleCompleteAction={tableAction.releaseTable}
                creatNewBill={onCreateNewBill}            
            />
             
               
                    {Processindicators.creatingBill}
                    {Processindicators.loadingBill}
                    {Processindicators.UpdatingBill}
                    {viewsModel.createBill && views.billForm}
                </div>
}


function BillSelectionView ({bills, selectedBill, table, onBack}) {
    
    return <div className={style.chooseBillContainer}>
            <div className={style.topChooseBillContainer}>
                <button onClick={onBack}>
                    <StepBackIcon size={40}/>
                    <p>Back</p>
                </button>
                  
            
                <h3>Table no: {table?.name}</h3>
            </div>
            <div className={style.chooseBillContent}>
                {
                    bills.map((bill) =>  <BillCard key={bill.id} bill={bill}  onPress={selectedBill} />)  
                }
            </div>
       
        </div>
}




