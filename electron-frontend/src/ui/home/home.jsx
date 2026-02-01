import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import style from './Home.module.css';
import {
  ArrowLeftRight,
  ChartArea,
  HomeIcon,
  Laptop2,
  ScrollText,
  ShoppingBasket,
  User,
  Wifi,
} from 'lucide-react';
import { ProcessingIndicator, TimeoutErrorMessageIndicator, TimeoutMessageIndicator} from '../components/components.jsx';
import useInitializeHomeData from './homeInitialization.jsx';
import { TABLE_STATES, UI_MODE } from '../../network/constants.js';


// ---------------------- Home (main UI) ----------------------
// Display first group of tables if no group stored in the local storage 
// The transform table data mode and functionality
export function Home() {
 const {
  floors, 
  currentTables, 
  getRelatedTables, 
  getClickedTable,  
  processingModel,
  uiModeModel,
  resetState
 } = useInitializeHomeData();
  


  const transformingIndicator = processingModel.action === "movingData" &&
    processingModel.processing && <ProcessingIndicator
      isLoading={processingModel.processing}
      action={processingModel.message}
      errorMessage={processingModel.processingFailure && processingModel.failureMessage}
      buttonLabel={"Ok"}
      onIgnore={resetState}
    />

  return (
    <div className={style.home}>
      <MainHeader changeMode={uiModeModel.changeMode} mode={uiModeModel.mode}/>
      <div className={style.main}>
          <MainLeftSideComponent/>
          <div className={style.floorAndTableContainer}>

          { uiModeModel.mode === UI_MODE.SELECT? (
              <SelectTableMode tables={currentTables} onTableClick={getClickedTable}/>
          
          ):<TablesComponent tables={currentTables}/>
        
        }
          </div>
      </div>
      <MainBottomComponent floors={floors} getRelatedTables={getRelatedTables}/>
      {transformingIndicator}
    </div>
  );
}

function MainHeader ({changeMode, mode})  {
    const navigate = useNavigate();
    return <div className={style.header}>
        <div className={style.headerContents}>
          <h3>Pos System</h3>
          <div className={style.headerRightButtons}>
            <button
              onClick={()=> changeMode()}
              style={  { backgroundColor: mode === UI_MODE.SELECT && 'red',
                 color: mode === UI_MODE.SELECT && 'white' }}
            >
              <ArrowLeftRight size={32} />
            </button>
            <button onClick={() => navigate('/billsHome')}>
              <ShoppingBasket size={32} />
            </button>
            <button>
              <Wifi size={32} />
            </button>
          </div>
        </div>
      </div>

}


function MainLeftSideComponent () {
  const navigate = useNavigate();
  return (
        <div className={style.menuContainer}>
            <div className={style.menuButtonsContainer}>
              <User  onClick={()=> navigate("/admin")} />
              <ChartArea />
              <ScrollText/>
              <Laptop2 />
            </div>
        </div>
    )


}



function MainBottomComponent ({floors, getRelatedTables}) {
  return <div className={style.floorContainer}>
        <div className={style.floorContents}>
          {floors.map((floor) => {
            return (
                <button key={floor.id} onClick={() => getRelatedTables(floor.id)}>
                    <HomeIcon/>
                    <p>{floor.name}</p>
                 </button>
    
            );
          })}
        </div>
    </div>
}

function TablesComponent ({tables}) {
  // Display the default look of the tables
  const [timerMessage, setTimerMessage] = useState({
    show: false,
    message: ""
  })

  const notifyUser = (table) => {
     setTimerMessage({
      show: true,
      message: table.status?.note
     })
  }

  return  <div className={style.homeTableContainer}>
            {tables?.map((table) => (
              <DefaultTableCard 
                  key={table.id} 
                  table={table}
                  notifyUser={notifyUser}
              />
            ))}

          {
            timerMessage.show && <TimeoutMessageIndicator 
              message={timerMessage.message}
              timer={3000} 
              resetState = {() => {
                setTimerMessage({
                  show: false, 
                  message: ""
                })
            }}/>
          }
          </div>
}


function DefaultTableCard ({table, notifyUser}) {
  const className = `
        ${style.singleTable}
        ${table.status.status === TABLE_STATES.OCCUPIED
          ? style[TABLE_STATES.OCCUPIED]
          : table.hasOrders
              ? style.hasOrders
              : style[TABLE_STATES.AVAILABLE]
        }
    `;
  

  return <div className={style.singleTableContainer}>
      {
        table.countedBills > 1 && (
          <p className={style.countedBills}>{table.countedBills}</p>
        )
      }
      {
        table.status.status ===  TABLE_STATES.OCCUPIED? (
        <button 
          className={className}
          onClick={()=> notifyUser(table)}
          >
           {table.name}
        </button>

        ): <Link className={className} to={`/home/singleTable?floorId=${table.floorId}&tableId=${table.id}`}>
            {table.name}
        </Link>
      }
  </div>
}




function SelectTableMode ({tables, onTableClick}) {
  const [message, setMessage]  = useState({
    show: false, 
    mesg: "",
  });
  const notifyUser = (mesg) => {
    setMessage({
      show: true,
      mesg: "You cannot select an occupied table !"
    })

  }
  return <div className={style.homeTableContainer} >
      <TimeoutMessageIndicator  message={"Select Table Mode"}  timer={"infinite"} />
      {
        tables?.map((table) => <TableCard 
            key={table.id} 
            table={table} 
            onClicked={onTableClick}
            notifyUser={notifyUser}
         />)
      }
      {
        message.show && <TimeoutErrorMessageIndicator 
          message={message.mesg} 
          resetState={()=> {
            setMessage({
              show: false,
              mesg: ''
            })
        }} />
      }
  </div>

}


// ---------------------- Table component ----------------------
function TableCard({ table, onClicked, notifyUser}) {
  const isClicked = useRef(false);

  useEffect(() => {
    isClicked.current = false;
  }, [table?.id]);

  const handleOnClick = (tableId) => {
    isClicked.current = true;
    onClicked(tableId)
  
  };


  const className = `
        ${style.singleTable}
        ${table.status.status === TABLE_STATES.OCCUPIED
          ? style[TABLE_STATES.OCCUPIED]
          : table.hasOrders
              ? style.hasOrders
              : style[TABLE_STATES.AVAILABLE]
        }
    `;

   // If the table is occupied → just show the box with no click actions
  if (table.status.status === TABLE_STATES.OCCUPIED) {
    return (
      <div className={style.singleTableContainer}>
        <button 
          className={className}
          onClick={()=> notifyUser(table)}
          >
           {table.name}
        </button>
      </div>
    );
  }


  // Transfer/select mode: Table has orders and is clicked
  if (table.hasOrders && table.selected) {
    return (
      <div className={style.singleTableContainer}>
        <button
          className={className}
          style={{ backgroundColor: "red" }}
          onClick={() => handleOnClick(table.id)}
        >
          {table.name}
        </button>
      </div>
    );
  }


  // Default click mode
  return (
    <div className={style.singleTableContainer}>
          {table.countedBills > 1 && (
            <p className={style.countedBills}>{table.countedBills}</p>
          )}
    
        <button className={className} onClick={() => handleOnClick(table.id)}>
          {table.name}
        </button>
  </div>

  );
}


