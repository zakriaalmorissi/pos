const url = 'http://127.0.0.1:8000/';

// also assgin the tokens
const tokens = {
  'access': '',
    'refresh': ''  
 }



const LAUNCHING_STATE = {
  
  INIT: "INIT",
  CONFIG: "CONFIG",
  AUTH: "AUTH",
  LOGIN: "LOGIN", 
  LOAD_DATA: "LOAD_DATA",
  ERROR: "ERROR",
  READY: "READY"
}

const UI_MODE = {
  MAIN: "main",
  SELECT: "select"
}

const TABLE_STATES = {
  OCCUPIED: "occupied",
  AVAILABLE: "available",
  BUSY: "busy",
}

export {url, tokens, LAUNCHING_STATE, UI_MODE, TABLE_STATES};