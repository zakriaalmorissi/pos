
export class NetworkError extends Error {
  constructor(message = "Network Error", hint) {
    super(message);
    this.name = new.target.name;
    this.hint = hint;
  }
}

export class AbortRequestError extends Error {
  constructor() {
    super("Request was aborted");
    this.name = new.target.name;
  }
}

const buildErrorResponse = async (response) => {
  const status = response.status ?? 500;

  let errorBody = null;
  try {
    errorBody = await response.json();
  } catch (_) {}

  switch (status) {
    case 400:
      return {
        status,
        message: "Bad request",
        hint: errorBody?.message ?? "Invalid request data",
        url: response.url,
      };

    case 404:
      return {
        status,
        message: "URL not found",
        hint: `The provided URL was not found: ${response.url}`,
        url: response.url,
      };

    case 500:
      return {
        status,
        message: "Server error",
        hint: "The server encountered an internal error",
        url: response.url,
      };

    default:
      return {
        status,
        message: "Unexpected error",
        hint: errorBody?.message ?? "Something went wrong",
        url: response.url,
      };
  }
};



const request = async ({
  url,
  method = "GET",
  data,
  options = {},
  controller,
}) => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    ...options.headers,
  };

  const config = {
    method,
    headers,
    signal: controller?.signal,
  };

  if (data && method !== "GET") {
    config.body = JSON.stringify(data);
    headers["Content-Type"] = "application/json";
  }
  let response;
  try {
    response = await fetch(url, config);

  } catch (error) {
    if (error.name === "AbortError") {
      throw new AbortRequestError();
    }
    throw new NetworkError("Network lost", "We lost the connection!");
  }

  if (!response.ok) {
    throw await buildErrorResponse(response);
  }

  return response.status === 204 ? null : await response.json();
};



const api = {
  get: ({ url, options, controller }) =>
    request({ url, method: "GET", options, controller }),

  post: ({ url, data, options, controller }) =>
    request({ url, method: "POST", data, options, controller }),

  put: ({ url, data, options, controller }) =>
    request({ url, method: "PUT", data, options, controller }),

  delete: ({ url, options, controller }) =>
    request({ url, method: "DELETE", options, controller }),
};

export default api;
