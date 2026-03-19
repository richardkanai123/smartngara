import { httpRouter } from "convex/server";
import { auth, createAuth } from "./auth";

const http = httpRouter();

auth.registerRoutes(http, createAuth);

export default http;