interface MailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendMail(opts: MailOptions): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM ?? "noreply@kondolenzbuch.ch";

  if (!apiKey) {
    // Dev-Modus: E-Mail in Console ausgeben
    console.log("─── E-MAIL (kein SendGrid-Key, nur Log) ───────────────");
    console.log("An:     ", Array.isArray(opts.to) ? opts.to.join(", ") : opts.to);
    console.log("Betreff:", opts.subject);
    console.log("Inhalt: ", opts.html.replace(/<[^>]+>/g, ""));
    console.log("───────────────────────────────────────────────────────");
    return;
  }

  const recipients = Array.isArray(opts.to) ? opts.to : [opts.to];

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: recipients.map((r) => ({ email: r })) }],
      from: { email: from },
      subject: opts.subject,
      content: [{ type: "text/html", value: opts.html }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SendGrid Fehler: ${err}`);
  }
}

// ── E-Mail-Templates ─────────────────────────────────────────────────────────

export function kondolenzBestaetigung(opts: {
  verstorbenerName: string;
  kondolenzName: string;
  editUrl: string;
  editBis: Date;
  moderationAktiv: boolean;
}): { subject: string; html: string } {
  const datumStr = opts.editBis.toLocaleString("de-CH", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  return {
    subject: `Ihre Kondolenz für ${opts.verstorbenerName} — Bestätigung`,
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0078D4;padding:24px;border-radius:8px 8px 0 0;">
          <h1 style="color:white;margin:0;font-size:20px;">Kondolenz eingegangen</h1>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #E0E0E0;border-top:none;border-radius:0 0 8px 8px;">
          <p style="color:#424242;">Liebe/r ${opts.kondolenzName},</p>
          <p style="color:#424242;margin-top:12px;">
            Ihre Kondolenz für <strong>${opts.verstorbenerName}</strong> wurde erfolgreich eingereicht.
            ${opts.moderationAktiv ? "Sie wird nach Prüfung freigeschaltet." : "Sie ist sofort sichtbar."}
          </p>
          <p style="color:#424242;margin-top:16px;">
            Sie können Ihren Eintrag noch bis <strong>${datumStr}</strong> Uhr bearbeiten oder löschen:
          </p>
          <a href="${opts.editUrl}" style="display:inline-block;background:#0078D4;color:white;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;margin-top:12px;">
            Eintrag bearbeiten oder löschen
          </a>
          <p style="color:#8A8A8A;font-size:12px;margin-top:24px;">
            Nach Ablauf der Frist ist keine Änderung mehr möglich.
          </p>
        </div>
      </div>
    `,
  };
}

export function neueKondolenzMail(opts: {
  verstorbenerName: string;
  kondolenzName: string;
  kondolenzText: string;
  adminUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Neue Kondolenz für ${opts.verstorbenerName}`,
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0078D4;padding:24px;border-radius:8px 8px 0 0;">
          <h1 style="color:white;margin:0;font-size:20px;">Neue Kondolenz eingegangen</h1>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #E0E0E0;border-top:none;border-radius:0 0 8px 8px;">
          <p style="color:#424242;">Es ist eine neue Kondolenz für <strong>${opts.verstorbenerName}</strong> eingegangen:</p>
          <div style="background:#FAFAFA;border-left:4px solid #0078D4;padding:16px;margin:16px 0;border-radius:0 4px 4px 0;">
            <p style="margin:0 0 8px;font-weight:600;color:#242424;">${opts.kondolenzName}</p>
            <p style="margin:0;color:#424242;">${opts.kondolenzText}</p>
          </div>
          <a href="${opts.adminUrl}" style="display:inline-block;background:#0078D4;color:white;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;">
            Kondolenz freigeben / ablehnen
          </a>
        </div>
      </div>
    `,
  };
}

export function jahresgedenkMail(opts: {
  verstorbenerName: string;
  sterbejahr: number;
  anzeigenUrl: string;
  kondolenzAuszug: { name: string; text: string }[];
}): { subject: string; html: string } {
  const jahr = new Date().getFullYear();
  const jahre = jahr - opts.sterbejahr;
  const eintraege = opts.kondolenzAuszug
    .map(e => `<div style="border-left:3px solid #6366f1;padding:8px 12px;margin:8px 0;background:#f5f3ff;"><strong>${e.name}</strong><br/><em>${e.text}</em></div>`)
    .join("");

  return {
    subject: `Jahresgedenken — ${opts.verstorbenerName}`,
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#4F46E5;padding:24px;border-radius:8px 8px 0 0;">
          <h1 style="color:white;margin:0;font-size:20px;">Jahresgedenken</h1>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 8px 8px;">
          <p style="color:#374151;">Heute jährt sich der Todestag von <strong>${opts.verstorbenerName}</strong> zum ${jahre}. Mal.</p>
          <p style="color:#374151;margin-top:12px;">Menschen aus dem Umfeld haben damals ihre Anteilnahme ausgedrückt:</p>
          ${eintraege || '<p style="color:#9CA3AF;font-style:italic;">Keine Kondolenzeinträge vorhanden.</p>'}
          <a href="${opts.anzeigenUrl}" style="display:inline-block;background:#4F46E5;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:16px;">
            Kondolenzbuch öffnen
          </a>
        </div>
      </div>`,
  };
}
