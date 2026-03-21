import { httpRouter } from "convex/server";
import { authComponent, auth } from "./auth";

const http = httpRouter();

authComponent.registerRoutes(http, auth);

export default http;