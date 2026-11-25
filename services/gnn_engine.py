import json
from typing import List, Dict, Any, Tuple
import networkx as nx
from config.settings import DRUG_DATA_PATH

class PharmaGNN:
    def __init__(self):
        with open(DRUG_DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        self.drugs_raw = data.get("drugs", [])
        self.interactions_raw = data.get("interactions", [])
        self.drugs_map = {d["name"]: d for d in self.drugs_raw}
        
        self.graph = nx.Graph()
        self._build_network()

    def _build_network(self) -> None:
        for d in self.drugs_raw:
            self.graph.add_node(
                d["name"],
                clearance=d["clearance"],
                renal_rate=d["renal_elimination_rate"],
                hepatic_rate=d["hepatic_toxicity"],
                alternatives=d.get("safe_alternatives", [])
            )
        for edge in self.interactions_raw:
            self.graph.add_edge(
                edge["source"],
                edge["target"],
                base_risk=edge["base_risk"],
                pathway=edge["pathway"],
                description=edge["description"]
            )

    def extract_subgraph(self, active_drugs: List[str]) -> Tuple[nx.Graph, List[Dict[str, Any]]]:
        valid_nodes = [d for d in active_drugs if d in self.graph]
        subgraph = self.graph.subgraph(valid_nodes).copy()
        
        detected_edges = []
        for u, v, data in subgraph.edges(data=True):
            detected_edges.append({
                "source": u,
                "target": v,
                "base_risk": data.get("base_risk", 0.5),
                "pathway": data.get("pathway", "Unspecified"),
                "description": data.get("description", "")
            })
        return subgraph, detected_edges

    def get_all_drug_names(self) -> List[str]:
        return list(self.drugs_map.keys())