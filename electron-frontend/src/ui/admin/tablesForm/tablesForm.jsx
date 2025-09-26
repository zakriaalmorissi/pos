import { useEffect, useState } from "react";
import { postData, fetchData, deleteData } from '../../../network/api.ts'
import { url } from "../../../network/constants.js";
import style from './style/CreateTables.module.css'
import { Link } from "react-router-dom";
import { StepBackIcon } from "lucide-react";





// Give the user options whether to create a new floor with new tables 
// or create new tables with an exsiting floor 
function TablesForm () {
    const [mode, setMode] = useState('existing');

    return <div className={style.tablesMainForm}>
        <div className={style.tableFormHeader}>
            <Link to={'/admin'}>
                <StepBackIcon/>
                <p>Back</p>
            </Link>
            <div className={style.tablesChooseFormButtons} >
                <button onClick={ ()=> setMode('new') } className={style.chooseButtons}>New Foor </button>
                <button onClick={()=> setMode('existing')} className={style.chooseButtons}>To Existed Floor</button>
            </div>

        </div>
         
         
             {
                mode === 'existing' && <CreateTablesWithExistedFloor/>
             }
             {
                mode === 'new' && <CreateTablesWithNewFloor/>
             }
            
        </div>
 
}

// One style for both components except the select element 
function CreateTablesWithNewFloor() {
    const [floorName, setFloorName] = useState("");
    const [tableName, setTableName] = useState("");
    const [createdFloor, setCreatedFloor] = useState({id: null, name: null})
    const [errorFloorMessage, setErrorFloorMessage] = useState({status: null, error: null, message: null})
    const [errorTableMessage, setErrorTableMessage] = useState({status: null, error: null, message: null})
    const [isChanged, setIsChanged] = useState(false);

    // Add more validation logic and provide better feedback to the user
    const onFloorSubmit = async () => {
        const floorURL = `${url}api/floors/`;
        if (floorName.trim() === '') {
            setErrorFloorMessage({
                status: 400,
                error: "floor name is requiered"
            });
            return;
        }
        await postData(floorURL, {
            data: {
                'name': floorName,
            },
            getResponse: (response) => {
                if (response.status !== "ok"){
                    setErrorFloorMessage(response.error) 
                    } 
                else { 
                    setCreatedFloor(response.data)
                    setErrorFloorMessage('')};
            }
        })
    }

    const onTableSubmit = async () => {
        const tableURL = `${url}api/create_table/${createdFloor.id}/`;
        await postData(tableURL, {
            data: {
                'floor': createdFloor.id,
                'name': tableName,
            },
            getResponse: (response) => { 
                if (response.status !== "ok"){
                   setErrorTableMessage(response.error);
                   console.log(response.error)
                } else {
                    setErrorTableMessage('');
                    setIsChanged(!isChanged);
                }
             }
        })
    }


    return <div className={style.tablesForm}>
        <div className={style.tableAndFloorInputContainer}>
            <h1>New Floor</h1>
            <div className={style.newFloorContainer}>
                <div className={style.newFloorInputContainer}>
                    <label htmlFor="floorName">Floor Name</label>
                    <input
                        id="floorName"
                        value={floorName} 
                        onChange={(e)=> setFloorName(e.target.value)}
                        placeholder="Floor Name"
                        disabled = {createdFloor.id !== null}
                    />
                    <button onClick={onFloorSubmit} disabled={createdFloor.id !== null} >Create</button>
                </div>
                <div className={style.errorMessageContainer}>
                {
                    errorFloorMessage.status !== null? <p>{errorFloorMessage.error}</p>: null
                }
            </div>
                    
        </div>
        <div className={style.newTableInputContainer}>
                <label htmlFor="tableName">Table Name</label>
                <input
                    id="tableName"
                    value={tableName}
                    onChange={(e)=> setTableName(e.target.value)}
                />

                <button onClick={onTableSubmit} disabled={createdFloor.id === null} >Create</button>
                
            </div>
            <div className={style.errorMessageContainer}>
                {
                 errorTableMessage.status !== null? <p>{errorTableMessage.error}</p>: null

                }
            </div>
        </div>
        <div className={style.createdTableContainer}>
            { 
            createdFloor.id !== null ?
            <CreatedTables id = {createdFloor.id} name={createdFloor.name} state={isChanged} />
            : <h1>No Floor</h1>
            }

        </div>
    </div>
}

function CreateTablesWithExistedFloor() {

    const [name, setName ] = useState('');
    const [selectedFloor, setSelectedFloor] = useState({id: null, name: null})
    const [errorMessage, setErrorMessage] = useState({status: null, error: null, message: null})
    const [floors, setFloors ] = useState([]);
    const [isChanged, setIsChanged] = useState(false);
    const [floorErrorMessage, setFloorErrorMessage] = useState({status: null, message: null})
 
    // get the floor values for the select options 
    useEffect(()=> {
        let floorURL = `${url}api/floors/`;
        fetchData(floorURL,{
            getData: (data) => {
                setFloors(data.data)},
            apiError: (error) => { console.log(error) }
        })
        

    },[])
    const onSubmit = async () =>  {
        // before submitting , i gotta check the selectedFloor value
        if (selectedFloor.id === null){
            setFloorErrorMessage({
                status: 404,
                message: "floor is not selected"
            })
            return;
        }
        const URL = `${url}api/create_table/${selectedFloor.id}/`;
        await postData(URL,{ data: {
            floor: selectedFloor,
            name : name, 
            status: "available"},
            getResponse: (res) => {
                if (res.status !== 'ok') {
                    setErrorMessage(res.error);
                    console.log(res.error)


                } else { 
                    setIsChanged(!isChanged);
                    setErrorMessage('');
                } // this may cause an errorn
            }
        })
    }
    const handleChange = (event) => {
        // Convert the targeted id into number
        const value = event.target.value;
        if (value === ""){
            setSelectedFloor({id: null, name: null});
            return;
        }
        setFloorErrorMessage('');
        const id = Number(value); // this is gonna return undefined if the value is not a number
        const selected = floors.find((floor)=> floor.id === id);
        setSelectedFloor(selected);
    }

    return <div className={style.tablesForm}>
        <div className={style.tableAndFloorInputContainer}>
            <h1>Pre-Selected Floor</h1>
            <div className={style.floorInputContainer}>
                <select value={selectedFloor.id || ''} onChange={handleChange} >
                    <option value="">Select The Floor</option>
                    {
                        floors.map((floor) => {
                            return <option key={floor.id} value={floor.id}>{floor.name}</option>
                        }) 
                    }
                </select> 
                <div className={style.errorMessageContainer}>
                    <p>{floorErrorMessage.status !== null && floorErrorMessage.message}</p>

                </div>

            </div>
            <div className={style.tableInputContainer}>
                <input 
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Table Name"
                />
                <div className={style.errorMessageContainer}>
                    {
                    errorMessage.status !== null && <p>{errorMessage.error}</p>
                    }

                </div>
                <button type="submit" onClick={onSubmit}>Create</button>
              
           
            </div>
        </div>
        <div className={style.createdTableContainer}>
            {
                selectedFloor.id !== null?
                <CreatedTables id = {selectedFloor.id} name ={selectedFloor.name} state={isChanged}/>
                : <h1>No Floor</h1>

            }
        </div>    
    </div>


}


function CreatedTables({id, name, state}) {
    // Fetch tables by their related floor 
    const [tables, setTables] = useState([]);
    const [selectedTables, setSelectedTable] = useState(new Set());
    const [deleteError, setDeleteError] = useState({status: null, error: null, message: null})

    useEffect(()=>{
        let URL = `${url}api/tables/${id}/`;
        fetchData( URL, {
            getData: (response) => {
                setTables(response.data);
                console.log("uploaded")
            },
            apiError: (res) => {console.log(`an error accurred ${res.error}`)}
        })
    }, [state, id]);

    // first step, get the id of the table
    const toggleSelection  = (tableID) => {

        setSelectedTable(prev => {
            //console.log(`those are the pre selected tables ${prev}`);
            const newSelection = new Set(prev);
            if (newSelection.has(tableID)) {
                newSelection.delete(tableID);
            } else {
                newSelection.add(tableID);
            }
           // console.log(`those are the new selections ${newSelection}`);
            return  newSelection;
        })

    }


    
    // then delete the select table, this may require a lot 
    const deleteSelectedTables = () => {
        selectedTables.forEach((table) => {
            const URL = `${url}api/delete_table/${table}/`;
            deleteData(URL, { 
                data: {},
                callbacks:{
                getResponse: (data) => {
                    console.log(data);
                    setTables(prev => prev.filter(table => !selectedTables.has(table.id)));
                },
                apiError: (error) => {
                    setDeleteError({
                        status: error.status,
                        error: error.error,
                        message: "faild to delete, " + error.message
                    })
                }
            }})
            
        })
        setSelectedTable(new Set()); // clear the selectTables 

    }

    // style the admin interface 
    // style the button 
    // sytle the  table container,
  
    return <div>
        <div>
            <div className={style.createdTablesHeader}>
                 <h2>{name}</h2>
                <button type="submit" onClick={deleteSelectedTables} className= { selectedTables.size === 0 ?
                style.hide  : style.deleteSelectedTablesButton
                } >Delete</button>
            </div>
            <div className={style.errorMessageContainer}>
               { deleteError.status !== null && <p>{deleteError.message}</p> }
            </div>
     
        </div>
        <div className={style.tablesGrid}>
            {
            tables.map((table)=> {

                return <p 
                        key={table.id}>
                            <input type="checkbox"
                                value={table.id}
                                onClick={(e) => toggleSelection(Number(e.target.value))}/> 
                                {table.name}
                        </p>
            })
            }

        </div> 
    </div>

}

export default TablesForm; 