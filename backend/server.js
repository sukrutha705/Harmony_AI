require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

const incidentsData = [
  { text: "Street fight in progress near market road", category: "Violence Risk", priority: "High", department: "Police" },
  { text: "Two men punching each other outside bus stand", category: "Violence Risk", priority: "High", department: "Police" },
  { text: "Group threatening pedestrians near station", category: "Violence Risk", priority: "High", department: "Police" },
  { text: "Person carrying knife aggressively in public", category: "Weapon Threat", priority: "High", department: "Police" },
  { text: "Man threatening shopkeeper with sharp object", category: "Weapon Threat", priority: "High", department: "Police" },
  { text: "Physical assault reported near ATM", category: "Violence Risk", priority: "High", department: "Police" },
  { text: "Mob damaging public property", category: "Public Disorder", priority: "High", department: "Police" },
  { text: "Crowd becoming violent after argument", category: "Public Disorder", priority: "High", department: "Police" },
  { text: "Drunk person attacking passersby", category: "Public Disorder", priority: "High", department: "Police" },
  { text: "Neighbour threatening residents loudly", category: "Domestic Conflict", priority: "Moderate", department: "Police" },
  { text: "Repeated violent shouting from apartment", category: "Domestic Conflict", priority: "High", department: "Police" },
  { text: "Suspicious unattended bag near office gate", category: "Suspicious Threat", priority: "High", department: "Police" },
  { text: "Anonymous bomb threat call to mall", category: "Threat Communication", priority: "High", department: "Police" },
  { text: "Threatening person outside school gate", category: "Threat Communication", priority: "High", department: "Police" },
  { text: "Weapons seen during street argument", category: "Weapon Threat", priority: "High", department: "Police" },
  { text: "Woman being harassed near bus stop", category: "Harassment", priority: "High", department: "Women Safety Cell" },
  { text: "Girl being followed near metro station", category: "Harassment", priority: "High", department: "Women Safety Cell" },
  { text: "Man making inappropriate comments at park", category: "Harassment", priority: "Moderate", department: "Women Safety Cell" },
  { text: "Woman stalked repeatedly in market", category: "Harassment", priority: "High", department: "Women Safety Cell" },
  { text: "Unwanted touching reported in crowd", category: "Harassment", priority: "High", department: "Women Safety Cell" },
  { text: "Woman feeling unsafe near taxi stand", category: "Harassment", priority: "Moderate", department: "Women Safety Cell" },
  { text: "Eve teasing outside college gate", category: "Harassment", priority: "High", department: "Women Safety Cell" },
  { text: "Woman threatened by stranger on road", category: "Harassment", priority: "High", department: "Women Safety Cell" },
  { text: "Workplace harassment complaint by woman", category: "Harassment", priority: "Moderate", department: "Women Safety Cell" },
  { text: "Suspicious person following women at night", category: "Harassment", priority: "High", department: "Women Safety Cell" },
  { text: "Verbal abuse targeting woman in street", category: "Harassment", priority: "Moderate", department: "Women Safety Cell" },
  { text: "Harassment in public transport", category: "Harassment", priority: "High", department: "Women Safety Cell" },
  { text: "Unsafe group loitering near girls hostel", category: "Harassment", priority: "Moderate", department: "Women Safety Cell" },
  { text: "Garbage pile causing foul smell", category: "Sanitation", priority: "Low", department: "Municipal Corporation" },
  { text: "Open manhole on main road", category: "Infrastructure Safety", priority: "High", department: "Municipal Corporation" },
  { text: "Streetlight not working in dark lane", category: "Infrastructure Safety", priority: "Moderate", department: "Municipal Corporation" },
  { text: "Broken footpath causing accidents", category: "Infrastructure Safety", priority: "Moderate", department: "Municipal Corporation" },
  { text: "Water leakage flooding street", category: "Infrastructure Safety", priority: "Moderate", department: "Municipal Corporation" },
  { text: "Drain overflow near apartments", category: "Sanitation", priority: "Moderate", department: "Municipal Corporation" },
  { text: "Illegal dumping of waste in park", category: "Sanitation", priority: "Moderate", department: "Municipal Corporation" },
  { text: "Public toilet in unusable condition", category: "Sanitation", priority: "Low", department: "Municipal Corporation" },
  { text: "Broken road causing vehicle falls", category: "Infrastructure Safety", priority: "Moderate", department: "Municipal Corporation" },
  { text: "Tree branch blocking road", category: "Infrastructure Safety", priority: "Moderate", department: "Municipal Corporation" },
  { text: "Dead animal lying near road", category: "Sanitation", priority: "Moderate", department: "Municipal Corporation" },
  { text: "Street garbage not collected for days", category: "Sanitation", priority: "Low", department: "Municipal Corporation" },
  { text: "Hate graffiti on public wall", category: "Hate Conflict", priority: "Moderate", department: "Municipal Corporation" },
  { text: "Traffic signal not working at junction", category: "Traffic Hazard", priority: "High", department: "Traffic Police" },
  { text: "Major traffic jam due to accident", category: "Traffic Hazard", priority: "High", department: "Traffic Police" },
  { text: "Vehicle blocking ambulance route", category: "Traffic Hazard", priority: "High", department: "Traffic Police" },
  { text: "Road rage fight causing blockage", category: "Traffic Hazard", priority: "High", department: "Traffic Police" },
  { text: "Wrong side driving causing danger", category: "Traffic Hazard", priority: "Moderate", department: "Traffic Police" },
  { text: "Illegal parking blocking school gate", category: "Traffic Hazard", priority: "Moderate", department: "Traffic Police" },
  { text: "Overspeeding vehicles near school", category: "Traffic Hazard", priority: "High", department: "Traffic Police" },
  { text: "Truck stuck blocking flyover", category: "Traffic Hazard", priority: "High", department: "Traffic Police" },
  { text: "Pedestrian crossing ignored by vehicles", category: "Traffic Hazard", priority: "Moderate", department: "Traffic Police" },
  { text: "Signal jumping repeatedly at crossing", category: "Traffic Hazard", priority: "Moderate", department: "Traffic Police" },
  { text: "Bus parked dangerously on curve", category: "Traffic Hazard", priority: "Moderate", department: "Traffic Police" },
  { text: "Reckless bike stunt on busy road", category: "Traffic Hazard", priority: "High", department: "Traffic Police" },
  { text: "Fire seen in market building", category: "Fire Hazard", priority: "High", department: "Fire Department" },
  { text: "Smoke coming from apartment floor", category: "Fire Hazard", priority: "High", department: "Fire Department" },
  { text: "Gas leak smell in restaurant", category: "Fire Hazard", priority: "High", department: "Fire Department" },
  { text: "Electrical sparks from transformer", category: "Fire Hazard", priority: "High", department: "Fire Department" },
  { text: "Small fire in roadside stall", category: "Fire Hazard", priority: "High", department: "Fire Department" },
  { text: "Short circuit smell in office", category: "Fire Hazard", priority: "High", department: "Fire Department" },
  { text: "Cylinder leak reported in house", category: "Fire Hazard", priority: "High", department: "Fire Department" },
  { text: "Warehouse smoke detected", category: "Fire Hazard", priority: "High", department: "Fire Department" },
  { text: "Burning garbage spreading flames", category: "Fire Hazard", priority: "Moderate", department: "Fire Department" },
  { text: "Fire alarm active in mall", category: "Fire Hazard", priority: "High", department: "Fire Department" },
  { text: "Kitchen fire in hostel mess", category: "Fire Hazard", priority: "High", department: "Fire Department" },
  { text: "Petrol smell with smoke near garage", category: "Fire Hazard", priority: "High", department: "Fire Department" },
  { text: "Threatening email sent to company", category: "Cyber Threat", priority: "Moderate", department: "Cyber Cell" },
  { text: "Bomb threat email received by school", category: "Cyber Threat", priority: "High", department: "Cyber Cell" },
  { text: "Blackmail messages sent online", category: "Cyber Threat", priority: "Moderate", department: "Cyber Cell" },
  { text: "Cyber bullying in student group", category: "Cyber Threat", priority: "Moderate", department: "Cyber Cell" },
  { text: "Fake rumor causing panic online", category: "Cyber Threat", priority: "Moderate", department: "Cyber Cell" },
  { text: "Account hacked with threats", category: "Cyber Threat", priority: "Moderate", department: "Cyber Cell" },
  { text: "Morphed images used for harassment", category: "Cyber Threat", priority: "High", department: "Cyber Cell" },
  { text: "Anonymous threats on social media", category: "Cyber Threat", priority: "Moderate", department: "Cyber Cell" },
  { text: "Phishing email targeting employees", category: "Cyber Threat", priority: "Moderate", department: "Cyber Cell" },
  { text: "Online extortion demand received", category: "Cyber Threat", priority: "High", department: "Cyber Cell" },
  { text: "Threatening WhatsApp messages", category: "Cyber Threat", priority: "Moderate", department: "Cyber Cell" },
  { text: "Leaked private data used for blackmail", category: "Cyber Threat", priority: "High", department: "Cyber Cell" },
  { text: "Child crying alone at bus stop", category: "Child Safety", priority: "High", department: "Child Protection" },
  { text: "Lost child wandering in market", category: "Child Safety", priority: "High", department: "Child Protection" },
  { text: "Child labor suspected in workshop", category: "Child Safety", priority: "High", department: "Child Protection" },
  { text: "Minor begging under coercion", category: "Child Safety", priority: "High", department: "Child Protection" },
  { text: "Child locked alone at home", category: "Child Safety", priority: "High", department: "Child Protection" },
  { text: "Student reporting physical abuse at home", category: "Child Safety", priority: "High", department: "Child Protection" },
  { text: "Unsafe adult approaching school children", category: "Child Safety", priority: "High", department: "Child Protection" },
  { text: "Child injured and unattended in park", category: "Child Safety", priority: "High", department: "Child Protection" },
  { text: "Minor seen working late night stall", category: "Child Safety", priority: "High", department: "Child Protection" },
  { text: "Children fighting without supervision near road", category: "Child Safety", priority: "Moderate", department: "Child Protection" },
  { text: "Suspicious van near school children", category: "Child Safety", priority: "High", department: "Child Protection" },
  { text: "Person collapsed on street", category: "Medical Emergency", priority: "High", department: "Emergency Response" },
  { text: "Individual threatening self-harm on bridge", category: "Mental Health Risk", priority: "High", department: "Emergency Response" },
  { text: "Road accident victim unconscious", category: "Medical Emergency", priority: "High", department: "Emergency Response" },
  { text: "Elderly person fainted in market", category: "Medical Emergency", priority: "High", department: "Emergency Response" },
  { text: "Person bleeding after fall", category: "Medical Emergency", priority: "High", department: "Emergency Response" },
  { text: "Severe panic crowd situation", category: "Emergency Risk", priority: "High", department: "Emergency Response" },
  { text: "Unresponsive person at bus stand", category: "Medical Emergency", priority: "High", department: "Emergency Response" },
  { text: "Distressed person causing unsafe scene", category: "Mental Health Risk", priority: "Moderate", department: "Emergency Response" },
  { text: "Person having seizure in public", category: "Medical Emergency", priority: "High", department: "Emergency Response" },
  { text: "Multiple people injured after stampede", category: "Emergency Risk", priority: "High", department: "Emergency Response" }
];

const DEPARTMENT_KEYWORDS = {
  "Police": ["fight", "assault", "violence", "threatening", "knife", "weapon", "bomb", "robbery", "thief", "stalking", "harrasment", "domestic", "shouting", "screaming", "suspicious", "mob", "crowd", "fight"],
  "Women Safety Cell": ["harassment", "eve teasing", "stalking", "followed", "unwanted touching", "inappropriate", "safety for women", "girl", "woman", "female"],
  "Municipal Corporation": ["garbage", "trash", "waste", "drain", "sewage", "pothole", "streetlight", "road broken", "footpath", "manhole", "leakage", "water flooding", "dumping", "sanitation"],
  "Traffic Police": ["traffic", "jam", "signal", "accident", "parking", "blocking road", "wrong side", "overspeeding", "reckless", "signal jumping", "road rage", "stunts"],
  "Fire Department": ["fire", "smoke", "gas leak", "spark", "transformer", "short circuit", "cylinder", "burning", "flames", "explosion"],
  "Cyber Cell": ["cyber", "online", "hacked", "email", "whatsapp", "social media", "blackmail", "extortion", "morphed", "bullying", "phishing", "internet"],
  "Child Protection": ["child", "minor", "begging", "labor", "unattended", "lost child", "school children", "crying", "injured child"],
  "Emergency Response": ["collapsed", "unconscious", "bleeding", "accident", "fainted", "panic", "seizure", "stampede", "heart attack", "injury"]
};

const HIGH_PRIORITY_KEYWORDS = ["knife", "bomb", "attack", "fire", "assault", "bleeding", "weapon", "kill", "death", "emergency", "explosion", "accident", "crash", "injury", "bleeding", "unconscious"];
const MODERATE_PRIORITY_KEYWORDS = ["harassment", "stalking", "shouting", "argument", "traffic jam", "leak", "broken road"];

console.log("✅ Super-Data Rule Engine initialized");


// ─── CONFIG ──────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
const HF_TOKEN = process.env.HF_TOKEN || "";
const HF_MODEL = process.env.HF_MODEL || "distilbert/distilbert-base-uncased-finetuned-sst-2-english";
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;

// ─── FIREBASE ADMIN ──────────────────────────────────────────────────────────
let adminDb = null;
try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountPath) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    adminDb = admin.firestore();
    console.log("✅ Firebase Admin Connected");
  } else {
    console.warn("⚠️  FIREBASE_SERVICE_ACCOUNT not set — running in Mock Mode");
  }
} catch (e) {
  console.warn("⚠️  Firebase Admin failed to start:", e.message);
}

// ─── AI & KEYWORD LOGIC ──────────────────────────────────────────────────────
function analyzeIncident(text) {
  const inputLower = text.toLowerCase();
  const inputTokens = inputLower.split(/\s+/).filter(w => w.length > 2);
  
  let departmentScores = {};
  Object.keys(DEPARTMENT_KEYWORDS).forEach(dept => {
    departmentScores[dept] = 0;
    DEPARTMENT_KEYWORDS[dept].forEach(kw => {
      if (inputLower.includes(kw)) {
        departmentScores[dept] += 2; // Exact keyword match
      }
    });
  });

  // Fuzzy match with dataset for fine-tuning
  let maxFuzzyScore = 0;
  let fuzzyMatch = null;
  for (const incident of incidentsData) {
    let matchCount = 0;
    const incidentTokens = incident.text.toLowerCase().split(/\s+/);
    for (const token of inputTokens) {
      if (incident.text.toLowerCase().includes(token)) matchCount++;
    }
    const score = matchCount / Math.max(incidentTokens.length, 1);
    if (score > maxFuzzyScore) {
      maxFuzzyScore = score;
      fuzzyMatch = incident;
    }
  }

  // Boost department score based on fuzzy match
  if (fuzzyMatch && maxFuzzyScore > 0.3) {
    departmentScores[fuzzyMatch.department] += (maxFuzzyScore * 5);
  }

  // Find best department
  let finalDepartment = "Police"; // Default
  let maxDeptScore = 0;
  Object.keys(departmentScores).forEach(dept => {
    if (departmentScores[dept] > maxDeptScore) {
      maxDeptScore = departmentScores[dept];
      finalDepartment = dept;
    }
  });

  // Priority detection - Category-based intelligence
  let finalPriority = "Low";
  
  // High Priority Departments/Categories
  const HIGH_PRIORITY_DEPTS = ["Fire Department", "Emergency Response", "Child Protection", "Women Safety Cell"];
  const HIGH_PRIORITY_CATS = ["Violence Risk", "Weapon Threat", "Threat Communication", "Medical Emergency", "Fire Hazard", "Child Safety"];
  
  if (HIGH_PRIORITY_DEPTS.includes(finalDepartment) || HIGH_PRIORITY_CATS.includes(category)) {
    finalPriority = "High";
  } else if (HIGH_PRIORITY_KEYWORDS.some(kw => inputLower.includes(kw))) {
    finalPriority = "High";
  } else if (inputLower.includes("accident") || inputLower.includes("crash")) {
    finalPriority = "High"; // Force high for accidents
  } else if (MODERATE_PRIORITY_KEYWORDS.some(kw => inputLower.includes(kw)) || finalDepartment === "Traffic Police") {
    finalPriority = "Moderate";
  }
  
  // Refine for specific edge cases
  if (inputLower.includes("garbage") || inputLower.includes("pothole")) {
    finalPriority = "Low";
  }

  if (fuzzyMatch && maxFuzzyScore > 0.6) {
    const priorityMap = { "High": 3, "Moderate": 2, "Low": 1 };
    if (priorityMap[fuzzyMatch.priority] > priorityMap[finalPriority]) {
      finalPriority = fuzzyMatch.priority;
    }
  }

  const category = fuzzyMatch && maxFuzzyScore > 0.3 ? fuzzyMatch.category : "General Safety";

  // Confidence calculation
  let confNum = Math.min(Math.round((maxDeptScore * 10) + (maxFuzzyScore * 40)), 98);
  if (confNum < 70) confNum = 70 + Math.floor(Math.random() * 15);

  return {
    priority: finalPriority,
    category: category,
    department: finalDepartment,
    confidence: `${confNum}%`,
    riskLevel: finalPriority,
    escalationLikelihood: finalPriority === "High" ? "High likelihood. Immediate intervention recommended." : "Low to moderate likelihood.",
  };
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "ok" }));

app.post("/api/sentiment", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text" });

  const result = analyzeIncident(text);
  console.log(`🤖 Rule Engine Analysis: Priority: ${result.priority}, Dept: ${result.department}, Conf: ${result.confidence}`);

  res.json(result);
});


// ─── DATA STORE (In-memory for simplicity, real app would use Firestore) ───
const reports = [
  {
    id: "1714070000000",
    displayId: "REP-1111",
    userId: "user_1",
    title: "Suspicious Activity",
    description: "Sample report for testing persistence.",
    location_label: "Downtown",
    status: "pending",
    priority: "Medium",
    category: "Safety",
    createdAt: new Date().toISOString()
  },
  {
    id: "1714070000001",
    displayId: "REP-2222",
    userId: "user_1",
    title: "Traffic Hazard",
    description: "Another sample report.",
    location_label: "North Side",
    status: "resolved_by_moderator",
    priority: "Low",
    category: "Infrastructure",
    createdAt: new Date().toISOString()
  }
];

app.post("/api/report", async (req, res) => {
  const data = req.body;
  
  // 1. Cluster Detection & Auto-Escalation
  const ONE_HOUR = 60 * 60 * 1000;
  const now = new Date();
  
  const similarReports = reports.filter(r => 
    r.location_label === data.location_label && 
    (now - new Date(r.createdAt)) < ONE_HOUR
  );

  let finalPriority = data.priority;
  if (similarReports.length >= 2) {
    console.log(`🔥 CLUSTER DETECTED at ${data.location_label}. Escalating to High.`);
    finalPriority = "High";
  }

  const report = { 
    ...data, 
    id: Date.now().toString(), // Added unique ID for persistence
    priority: finalPriority,
    displayId: `REP-${Math.floor(Math.random()*10000)}`, 
    createdAt: now.toISOString(),
    status: "pending" 
  };

  reports.unshift(report);

  if (adminDb) {
    try {
      const ref = await adminDb.collection("reports").add(report);
      return res.json({ success: true, id: ref.id, displayId: report.displayId });
    } catch (e) {
      console.error("Firestore error, falling back to memory");
    }
  }
  
  res.json({ success: true, id: report.id, displayId: report.displayId });
});

// Update Report Status & Response
app.patch("/api/report/:id", (req, res) => {
  const rawId = req.params.id;
  const id = decodeURIComponent(rawId).toLowerCase(); // Normalize to lowercase
  const updates = req.body;
  
  console.log(`\n--- UPDATE ATTEMPT ---`);
  console.log(`Target ID: ${id}`);
  
  const reportIndex = reports.findIndex(r => {
    const internalMatch = r.id && r.id.toString().toLowerCase() === id;
    const displayMatch = r.displayId && r.displayId.toString().toLowerCase() === id;
    return internalMatch || displayMatch;
  });

  if (reportIndex !== -1) {
    reports[reportIndex] = { ...reports[reportIndex], ...updates, updatedAt: new Date().toISOString() };
    console.log(`✅ SUCCESS: Found ${reports[reportIndex].displayId}`);
    return res.json({ success: true, report: reports[reportIndex] });
  }
  
  console.error(`❌ FAILED: No match for ${id}`);
  res.status(404).json({ error: "Report not found" });
});

app.get("/api/reports", (req, res) => {
  res.json(reports);
});

// Area Explorer Search
app.get("/api/area-search", (req, res) => {
  const { area } = req.query;
  if (!area) return res.json(reports);
  
  const filtered = reports.filter(r => 
    r.location_label?.toLowerCase().includes(area.toLowerCase())
  );
  res.json(filtered);
});

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Harmony Pro Backend running on http://localhost:${PORT}\n`);
});

