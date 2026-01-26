
export interface Item {
    id?: number;
    category: number | string;
    name: string;
}

export interface ChildItem {
    parentItem?: string | number;
    id?: number;
    name: string;
    price: number;
}


export interface ListItems<T>{
    items: T[];

}

interface ErrorResponse<E> {
    status: number;
    error: E;
    message?: string; 
    hint: string

}



const errorResponse = (error: any) => {
    const status = error.status ?? 500;

    let baseResponse = {
        status: status,
        message: "Unexpected Error",
        hint: "Something went wrong"

    }

    switch(status) {
        case 404:
            return {
                status: status,
                message: "Url not found",
                hint: `The provided URL was not found ${error.url ?? "unknown"}`,
            }
        case 400: 
            return {
                status: status,
                message: "Bad request",
                hint: error.error ?? "Invalid request data"
            }
        case 500:
            return {
                status: status,
                message: "Server error",
                hint: "The server encountered an internal error"
            }
        default: 
        return baseResponse;
    }

}