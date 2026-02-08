
import { url } from "../../network/constants";
import api from "../../network/API";

const createTable = async () => {
    let response;


    return // data 
}



const moveTableData = async ({senderTable, receiverTable}) => {
    // Override the url 
    const URL = `${url}api/move-table-bills/`;
    return await api.post({url: URL, data: {senderTable: senderTable, receiverTable: receiverTable} })
}



export {
    createTable,
    moveTableData
}













