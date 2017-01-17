server-check
---------------
Server monitoring and CPU testing utility

Client
------
Client side monitoring for servers that implement a basic 'Status' interface.
This was designed for multiple servers sitting behind a load balancer where direct access to individual servers are not available.

##Building
Compile the client with `npm run client`.

Server
------
The server component implements this status interface as well as a load test algorithm that gives a rough estimate of how powerful the CPUs running the server are. It is not required for the client.

## Running
Run the server with `npm start`.
The client can be accessed on the server on port 8000.

Other
-----
The script loadTest.sh allows you to grab CPU stats for a running server (up to 8 cores).
Pass in the host as a parameter. Defaults to localhost.

src/results.js summarises these into a csv.
