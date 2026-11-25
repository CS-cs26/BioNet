const EMBEDDED_DRUGS = [
  { name: "Metformin", category: "Antidiabetic", clearance: "renal", renal_elimination_rate: 0.90, hepatic_toxicity: 0.10, safe_alternatives: ["Sitagliptin", "Empagliflozin"] },
  { name: "Lisinopril", category: "ACE Inhibitor", clearance: "renal", renal_elimination_rate: 0.85, hepatic_toxicity: 0.05, safe_alternatives: ["Amlodipine"] },
  { name: "Ibuprofen", category: "NSAID", clearance: "mixed", renal_elimination_rate: 0.65, hepatic_toxicity: 0.20, safe_alternatives: ["Acetaminophen", "Topical Diclofenac"] },
  { name: "Atorvastatin", category: "Statin", clearance: "hepatic", renal_elimination_rate: 0.10, hepatic_toxicity: 0.50, safe_alternatives: ["Pravastatin", "Rosuvastatin"] },
  { name: "Clopidogrel", category: "Antiplatelet", clearance: "hepatic", renal_elimination_rate: 0.50, hepatic_toxicity: 0.30, safe_alternatives: ["Prasugrel"] },
  { name: "Amiodarone", category: "Antiarrhythmic", clearance: "hepatic", renal_elimination_rate: 0.05, hepatic_toxicity: 0.80, safe_alternatives: ["Dronedarone"] },
  { name: "Warfarin", category: "Anticoagulant", clearance: "hepatic", renal_elimination_rate: 0.15, hepatic_toxicity: 0.40, safe_alternatives: ["Apixaban", "Dabigatran"] },
  { name: "Spironolactone", category: "Potassium-sparing Diuretic", clearance: "renal", renal_elimination_rate: 0.70, hepatic_toxicity: 0.10, safe_alternatives: ["Furosemide"] },
  { name: "Omeprazole", category: "PPI", clearance: "hepatic", renal_elimination_rate: 0.20, hepatic_toxicity: 0.25, safe_alternatives: ["Famotidine", "Pantoprazole"] },
  { name: "Digoxin", category: "Cardiac Glycoside", clearance: "renal", renal_elimination_rate: 0.80, hepatic_toxicity: 0.10, safe_alternatives: ["Bisoprolol"] },
  { name: "Levothyroxine", category: "Thyroid Hormone", clearance: "hepatic", renal_elimination_rate: 0.10, hepatic_toxicity: 0.15, safe_alternatives: ["Liothyronine"] },
  { name: "Methotrexate", category: "Immunosuppressant", clearance: "renal", renal_elimination_rate: 0.85, hepatic_toxicity: 0.75, safe_alternatives: ["Leflunomide", "Sulfasalazine"] },
  { name: "Ciprofloxacin", category: "Fluoroquinolone Antibiotic", clearance: "renal", renal_elimination_rate: 0.70, hepatic_toxicity: 0.35, safe_alternatives: ["Amoxicillin-Clavulanate", "Cefuroxime"] },
  { name: "Simvastatin", category: "Statin", clearance: "hepatic", renal_elimination_rate: 0.15, hepatic_toxicity: 0.60, safe_alternatives: ["Pravastatin"] },
  { name: "Fluconazole", category: "Antifungal", clearance: "renal", renal_elimination_rate: 0.80, hepatic_toxicity: 0.55, safe_alternatives: ["Terbinafine", "Nystatin"] },
  { name: "Carbamazepine", category: "Anticonvulsant", clearance: "hepatic", renal_elimination_rate: 0.30, hepatic_toxicity: 0.65, safe_alternatives: ["Levetiracetam", "Lamotrigine"] },
  { name: "Sertraline", category: "SSRI Antidepressant", clearance: "hepatic", renal_elimination_rate: 0.20, hepatic_toxicity: 0.25, safe_alternatives: ["Escitalopram"] },
  { name: "Tramadol", category: "Opioid Analgesic", clearance: "mixed", renal_elimination_rate: 0.60, hepatic_toxicity: 0.30, safe_alternatives: ["Acetaminophen", "Codeine"] },
  { name: "Clarithromycin", category: "Macrolide Antibiotic", clearance: "hepatic", renal_elimination_rate: 0.40, hepatic_toxicity: 0.50, safe_alternatives: ["Azithromycin"] },
  { name: "Allopurinol", category: "Xanthine Oxidase Inhibitor", clearance: "renal", renal_elimination_rate: 0.80, hepatic_toxicity: 0.20, safe_alternatives: ["Febuxostat"] }
];

const EMBEDDED_INTERACTIONS = [
  { source: "Lisinopril", target: "Spironolactone", base_risk: 0.85, description: "خطر تآزري لارتفاع حاد في بوتاسيوم الدم مع سمية كلوية" },
  { source: "Lisinopril", target: "Ibuprofen", base_risk: 0.75, description: "تثبيط البروستاجلاندين الكلوي مما يعطل التروية الكلوية" },
  { source: "Warfarin", target: "Amiodarone", base_risk: 0.90, description: "تثبيط استقلاب الوارفارين التراكمي وتفاقم خطر النزيف المميت" },
  { source: "Warfarin", target: "Ibuprofen", base_risk: 0.80, description: "مضاعفة احتمالية تقرح ونزيف الجهاز الهضمي الحاد" },
  { source: "Clopidogrel", target: "Omeprazole", base_risk: 0.70, description: "منع تحول الكلوبيدوجريل لشكله الفعال وفقدان الحماية القلبية" },
  { source: "Digoxin", target: "Amiodarone", base_risk: 0.85, description: "مضاعفة تركيز الديجوكسين السمي في البلازما" },
  { source: "Spironolactone", target: "Ibuprofen", base_risk: 0.65, description: "تراجع كفاءة إدرار البول واحتباس السوائل" },
  { source: "Methotrexate", target: "Ibuprofen", base_risk: 0.88, description: "تثبيط إخراج الميثوتريكسات الكلوي مسبباً تثبيطاً حاداً لنخاع العظم" },
  { source: "Simvastatin", target: "Amiodarone", base_risk: 0.82, description: "خطر انحلال الربيدات العضلي والفشل الكلوي الحاد" },
  { source: "Simvastatin", target: "Clarithromycin", base_risk: 0.87, description: "ارتفاع تركيز الستاتين بشكل سام وحدوث اعتلال عضلي حاد" },
  { source: "Warfarin", target: "Fluconazole", base_risk: 0.86, description: "ارتفاع حاد في تميع الدم وتضاعف مؤشر INR لنزيف تلقائي" },
  { source: "Sertraline", target: "Tramadol", base_risk: 0.80, description: "خطر متلازمة السيروتونين المهددة للحياة مع نوبات صرعية" },
  { source: "Ciprofloxacin", target: "Warfarin", base_risk: 0.72, description: "تثبيط استقلاب الوارفارين مع تدمير بكتيريا فيتامين K المعوية" },
  { source: "Carbamazepine", target: "Warfarin", base_risk: 0.78, description: "تسريع هدم الوارفارين بدرجة عنيفة وفقدان التمييع وظهور جلطات" },
  { source: "Digoxin", target: "Clarithromycin", base_risk: 0.83, description: "تراكم سمية الديجوكسين القلبية وحدوث بطء نبض مميت" },
  { source: "Metformin", target: "Ciprofloxacin", base_risk: 0.68, description: "تراجع إخراج الميتفورمين واحتمالية الحماض اللبني (Lactic Acidosis)" }
];

const DEFAULT_PATIENTS = [
  { national_id: "1001", name: "عبدالله محمد السعيد", age: 74, gender: "ذكر", gfr: 32.0, liver_alt: 42.0, pgx_profile: "Normal", chronic_diseases: ["فشل قلبي مزمن", "ارتفاع ضغط الدم", "قصور كلوي من الدرجة الرابعة"], current_medications: ["Lisinopril", "Spironolactone", "Digoxin"] },
  { national_id: "1002", name: "فاطمة أحمد الشهري", age: 66, gender: "أنثى", gfr: 76.0, liver_alt: 118.0, pgx_profile: "Poor Metabolizer", chronic_diseases: ["رجفان أذيني", "دهون الدم", "تدهن الكبد غير الكحولي"], current_medications: ["Warfarin", "Amiodarone", "Atorvastatin"] },
  { national_id: "1003", name: "سعد ناصر الدوسري", age: 58, gender: "ذكر", gfr: 88.0, liver_alt: 30.0, pgx_profile: "Normal", chronic_diseases: ["السكري النوع الثاني", "احتشاء عضلة القلب القديم"], current_medications: ["Metformin", "Clopidogrel", "Omeprazole"] },
  { national_id: "1004", name: "نورة عبدالعزيز العتيبي", age: 34, gender: "أنثى", gfr: 105.0, liver_alt: 22.0, pgx_profile: "Normal", chronic_diseases: ["التهاب المفاصل الروماتويدي", "خمول الغدة الدرقية"], current_medications: ["Methotrexate", "Levothyroxine"] },
  { national_id: "1005", name: "خالد بن سلطان الغامدي", age: 28, gender: "ذكر", gfr: 112.0, liver_alt: 26.0, pgx_profile: "Rapid Metabolizer", chronic_diseases: ["اكتئاب سريري مزمن", "ألم عصبي ناتج عن إصابة"], current_medications: ["Sertraline", "Tramadol"] },
  { national_id: "1006", name: "حصة إبراهيم القحطاني", age: 81, gender: "أنثى", gfr: 28.0, liver_alt: 85.0, pgx_profile: "Poor Metabolizer", chronic_diseases: ["فشل قلبي احتقاني", "قصور كبدي وكلوي متقدم", "نقرس"], current_medications: ["Digoxin", "Allopurinol", "Spironolactone", "Simvastatin"] },
  { national_id: "1007", name: "عمر ياسر الحربي", age: 46, gender: "ذكر", gfr: 82.0, liver_alt: 65.0, pgx_profile: "Normal", chronic_diseases: ["صرع جزئي مستقر", "جلطة وريدية سابقة"], current_medications: ["Carbamazepine", "Warfarin"] }
];

function getStoredPatients() {
  const saved = localStorage.getItem("bionet_patients");
  if (!saved) {
    localStorage.setItem("bionet_patients", JSON.stringify(DEFAULT_PATIENTS));
    return [...DEFAULT_PATIENTS];
  }
  return JSON.parse(saved);
}

const ApiClient = {
  async getDrugs() {
    return EMBEDDED_DRUGS.map(d => d.name);
  },

  async getAllPatients() {
    return getStoredPatients();
  },

  async getPatient(nationalId) {
    const patient = getStoredPatients().find(p => p.national_id === nationalId);
    if (!patient) throw new Error("السجل غير متوفر لرقم الهوية هذا");
    return patient;
  },

  async getPatientFhir(nationalId) {
    const patient = await this.getPatient(nationalId);
    return {
      resourceType: "Bundle",
      type: "collection",
      entry: [
        {
          resource: {
            resourceType: "Patient",
            id: patient.national_id,
            identifier: [{ system: "http://nphies.sa/identifier/national-id", value: patient.national_id }],
            name: [{ text: patient.name }],
            gender: patient.gender === "ذكر" ? "male" : "female"
          }
        },
        {
          resource: {
            resourceType: "Observation",
            code: { text: "Glomerular Filtration Rate (GFR)" },
            valueQuantity: { value: patient.gfr, unit: "mL/min/1.73m2" }
          }
        },
        {
          resource: {
            resourceType: "Observation",
            code: { text: "Alanine Aminotransferase (ALT)" },
            valueQuantity: { value: patient.liver_alt, unit: "U/L" }
          }
        },
        {
          resource: {
            resourceType: "MedicationStatement",
            status: "active",
            medicationCodeableConcept: { text: patient.current_medications.join(", ") }
          }
        }
      ]
    };
  },

  async createPatient(patientData) {
    const records = getStoredPatients();
    if (records.some(p => p.national_id === patientData.national_id)) {
      throw new Error("رقم الهوية مسجل مسبقاً لمريض آخر");
    }
    records.push(patientData);
    localStorage.setItem("bionet_patients", JSON.stringify(records));
    return { status: "success", patient: patientData };
  },

  async deletePatient(nationalId) {
    const records = getStoredPatients();
    const updated = records.filter(p => p.national_id !== nationalId);
    localStorage.setItem("bionet_patients", JSON.stringify(updated));
    return { status: "success" };
  },

  async runSimulation(payload) {
    const meds = payload.medications;
    const bio = payload.bio_twin;
    const drugsMap = Object.fromEntries(EMBEDDED_DRUGS.map(d => [d.name, d]));

    const activeDrugsData = meds.map(d => drugsMap[d] || {
      name: d, category: "General", clearance: "mixed",
      renal_elimination_rate: 0.2, hepatic_toxicity: 0.2, safe_alternatives: []
    });

    const edges = EMBEDDED_INTERACTIONS.filter(
      e => meds.includes(e.source) && meds.includes(e.target)
    );

    const renalLoad = activeDrugsData.reduce((acc, d) => acc + d.renal_elimination_rate, 0);
    const hepaticLoad = activeDrugsData.reduce((acc, d) => acc + d.hepatic_toxicity, 0);

    const renalMult = bio.gfr < 30 ? 2.4 : (bio.gfr < 60 ? 1.7 : (bio.gfr < 90 ? 1.2 : 1.0));
    const hepaticMult = bio.liver_alt > 100 ? 2.0 : (bio.liver_alt > 50 ? 1.4 : 1.0);
    const ageImpact = 1.0 + (Math.max(0, bio.age - 50) * 0.012);

    const renalStress = Math.min(100.0, Number(((renalLoad * 22.0) * renalMult * ageImpact).toFixed(2)));
    const hepaticStress = Math.min(100.0, Number(((hepaticLoad * 20.0) * hepaticMult * ageImpact).toFixed(2)));

    let baseCpi = 5.0;
    if (meds.length >= 2 || edges.length > 0) {
      const netRisk = edges.reduce((acc, e) => acc + e.base_risk, 0) * 24.0;
      const density = 1.0 + (edges.length / Math.max(1, meds.length));
      const organComp = (renalStress + hepaticStress) / 2.0;
      baseCpi = (netRisk * 0.45 * density) + (organComp * 0.55);
    }

    const timeDecay = Math.max(0.35, 1.0 - ((payload.dosing_interval_hours || 0) * 0.08));
    const pgxMult = bio.pgx_profile === "Poor Metabolizer" ? 1.35 : (bio.pgx_profile === "Rapid Metabolizer" ? 0.85 : 1.0);
    const cpiScore = Math.min(99.9, Number((baseCpi * timeDecay * pgxMult).toFixed(1)));

    const highRiskDrugs = new Set();
    edges.forEach(e => {
      if (e.base_risk >= 0.70) {
        highRiskDrugs.add(e.source);
        highRiskDrugs.add(e.target);
      }
    });

    const recommendations = [];
    highRiskDrugs.forEach(drugName => {
      const info = drugsMap[drugName];
      if (info && info.safe_alternatives && info.safe_alternatives.length > 0) {
        recommendations.push({
          critical_drug: drugName,
          reason: `مرتبط بتداخلات حرجة وإخراج عضوي مرتفع (${info.clearance})`,
          suggested_alternatives: info.safe_alternatives
        });
      }
    });

    const nodes = activeDrugsData.map(d => ({
      id: d.name,
      label: d.name,
      group: highRiskDrugs.has(d.name) ? "culprit" : "safe",
      category: d.category
    }));

    const edgeList = edges.map(e => ({
      from: e.source,
      to: e.target,
      label: `${Math.round(e.base_risk * 100)}%`,
      title: e.description,
      risk: e.base_risk
    }));

    const riskLevel = cpiScore >= 70.0 ? "CRITICAL" : (cpiScore >= 40.0 ? "ELEVATED" : "OPTIMAL");

    return {
      cumulative_risk_score: cpiScore,
      risk_level: riskLevel,
      organ_stress: {
        renal_stress_score: renalStress,
        hepatic_stress_score: hepaticStress,
        renal_multiplier: renalMult,
        hepatic_multiplier: hepaticMult
      },
      graph_data: { nodes, edges: edgeList },
      critical_interactions: edges,
      clinical_recommendations: recommendations
    };
  }
};