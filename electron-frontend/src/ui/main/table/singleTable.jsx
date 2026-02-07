import { useNavigate, useSearchParams} from "react-router-dom";
import { useState, useEffect, useContext, useMemo} from "react";
import style from './../style/table.module.css';
import { TableProvider, TableContext} from "../provider/provider.jsx"
import { Header } from "./Header.jsx";
import { Bill } from "../components/bill/Bill.jsx";
import { StepBackIcon} from "lucide-react";
import { ProcessingIndicator} from "../../components/components.jsx";
import { useDispatch, useSelector } from "react-redux";
import BillForm from "../components/bill/billForm.jsx";
import { createBill, fetchBill} from "../../../dataProvider/billProvider/billSilce.js";
import BillCard from "../components/bill/BillCard.jsx";
import {  useTableWebSocket } from "./tableActions.jsx";
import { LoadingSpinner } from "../components/components.jsx";
import { TABLE_ACTIONS } from "./tableConsistents.js";




export default function SingleTable() {
    const [searchParams] = useSearchParams();
    const tableId = Number(searchParams.get('tableId'));
    const floorId = Number(searchParams.get("floorId"));
    const {floors} = useSelector(s => s.floors);
    const table = useMemo(()=> {
        // stop searching if no floorId or tableId 
        if (!tableId || !floorId) return null;
        const floor = floors.find((flr) => flr.id === floorId);
        const table = floor?.tables.find(tbl => tbl.id === tableId);
       // console.log("Memo is called from the single table component");
        return table;

    }, [floorId, tableId, floors]);


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
    const {tableAction, socketModel, resetSocketModel} =  useTableWebSocket(table);
   
 

    const [viewsModel, setViewsModel] = useState({
        createBill: table.bills.length === 0,
        selectBill: table.bills.length > 0,
    });

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

    const billFailure = async () => {
        // Clear the bill error and other cache data 
        // Nagivate home and release the table 
        tableAction.releaseTable();
    }

    const Processindicators = {
        "creatingBill": creatingBill && <ProcessingIndicator 
            isLoading={creatingBill}
            errorMessage={creatingBillError?.message}
            onIgnore={billFailure}
        
        />,
        "loadingBill": <ProcessingIndicator 
                            isLoading={loading}
                            errorMessage={loadingBillError}
                            onIgnore={billFailure}
                            
                        />,
        "UpdatingBill": null,
        occupying: (<ProcessingIndicator 
            isLoading={socketModel.action === TABLE_ACTIONS.OCCUPYING}
            action={socketModel.message}
            errorMessage={socketModel.failure && socketModel.failureMessage}
            onIgnore={resetSocketModel}
            buttonLabel={"OK"}
            />)
    
    }

    const views = {
        billForm: <BillForm 
            onSubmit={createTableBill}
            onBack={tableAction.releaseTable}
        />,
        selectedBill: <BillSelectionView 
            processingIndicator = {Processindicators.occupying}
            table={table}
            bills={table.bills} 
            onBack={tableAction.releaseTable}
            selectedBill={selectTableBill} />
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


function BillSelectionView ({bills, 
    selectedBill, 
    table, onBack,
    processingIndicator}) {
    
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
            {processingIndicator}
        </div>
}




