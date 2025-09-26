import { act, useEffect, useState } from "react";
import {postData, fetchData} from "../../../network/api"
import {url} from '../../../network/constants.js'
import {ImageOff, StepBackIcon} from 'lucide-react'
import {useNavigate} from "react-router-dom"
import { LoadingSpinner } from "../../main/components/components.jsx";
import { ProcessingIndicator, WarningMessage } from "../../components/components.jsx";

import './user.css';
export function ListUsers() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMeassage, setErrorMessage] = useState('');
    const [processingError, setProcessingError] = useState(null)
    const navigate = useNavigate();

    const [warningModel, setWarningModel] = useState({
        show: false,
        type: null,  // Type of function or action that is gonna be performed
        user: null,
        message: '',
        onContinue: null
    })

    
    const hideWarning = () => {
        setWarningModel({
            show: false,
            type: null,
            user: null,
            message: "",
            onContinue: null,
        })
    }

    // Get all the users 
    useEffect(()=> {
        loadUsers()
    }, []);

    const  loadUsers = async () => {
    await fetchData(`${url}accounts/list-users/`,
        {
            getData:(response) => {
                setUsers(response.data)
                setIsLoading(false)
            },
            apiError: (responseError) => {
                setErrorMessage(responseError.error)

            }
        }
    );
}


    const processManageActivation = async (user, action) => {
        let activationWarnig = '';
        if (action === 'deactivate') {
            activationWarnig = "This action is gonna make the user unable to entre any table or perform any action !"
           
        }
        setWarningModel({
            show: true,
            type: "activation",
            user: user,
            message: activationWarnig,
            onContinue: () => manageActivation(user, action)

         })
       
    }
    const manageActivation = async (user, action) => {
        hideWarning();
        setIsProcessing(true)
        await postData(`${url}accounts/manage-user/${user.username}/`,
            {
                data: {"task": "activation", is_active: 'activate' === action},
                getResponse: (response) => {
                    if (response.status !== "ok"){
                        setProcessingError(response)
                        setIsProcessing(true);
                        return;
                    }
                    setIsProcessing(false);
                }
            }
        );

    }
    
    const  processReleaseUserTables = (user) => {
        setWarningModel({
            show: true,
            type: "release",
            user: user,
            message: "This action is gonna release the tables and fire the user from them !",
            onContinue: () =>  onReleaseUserTables(user),
        })
        
      
      
    }
    // Release the tablesz
    const onReleaseUserTables = async (user)=> {
        // Hide the warning before performing any action
        hideWarning();
        setIsProcessing(true);
        await postData(
            `${url}accounts/manage-user/${user.username}/`,
            {
                data: {"task": "release table"},
                getResponse:(response) => {
                    if (response.status !== "ok"){
                        setProcessingError(response)
                        return;
                    }
                    setIsProcessing(false)
                }
            }
        )
    }


    // Listen to updates from other users, like activation and releasing or occupying tables 
    useEffect(()=> {
        const socket = new WebSocket('ws:/localhost:8000/ws/user/');
        socket.onmessage = (e) => {
            const updatedUser = JSON.parse(e.data);
            setUsers(prev => prev.map((user)=> user.id === updatedUser.id? {...user, ...updatedUser}: user));
        }

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        }

    }, []);

    const onProcessCancel = () => {
        setIsProcessing(false)
        setProcessingError(null);

    }


    return <div className="users-container">
        
        
        <div className="users-header"> 
            <button onClick={()=> navigate("/admin")}>
                <StepBackIcon size={30}/>
                <p>Back</p>
            </button>
            <h2>Manage Users</h2>

        </div>
        { isLoading? <LoadingSpinner/> :<div className="users-body">
            { isProcessing && <ProcessingIndicator 
                isLoading={isProcessing} 
                message={processingError?.message}
                onIgnore={onProcessCancel}
                 /> 
            }
            {
                warningModel.show && <WarningMessage 
                    title={"Warning!"}
                    message={warningModel.message}
                    onContinue={warningModel.onContinue}
                    onCancel={hideWarning}
                />
                
            }
            {
                users.map((user)=> {
                return <SingleUser 
                    key={user.id}
                    user={user} 
                    onReleaseUserTables={processReleaseUserTables}
                    manageActivation={processManageActivation}
                />
            })
            }
         </div>
        }
         
            

    </div>
}


function SingleUser ({user, onReleaseUserTables, manageActivation}) {
    
    const handleOnReleaseClick  =  () => {
        onReleaseUserTables(user)
    }
    const handleDeactivation = () => {
        const updatedUser = {...user, is_active: false};
        manageActivation(updatedUser, 'deactivate'); 
    }
    const handleActivation = () => {
        const updatedUser = {...user, is_active: true};
        manageActivation(updatedUser), 'activate'; 

    }


    return <div className="singal-user-container" key={user.id}>
             <div className="singal-user-name-container">
                <div className="name">
                    <label htmlFor="name">Name:</label>
                    <p>{user.name}</p>
                </div>
                {user.is_superuser && <p className="state">Super User</p>}
                {!user.is_superuser && user.is_admin && <p className="state">Admin</p>}

             </div>
            <div className="singal-user-username-container">
                <label>Username:</label>
                <p>{user.username}</p>
            </div>
            <div className="singal-user-device-container">
                <p>Device: {user.device}</p>
                {
                    user.device !== 'unknown' && 
                    <button onClick={handleDeactivation}>Deactivate</button>
                }
            </div>
            <div className="singal-user-status">
                <label>Status:</label>
                <p>{user.has_tables ? "Busy": "Available"}</p>
                <div className={user.has_tables? "busy-status": "available-status"}></div>
            </div>
            
            { user.has_tables && <div className="singal-user-tables-container"> 
            <label>User Occupied Tables:</label>
                <div className="tables">
                    {user.user_table.map((table)=> {
                        return <p key={table}>{table}</p>
                    })}

                </div>
                { user.has_tables  &&  <button onClick={handleOnReleaseClick}>Release</button>}

            </div> }
            <div> 

            </div>

    </div>
} 