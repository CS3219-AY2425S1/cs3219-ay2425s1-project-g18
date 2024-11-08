import { Liveblocks } from "@liveblocks/node";
import { Request, Response } from "express";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export const authLiveblocksSession = async (req: Request, res: Response):Promise<any> => {
  const { user, roomId } = req.body;

  // Create a session for the current user
  // userInfo is made available in Liveblocks presence hooks, e.g. useOthers
  const session = liveblocks.prepareSession(user.userId, {
    userInfo: user.name,
  });

  // Give the user access to the room
  // pass in roomId
  session.allow(roomId, session.FULL_ACCESS);

  // Authorize the user and return the result
  const { body, status } = await session.authorize();
  return new Response(body, { status });
};