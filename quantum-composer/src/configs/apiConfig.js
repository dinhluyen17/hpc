const BACKEND_BASE_URL = "http://0.0.0.0:8000";

const backendApiConfig = {
  API_RETURN_HISTORY: `${BACKEND_BASE_URL}/return-histogram`, //Data for bar chart API
  API_SIM_DATA: `${BACKEND_BASE_URL}/return-sim-data`, //Simulate tab table API
  API_SAVE_HISTORY: `${BACKEND_BASE_URL}/save-to-history`, //Save history API
  API_JSON_TO_QASM: `${BACKEND_BASE_URL}/json-to-qasm`, //Json to Qasm API
  API_QASM_TO_JSON: `${BACKEND_BASE_URL}/qasm-to-json`, // QASM to JSON API
};

export default backendApiConfig;