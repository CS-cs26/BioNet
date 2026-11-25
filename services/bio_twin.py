from typing import List, Dict, Any
from models.schemas import BioTwinProfile

class BioTwinEngine:
    @staticmethod
    def evaluate_stress(bio: BioTwinProfile, active_drugs: List[Dict[str, Any]]) -> Dict[str, float]:
        renal_load = sum(d.get("renal_elimination_rate", 0.1) for d in active_drugs)
        hepatic_load = sum(d.get("hepatic_toxicity", 0.1) for d in active_drugs)

        if bio.gfr < 30.0:
            renal_mult = 2.4
        elif bio.gfr < 60.0:
            renal_mult = 1.7
        elif bio.gfr < 90.0:
            renal_mult = 1.2
        else:
            renal_mult = 1.0

        if bio.liver_alt > 100.0:
            hepatic_mult = 2.0
        elif bio.liver_alt > 50.0:
            hepatic_mult = 1.4
        else:
            hepatic_mult = 1.0

        age_impact = 1.0 + (max(0, bio.age - 50) * 0.012)

        renal_stress = min(100.0, (renal_load * 22.0) * renal_mult * age_impact)
        hepatic_stress = min(100.0, (hepatic_load * 20.0) * hepatic_mult * age_impact)

        return {
            "renal_stress_score": round(renal_stress, 2),
            "hepatic_stress_score": round(hepatic_stress, 2),
            "renal_multiplier": renal_mult,
            "hepatic_multiplier": hepatic_mult
        }

    @staticmethod
    def calculate_cpi(edges: List[Dict[str, Any]], organ_metrics: Dict[str, float], total_drugs: int) -> float:
        if total_drugs < 2 and not edges:
            return 5.0

        network_risk_component = sum(e["base_risk"] for e in edges) * 24.0
        density_factor = 1.0 + (len(edges) / max(1, total_drugs))
        organ_component = (organ_metrics["renal_stress_score"] + organ_metrics["hepatic_stress_score"]) / 2.0

        raw_index = (network_risk_component * 0.45 * density_factor) + (organ_component * 0.55)
        return min(99.9, round(raw_index, 1))