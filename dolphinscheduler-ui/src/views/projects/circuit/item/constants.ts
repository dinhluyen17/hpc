export const QUANTUM_MESSAGE_FROM = 'quantum_composer'
export const VUEJS_MESSAGE_FROM = 'vuejs'

const RECEIVE_SETUP_FINISH = 'setup_finish'
const RECEIVE_SAVE_CIRCUIT_JSON = 'save_circuit_json'
const RECEIVE_CURRENT_CIRCUIT_JSON = 'current_circuit_json'

const SEND_LOADED_CIRCUIT_JSON = 'loaded_circuit_json'
const SEND_GET_CIRCUIT_JSON = 'get_circuit_json'
const SEND_CHANGE_TAB = 'change_tab'

const MESSAGE = {
    //Send
    loadedCircuitJson: SEND_LOADED_CIRCUIT_JSON, /** Vuejs --> Composer: send circuit json after call api get circuit info successful  */
    getCircuitJson: SEND_GET_CIRCUIT_JSON, /** Vuejs --> Composer: send request to get current circuit json  */
    changeTab: SEND_CHANGE_TAB, /** Vuejs --> Composer: change tab */
    //Receive
    setupFinish: RECEIVE_SETUP_FINISH, /** Composer --> Vuejs: notify that composer is ready to receive message from Vuejs*/
    saveCircuitJson: RECEIVE_SAVE_CIRCUIT_JSON, /** Composer --> Vuejs: request save circuit json*/
    getCurrentCircuitJson: RECEIVE_CURRENT_CIRCUIT_JSON, /** Composer --> Vuejs: send current circuit json*/
}

export default MESSAGE