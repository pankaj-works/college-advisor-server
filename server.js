
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.get("/", (req, res) => {
  res.json({ "message": "Email server is running send a POST request to /send-email with name, email, subject, and message in the body." });
});

app.post("/send-email", async (req, res) => {
  const { name, email, subject, message, location } = req.body;

  const serverIp =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket.remoteAddress;

  const locationInfo = location
    ? {
        ip: location.ip,
        city: location.city,
        region: location.region,
        country: location.country,
        coords: `${location.latitude}, ${location.longitude}`
      }
    : {
        ip: serverIp,
        city: 'N/A',
        region: 'N/A',
        country: 'N/A',
        coords: 'N/A'
      };

  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>New Contact Message</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background-color: #060818; font-family: 'Inter', 'Segoe UI', sans-serif; }
      .wrapper { background-color: #060818; padding: 40px 16px; }
      .container { max-width: 580px; margin: 0 auto; }

      /* Header */
      .header {
        background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
        border-radius: 20px 20px 0 0;
        padding: 48px 40px 40px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      .header::before {
        content: '';
        position: absolute;
        top: -60px; right: -60px;
        width: 200px; height: 200px;
        background: rgba(255,255,255,0.06);
        border-radius: 50%;
      }
      .header::after {
        content: '';
        position: absolute;
        bottom: -80px; left: -40px;
        width: 250px; height: 250px;
        background: rgba(255,255,255,0.04);
        border-radius: 50%;
      }
      .icon-wrap {
        width: 72px; height: 72px;
        background: rgba(255,255,255,0.15);
        border-radius: 50%;
        margin: 0 auto 20px;
        display: table;
        border: 2px solid rgba(255,255,255,0.25);
      }
      .icon-inner {
        display: table-cell;
        vertical-align: middle;
        text-align: center;
        font-size: 30px;
      }
      .header h1 {
        color: #fff;
        font-size: 28px;
        font-weight: 800;
        letter-spacing: -0.5px;
        margin-bottom: 10px;
      }
      .header p {
        color: rgba(255,255,255,0.7);
        font-size: 14px;
        font-weight: 400;
      }
      .badge {
        display: inline-block;
        background: rgba(255,255,255,0.15);
        border: 1px solid rgba(255,255,255,0.25);
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 20px;
        margin-bottom: 16px;
        letter-spacing: 1px;
        text-transform: uppercase;
      }

      /* Body */
      .body {
        background: #0d0d1f;
        padding: 32px 32px;
        border-left: 1px solid #0d2818;
        border-right: 1px solid #0d2818;
      }

      /* Cards */
      .card {
        background: #0a1a10;
        border: 1px solid #0d2818;
        border-radius: 14px;
        overflow: hidden;
        margin-bottom: 16px;
      }
      .card-header {
        padding: 14px 20px;
        border-bottom: 1px solid #0d2818;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .card-header span {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }
      .card-body { padding: 20px; }

      /* Labels & Values */
      .label {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        color: #4b5563;
        display: block;
        margin-bottom: 5px;
      }
      .value {
        font-size: 15px;
        font-weight: 600;
        color: #e2e8f0;
        display: block;
      }
      .value-link {
        font-size: 15px;
        font-weight: 500;
        color: #6ee7b7;
        text-decoration: none;
      }
      .row { margin-bottom: 16px; }
      .row:last-child { margin-bottom: 0; }

      /* Subject highlight */
      .subject-card {
        background: linear-gradient(135deg, #022c22 0%, #0a1a10 100%);
        border: 1px solid #065f46;
        border-radius: 14px;
        padding: 20px;
        margin-bottom: 16px;
      }
      .subject-text {
        font-size: 20px;
        font-weight: 800;
        color: #e2e8f0;
        margin-top: 6px;
        letter-spacing: -0.3px;
      }

      /* Message */
      .message-text {
        font-size: 15px;
        color: #94a3b8;
        line-height: 1.9;
        white-space: pre-wrap;
      }

      /* Location grid */
      .loc-grid {
        display: table;
        width: 100%;
        border-collapse: collapse;
      }
      .loc-row { display: table-row; }
      .loc-cell {
        display: table-cell;
        width: 50%;
        padding: 12px 0;
        vertical-align: top;
      }
      .loc-cell.right { padding-left: 16px; }
      .loc-divider {
        border: none;
        border-top: 1px solid #0d2818;
        margin: 12px 0;
      }
      .coord-value {
        font-family: 'Courier New', monospace;
        font-size: 13px;
        color: #6ee7b7;
        font-weight: 600;
      }
      .ip-value {
        font-family: 'Courier New', monospace;
        font-size: 14px;
        color: #e2e8f0;
        font-weight: 600;
      }

      /* Action Button */
      .action-btn {
        display: inline-block;
        margin-top: 8px;
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.4px;
        text-decoration: none;
        border: 1px solid rgba(52,211,153,0.35);
        background: linear-gradient(135deg, rgba(6,95,70,0.4), rgba(4,120,87,0.3));
        color: #6ee7b7;
      }

      /* Divider */
      .divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, #065f46, transparent);
        margin: 24px 0;
      }

      /* Footer */
      .footer {
        background: #080814;
        border-radius: 0 0 20px 20px;
        padding: 28px 32px;
        text-align: center;
        border: 1px solid #0d2818;
        border-top: none;
      }
      .footer p { color: #374151; font-size: 12px; line-height: 1.8; }
      .footer a { color: #10b981; text-decoration: none; }

      /* Responsive */
      @media (max-width: 480px) {
        .header { padding: 36px 24px 32px; }
        .header h1 { font-size: 22px; }
        .body { padding: 24px 20px; }
        .card-body { padding: 16px; }
        .subject-text { font-size: 17px; }
        .loc-cell { display: block; width: 100%; padding-left: 0 !important; }
        .footer { padding: 24px 20px; }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">

        <!-- HEADER -->
        <div class="header">
          <div class="badge">📬 Portfolio Contact</div>
          <div class="icon-wrap">
            <div class="icon-inner">✉️</div>
          </div>
          <h1>New Message Received</h1>
          <p>Someone reached out via your portfolio contact form</p>
        </div>

        <!-- BODY -->
        <div class="body">

          <!-- Sender Card -->
          <div class="card">
            <div class="card-header">
              <span style="color:#6ee7b7;">👤 Sender Details</span>
            </div>
            <div class="card-body">
              <div class="row">
                <span class="label">Full Name</span>
                <span class="value">${name}</span>
              </div>
              <div class="row">
                <span class="label">Email Address</span>
                <a href="mailto:${email}" class="value-link">${email}</a>
              </div>
            </div>
          </div>

          <!-- Subject Card -->
          <div class="subject-card">
            <span class="label" style="color:#34d399;">📌 Subject</span>
            <div class="subject-text">${subject}</div>
          </div>

          <!-- Message Card -->
          <div class="card">
            <div class="card-header">
              <span style="color:#6ee7b7;">💬 Message</span>
            </div>
            <div class="card-body">
              <p class="message-text">${message}</p>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Location Card -->
          <div class="card">
            <div class="card-header">
              <span style="color:#34d399;">📍 Sender Location</span>
            </div>
            <div class="card-body">

              <!-- IP Address + Lookup Button -->
              <div class="row">
                <span class="label">IP Address</span>
                <span class="ip-value">${locationInfo.ip}</span>
                <a href="https://whatismyipaddress.com/ip/${locationInfo.ip}"
                   target="_blank"
                   class="action-btn">
                  🔍 Lookup IP
                </a>
              </div>

              <hr class="loc-divider"/>

              <!-- City & Region -->
              <div class="loc-grid">
                <div class="loc-row">
                  <div class="loc-cell">
                    <span class="label">City</span>
                    <span class="value">${locationInfo.city}</span>
                  </div>
                  <div class="loc-cell right">
                    <span class="label">Region</span>
                    <span class="value">${locationInfo.region}</span>
                  </div>
                </div>
              </div>

              <hr class="loc-divider"/>

              <!-- Country -->
              <div class="loc-grid">
                <div class="loc-row">
                  <div class="loc-cell">
                    <span class="label">Country</span>
                    <span class="value">${locationInfo.country}</span>
                  </div>
                </div>
              </div>

              <hr class="loc-divider"/>

              <!-- Coordinates + Maps Button -->
              <div class="row">
                <span class="label">Coordinates</span>
                <span class="coord-value">📌 ${locationInfo.coords}</span>
                <a href="https://maps.google.com/?q=${locationInfo.coords}"
                   target="_blank"
                   class="action-btn">
                  🗺️ Open in Maps
                </a>
              </div>

            </div>
          </div>

        </div>

        <!-- FOOTER -->
        <div class="footer">
          <p>Sent from your <strong style="color:#10b981;">Portfolio Contact Form</strong></p>
          <p style="margin-top:6px;">Hit reply to respond directly to <strong style="color:#6ee7b7;">${name}</strong></p>
        </div>

      </div>
    </div>
  </body>
  </html>
  `;


  try {
    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      replyTo: email,
      subject: `📬 ${subject} — from ${name}`,
      html: htmlTemplate,
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});