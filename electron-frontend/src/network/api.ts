export interface SuccessResponse<T> {
    status: string;
    data: T;
    
}

export interface ErrorResponse<E> {
    status: string;
    error: E;
    message?: string; 

}

export interface Error {
    code: number;
    
}

// how to make a call
async function fetchData<T, E>( url: string, callbacks:{
    getData: (data: SuccessResponse<T>)=> void,
    apiError: (response: ErrorResponse<E>) => void
}, options?: RequestInit, controller?: AbortController): Promise<void> {
    
  
    try { 
            const defaultOptions: RequestInit = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
                },
                signal: controller?.signal,
            };
            const response = await fetch(url, options? options : defaultOptions);
            if (!response.ok) {
                const errorData: E = await response.json()
                callbacks.apiError({
                    status: response.status.toString(),
                    error: errorData,
                    message: `HTTP Error${response.status}`
                })
                return;
            }
            const data: T = await response.json();
            if (response.ok){
                callbacks.getData({status: "ok", data: data});
            } 
            
        } catch (error) {
                callbacks.apiError({status: "error",
                     message: "network error", error: error as E} );

        }}


async function postData<T, E>(url: string, {data, getResponse}:{
    data: T,
    getResponse: (response: SuccessResponse<T> | ErrorResponse<E>) => void;
}
):Promise<void>{
    try {
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'content-type': 'application/json' ,
                "Authorization": `Bearer ${localStorage.getItem("accessToken") || ""}`,
            }
        })
        const responseData: T | E = await response.json();
        if (response.ok) {
            getResponse({status: "ok", data: responseData as T});
        }
        else if (response.status === 400) { 
            getResponse({status:"Bad request", error: responseData as E, message: "Format error"
            });
        }
        else if (response.status === 404) {
            getResponse({status: "Not Found", error: responseData as E, message: "URL Error"})
        }
        else {
            getResponse({status: "URL Error", error: responseData as E, message: "URL Error"})

        }

    } catch (error) {
        getResponse({status: "error", message: "network error", error: error as E});
      
    }  
}

async function deleteData<T, E> (url: string, {data, callbacks}: {data: T,callbacks:{
    getResponse: (data: SuccessResponse<T>) => void,
    apiError: (error: ErrorResponse<E>) => void;
}}):Promise<void> {

    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("accessToken") || ""}`,
            },
            body: JSON.stringify(data)
        });

        const responseData: T | E  = await response.json()
        if (response.ok) {
            callbacks.getResponse({
                status: "ok",
                data: responseData as T,
            
            })
        } else if (response.status === 400) {
            callbacks.apiError(
                {
                    status: "Bad request",
                    error: responseData as E,
                    message: "Unexpected Error"

                }
            )
         }
        else {
        callbacks.apiError(
            {
                status: "Bad request",
                error: responseData as E,
                message: "Unexpected Error"

            }
        )
        }

    } catch (error) {
        callbacks.apiError({
            status: "faild",
            error: error as E,
            message: "Network Error"
        
        }
        )
        
    }

}

async function updateData<T, E> (url: string, {data, callbacks}: {
    data: T,
    callbacks: {
        getResponse:(data: SuccessResponse<T>)=> void,
        apiError: (error: ErrorResponse<E>) => void,
    }

}) {

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("accessToken") || ""}`,
            },
            body: JSON.stringify(data)
        });

        const responseData: T | E  = await response.json()
        if (response.ok) {
            callbacks.getResponse({
                status: "ok ",
                data: responseData as T,
            
            })
        } else if (response.status === 400) {
            callbacks.apiError(
                {
                    status: "Bad request",
                    error: responseData as E,
                    message: "Unexpected Error"

                }
            )
         } else if (response.status === 404) {
            callbacks.apiError(
                {
                    status: "Not Found",
                    error: responseData as E,
                    message: "Unexpected Error"
                }
            )
         }

    } catch (error) {
        callbacks.apiError({
            status: "faild",
            error: error as E,
            message: "Network Error"
        
        }
        )
        
    }



}

export {fetchData, postData, updateData,deleteData,};



