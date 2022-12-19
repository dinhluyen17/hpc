export const QUANTUM_MESSAGE_FROM = 'quantum_composer'
export const VUEJS_MESSAGE_FROM = 'vuejs'

const RECEIVE_SETUP_FINISH = 'setup_finish'
const RECEIVE_SAVE_CIRCUIT_JSON = 'save_circuit_json'
const RECEIVE_CURRENT_CIRCUIT_JSON = 'get_current_circuit_json'

const SEND_LOADED_CIRCUIT_JSON = 'loaded_circuit_json'
const SEND_GET_CIRCUIT_JSON = 'get_circuit_json'

const MESSAGE = {
    //Send
    loadedCircuitJson: SEND_LOADED_CIRCUIT_JSON,
    getCircuitJson: SEND_GET_CIRCUIT_JSON,
    //Receive
    setupFinish: RECEIVE_SETUP_FINISH,
    saveCircuitJson: RECEIVE_SAVE_CIRCUIT_JSON,
    getCurrentCircuitJson: RECEIVE_CURRENT_CIRCUIT_JSON,
}

export default MESSAGE