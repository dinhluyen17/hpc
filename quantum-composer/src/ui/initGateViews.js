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
  const advancedGates = document.getElementById('advanced-gates');
  Gates.TopToolboxGroups.forEach((group) => {
    group.gates.forEach(gate => {
      if (gate != undefined) {
        const gateView = document.createElement('span');
        gateView.innerHTML = `
                      <svg onmousedown="grabGate('${gate.symbol}')" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="cursor: grab; margin-left: 10px; margin-top: 10px;">
                        <rect x="1" y="1" width="38" height="38"
                          style="fill: rgb(255, 255, 255); stroke-width: 2; stroke: rgb(22, 22, 22); paint-order: stroke;">
                        </rect>
                        <text x="20" y="20" dy=".3em"
                          style="font-family: sans-serif; font-size: 15px; font-style: normal; fill: rgb(0, 0, 0); font-weight: 300; text-anchor: middle;">${gate.symbol}
                        </text>
                      </svg>
                `;
        commonGates.appendChild(gateView)
      }
    });
  })
  Gates.BottomToolboxGroups.forEach((group) => {
    group.gates.forEach(gate => {
      if (gate != undefined) {
        const gateView = document.createElement('span');
        gateView.innerHTML = `
                    <svg onmousedown="grabGate('${gate.symbol}')" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="cursor: grab; margin-left: 10px; margin-top: 10px;">
                      <rect x="1" y="1" width="38" height="38"
                        style="fill: rgb(255, 255, 255); stroke-width: 2; stroke: rgb(22, 22, 22); paint-order: stroke;">
                      </rect>
                      <text x="20" y="20" dy=".3em"
                        style="font-family: sans-serif; font-size: 15px; font-style: normal; fill: rgb(0, 0, 0); font-weight: 300; text-anchor: middle;">${gate.symbol}
                      </text>
                    </svg>
              `;
        advancedGates.appendChild(gateView)
      }
    });
  })
}

export {initGateViews}
