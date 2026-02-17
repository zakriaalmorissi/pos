import style from './../style/table.module.css';
import { Header } from "./Header.jsx";
import { Bill } from "../components/bill/Bill.jsx";
import { StepBackIcon} from "lucide-react";
import { ProcessingIndicator} from "../../components/components.jsx";
import BillForm from "../components/bill/billForm.jsx";
import BillCard from "../components/bill/BillCard.jsx";
import {  useTableWebSocket } from "./tableActions.jsx";
import { TABLE_ACTIONS } from "./tableConsistents.js";
import useTableHook from "./useTableHook.jsx";
import Indicator from "../components/Indicator.jsx";




export default function SingleTable() {
   const {table, tableCrud, view, 
    tableProcessing, 
    resetModelProcessingState,
    changeTableOrdersStatus,
} = useTableHook();
    const {tableAction, socketModel, resetSocketModel} =  useTableWebSocket();

    const Processindicators = {
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
            onSubmit={tableCrud.createTableBill}
            onBack={tableAction.releaseTable}
        />,
        selectedBill: <BillSelectionView 
            processingIndicator = {Processindicators.occupying}
            table={table}
            bills={table.bills} 
            onBack={tableAction.releaseTable}
            selectedBill={(v) => tableCrud.selectTableBill(v)} />
    }



    return view === "selectBill" ? views.selectedBill: 
        <div className={style.tableContainer}>
            <Header 
                tableName={table.name}
                changeOrderStatus={changeTableOrdersStatus}
                overrideBillCustomer={tableCrud.updateTableBill}
                />
            <Bill 
                table={table} // 
                handleCompleteAction={tableAction.releaseTable}
                creatNewBill={null}            
            />
            {view === "createBill" && views.billForm}
            <Indicator 
                processingModel={tableProcessing}
                resetState={resetModelProcessingState}
            />
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




