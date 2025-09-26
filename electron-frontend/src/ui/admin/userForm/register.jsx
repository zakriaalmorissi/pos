import { useEffect, useState } from "react";
import {useNavigate } from "react-router-dom";
import { url } from "../../../network/constants";
import { postData, fetchData } from "../../../network/api";
import './register.css'

export function RegisterForm() { 
    const [systemInfo, setSystemInfo] = useState('');
    const [isLoading, setIsloading] = useState(true);
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate()
    


    useEffect(()=> {
        const getSystemInfo = async () => {
        await fetchData(
            `${url}accounts/setup/`,
            {
                getData: (response)=> {
                    setSystemInfo(response.data);
                    setIsloading(false)

                },
                apiError: (responseError) => {
                    console.log(responseError.error);

                }
            }
        )
        }
        getSystemInfo();
    
        }, [])
   
    



    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Registering with:", { username, password,});
        await postData(`${url}accounts/register/`, {
            data: {
                name: name,
                username: username,
                password: password,
                
            },
            getResponse: (response) => {
                if (response.status === 'ok') {
                    console.log("Registration successful!");
                    const {refresh, access} = response.data.tokens;
                    localStorage.setItem("accessToken", access);
                    localStorage.setItem("refreshToken", refresh);
                    navigate('/');
                } else {
                    console.log(response.error)
                    console.error("Registration failed:", response.error);
                }
            }
        });
    };

    return (
        <div className="register-page">
            <div className="register-header">
                <button onClick={() => navigate('/login')}>
                    Back to Login
                </button>
            </div>
            <div className="register-body">
                <div className="register-info">
                    <h1>Zack Pos system</h1>
                </div>
                <div className="register-form-container">
                    <form onSubmit={handleSubmit}>
                        <h2>Register</h2>
                        <p>Please enter your details to create an account.</p>
                        {
                           !systemInfo.hasSuperAdmin && <div>
                                <p>As long as you are the first one to register to this system, you are automatically 
                                    going to be the Super Admin of this system.
                                
                                    
                                </p>
                            </div>
                        }
                        <div>
                            <label htmlFor="name">Name:</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor ="username">Username:</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                
                        <div className="error">
                            {/* Error messages can be displayed here if needed */}
                            
                        </div>
                        <button type="submit">Register</button>
                    </form>
                </div>
            </div>
        </div>
    

    );
}