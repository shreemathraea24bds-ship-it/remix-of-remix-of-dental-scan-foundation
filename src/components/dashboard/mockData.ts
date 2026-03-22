export interface PatientScan {
  id: string;
  patientName: string;
  maskedName: string;
  scanType: string;
  urgency: "red" | "amber" | "green";
  status: "pending" | "reviewed" | "referred";
  submittedAt: Date;
  imageUrl?: string;
  consultationPaid: boolean;
  doctorAccessPaid: boolean;
  chiefComplaint?: string;
  patientAge?: number;
  patientGender?: string;
  patientContact?: string;
  aiAnalysis: {
    lesionSizeMm: number;
    lesionTrend: number[];
    colorDelta: string;
    probabilities: { condition: string; probability: number }[];
    plaqueCoverage: number;
    brushingEfficiency: number;
  };
  notes?: string;
}

const now = Date.now();
const hour = 3600000;

export const mockScans: PatientScan[] = [
  {
    id: "s1",
    patientName: "Maria Gonzales",
    maskedName: "M****** G*******",
    scanType: "14-Day Lesion Tracking",
    urgency: "red",
    status: "pending",
    submittedAt: new Date(now - 2 * hour),
    consultationPaid: true,
    doctorAccessPaid: false,
    chiefComplaint: "Sharp pain when drinking cold water on the lower left side. Noticed a white patch inside cheek 2 weeks ago that hasn't healed.",
    patientAge: 42,
    patientGender: "Female",
    patientContact: "+91 98765 43210",
    aiAnalysis: {
      lesionSizeMm: 5.2,
      lesionTrend: [4.5, 4.6, 4.8, 4.9, 5.0, 5.1, 5.1, 5.0, 5.1, 5.2, 5.2, 5.2, 5.2, 5.2],
      colorDelta: "#C0392B → #E74C3C",
      probabilities: [
        { condition: "Aphthous Ulcer", probability: 0.08 },
        { condition: "Squamous Cell Carcinoma", probability: 0.92 },
      ],
      plaqueCoverage: 34,
      brushingEfficiency: 66,
    },
  },
  {
    id: "s2",
    patientName: "James Chen",
    maskedName: "J**** C***",
    scanType: "Emergency Pulpitis Scan",
    urgency: "red",
    status: "pending",
    submittedAt: new Date(now - 45 * 60000),
    consultationPaid: true,
    doctorAccessPaid: false,
    chiefComplaint: "Extreme throbbing pain in upper right molar, keeping me awake at night. Pain worsens when lying down.",
    patientAge: 31,
    patientGender: "Male",
    patientContact: "+91 87654 32109",
    aiAnalysis: {
      lesionSizeMm: 0,
      lesionTrend: [],
      colorDelta: "N/A",
      probabilities: [
        { condition: "Acute Pulpitis", probability: 0.88 },
        { condition: "Periapical Abscess", probability: 0.12 },
      ],
      plaqueCoverage: 22,
      brushingEfficiency: 78,
    },
  },
  {
    id: "s3",
    patientName: "Sarah Williams",
    maskedName: "S**** W*******",
    scanType: "General Oral Scan",
    urgency: "amber",
    status: "pending",
    submittedAt: new Date(now - 5 * hour),
    consultationPaid: false,
    doctorAccessPaid: false,
    chiefComplaint: "Gums bleed when brushing, noticed some receding on front teeth.",
    patientAge: 28,
    patientGender: "Female",
    patientContact: "+91 76543 21098",
    aiAnalysis: {
      lesionSizeMm: 2.1,
      lesionTrend: [2.8, 2.6, 2.4, 2.3, 2.2, 2.1],
      colorDelta: "#E67E22 → #F1C40F",
      probabilities: [
        { condition: "Aphthous Ulcer", probability: 0.85 },
        { condition: "Oral Lichen Planus", probability: 0.15 },
      ],
      plaqueCoverage: 18,
      brushingEfficiency: 82,
    },
  },
  {
    id: "s4",
    patientName: "Robert Kim",
    maskedName: "R***** K**",
    scanType: "Routine Check",
    urgency: "green",
    status: "reviewed",
    submittedAt: new Date(now - 24 * hour),
    consultationPaid: true,
    doctorAccessPaid: true,
    patientAge: 55,
    patientGender: "Male",
    patientContact: "+91 65432 10987",
    aiAnalysis: {
      lesionSizeMm: 0,
      lesionTrend: [],
      colorDelta: "N/A",
      probabilities: [{ condition: "Healthy", probability: 0.97 }],
      plaqueCoverage: 8,
      brushingEfficiency: 92,
    },
  },
  {
    id: "s5",
    patientName: "Elena Petrov",
    maskedName: "E**** P*****",
    scanType: "14-Day Lesion Tracking",
    urgency: "amber",
    status: "pending",
    submittedAt: new Date(now - 8 * hour),
    consultationPaid: true,
    doctorAccessPaid: false,
    chiefComplaint: "My daughter has a sore on her tongue that has been there for 10 days. It's slightly bigger now.",
    patientAge: 8,
    patientGender: "Female",
    patientContact: "+91 54321 09876",
    aiAnalysis: {
      lesionSizeMm: 3.4,
      lesionTrend: [3.8, 3.7, 3.6, 3.5, 3.5, 3.4, 3.4, 3.4],
      colorDelta: "#D35400 → #E67E22",
      probabilities: [
        { condition: "Traumatic Ulcer", probability: 0.72 },
        { condition: "Aphthous Ulcer", probability: 0.28 },
      ],
      plaqueCoverage: 26,
      brushingEfficiency: 74,
    },
  },
];

// Demo/Sandbox patient for new doctors to practice
export const demoScan: PatientScan = {
  id: "demo-1",
  patientName: "Hunter Test-Case (DEMO)",
  maskedName: "H***** T****-C*** 🎮",
  scanType: "Monster Hunter AI Scan",
  urgency: "amber",
  status: "pending",
  submittedAt: new Date(now - 30 * 60000),
  consultationPaid: true,
  doctorAccessPaid: true,
  chiefComplaint: "Demo: Child completed a 7-day Monster Hunter streak. AI detected 3 monster zones with 1 suspicious lesion on lower-left molar. This is a sandbox report — no real patient data.",
  patientAge: 9,
  patientGender: "Male",
  patientContact: "+91 00000 00000 (DEMO)",
  aiAnalysis: {
    lesionSizeMm: 2.8,
    lesionTrend: [3.2, 3.1, 3.0, 2.9, 2.9, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.7, 2.8],
    colorDelta: "#E67E22 → #F39C12",
    probabilities: [
      { condition: "Early Caries (Stage 1)", probability: 0.65 },
      { condition: "Enamel Stain", probability: 0.25 },
      { condition: "Healthy Enamel", probability: 0.10 },
    ],
    plaqueCoverage: 22,
    brushingEfficiency: 78,
  },
  notes: "🎮 SANDBOX MODE: This is a demo patient from the Monster Hunter game. Use this report to practice the Private Password (dentascan2024), Time-Travel Slider, and AI Overrule tools. No charges apply.",
};
