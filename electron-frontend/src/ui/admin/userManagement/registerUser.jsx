import { Check, DeleteIcon, MailSearch, StepBackIcon } from "lucide-react";
import {  useState } from "react";
import { useNavigate } from "react-router-dom";
import './registerUser.css'
import { postData } from "../../../network/api";
import { url } from "../../../network/constants";




export function RegisterUser() {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isAdmin, setIsAdmin] = useState("");
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate();
    const [activeField, setActiveFeild] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState({
        status: null,
        error: null,
        message: null
    });

    const handleSubmit = async () => {
        setErrorMessage({status: null, error: null, message: null});
        setMessage("");
        setIsLoading(!isLoading);
        await postData(`${url}accounts/add-user/`, {
            data: {
                name: name,
                username: username,
                password: password,
                isAdmin: isAdmin
            },
            getResponse: (response ) => {
               
                if (response.status === "ok"){
                    setIsLoading(false)
                    setMessage("Registered Successfully")
                    return
                }
                setErrorMessage(response)
                setIsLoading(false)
             
            }
    })

    }

    const getValue = (v) => {
        if (activeField === "username") setUsername(prev => prev + v);
        else if (activeField === "password") setPassword(prev => prev + v);
        else if (activeField === "name") setName(prev => prev + v);
        console.log(password)
     }

    const onDelete = () => {
        if (activeField === 'name') setName(prev => prev.slice(0, -1));
        else if (activeField === "username") setUsername(prev => prev.slice(0, -1));
        else if (activeField === "password") setPassword(prev => prev.slice(0, -1))
    }
    return <div className="register-user-page">
        <div className="register-user-header">
            <button onClick={()=> navigate("/admin")}>
                <StepBackIcon/>
                <p>Back</p>
            </button>
        </div>
        <div className="register-user-body">
            <div className="register-form-containers">
                <form>
                   
                    <div className="register-name-container">
                        <label>Name</label>
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onClick={()=> setActiveFeild("name")}
                            placeholder="optional"
                            disabled={isLoading}
                        
                        />
                    </div>
                    <div className="register-username-container">
                        <label>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e)=> setUsername(e.target.value)}
                            onClick={()=> setActiveFeild("username")}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="register-password-container">
                        <label>
                            Password
                        </label>
                        <input 
                            type="text" 
                            value={password}
                            onChange={(e)=> setPassword(e.target.value)}
                            onClick={()=> setActiveFeild("password")}
                            disabled={isLoading}
                        
                        />
                    </div>
                    <div className="register-is-admin-container">
                        <label htmlFor="is-admin">Is Admin</label>
                        <input
                            type="checkbox"
                            value={isAdmin}
                            onClick={()=> setIsAdmin(!isAdmin)}
                        />
                    </div>

                </form>
                <div className="register-feedback-container">
                    <div className="loading-message">
                         {
                            isLoading && <p>Registering user...</p>
                         }
                    </div>
                    <div className="feedback-content">
                        {
                            errorMessage.error? <div className="error">{errorMessage.status}</div>: <div>
                                <p>{message}</p>
                             </div>
                        }

                    </div> 
                </div>
                <div className="keyPad-container">
                     <KeyPad onPress={getValue}/>
                    <div className="keyPad-side-container">
                        <button className="delete" onClick={onDelete}>
                            <DeleteIcon/>
                        </button>
                        <button  type="submit" className={isLoading? `submit-isLoading`: 'submit'} onClick={handleSubmit} disabled={isLoading}>
                           <Check/>
                        </button>
                     </div>
                </div>
           
            </div>
        
        </div>
    </div>





}



function KeyPad({onPress}) {
     const numbers = ['1','2','3','4','5','6','7','8','9','0', '00', '.'];

    return <div className="keyPad">
            <div>
                {
                    numbers.map((num)=> {

                        return <button key={num} onClick={()=> onPress(num)}>
                            {num}
                        </button>
                    })
                }

            </div>
    </div>

}