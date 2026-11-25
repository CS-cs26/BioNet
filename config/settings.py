import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = os.path.join(BASE_DIR, "data")

DRUG_DATA_PATH = os.path.join(DATA_DIR, "drug_graph_data.json")
PATIENTS_DATA_PATH = os.path.join(DATA_DIR, "mock_patients.json")

SERVER_HOST = "127.0.0.1"
SERVER_PORT = 8000