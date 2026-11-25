import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from config.settings import PATIENTS_DATA_PATH, SERVER_HOST, SERVER_PORT
from models.schemas import SimulationRequest, SimulationResponse
from services.gnn_engine import PharmaGNN
from services.bio_twin import BioTwinEngine

app = FastAPI(title="BioNet Core Services", version="2.5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gnn = PharmaGNN()

def load_patients_data():
    with open(PATIENTS_DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_patients_data(data):
    with open(PATIENTS_DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

class NewPatientRequest(BaseModel):
    national_id: str
    name: str
    age: int = Field(..., ge=1, le=120)
    gender: str
    gfr: float = Field(..., ge=0.0, le=200.0)
    liver_alt: float = Field(..., ge=0.0, le=1000.0)
    pgx_profile: Optional[str] = "Normal"
    chronic_diseases: List[str]
    current_medications: List[str]

@app.get("/api/drugs")
async def list_drugs():
    return gnn.get_all_drug_names()

@app.get("/api/patients/all")
async def fetch_all_patients():
    return load_patients_data()

@app.get("/api/patients/{national_id}")
async def fetch_patient_record(national_id: str):
    records = load_patients_data()
    for patient in records:
        if patient["national_id"] == national_id:
            return patient
    raise HTTPException(status_code=404, detail="السجل الطبي غير موجود")

@app.get("/api/patients/{national_id}/fhir")
async def get_patient_fhir(national_id: str):
    records = load_patients_data()
    patient = next((p for p in records if p["national_id"] == national_id), None)
    if not patient:
        raise HTTPException(status_code=404, detail="السجل الطبي غير موجود")

    fhir_bundle = {
        "resourceType": "Bundle",
        "type": "collection",
        "entry": [
            {
                "resource": {
                    "resourceType": "Patient",
                    "id": patient["national_id"],
                    "identifier": [
                        {
                            "system": "http://nphies.sa/identifier/national-id",
                            "value": patient["national_id"]
                        }
                    ],
                    "name": [{"text": patient["name"]}],
                    "gender": "male" if patient["gender"] == "ذكر" else "female"
                }
            },
            {
                "resource": {
                    "resourceType": "Observation",
                    "code": {"text": "Glomerular Filtration Rate (GFR)"},
                    "valueQuantity": {"value": patient["gfr"], "unit": "mL/min/1.73m2"}
                }
            },
            {
                "resource": {
                    "resourceType": "Observation",
                    "code": {"text": "Alanine Aminotransferase (ALT)"},
                    "valueQuantity": {"value": patient["liver_alt"], "unit": "U/L"}
                }
            },
            {
                "resource": {
                    "resourceType": "MedicationStatement",
                    "status": "active",
                    "medicationCodeableConcept": {
                        "text": ", ".join(patient["current_medications"])
                    }
                }
            }
        ]
    }
    return fhir_bundle

@app.post("/api/patients")
async def create_patient(patient_data: NewPatientRequest):
    records = load_patients_data()
    for p in records:
        if p["national_id"] == patient_data.national_id:
            raise HTTPException(status_code=400, detail="رقم الهوية مسجل مسبقاً لمريض آخر")

    new_record = patient_data.model_dump()
    records.append(new_record)
    save_patients_data(records)
    return {"status": "success", "message": "تم تسجيل المريض بنجاح", "patient": new_record}

@app.delete("/api/patients/{national_id}")
async def delete_patient(national_id: str):
    records = load_patients_data()
    updated_records = [p for p in records if p["national_id"] != national_id]
    if len(updated_records) == len(records):
        raise HTTPException(status_code=404, detail="المريض غير موجود لحذفه")
    save_patients_data(updated_records)
    return {"status": "success", "message": f"تم حذف سجل المريض ذو الهوية {national_id} بنجاح"}

@app.post("/api/simulate", response_model=SimulationResponse)
async def simulate(payload: SimulationRequest):
    subgraph, edges = gnn.extract_subgraph(payload.medications)
    
    active_drugs_data = []
    for d in payload.medications:
        if d in gnn.drugs_map:
            active_drugs_data.append(gnn.drugs_map[d])
        else:
            active_drugs_data.append({
                "name": d,
                "category": "General",
                "clearance": "mixed",
                "renal_elimination_rate": 0.3,
                "hepatic_toxicity": 0.3,
                "safe_alternatives": []
            })

    stress_metrics = BioTwinEngine.evaluate_stress(payload.bio_twin, active_drugs_data)
    
    time_spacing = getattr(payload, 'dosing_interval_hours', 0.0) or 0.0
    pgx = getattr(payload.bio_twin, 'pgx_profile', 'Normal') or 'Normal'

    time_decay = max(0.35, 1.0 - (time_spacing * 0.08))
    
    pgx_multiplier = 1.0
    if pgx == "Poor Metabolizer":
        pgx_multiplier = 1.35
    elif pgx == "Rapid Metabolizer":
        pgx_multiplier = 0.85

    base_cpi = BioTwinEngine.calculate_cpi(edges, stress_metrics, len(payload.medications))
    cpi_score = min(99.9, round(base_cpi * time_decay * pgx_multiplier, 1))

    high_risk_drugs = set()
    for e in edges:
        if e["base_risk"] >= 0.70:
            high_risk_drugs.add(e["source"])
            high_risk_drugs.add(e["target"])

    recommendations = []
    for drug_name in high_risk_drugs:
        info = gnn.drugs_map.get(drug_name)
        if info and info.get("safe_alternatives"):
            recommendations.append({
                "critical_drug": drug_name,
                "reason": f"مرتبط بتداخلات حرجة وإخراج عضوي مرتفع ({info.get('clearance', 'mixed')})",
                "suggested_alternatives": info["safe_alternatives"]
            })

    nodes = [
        {
            "id": d["name"],
            "label": d["name"],
            "group": "culprit" if d["name"] in high_risk_drugs else "safe",
            "category": d.get("category", "General")
        }
        for d in active_drugs_data
    ]

    edge_list = [
        {
            "from": e["source"],
            "to": e["target"],
            "label": f"{int(e['base_risk'] * 100)}%",
            "title": e["description"],
            "risk": e["base_risk"]
        }
        for e in edges
    ]

    risk_level = "CRITICAL" if cpi_score >= 70.0 else ("ELEVATED" if cpi_score >= 40.0 else "OPTIMAL")

    return {
        "cumulative_risk_score": cpi_score,
        "risk_level": risk_level,
        "organ_stress": stress_metrics,
        "graph_data": {"nodes": nodes, "edges": edge_list},
        "critical_interactions": edges,
        "clinical_recommendations": recommendations
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host=SERVER_HOST, port=SERVER_PORT, reload=True)