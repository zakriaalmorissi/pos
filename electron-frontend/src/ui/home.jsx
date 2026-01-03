import React, { useEffect, useRef, useState } from 'react';
import {  Link, useNavigate } from 'react-router-dom';
import { fetchData,updateData } from '../network/api.ts';
import { url } from '../network/constants.js';
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
import { ProcessingIndicator, TimeoutMessageIndicator} from './components/components.jsx';
import { useDispatch, useSelector } from 'react-redux';
import {  updateTables } from '../dataProvider/tablesProvider/tablesProvider.js';



// ---------------------- Home (main UI) ----------------------

export function Home() {
  const { floors } = useSelector((state) => state.floors);
  const [currentTables, setCurrentTables] = useState([]);
  const [fetchingError, setFetchingError] = useState(null);
  const [isNavigateTables, setIsNavigateTables] = useState(true);

  const [isTransforming, setIsTransforming] = useState(false);
  const [transformError, setTransformingError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const [firstPressedTable, setFirstPressedTable] = useState(null);
  const [displayMenu, setDisplayMenu] = useState(false);

  // Get the floors data

  const fetchRelatedTables = (floorId) => {
    // Store the last fetched floor
    window.localStorage.setItem('floorId', floorId);
    const floor = floors.filter((floor) => floor.id === floorId);
    setCurrentTables(floor[0].tables);
  };

  useEffect(() => {
    const getLastFecthedFloor = window.localStorage.getItem('floorId');
    if (getLastFecthedFloor) {
      setCurrentTables(floors.filter((floor) => floor.floorId === parseInt(getLastFecthedFloor, 10)).tables|| []);
    } else {
      setCurrentTables(floors.tables?.filter((table) => table.floorId === 1)|| []);
    }
  }, [floors, dispatch]);




  const swichTransFormBillMode = () => {
    setFirstPressedTable(null);
    const floorId = parseInt(localStorage.getItem('floorId'), 10) || 1;
    fetchRelatedTables(floorId);
    setIsNavigateTables(!isNavigateTables);
  };

  const transFormBill = (table) => {
    // This will transform table's bills from one table to another
    // The table that sends the bills is gonna be totally empty , no bills no orders 
    // so { hasOrders: false, countedBills: 0, billIds: [] }
    if (!firstPressedTable) return;
    setIsTransforming(true);
    const bills = firstPressedTable?.bills;

    // If no bill IDs, short-circuit
    if (bills.length === 0) {
      setTransformingError('No bills to transform.');
      setIsTransforming(false);
      return;
    }

    // Update bills sequentially and wait for responses
    Promise.all(
      bills.map((bill) => {
        const billUrl = `${url}api/bill/${bill.id}/`;
        return new Promise((resolve, reject) => {
          updateData(
            billUrl,
            {
              data: { table: table.id },
              callbacks: {
                getResponse: (response) => {
                  resolve(response);
                },
                apiError: (responseError) => {
                  reject(responseError);
                },
              },
            }
          );
        });
      })
    )
      .then((res) => {
        // Response is gonna be a list of data
        // The response is gonna contain the id of the table that recieved the bills, transform bills, 
        /// First empty the sender table 
        const senderTable = {
          id: firstPressedTable?.id, 
          hasOrders: false, bills: [], countedBills: 0
        }
        dispatch(updateTables(senderTable));
        // Then update the reciever table 
        setIsTransforming(false);
        setIsNavigateTables(true);
        setFirstPressedTable(null);
        setTransformingError(null);
      })
      .catch((err) => {
        setTransformingError(`failed to transform table due to "${err?.message || err}"`);
        setIsTransforming(false);
      });


  };


  
  const getClickedTable = (tableId) => {
  
    const tableArr = tables.filter((t) => t.id ===  tableId);
    if (tableArr.length === 0) {
      setFirstPressedTable(null);
      return;
    }
    const foundTable = tableArr[0];
    if (foundTable.hasOrders) {
      setFirstPressedTable(foundTable);
    }
    // The second click
    if (foundTable?.id === firstPressedTable?.id) return;

    if (firstPressedTable && foundTable) {
      transFormBill(foundTable)
    }
     
    

  
  };

  const onNavigate = () => {
    navigate('/admin');
  };

  // View errors sets
  const viewError = {
    transformingError: isTransforming && (
      <ProcessingIndicator
        isLoading={isTransforming}
        message={transformError}
        onIgnore={() => setIsTransforming(false)}
      />
    ),
    loadDataError:
      fetchingError && (
        <div className={style.fetchErrorContainer}>
          <p>{fetchingError}</p>
        </div>
      ),
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
              onClick={swichTransFormBillMode}
              style={{ backgroundColor: !isNavigateTables && 'red', color: !isNavigateTables && 'white' }}
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
                <button key={floor.id} onClick={() => fetchRelatedTables(floor.id)}>
                  {floor.name}
                </button>
              );
            })}
          </div>
        </div>

        {viewError.loadDataError ? (
          viewError.loadDataError
        ) : isNavigateTables? (
            <TablesComponent tables={currentTables} isNavigateTables={isNavigateTables} getClickedTable={getClickedTable}/>
        
        ): <SelecTabletMode tables={currentTables} getClickedTable={getClickedTable}/>
      
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



function TablesComponent ({tables, isNavigateTables, getClickedTable }) {
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
                 isNavigate={isNavigateTables}
                  onClicked={getClickedTable} 
                  notifyUser={notifyUser}
                  
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

function SelecTabletMode ({tables, getClickedTable}) {

  return <div className={style.devMainTables}
      style={
        {
          padding: '5%'
        }
      }
  >
      <TimeoutMessageIndicator  message={"Select  a blue table"}  timer={"infinite"} />
      {
        tables?.map((table) => <TableCard  table={table} onClicked={getClickedTable} isNavigate={false} />)
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
  if (isClicked.current && table.hasOrders) {
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
