/* eslint-disable */
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    defineComponent,
    PropType
} from 'vue'
import Modal from '@/components/modal'

const props = {
    showHelpModalRef: {
        type: Boolean as PropType<boolean>,
        default: false
    }
}

const HelpModal = defineComponent({
    name: 'ProjectModal',
    props,
    emits: ['confirmModal'],
    setup(props, ctx) {
        const confirmModal = () => {
            ctx.emit('confirmModal', props.showHelpModalRef)
        }
        return { confirmModal }
    },
    render() {
        return (
            <Modal
                title={'Help Content'}
                show={this.showHelpModalRef}
                onConfirm={this.confirmModal}
                cancelShow={false}
                style={{ width: "1200px" }}
            >
                <h3>Basic Actions</h3>
                <ul>
                    <li>Add gate: <b>Drag</b> gate from gate list to circuit</li>
                    <li>Move gate: <b>Drag</b> gate in circuit</li>
                    <li>Remove gate: <b>Drag</b> gate out of circuit <b>OR Middle-click</b> gate <b>OR</b> click on gate then click the <b>Delete</b> button</li>
                    <li>Undo: Click the&nbsp;
                        <svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="20" height="20"
                            viewBox="0 0 20 20" aria-hidden="true">
                            <path
                                d="M15,9.3c1.5,0,2.8,1.3,2.8,2.7c0,1.5-1.3,2.7-2.8,2.7h-4V16h4c2.3,0,4-1.7,4-4c0-2.2-1.8-4-4-4H3.4	l2.5-2.5L5,4.6l-4,4l4,4l0.9-0.9L3.4,9.3H15z">
                            </path>
                        </svg>
                        &nbsp;icon</li>
                    <li>Redo: Click the&nbsp;
                        <svg focusable="false" transform="scale(-1,1)" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="20"
                            height="20" viewBox="0 0 20 20" aria-hidden="true">
                            <path
                                d="M15,9.3c1.5,0,2.8,1.3,2.8,2.7c0,1.5-1.3,2.7-2.8,2.7h-4V16h4c2.3,0,4-1.7,4-4c0-2.2-1.8-4-4-4H3.4	l2.5-2.5L5,4.6l-4,4l4,4l0.9-0.9L3.4,9.3H15z">
                            </path>
                        </svg>
                        &nbsp;icon
                    </li>
                    <li>Clear circuit: Click the <b>Clear</b> button</li>
                    <li>Add qubit: <b>Drag</b> gate onto extra wire that appears while dragging <b>OR</b> re-arrange gates to the extra wire that appears while dragging</li>
                    <li>Remove qubit: <b>Drag</b> gate on bottom wire out of the circuit <b>OR</b> re-arrange gates so that the bottom wire is unused</li>
                    <li>Show intermediate state: <b>Drag</b> a display gate onto the circuit</li>
                    <li>View tip: Click on a gate in the circuit to open the context menu, and then click the <b>Info</b> button</li>
                    <li>Change gate listing: Click on the &nbsp;
                        <svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="20" height="20"
                            viewBox="0 0 32 32" aria-hidden="true">
                            <path
                                d="M12 4H6A2 2 0 004 6v6a2 2 0 002 2h6a2 2 0 002-2V6A2 2 0 0012 4zm0 8H6V6h6zM26 4H20a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V6A2 2 0 0026 4zm0 8H20V6h6zM12 18H6a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V20A2 2 0 0012 18zm0 8H6V20h6zM26 18H20a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V20A2 2 0 0026 18zm0 8H20V20h6z">
                            </path>
                        </svg>
                        &nbsp; icon to display gates in a grid <b>OR</b> click on the &nbsp;
                        <svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="20" height="20"
                            viewBox="0 0 32 32" aria-hidden="true">
                            <path
                                d="M16 8H30V10H16zM16 22H30V24H16zM10 14H4a2.0023 2.0023 0 01-2-2V6A2.0023 2.0023 0 014 4h6a2.0023 2.0023 0 012 2v6A2.0023 2.0023 0 0110 14zM4 6v6h6.0012L10 6zM10 28H4a2.0023 2.0023 0 01-2-2V20a2.0023 2.0023 0 012-2h6a2.0023 2.0023 0 012 2v6A2.0023 2.0023 0 0110 28zM4 20v6h6.0012L10 20z">
                            </path>
                        </svg>
                        &nbsp; icon to display gates in a grid
                    </li>
                    <li>Minimise views: Click on the &nbsp;
                        <svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="20" height="20"
                            viewBox="0 0 32 32" aria-hidden="true" style="transform: rotate(90deg);">
                            <path
                                d="M4 18L15 18 15 24.172 12.414 21.586 11 23 16 28 21 23 19.586 21.586 17 24.172 17 18 28 18 28 16 4 16 4 18zM26 4H6A2 2 0 004 6v4a2 2 0 002 2H26a2 2 0 002-2V6A2 2 0 0026 4zm0 6H6V6H26z">
                            </path>
                        </svg>
                        &nbsp; icon to minimise the gate lists, the bar chart or the code display
                    </li>
                    <li>Change the initial qubit state: Click on the |0&gt; at the left of the circuit to cycle through qubit states</li>
                    <li>Bar chart legibility: Click on the <b>Show all states</b> button to display all possible states. Click on the same button to revert the display</li>
                    <li>View circuit simulation: Click the <b>Simulation</b> tab on the top of the screen to switch to the simulation screen</li>
                    <li>View circuit results: Hover mouse over the bar graph to see the qubit state and probability <b>OR</b> switch to the simulation tab to view the state, vector, probability and phase angle of qubits</li>
                    <li>Vector table actions:
                        <ul>
                            <li>
                                Search: Click on the&nbsp;
                                <svg width="10px" height="10px" viewBox="0 -0.24 28.423 28.423" data-name="02 - Search Button" xmlns="http://www.w3.org/2000/svg">
                                    <path id="Path_215" data-name="Path 215" d="M14.953,2.547A12.643,12.643,0,1,0,27.6,15.19,12.649,12.649,0,0,0,14.953,2.547Zm0,2A10.643,10.643,0,1,1,4.31,15.19,10.648,10.648,0,0,1,14.953,4.547Z" transform="translate(-2.31 -2.547)" fill-rule="evenodd" />
                                    <path id="Path_216" data-name="Path 216" d="M30.441,28.789l-6.276-6.276a1,1,0,1,0-1.414,1.414L29.027,30.2a1,1,0,1,0,1.414-1.414Z" transform="translate(-2.31 -2.547)" fill-rule="evenodd" />
                                </svg>
                                &nbsp;icon to search for states. Click on the X to close the search bar
                            </li>
                            <li>
                                Filter: Click on the&nbsp;
                                <svg id="vectFilter" width="10px" height="10px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.75 6a.75.75 0 000 1.5h18.5a.75.75 0 000-1.5H2.75zM6 11.75a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zm4 4.938a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z" /></svg>
                                &nbsp;icon to filter the probabilities to only results greater than 0%. Click on the same button to revert the display
                            </li>
                            <li>
                                Sort: Click on the&nbsp;
                                <svg id="sortTableDown" width="10px" height="10px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-labelledby="sortDownIconTitle" stroke="#000000" stroke-width="1" stroke-linecap="square" stroke-linejoin="miter" fill="none" color="#000000"> <title id="sortDownIconTitle">Sort in descending order</title> <path d="M11 9H17" /> <path d="M11 5H19" /> <path d="M11 13H15" /> <path d="M10 17L7 20L4 17" /> <path d="M7 5V19" /> </svg>
                                &nbsp;icon to sort the table in descending order. Click on the&nbsp;
                                <svg id="sortTableUp" width="10px" height="10px" viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg" aria-labelledby="sortUpIconTitle"
                                    stroke="#000000" stroke-width="1" stroke-linecap="square" stroke-linejoin="miter"
                                    fill="none" color="#000000"><title id="sortUpIconTitle">Sort in ascending
                                        order</title>
                                    <path d="M11 16H17" />
                                    <path d="M11 20H19" />
                                    <path d="M11 12H15" />
                                    <path d="M4 8L7 5L10 8" />
                                    <path d="M7 20L7 6" />
                                </svg>
                                &nbsp;icon to sort the table in ascending order
                            </li>
                            <li>
                                Revert sort: Click on the&nbsp;
                                <svg width="10px" height="10px" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><path d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z" /><path d="M16 24h18v2H16z" /></svg>
                                &nbsp;icon to revert all sorts
                            </li>
                        </ul>
                    </li>
                </ul>
                <h3>Advanced Actions</h3>
                <ul>
                    <li>Copy gate: <b>Shift + drag</b> gate in circuit <b>OR</b> click on a gate in circuit, click <b>Copy</b>, right-click and click <b>Paste</b> where you want to copy the gate</li>
                    <li>Move column: <b>Ctrl/
                        <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="20" height="20" viewBox="0 0 32 32" style="transform: translateY(.45rem);"> <g> <path fill="none" d="M0 0h24v24H0z" /> <path fill-rule="nonzero" d="M10 8h4V6.5a3.5 3.5 0 1 1 3.5 3.5H16v4h1.5a3.5 3.5 0 1 1-3.5 3.5V16h-4v1.5A3.5 3.5 0 1 1 6.5 14H8v-4H6.5A3.5 3.5 0 1 1 10 6.5V8zM8 8V6.5A1.5 1.5 0 1 0 6.5 8H8zm0 8H6.5A1.5 1.5 0 1 0 8 17.5V16zm8-8h1.5A1.5 1.5 0 1 0 16 6.5V8zm0 8v1.5a1.5 1.5 0 1 0 1.5-1.5H16zm-6-6v4h4v-4h-4z" /> </g> </svg>
                        + drag</b> in circuit</li>
                    <li>Copy column: <b>Ctrl/
                        <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="20" height="20" viewBox="0 0 32 32" style="transform: translateY(.45rem);"> <g> <path fill="none" d="M0 0h24v24H0z" /> <path fill-rule="nonzero" d="M10 8h4V6.5a3.5 3.5 0 1 1 3.5 3.5H16v4h1.5a3.5 3.5 0 1 1-3.5 3.5V16h-4v1.5A3.5 3.5 0 1 1 6.5 14H8v-4H6.5A3.5 3.5 0 1 1 10 6.5V8zM8 8V6.5A1.5 1.5 0 1 0 6.5 8H8zm0 8H6.5A1.5 1.5 0 1 0 8 17.5V16zm8-8h1.5A1.5 1.5 0 1 0 16 6.5V8zm0 8v1.5a1.5 1.5 0 1 0 1.5-1.5H16zm-6-6v4h4v-4h-4z" /> </g> </svg>
                        + shift + drag</b> in circuit</li>
                </ul>
                <h3>File Management</h3>
                <ul>
                    <li>Save in database: Click the <b>Save</b> button</li>
                    <li>Export the circuit: Click the <b>Export</b> button</li>
                    <li>Import a circuit: Click the <b>Import</b> button. Currently support: JSON</li>
                    <li>Share the circuit: Click the <b>Share</b> button. Share the circuit with a coworker with correct permission</li>
                    <li>Rename the circuit: Click the <b>name</b> of the circuit on the top left corner of the screen</li>
                </ul>
                <h3>Convention</h3>
                <ul>
                    <li>Coordinates</li>
                    <ul>
                        <li>X is +right/-left</li>
                        <li>Y is +forward/-backward</li>
                        <li>Z is +up/-down</li>
                    </ul>
                    <li>Ordering</li>
                    <ul>
                        <li>Top wire is the low bit. Bottom wire is the high bit</li>
                        <li>Kets are big-endian. |00101&gt; is 5, not 20</li>
                        <li>Listed/grided values are in ascending row-major order from the top left to the bottom right</li>
                    </ul>
                </ul>
            </Modal>
        )
    }
})

export default HelpModal
