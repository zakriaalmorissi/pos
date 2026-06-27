import { ProcessingIndicator, TimeoutErrorMessageIndicator } from "../components";
import { PROCESSING_STATE, ACTIONS } from "../constants";



export default function Indicator ({processingModel, resetState, callbacks}) {
        switch(processingModel.action) {
            case ACTIONS.GETTING: 
              return (<ProcessingIndicator 
                isLoading={processingModel.status === PROCESSING_STATE.LOADING}
                action={processingModel.message}
                errorMessage={processingModel.status === PROCESSING_STATE.ERROR && processingModel.message}
                onIgnore={resetState}
                onRetry={callbacks?.retryFetch}
            />);
            case ACTIONS.CREATING:
                return (<ProcessingIndicator 
                    isLoading={processingModel.status === PROCESSING_STATE.LOADING}
                    action={processingModel.message}
                    errorMessage={processingModel.status === PROCESSING_STATE.ERROR && processingModel.message}
                    onIgnore={resetState}
                    onRetry={callbacks?.retryCreate}
        />);
            case ACTIONS.DELETING: 
                return (<ProcessingIndicator 
                    isLoading={processingModel.status === PROCESSING_STATE.LOADING}
                    action={processingModel.message}
                    errorMessage={processingModel.status === PROCESSING_STATE.ERROR && processingModel.message }
                    onIgnore={resetState} 
                    onRetry={callbacks?.retryDelete}
                />);
            case ACTIONS.UPDATING:
                return (<TimeoutErrorMessageIndicator  
            message={processingModel.status === PROCESSING_STATE.ERROR && processingModel.message} 
            resetState={resetState}
            />);
            default: 
                    return null;
                    
        }



}



