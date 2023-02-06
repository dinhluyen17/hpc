const API_BASE_URL = "http://0.0.0.0:8000";
const API_JSON_TO_QASM = `${API_BASE_URL}/json-to-qasm`;
const API_QASM_TO_JSON = `${API_BASE_URL}/qasm-to-json`;
const API_BAR_CHART = `${API_BASE_URL}/return-histogram`;
const API_TABLE = `${API_BASE_URL}/return-sim-data`;
const API_SAVE_HISTORY = `${API_BASE_URL}/save-to-history`;
const API_TOKEN = `${API_BASE_URL}/token`;
const API_QSPHERE = `${API_BASE_URL}/return-qsphere`;

export {
    API_JSON_TO_QASM,
    API_QASM_TO_JSON,
    API_BAR_CHART,
    API_TABLE,
    API_SAVE_HISTORY,
    API_TOKEN,
    API_QSPHERE
};