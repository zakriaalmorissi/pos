import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {  updateTables } from '../../dataProvider/tablesProvider/tablesProvider.js';

import { moveTableData } from '../../dataProvider/tablesProvider/tableServices.js';



export default function useInitializeHomeData  () {
  const { floors } = useSelector((s) => s.floors);
  const [currentTables, setCurrentTables] = useState([]);
  const [firstPressedTable, setFirstPressedTable] = useState(null);
  const [processingModel, setProcessingModel] = useState({
    processing: false,
    message: "",
    action: "",
    processingFailure: false,
    failureMessage: "",
  })

  const dispatch = useDispatch();
  const [mode, setMode] = useState("main");


  // set the current tables 
  const getRelatedTables = (floorId) => {
    // break everthing if there are no floors 
    if (floors.length === 0) return;

    if (floorId) {
      // set the current tables according to the recieved floor id
      const floor = floors.find((flr) => flr.id === floorId)
      if (floor) {
        setCurrentTables(floor.tables);
        localStorage.setItem("floorId", floor.id);
        return;
      }
    }
    // if no floor id, retrieve the first floor tables;
    setCurrentTables(floors[0].tables);
  }


  useEffect(()=> {
    const storedId = Number(localStorage.getItem('floorId'));
    if (storedId) {
      getRelatedTables(storedId);
      return;
    }
    getRelatedTables();
  }, [floors]);


     
  const getClickedTable = (tableId) => {
    const table = currentTables.find((t) => t.id ===  tableId);
    if (!table) {
      setFirstPressedTable(null);
      return;
    }
  
    if (!firstPressedTable){
      if (table.hasOrders) {
        setFirstPressedTable(table);     }
     return;
    }

    // The second click
      transformTableData({ senderTable : firstPressedTable, receiverTable: table,});
      
  };

// mark the table as busy in the backend , not here for security and better performance

  const  transformTableData = async ({senderTable, receiverTable})  => {
    setProcessingModel( prev => ({
      ...prev,
      processing: true, 
      message: `Moving ${senderTable.name} data to ${receiverTable.name}`,
      action: "movingData",
    }));

    try {
     const response =  await moveTableData({senderTable: senderTable, receiverTable: receiverTable})


    } catch (error) {
        setProcessingModel({
          processing: false,
          message: "",
          action: "movingData",
          processingFailure: true,
          failureMessage: `Failed to move table data "${error.hint}"`
        })
    } finally {
      setFirstPressedTable(null);
      setMode("main");
    }
   
  }

  const afterMovingTableData  = () => {
    // do some clean up and resetting here 
  }
  const changeMode = () => {
    setMode(prev => prev === "select"? "main": "select");
  }

  const resetState = () => {
    // return the ui state into normal after a certain task
    setProcessingModel({
      processing: false,
      message: "",
      action: "",
      processingFailure: false,
      failureMessage: "",
    });

    if (mode === "select") setMode( "main");

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
    resetState: resetState

  }

}