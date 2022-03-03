import * as dotenv from "dotenv";
dotenv.config();

import { Context, HttpRequest } from "@azure/functions";
import * as Ably from "ably/promises";

export default async function (context: Context, req: HttpRequest): Promise<void> {
    const client = new Ably.Rest(process.env.ABLY_API_KEY);
    const tokenRequestData = await client.auth.createTokenRequest({ clientId: "my-app-id"});

    context.res = {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(tokenRequestData)
    };
}
