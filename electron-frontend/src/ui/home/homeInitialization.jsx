import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {  fetchTables, updateTables } from '../../dataProvider/tablesProvider/tablesProvider.js';
import { UI_MODE } from '../../network/constants.js';

import { moveTableData } from '../../dataProvider/tablesProvider/tableServices.js';



export default function useInitializeHomeData  () {
  const { floors } = useSelector((s) => s.floors);
  const [selectedFloorId, setSelectedFloorId] =  useState( ()=>{
    return Number(localStorage.getItem("floorId")) || null
    });
  const [processingModel, setProcessingModel] = useState({
    processing: false,
    message: "",
    action: "",
    processingFailure: false,
    failureMessage: "",
  })

  const [pressedTablesModel, setPressedTablesModel] = useState({
    firstPressedTable: null,
    secondPressedTable: null
  })

  const dispatch = useDispatch();
  const [mode, setMode] = useState(UI_MODE.MAIN);


  const currentTables = useMemo(()=> {
    console.log("Memo is called from the home component");
    // Break the process if there is no floors at all
     if (floors.length === 0) return [];
     // Get the latest fetched tables
     const floor = floors.find(flr => flr.id === selectedFloorId)
  
     return floor?.tables ?? floors[0]?.tables ?? []
  }, [selectedFloorId, floors]);


  // Set the current tables 
  const getRelatedTables = (floorId) => {
    if (!floorId) return;
    setSelectedFloorId(floorId);
  }

  useEffect(()=> {
    console.log("Effect from home com ran")
    if (selectedFloorId !== null) {
      localStorage.setItem("floorId", selectedFloorId);
    }
  }, [selectedFloorId]);

     
  const getClickedTable = (tableId) => {
    const table = currentTables.find((t) => t.id ===  tableId);
    if (!table) {
      setPressedTablesModel({
        firstPressedTable: null,
        secondPressedTable: null,
      })
      return;
    }
  
    if (!pressedTablesModel.firstPressedTable){
      if (table.hasOrders) {
        // Assign the first pressed Table 
        setPressedTablesModel({
          firstPressedTable: table,
          secondPressedTable: null, // Still null 
        })
        // Mark it as selected
        dispatch(updateTables({...table, selected: true}));
      }
     return;
    }

    if (pressedTablesModel.firstPressedTable?.id === table?.id) return;

    // The second click
      // Assign the second pressed table in order to use it in retry function
      setPressedTablesModel(prev => (
        {...prev, secondPressedTable: table}
      ));
      // Transform tables' data -> final stage
    transformTableData({ senderTable : pressedTablesModel.firstPressedTable, receiverTable: table,});
      
  };

  const  transformTableData = async ({senderTable, receiverTable})  => {
    // Start processing 
    setProcessingModel({
      processing: true, 
      message: `Moving ${senderTable.name} data to ${receiverTable.name}`,
      action: "movingData",
      processingFailure: false,
      failureMessage: '',
    });

    try {
      await moveTableData({senderTable: senderTable, receiverTable: receiverTable});
     // Update tables 
      dispatch(fetchTables());
      // reset the state 
      resetState();
     
    } catch (error) {
        const errorMessage = error?.hint || error?.message || "Unknown error occurred";
        setProcessingModel(prev => ({
          ...prev,
          action: "movingData",
          processingFailure: true,
          failureMessage: `Failed to move table data: ${errorMessage}`
        }))
    }
  }


  const changeMode = () => {
    setMode(prev => prev === UI_MODE.SELECT? UI_MODE.MAIN: UI_MODE.SELECT);
 
  };

  // reset the table state 
  useEffect(()=> {
    const cachePressedTables = pressedTablesModel.firstPressedTable || pressedTablesModel.secondPressedTable;

    if (mode === UI_MODE.MAIN && cachePressedTables) {
      dispatch(updateTables({...pressedTablesModel.firstPressedTable, selected: false}));
      setPressedTablesModel({
        firstPressedTable: null,
        secondPressedTable: null,
      })
    }

  }, [mode, pressedTablesModel, dispatch]);


  const resetState = () => {
    // return the ui state into normal after a certain task
    setProcessingModel({
      processing: false,
      message: "",
      action: "",
      processingFailure: false,
      failureMessage: "",
    });
    if (mode === UI_MODE.SELECT) setMode(UI_MODE.MAIN);

  }

  const retryMovingTableData = async () => {
    setProcessingModel({
        processing: false,
        message: "",
        action: "",
        processingFailure: false,
        failureMessage: ""
      })
      const cachePressedTables = pressedTablesModel.firstPressedTable && pressedTablesModel.secondPressedTable;
      if (cachePressedTables){
        // Resend the data automatically 
       await transformTableData({
          senderTable: pressedTablesModel.firstPressedTable,
          receiverTable: pressedTablesModel.secondPressedTable
        })
      } 
  }



  return {
    currentTables: currentTables,
    floors: floors.map((floor) => ({id: floor.id, name: floor.name })),
    getRelatedTables: getRelatedTables,
    getClickedTable: getClickedTable,
    processingModel: processingModel,
    uiModeModel: {
      mode: mode,
      changeMode: changeMode
    },
    resetState: resetState,
    retryMovingTableData: retryMovingTableData
  

  }

}