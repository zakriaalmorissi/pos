import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearOrders } from "../../../dataProvider/orderProvider/orderSlice";
import { clearBill } from "../../../dataProvider/billProvider/billSilce";
import { SOCKET_URL } from "../../../network/constants";
import { TABLE_ACTIONS } from "./tableConsistents";

export function useTableWebSocket(table) {
  const token = localStorage.getItem("accessToken");

  const dispatch = useDispatch();
  const navigate = useNavigate();


  const [socketModel, setSocketModel] = useState({
    action: TABLE_ACTIONS.OCCUPYING,
    message: "Occupying table...",
    failure: false,
    failureMessage: "",
  });

  /* =========================
     OCCUPY TABLE (ACTION)
     ========================= */
  useEffect(() => {
    occupyTable();
  
  }, []);

  function occupyTable() {
    const socket = new WebSocket(`${SOCKET_URL}table/?token=${token}`);
    // 
    const timeout = setTimeout(() => {
      socket.close();
      setSocketModel({
        action: "",
        message: "",
        failure: true,
        failureMessage: "Server not responding",
      });
    }, 5000);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          action: TABLE_ACTIONS.OCCUPY,
          payload: {...table, status: TABLE_ACTIONS.OCCUPIED },
        })
      );
    };

    socket.onmessage = (event) => {
        // clear the timer
      clearTimeout(timeout);

      if (event.data === TABLE_ACTIONS.OCCUPIED) {
        setSocketModel({
          action: TABLE_ACTIONS.OCCUPIED,
          message: "",
          failure: false,
          failureMessage: "",
        });

        socket.close(1000, "done");
        // handle the coming rejections
      } else {
        const error = event.data ?? "Unexpected server response";
        setSocketModel({
          action: "",
          message: "",
          failure: true,
          failureMessage: error,
        });
      }
    };

    socket.onerror = () => {
      clearTimeout(timeout);
      setSocketModel({
        action: "",
        message: "",
        failure: true,
        failureMessage: "Connection failed",
      });
    };

    socket.onclose = (e) => {
      if (e.code === 1006) {
        setSocketModel({
          action: "",
          message: "",
          failure: true,
          failureMessage: "Network lost while occupying table",
        });
      }
    };
  }



  /* =========================
     RELEASE TABLE (ACTION)
     ========================= */
  
  function releaseTable() {
  
    const socket = new WebSocket(`${SOCKET_URL}table/?token=${token}`);
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          action: TABLE_ACTIONS.RELEASE,
          payload: { id: table?.id },
        })
      );

      socket.close(1000, "released");
    };
    // Navigate home anyway 
    navigate("/home");
  }

  const resetSocketModel = () => {
        setSocketModel({
          action: "",
          message: "",
          failure: false,
          failureMessage: "",
        });

  }

  /* =========================
     BROWSER CLOSE HANDLING
     ========================= */
  useEffect(() => {
    const handleUnload = () => {
      releaseTable();
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
    // eslint-disable-next-line
  }, []);

  return {
    socketModel,
    tableAction: {
      occupyTable,
      releaseTable,
    },
    resetSocketModel: resetSocketModel
  };
}
