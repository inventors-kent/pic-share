import { sendEmailSchema } from "@/lib/share-schema";
import { sendPhotoSessionEmail } from "@/server/email-service";
import {
  getPhotoSessionByToken,
  isSessionExpired,
  markEmailFailed,
  markEmailSent,
} from "@/server/session-repository";

export async function POST(
  request: Request,
  context: RouteContext<"/api/sessions/[token]/email">,
) {
  const { token } = await context.params;
  const body = await request.json();
  const parsed = sendEmailSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const session = await getPhotoSessionByToken(token);

  if (
    !session &&
    process.env.NODE_ENV !== "production" &&
    token.startsWith("mock")
  ) {
    return Response.json({ emailStatus: "sent", provider: "mock" });
  }

  if (!session || isSessionExpired(session)) {
    return Response.json(
      { error: "Session not found or expired." },
      { status: 404 },
    );
  }

  try {
    await sendPhotoSessionEmail(session, parsed.data.email);
    await markEmailSent(token, parsed.data.email);
    return Response.json({ emailStatus: "sent" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Email could not be sent.";
    await markEmailFailed(token, parsed.data.email, message);
    return Response.json(
      { emailStatus: "failed", error: message },
      { status: 500 },
    );
  }
}
