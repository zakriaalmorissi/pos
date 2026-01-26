import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import style from './Home.module.css';
import {
  AlignJustify,
  ArrowLeftRight,
  ChartArea,
  Laptop2,
  ScrollText,
  ShoppingBasket,
  User,
  Wifi,
  XCircleIcon,
} from 'lucide-react';
import { ProcessingIndicator, TimeoutErrorMessageIndicator, TimeoutMessageIndicator} from '../components/components.jsx';
import useInitializeHomeData from './homeInitialization.jsx';


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
  const navigate = useNavigate();
  const [displayMenu, setDisplayMenu] = useState(false);


  const onNavigate = () => {
    navigate('/admin');
  };

  // View errors sets
  const viewError = {
      transformingError: processingModel.action === "movingData" &&
        processingModel.processingFailure && <TimeoutErrorMessageIndicator 
          message={processingModel.failureMessage}
          resetState={()=> resetState()}
         
         />

  };

  return (
    <div className={style.main}>
      <div className={style.header}>
        <div className={style.headerContents}>
          <div>
            <button onClick={() => setDisplayMenu(true)}>
              <AlignJustify size={32} fontWeight={800} />
            </button>
          </div>
          <h3>Pos System</h3>
          <div className={style.headerRightButtons}>
            <button
              onClick={()=> uiModeModel.changeMode()}
              style={  { backgroundColor: uiModeModel.mode === "select" && 'red',
                 color:  uiModeModel.mode === "select" && 'white' }}
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

      <div className={style.floorAndTableContainer}>
        <div className={style.floorContainer}>
          <div className={style.floorContents}>
            {floors.map((floor) => {
              return (
                <button key={floor.id} onClick={() => getRelatedTables(floor.id)}>
                  {floor.name}
                </button>
              );
            })}
          </div>
        </div>

        { uiModeModel.mode === "select"? (
            <SelectTableMode tables={currentTables} onTableClick={getClickedTable}/>
        
        ):<TablesComponent tables={currentTables}/>
      
      }
      </div>

      {displayMenu && (
        <div className={`${style.menuContainer} ${displayMenu ? style['menuContainer--visible'] : ''}`}>
          <XCircleIcon size={40} onClick={() => setDisplayMenu(false)} />

          <div className={style.menuButtonsContainer}>
            <button onClick={onNavigate}>
              <User />
              <p>Admin</p>
            </button>
            <button>
              <ChartArea />
              <p>Statistics</p>
            </button>
            <button>
              <ScrollText />
              <p>Bill Viewer</p>
            </button>
            <button onClick={() => navigate('/devices')}>
              <Laptop2 />
              <p>Devices</p>
            </button>
          </div>
        </div>
      )}
      
      {viewError.transformingError}
    </div>
  );
}



function TablesComponent ({tables}) {
  const [timerMessage, setTimerMessage] = useState({
    show: false,
    message: ""
  })

  const notifyUser = (table) => {
     setTimerMessage({
      show: true,
      message: table.status.note
     })
  }

  return  <div className={style.devMainTables}>
            {tables?.map((table) => (
              <TableCard key={table.id} table={table}
                  notifyUser={notifyUser}
                  isNavigate={true}
                  
                  />
            ))}

          {
            timerMessage.show && <TimeoutMessageIndicator message={timerMessage.message} timer={3000} 
            resetState = {() => {
              setTimerMessage({
                show: false, 
                message: ""
              })
            }}/>
          }
          </div>
}



function SelectTableMode ({tables, onTableClick}) {

  // Get the tables from here 
  // Transforming tables is from here;


  return <div className={style.devMainTables} >
      <TimeoutMessageIndicator  message={"Select Table Mode"}  timer={"infinite"} />
      {
        tables?.map((table) => <TableCard key={table.id}  table={table} onClicked={onTableClick} isNavigate={false} />)
      }
  </div>

}


// ---------------------- Table component ----------------------
function TableCard({ table, isNavigate, onClicked, notifyUser }) {
  const isClicked = useRef(false);

  useEffect(() => {
    isClicked.current = false;
  }, [table?.id, isNavigate]);

  const handleOnClick = (tableId) => {
    isClicked.current = true;
    onClicked(tableId)
  
  };



  
  const className = `
        ${style.singleTable}
        ${table.status.status === "occupied"
          ? style["occupied"]
          : table.hasOrders
              ? style.hasOrders
              : style["available"]
        }
    `;

  // If the table is occupied → just show the box with no click actions
  if (table.status.status === "occupied") {
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

  // If navigate mode is on → tables act as links
  if (isNavigate) {
    return (
      <div className={style.singleTableContainer}>
        {table.countedBills > 1 && (
          <p className={style.countedBills}>{table.countedBills}</p>
        )}
        <Link className={className} to={`/home/singleTable/${table.id}`}
          state={
            // Send table data instead of refecthing 
            {table: table}
          }
        >
          {table.name}
        </Link>
      </div>
    );
  }

  // Transfer/select mode: Table has orders and is clicked
  if (isClicked.current && table.hasOrders ) {
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
