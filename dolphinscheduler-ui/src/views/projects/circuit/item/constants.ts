export const QUANTUM_MESSAGE_FROM = 'quantum_composer'
export const VUEJS_MESSAGE_FROM = 'vuejs'

const RECEIVE_SETUP_FINISH = 'setup_finish'
const RECEIVE_SAVE_CIRCUIT_JSON = 'save_circuit_json'
const RECEIVE_CURRENT_CIRCUIT_JSON = 'current_circuit_json'

const SEND_LOADED_CIRCUIT_JSON = 'loaded_circuit_json'
const SEND_GET_CIRCUIT_JSON = 'get_circuit_json'

const MESSAGE = {
    //Send
    loadedCircuitJson: SEND_LOADED_CIRCUIT_JSON, /** Vuejs send circuit json to Composer after call api get circuit info successful  */
    getCircuitJson: SEND_GET_CIRCUIT_JSON, /** Vuejs send request to composer to request get current circuit json  */
    //Receive
    setupFinish: RECEIVE_SETUP_FINISH, /** Composer send msg to notify that iframe is ready to receive message from vuejs*/
    saveCircuitJson: RECEIVE_SAVE_CIRCUIT_JSON, /** Composer send the msg to request save current json from composer*/
    getCurrentCircuitJson: RECEIVE_CURRENT_CIRCUIT_JSON, /** Composer response current circuit json*/
}

export default MESSAGE