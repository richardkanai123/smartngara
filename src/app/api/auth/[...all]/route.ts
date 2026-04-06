import { handler } from "@/lib/auth-server";

export const GET = (request: Request) => handler.GET(request);
export const POST = (request: Request) => handler.POST(request);