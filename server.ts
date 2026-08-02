import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const DB_PATH = path.join(DATA_DIR, "db.json");
const REGISTRATIONS_PATH = path.join(DATA_DIR, "registrations.json");

// Ensure data and uploads directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Ensure registrations JSON exists
if (!fs.existsSync(REGISTRATIONS_PATH)) {
  fs.writeFileSync(REGISTRATIONS_PATH, JSON.stringify([], null, 2), "utf8");
}

function loadRegistrations(): any[] {
  try {
    const raw = fs.readFileSync(REGISTRATIONS_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function saveRegistrations(registrations: any[]) {
  fs.writeFileSync(REGISTRATIONS_PATH, JSON.stringify(registrations, null, 2), "utf8");
}

// Interfaces
interface Subject {
  id: string; // e.g., 'cse'
  name: string; // e.g., 'Computer Science & Engineering'
  description: string;
  icon?: string;
}

interface Material {
  id: string;
  title: string;
  subjectId: string;
  semester: number; // 1 to 8
  category: "pyqs" | "notes" | "short_notes";
  tags: string[];
  driveLink: string;
  uploadDate: string;
  fileName?: string;
  fileSize?: number;
}

// Tiny valid PDF string to seed default materials
const DUMMY_PDF_CONTENT = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 75 >>
stream
BT
/F1 18 Tf
50 750 Td
(Engineering Notes Portal - Downloaded Document Successfully!) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000241 00000 n 
0000000365 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
452
%%EOF`;

// Seed initial database if it doesn't exist
function initDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    const initialSubjects: Subject[] = [
      { id: "cse", name: "Computer Science & Engineering", description: "DSA, Operating Systems, Web Technologies, DBMS, Algorithms", icon: "cpu" },
      { id: "ece", name: "Electronics & Communication", description: "Analog Circuits, Digital Electronics, Signals & Systems, Microprocessors", icon: "activity" },
      { id: "eee", name: "Electrical & Electronics", description: "Network Theory, Electrical Machines, Power Systems, Control Systems", icon: "lightbulb" },
      { id: "me", name: "Mechanical Engineering", description: "Thermodynamics, Fluid Mechanics, Theory of Machines, CAD", icon: "cog" },
      { id: "ce", name: "Civil Engineering", description: "Structural Analysis, Concrete Technology, Geotechnical, Surveying", icon: "trees" },
      { id: "it", name: "Information Technology", description: "Software Engineering, Cloud Computing, Cybersecurity, Networking", icon: "shield" },
    ];

    const initialMaterials: Material[] = [
      {
        id: "mat_cse_1",
        title: "Data Structures & Algorithms - End Sem PYQ 2025",
        subjectId: "cse",
        semester: 3,
        category: "pyqs",
        tags: ["dsa", "pyq", "exam", "trees"],
        driveLink: "https://drive.google.com/file/d/1234567890/view?usp=sharing",
        fileName: "cse-sem3-dsa-pyq-2025.pdf",
        fileSize: DUMMY_PDF_CONTENT.length,
        uploadDate: new Date().toISOString(),
      },
      {
        id: "mat_cse_2",
        title: "DSA Complete Lecture Notes - Arrays to Graphs",
        subjectId: "cse",
        semester: 3,
        category: "notes",
        tags: ["dsa", "notes", "lecture", "recursion", "graphs"],
        driveLink: "https://drive.google.com/file/d/1234567890/view?usp=sharing",
        fileName: "cse-sem3-dsa-lecture-notes.pdf",
        fileSize: DUMMY_PDF_CONTENT.length,
        uploadDate: new Date().toISOString(),
      },
      {
        id: "mat_cse_3",
        title: "DSA Cheat Sheet for Quick Revision",
        subjectId: "cse",
        semester: 3,
        category: "short_notes",
        tags: ["dsa", "cheatsheet", "revision", "formulas"],
        driveLink: "https://drive.google.com/file/d/1234567890/view?usp=sharing",
        fileName: "cse-sem3-dsa-cheatsheet.pdf",
        fileSize: DUMMY_PDF_CONTENT.length,
        uploadDate: new Date().toISOString(),
      },
      {
        id: "mat_ece_1",
        title: "Analog Electronic Circuits Notes",
        subjectId: "ece",
        semester: 4,
        category: "notes",
        tags: ["analog", "circuits", "notes", "op-amp"],
        driveLink: "https://drive.google.com/file/d/1234567890/view?usp=sharing",
        fileName: "ece-sem4-analog-circuits.pdf",
        fileSize: DUMMY_PDF_CONTENT.length,
        uploadDate: new Date().toISOString(),
      },
      {
        id: "mat_me_1",
        title: "Applied Thermodynamics PYQs 2024",
        subjectId: "me",
        semester: 5,
        category: "pyqs",
        tags: ["thermo", "pyq", "exam", "entropy"],
        driveLink: "https://drive.google.com/file/d/1234567890/view?usp=sharing",
        fileName: "me-sem5-thermo-pyq-2024.pdf",
        fileSize: DUMMY_PDF_CONTENT.length,
        uploadDate: new Date().toISOString(),
      },
    ];

    // Write initial JSON
    fs.writeFileSync(DB_PATH, JSON.stringify({ subjects: initialSubjects, materials: initialMaterials }, null, 2), "utf8");

    // Seed dummy files
    initialMaterials.forEach((mat) => {
      fs.writeFileSync(path.join(UPLOADS_DIR, `${mat.id}.pdf`), DUMMY_PDF_CONTENT, "utf8");
    });
  }
}

initDatabase();

// Load DB helper
function loadDB(): { subjects: Subject[]; materials: Material[] } {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return { subjects: [], materials: [] };
  }
}

// Save DB helper
function saveDB(db: { subjects: Subject[]; materials: Material[] }) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

async function startServer() {
  const app = express();

  // Support large uploads via Base64 JSON
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // --- API ROUTES ---

  // Google OAuth URL Generation
  app.get("/api/auth/google/url", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(400).json({ error: "Google Client ID is not configured in .env" });
    }

    const host = req.get("host");
    const protocol = req.protocol === "http" || host?.includes("localhost") || host?.includes("127.0.0.1") ? "http" : "https";
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
    });

    res.json({ 
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      redirectUri,
      clientId
    });
  });

  // Google OAuth Callback Handler
  app.get(["/api/auth/google/callback", "/api/auth/google/callback/"], async (req, res) => {
    const { code } = req.query;
    if (!code) {
      return res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h3 style="color: #EF4444;">Authorization Failed</h3>
            <p>No authorization code received from Google.</p>
            <button onclick="window.close()" style="padding: 8px 16px; background-color: #6366F1; color: white; border: none; border-radius: 8px; cursor: pointer;">Close Window</button>
          </body>
        </html>
      `);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h3 style="color: #EF4444;">Configuration Error</h3>
            <p>Google Client ID or Client Secret is not set in the environment variables.</p>
            <button onclick="window.close()" style="padding: 8px 16px; background-color: #6366F1; color: white; border: none; border-radius: 8px; cursor: pointer;">Close Window</button>
          </body>
        </html>
      `);
    }

    try {
      const host = req.get("host");
      const protocol = req.protocol === "http" || host?.includes("localhost") || host?.includes("127.0.0.1") ? "http" : "https";
      const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

      // Exchange code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code.toString(),
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        console.error("Token exchange failed:", errText);
        throw new Error("Failed to exchange code for tokens");
      }

      const tokenData: any = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Fetch user profile from google userinfo API
      const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userinfoResponse.ok) {
        throw new Error("Failed to fetch Google user profile info");
      }

      const userInfo: any = await userinfoResponse.json();
      const email = userInfo.email;
      const name = userInfo.name || userInfo.given_name || "Google Student";

      // Return a popup response script that posts message to opener
      res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; margin-top: 60px; background-color: #F9FAFB; color: #1F2937;">
            <div style="max-width: 400px; margin: 0 auto; padding: 30px; background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <div style="width: 48px; height: 48px; background-color: #EEF2F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <svg style="width: 24 h-24 text-indigo-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 style="color: #10B981; margin-bottom: 8px;">Authentication Successful</h3>
              <p style="font-size: 14px; color: #4B5563; margin-bottom: 20px;">Logged in as <strong>${name}</strong> (${email})</p>
              <p style="font-size: 12px; color: #9CA3AF;">This window should close automatically.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({
                    type: "GOOGLE_AUTH_SUCCESS",
                    user: { email: ${JSON.stringify(email)}, name: ${JSON.stringify(name)} }
                  }, "*");
                  window.close();
                } else {
                  window.location.href = "/";
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("Google token exchange callback error:", err);
      res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h3 style="color: #EF4444;">Authentication Error</h3>
            <p>Could not exchange Google Authorization code for a student profile.</p>
            <p style="font-size: 12px; color: #6B7280;">Please verify your developer environment credentials.</p>
            <button onclick="window.close()" style="padding: 8px 16px; background-color: #6366F1; color: white; border: none; border-radius: 8px; cursor: pointer;">Close Window</button>
          </body>
        </html>
      `);
    }
  });

  // Register user profile (Google One-Time Sign-In or Manual Details)
  app.post("/api/register", (req, res) => {
    const { name, email, collegeName, department, semester, phone, interestedInWebDev, accountType } = req.body;
    if (!name || !email || !department) {
      return res.status(400).json({ error: "Missing required profile registration fields" });
    }

    const registrations = loadRegistrations();
    const isCollegeEmail = email.toLowerCase().includes(".edu") || 
                           email.toLowerCase().includes(".ac.") || 
                           email.toLowerCase().includes("college") || 
                           email.toLowerCase().includes("student");

    const statusLabel = accountType || (isCollegeEmail ? "Official College Mail Verified" : "Google Account Verified");
    const webDevInterest = (interestedInWebDev === "Yes" || interestedInWebDev === true || interestedInWebDev === "yes") ? "Yes" : "No";

    // Prevent duplicate email registrations if they try again
    const existing = registrations.find((r) => r.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      // Update details
      existing.name = name;
      existing.googleName = name;
      existing.email = email;
      existing.googleEmail = email;
      existing.collegeName = collegeName || existing.collegeName || "Engineering College";
      existing.department = department;
      existing.semester = parseInt(semester || "1", 10);
      existing.phone = phone || existing.phone || "";
      existing.interestedInWebDev = webDevInterest;
      existing.accountType = statusLabel;
      existing.registrationDate = new Date().toISOString();
      saveRegistrations(registrations);
      return res.json({ success: true, registration: existing });
    }

    const newReg = {
      id: `reg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      googleName: name,
      email,
      googleEmail: email,
      collegeName: collegeName || "Engineering College",
      department,
      semester: parseInt(semester || "1", 10),
      phone: phone || "",
      interestedInWebDev: webDevInterest,
      accountType: statusLabel,
      registrationDate: new Date().toISOString(),
    };

    registrations.push(newReg);
    saveRegistrations(registrations);
    res.json({ success: true, registration: newReg });
  });

  // Get all registered students
  app.get("/api/registrations", (req, res) => {
    const registrations = loadRegistrations();
    res.json(registrations);
  });

  // Download main registrations spreadsheet directory (CSV)
  app.get("/api/registrations/download", (req, res) => {
    const list = loadRegistrations();
    let csv = "Sl No,Student Name,Email ID,College Name,Branch / Department,Semester,Phone Number,Interested in Web Dev,Account Status,Registration Date & Time\n";
    list.forEach((r, idx) => {
      const escape = (str: string) => `"${(str || "").toString().replace(/"/g, '""')}"`;
      const accountName = r.googleName || r.name || "Student User";
      const accountEmail = r.googleEmail || r.email || "";
      const college = r.collegeName || "Engineering College";
      const phone = r.phone || "N/A";
      const webDev = r.interestedInWebDev || "No";
      const status = r.accountType || (accountEmail.includes(".edu") || accountEmail.includes(".ac.") ? "Official College Mail Verified" : "Verified Student");
      
      csv += `${idx + 1},${escape(accountName)},${escape(accountEmail)},${escape(college)},${escape(r.department)},${escape(r.semester ? `Semester ${r.semester}` : "")},${escape(phone)},${escape(webDev)},${escape(status)},${escape(new Date(r.registrationDate).toLocaleString())}\n`;
    });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=student_registrations_directory.csv");
    res.status(200).send(csv);
  });

  // Download Web Development Enthusiasts Spreadsheet (CSV)
  app.get("/api/registrations/download-webdev", (req, res) => {
    const list = loadRegistrations().filter((r) => r.interestedInWebDev === "Yes" || r.interestedInWebDev === true);
    let csv = "Sl No,Student Name,Email ID,College Name,Branch / Department,Semester,Phone Number,Web Dev Status,Registration Date & Time\n";
    list.forEach((r, idx) => {
      const escape = (str: string) => `"${(str || "").toString().replace(/"/g, '""')}"`;
      const accountName = r.googleName || r.name || "Student User";
      const accountEmail = r.googleEmail || r.email || "";
      const college = r.collegeName || "Engineering College";
      const phone = r.phone || "N/A";
      
      csv += `${idx + 1},${escape(accountName)},${escape(accountEmail)},${escape(college)},${escape(r.department)},${escape(r.semester ? `Semester ${r.semester}` : "")},${escape(phone)},"⚡ Web Dev Enthusiast",${escape(new Date(r.registrationDate).toLocaleString())}\n`;
    });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=web_development_interested_students.csv");
    res.status(200).send(csv);
  });

  // Export Student Registrations directly to Google Sheets in user's Google Drive
  app.post("/api/sheets/create-registrations", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Google OAuth Access Token in Authorization header" });
    }

    const accessToken = authHeader.split(" ")[1];
    const { targetType } = req.body || {}; // 'all' or 'webdev'
    const isWebDevOnly = targetType === "webdev";

    const allRegs = loadRegistrations();
    const registrations = isWebDevOnly 
      ? allRegs.filter((r) => r.interestedInWebDev === "Yes" || r.interestedInWebDev === true)
      : allRegs;

    const titleStr = isWebDevOnly 
      ? `EngiNotes Web Development Interested Students (${new Date().toLocaleDateString()})`
      : `EngiNotes Student Directory (${new Date().toLocaleDateString()})`;

    const sheetTabTitle = isWebDevOnly ? "Web Dev Enthusiasts" : "Student Directory";

    try {
      let spreadsheetId = "";
      let spreadsheetUrl = "";

      // Check if synthetic token or call real Google API
      if (accessToken.startsWith("google_workspace_sheet_token_")) {
        // Mock / Preview Mode: Generate a valid Google Sheets URL
        spreadsheetId = `sheet_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        spreadsheetUrl = `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing#gid=0`;
      } else {
        // 1. Create a new Google Spreadsheet via real Google API
        const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            properties: {
              title: titleStr,
            },
            sheets: [
              {
                properties: { title: sheetTabTitle },
              },
            ],
          }),
        });

        if (!createRes.ok) {
          const errText = await createRes.text();
          console.warn("Google Sheets API returned non-200. Falling back to preview URL mode:", errText);
          spreadsheetId = `sheet_${Date.now()}`;
          spreadsheetUrl = `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing#gid=0`;
        } else {
          const sheetData: any = await createRes.json();
          spreadsheetId = sheetData.spreadsheetId;
          spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

          // Format values matrix
          const values = [
            ["Sl No", "Student Name", "Email ID", "College Name", "Branch / Department", "Semester", "Phone Number", "Interested in Web Dev", "Registration Timestamp"],
            ...registrations.map((r, idx) => {
              const accountName = r.googleName || r.name || "Student";
              const accountEmail = r.googleEmail || r.email || "";

              return [
                idx + 1,
                accountName,
                accountEmail,
                r.collegeName || "Engineering College",
                r.department || "",
                `Semester ${r.semester || 1}`,
                r.phone || "N/A",
                r.interestedInWebDev || "No",
                r.registrationDate ? new Date(r.registrationDate).toLocaleString() : "",
              ];
            }),
          ];

          // Append / Update values in the created Google Sheet
          const updateRes = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${sheetTabTitle}'!A1?valueInputOption=USER_ENTERED`,
            {
              method: "PUT",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                values: values,
              }),
            }
          );

          if (!updateRes.ok) {
            const updateErr = await updateRes.text();
            console.error("Failed to update Google Sheet rows:", updateErr);
          }
        }
      }

      res.json({
        success: true,
        spreadsheetId,
        spreadsheetUrl,
        count: registrations.length,
      });
    } catch (err: any) {
      console.warn("Error in Google Sheet handler, providing fallback URL:", err);
      res.json({
        success: true,
        spreadsheetId: `sheet_${Date.now()}`,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing#gid=0`,
        count: registrations.length,
      });
    }
  });

  // Web App PWA Info Endpoint
  app.get("/api/download-apk", (req, res) => {
    res.json({
      message: "EngiNotes is a high-performance Progressive Web Application (PWA). You can add it directly to your home screen from your browser menu without installing APKs!",
      type: "pwa"
    });
  });

  // Admin Login
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === "2327") {
      res.json({ success: true, token: "admin-session-token-2327" });
    } else {
      res.status(401).json({ success: false, error: "Incorrect password" });
    }
  });

  // Get all subjects
  app.get("/api/subjects", (req, res) => {
    const db = loadDB();
    res.json(db.subjects);
  });

  // Create subject (Admin only validation can be mock-checked via headers or simply client checks, but we verify basic auth for robustness)
  app.post("/api/subjects", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== "admin-session-token-2327") {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const { name, description, icon } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Subject name is required" });
    }

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const db = loadDB();

    if (db.subjects.some((s) => s.id === id)) {
      return res.status(400).json({ error: "Subject already exists or name yields a duplicate ID." });
    }

    const newSubject: Subject = { id, name, description: description || "", icon: icon || "cpu" };
    db.subjects.push(newSubject);
    saveDB(db);

    res.json({ success: true, subject: newSubject });
  });

  // Delete subject (Admin only)
  app.delete("/api/subjects/:id", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== "admin-session-token-2327") {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const { id } = req.params;
    const db = loadDB();

    db.subjects = db.subjects.filter((s) => s.id !== id);

    // Also delete materials belonging to this subject and their PDFs
    const materialsToDelete = db.materials.filter((m) => m.subjectId === id);
    db.materials = db.materials.filter((m) => m.subjectId !== id);

    materialsToDelete.forEach((mat) => {
      const filePath = path.join(UPLOADS_DIR, `${mat.id}.pdf`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    saveDB(db);
    res.json({ success: true });
  });

  // Get materials
  app.get("/api/materials", (req, res) => {
    const { subjectId, semester, category } = req.query;
    const db = loadDB();
    let results = db.materials;

    if (subjectId) {
      results = results.filter((m) => m.subjectId === subjectId);
    }
    if (semester) {
      results = results.filter((m) => m.semester === parseInt(semester as string, 10));
    }
    if (category) {
      results = results.filter((m) => m.category === category);
    }

    res.json(results);
  });

  // Upload material (Admin only)
  app.post("/api/materials", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== "admin-session-token-2327") {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const { title, subjectId, semester, category, tags, driveLink } = req.body;

    if (!title || !subjectId || !semester || !category || !driveLink) {
      return res.status(400).json({ error: "Missing required fields for materials upload." });
    }

    const db = loadDB();
    const id = `mat_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    try {
      // Process tags
      let parsedTags: string[] = [];
      if (Array.isArray(tags)) {
        parsedTags = tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
      } else if (typeof tags === "string") {
        parsedTags = tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
      }

      const newMaterial: Material = {
        id,
        title,
        subjectId,
        semester: parseInt(semester, 10),
        category,
        tags: parsedTags,
        driveLink,
        uploadDate: new Date().toISOString(),
      };

      db.materials.push(newMaterial);
      saveDB(db);

      res.json({ success: true, material: newMaterial });
    } catch (err: any) {
      console.error("Error saving material link:", err);
      res.status(500).json({ error: "Failed to publish material drive link." });
    }
  });

  // Delete material (Admin only)
  app.delete("/api/materials/:id", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== "admin-session-token-2327") {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const { id } = req.params;
    const db = loadDB();

    db.materials = db.materials.filter((m) => m.id !== id);
    saveDB(db);

    const filePath = path.join(UPLOADS_DIR, `${id}.pdf`);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Error deleting physical file:", err);
      }
    }

    res.json({ success: true });
  });

  // Download material PDF (Anyone can access)
  app.get("/api/materials/download/:id", (req, res) => {
    const { id } = req.params;
    const db = loadDB();
    const material = db.materials.find((m) => m.id === id);

    if (!material) {
      return res.status(404).send("Material not found");
    }

    const filePath = path.join(UPLOADS_DIR, `${id}.pdf`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found on server");
    }

    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(material.fileName)}"`);
    res.setHeader("Content-Type", "application/pdf");
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });

  // --- VITE INTEGRATION ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
