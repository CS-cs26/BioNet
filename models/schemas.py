from typing import List, Optional
from pydantic import BaseModel, Field

class BioTwinProfile(BaseModel):
    age: int = Field(..., ge=1, le=120)
    gfr: float = Field(..., ge=0.0, le=200.0)
    liver_alt: float = Field(..., ge=0.0, le=1000.0)
    pgx_profile: Optional[str] = "Normal"

class SimulationRequest(BaseModel):
    patient_id: Optional[str] = None
    medications: List[str]
    bio_twin: BioTwinProfile
    dosing_interval_hours: Optional[float] = 0.0

class OrganStressResponse(BaseModel):
    renal_stress_score: float
    hepatic_stress_score: float
    renal_multiplier: float
    hepatic_multiplier: float

class RecommendationResponse(BaseModel):
    critical_drug: str
    reason: str
    suggested_alternatives: List[str]

class SimulationResponse(BaseModel):
    cumulative_risk_score: float
    risk_level: str
    organ_stress: OrganStressResponse
    graph_data: dict
    critical_interactions: list
    clinical_recommendations: List[RecommendationResponse]