import {
  getPhotoSessionByToken,
  isSessionExpired,
} from "@/server/session-repository";
import { presentShareSession } from "@/server/share-presenter";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/sessions/[token]">,
) {
  const { token } = await context.params;
  const session = await getPhotoSessionByToken(token);

  if (!session || isSessionExpired(session)) {
    return Response.json(
      { error: "Session not found or expired." },
      { status: 404 },
    );
  }

  return Response.json(presentShareSession(session));
}
