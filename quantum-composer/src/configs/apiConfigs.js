const API_BASE_URL = "http://0.0.0.0:8000";

const apiConfig = {
    API_JSON_TO_QASM: `${API_BASE_URL}/json-to-qasm`,
    API_QASM_TO_JSON: `${API_BASE_URL}/qasm-to-json`,
    API_BAR_CHART: `${API_BASE_URL}/return-histogram`,
    API_TABLE: `${API_BASE_URL}/return-sim-data`,
    API_SAVE_HISTORY: `${API_BASE_URL}/save-to-history`,
    API_QSPHERE: `${API_BASE_URL}/return-qsphere`
}

export default apiConfig;