import { readFile } from "node:fs/promises";
import { readSession } from "@/lib/auth/session";
import { getDocumentFile } from "@/lib/db/queries";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ documentId: string }>;
  },
) {
  const session = await readSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { documentId } = await context.params;
  const file = await getDocumentFile(session.id, documentId);

  if (!file || !file.storagePath) {
    return new Response("File not found.", { status: 404 });
  }

  const buffer = await readFile(file.storagePath);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${file.title.replace(/"/g, "")}.pdf"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
