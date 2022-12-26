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

import { Gates } from "../gates/AllGates.js";
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

  //new custom gate symbol
  const newIcon = new Map([
    ['Measure', '<small class="smaller">Measure</small>'],
    ['◦', '<big class="bigger">◦</big>'],
    ['Density', '<small class="smaller">Density</small>'],
    ['Bloch', '<small>Bloch</small>'],
    ['Chance', '<small class="smaller">Chance</small>'],
    ['Amps', '<small>Amps</small>'],
    ['Swap', '<small>Swap</small>'],
    ['S^-1', 'S<sup>-1</sup>'],
    ['Y^½', 'Y<sup>½</sup>'],
    ['Y^-½', 'Y<sup>-½</sup>'],
    ['X^½', 'X<sup>½</sup>'],
    ['X^-½', 'X<sup>-½</sup>'],
    ['T^-1', 'T<sup>-1</sup>'],
    ['Y^¼', 'Y<sup>¼</sup>'],
    ['Y^-¼', 'Y<sup>-¼</sup>'],
    ['X^¼', 'X<sup>¼</sup>'],
    ['X^-¼', 'X<sup>-¼</sup>'],
    ['Z^t', 'Z<sup>t</sup>'],
    ['Z^-t', 'Z<sup>-t</sup>'],
    ['Y^t', 'Y<sup>t</sup>'],
    ['Y^-t', 'Y<sup>-t</sup>'],
    ['X^t', 'X<sup>t</sup>'],
    ['X^-t', 'X<sup>-t</sup>'],
    ['Z^ft', 'Z<sup>f(t)</sup>'],
    ['Rzft', 'R<small>z(f(t))</small>'],
    ['Y^ft', 'Y<sup>f(t)</sup>'],
    ['Ryft', 'R<small>y(f(t))</small>'],
    ['X^ft', 'X<sup>f(t)</sup>'],
    ['Rxft', 'R<small>x(f(t))</small>'],
    ['Z^A/2ⁿ', '<small>Z<small><sup>A/2<sup>n</sup></sup></small></small>'],
    ['Z^-A/2ⁿ', '<small>Z<small><sup>-A/2<sup>n</sup></sup></small></small>'],
    ['Y^A/2ⁿ', '<small>Y<small><sup>A/2<sup>n</sup></sup></small></small>'],
    ['Y^-A/2ⁿ', '<small>Y<small><sup>-A/2<sup>n</sup></sup></small></small>'],
    ['X^A/2ⁿ', '<small>X<small><sup>A/2<sup>n</sup></sup></small></small>'],
    ['X^-A/2ⁿ', '<small>X<small><sup>-A/2<sup>n</sup></sup></small></small>'],
    ['ZDetector', 'Z<small>D</small>'],
    ['ZDetectControlReset', 'Z<small>DR</small>'],
    ['YDetector', 'Y<small>D</small>'],
    ['YDetectControlReset', 'Y<small>DR</small>'],
    ['XDetector', 'X<small>D</small>'],
    ['XDetectControlReset', 'X<small>DR</small>'],
    ['zpar', 'z<br>[par]'],
    ['ypar', 'y<br>[par]'],
    ['xpar', 'x<br>[par]'],
    ['Reverse', '<small class="smaller">Reverse</small>'],
    ['<<<', '<div style="display: flex; align-items:center; justify-content:center"><img src="./icon/<<3.png" style="width: 35px; height:35px; border:none" /></div>'],
    ['>>>', '<div style="display: flex; align-items:center; justify-content:center"><img src="./icon/>>3.png" style="width: 35px; height:35px; border:none" /></div>'],
    ['Interleave', '<div style="display: flex; align-items:center; justify-content:center"><img src="./icon/weave6.png" style="width: 35px; height:35px; border:none" /></div>'],
    ['Deinterleave', '<div style="display: flex; align-items:center; justify-content:center"><img src="./icon/split6.png" style="width: 35px; height:35px; border:none" /></div>'],
    ['QFT^†', 'QFT<sup>†</sup>'],
    ['Grad^½', '<small>Grad</small><sup>½</sup>'],
    ['Grad^-½', '<small>Grad</small><sup>-½</sup>'],
    ['Grad^t', '<small>Grad</small><sup>t</sup>'],
    ['Grad^-t', '<small>Grad</small><sup>-t</sup>'],
    ['input A', 'input<br>A'],
    ['setA', 'A=#<br><small>default</small>'],
    ['input B', 'input<br>B'],
    ['setB', 'B=#<br><small>default</small>'],
    ['input R', 'input<br>R'],
    ['setR', 'R=#<br><small>default</small>'],
    ['×A^-1', '×A<sup>-1</sup>'],
    ['⊕A<B', '⊕<small>A&#60B</small>'],
    ['⊕A>B', '⊕<small>A&#62B</small>'],
    ['⊕A≤B', '⊕<small>A≤B</small>'],
    ['⊕A≥B', '⊕<small>A≥B</small>'],
    ['⊕A=B', '⊕<small>A=B</small>'],
    ['⊕A≥B', '⊕<small>A≥B</small>'],
    ['⊕A≠B', '⊕<small>A≠B</small>'],
    ['+1\nmod R', '+1<br><small>mod R</small>'],
    ['−1\nmod R', '-1<br><small>mod R</small>'],
    ['+A\nmod R', '+A<br><small>mod R</small>'],
    ['−A\nmod R', '-A<br><small>mod R</small>'],
    ['×A\nmod R', '×A<br><small>mod R</small>'],
    ['×A^-1\nmod R', '×A<sup>-1</sup><br><small>mod R</small>'],
    ['×B^A\nmod R', '×B<sup>A</sup><br><small>mod R</small>'],
    ['×B^-A\nmod R', '×B<sup>-A</sup><br><small>mod R</small>'],
    ['', '-']
  ]);

  //show top gate as normal list
  Gates.TopToolboxGroups.forEach((group) => {
    group.gates.forEach(gate => {
      if (gate != undefined && !unsupportedGates.includes(gate.name)) {
        const gateView = document.createElement('span');
        gateView.setAttribute("class", "list-view tooltip-wrap")
        gateView.innerHTML = `
                      <div onmousedown="grabGate('${gate.serializedId}')" style='cursor: grab; display: flex; align-items:center; justify-content:center; width:40px; height:40px; margin:0.3rem 0.25rem; border: 1px solid black' class="${group.hint}">
                        <div style='text-align:center;'>
                          ${(newIcon.get(gate.symbol) != null) ? newIcon.get(gate.symbol) : gate.symbol}
                        </div>
                      </div>
                      <span class="tooltip-content">${gate.name}</span>
                `;
        commonGates.appendChild(gateView)
      }
    });
  })

  //show top gate as grid list
  let groupNum = 0
  Gates.TopToolboxGroups.forEach((group) => {
    if (group.hint === unsupportedGroupGate) { return }
    let gateGroup = document.createElement('div'); gateGroup.setAttribute("class", "gate-group")
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
                    <div style="display:flex; align-items: center; padding: 2px">
                      <div onmousedown="grabGate('${gate.serializedId}')" style='cursor: grab; display: flex; align-items:center; justify-content:center; width:40px; height:40px; margin:0.3rem 0.25rem; border: 1px solid black; margin:2px 3px;' class="${group.hint}">
                        <div style='text-align:center;'>
                          ${(newIcon.get(gate.symbol) != null) ? newIcon.get(gate.symbol) : gate.symbol}
                        </div>
                      </div>
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
        const gateView = document.createElement("span");
        gateView.setAttribute("class", "list-view tooltip-wrap");
        gateView.innerHTML = `
                  <div onmousedown="grabGate('${gate.serializedId}')" style='cursor: grab; display: flex; align-items:center; justify-content:center; width:40px; height:40px; margin:0.3rem 0.25rem; border: 1px solid black' class="${group.hint}">
                    <div style='text-align:center;'>
                      ${newIcon.get(gate.symbol) != null? newIcon.get(gate.symbol) : gate.symbol}
                    </div>
                  </div>
                  <span class="tooltip-content">${gate.name}</span>
                `;
        advancedGates.appendChild(gateView);
      }
    });
  })

  //show bottom gate as grid list
  Gates.BottomToolboxGroups.forEach((group) => {
    let gateGroup = document.createElement('div'); gateGroup.setAttribute("class", "gate-group")
    let gateGroupName = document.createElement('h4'); gateGroupName.setAttribute("class", `group-gate-name`);
    gateGroupName.innerText = group.hint
    let createButton = document.createElement("button"); createButton.setAttribute("class", `toggle-gate-list ${"group-gate-num" + groupNum}`); createButton.setAttribute("data-state", "open");
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
                    <div style="display:flex; align-items: center; padding: 2px">
                      <div onmousedown="grabGate('${gate.serializedId}')" style='cursor: grab; display: flex; align-items:center; justify-content:center; width:40px; height:40px; margin:0.3rem 0.25rem; border: 1px solid black; margin:2px 3px;' class="${group.hint}">
                        <div style='text-align:center;'>
                          ${(newIcon.get(gate.symbol) != null) ? newIcon.get(gate.symbol) : gate.symbol}
                        </div>
                      </div>
                      <span> ${gate.name}</span>
                    </div>
                `;
        gateGroupList.appendChild(gateView)
      }
    });
  })

}

export { initGateViews }
