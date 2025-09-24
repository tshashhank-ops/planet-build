// types/next.d.ts
import { Server as IOServer } from "socket.io";
import { Socket } from "net";

declare module "http" {
  interface IncomingMessage {
    socket: Socket & { server: any };
  }
}

export type NextApiResponseServerIO = {
  socket: {
    server: {
      io?: IOServer;
    };
  };
} & import("next").NextApiResponse;
