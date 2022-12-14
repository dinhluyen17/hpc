/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 import {Gates} from "../gates/AllGates.js";
/**
 * @param {!Revision} revision
 */

const initGateViews = () => {
  const commonGates = document.getElementById('common-gates');
  const commonGatesGrid = document.getElementById('common-gates-grid');
  const advancedGates = document.getElementById('advanced-gates');
  const advancedGatesGrid = document.getElementById('advanced-gates-grid');
  //list all unsupported gates and currently show all unsupported gates
  const unsupportedGates = [
/*     "Postselect Off",
    "Postselect On",
    "Postselect X-Off",
    "Postselect X-On",
    "Postselect Y-Off",
    "Postselect Y-On",
    "Nothing Gate",
    "Z Detect-Control-Reset",
    "Y Detect-Control-Reset",
    "X Detect-Control-Reset",
    "Counting Gate",
    "Down Counting Gate",
    "Cycling Gradient Gate",
    "Inverse Cycling Gradient Gate",
    "Ne-Gate",
    "Imaginary Gate",
    "Anti-Imaginary Gate",
    "Half Imaginary Gate",
    "Half Anti-Imaginary Gate",
    "X-Raising Gate (forward)",
    "X-Raising Gate (backward)",
    "Y-Raising Gate (forward)",
    "Y-Raising Gate (backward)",
    "Z-Raising Gate (forward)",
    "Z-Raising Gate (backward)", */
  ]; 
  //Gate group with 0 gate got supported by cirq or qiskit
  const unsupportedGroupGate = "" //supposed to be "Spinning" but right now just show every group gate on web

  //show top gate as normal list
  Gates.TopToolboxGroups.forEach((group) => {
    group.gates.forEach(gate => {
      if (gate != undefined && !unsupportedGates.includes(gate.name)) {
        const gateView = document.createElement('span');
        gateView.setAttribute("class", "list-view tooltip-wrap")
        gateView.innerHTML = `
                      <svg onmousedown="grabGate('${gate.symbol}')" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="cursor: grab; margin-left: 10px; margin-top: 10px;">
                        <rect x="1" y="1" width="38" height="38"
                          style="fill: rgb(255, 255, 255); stroke-width: 2; stroke: rgb(22, 22, 22); paint-order: stroke;">
                        </rect>
                        <text x="20" y="20" dy=".3em"
                          style="font-family: sans-serif; font-size: 15px; font-style: normal; fill: rgb(0, 0, 0); font-weight: 300; text-anchor: middle;">${gate.symbol}
                        </text>
                      </svg>
                      <span class="tooltip-content">${gate.name}</span>
                `;
        commonGates.appendChild(gateView)
      }
    });
  })

  //show top gate as grid list
  let groupNum = 0
  Gates.TopToolboxGroups.forEach((group) => {
    if(group.hint === unsupportedGroupGate) {return}
    let gateGroup = document.createElement('div')
    let gateGroupName = document.createElement('h4'); gateGroupName.setAttribute("class", `group-gate-name`)
    gateGroupName.innerText = group.hint
    let createButton = document.createElement('button'); createButton.setAttribute("class", `toggle-gate-list ${"group-gate-num" + groupNum}`); createButton.setAttribute("data-state", "open");
    createButton.innerHTML = `
      <svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true" width="20" height="20" viewBox="0 0 32 32" class="AccordionTriggerIcon"><path d="M16 22L6 12 7.4 10.6 16 19.2 24.6 10.6 26 12z"></path></svg>
    `;
    gateGroupName.appendChild(createButton)
    gateGroup.appendChild(gateGroupName)
    commonGatesGrid.appendChild(gateGroup)

    let gateGroupList = document.createElement('div'); gateGroupList.setAttribute("id", `${"group-num-" + groupNum}`); groupNum++;
    gateGroup.appendChild(gateGroupList)
    group.gates.forEach(gate => {
      if (gate != undefined && !unsupportedGates.includes(gate.name)) {
        const gateView = document.createElement('div');
        gateView.setAttribute("class", "grid-view")
        gateView.innerHTML = `
                    <div style="display:flex; align-items: center;">
                      <svg onmousedown="grabGate('${gate.symbol}')" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="cursor: grab; padding: 5px 3px;">
                        <rect x="1" y="1" width="38" height="38"
                          style="fill: rgb(255, 255, 255); stroke-width: 2; stroke: rgb(22, 22, 22); paint-order: stroke;">
                        </rect>
                        <text x="20" y="20" dy=".3em"
                          style="font-family: sans-serif; font-size: 15px; font-style: normal; fill: rgb(0, 0, 0); font-weight: 300; text-anchor: middle;">${gate.symbol}
                        </text>
                      </svg>
                      <span> ${gate.name}</span>
                    </div>
                `;
        gateGroupList.appendChild(gateView)
      }
    });
  })

  //show bottom gate as normal list
  Gates.BottomToolboxGroups.forEach((group) => {
    group.gates.forEach(gate => {
      if (gate != undefined && !unsupportedGates.includes(gate.name)) {
        const gateView = document.createElement('span');
        gateView.setAttribute("class", "list-view tooltip-wrap")
        gateView.innerHTML = `
                      <svg onmousedown="grabGate('${gate.symbol}')" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="cursor: grab; margin-left: 10px; margin-top: 10px;">
                        <rect x="1" y="1" width="38" height="38"
                          style="fill: rgb(255, 255, 255); stroke-width: 2; stroke: rgb(22, 22, 22); paint-order: stroke;">
                        </rect>
                        <text x="20" y="20" dy=".3em"
                          style="font-family: sans-serif; font-size: 15px; font-style: normal; fill: rgb(0, 0, 0); font-weight: 300; text-anchor: middle;">${gate.symbol}
                        </text>
                      </svg>
                      <span class="tooltip-content">${gate.name}</span>
                `;
        advancedGates.appendChild(gateView)
      }
    });
  })

  //show bottom gate as grid list
  Gates.BottomToolboxGroups.forEach((group) => {
    let gateGroup = document.createElement('div')
    let gateGroupName = document.createElement('h4'); gateGroupName.setAttribute("class", `group-gate-name`);
    gateGroupName.innerText = group.hint
    let createButton = document.createElement("button"); createButton.setAttribute("class",`toggle-gate-list ${"group-gate-num" + groupNum}`); createButton.setAttribute("data-state", "open");
    createButton.innerHTML = `
    <svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true" width="20" height="20" viewBox="0 0 32 32" class="AccordionTriggerIcon"><path d="M16 22L6 12 7.4 10.6 16 19.2 24.6 10.6 26 12z"></path></svg>
  `;
    gateGroupName.appendChild(createButton)
    gateGroup.appendChild(gateGroupName)
    advancedGatesGrid.appendChild(gateGroup)

    let gateGroupList = document.createElement('div'); gateGroupList.setAttribute("id", `${"group-num-" + groupNum}`); groupNum++;
    gateGroup.appendChild(gateGroupList)
    group.gates.forEach(gate => {
      if (gate != undefined && !unsupportedGates.includes(gate.name)) {
        const gateView = document.createElement('div');
        gateView.setAttribute("class", "grid-view")
        gateView.innerHTML = `
                    <div style="display:flex; align-items: center;">
                      <svg onmousedown="grabGate('${gate.symbol}')" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="cursor: grab; padding: 5px 3px;">
                        <rect x="1" y="1" width="38" height="38"
                          style="fill: rgb(255, 255, 255); stroke-width: 2; stroke: rgb(22, 22, 22); paint-order: stroke;">
                        </rect>
                        <text x="20" y="20" dy=".3em"
                          style="font-family: sans-serif; font-size: 15px; font-style: normal; fill: rgb(0, 0, 0); font-weight: 300; text-anchor: middle;">${gate.symbol}
                        </text>
                      </svg>
                      <span> ${gate.name}</span>
                    </div>
                `;
        gateGroupList.appendChild(gateView)
      }
    });
  })

}

export {initGateViews}
