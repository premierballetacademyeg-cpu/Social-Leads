import * as db from "../db";
import { INITIAL_FAQ_SEEDS } from "./constants";

/** Startup: add any missing official FAQs, never overwrite existing rows. */
export async function seedInitialFaqs() { return db.ensureInitialFaqs(INITIAL_FAQ_SEEDS); }

/** Staff action: make the live official FAQs match the approved set (PSI stays archived). */
export async function syncOfficialFaqs() { return db.syncOfficialFaqEntries(INITIAL_FAQ_SEEDS); }
