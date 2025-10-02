import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

import { COLORS } from "./colors.js";
import { CITIES } from "./cities.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

/* =========================
   Mail (opsiyonel) yardımcıları
   ========================= */
const mailCfg = {
  host: process.env.SMTP_HOST || "",
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || Number(process.env.SMTP_PORT) === 465,
  user: process.env.SMTP_USER || "",
  pass: process.env.SMTP_PASS || "",
  from: process.env.MAIL_FROM || "Form Builder <no-reply@example.com>",
  prefix: process.env.MAIL_SUBJECT_PREFIX || "[Form]",
};

let transporter = null;
function getTransporter() {
  if (transporter !== null) return transporter;
  if (!mailCfg.host) {
    transporter = null; // mail kapalı
    return transporter;
  }
  transporter = nodemailer.createTransport({
    host: mailCfg.host,
    port: mailCfg.port,
    secure: mailCfg.secure,
    auth: mailCfg.user ? { user: mailCfg.user, pass: mailCfg.pass } : undefined,
  });
  return transporter;
}

const isEmail = (s) =>
  typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

/** payload içinden email’i akıllıca bul (RFB bazen dizi bazen obje döndürür) */
function extractEmailFromPayload(payload) {
  try {
    // Dizi formatı: [{ name, value }, ...] veya [{ field_name, value }, ...]
    if (Array.isArray(payload)) {
      for (const it of payload) {
        const k = (it?.name || it?.field_name || "").toString().toLowerCase();
        const v = it?.value;
        if ((/mail|e-?posta/.test(k) || k === "email") && isEmail(v)) return v.trim();
      }
      // Anahtar "email" olup value’da olabilir
      for (const it of payload) {
        if (isEmail(it)) return it.trim();
      }
    }

    // Obje formatı: { email: "x@y.com", ... }
    if (payload && typeof payload === "object") {
      for (const [k, v] of Object.entries(payload)) {
        if ((/mail|e-?posta/i.test(k) || k.toLowerCase() === "email") && isEmail(v)) {
          return String(v).trim();
        }
      }
    }
  } catch {
    // yut
  }
  return null;
}

async function sendSubmissionMail(to, displayName, formName) {
  const tx = getTransporter();
  if (!tx) return { sent: false, reason: "mailer_disabled" };

  const safeName = (displayName || "").trim();
  const subject = `${mailCfg.prefix} ${formName || "Bilgilendirme"}`;
  const text = [
    safeName ? `Merhaba ${safeName},` : "Merhaba,",
    "",
    `${formName || "Form"} gönderiminiz başarıyla alındı.`,
    "İlginiz için teşekkür ederiz.",
    "",
    "Saygılarımızla",
    "Form Builder",
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;font-size:14px;color:#111">
      <p>${safeName ? `Merhaba <b>${safeName}</b>,` : "Merhaba,"}</p>
      <p><b>${formName || "Form"}</b> gönderiminiz başarıyla alındı. İlginiz için teşekkür ederiz.</p>
      <p style="color:#555">Bu e-posta bilgilendirme amaçlıdır, lütfen yanıtlamayınız.</p>
      <br/>
      <p>Saygılarımızla<br/>Form Builder</p>
    </div>
  `;

  try {
    const info = await tx.sendMail({
      from: mailCfg.from,
      to,
      subject,
      text,
      html,
    });
    return { sent: true, messageId: info.messageId };
  } catch (e) {
    console.error("MAIL ERROR:", e?.message || e);
    return { sent: false, reason: e?.message || "send_failed" };
  }
}

/* ============ Basit sağlık ============ */
app.get("/api/health", (_req, res) => res.json({ ok: true }));

/* ============ Colors & Cities ============ */
app.get("/api/colors", (_req, res) => {
  try {
    res.json(COLORS.map((c) => ({ text: c.name, value: c.value })));
  } catch (err) {
    console.error("GET /api/colors", err);
    res.status(500).json({ error: "colors_failed" });
  }
});

app.get("/api/cities", (_req, res) => {
  try {
    res.json(CITIES.map((n) => ({ text: n, value: n })));
  } catch (err) {
    console.error("GET /api/cities", err);
    res.status(500).json({ error: "cities_failed" });
  }
});

/* ============ Forms ============ */
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

app.delete("/api/forms/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.form.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/forms/:id", e);
    res.status(404).json({ ok: false, message: "Form bulunamadı" });
  }
});

/* ============ Submissions ============ */
app.post("/api/forms/:id/submissions", async (req, res) => {
  try {
    const formId = Number(req.params.id);
    const form = await prisma.form.findUnique({ where: { id: formId } });
    if (!form) return res.status(404).json({ error: "form_not_found" });

    // Frontend’den gelebilecek olası şekiller:
    // { data: [...] } | { payload: [...] } | doğrudan dizi/obje
    const raw = req.body?.data ?? req.body?.payload ?? req.body?.answers ?? req.body;
    // MySQL JSON için undefined'ları temizle
    const payload = JSON.parse(JSON.stringify(raw ?? []));
    const displayName = (req.body?.name || "").toString();

    const created = await prisma.submission.create({
      data: { formId, payload },
    });

    // E-posta çıkar ve gönder (varsa)
    const email = extractEmailFromPayload(payload);
    let mail = { sent: false, reason: "no_email" };
    if (email) {
      mail = await sendSubmissionMail(email, displayName, form?.name);
    }

    res.status(201).json({ ok: true, id: created.id, mail });
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

/* ============ Start & Graceful Shutdown ============ */
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API ready on :${port}`));

const shutdown = async () => {
  try {
    await prisma.$disconnect();
  } finally {
    process.exit(0);
  }
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
