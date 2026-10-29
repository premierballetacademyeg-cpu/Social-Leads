var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
import {
  boolean,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar
} from "drizzle-orm/mysql-core";
var users, faqEntries, inboxImports, faqCandidates, conversations, messageEvents, webhookDeliveries, socialPosts, metricSnapshots, systemJobs, integrationSettings, staffNotifications, browserAutomationRuns;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["admin", "user"]).default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    faqEntries = mysqlTable(
      "faq_entries",
      {
        id: int("id").autoincrement().primaryKey(),
        slug: varchar("slug", { length: 160 }).notNull(),
        status: mysqlEnum("status", ["draft", "approved", "archived"]).default("draft").notNull(),
        source: mysqlEnum("source", ["website", "psi", "inbox", "staff"]).default("staff").notNull(),
        questionEn: text("question_en").notNull(),
        questionAr: text("question_ar").notNull(),
        answerEn: text("answer_en").notNull(),
        answerAr: text("answer_ar").notNull(),
        keywordsEn: json("keywords_en").$type().notNull(),
        keywordsAr: json("keywords_ar").$type().notNull(),
        intentAliases: json("intent_aliases").$type().notNull(),
        sortOrder: int("sort_order").default(0).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        slugUnique: uniqueIndex("faq_entries_slug_unique").on(table.slug),
        statusIndex: index("faq_entries_status_index").on(table.status)
      })
    );
    inboxImports = mysqlTable("inbox_imports", {
      id: int("id").autoincrement().primaryKey(),
      fileName: varchar("file_name", { length: 255 }).notNull(),
      fileCount: int("file_count").default(0).notNull(),
      totalCustomerMessages: int("total_customer_messages").default(0).notNull(),
      uniqueQuestionCount: int("unique_question_count").default(0).notNull(),
      repeatedQuestionMessages: int("repeated_question_messages").default(0).notNull(),
      repeatedQuestionRate: int("repeated_question_rate_basis_points").default(0).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    faqCandidates = mysqlTable(
      "faq_candidates",
      {
        id: int("id").autoincrement().primaryKey(),
        importId: int("import_id").notNull(),
        question: text("question").notNull(),
        suggestedAnswer: text("suggested_answer"),
        language: mysqlEnum("language", ["en", "ar"]).notNull(),
        frequency: int("frequency").default(1).notNull(),
        sampleThreadRef: varchar("sample_thread_ref", { length: 300 }),
        status: mysqlEnum("status", ["pending", "promoted", "rejected"]).default("pending").notNull(),
        createdFaqId: int("created_faq_id"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        importIndex: index("faq_candidates_import_index").on(table.importId),
        statusIndex: index("faq_candidates_status_index").on(table.status)
      })
    );
    conversations = mysqlTable(
      "conversations",
      {
        id: int("id").autoincrement().primaryKey(),
        conversationKey: varchar("conversation_key", { length: 350 }).notNull(),
        senderId: varchar("sender_id", { length: 255 }).notNull(),
        channel: mysqlEnum("channel", [
          "instagram_dm",
          "instagram_story_reply",
          "instagram_comment",
          "facebook_messenger",
          "facebook_comment"
        ]).notNull(),
        language: mysqlEnum("language", ["en", "ar", "unselected"]).default("unselected").notNull(),
        status: mysqlEnum("status", ["active", "escalated", "closed"]).default("active").notNull(),
        isEscalated: boolean("is_escalated").default(false).notNull(),
        lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        conversationUnique: uniqueIndex("conversations_key_unique").on(
          table.conversationKey
        ),
        recentIndex: index("conversations_recent_index").on(table.lastMessageAt)
      })
    );
    messageEvents = mysqlTable(
      "message_events",
      {
        id: int("id").autoincrement().primaryKey(),
        conversationId: int("conversation_id").notNull(),
        externalMessageId: varchar("external_message_id", {
          length: 320
        }).notNull(),
        externalTargetId: varchar("external_target_id", { length: 320 }),
        channel: mysqlEnum("channel", [
          "instagram_dm",
          "instagram_story_reply",
          "instagram_comment",
          "facebook_messenger",
          "facebook_comment"
        ]).notNull(),
        direction: mysqlEnum("direction", ["inbound", "outbound"]).notNull(),
        body: text("body").notNull(),
        language: mysqlEnum("language", ["en", "ar", "unselected"]).default("unselected").notNull(),
        matchedFaqId: int("matched_faq_id"),
        escalated: boolean("escalated").default(false).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull()
      },
      (table) => ({
        externalUnique: uniqueIndex("message_events_external_unique").on(
          table.externalMessageId
        ),
        conversationIndex: index("message_events_conversation_index").on(
          table.conversationId
        ),
        createdIndex: index("message_events_created_index").on(table.createdAt)
      })
    );
    webhookDeliveries = mysqlTable(
      "webhook_deliveries",
      {
        id: int("id").autoincrement().primaryKey(),
        externalEventId: varchar("external_event_id", { length: 320 }).notNull(),
        platform: mysqlEnum("platform", ["instagram", "facebook"]).notNull(),
        eventType: varchar("event_type", { length: 80 }).notNull(),
        receivedAt: timestamp("received_at").defaultNow().notNull()
      },
      (table) => ({
        eventUnique: uniqueIndex("webhook_deliveries_event_unique").on(
          table.externalEventId
        )
      })
    );
    socialPosts = mysqlTable("social_posts", {
      id: int("id").autoincrement().primaryKey(),
      platform: mysqlEnum("platform", ["instagram", "facebook"]).notNull(),
      externalPostId: varchar("external_post_id", { length: 255 }),
      caption: text("caption").notNull(),
      mediaUrl: text("media_url"),
      status: mysqlEnum("status", ["draft", "approved", "published", "failed"]).default("draft").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      publishedAt: timestamp("published_at")
    });
    metricSnapshots = mysqlTable(
      "metric_snapshots",
      {
        id: int("id").autoincrement().primaryKey(),
        platform: mysqlEnum("platform", ["instagram", "facebook"]).notNull(),
        followers: int("followers").default(0).notNull(),
        payload: json("payload").$type().notNull(),
        collectedAt: timestamp("collected_at").defaultNow().notNull()
      },
      (table) => ({
        collectedIndex: index("metric_snapshots_collected_index").on(
          table.collectedAt
        )
      })
    );
    systemJobs = mysqlTable(
      "system_jobs",
      {
        id: int("id").autoincrement().primaryKey(),
        jobKey: varchar("job_key", { length: 100 }).notNull(),
        taskUid: varchar("task_uid", { length: 65 }),
        cronExpression: varchar("cron_expression", { length: 100 }).notNull(),
        callbackPath: varchar("callback_path", { length: 255 }).notNull(),
        isEnabled: boolean("is_enabled").default(true).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        jobKeyUnique: uniqueIndex("system_jobs_key_unique").on(table.jobKey),
        taskUidIndex: index("system_jobs_task_uid_index").on(table.taskUid)
      })
    );
    integrationSettings = mysqlTable(
      "integration_settings",
      {
        id: int("id").autoincrement().primaryKey(),
        settingsKey: varchar("settings_key", { length: 100 }).notNull(),
        metadata: json("metadata").$type().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        settingsKeyUnique: uniqueIndex("integration_settings_key_unique").on(
          table.settingsKey
        )
      })
    );
    staffNotifications = mysqlTable(
      "staff_notifications",
      {
        id: int("id").autoincrement().primaryKey(),
        type: mysqlEnum("type", [
          "escalation",
          "reply_failure",
          "integration_failure",
          "publishing"
        ]).notNull(),
        severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
        title: varchar("title", { length: 180 }).notNull(),
        detail: text("detail"),
        href: varchar("href", { length: 255 }),
        readAt: timestamp("read_at"),
        createdAt: timestamp("created_at").defaultNow().notNull()
      },
      (table) => ({
        createdIndex: index("staff_notifications_created_index").on(
          table.createdAt
        ),
        unreadIndex: index("staff_notifications_unread_index").on(table.readAt)
      })
    );
    browserAutomationRuns = mysqlTable(
      "browser_automation_runs",
      {
        id: int("id").autoincrement().primaryKey(),
        externalRunId: varchar("external_run_id", { length: 64 }).notNull(),
        task: text("task").notNull(),
        status: mysqlEnum("status", [
          "queued",
          "dispatching",
          "running",
          "completed",
          "failed",
          "cancelled"
        ]).default("queued").notNull(),
        result: text("result"),
        error: text("error"),
        model: varchar("model", { length: 80 }),
        totalCostUsd: varchar("total_cost_usd", { length: 32 }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        externalRunUnique: uniqueIndex(
          "browser_automation_runs_external_unique"
        ).on(table.externalRunId),
        createdIndex: index("browser_automation_runs_created_index").on(
          table.createdAt
        ),
        statusIndex: index("browser_automation_runs_status_index").on(table.status)
      })
    );
  }
});

// server/db.ts
import { count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
async function getDb() {
  if (!_db && process.env.DATABASE_URL) _db = drizzle(process.env.DATABASE_URL);
  return _db;
}
async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database connection is unavailable.");
  return db;
}
async function upsertUser(user) {
  const db = await requireDb();
  const role = user.role ?? (user.openId === process.env.OWNER_OPEN_ID ? "admin" : "user");
  await db.insert(users).values({
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    loginMethod: user.loginMethod ?? null,
    role,
    lastSignedIn: user.lastSignedIn ?? /* @__PURE__ */ new Date()
  }).onDuplicateKeyUpdate({
    set: {
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      lastSignedIn: user.lastSignedIn ?? /* @__PURE__ */ new Date()
    }
  });
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
}
async function syncOfficialFaqEntries(seeds) {
  const db = await requireDb();
  for (const seed of seeds) {
    const values = { ...seed, status: seed.status ?? "approved" };
    await db.insert(faqEntries).values(values).onDuplicateKeyUpdate({ set: values });
  }
  return {
    approved: seeds.filter((seed) => (seed.status ?? "approved") === "approved").length,
    archived: seeds.filter((seed) => seed.status === "archived").length
  };
}
async function getLatestMetricCollectedAt() {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select({ collectedAt: metricSnapshots.collectedAt }).from(metricSnapshots).orderBy(desc(metricSnapshots.collectedAt)).limit(1);
  return row?.collectedAt ?? null;
}
async function getApprovedFaqEntries() {
  const db = await requireDb();
  return db.select().from(faqEntries).where(eq(faqEntries.status, "approved")).orderBy(faqEntries.sortOrder);
}
async function listFaqEntries() {
  const db = await requireDb();
  return db.select().from(faqEntries).orderBy(faqEntries.sortOrder, desc(faqEntries.updatedAt));
}
async function createFaqEntry(input) {
  const db = await requireDb();
  const [result] = await db.insert(faqEntries).values(input);
  return Number(result.insertId);
}
async function updateFaqEntry(id, input) {
  const db = await requireDb();
  await db.update(faqEntries).set({ ...input, updatedAt: /* @__PURE__ */ new Date() }).where(eq(faqEntries.id, id));
}
async function createInboxImport(input) {
  const db = await requireDb();
  const [result] = await db.insert(inboxImports).values({
    ...input,
    repeatedQuestionRate: Math.round(input.repeatedQuestionRate * 100)
  });
  return Number(result.insertId);
}
async function insertFaqCandidates(importId, candidates) {
  if (!candidates.length) return;
  const db = await requireDb();
  await db.insert(faqCandidates).values(
    candidates.map((candidate) => ({
      importId,
      question: candidate.question,
      suggestedAnswer: candidate.answer,
      language: candidate.language,
      frequency: candidate.frequency,
      sampleThreadRef: candidate.sampleThreadRef
    }))
  );
}
async function listInboxImports() {
  const db = await requireDb();
  return db.select().from(inboxImports).orderBy(desc(inboxImports.createdAt));
}
async function listFaqCandidates() {
  const db = await requireDb();
  return db.select().from(faqCandidates).orderBy(desc(faqCandidates.frequency), desc(faqCandidates.createdAt)).limit(500);
}
async function promoteCandidateToDraft(candidateId) {
  const db = await requireDb();
  const candidate = (await db.select().from(faqCandidates).where(eq(faqCandidates.id, candidateId)).limit(1))[0];
  if (!candidate) throw new Error("FAQ candidate not found.");
  if (candidate.status !== "pending")
    throw new Error("Only pending candidates can be promoted.");
  const draftId = await createFaqEntry({
    slug: `inbox-${candidate.id}-${Date.now()}`,
    status: "draft",
    source: "inbox",
    questionEn: candidate.language === "en" ? candidate.question : "",
    questionAr: candidate.language === "ar" ? candidate.question : "",
    answerEn: candidate.language === "en" ? candidate.suggestedAnswer ?? "" : "",
    answerAr: candidate.language === "ar" ? candidate.suggestedAnswer ?? "" : "",
    keywordsEn: [],
    keywordsAr: [],
    intentAliases: [],
    sortOrder: 999
  });
  await db.update(faqCandidates).set({ status: "promoted", createdFaqId: draftId }).where(eq(faqCandidates.id, candidateId));
  return draftId;
}
async function upsertConversation(input) {
  const db = await requireDb();
  const now = /* @__PURE__ */ new Date();
  await db.insert(conversations).values({ ...input, lastMessageAt: now }).onDuplicateKeyUpdate({ set: { lastMessageAt: now, updatedAt: now } });
  const row = (await db.select().from(conversations).where(eq(conversations.conversationKey, input.conversationKey)).limit(1))[0];
  if (!row) throw new Error("Conversation could not be loaded.");
  return row;
}
async function setConversationLanguage(id, language) {
  const db = await requireDb();
  await db.update(conversations).set({ language, updatedAt: /* @__PURE__ */ new Date() }).where(eq(conversations.id, id));
}
async function markConversationEscalated(id) {
  const db = await requireDb();
  await db.update(conversations).set({ status: "escalated", isEscalated: true, updatedAt: /* @__PURE__ */ new Date() }).where(eq(conversations.id, id));
}
async function markConversationResolved(id) {
  const db = await requireDb();
  await db.update(conversations).set({ status: "closed", updatedAt: /* @__PURE__ */ new Date() }).where(eq(conversations.id, id));
}
async function appendMessageEvent(input) {
  const db = await requireDb();
  await db.insert(messageEvents).values(input).onDuplicateKeyUpdate({
    set: { externalMessageId: input.externalMessageId }
  });
}
async function getRecentUnselectedInbound(conversationId, limit = 5) {
  const db = await requireDb();
  return db.select({
    externalMessageId: messageEvents.externalMessageId,
    body: messageEvents.body
  }).from(messageEvents).where(
    sql`${messageEvents.conversationId} = ${conversationId} and ${messageEvents.direction} = 'inbound' and ${messageEvents.language} = 'unselected'`
  ).orderBy(desc(messageEvents.id)).limit(limit);
}
async function recordWebhookDelivery(input) {
  const db = await requireDb();
  const existing = await db.select({ id: webhookDeliveries.id }).from(webhookDeliveries).where(eq(webhookDeliveries.externalEventId, input.externalEventId)).limit(1);
  if (existing.length) return false;
  await db.insert(webhookDeliveries).values(input);
  return true;
}
async function listConversations() {
  const db = await requireDb();
  return db.select().from(conversations).orderBy(desc(conversations.lastMessageAt)).limit(200);
}
async function getRecentMessageEvents() {
  const db = await requireDb();
  return db.select().from(messageEvents).orderBy(desc(messageEvents.createdAt)).limit(200);
}
async function getDashboardStats() {
  const db = await requireDb();
  const [conversationCount] = await db.select({ value: count() }).from(conversations);
  const [escalationCount] = await db.select({ value: count() }).from(messageEvents).where(eq(messageEvents.escalated, true));
  const [inboundCount] = await db.select({ value: count() }).from(messageEvents).where(eq(messageEvents.direction, "inbound"));
  const [outboundCount] = await db.select({ value: count() }).from(messageEvents).where(eq(messageEvents.direction, "outbound"));
  const [matchedCount] = await db.select({ value: count() }).from(messageEvents).where(sql`${messageEvents.matchedFaqId} is not null`);
  const [resolvedCount] = await db.select({ value: count() }).from(conversations).where(eq(conversations.status, "closed"));
  const commentsByPlatform = await db.select({ channel: messageEvents.channel, value: count() }).from(messageEvents).where(
    inArray(messageEvents.channel, ["instagram_comment", "facebook_comment"])
  ).groupBy(messageEvents.channel);
  const commentsByPost = await db.select({ sourcePostId: messageEvents.externalTargetId, value: count() }).from(messageEvents).where(
    sql`${messageEvents.externalTargetId} is not null and ${messageEvents.channel} in ('instagram_comment', 'facebook_comment')`
  ).groupBy(messageEvents.externalTargetId).orderBy(desc(count())).limit(5);
  const snapshots = await db.select().from(metricSnapshots).orderBy(desc(metricSnapshots.collectedAt)).limit(20);
  const followerTotals = {};
  for (const snapshot of snapshots)
    if (followerTotals[snapshot.platform] === void 0)
      followerTotals[snapshot.platform] = snapshot.followers;
  return {
    conversations: conversationCount.value,
    inboundMessages: inboundCount.value,
    outboundReplies: outboundCount.value,
    matchedFaqReplies: matchedCount.value,
    escalations: escalationCount.value,
    resolvedConversations: resolvedCount.value,
    commentsByPlatform,
    commentsByPost,
    followerTotals,
    snapshots
  };
}
async function insertMetricSnapshot(input) {
  const db = await requireDb();
  await db.insert(metricSnapshots).values(input);
}
async function createSocialPost(input) {
  const db = await requireDb();
  const [result] = await db.insert(socialPosts).values(input);
  return Number(result.insertId);
}
async function getSocialPost(id) {
  const db = await requireDb();
  return (await db.select().from(socialPosts).where(eq(socialPosts.id, id)).limit(1))[0];
}
async function updateSocialPost(id, input) {
  const db = await requireDb();
  await db.update(socialPosts).set(input).where(eq(socialPosts.id, id));
}
async function approveSocialPost(id) {
  const post = await getSocialPost(id);
  if (!post || post.status !== "draft")
    throw new Error("Only draft posts can be approved.");
  await updateSocialPost(id, { status: "approved" });
}
async function listSocialPosts() {
  const db = await requireDb();
  return db.select().from(socialPosts).orderBy(desc(socialPosts.createdAt)).limit(100);
}
async function createStaffNotification(input) {
  const db = await requireDb();
  const [result] = await db.insert(staffNotifications).values(input);
  return Number(result.insertId);
}
async function listStaffNotifications() {
  const db = await requireDb();
  const notifications = await db.select().from(staffNotifications).orderBy(desc(staffNotifications.createdAt)).limit(50);
  const [unread] = await db.select({ value: count() }).from(staffNotifications).where(isNull(staffNotifications.readAt));
  return { notifications, unreadCount: unread.value };
}
async function markStaffNotificationRead(id) {
  const db = await requireDb();
  await db.update(staffNotifications).set({ readAt: /* @__PURE__ */ new Date() }).where(eq(staffNotifications.id, id));
}
async function markAllStaffNotificationsRead() {
  const db = await requireDb();
  await db.update(staffNotifications).set({ readAt: /* @__PURE__ */ new Date() }).where(isNull(staffNotifications.readAt));
}
async function getIntegrationMetadata() {
  const db = await requireDb();
  return (await db.select().from(integrationSettings).where(eq(integrationSettings.settingsKey, "meta-audit")).limit(1))[0];
}
async function upsertIntegrationMetadata(metadata) {
  const db = await requireDb();
  await db.insert(integrationSettings).values({ settingsKey: "meta-audit", metadata }).onDuplicateKeyUpdate({ set: { metadata, updatedAt: /* @__PURE__ */ new Date() } });
  return getIntegrationMetadata();
}
async function createBrowserAutomationRun(input) {
  const db = await requireDb();
  const [result] = await db.insert(browserAutomationRuns).values(input);
  return Number(result.insertId);
}
async function getBrowserAutomationRun(id) {
  const db = await requireDb();
  return (await db.select().from(browserAutomationRuns).where(eq(browserAutomationRuns.id, id)).limit(1))[0];
}
async function listBrowserAutomationRuns() {
  const db = await requireDb();
  return db.select().from(browserAutomationRuns).orderBy(desc(browserAutomationRuns.createdAt)).limit(100);
}
async function updateBrowserAutomationRun(id, input) {
  const db = await requireDb();
  await db.update(browserAutomationRuns).set({ ...input, updatedAt: /* @__PURE__ */ new Date() }).where(eq(browserAutomationRuns.id, id));
  return getBrowserAutomationRun(id);
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    _db = null;
  }
});

// server/social/meta.ts
import { createHmac, timingSafeEqual } from "crypto";
async function listAuthorizedFacebookPages(credential) {
  const response = await fetch(
    `${graphBase}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${encodeURIComponent(credential)}`
  );
  if (!response.ok)
    throw new Error(
      `Meta Page-list lookup failed: ${(await response.text()).slice(0, 500)}`
    );
  const payload = await response.json();
  return payload.data?.filter((candidate) => candidate.id) ?? [];
}
async function resolveFacebookPageAccessToken(requestedPageId) {
  const credential = process.env.META_PAGE_ACCESS_TOKEN;
  const pageId = requestedPageId ?? academyPageId;
  if (!credential) throw new Error("META_PAGE_ACCESS_TOKEN is not configured.");
  const principalResponse = await fetch(
    `${graphBase}/me?fields=id&access_token=${encodeURIComponent(credential)}`
  );
  if (!principalResponse.ok)
    throw new Error(
      `Meta credential validation failed: ${(await principalResponse.text()).slice(0, 500)}`
    );
  const principal = await principalResponse.json();
  if (principal.id === pageId) return credential;
  const pages = await listAuthorizedFacebookPages(credential);
  const page = pages.find((candidate) => candidate.id === pageId) ?? pages.find(
    (candidate) => candidate.name?.toLowerCase().includes("premier ballet academy")
  );
  if (!page?.access_token)
    throw new Error(
      "The configured Facebook credential is a user token, but Meta did not return a Page-specific token. Reauthorize with Page permissions including pages_show_list and pages_manage_metadata."
    );
  return page.access_token;
}
function metaReadiness() {
  const hasAppSecret = Boolean(process.env.META_APP_SECRET);
  const hasInstagramAppSecret = Boolean(process.env.META_INSTAGRAM_APP_SECRET);
  const hasVerifyToken = Boolean(process.env.META_VERIFY_TOKEN);
  const hasPageToken = Boolean(process.env.META_PAGE_ACCESS_TOKEN);
  const hasInstagramToken = Boolean(process.env.META_INSTAGRAM_ACCESS_TOKEN);
  const hasPageId = Boolean(process.env.META_PAGE_ID);
  const hasInstagramId = Boolean(process.env.META_INSTAGRAM_ACCOUNT_ID);
  const readyForFacebookReplies = hasPageToken && hasPageId;
  const readyForInstagramReplies = hasInstagramToken && hasInstagramId;
  return {
    hasAppSecret,
    hasInstagramAppSecret,
    hasVerifyToken,
    hasPageToken,
    hasInstagramToken,
    hasPageId,
    hasInstagramId,
    liveSendingEnabled: process.env.META_SEND_ENABLED === "true",
    readyForWebhook: (hasAppSecret || hasInstagramAppSecret) && hasVerifyToken,
    readyForFacebookReplies,
    readyForInstagramReplies,
    readyForReplies: readyForFacebookReplies && readyForInstagramReplies
  };
}
async function resolveMetaAccounts() {
  const stored = await getIntegrationMetadata();
  const metadata = stored?.metadata ?? {};
  return {
    pageId: process.env.META_PAGE_ID ?? (typeof metadata.pageId === "string" ? metadata.pageId : void 0),
    instagramId: process.env.META_INSTAGRAM_ACCOUNT_ID ?? (typeof metadata.instagramId === "string" ? metadata.instagramId : void 0),
    pageName: typeof metadata.pageName === "string" ? metadata.pageName : void 0,
    instagramUsername: typeof metadata.instagramUsername === "string" ? metadata.instagramUsername : void 0
  };
}
async function metaReadinessWithStoredAccounts() {
  const accounts = await resolveMetaAccounts();
  const base = metaReadiness();
  const hasPageId = Boolean(accounts.pageId);
  const hasInstagramId = Boolean(accounts.instagramId);
  return {
    ...base,
    hasPageId,
    hasInstagramId,
    readyForReplies: base.hasPageToken && hasPageId && hasInstagramId,
    accounts
  };
}
async function discoverMetaAccounts() {
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN;
  const instagramToken = process.env.META_INSTAGRAM_ACCESS_TOKEN;
  if (!pageToken && !instagramToken)
    throw new Error(
      "Add the Meta Page token and/or Instagram API token before discovering connected accounts."
    );
  let page;
  if (pageToken) {
    const principalResponse = await fetch(
      `${graphBase}/me?fields=id,name&access_token=${encodeURIComponent(pageToken)}`
    );
    if (!principalResponse.ok)
      throw new Error(
        `Meta Page-token validation failed: ${(await principalResponse.text()).slice(0, 500)}`
      );
    const authorisedPages = await listAuthorizedFacebookPages(pageToken);
    const namedPage = authorisedPages.find(
      (candidate) => candidate.name?.toLowerCase().includes("premier ballet academy")
    );
    page = namedPage ?? (authorisedPages.length === 1 ? authorisedPages[0] : void 0);
    if (!page || !page.instagram_business_account?.id) {
      const directPageResponse = await fetch(
        `${graphBase}/${academyPageId}?fields=id,name,instagram_business_account{id,username}&access_token=${encodeURIComponent(pageToken)}`
      );
      if (directPageResponse.ok) {
        const directPage = await directPageResponse.json();
        if (directPage?.id) page = directPage;
      }
    }
  }
  let instagramId = page?.instagram_business_account?.id;
  let instagramUsername = page?.instagram_business_account?.username;
  if (instagramToken) {
    const instagramResponse = await fetch(
      `${instagramGraphBase}/me?fields=user_id,username&access_token=${encodeURIComponent(instagramToken)}`
    );
    const instagramPayload = await instagramResponse.json();
    if (!instagramResponse.ok)
      throw new Error(
        `Instagram token validation failed: ${instagramPayload.error?.message ?? "no error message returned"}`
      );
    const account = instagramPayload.data?.[0] ?? instagramPayload;
    if (!account.user_id)
      throw new Error(
        "Instagram token validation did not return the professional-account identifier."
      );
    instagramId = account.user_id;
    instagramUsername = account.username;
  }
  if (!page?.id)
    throw new Error(
      "Meta did not return the Premier Ballet Academy Page. Confirm the Page token has Page access."
    );
  if (!instagramId)
    throw new Error(
      "Meta did not return the linked Instagram professional account. Add the Instagram API token generated for @premierballet_academy."
    );
  const existing = await getIntegrationMetadata();
  const metadata = {
    ...existing?.metadata ?? {},
    pageId: page.id,
    pageName: page.name ?? null,
    instagramId,
    instagramUsername: instagramUsername ?? null,
    discoveredAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await upsertIntegrationMetadata(metadata);
  return {
    pageId: page.id,
    pageName: page.name ?? null,
    instagramId,
    instagramUsername: instagramUsername ?? null
  };
}
async function activateFacebookPageWebhook() {
  const accounts = await resolveMetaAccounts();
  if (!accounts.pageId)
    throw new Error(
      "Discover the connected Facebook Page before activating Page webhook delivery."
    );
  const pageToken = await resolveFacebookPageAccessToken(accounts.pageId);
  const response = await fetch(
    `${graphBase}/${accounts.pageId}/subscribed_apps`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        subscribed_fields: facebookWebhookFields.join(","),
        access_token: pageToken
      }).toString()
    }
  );
  const payload = await response.json();
  if (!response.ok || !payload.success)
    throw new Error(
      `Facebook Page webhook activation failed: ${payload.error?.message ?? "no success confirmation returned"}`
    );
  const existing = await getIntegrationMetadata();
  await upsertIntegrationMetadata({
    ...existing?.metadata ?? {},
    facebookPageWebhookFields: facebookWebhookFields,
    facebookPageWebhookActivatedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  return {
    pageId: accounts.pageId,
    fields: facebookWebhookFields,
    active: true
  };
}
function verifyMetaSignature(rawBody, signature) {
  const secrets = [
    process.env.META_APP_SECRET,
    process.env.META_INSTAGRAM_APP_SECRET
  ].filter((secret) => Boolean(secret));
  if (!secrets.length || !rawBody || !signature?.startsWith("sha256="))
    return false;
  const incoming = Buffer.from(signature, "utf8");
  return secrets.some((secret) => {
    const expected = Buffer.from(
      `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`,
      "utf8"
    );
    return incoming.length === expected.length && timingSafeEqual(incoming, expected);
  });
}
function channelFor(platform, messaging) {
  if (platform === "instagram" && messaging.reply_to?.story)
    return "instagram_story_reply";
  return platform === "instagram" ? "instagram_dm" : "facebook_messenger";
}
function textFromMessage(message) {
  return typeof message.text === "string" ? message.text.trim() : "";
}
function isOwnAccount(platform, authorId, entryId) {
  if (!authorId || authorId === "unknown") return false;
  if (authorId === entryId) return true;
  const ownIds = platform === "facebook" ? [process.env.META_PAGE_ID, academyPageId] : [process.env.META_INSTAGRAM_ACCOUNT_ID];
  return ownIds.some((id) => Boolean(id) && id === authorId);
}
function normalizeMetaPayload(payload) {
  const platform = payload?.object === "instagram" ? "instagram" : payload?.object === "page" ? "facebook" : null;
  if (!platform || !Array.isArray(payload?.entry)) return [];
  const events = [];
  for (const entry of payload.entry) {
    for (const messaging of entry.messaging ?? []) {
      if (messaging?.message?.is_echo) continue;
      const body = textFromMessage(messaging.message ?? {});
      if (!body) continue;
      events.push({
        externalEventId: messaging?.message?.mid ?? `${entry.id}:${messaging.timestamp}:${messaging.sender?.id}`,
        platform,
        channel: channelFor(platform, messaging),
        senderId: String(messaging?.sender?.id ?? ""),
        body,
        occurredAt: new Date(Number(messaging?.timestamp ?? Date.now())),
        rawType: "message"
      });
    }
    for (const change of entry.changes ?? []) {
      const value = change?.value ?? {};
      const isFacebookComment = platform === "facebook" && (String(value.item ?? "") === "comment" || Boolean(value.comment_id));
      const isInstagramComment = platform === "instagram" && String(change?.field ?? "") === "comments" && Boolean(value.id);
      if (!isFacebookComment && !isInstagramComment) continue;
      if (platform === "facebook" && value.verb && value.verb !== "add")
        continue;
      const authorId = String(value.from?.id ?? value.sender_id ?? "unknown");
      if (isOwnAccount(platform, authorId, String(entry.id ?? ""))) continue;
      const body = String(value.message ?? value.text ?? "").trim();
      if (!body) continue;
      const commentId = String(value.comment_id ?? value.id ?? "");
      events.push({
        externalEventId: commentId || `${entry.id}:${change.field}:${value.created_time ?? Date.now()}`,
        platform,
        channel: platform === "instagram" ? "instagram_comment" : "facebook_comment",
        senderId: authorId,
        body,
        targetId: commentId,
        occurredAt: new Date(
          value.created_time ? Number(value.created_time) * 1e3 : Date.now()
        ),
        rawType: "comment"
      });
    }
  }
  return events.filter((event) => event.senderId.length > 0);
}
function buildMetaReplyRequest(event, text2, accounts, facebookPageToken) {
  const isInstagram = event.platform === "instagram";
  const token = isInstagram ? process.env.META_INSTAGRAM_ACCESS_TOKEN : facebookPageToken ?? process.env.META_PAGE_ACCESS_TOKEN;
  if (!token)
    return {
      detail: isInstagram ? "Missing META_INSTAGRAM_ACCESS_TOKEN." : "Missing META_PAGE_ACCESS_TOKEN."
    };
  const host = isInstagram ? instagramGraphBase : graphBase;
  if (event.channel === "instagram_comment" || event.channel === "facebook_comment") {
    if (!event.targetId) return { detail: "Comment identifier is missing." };
    const edge = isInstagram ? "replies" : "comments";
    return {
      url: `${host}/${event.targetId}/${edge}`,
      payload: { message: text2 },
      token
    };
  }
  const accountId = isInstagram ? accounts.instagramId : accounts.pageId;
  if (!accountId)
    return { detail: "Platform account identifier has not been discovered." };
  return {
    url: `${host}/${accountId}/messages`,
    payload: {
      recipient: { id: event.senderId },
      message: { text: text2 },
      ...isInstagram ? {} : { messaging_type: "RESPONSE" }
    },
    token
  };
}
async function sendMetaReply(event, text2) {
  const readiness = metaReadiness();
  if (!readiness.liveSendingEnabled)
    return {
      sent: false,
      mode: "dry-run",
      detail: "META_SEND_ENABLED is not true."
    };
  const accounts = await resolveMetaAccounts();
  let facebookPageToken;
  try {
    if (event.platform === "facebook") {
      if (!accounts.pageId)
        return {
          sent: false,
          mode: "unavailable",
          detail: "Facebook Page identifier has not been discovered."
        };
      facebookPageToken = await resolveFacebookPageAccessToken(accounts.pageId);
    }
  } catch (error) {
    return {
      sent: false,
      mode: "unavailable",
      detail: error instanceof Error ? error.message : "Facebook Page token resolution failed."
    };
  }
  const request2 = buildMetaReplyRequest(
    event,
    text2,
    accounts,
    facebookPageToken
  );
  if ("detail" in request2)
    return { sent: false, mode: "unavailable", detail: request2.detail };
  let response;
  try {
    response = await fetch(request2.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request2.token}`
      },
      body: JSON.stringify(request2.payload),
      signal: AbortSignal.timeout(1e4)
    });
  } catch (error) {
    return {
      sent: false,
      mode: "unavailable",
      detail: error instanceof Error ? `Network error contacting Meta: ${error.message}` : "Network error contacting Meta."
    };
  }
  if (!response.ok)
    return {
      sent: false,
      mode: "live",
      detail: (await response.text()).slice(0, 500)
    };
  return { sent: true, mode: "live" };
}
var graphBase, instagramGraphBase, academyPageId, facebookWebhookFields;
var init_meta = __esm({
  "server/social/meta.ts"() {
    "use strict";
    init_db();
    graphBase = process.env.META_GRAPH_API_BASE ?? "https://graph.facebook.com/v26.0";
    instagramGraphBase = process.env.META_INSTAGRAM_API_BASE ?? "https://graph.instagram.com/v26.0";
    academyPageId = process.env.META_PAGE_ID ?? "1097461780292447";
    facebookWebhookFields = [
      "messages",
      "messaging_postbacks",
      "messaging_optins",
      "message_reactions",
      "feed"
    ];
  }
});

// server/social/publisher.ts
var publisher_exports = {};
__export(publisher_exports, {
  publishSocialPost: () => publishSocialPost
});
async function graphPost(base, path, payload, token) {
  const body = new URLSearchParams(payload);
  const response = await fetch(`${base}/${path}?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!response.ok) throw new Error((await response.text()).slice(0, 500));
  return response.json();
}
async function publishSocialPost(input) {
  const readiness = metaReadiness();
  if (!readiness.liveSendingEnabled) throw new Error("Live publishing is locked. Set META_SEND_ENABLED=true only after staff approval and Meta verification.");
  const approvedPost = await getSocialPost(input.postId);
  if (!approvedPost || approvedPost.status !== "approved") throw new Error("Only staff-approved posts can be sent live.");
  const accounts = await resolveMetaAccounts();
  try {
    let externalPostId;
    if (approvedPost.platform === "facebook") {
      if (!accounts.pageId) throw new Error("Connected Facebook Page ID has not been discovered.");
      const pageToken = await resolveFacebookPageAccessToken(accounts.pageId);
      const response = await graphPost(graphBase3, `${accounts.pageId}/feed`, { message: approvedPost.caption, ...approvedPost.mediaUrl ? { link: approvedPost.mediaUrl } : {} }, pageToken);
      externalPostId = response.id ?? "";
    } else {
      if (!accounts.instagramId) throw new Error("Connected Instagram professional account ID has not been discovered.");
      if (!approvedPost.mediaUrl) throw new Error("Instagram publishing requires a public image URL.");
      const instagramToken = process.env.META_INSTAGRAM_ACCESS_TOKEN;
      if (!instagramToken) throw new Error("META_INSTAGRAM_ACCESS_TOKEN is not configured.");
      const container = await graphPost(instagramGraphBase3, `${accounts.instagramId}/media`, { image_url: approvedPost.mediaUrl, caption: approvedPost.caption }, instagramToken);
      const published = await graphPost(instagramGraphBase3, `${accounts.instagramId}/media_publish`, { creation_id: container.id }, instagramToken);
      externalPostId = published.id ?? "";
    }
    await updateSocialPost(approvedPost.id, { status: "published", externalPostId, publishedAt: /* @__PURE__ */ new Date() });
    await createStaffNotification({ type: "publishing", severity: "info", title: "Approved post published", detail: `The approved ${approvedPost.platform} post was published successfully.`, href: "/publish" });
    return { id: approvedPost.id, externalPostId };
  } catch (error) {
    await updateSocialPost(approvedPost.id, { status: "failed" });
    await createStaffNotification({ type: "publishing", severity: "critical", title: "Approved post failed to publish", detail: `The approved ${approvedPost.platform} post requires staff review.`, href: "/publish" });
    throw error;
  }
}
var graphBase3, instagramGraphBase3;
var init_publisher = __esm({
  "server/social/publisher.ts"() {
    "use strict";
    init_db();
    init_meta();
    graphBase3 = process.env.META_GRAPH_API_BASE ?? "https://graph.facebook.com/v26.0";
    instagramGraphBase3 = process.env.META_INSTAGRAM_API_BASE ?? "https://graph.instagram.com/v26.0";
  }
});

// server/_core/app.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var SESSION_MAX_AGE_MS = 1e3 * 60 * 60 * 24 * 30;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    // Browsers reject SameSite=None without Secure, so plain-http local dev uses Lax.
    sameSite: secure ? "none" : "lax",
    secure
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  }))
});

// server/routers.ts
init_db();

// server/social/inboxImport.ts
import AdmZip from "adm-zip";
var MAX_ZIP_BYTES = 25 * 1024 * 1024;
var MAX_JSON_FILES = 2500;
function cleanText(value) {
  return value.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email removed]").replace(/(?:\+?20)?\s?0?1[0-9\s-]{8,}/g, "[phone removed]").replace(/\s+/g, " ").trim().slice(0, 700);
}
function normalizedKey(value) {
  return cleanText(value).toLocaleLowerCase().replace(/[^A-Za-z0-9\u0600-\u06FF\s]/g, " ").replace(/\s+/g, " ").trim();
}
function isAcademySender(sender) {
  return (sender ?? "").toLocaleLowerCase().includes("premier ballet academy");
}
function looksLikeQuestion(value) {
  return value.includes("?") || /^(how|what|when|where|can|do|is|are|could|would|fees|price|schedule|class|age|hello|hi|details|عايزة|عايز|ممكن|ما|متى|فين|كم|هل|مرحبا)/.test(value.toLocaleLowerCase());
}
function languageFor(value) {
  return /[\u0600-\u06FF]/.test(value) ? "ar" : "en";
}
function isReviewableQuestion(value) {
  const normalized = value.toLocaleLowerCase();
  if (value.includes("[phone removed]") || value.includes("[email removed]") || value.length > 280) return false;
  if (/^facebook created this chat|^@meta ai|^hi, congrats on setting up business ai/.test(normalized)) return false;
  return !["hi", "hello", "hello my dear", "details", "details please", "details plz"].includes(normalized);
}
function usableHistoricalAnswer(value) {
  if (!value) return null;
  const normalized = value.toLocaleLowerCase();
  if (normalized.includes("your ai agent will respond") || normalized.includes("this chat was assigned") || normalized.includes("lead stage set")) return null;
  return value;
}
function parseFacebookInboxZip(zipBuffer) {
  if (zipBuffer.length > MAX_ZIP_BYTES) throw new Error("The ZIP file exceeds the 25 MB safety limit.");
  const entries = new AdmZip(zipBuffer).getEntries().filter((entry) => /(^|\/)message_\d+\.json$/.test(entry.entryName)).slice(0, MAX_JSON_FILES);
  const aggregate = /* @__PURE__ */ new Map();
  let totalCustomerMessages = 0;
  for (const entry of entries) {
    let thread;
    try {
      thread = JSON.parse(entry.getData().toString("utf8"));
    } catch {
      continue;
    }
    const messages = [...thread.messages ?? []].filter((message) => typeof message.content === "string" && message.content.trim().length > 0).sort((a, b) => (a.timestamp_ms ?? 0) - (b.timestamp_ms ?? 0));
    for (let index2 = 0; index2 < messages.length; index2 += 1) {
      const message = messages[index2];
      if (isAcademySender(message.sender_name) || !message.content) continue;
      const question = cleanText(message.content);
      if (!looksLikeQuestion(question) || !isReviewableQuestion(question)) continue;
      totalCustomerMessages += 1;
      const nextReply = messages.slice(index2 + 1, index2 + 7).find((next) => isAcademySender(next.sender_name) && next.content);
      const answer = usableHistoricalAnswer(nextReply?.content ? cleanText(nextReply.content) : null);
      const key = normalizedKey(question);
      if (!key) continue;
      const existing = aggregate.get(key);
      if (existing) {
        existing.frequency += 1;
        if (!existing.answer && answer) existing.answer = answer;
      } else aggregate.set(key, { question, answer, language: languageFor(question), frequency: 1, thread: null });
    }
  }
  const candidates = Array.from(aggregate.values()).filter((candidate) => candidate.frequency >= 2).sort((a, b) => b.frequency - a.frequency || a.question.localeCompare(b.question)).slice(0, 500).map((candidate) => ({ question: candidate.question, answer: candidate.answer, language: candidate.language, frequency: candidate.frequency, sampleThreadRef: candidate.thread }));
  const repeatedQuestionMessages = candidates.filter((candidate) => candidate.frequency > 1).reduce((sum, candidate) => sum + candidate.frequency, 0);
  return { fileCount: entries.length, totalCustomerMessages, uniqueQuestionCount: aggregate.size, repeatedQuestionMessages, repeatedQuestionRate: totalCustomerMessages === 0 ? 0 : Math.round(repeatedQuestionMessages / totalCustomerMessages * 1e4) / 100, candidates };
}

// server/routers.ts
init_meta();

// server/social/metrics.ts
init_db();
init_meta();
var graphBase2 = process.env.META_GRAPH_API_BASE ?? "https://graph.facebook.com/v26.0";
var instagramGraphBase2 = process.env.META_INSTAGRAM_API_BASE ?? "https://graph.instagram.com/v26.0";
async function graphGet(base, path, token) {
  const response = await fetch(`${base}/${path}${path.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error(`Meta metrics request failed: ${await response.text()}`);
  return response.json();
}
async function refreshSocialMetrics() {
  const { pageId, instagramId } = await resolveMetaAccounts();
  const result = {};
  if (pageId) {
    const pageToken = await resolveFacebookPageAccessToken(pageId);
    const page = await graphGet(graphBase2, `${pageId}?fields=fan_count,followers_count,name`, pageToken);
    await insertMetricSnapshot({ platform: "facebook", followers: Number(page.followers_count ?? page.fan_count ?? 0), payload: { pageName: page.name ?? null, fanCount: page.fan_count ?? null } });
    result.facebook = page;
  }
  if (instagramId) {
    const instagramToken = process.env.META_INSTAGRAM_ACCESS_TOKEN;
    if (!instagramToken) throw new Error("META_INSTAGRAM_ACCESS_TOKEN is not configured.");
    const instagram = await graphGet(instagramGraphBase2, `${instagramId}?fields=followers_count,media_count,username`, instagramToken);
    await insertMetricSnapshot({ platform: "instagram", followers: Number(instagram.followers_count ?? 0), payload: { username: instagram.username ?? null, mediaCount: instagram.media_count ?? null } });
    result.instagram = instagram;
  }
  return result;
}

// server/social/seed.ts
init_db();

// server/social/constants.ts
var WHATSAPP = {
  maadi: {
    labelEn: "Maadi",
    labelAr: "\u0627\u0644\u0645\u0639\u0627\u062F\u064A",
    number: "+20 10 00305053",
    link: "https://wa.me/201000305053"
  },
  newCairo: {
    labelEn: "New Cairo (Fam Bam)",
    labelAr: "\u0627\u0644\u0642\u0627\u0647\u0631\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 (\u0641\u0627\u0645 \u0628\u0627\u0645)",
    number: "+20 10 69935020",
    link: "https://wa.me/201069935020"
  },
  sheikhZayed: {
    labelEn: "Sheikh Zayed",
    labelAr: "\u0627\u0644\u0634\u064A\u062E \u0632\u0627\u064A\u062F",
    number: "+20 10 30743488",
    link: "https://wa.me/201030743488"
  }
};
var BRANCH_ORDER = ["maadi", "newCairo", "sheikhZayed"];
var BOT_COPY = {
  opening: {
    en: "Hello \u2014 you are chatting with Premier Ballet Academy\u2019s automated assistant. Please choose your language before continuing:\n\n1. English\n2. \u0627\u0644\u0639\u0631\u0628\u064A\u0629",
    ar: "\u0645\u0631\u062D\u0628\u0627\u064B \u2014 \u0623\u0646\u062A \u062A\u062A\u062D\u062F\u062B \u0645\u0639 \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0622\u0644\u064A \u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0628\u0631\u064A\u0645\u064A\u0631 \u0644\u0644\u0628\u0627\u0644\u064A\u0647. \u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0644\u063A\u0629 \u0642\u0628\u0644 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629:\n\n1. English\n2. \u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  languageSelected: {
    en: "English selected. How can Premier Ballet Academy\u2019s automated assistant help you today?",
    ar: "\u062A\u0645 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0639\u0631\u0628\u064A\u0629. \u0643\u064A\u0641 \u064A\u0645\u0643\u0646 \u0644\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0622\u0644\u064A \u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0628\u0631\u064A\u0645\u064A\u0631 \u0644\u0644\u0628\u0627\u0644\u064A\u0647 \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u061F"
  },
  commentReply: "Hello \u2014 you are interacting with Premier Ballet Academy\u2019s automated assistant. Please send us a direct message and choose English or \u0627\u0644\u0639\u0631\u0628\u064A\u0629 so we can help you privately."
};
function identifyBranch(text2) {
  const value = text2.toLowerCase();
  if (value.includes("maadi") || value.includes("\u0627\u0644\u0645\u0639\u0627\u062F\u064A")) return "maadi";
  if (value.includes("new cairo") || value.includes("fambam") || value.includes("fam bam") || value.includes("\u0627\u0644\u0642\u0627\u0647\u0631\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629")) return "newCairo";
  if (value.includes("sheikh zayed") || value.includes("sheikh zaid") || value.includes("sheikh zayd") || value.includes("el sheikh zayed") || value.includes("\u0627\u0644\u0634\u064A\u062E \u0632\u0627\u064A\u062F")) return "sheikhZayed";
  return null;
}
var FALLBACK_FOOTER = {
  en: "\n\nThe concerned team will reply within 24 hours. Friday is off.",
  ar: "\n\n\u0633\u064A\u0642\u0648\u0645 \u0627\u0644\u0641\u0631\u064A\u0642 \u0627\u0644\u0645\u062E\u062A\u0635 \u0628\u0627\u0644\u0631\u062F \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629. \u064A\u0648\u0645 \u0627\u0644\u062C\u0645\u0639\u0629 \u0625\u062C\u0627\u0632\u0629."
};
function escalationMessage(language, sourceText) {
  const branch = identifyBranch(sourceText);
  if (language === "ar") {
    const intro2 = "\u0644\u0627 \u0623\u0645\u0644\u0643 \u062D\u0627\u0644\u064A\u0627\u064B \u0625\u062C\u0627\u0628\u0629 \u0645\u0639\u062A\u0645\u062F\u0629 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0633\u0624\u0627\u0644.";
    if (branch) return `${intro2} \u064A\u064F\u0631\u062C\u0649 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0641\u0631\u064A\u0642 \u0641\u0631\u0639 ${WHATSAPP[branch].labelAr} \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628: ${WHATSAPP[branch].link}${FALLBACK_FOOTER.ar}`;
    return `${intro2} \u064A\u064F\u0631\u062C\u0649 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0641\u0631\u064A\u0642\u0646\u0627 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628:
${BRANCH_ORDER.map((key) => `\u2022 ${WHATSAPP[key].labelAr}: ${WHATSAPP[key].link}`).join("\n")}${FALLBACK_FOOTER.ar}`;
  }
  const intro = "I do not currently have an approved answer to that question.";
  if (branch) return `${intro} Please contact our ${WHATSAPP[branch].labelEn} team on WhatsApp: ${WHATSAPP[branch].link}${FALLBACK_FOOTER.en}`;
  return `${intro} Please contact our team on WhatsApp:
${BRANCH_ORDER.map((key) => `\u2022 ${WHATSAPP[key].labelEn}: ${WHATSAPP[key].link}`).join("\n")}${FALLBACK_FOOTER.en}`;
}
var INITIAL_FAQ_SEEDS = [
  {
    slug: "start-age",
    source: "website",
    sortOrder: 10,
    questionEn: "What age can my child start ballet?",
    questionAr: "\u0645\u0646 \u0623\u064A \u0639\u0645\u0631 \u064A\u0645\u0643\u0646 \u0644\u0637\u0641\u0644\u064A \u0623\u0646 \u064A\u0628\u062F\u0623 \u0627\u0644\u0628\u0627\u0644\u064A\u0647\u061F",
    answerEn: "Children can start ballet from age 3. Our Pre-Ballet programme is designed for ages 3\u20136 and develops coordination, musicality, and correct physical foundations in an age-appropriate environment.",
    answerAr: "\u064A\u0645\u0643\u0646 \u0644\u0644\u0623\u0637\u0641\u0627\u0644 \u0627\u0644\u0628\u062F\u0621 \u0641\u064A \u0627\u0644\u0628\u0627\u0644\u064A\u0647 \u0645\u0646 \u0633\u0646 3 \u0633\u0646\u0648\u0627\u062A. \u0628\u0631\u0646\u0627\u0645\u062C \u0645\u0627 \u0642\u0628\u0644 \u0627\u0644\u0628\u0627\u0644\u064A\u0647 \u0645\u0635\u0645\u0645 \u0644\u0644\u0623\u0639\u0645\u0627\u0631 \u0645\u0646 3 \u0625\u0644\u0649 6 \u0633\u0646\u0648\u0627\u062A \u0648\u064A\u0637\u0648\u0631 \u0627\u0644\u062A\u0646\u0627\u0633\u0642 \u0648\u0627\u0644\u0625\u062D\u0633\u0627\u0633 \u0627\u0644\u0645\u0648\u0633\u064A\u0642\u064A \u0648\u0627\u0644\u0623\u0633\u0633 \u0627\u0644\u0628\u062F\u0646\u064A\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0641\u064A \u0628\u064A\u0626\u0629 \u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0644\u0639\u0645\u0631.",
    keywordsEn: ["start ballet", "what age", "age 3", "pre ballet", "preschool", "how old", "minimum age", "youngest age"],
    keywordsAr: ["\u0633\u0646 \u0627\u0644\u0628\u0627\u0644\u064A\u0647", "\u0645\u0646 \u0623\u064A \u0639\u0645\u0631", "\u0627\u0628\u062F\u0623 \u0627\u0644\u0628\u0627\u0644\u064A\u0647", "3 \u0633\u0646\u0648\u0627\u062A", "\u0645\u0627 \u0642\u0628\u0644 \u0627\u0644\u0628\u0627\u0644\u064A\u0647", "\u0627\u0644\u0633\u0646 \u0627\u0644\u0645\u0646\u0627\u0633\u0628", "\u0633\u0646 \u0627\u0644\u0628\u062F\u0627\u064A\u0629", "\u0645\u0646 \u0633\u0646 \u0643\u0627\u0645"],
    intentAliases: ["starting age", "pre-ballet eligibility"]
  },
  {
    slug: "programs",
    source: "website",
    sortOrder: 20,
    questionEn: "What ballet programmes do you offer?",
    questionAr: "\u0645\u0627 \u0647\u064A \u0628\u0631\u0627\u0645\u062C \u0627\u0644\u0628\u0627\u0644\u064A\u0647 \u0627\u0644\u062A\u064A \u062A\u0642\u062F\u0645\u0648\u0646\u0647\u0627\u061F",
    answerEn: "PBA offers Pre-Ballet for ages 3\u20136, structured Ballet School training for age 7+, and adult ballet classes for beginners and returning dancers. The academy also offers subjects such as repertoire, character dance, contemporary, PBT fitness, and partnering where available.",
    answerAr: "\u062A\u0642\u062F\u0645 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0645\u0627 \u0642\u0628\u0644 \u0627\u0644\u0628\u0627\u0644\u064A\u0647 \u0644\u0644\u0623\u0639\u0645\u0627\u0631 \u0645\u0646 3 \u0625\u0644\u0649 6 \u0633\u0646\u0648\u0627\u062A\u060C \u0648\u0645\u062F\u0631\u0633\u0629 \u0627\u0644\u0628\u0627\u0644\u064A\u0647 \u0627\u0644\u0645\u0646\u0638\u0645\u0629 \u0644\u0644\u0623\u0639\u0645\u0627\u0631 \u0645\u0646 7 \u0633\u0646\u0648\u0627\u062A \u0641\u0623\u0643\u062B\u0631\u060C \u0648\u062D\u0635\u0635 \u0628\u0627\u0644\u064A\u0647 \u0644\u0644\u0643\u0628\u0627\u0631 \u0644\u0644\u0645\u0628\u062A\u062F\u0626\u064A\u0646 \u0648\u0627\u0644\u0639\u0627\u0626\u062F\u064A\u0646 \u0644\u0644\u062A\u062F\u0631\u064A\u0628. \u0643\u0645\u0627 \u062A\u062A\u0648\u0641\u0631 \u0645\u0648\u0627\u062F \u0625\u0636\u0627\u0641\u064A\u0629 \u0645\u062B\u0644 \u0627\u0644\u0631\u064A\u0628\u0631\u062A\u0648\u0627\u0631 \u0648\u0631\u0642\u0635 \u0627\u0644\u0643\u0627\u0631\u0627\u0643\u062A\u0631 \u0648\u0627\u0644\u0631\u0642\u0635 \u0627\u0644\u0645\u0639\u0627\u0635\u0631 \u0648\u062A\u0645\u0627\u0631\u064A\u0646 PBT \u0648\u0627\u0644\u0628\u0627\u0633 \u062F\u064A \u062F\u0648 \u062D\u0633\u0628 \u0627\u0644\u062A\u0648\u0641\u0631.",
    keywordsEn: ["programmes", "programs", "classes", "adult ballet", "pre ballet", "ballet school", "courses", "what do you offer"],
    keywordsAr: ["\u0627\u0644\u0628\u0631\u0627\u0645\u062C", "\u0627\u0644\u062D\u0635\u0635", "\u062F\u0631\u0648\u0633 \u0627\u0644\u0628\u0627\u0644\u064A\u0647", "\u0628\u0627\u0644\u064A\u0647 \u0644\u0644\u0643\u0628\u0627\u0631", "\u0645\u062F\u0631\u0633\u0629 \u0627\u0644\u0628\u0627\u0644\u064A\u0647", "\u0643\u0648\u0631\u0633\u0627\u062A", "\u0627\u0644\u0643\u0644\u0627\u0633\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629", "\u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u062D\u0635\u0635"],
    intentAliases: ["programme overview", "class types"]
  },
  {
    slug: "admission-assessment",
    source: "website",
    sortOrder: 30,
    questionEn: "How do I enroll or book an assessment?",
    questionAr: "\u0643\u064A\u0641 \u0623\u0633\u062C\u0644 \u0623\u0648 \u0623\u062D\u062C\u0632 \u062D\u0635\u0629 \u062A\u0642\u064A\u064A\u0645\u061F",
    answerEn: "Every new student begins with a placement assessment so instructors can recommend the right level. You can request an assessment through the admission form or contact the nearest branch. The team will confirm the assessment class within 24 hours.",
    answerAr: "\u064A\u0628\u062F\u0623 \u0643\u0644 \u0637\u0627\u0644\u0628 \u062C\u062F\u064A\u062F \u0628\u062D\u0635\u0629 \u062A\u0642\u064A\u064A\u0645 \u0644\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0645\u0646\u0627\u0633\u0628. \u064A\u0645\u0643\u0646\u0643 \u0637\u0644\u0628 \u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0645\u0646 \u062E\u0644\u0627\u0644 \u0646\u0645\u0648\u0630\u062C \u0627\u0644\u0642\u0628\u0648\u0644 \u0623\u0648 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0623\u0642\u0631\u0628 \u0641\u0631\u0639. \u0633\u064A\u0624\u0643\u062F \u0627\u0644\u0641\u0631\u064A\u0642 \u0645\u0648\u0639\u062F \u062D\u0635\u0629 \u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629.",
    keywordsEn: ["enroll", "enrol", "register", "assessment", "trial class", "audition", "join", "book a class", "sign up"],
    keywordsAr: ["\u0627\u0644\u062A\u0633\u062C\u064A\u0644", "\u0623\u0633\u062C\u0644", "\u062A\u0642\u064A\u064A\u0645", "\u062D\u0635\u0629 \u062A\u062C\u0631\u064A\u0628\u064A\u0629", "\u0627\u062E\u062A\u0628\u0627\u0631", "\u0627\u0646\u0636\u0645\u0627\u0645", "\u0627\u062D\u062C\u0632", "\u062D\u062C\u0632 \u062D\u0635\u0629", "\u0643\u064A\u0641 \u0627\u0634\u062A\u0631\u0643"],
    intentAliases: ["admission", "placement"]
  },
  {
    slug: "dress-code",
    source: "website",
    sortOrder: 40,
    questionEn: "What should my child wear to ballet class?",
    questionAr: "\u0645\u0627\u0630\u0627 \u064A\u0631\u062A\u062F\u064A \u0637\u0641\u0644\u064A \u0641\u064A \u062D\u0635\u0629 \u0627\u0644\u0628\u0627\u0644\u064A\u0647\u061F",
    answerEn: "Girls wear a pink leotard, pink tights, and pink ballet slippers, with hair in a neat classical bun. Boys wear a fitted white T-shirt, black shorts or leggings, and ballet slippers. A full dress-code guide is provided on enrollment.",
    answerAr: "\u062A\u0631\u062A\u062F\u064A \u0627\u0644\u0628\u0646\u0627\u062A \u0644\u064A\u0648\u062A\u0627\u0631\u062F \u0648\u0631\u062F\u064A \u0648\u062C\u0648\u0627\u0631\u0628 \u0648\u0631\u062F\u064A\u0629 \u0648\u062D\u0630\u0627\u0621 \u0628\u0627\u0644\u064A\u0647 \u0648\u0631\u062F\u064A\u060C \u0645\u0639 \u0634\u0639\u0631 \u0645\u0631\u0628\u0648\u0637 \u0641\u064A \u0643\u0639\u0643\u0629 \u0628\u0627\u0644\u064A\u0647 \u0645\u0631\u062A\u0628\u0629. \u064A\u0631\u062A\u062F\u064A \u0627\u0644\u0623\u0648\u0644\u0627\u062F \u062A\u064A \u0634\u064A\u0631\u062A \u0623\u0628\u064A\u0636 \u0645\u0646\u0627\u0633\u0628\u0627\u064B \u0648\u0634\u0648\u0631\u062A\u0627\u064B \u0623\u0648 \u0644\u064A\u062C\u0646\u0632 \u0623\u0633\u0648\u062F \u0648\u062D\u0630\u0627\u0621 \u0628\u0627\u0644\u064A\u0647. \u064A\u062A\u0645 \u062A\u0632\u0648\u064A\u062F\u0643\u0645 \u0628\u062F\u0644\u064A\u0644 \u0627\u0644\u0632\u064A \u0627\u0644\u0643\u0627\u0645\u0644 \u0639\u0646\u062F \u0627\u0644\u062A\u0633\u062C\u064A\u0644.",
    keywordsEn: ["wear", "uniform", "dress code", "leotard", "ballet shoes", "hair", "what to wear", "tights"],
    keywordsAr: ["\u0627\u0644\u0632\u064A", "\u0645\u0627\u0630\u0627 \u064A\u0631\u062A\u062F\u064A", "\u0644\u064A\u0648\u062A\u0627\u0631\u062F", "\u062D\u0630\u0627\u0621 \u0628\u0627\u0644\u064A\u0647", "\u0627\u0644\u0634\u0639\u0631", "\u064A\u0648\u0646\u064A\u0641\u0648\u0631\u0645", "\u0627\u0644\u0644\u0628\u0633", "\u0627\u0644\u0632\u064A \u0627\u0644\u0645\u0637\u0644\u0648\u0628", "\u064A\u0644\u0628\u0633"],
    intentAliases: ["class attire"]
  },
  {
    slug: "fees",
    source: "website",
    sortOrder: 50,
    questionEn: "What are the class fees?",
    questionAr: "\u0645\u0627 \u0647\u064A \u0631\u0633\u0648\u0645 \u0627\u0644\u062D\u0635\u0635\u061F",
    answerEn: "Fees vary by level, branch, and schedule. Please contact the relevant branch for the current fee structure. Every new student is entitled to one assessment class before committing to enrollment.",
    answerAr: "\u062A\u062E\u062A\u0644\u0641 \u0627\u0644\u0631\u0633\u0648\u0645 \u062D\u0633\u0628 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u0648\u0627\u0644\u0641\u0631\u0639 \u0648\u0627\u0644\u062C\u062F\u0648\u0644. \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0641\u0631\u0639 \u0627\u0644\u0645\u0639\u0646\u064A \u0644\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u062D\u0627\u0644\u064A\u0629. \u064A\u062D\u0642 \u0644\u0643\u0644 \u0637\u0627\u0644\u0628 \u062C\u062F\u064A\u062F \u062D\u0636\u0648\u0631 \u062D\u0635\u0629 \u062A\u0642\u064A\u064A\u0645 \u0642\u0628\u0644 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062A\u0633\u062C\u064A\u0644.",
    keywordsEn: ["fees", "fee", "price", "prices", "cost", "monthly fee", "payment", "how much", "tuition"],
    keywordsAr: ["\u0627\u0644\u0631\u0633\u0648\u0645", "\u0627\u0644\u0633\u0639\u0631", "\u0627\u0644\u0623\u0633\u0639\u0627\u0631", "\u0627\u0644\u062A\u0643\u0644\u0641\u0629", "\u0627\u0634\u062A\u0631\u0627\u0643", "\u062F\u0641\u0639", "\u0628\u0643\u0627\u0645", "\u0643\u0627\u0645 \u0627\u0644\u0633\u0639\u0631", "\u0627\u0644\u0645\u0635\u0627\u0631\u064A\u0641", "\u0633\u0639\u0631 \u0627\u0644\u062D\u0635\u0629"],
    intentAliases: ["tuition", "pricing"]
  },
  {
    slug: "schedule",
    source: "website",
    sortOrder: 60,
    questionEn: "Where can I find the class schedule?",
    questionAr: "\u0623\u064A\u0646 \u0623\u062C\u062F \u062C\u062F\u0648\u0644 \u0627\u0644\u062D\u0635\u0635\u061F",
    answerEn: "Current branch schedules are available on the PBA website at premierballetacademy.org/schedule. Choose Maadi, New Cairo, or Sheikh Zayed to view the applicable schedule. Please contact the branch to confirm current availability.",
    answerAr: "\u062A\u062A\u0648\u0641\u0631 \u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u0641\u0631\u0648\u0639 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0639\u0644\u0649 \u0645\u0648\u0642\u0639 PBA \u0639\u0628\u0631 premierballetacademy.org/schedule. \u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u0639\u0627\u062F\u064A \u0623\u0648 \u0627\u0644\u0642\u0627\u0647\u0631\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u0623\u0648 \u0627\u0644\u0634\u064A\u062E \u0632\u0627\u064A\u062F \u0644\u0639\u0631\u0636 \u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u0645\u0646\u0627\u0633\u0628. \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0641\u0631\u0639 \u0644\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0623\u0645\u0627\u0643\u0646 \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u0627\u064B.",
    keywordsEn: ["schedule", "timetable", "class time", "class times", "when are classes", "class days"],
    keywordsAr: ["\u0627\u0644\u062C\u062F\u0648\u0644", "\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u062D\u0635\u0635", "\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0628\u0627\u0644\u064A\u0647", "\u0645\u062A\u0649 \u0627\u0644\u062D\u0635\u0635", "\u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F", "\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0643\u0644\u0627\u0633\u0627\u062A"],
    intentAliases: ["class schedule"]
  },
  {
    slug: "branches",
    source: "website",
    sortOrder: 70,
    questionEn: "Where are your branches and how can I contact them?",
    questionAr: "\u0623\u064A\u0646 \u062A\u0648\u062C\u062F \u0627\u0644\u0641\u0631\u0648\u0639 \u0648\u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u064A \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0647\u0627\u061F",
    answerEn: "PBA has branches in Maadi, New Cairo, and Sheikh Zayed. Maadi WhatsApp: +20 10 00305053. New Cairo (Fam Bam) WhatsApp: +20 10 69935020. Sheikh Zayed: +20 10 30743488. The official contact page includes branch addresses and hours.",
    answerAr: "\u0644\u062F\u0649 PBA \u0641\u0631\u0648\u0639 \u0641\u064A \u0627\u0644\u0645\u0639\u0627\u062F\u064A \u0648\u0627\u0644\u0642\u0627\u0647\u0631\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u0648\u0627\u0644\u0634\u064A\u062E \u0632\u0627\u064A\u062F. \u0648\u0627\u062A\u0633\u0627\u0628 \u0627\u0644\u0645\u0639\u0627\u062F\u064A: +20 10 00305053. \u0648\u0627\u062A\u0633\u0627\u0628 \u0627\u0644\u0642\u0627\u0647\u0631\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 (\u0641\u0627\u0645 \u0628\u0627\u0645): +20 10 69935020. \u0627\u0644\u0634\u064A\u062E \u0632\u0627\u064A\u062F: +20 10 30743488. \u062A\u062A\u0636\u0645\u0646 \u0635\u0641\u062D\u0629 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0639\u0646\u0627\u0648\u064A\u0646 \u0627\u0644\u0641\u0631\u0648\u0639 \u0648\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0639\u0645\u0644.",
    keywordsEn: ["branches", "branch", "location", "maadi", "new cairo", "fam bam", "sheikh zayed", "address", "contact", "phone number", "whatsapp"],
    keywordsAr: ["\u0627\u0644\u0641\u0631\u0648\u0639", "\u0627\u0644\u0641\u0631\u0639", "\u0627\u0644\u0645\u0648\u0642\u0639", "\u0627\u0644\u0645\u0639\u0627\u062F\u064A", "\u0627\u0644\u0642\u0627\u0647\u0631\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629", "\u0641\u0627\u0645 \u0628\u0627\u0645", "\u0627\u0644\u0634\u064A\u062E \u0632\u0627\u064A\u062F", "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", "\u062A\u0648\u0627\u0635\u0644", "\u0641\u064A\u0646 \u0627\u0644\u0641\u0631\u0639", "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0641\u0631\u0639", "\u0631\u0642\u0645 \u0627\u0644\u0641\u0631\u0639", "\u0644\u0648\u0643\u064A\u0634\u0646", "\u0631\u0642\u0645 \u0648\u0627\u062A\u0633\u0627\u0628"],
    intentAliases: ["locations", "phone numbers"]
  },
  {
    slug: "pointe-work",
    source: "website",
    sortOrder: 80,
    questionEn: "When can my child start pointe work?",
    questionAr: "\u0645\u062A\u0649 \u064A\u0645\u0643\u0646 \u0644\u0637\u0641\u0644\u064A \u0627\u0644\u0628\u062F\u0621 \u0641\u064A \u0627\u0644\u0628\u0648\u064A\u0646\u062A\u061F",
    answerEn: "Pointe training requires significant technical development and typically starts around age 11\u201312. Instructors assess each student\u2019s readiness individually.",
    answerAr: "\u064A\u062A\u0637\u0644\u0628 \u062A\u062F\u0631\u064A\u0628 \u0627\u0644\u0628\u0648\u064A\u0646\u062A \u062A\u0637\u0648\u0631\u0627\u064B \u062A\u0642\u0646\u064A\u0627\u064B \u0643\u0628\u064A\u0631\u0627\u064B \u0648\u064A\u0628\u062F\u0623 \u0639\u0627\u062F\u0629\u064B \u0641\u064A \u0639\u0645\u0631 11 \u0625\u0644\u0649 12 \u0639\u0627\u0645\u0627\u064B. \u064A\u0642\u064A\u0651\u0645 \u0627\u0644\u0645\u062F\u0631\u0633\u0648\u0646 \u062C\u0627\u0647\u0632\u064A\u0629 \u0643\u0644 \u0637\u0627\u0644\u0628 \u0628\u0634\u0643\u0644 \u0641\u0631\u062F\u064A.",
    keywordsEn: ["pointe", "point shoes", "toe shoes", "pointe work", "pointe shoes", "en pointe"],
    keywordsAr: ["\u0628\u0648\u064A\u0646\u062A", "\u062D\u0630\u0627\u0621 \u0627\u0644\u0628\u0648\u064A\u0646\u062A", "\u0627\u0644\u0648\u0642\u0648\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0635\u0627\u0628\u0639", "\u0628\u0648\u0627\u0646\u062A"],
    intentAliases: ["pointe readiness"]
  },
  {
    slug: "psi-2026-overview",
    source: "psi",
    sortOrder: 90,
    status: "archived",
    questionEn: "What is the Premier Summer Intensive 2026?",
    questionAr: "\u0645\u0627 \u0647\u0648 Premier Summer Intensive 2026\u061F",
    answerEn: "Premier Summer Intensive 2026 is an 8-day / 7-night ballet residency in El Alamein from 15\u201322 August 2026. It includes 5 workshop days, 4 international teachers, accommodation, transportation, supervision, and beach and pool access. It is open to students from any academy aged 6 and above, subject to age-group requirements.",
    answerAr: "Premier Summer Intensive 2026 \u0647\u0648 \u0625\u0642\u0627\u0645\u0629 \u0628\u0627\u0644\u064A\u0647 \u0644\u0645\u062F\u0629 8 \u0623\u064A\u0627\u0645 \u06487 \u0644\u064A\u0627\u0644\u064D \u0641\u064A \u0627\u0644\u0639\u0644\u0645\u064A\u0646 \u0645\u0646 15 \u0625\u0644\u0649 22 \u0623\u063A\u0633\u0637\u0633 2026. \u064A\u062A\u0636\u0645\u0646 5 \u0623\u064A\u0627\u0645 \u0648\u0631\u0634 \u0639\u0645\u0644 \u06484 \u0645\u062F\u0631\u0633\u064A\u0646 \u062F\u0648\u0644\u064A\u064A\u0646 \u0648\u0625\u0642\u0627\u0645\u0629 \u0648\u0645\u0648\u0627\u0635\u0644\u0627\u062A \u0648\u0625\u0634\u0631\u0627\u0641\u0627\u064B \u0648\u062F\u062E\u0648\u0644 \u0627\u0644\u0634\u0627\u0637\u0626 \u0648\u0627\u0644\u0645\u0633\u0628\u062D. \u0648\u0647\u0648 \u0645\u0641\u062A\u0648\u062D \u0644\u0644\u0637\u0644\u0627\u0628 \u0645\u0646 \u0623\u064A \u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0645\u0646 \u0633\u0646 6 \u0633\u0646\u0648\u0627\u062A \u0641\u0623\u0643\u062B\u0631 \u0648\u0641\u0642\u0627\u064B \u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0641\u0626\u0627\u062A \u0627\u0644\u0639\u0645\u0631\u064A\u0629.",
    keywordsEn: ["summer intensive", "psi", "el alamein", "august 2026", "summer camp"],
    keywordsAr: ["\u0627\u0644\u0635\u064A\u0641\u064A", "\u0627\u0644\u0645\u0643\u062B\u0641 \u0627\u0644\u0635\u064A\u0641\u064A", "\u0627\u0644\u0639\u0644\u0645\u064A\u0646", "PSI", "\u0623\u063A\u0633\u0637\u0633 2026"],
    intentAliases: ["psi overview", "summer residency"]
  },
  {
    slug: "psi-2026-fees-groups",
    source: "psi",
    sortOrder: 100,
    status: "archived",
    questionEn: "What are the Premier Summer Intensive 2026 groups and fees?",
    questionAr: "\u0645\u0627 \u0647\u064A \u0627\u0644\u0641\u0626\u0627\u062A \u0648\u0631\u0633\u0648\u0645 Premier Summer Intensive 2026\u061F",
    answerEn: "Group 1 (ages 6\u20138): 35,000 EGP, 2 hours daily, including one required family companion. Group 2 (ages 9\u201311): 45,000 EGP, 3.5 hours daily. Group 3 (ages 12\u201314): 50,000 EGP, 4.5 hours daily. Group 4 (ages 15+): 50,000 EGP, 4.5 hours daily.",
    answerAr: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 1 (6\u20138 \u0633\u0646\u0648\u0627\u062A): 35,000 \u062C\u0646\u064A\u0647\u060C \u0633\u0627\u0639\u062A\u0627\u0646 \u064A\u0648\u0645\u064A\u0627\u064B\u060C \u0648\u062A\u0634\u0645\u0644 \u0645\u0631\u0627\u0641\u0642\u0627\u064B \u0648\u0627\u062D\u062F\u0627\u064B \u0645\u0646 \u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u0625\u0644\u0632\u0627\u0645\u064A\u0627\u064B. \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 2 (9\u201311): 45,000 \u062C\u0646\u064A\u0647\u060C 3.5 \u0633\u0627\u0639\u0627\u062A \u064A\u0648\u0645\u064A\u0627\u064B. \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 3 (12\u201314): 50,000 \u062C\u0646\u064A\u0647\u060C 4.5 \u0633\u0627\u0639\u0627\u062A \u064A\u0648\u0645\u064A\u0627\u064B. \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 4 (15+): 50,000 \u062C\u0646\u064A\u0647\u060C 4.5 \u0633\u0627\u0639\u0627\u062A \u064A\u0648\u0645\u064A\u0627\u064B.",
    keywordsEn: ["psi fees", "summer intensive fees", "psi group", "intensive price", "35,000", "50,000"],
    keywordsAr: ["\u0631\u0633\u0648\u0645 PSI", "\u0631\u0633\u0648\u0645 \u0627\u0644\u0645\u0643\u062B\u0641", "\u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0627\u0644\u0645\u0643\u062B\u0641", "35000", "50000"],
    intentAliases: ["psi pricing", "psi age groups"]
  }
];

// server/social/seed.ts
async function syncOfficialFaqs() {
  return syncOfficialFaqEntries(INITIAL_FAQ_SEEDS);
}

// server/social/schedule.ts
init_db();
var SOCIAL_METRICS_CRON = "0 7 * * *";
var SOCIAL_METRICS_EXTRA_CRON = "0 13,19 * * *";
var SOCIAL_METRICS_PATH = "/api/scheduled/refresh-social-metrics";
async function getMetricsScheduleStatus() {
  const latest = await getLatestMetricCollectedAt();
  return {
    cron: SOCIAL_METRICS_CRON,
    extraCron: SOCIAL_METRICS_EXTRA_CRON,
    path: SOCIAL_METRICS_PATH,
    cronSecretConfigured: Boolean(process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 16),
    lastCollectedAt: latest,
    utcSchedule: "07:00 UTC (Vercel Cron), 13:00 and 19:00 UTC (GitHub Actions)"
  };
}

// server/browserUse.ts
var BROWSER_USE_API_BASE = "https://api.browser-use.com/api/v4";
function getApiKey() {
  const apiKey = process.env.BROWSER_USE_API_KEY?.trim();
  if (!apiKey)
    throw new Error(
      "Browser Use is not configured. Add the BROWSER_USE_API_KEY project secret before running an automation task."
    );
  return apiKey;
}
async function requestAt(baseUrl, path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "X-Browser-Use-API-Key": getApiKey(),
      "Content-Type": "application/json",
      ...init.headers ?? {}
    }
  });
  const raw = await response.text();
  let payload = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = raw;
  }
  if (!response.ok) {
    const error = payload;
    const detail = typeof error?.detail === "string" ? error.detail : typeof error?.message === "string" ? error.message : typeof error?.error === "string" ? error.error : raw || response.statusText;
    throw new Error(
      `Browser Use request failed (${response.status}): ${detail}`
    );
  }
  return payload;
}
async function request(path, init = {}) {
  return requestAt(BROWSER_USE_API_BASE, path, init);
}
function browserUseReadiness() {
  return {
    configured: Boolean(process.env.BROWSER_USE_API_KEY?.trim()),
    apiBase: BROWSER_USE_API_BASE,
    provider: "Browser Use Cloud V4"
  };
}
async function createBrowserUseRun(input) {
  return request("/runs", {
    method: "POST",
    body: JSON.stringify({
      task: input.task,
      ...input.model ? { model: input.model } : {}
    })
  });
}
async function getBrowserUseRunStatus(runId) {
  return request(
    `/runs/${encodeURIComponent(runId)}/status`
  );
}
async function getBrowserUseRun(runId) {
  return request(`/runs/${encodeURIComponent(runId)}`);
}
async function cancelBrowserUseRun(runId) {
  return request(
    `/runs/${encodeURIComponent(runId)}/cancel`,
    { method: "POST" }
  );
}
function isBrowserUseTerminalStatus(status) {
  return status === "completed" || status === "failed" || status === "cancelled";
}

// server/routers.ts
import { z as z2 } from "zod";
var faqInput = z2.object({
  slug: z2.string().trim().min(3).max(160),
  status: z2.enum(["draft", "approved", "archived"]),
  source: z2.enum(["website", "psi", "inbox", "staff"]),
  questionEn: z2.string().trim(),
  questionAr: z2.string().trim(),
  answerEn: z2.string().trim(),
  answerAr: z2.string().trim(),
  keywordsEn: z2.array(z2.string().trim()).max(40),
  keywordsAr: z2.array(z2.string().trim()).max(40),
  intentAliases: z2.array(z2.string().trim()).max(40),
  sortOrder: z2.number().int().min(0).max(9999)
});
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  dashboard: router({
    summary: adminProcedure.query(() => getDashboardStats()),
    conversations: adminProcedure.query(() => listConversations()),
    messages: adminProcedure.query(() => getRecentMessageEvents()),
    integrationReadiness: adminProcedure.query(
      () => metaReadinessWithStoredAccounts()
    ),
    refreshMetrics: adminProcedure.mutation(() => refreshSocialMetrics()),
    markConversationResolved: adminProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(({ input }) => markConversationResolved(input.id))
  }),
  faqs: router({
    list: adminProcedure.query(() => listFaqEntries()),
    create: adminProcedure.input(faqInput).mutation(({ input }) => createFaqEntry(input)),
    update: adminProcedure.input(
      z2.object({ id: z2.number().int().positive(), data: faqInput.partial() })
    ).mutation(({ input }) => updateFaqEntry(input.id, input.data)),
    syncOfficial: adminProcedure.mutation(() => syncOfficialFaqs())
  }),
  imports: router({
    list: adminProcedure.query(() => listInboxImports()),
    candidates: adminProcedure.query(() => listFaqCandidates()),
    uploadFacebookInbox: adminProcedure.input(
      z2.object({
        fileName: z2.string().max(255),
        base64: z2.string().min(20).max(35e6)
      })
    ).mutation(async ({ input }) => {
      const analysis = parseFacebookInboxZip(
        Buffer.from(input.base64, "base64")
      );
      const importId = await createInboxImport({
        fileName: input.fileName,
        fileCount: analysis.fileCount,
        totalCustomerMessages: analysis.totalCustomerMessages,
        uniqueQuestionCount: analysis.uniqueQuestionCount,
        repeatedQuestionMessages: analysis.repeatedQuestionMessages,
        repeatedQuestionRate: analysis.repeatedQuestionRate
      });
      await insertFaqCandidates(importId, analysis.candidates);
      return {
        importId,
        ...analysis,
        candidates: analysis.candidates.slice(0, 20)
      };
    }),
    promoteCandidate: adminProcedure.input(z2.object({ candidateId: z2.number().int().positive() })).mutation(({ input }) => promoteCandidateToDraft(input.candidateId))
  }),
  schedules: router({
    metricsStatus: adminProcedure.query(() => getMetricsScheduleStatus())
  }),
  notifications: router({
    list: adminProcedure.query(() => listStaffNotifications()),
    markRead: adminProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(({ input }) => markStaffNotificationRead(input.id)),
    markAllRead: adminProcedure.mutation(
      () => markAllStaffNotificationsRead()
    )
  }),
  browserAutomation: router({
    readiness: adminProcedure.query(() => browserUseReadiness()),
    list: adminProcedure.query(() => listBrowserAutomationRuns()),
    create: adminProcedure.input(
      z2.object({
        task: z2.string().trim().min(5).max(4e3),
        model: z2.enum([
          "gpt-6-luna",
          "gpt-6-astra",
          "gpt-5.6",
          "claude-sonnet-5",
          "gemini-3.6-flash"
        ]).optional()
      })
    ).mutation(async ({ input }) => {
      const created = await createBrowserUseRun(input);
      const id = await createBrowserAutomationRun({
        externalRunId: created.id,
        task: input.task,
        status: created.status,
        model: created.model ?? input.model ?? null
      });
      return getBrowserAutomationRun(id);
    }),
    refresh: adminProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input }) => {
      const run = await getBrowserAutomationRun(input.id);
      if (!run) throw new Error("Browser Use run not found.");
      const status = await getBrowserUseRunStatus(run.externalRunId);
      if (!isBrowserUseTerminalStatus(status.status))
        return updateBrowserAutomationRun(run.id, {
          status: status.status
        });
      const summary = await getBrowserUseRun(run.externalRunId);
      const result = summary.result ?? (summary.output === void 0 || summary.output === null ? null : JSON.stringify(summary.output));
      return updateBrowserAutomationRun(run.id, {
        status: summary.status,
        result,
        error: summary.error ?? null,
        model: summary.model ?? run.model,
        totalCostUsd: summary.totalCostUsd ?? null
      });
    }),
    cancel: adminProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input }) => {
      const run = await getBrowserAutomationRun(input.id);
      if (!run) throw new Error("Browser Use run not found.");
      if (isBrowserUseTerminalStatus(run.status)) return run;
      const cancelled = await cancelBrowserUseRun(run.externalRunId);
      return updateBrowserAutomationRun(run.id, {
        status: cancelled.status,
        result: cancelled.result ?? null,
        error: cancelled.error ?? null,
        model: cancelled.model ?? run.model,
        totalCostUsd: cancelled.totalCostUsd ?? null
      });
    })
  }),
  integrations: router({
    metadata: adminProcedure.query(() => getIntegrationMetadata()),
    saveMetadata: adminProcedure.input(
      z2.object({
        facebookPageUrl: z2.string().url().optional(),
        instagramHandle: z2.string().trim().max(100).optional(),
        verificationNote: z2.string().trim().max(500).optional()
      })
    ).mutation(({ input }) => upsertIntegrationMetadata(input)),
    discoverAccounts: adminProcedure.mutation(() => discoverMetaAccounts()),
    activateFacebookWebhook: adminProcedure.mutation(
      () => activateFacebookPageWebhook()
    )
  }),
  publisher: router({
    list: adminProcedure.query(() => listSocialPosts()),
    createDraft: adminProcedure.input(
      z2.object({
        platform: z2.enum(["facebook", "instagram"]),
        caption: z2.string().trim().min(1).max(2200),
        mediaUrl: z2.string().url().optional()
      })
    ).mutation(
      ({ input }) => createSocialPost({
        platform: input.platform,
        caption: input.caption,
        mediaUrl: input.mediaUrl ?? null
      })
    ),
    approve: adminProcedure.input(z2.object({ postId: z2.number().int().positive() })).mutation(({ input }) => approveSocialPost(input.postId)),
    publish: adminProcedure.input(z2.object({ postId: z2.number().int().positive() })).mutation(async ({ input }) => {
      const { publishSocialPost: publishSocialPost2 } = await Promise.resolve().then(() => (init_publisher(), publisher_exports));
      return publishSocialPost2(input);
    })
  })
});

// server/social/engine.ts
init_db();

// server/social/faq.ts
function normalizeText(value) {
  return value.toLocaleLowerCase().replace(/[\u064B-\u065F\u0670]/g, "").replace(/[^A-Za-z0-9\u0600-\u06FF\s+]/g, " ").replace(/\s+/g, " ").trim();
}
function detectLanguageChoice(value) {
  const normalized = normalizeText(value);
  if (["1", "english", "en", "\u0627\u0646\u062C\u0644\u064A\u0632\u064A", "\u0627\u0644\u0627\u0646\u062C\u0644\u064A\u0632\u064A\u0629", "\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629"].includes(normalized)) return "en";
  if (["2", "arabic", "ar", "\u0639\u0631\u0628\u064A", "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"].includes(normalized)) return "ar";
  return null;
}
function keywords(entry) {
  return [...Array.isArray(entry.keywordsEn) ? entry.keywordsEn : [], ...Array.isArray(entry.keywordsAr) ? entry.keywordsAr : [], ...Array.isArray(entry.intentAliases) ? entry.intentAliases : []].map(normalizeText);
}
var LATIN_ONLY = /^[a-z0-9+\s]+$/;
function containsKeyword(text2, keyword) {
  if (LATIN_ONLY.test(keyword)) return ` ${text2} `.includes(` ${keyword} `);
  return text2.includes(keyword);
}
function matchApprovedFaq(input, entries) {
  const text2 = normalizeText(input);
  if (text2.length < 2) return null;
  let best = null;
  for (const entry of entries) {
    let score = [normalizeText(entry.questionEn), normalizeText(entry.questionAr)].includes(text2) ? 12 : 0;
    for (const keyword of keywords(entry)) {
      if (keyword && keyword.length >= 2 && containsKeyword(text2, keyword)) score += keyword.includes(" ") ? 5 : 3;
    }
    if (score > (best?.score ?? 0)) best = { entry, score };
  }
  return best && best.score >= 3 ? best : null;
}

// server/social/engine.ts
init_meta();
async function emit(event, conversationId, text2, language, matchedFaqId, escalated) {
  const result = await sendMetaReply(event, text2);
  if (conversationId)
    await appendMessageEvent({
      conversationId,
      externalMessageId: `${event.externalEventId}:reply:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      externalTargetId: event.targetId ?? null,
      channel: event.channel,
      direction: "outbound",
      body: text2,
      language,
      matchedFaqId,
      escalated
    });
  if (!result.sent && result.mode !== "dry-run") {
    const detail = result.detail?.trim() || "Meta did not return an error detail.";
    await createStaffNotification({
      type: "reply_failure",
      severity: "critical",
      title: "Automated reply needs attention",
      detail: `A ${event.channel.replaceAll("_", " ")} reply could not be sent. Meta detail: ${detail.slice(0, 500)}`,
      href: "/conversations"
    });
  }
  return result;
}
async function handleInboundEvent(event) {
  const accepted = await recordWebhookDelivery({
    externalEventId: event.externalEventId,
    platform: event.platform,
    eventType: event.rawType
  });
  if (!accepted) return { skipped: "duplicate" };
  if (event.channel === "instagram_comment" || event.channel === "facebook_comment") {
    await emit(event, null, BOT_COPY.commentReply, "unselected", null, false);
    return { handled: "comment" };
  }
  const conversation = await upsertConversation({
    conversationKey: `${event.platform}:${event.channel}:${event.senderId}`,
    senderId: event.senderId,
    channel: event.channel
  });
  await appendMessageEvent({
    conversationId: conversation.id,
    externalMessageId: event.externalEventId,
    externalTargetId: event.targetId ?? null,
    channel: event.channel,
    direction: "inbound",
    body: event.body,
    language: conversation.language,
    matchedFaqId: null,
    escalated: false
  });
  if (conversation.language === "unselected") {
    const choice = detectLanguageChoice(event.body);
    if (!choice) {
      await emit(
        event,
        conversation.id,
        BOT_COPY.opening.en,
        "unselected",
        null,
        false
      );
      return { handled: "language-prompt" };
    }
    await setConversationLanguage(conversation.id, choice);
    await emit(
      event,
      conversation.id,
      BOT_COPY.languageSelected[choice],
      choice,
      null,
      false
    );
    const earlier = await getRecentUnselectedInbound?.(conversation.id);
    const pending = earlier?.find(
      (message) => message.externalMessageId !== event.externalEventId && !detectLanguageChoice(message.body)
    );
    if (pending) {
      const pendingMatch = matchApprovedFaq(
        pending.body,
        await getApprovedFaqEntries()
      );
      if (pendingMatch) {
        await emit(
          event,
          conversation.id,
          choice === "ar" ? pendingMatch.entry.answerAr : pendingMatch.entry.answerEn,
          choice,
          pendingMatch.entry.id,
          false
        );
        return {
          handled: "language-selected",
          language: choice,
          answeredPending: pendingMatch.entry.id
        };
      }
    }
    return { handled: "language-selected", language: choice };
  }
  const match = matchApprovedFaq(event.body, await getApprovedFaqEntries());
  if (match) {
    await emit(
      event,
      conversation.id,
      conversation.language === "ar" ? match.entry.answerAr : match.entry.answerEn,
      conversation.language,
      match.entry.id,
      false
    );
    return { handled: "faq", faqId: match.entry.id };
  }
  await markConversationEscalated(conversation.id);
  await createStaffNotification({
    type: "escalation",
    severity: "warning",
    title: "New WhatsApp escalation",
    detail: `An unanswered ${event.channel.replaceAll("_", " ")} question was handed off to the branch team.`,
    href: "/conversations"
  });
  await emit(
    event,
    conversation.id,
    escalationMessage(conversation.language, event.body),
    conversation.language,
    null,
    true
  );
  return { handled: "escalation" };
}

// server/social/routes.ts
init_meta();

// server/_core/auth.ts
import { parse as parseCookieHeader } from "cookie";
import { jwtVerify, SignJWT } from "jose";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual as timingSafeEqual2 } from "node:crypto";
import { promisify } from "node:util";
init_db();

// server/_core/env.ts
var ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production"
};

// server/_core/auth.ts
var scrypt = promisify(scryptCallback);
async function verifyPassword(password, stored) {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length === 0) return false;
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return actual.length === expected.length && timingSafeEqual2(actual, expected);
}
function loadStaffAccounts(env = process.env) {
  const accounts = [];
  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD_HASH) {
    accounts.push({ email: env.ADMIN_EMAIL.trim().toLowerCase(), hash: env.ADMIN_PASSWORD_HASH.trim() });
  }
  if (env.STAFF_ACCOUNTS) {
    try {
      const parsed = JSON.parse(env.STAFF_ACCOUNTS);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item.email === "string" && typeof item.hash === "string") {
            accounts.push({ email: item.email.trim().toLowerCase(), hash: item.hash.trim() });
          }
        }
      }
    } catch {
      console.warn("[Auth] STAFF_ACCOUNTS is not valid JSON and was ignored");
    }
  }
  return accounts;
}
function sessionKey() {
  if (ENV.cookieSecret.length < 32) {
    throw new Error("JWT_SECRET must be set to at least 32 characters");
  }
  return new TextEncoder().encode(ENV.cookieSecret);
}
async function createSessionToken(openId, name) {
  return new SignJWT({ openId, name }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(Math.floor((Date.now() + SESSION_MAX_AGE_MS) / 1e3)).sign(sessionKey());
}
async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ["HS256"] });
    return typeof payload.openId === "string" && payload.openId ? { openId: payload.openId } : null;
  } catch {
    return null;
  }
}
async function authenticateRequest(req) {
  const token = parseCookieHeader(req.headers.cookie ?? "")[COOKIE_NAME];
  const session = await verifySessionToken(token);
  if (!session) return null;
  return await getUserByOpenId(session.openId) ?? null;
}
function isCronAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const header = req.headers.authorization ?? "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  return actual.length === expected.length && timingSafeEqual2(actual, expected);
}
var attempts = /* @__PURE__ */ new Map();
var WINDOW_MS = 15 * 60 * 1e3;
var MAX_ATTEMPTS = 10;
function tooManyAttempts(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) return false;
  return entry.count >= MAX_ATTEMPTS;
}
function recordFailure(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count += 1;
}
var DUMMY_HASH = "scrypt$00000000000000000000000000000000$" + "00".repeat(64);
function registerAuthRoutes(app) {
  app.post("/api/auth/login", async (req, res) => {
    const ip = String(req.headers["x-forwarded-for"] ?? req.socket.remoteAddress ?? "unknown").split(",")[0].trim();
    if (tooManyAttempts(ip)) {
      return res.status(429).json({ error: "Too many attempts. Please try again later." });
    }
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
    const account = loadStaffAccounts().find((item) => item.email === email);
    const valid = await verifyPassword(password, account?.hash ?? DUMMY_HASH);
    if (!account || !valid) {
      recordFailure(ip);
      return res.status(401).json({ error: "Incorrect email or password." });
    }
    try {
      const openId = `staff:${email}`;
      await upsertUser({ openId, name: email.split("@")[0], email, loginMethod: "password", role: "admin", lastSignedIn: /* @__PURE__ */ new Date() });
      const token = await createSessionToken(openId, email.split("@")[0]);
      res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: SESSION_MAX_AGE_MS });
      return res.json({ ok: true });
    } catch (error) {
      console.error("[Auth] Login failed", error instanceof Error ? error.message : error);
      return res.status(500).json({ error: "Sign-in is temporarily unavailable." });
    }
  });
}

// server/social/routes.ts
init_db();
function registerSocialRoutes(app) {
  app.get("/api/meta/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN && typeof challenge === "string") return res.status(200).send(challenge);
    return res.status(403).json({ error: "Webhook verification failed" });
  });
  app.post("/api/meta/webhook", async (req, res) => {
    const readiness = metaReadiness();
    if (!readiness.hasAppSecret && !readiness.hasInstagramAppSecret) return res.status(503).json({ error: "Webhook signature secret is not configured" });
    if (!verifyMetaSignature(req.rawBody, req.header("x-hub-signature-256") ?? void 0)) return res.status(403).json({ error: "Invalid webhook signature" });
    try {
      for (const event of normalizeMetaPayload(req.body)) await handleInboundEvent(event);
      return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      console.error("[Meta webhook] event processing failed", error);
      await createStaffNotification({ type: "integration_failure", severity: "critical", title: "Meta webhook processing failed", detail: "An incoming social event could not be processed. Review the integration and conversation log.", href: "/integrations" });
      return res.status(500).json({ error: "Webhook processing failed" });
    }
  });
  const refreshHandler = async (req, res) => {
    if (!isCronAuthorized(req)) return res.status(401).json({ error: "unauthorized" });
    try {
      return res.json({ ok: true, result: await refreshSocialMetrics() });
    } catch (error) {
      await createStaffNotification({ type: "integration_failure", severity: "critical", title: "Scheduled metrics refresh failed", detail: "The scheduled social metrics refresh needs staff attention.", href: "/integrations" });
      return res.status(500).json({ error: error instanceof Error ? error.message : "Scheduled refresh failed", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    }
  };
  app.get("/api/scheduled/refresh-social-metrics", refreshHandler);
  app.post("/api/scheduled/refresh-social-metrics", refreshHandler);
}

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await authenticateRequest(opts.req);
  } catch {
    user = null;
  }
  return { req: opts.req, res: opts.res, user };
}

// server/_core/app.ts
function createApp() {
  const app = express();
  app.use(express.json({ limit: "50mb", verify: (req, _res, buffer) => {
    req.rawBody = Buffer.from(buffer);
  } }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerAuthRoutes(app);
  registerSocialRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  return app;
}

// server/vercel.ts
var vercel_default = createApp();
export {
  vercel_default as default
};
