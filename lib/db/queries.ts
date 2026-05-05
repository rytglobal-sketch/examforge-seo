import "server-only";
import { randomUUID } from "node:crypto";
import { getSql, vectorLiteral } from "@/lib/db/client";
import { getUploadLimit, getQuestionLimit } from "@/lib/billing/plans";
import type {
  AuthMode,
  BillingSnapshot,
  ChatMessageRecord,
  DocumentChunkDraft,
  DocumentListItem,
  DocumentNoteRecord,
  DocumentPageDraft,
  DocumentPageRecord,
  DocumentRecord,
  DocumentWorkspace,
  NoteListItem,
  SessionUser,
  SubscriptionPlan,
  SummaryBundle,
  SummaryDraft,
} from "@/lib/db/types";
import {
  demoBilling,
  demoDocument,
  demoDocumentId,
  demoNote,
  demoWorkspace,
} from "@/lib/mock-data";

type UserRow = {
  id: string;
  name: string;
  email: string;
  plan: SubscriptionPlan;
  subscriptionStatus: string | null;
};

type MagicLinkRow = {
  email: string;
  name: string | null;
  intent: AuthMode;
  expiresAt: Date | string;
};

type DocumentRow = {
  id: string;
  userId: string;
  title: string;
  authors: string[] | null;
  sourceFileName: string;
  storagePath: string;
  mimeType: string;
  pageCount: number;
  status: DocumentRecord["status"];
  simpleSummary: string | null;
  keyFindings: string[] | null;
  methodology: string | null;
  limitations: string | null;
  importantDefinitions:
    | Array<{ term: string; meaning: string }>
    | null;
  possibleExamQuestions: string[] | null;
  excerpt?: string | null;
  noteCount?: number | null;
  chatCount?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function emptySummary(): SummaryBundle {
  return {
    simpleSummary: "Summary generation is pending.",
    keyFindings: [],
    methodology: "Methodology extraction is pending.",
    limitations: "Limitation extraction is pending.",
    importantDefinitions: [],
    possibleExamQuestions: [],
  };
}

function toSummaryBundle(row: DocumentRow): SummaryBundle {
  return {
    simpleSummary: row.simpleSummary ?? emptySummary().simpleSummary,
    keyFindings: row.keyFindings ?? [],
    methodology: row.methodology ?? emptySummary().methodology,
    limitations: row.limitations ?? emptySummary().limitations,
    importantDefinitions: row.importantDefinitions ?? [],
    possibleExamQuestions: row.possibleExamQuestions ?? [],
  };
}

function toDocumentRecord(row: DocumentRow): DocumentRecord {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    authors: row.authors ?? [],
    sourceFileName: row.sourceFileName,
    storagePath: row.storagePath,
    mimeType: row.mimeType,
    pageCount: row.pageCount,
    status: row.status,
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
    summary: toSummaryBundle(row),
  };
}

function toDocumentListItem(row: DocumentRow): DocumentListItem {
  const document = toDocumentRecord(row);

  return {
    ...document,
    excerpt: row.excerpt ?? document.summary.simpleSummary,
    noteCount: Number(row.noteCount ?? 0),
    chatCount: Number(row.chatCount ?? 0),
  };
}

function toSessionUser(row: UserRow): SessionUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    plan: row.plan,
    subscriptionStatus: row.subscriptionStatus,
  };
}

export async function findUserByEmail(email: string) {
  const sql = getSql();

  if (!sql) {
    return null;
  }

  const [row] = await sql<UserRow[]>`
    select
      id,
      name,
      email,
      plan,
      subscription_status as "subscriptionStatus"
    from users
    where lower(email) = lower(${email})
    limit 1
  `;

  return row ? toSessionUser(row) : null;
}

export async function createUserRecord(input: {
  name: string;
  email: string;
}) {
  const sql = getSql();

  if (!sql) {
    return {
      id: "demo-user",
      name: input.name,
      email: input.email,
      plan: "free" as const,
      subscriptionStatus: "inactive",
      isDemo: true,
    };
  }

  const [row] = await sql<UserRow[]>`
    insert into users (name, email)
    values (${input.name}, ${input.email})
    returning
      id,
      name,
      email,
      plan,
      subscription_status as "subscriptionStatus"
  `;

  return toSessionUser(row);
}

export async function createMagicLinkRecord(input: {
  email: string;
  name?: string;
  intent: AuthMode;
  tokenHash: string;
  expiresAt: Date;
}) {
  const sql = getSql();

  if (!sql) {
    return;
  }

  await sql.begin(async (transaction) => {
    await transaction`
      delete from auth_magic_links
      where lower(email) = lower(${input.email})
        and intent = ${input.intent}
    `;

    await transaction`
      insert into auth_magic_links (
        email,
        name,
        intent,
        token_hash,
        expires_at
      )
      values (
        ${input.email},
        ${input.name ?? null},
        ${input.intent},
        ${input.tokenHash},
        ${input.expiresAt}
      )
    `;
  });
}

export async function consumeMagicLinkRecord(tokenHash: string) {
  const sql = getSql();

  if (!sql) {
    return null;
  }

  const [row] = await sql.begin((transaction) => {
    return transaction<MagicLinkRow[]>`
      update auth_magic_links
      set used_at = now()
      where token_hash = ${tokenHash}
        and used_at is null
        and expires_at > now()
      returning
        email,
        name,
        intent,
        expires_at as "expiresAt"
    `;
  });

  return row ?? null;
}

export async function getDocumentsForUser(userId: string) {
  if (userId === "demo-user") {
    return [demoDocument];
  }

  const sql = getSql();

  if (!sql) {
    return [demoDocument];
  }

  const rows = await sql<DocumentRow[]>`
    select
      d.id,
      d.user_id as "userId",
      d.title,
      d.authors,
      d.source_file_name as "sourceFileName",
      d.storage_path as "storagePath",
      d.mime_type as "mimeType",
      d.page_count as "pageCount",
      d.status,
      d.simple_summary as "simpleSummary",
      d.key_findings as "keyFindings",
      d.methodology,
      d.limitations,
      d.important_definitions as "importantDefinitions",
      d.possible_exam_questions as "possibleExamQuestions",
      d.created_at as "createdAt",
      d.updated_at as "updatedAt",
      coalesce(dp.text_content, d.simple_summary, '') as "excerpt",
      coalesce((
        select count(*)
        from document_notes dn
        where dn.document_id = d.id and dn.user_id = ${userId}
      ), 0) as "noteCount",
      coalesce((
        select count(*)
        from chat_messages cm
        where cm.document_id = d.id and cm.user_id = ${userId}
      ), 0) as "chatCount"
    from documents d
    left join lateral (
      select text_content
      from document_pages
      where document_id = d.id
      order by page_number asc
      limit 1
    ) dp on true
    where d.user_id = ${userId}
    order by d.created_at desc
  `;

  return rows.map(toDocumentListItem);
}

export async function getDocumentWorkspace(userId: string, documentId: string) {
  if (userId === "demo-user") {
    return documentId === demoDocumentId ? demoWorkspace : null;
  }

  const sql = getSql();

  if (!sql) {
    return documentId === demoDocumentId ? demoWorkspace : null;
  }

  const [documentRow] = await sql<DocumentRow[]>`
    select
      id,
      user_id as "userId",
      title,
      authors,
      source_file_name as "sourceFileName",
      storage_path as "storagePath",
      mime_type as "mimeType",
      page_count as "pageCount",
      status,
      simple_summary as "simpleSummary",
      key_findings as "keyFindings",
      methodology,
      limitations,
      important_definitions as "importantDefinitions",
      possible_exam_questions as "possibleExamQuestions",
      created_at as "createdAt",
      updated_at as "updatedAt"
    from documents
    where id = ${documentId} and user_id = ${userId}
    limit 1
  `;

  if (!documentRow) {
    return null;
  }

  const [pages, messages, noteRows] = await Promise.all([
    sql<DocumentPageRecord[]>`
      select
        id,
        document_id as "documentId",
        page_number as "pageNumber",
        text_content as "textContent",
        token_estimate as "tokenEstimate"
      from document_pages
      where document_id = ${documentId}
      order by page_number asc
    `,
    sql<ChatMessageRecord[]>`
      select
        id,
        document_id as "documentId",
        user_id as "userId",
        role,
        content,
        citations,
        created_at as "createdAt"
      from chat_messages
      where document_id = ${documentId} and user_id = ${userId}
      order by created_at asc
    `,
    sql<DocumentNoteRecord[]>`
      select
        id,
        document_id as "documentId",
        user_id as "userId",
        body,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from document_notes
      where document_id = ${documentId} and user_id = ${userId}
      limit 1
    `,
  ]);

  return {
    document: toDocumentRecord(documentRow),
    pages,
    messages,
    note: noteRows[0] ?? null,
  } satisfies DocumentWorkspace;
}

export async function createDocumentSkeleton(input: {
  documentId: string;
  userId: string;
  title: string;
  sourceFileName: string;
  storagePath: string;
  mimeType: string;
}) {
  const sql = getSql();

  if (!sql) {
    return input.documentId;
  }

  await sql`
    insert into documents (
      id,
      user_id,
      title,
      source_file_name,
      storage_path,
      mime_type,
      status
    )
    values (
      ${input.documentId},
      ${input.userId},
      ${input.title},
      ${input.sourceFileName},
      ${input.storagePath},
      ${input.mimeType},
      'processing'
    )
  `;

  return input.documentId;
}

export async function markDocumentFailed(documentId: string) {
  const sql = getSql();

  if (!sql) {
    return;
  }

  await sql`
    update documents
    set status = 'failed',
        updated_at = now()
    where id = ${documentId}
  `;
}

export async function persistProcessedDocument(input: {
  documentId: string;
  title: string;
  authors: string[];
  pages: DocumentPageDraft[];
  chunks: DocumentChunkDraft[];
  summary: SummaryDraft;
}) {
  const sql = getSql();

  if (!sql) {
    return;
  }

  await sql.begin(async (transaction) => {
    await transaction`
      delete from document_chunks
      where document_id = ${input.documentId}
    `;

    await transaction`
      delete from document_pages
      where document_id = ${input.documentId}
    `;

    for (const page of input.pages) {
      await transaction`
        insert into document_pages (
          id,
          document_id,
          page_number,
          text_content,
          token_estimate
        )
        values (
          ${randomUUID()},
          ${input.documentId},
          ${page.pageNumber},
          ${page.textContent},
          ${page.tokenEstimate}
        )
      `;
    }

    for (const chunk of input.chunks) {
      if (chunk.embedding && chunk.embedding.length > 0) {
        await transaction`
          insert into document_chunks (
            id,
            document_id,
            page_number,
            chunk_index,
            content,
            token_estimate,
            embedding,
            metadata
          )
          values (
            ${randomUUID()},
            ${input.documentId},
            ${chunk.pageNumber},
            ${chunk.chunkIndex},
            ${chunk.content},
            ${chunk.tokenEstimate},
            ${vectorLiteral(chunk.embedding)}::vector,
            ${JSON.stringify(chunk.metadata)}::jsonb
          )
        `;
      } else {
        await transaction`
          insert into document_chunks (
            id,
            document_id,
            page_number,
            chunk_index,
            content,
            token_estimate,
            metadata
          )
          values (
            ${randomUUID()},
            ${input.documentId},
            ${chunk.pageNumber},
            ${chunk.chunkIndex},
            ${chunk.content},
            ${chunk.tokenEstimate},
            ${JSON.stringify(chunk.metadata)}::jsonb
          )
        `;
      }
    }

    await transaction`
      update documents
      set
        title = ${input.summary.title ?? input.title},
        authors = ${input.summary.authors ?? input.authors},
        page_count = ${input.pages.length},
        status = 'ready',
        simple_summary = ${input.summary.simpleSummary},
        key_findings = ${JSON.stringify(input.summary.keyFindings)}::jsonb,
        methodology = ${input.summary.methodology},
        limitations = ${input.summary.limitations},
        important_definitions = ${JSON.stringify(input.summary.importantDefinitions)}::jsonb,
        possible_exam_questions = ${JSON.stringify(input.summary.possibleExamQuestions)}::jsonb,
        updated_at = now()
      where id = ${input.documentId}
    `;
  });
}

export async function getDocumentFile(userId: string, documentId: string) {
  if (userId === "demo-user") {
    return documentId === demoDocumentId
      ? { title: demoDocument.title, storagePath: "" }
      : null;
  }

  const sql = getSql();

  if (!sql) {
    return documentId === demoDocumentId
      ? { title: demoDocument.title, storagePath: "" }
      : null;
  }

  const [row] = await sql<{ title: string; storagePath: string }[]>`
    select
      title,
      storage_path as "storagePath"
    from documents
    where id = ${documentId} and user_id = ${userId}
    limit 1
  `;

  return row ?? null;
}

export async function appendChatExchange(input: {
  userId: string;
  documentId: string;
  prompt: string;
  answer: string;
  citations: number[];
}) {
  if (input.userId === "demo-user") {
    return {
      userMessage: {
        id: randomUUID(),
        documentId: input.documentId,
        userId: input.userId,
        role: "user" as const,
        content: input.prompt,
        citations: [],
        createdAt: new Date().toISOString(),
      },
      assistantMessage: {
        id: randomUUID(),
        documentId: input.documentId,
        userId: input.userId,
        role: "assistant" as const,
        content: input.answer,
        citations: input.citations,
        createdAt: new Date().toISOString(),
      },
    };
  }

  const sql = getSql();

  if (!sql) {
    return {
      userMessage: {
        id: randomUUID(),
        documentId: input.documentId,
        userId: input.userId,
        role: "user" as const,
        content: input.prompt,
        citations: [],
        createdAt: new Date().toISOString(),
      },
      assistantMessage: {
        id: randomUUID(),
        documentId: input.documentId,
        userId: input.userId,
        role: "assistant" as const,
        content: input.answer,
        citations: input.citations,
        createdAt: new Date().toISOString(),
      },
    };
  }

  const [userMessage] = await sql<ChatMessageRecord[]>`
    insert into chat_messages (
      id,
      document_id,
      user_id,
      role,
      content,
      citations
    )
    values (
      ${randomUUID()},
      ${input.documentId},
      ${input.userId},
      'user',
      ${input.prompt},
      ${JSON.stringify([])}::jsonb
    )
    returning
      id,
      document_id as "documentId",
      user_id as "userId",
      role,
      content,
      citations,
      created_at as "createdAt"
  `;

  const [assistantMessage] = await sql<ChatMessageRecord[]>`
    insert into chat_messages (
      id,
      document_id,
      user_id,
      role,
      content,
      citations
    )
    values (
      ${randomUUID()},
      ${input.documentId},
      ${input.userId},
      'assistant',
      ${input.answer},
      ${JSON.stringify(input.citations)}::jsonb
    )
    returning
      id,
      document_id as "documentId",
      user_id as "userId",
      role,
      content,
      citations,
      created_at as "createdAt"
  `;

  return { userMessage, assistantMessage };
}

export async function upsertDocumentNote(input: {
  userId: string;
  documentId: string;
  body: string;
}) {
  if (input.userId === "demo-user") {
    return {
      ...demoNote,
      body: input.body,
      updatedAt: new Date().toISOString(),
    };
  }

  const sql = getSql();

  if (!sql) {
    return {
      ...demoNote,
      body: input.body,
      updatedAt: new Date().toISOString(),
    };
  }

  const [row] = await sql<DocumentNoteRecord[]>`
    insert into document_notes (
      id,
      document_id,
      user_id,
      body
    )
    values (
      ${randomUUID()},
      ${input.documentId},
      ${input.userId},
      ${input.body}
    )
    on conflict (document_id, user_id)
    do update set
      body = excluded.body,
      updated_at = now()
    returning
      id,
      document_id as "documentId",
      user_id as "userId",
      body,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;

  return row;
}

export async function getNotesForUser(userId: string) {
  if (userId === "demo-user") {
    return [
      {
        ...demoNote,
        documentTitle: demoDocument.title,
      },
    ] satisfies NoteListItem[];
  }

  const sql = getSql();

  if (!sql) {
    return [
      {
        ...demoNote,
        documentTitle: demoDocument.title,
      },
    ] satisfies NoteListItem[];
  }

  return sql<NoteListItem[]>`
    select
      dn.id,
      dn.document_id as "documentId",
      dn.user_id as "userId",
      dn.body,
      dn.created_at as "createdAt",
      dn.updated_at as "updatedAt",
      d.title as "documentTitle"
    from document_notes dn
    join documents d on d.id = dn.document_id
    where dn.user_id = ${userId}
    order by dn.updated_at desc
  `;
}

export async function getBillingSnapshot(userId: string) {
  if (userId === "demo-user") {
    return demoBilling;
  }

  const sql = getSql();

  if (!sql) {
    return demoBilling;
  }

  const [user] = await sql<{
    plan: SubscriptionPlan;
    paystackCustomerCode: string | null;
    paystackSubscriptionCode: string | null;
    paystackPlanCode: string | null;
    paystackReference: string | null;
    paystackEmailToken: string | null;
    subscriptionStatus: string | null;
  }[]>`
    select
      plan,
      paystack_customer_code as "paystackCustomerCode",
      paystack_subscription_code as "paystackSubscriptionCode",
      paystack_plan_code as "paystackPlanCode",
      paystack_reference as "paystackReference",
      paystack_email_token as "paystackEmailToken",
      subscription_status as "subscriptionStatus",
    from users
    where id = ${userId}
    limit 1
  `;

  const [countRow] = await sql<{ count: number }[]>`
    select count(*)::int as count
    from documents
    where user_id = ${userId}
  `;

  const plan = user?.plan ?? "free";

  return {
    plan,
    paystackCustomerCode: user?.paystackCustomerCode ?? null,
    paystackSubscriptionCode: user?.paystackSubscriptionCode ?? null,
    paystackPlanCode: user?.paystackPlanCode ?? null,
    paystackReference: user?.paystackReference ?? null,
    paystackEmailToken: user?.paystackEmailToken ?? null,
    subscriptionStatus: user?.subscriptionStatus ?? null,
    uploadCount: countRow?.count ?? 0,
    uploadLimit: getUploadLimit(plan),
    questionLimit: getQuestionLimit(plan),
  } satisfies BillingSnapshot;
}

export async function updateUserSubscription(input: {
  userId: string;
  plan: SubscriptionPlan;
  paystackCustomerCode?: string | null;
  paystackSubscriptionCode?: string | null;
  paystackPlanCode?: string | null;
  paystackReference?: string | null;
  paystackEmailToken?: string | null;
  subscriptionStatus?: string | null;
}) {
  const sql = getSql();

  if (!sql) {
    return;
  }

  await sql`
    update users
    set
      plan = ${input.plan},
      paystack_customer_code = ${input.paystackCustomerCode ?? null},
      paystack_subscription_code = ${input.paystackSubscriptionCode ?? null},
      paystack_plan_code = ${input.paystackPlanCode ?? null},
      paystack_reference = ${input.paystackReference ?? null},
      paystack_email_token = ${input.paystackEmailToken ?? null},
      subscription_status = ${input.subscriptionStatus ?? null},
      updated_at = now()
    where id = ${input.userId}
  `;
}

export async function findUserIdByPaystackCustomerCode(customerCode: string) {
  const sql = getSql();

  if (!sql) {
    return null;
  }

  const [row] = await sql<{ id: string }[]>`
    select id
    from users
    where paystack_customer_code = ${customerCode}
    limit 1
  `;

  return row?.id ?? null;
}

export async function findUserIdByPaystackSubscriptionCode(subscriptionCode: string) {
  const sql = getSql();

  if (!sql) {
    return null;
  }

  const [row] = await sql<{ id: string }[]>`
    select id
    from users
    where paystack_subscription_code = ${subscriptionCode}
    limit 1
  `;

  return row?.id ?? null;
}
