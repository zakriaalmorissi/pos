import React, { useEffect, useState } from 'react';
import {  Link, useNavigate } from 'react-router-dom';
import { fetchData, postData, updateData } from '../network/api.ts';
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
import { ProcessingIndicator, TimeoutErrorMessageIndicator } from './components/components.jsx';
import { fetchSystem } from './dataProvider/systemProvider/system.js';
import { useDispatch, useSelector } from 'react-redux';
import { cleanTable, fetchTables, updateTables } from './dataProvider/tablesProvider/tablesProvider.js';

// 1. Tables
// 2. Menu
// 3. Take out Bills 
// 4. 

// ---------------------- Home (main UI) ----------------------
export function Home() {
  const { tables } = useSelector((state) => state.tables);
  const [currentTables, setCurrentTables] = useState([]);
  const [floors, setFloors] = useState([]);
  const [fetchingError, setFetchingError] = useState(null);
  const [isNavigateTables, setIsNavigateTables] = useState(true);

  const [isTransforming, setIsTransforming] = useState(false);
  const [transformError, setTransformingError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [socketError] = useWebSocketTables();
  const [firstPressedTable, setFirstPressedTable] = useState(null);
  const [displayMenu, setDisplayMenu] = useState(false);

  // Get the floors data
  useEffect(() => {
    fetchData(`${url}api/floors/`, {
      getData: (response) => {
        setFloors(response.data);
        setFetchingError(null);
      },
      apiError: (error) => {
        if (error.status === '401') {
          navigate('/login');
        } else {
          setFetchingError(`Failed to fetch data due to ${error.status}`);
        }
      },
    });
    // only run on mount or if dispatch/navigate change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRelatedTables = (floorId) => {
    // Store the last fetched floor
    window.localStorage.setItem('floorId', floorId);
    const tbles = tables.filter((table) => table.floorId === floorId);
    setCurrentTables(tbles);
  };

  useEffect(() => {
    const getLastFecthedFloor = window.localStorage.getItem('floorId');
    if (getLastFecthedFloor) {
      setCurrentTables(tables.filter((table) => table.floorId === parseInt(getLastFecthedFloor, 10)));
    } else {
      setCurrentTables(tables.filter((table) => table.floorId === 1));
    }
  }, [floors, tables, dispatch]);

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
    const IDS = firstPressedTable?.billIds;

    // If no bill IDs, short-circuit
    if (IDS.length === 0) {
      setTransformingError('No bills to transform.');
      setIsTransforming(false);
      return;
    }

    // Update bills sequentially and wait for responses
    Promise.all(
      IDS.map((id) => {
        const billUrl = `${url}api/bill/${id}/`;
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
          hasOrders: false, billIds: [], countedBills: 0
        }
        dispatch(updateTables(senderTable));
        // Then update the reciever table 
        updateRecieverTable(res)
        setIsTransforming(false);
        setIsNavigateTables(true);
        setFirstPressedTable(null);
        setTransformingError(null);
      })
      .catch((err) => {
        setTransformingError(`failed to transform table due to "${err?.message || err}"`);
        setIsTransforming(false);
      });

      const updateRecieverTable = (data) => {
      // Clone the existing table first (so we don’t mutate Redux state directly)
        let updatedTable = {
          ...table,
          billIds: [...(table.billIds || [])], // copy current billIds
        };

        // Add all new bill ids from the response
        data.forEach((d) => {
          updatedTable.billIds.push(d.data.id);
        });

        // Update other fields
        updatedTable.hasOrders = true;
        updatedTable.countedBills = updatedTable.billIds.length;

        console.log("Updated table:", updatedTable)

        // Dispatch redux update
        dispatch(updateTables(updatedTable));
};

  };
  const getClickedTable = (tableId) => {
    const tableArr = tables.filter((t) => tableId === t.id);
    if (!tableArr || tableArr.length === 0) return;
    const table = tableArr[0];

    if (!firstPressedTable && table.hasOrders) {
      setFirstPressedTable(table);
      return;
    }
    if (table === firstPressedTable) {
      setFirstPressedTable(null);
      return;
    }
    if (firstPressedTable) transFormBill(table);
  };

  const onNavigate = () => {
    navigate('/admin');
  };

  // View errors sets
  const viewError = {
    socketError: socketError && <TimeoutErrorMessageIndicator message={socketError} />,
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
        ) : (
          <div className={style.devMainTables}>
            {currentTables.map((table) => (
              <Table key={table.id} table={table} isNavigate={isNavigateTables} onClicked={getClickedTable} />
            ))}
          </div>
        )}
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

      {viewError.socketError}
      {viewError.transformingError}
    </div>
  );
}

// ---------------------- useInnerTable hook ----------------------
function useInnerTable(table) {
  const [updatedTable, setTable] = useState(table);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    setTable(table);
    setIsClicked(false);
  }, [table]);

  return [updatedTable, isClicked, setIsClicked];
}

// ---------------------- Table component ----------------------
function Table({ table, isNavigate, onClicked }) {
  const [updatedTable, isClicked, setIsClicked] = useInnerTable(table);

  const handleOnClick = (tableId) => {
    // update the local state
    setIsClicked(!isClicked);
    onClicked(tableId);
  };

  const className = `
        ${style.singleTable}
        ${updatedTable.status === 'occupied' ? style["occupied"] :
    updatedTable.hasOrders ? style.hasOrders : style[updatedTable.status]}
    `;

  if (updatedTable.status === 'occupied') {
    return <div className={style.singleTableContainer}> <div className={className}>{table.name}</div> </div>;
  }

  if (isNavigate) {
    return (
    <div className={style.singleTableContainer}>
      { table.countedBills > 1 && <p className={style.countedBills}>{table.countedBills}</p>}
      <Link className={className} to={`/home/singleTable/${table.id}`}>
          {table.name}
      </Link>

    </div>
     
    );
  }

  // transfer / select mode
  if (isClicked && updatedTable.hasOrders) {
    return (
     <div className={style.singleTableContainer}>
        <button className={className} style={{ backgroundColor: 'red' }} onClick={() => handleOnClick(table.id)}>
          {table.name}
        </button>
     </div> 
   
    );
  }

  return (
    <div className={style.singleTableContainer}>
      <button className={className} onClick={() => handleOnClick(table.id)}>
      {table.name}
      </button>
    </div>
  
  );
}

// ---------------------- useWebSocketTables hook ----------------------
function useWebSocketTables() {
  const [socketError, setSocketError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    let socket;
    try {
      socket = new WebSocket('ws://localhost:8000/ws/table/');

      socket.onmessage = (e) => {
        try {
          const updatedTable = cleanTable(JSON.parse(e.data));
          dispatch(updateTables(updatedTable));
        } catch (err) {
          console.error('Failed to parse WS message', err);
        }
      };

      socket.onerror = (error) => {
        setSocketError('Ooops .. Failed to connect to other devices !');
      };

      socket.onclose = (event) => {
        if (!event.wasClean) {
          setSocketError('Connection closed unexpectedly');
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket', err);
      setSocketError('Ooops .. Failed to connect to other devices !');
    }

    return () => {
      try {
        if (socket) socket.close();
      } catch (err) {
        // ignore
      }
    };
  }, [dispatch]);

  return [socketError];
}
