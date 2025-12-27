import { useEffect, useState } from 'react'
import './style.css'

export function ProcessingIndicator ({isLoading ,message, onIgnore, buttonLabel}) {
    // This function is gonna indicate the proccess of posting some data, or perform some actions
    // If the proccess fails, it is gonna display a message explaining the problem, and give a chance to retry the process or cancel it 


    return <div className="process-indicator-container">
        <div className="process-indicator-body">
           {
            isLoading && !message &&<div className="process-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
           }
            {
                message && <div className="indicator-message-container">
                    <p className='message-header'>Failure Message</p>
                    <div className='message'> 
                        <p>{message}</p>
                    </div>
                    <div className="indicator-buttons-container">
                        <button onClick={onIgnore} > {buttonLabel? buttonLabel: "Ok"}</button>
                    </div>
                </div>

            }
        </div>
    </div>


}

export function WarningMessage ({ title, message, onCancel, onContinue}) {
    
    return <div className='warning-message-container'>
        <div className='warning-message'>
            <div className='warning-message-header'>
                <p>{title}</p>
            </div>
            <div className='warning-message-body'>
                <p>{message}</p>
            </div>
            <div className='warning-message-footer'>
                <button onClick={onCancel}>Cancel</button>
                <button onClick={onContinue}>Continue</button>
            </div>

        </div>

    </div>

}


export function ErrorMessage (message) {
    // This message is gonna be used to pop up for a very short time  indicating failure at a certain task 
    return <div className='short-time-error-message-container'>
        <div className='error-message-body'>
            <p>{message}</p>
        </div>
    </div>

}


export function TimeoutErrorMessageIndicator ({message}) {

    const [show, setShow] = useState(true);
    useEffect(()=> {
       const timer = setTimeout(()=> {
        setShow(false);
        }, 4000)


    return ()=> {
        clearTimeout(timer);
    }
    },[]);


    return show && <div className='timeout-error-message-container'>
        <div className='timeout-error-message-body'>
            <p className='timeout-error-message-content'>
                {message}
            </p>
        </div>

    </div>



}

export function TimeoutMessageIndicator ({
    message,
    timer,
    resetState,
    position, 
    backgroundColor,
     
}) {
    const [show, setShow] = useState(true);

    useEffect(()=> {
        if (timer === "infinite") return;
        const time = setTimeout(()=> {
            setShow(false)
            resetState()
        }, timer? timer: 3500 );

        return () => {
            clearTimeout(time)
        }
    }, []);

      return show && <div className='timeout-message-container'>
        <div className='timeout-message-body'>
            <p className='timeout-message-content'>
                {message}
            </p>
        </div>

    </div>
}