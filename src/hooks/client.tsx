import { useEffect, useRef, useState, useCallback } from "react";

// Interface for WebSocket hook
interface WebSocketHook {
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
  messages: { type: "sent" | "received"; content: string }[];
  connectionStatus: "connected" | "disconnected" | "connecting";
  error: string | null;
}

// Interface for API response type
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

// Interface for Request Options type
interface RequestOptions {
  method: string; //"GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
}

// WebSocket Hook
// WebSocket Hook for a single connection
const useWS = (url: string): WebSocketHook => {
  const [messages, setMessages] = useState<{ type: "sent" | "received"; content: string }[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("disconnected");
  const [error, setError] = useState<string | null>(null);

  const webSocketRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (webSocketRef.current) return; // Prevent multiple connections

    setConnectionStatus("connecting");
    const webSocket = new WebSocket(url);
    webSocketRef.current = webSocket;

    webSocket.onopen = () => {
      setConnectionStatus("connected");
      setError(null);
    };

    webSocket.onclose = () => {
      setConnectionStatus("disconnected");
      webSocketRef.current = null; // Reset on disconnect
    };

    webSocket.onerror = () => {
      setError("WebSocket error occurred");
      setConnectionStatus("disconnected");
      webSocketRef.current = null;
    };

    webSocket.onmessage = (event) => {
      setMessages((prev) => [...prev, { type: "received", content: event.data }]);
    };
  }, [url]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    webSocketRef.current?.close();
    webSocketRef.current = null;
    setConnectionStatus("disconnected");
  }, []);

  // Send message
  const sendMessage = useCallback((message: string) => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(message);
      setMessages((prev) => [...prev, { type: "sent", content: message }]);
    } else {
      setError("WebSocket is not connected");
    }
  }, []);

  // Clean up WebSocket on component unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    sendMessage,
    messages,
    connectionStatus,
    error,
  };
};



// API Hook
const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generic request function
  const request = useCallback(
    async <T,>(
      url: string,
      options: RequestOptions = { method: "GET" }
    ): Promise<ApiResponse<T>> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { data, error: null, isLoading: false };
      } catch (err: any) {
        setError(err.message);
        return { data: null, error: err.message, isLoading: false };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Specific methods for each HTTP verb
  const get = useCallback(
    <T,>(url: string, headers: Record<string, string> = {}) =>
      request<T>(url, { method: "GET", headers }),
    [request]
  );

  const post = useCallback(
    <T,>(url: string, body: any, headers: Record<string, string> = {}) =>
      request<T>(url, { method: "POST", headers, body }),
    [request]
  );

  const put = useCallback(
    <T,>(url: string, body: any, headers: Record<string, string> = {}) =>
      request<T>(url, { method: "PUT", headers, body }),
    [request]
  );

  const del = useCallback(
    <T,>(url: string, headers: Record<string, string> = {}) =>
      request<T>(url, { method: "DELETE", headers }),
    [request]
  );

  return { get, post, put, delete: del, isLoading, error };
};

export { useWS, useApi };
