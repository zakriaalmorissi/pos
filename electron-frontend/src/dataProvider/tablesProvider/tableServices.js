import { createAsyncThunk } from "@reduxjs/toolkit";
import { url } from "../../network/constants";
import { AwardIcon, Rss, Signal } from "lucide-react";

const createTable = async () => {
    let response;


    return // data 
}

const errorResponse = (error) => {
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


const postData = async ({url, data, options = {}, controller}) => {
     
     const defaultOptins = {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }, 
        signal: controller?.signal}

    try { 

        const response = await fetch(url, {
            ...defaultOptins, ...options, 
            headers: {
                ...defaultOptins.headers, 
                ...options?.headers
            }
          })  


        if (!response.ok)  {
            throw  errorResponse(response);
            
        }
        return await response.json();
    } catch (error) {
        throw error
    }

}


const moveTableData = async ({senderTable, receiverTable}) => {
    // Override the url 
    const URL = `${url}ap/move-table-data/`;
    return await postData({url: URL, data: {senderTable: senderTable, receiverTable: receiverTable} })
}



export {
    createTable,
    moveTableData
}













