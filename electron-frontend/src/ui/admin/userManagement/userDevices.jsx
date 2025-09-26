import { useEffect, useState } from "react";
import {useNavigate} from 'react-router-dom'
import { fetchData } from "../../../network/api";
import { url } from "../../../network/constants";
import {StepBackIcon} from 'lucide-react'

import './user.css'



export function ListDevices () {
    const [devices, setDevices] = useState([]);
    const navigate = useNavigate()

    useEffect(()=> {
        fetchData(
            `${url}accounts/list-users/`,
            {
                getData: (response) => {
                    setDevices(response.data);
                    console.log(response.data)

                },
                apiError: (responseError) => {
                    console.log(responseError.error);
                }
            }
        )
    }, []);
    

    useEffect(()=> {
        const socket = new WebSocket('ws:/localhost:8000/ws/user/');
        socket.onmessage = (event)=> {
            console.log(event.data);
            const newUpdate = JSON.parse(event.data);
            setDevices(prev => prev.map((device) => device.id === newUpdate.id? {...device, ...newUpdate}: device));

        }

    }, []);


    return <div className="devices-container">
        <div className="devices-header">
            <button onClick={()=> navigate('/')}> 
                <StepBackIcon/>
                <p>Back</p>
            </button>
        </div>
        <div className="devices-body">
            {
                devices.map((device)=> {
                    return  <div key={device.id} className="user-info"> 
                        <p>device:{device.device}</p>
                        <p>user:{device.name}</p>
                        <p>username:{device.username}</p>
                        {
                            device.has_tables && <p>status: busy</p>
                        }
                        <div className="busy-tables-container"> 
                            {
                                device.user_table.map((table)=> {
                                    return<p key={table}>{table}</p>
                                })
                            }

                        </div>
                    </div>
                })
            }
           
        </div>
    </div>
}