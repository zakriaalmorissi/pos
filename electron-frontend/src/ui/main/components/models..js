

export function launchIndicatorModel ({status, action, message, setModel, time = 300}) {
    return setTimeout(()=> {
        setModel({
            status: status,
            action: action,
            message: message,
        })
    }, time)

}



export function launchIndicatorFailureModel({status, action, message, setModel, time = 6000}) {
    return setTimeout(()=> {
        setModel({
            status: status,
            action: action,
            message: message,
        })
    }, time)

}



