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
        const iconLink = `./icon/${gate.serializedId}.png`
        let newIconLink = ''
        if(iconLink.includes("Z^(A/2^n)")) {
          newIconLink = iconLink.replace("Z^(A/2^n)", "Z^(A:2^n)")
        } 
        else if(iconLink.includes("Z^(-A/2^n)")) {
          newIconLink = iconLink.replace("Z^(-A/2^n)", "Z^(-A:2^n)")
        }
        else if(iconLink.includes("Y^(A/2^n)")) {
          newIconLink = iconLink.replace("Y^(A/2^n)", "Y^(A:2^n)")
        }
        else if(iconLink.includes("Y^(-A/2^n)")) {
          newIconLink = iconLink.replace("Y^(-A/2^n)", "Y^(-A:2^n)")
        }
        else if(iconLink.includes("X^(A/2^n)")) {
          newIconLink = iconLink.replace("X^(A/2^n)", "X^(A:2^n)")
        }
        else if(iconLink.includes("X^(-A/2^n)")) {
          newIconLink = iconLink.replace("X^(-A/2^n)", "X^(-A:2^n)")
        }
        else {
          newIconLink = iconLink
        }
        gateView.innerHTML = `
                    <img onmousedown="grabGate('${gate.serializedId}')" src=${newIconLink} style="width:36px; height:36px; margin: 5px 6px;"/>
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
        const iconLink =`./icon/${gate.serializedId}.png`
        let newIconLink = ''
        if(iconLink.includes("Z^(A/2^n)")) {
          newIconLink = iconLink.replace("Z^(A/2^n)", "Z^(A:2^n)")
        } 
        else if(iconLink.includes("Z^(-A/2^n)")) {
          newIconLink = iconLink.replace("Z^(-A/2^n)", "Z^(-A:2^n)")
        }
        else if(iconLink.includes("Y^(A/2^n)")) {
          newIconLink = iconLink.replace("Y^(A/2^n)", "Y^(A:2^n)")
        }
        else if(iconLink.includes("Y^(-A/2^n)")) {
          newIconLink = iconLink.replace("Y^(-A/2^n)", "Y^(-A:2^n)")
        }
        else if(iconLink.includes("X^(A/2^n)")) {
          newIconLink = iconLink.replace("X^(A/2^n)", "X^(A:2^n)")
        }
        else if(iconLink.includes("X^(-A/2^n)")) {
          newIconLink = iconLink.replace("X^(-A/2^n)", "X^(-A:2^n)")
        }
        else {
          newIconLink = iconLink
        }
        gateView.innerHTML = `
                    <div style="display:flex; align-items: center; padding: 2px">
                    <img onmousedown="grabGate('${gate.serializedId}')" src=${newIconLink} style="border:1px solid black; width:33px; height:33px; margin:2px 3px;"/>
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
        const iconLink = `./icon/${gate.serializedId}.png`
        let newIconLink = ''
        if(iconLink.includes(">>3")) {
          newIconLink = iconLink.replace(">>3", "2greater")
        } 
        else if(iconLink.includes("(/)")) {
          newIconLink = iconLink.replace("(/)", "(:)")
        } 
        else if(iconLink.includes("|/⟩⟨/|")) {
          newIconLink = iconLink.replace("|/⟩⟨/|", "|:⟩⟨:|")
        }
        else if(iconLink.includes("/A2")) {
          newIconLink = iconLink.replace("/A2", ":A2")
        }  
        else if(iconLink.includes("^A>B")) {
          newIconLink = iconLink.replace("^A>B", "^AgreaterB")
        } 
        else if(iconLink.includes("^A>=B")) {
          newIconLink = iconLink.replace("^A>=B", "^Agreater=B")
        }  
        else if(iconLink.includes("/AmodR2")) {
          newIconLink = iconLink.replace("/AmodR2", ":AmodR2")
        }  
        else if(iconLink.includes("/BToAmodR2")) {
          newIconLink = iconLink.replace("/BToAmodR2", ":BToAmodR2")
        }  
        else {
          newIconLink = iconLink
        }
        gateView.innerHTML = `
                      <img onmousedown="grabGate('${gate.serializedId}')" src=${newIconLink} style="width:36px; height:36px; margin: 5px 6px;"/>
                      <span class="tooltip-content">${gate.name}</span>
                `;
        advancedGates.appendChild(gateView)
      }
    });
  })

  //show bottom gate as grid list
  Gates.BottomToolboxGroups.forEach((group) => {
    let gateGroup = document.createElement('div'); gateGroup.setAttribute("class", "gate-group")
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
        const iconLink = `./icon/${gate.serializedId}.png`
        let newIconLink = ''
        if(iconLink.includes(">>3")) {
          newIconLink = iconLink.replace(">>3", "2greater")
        } 
        else if(iconLink.includes("(/)")) {
          newIconLink = iconLink.replace("(/)", "(:)")
        } 
        else if(iconLink.includes("|/⟩⟨/|")) {
          newIconLink = iconLink.replace("|/⟩⟨/|", "|:⟩⟨:|")
        }
        else if(iconLink.includes("/A2")) {
          newIconLink = iconLink.replace("/A2", ":A2")
        }  
        else if(iconLink.includes("^A>B")) {
          newIconLink = iconLink.replace("^A>B", "^AgreaterB")
        } 
        else if(iconLink.includes("^A>=B")) {
          newIconLink = iconLink.replace("^A>=B", "^Agreater=B")
        }  
        else if(iconLink.includes("/AmodR2")) {
          newIconLink = iconLink.replace("/AmodR2", ":AmodR2")
        }  
        else if(iconLink.includes("/BToAmodR2")) {
          newIconLink = iconLink.replace("/BToAmodR2", ":BToAmodR2")
        }  
        else {
          newIconLink = iconLink
        }
        gateView.innerHTML = `
                  <div style="display:flex; align-items: center; padding: 2px">
                  <img onmousedown="grabGate('${gate.serializedId}')" src=${newIconLink} style="border:1px solid black; width:33px; height:33px; margin:2px 3px;"/>
                    <span> ${gate.name}</span>
                  </div>
                `;
        gateGroupList.appendChild(gateView)
      }
    });
  })

}

export {initGateViews}
