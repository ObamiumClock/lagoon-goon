import { join } from "node:path";
import { hostname } from "node:os";
import { createServer } from "node:http";
import express from "express";
import wisp from "wisp-server-node";
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(dirname(__filename), '..'); 

const app = express();

// Load your public files (index.html, etc)
app.use(express.static(join(__dirname, 'public')));

// Load Ultraviolet engine files
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));

// Fallback: If a user goes to a random link, send them back to index.html
app.use((req, res) => {
	res.status(404);
	res.sendFile(join(__dirname, 'public', 'index.html'));
});

const server = createServer();

server.on("request", (req, res) => {
	res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
	res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
	app(req, res);
});

server.on("upgrade", (req, socket, head) => {
	if (req.url.endsWith("/wisp/")) {
		wisp.routeRequest(req, socket, head);
		return;
	} 
	socket.end();
});

let port = parseInt(process.env.PORT || "");
if (isNaN(port)) port = 8080;

server.on("listening", () => {
	const address = server.address();
	console.log("Listening on:");
	console.log(`\thttp://localhost:${address.port}`);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
	console.log("SIGTERM signal received: closing HTTP server");
	server.close();
	process.exit(0);
}

server.listen({
	port,
});
