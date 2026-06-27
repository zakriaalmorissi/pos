import { launchIndicatorFailureModel, launchIndicatorModel } from "../components/models."
import { PROCESSING_STATE, ACTIONS } from "../components/constants"
import { data } from "react-router-dom";

export const makeAPICrud = async ({
    thunk,
    status,
    action, 
    message,
    time,  // when to show loading indicator 
    responseData,
    updateStateCallback, 
}) => {
    const currentThunk = thunk;
    // Set the loading timer 
    const timer = setTimeout(()=> {
        updateStateCallback({
            status:status, 
            action: action,
            message: message
        })
    }, time ?? 300);
    // Set the error timer for aborting the request when it takes so long to respond 
    const errorTimer = setTimeout(()=> {
        // abort the thunk 
        if (currentThunk) {
            currentThunk.abort();
        }
        updateStateCallback({
            status: status,
            action: action,
            message: `${message} took so long to respond`,
        })
    }, 6000);
    try {
       const res = await currentThunk.unwrap();
       responseData?.(res);
    } catch (error) {
        if (error?.name === "AbortError") return; // deliberately  ignored 
        updateStateCallback({
            status: PROCESSING_STATE.ERROR,
            action: action,
            message: `${message} has failed. ${error?.hint ?? ""}`
        })

    } finally {
        clearTimeout(timer);
        clearTimeout(errorTimer);
    }

}




