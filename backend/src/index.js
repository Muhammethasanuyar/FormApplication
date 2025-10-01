import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { COLORS } from "./colors.js";
import { CITIES } from "./cities.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/colors", (_req, res) => {
  try {
    res.json(COLORS.map(c => ({ text: c.name, value: c.value })));
  } catch (err) {
    console.error("GET /api/colors", err);
    res.status(500).json({ error: "colors_failed" });
  }
});

app.get("/api/cities", (_req, res) => {
  try {
    res.json(CITIES.map(n => ({ text: n, value: n })));
  } catch (err) {
    console.error("GET /api/cities", err);
    res.status(500).json({ error: "cities_failed" });
  }
});

/** Forms */
app.post("/api/forms", async (req, res) => {
  try {
    const { name, schema } = req.body || {};
    if (!name || !schema) return res.status(400).json({ error: "name & schema required" });
    const form = await prisma.form.create({ data: { name, schema } });
    res.status(201).json(form);
  } catch (err) {
    console.error("POST /api/forms", err);
    res.status(500).json({ error: "create_form_failed" });
  }
});

app.get("/api/forms", async (_req, res) => {
  try {
    const forms = await prisma.form.findMany({ orderBy: { id: "desc" } });
    res.json(forms);
  } catch (err) {
    console.error("GET /api/forms", err);
    res.status(500).json({ error: "list_forms_failed" });
  }
});

app.get("/api/forms/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const form = await prisma.form.findUnique({ where: { id } });
    if (!form) return res.status(404).json({ error: "not_found" });
    res.json(form);
  } catch (err) {
    console.error("GET /api/forms/:id", err);
    res.status(500).json({ error: "get_form_failed" });
  }
});

/** Submissions */
app.post("/api/forms/:id/submissions", async (req, res) => {
  try {
    const formId = Number(req.params.id);

    const form = await prisma.form.findUnique({ where: { id: formId } });
    if (!form) return res.status(404).json({ error: "form_not_found" });

    const raw = req.body?.data ?? req.body?.payload ?? req.body?.answers ?? req.body;
    const payload = JSON.parse(JSON.stringify(raw ?? []));

    const created = await prisma.submission.create({
      data: { formId, payload },
    });

    res.status(201).json({ ok: true, id: created.id });
  } catch (err) {
    console.error("POST /api/forms/:id/submissions", err);
    res.status(500).json({ error: "create_submission_failed", message: err.message });
  }
});

app.get("/api/forms/:id/submissions", async (req, res) => {
  try {
    const formId = Number(req.params.id);
    const subs = await prisma.submission.findMany({
      where: { formId },
      orderBy: { id: "desc" },
    });
    res.json(subs);
  } catch (err) {
    console.error("GET /api/forms/:id/submissions", err);
    res.status(500).json({ error: "list_submissions_failed" });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API ready on :${port}`));

const shutdown = async () => { try { await prisma.$disconnect(); } finally { process.exit(0); } };
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
