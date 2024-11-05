
# WebVerse Hooks

This package provides two custom React hooks: `useWS` and `useApi`. These hooks simplify working with WebSocket connections and API requests in React applications.

## Installation

Install the package by running:

```bash
npm install @gash_17/webverse
```

## Usage

### 1. `useWS` Hook

The `useWS` hook enables easy handling of a single WebSocket connection with functionalities like connecting, disconnecting, sending messages, and tracking sent and received messages.

**Importing the Hook**
```bash
import { useWS } from '@gash_17/webverse';
```

#### Hook Initialization

To initialize a WebSocket connection, provide a WebSocket URL to the hook.
```bash
const { connect, disconnect, sendMessage, messages, connectionStatus, error } = useWS('wss://example.com/socket');
```
#### Properties and Methods

-   **`connect()`**: Establishes a WebSocket connection.
-   **`disconnect()`**: Closes the WebSocket connection.
-   **`sendMessage(message: string)`**: Sends a message through the WebSocket connection.
-   **`messages`**: Array of messages exchanged, where each message is an object with `{ type: "sent" | "received", content: string }`.
-   **`connectionStatus`**: Status of the connection, either `"connected"`, `"disconnected"`, or `"connecting"`.
-   **`error`**: Contains any error messages encountered during the connection.

Example
```bash
import React, { useEffect } from 'react';
import { useWS } from '@gash_17/webverse';

const WebSocketComponent = () => {
  const {
    connect,
    disconnect,
    sendMessage,
    messages,
    connectionStatus,
    error
  } = useWS('wss://example.com/socket');

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const handleSendMessage = () => {
    sendMessage("Hello, WebSocket!");
  };

  return (
    <div>
      <h2>WebSocket Status: {connectionStatus}</h2>
      {error && <p>Error: {error}</p>}
      <button onClick={handleSendMessage}>Send Message</button>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            [{msg.type}] {msg.content}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WebSocketComponent;
```


### 2. `useApi` Hook

The `useApi` hook provides a convenient way to make HTTP requests, supporting `GET`, `POST`, `PUT`, and `DELETE` methods with automatic loading state and error handling.

#### Importing the Hook

```bash
import { useApi } from '@gash_17/webverse';
```

#### Hook Initialization

Initialize the hook with no parameters.

```bash
const { get, post, put, delete: del, isLoading, error } = useApi();
```

#### Properties and Methods

-   **`get<T>(url: string, headers?: Record<string, string>)`**: Makes a GET request.
-   **`post<T>(url: string, body: any, headers?: Record<string, string>)`**: Makes a POST request.
-   **`put<T>(url: string, body: any, headers?: Record<string, string>)`**: Makes a PUT request.
-   **`delete<T>(url: string, headers?: Record<string, string>)`**: Makes a DELETE request.
-   **`isLoading`**: Indicates if a request is in progress.
-   **`error`**: Contains any error message encountered during the request.

Example
```bash
import React, { useEffect, useState } from 'react';
import { useApi } from '@gash_17/webverse';

const ApiComponent = () => {
  const { get, post, isLoading, error } = useApi();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await get('https://jsonplaceholder.typicode.com/posts');
      if (response.data) setData(response.data);
    };

    fetchData();
  }, [get]);

  const handlePost = async () => {
    const newPost = { title: 'New Post', body: 'This is a new post.' };
    const response = await post('https://jsonplaceholder.typicode.com/posts', newPost);
    if (response.data) {
      console.log('Post created:', response.data);
    }
  };

  return (
    <div>
      <h2>Data from API:</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={handlePost}>Create New Post</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default ApiComponent;
```

## Summary

-   Use `useWS` for WebSocket connections with the ability to send and receive messages.
-   Use `useApi` for making HTTP requests with simplified loading and error handling.

### License

This package is licensed under the MIT License.

### Additional Notes

To use both WebSocket and API hooks in a project, import and use them as needed based on the examples.
