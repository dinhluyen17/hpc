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
    const gateGrid = document.getElementById('gateGridDiv');
    const gateList = document.getElementById('gateList');
    Gates.TopToolboxGroups.forEach((group) => {
        group.gates.forEach(gate => {
            if (gate != undefined) {
                const gateView = document.createElement('span');
                gateView.innerHTML = `
                      <svg onmousedown="grabGate('${gate.symbol}')" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                        class="block select-none" data-testid="CatalogItem-h" style="cursor: grab;">
                        <rect x="1.25" y="1.25" width="29.5" height="29.5"
                          style="fill: rgb(255, 255, 255); stroke-width: 2.5; stroke: rgb(22, 22, 22); paint-order: stroke;">
                        </rect>
                        <text x="16" y="16" dy=".3em"
                          style="font-family: &quot;IBM Plex Sans&quot;, sans-serif; font-size: 16px; font-style: normal; fill: rgb(0, 0, 0); font-weight: 400; text-anchor: middle;">${gate.symbol}
                        </text>
                      </svg>
                `;
                gateGrid.appendChild(gateView)
            }
        });

        const gateSection = document.createElement('div');
        gateSection.innerHTML = `
        <div data-state="open" class="AccordionItem pb-8">
        <h3 data-state="open" class="AccordionHeader">
          <button type="button" aria-controls="radix-45" aria-expanded="true" data-state="open" id="radix-46"
            class="AccordionTrigger" data-radix-collection-item="">${group.hint}
            <svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"
              fill="currentColor" aria-hidden="true" width="20" height="20" viewBox="0 0 32 32"
              class="AccordionTriggerIcon">
              <path d="M16 22L6 12 7.4 10.6 16 19.2 24.6 10.6 26 12z">
              </path>
            </svg>
          </button>
        </h3>
        `
        group.gates.forEach((gate) => {
            if (gate != undefined) {
                const gateView = document.createElement('div');
                gateView.innerHTML = `
      <div onmousedown="grabGate('${gate.symbol}')" data-state="open" id="radix-45" role="region" aria-labelledby="radix-46" class="AccordionContent"
        style="--radix-accordion-content-height:var(--radix-collapsible-content-height); --radix-accordion-content-width:var(--radix-collapsible-content-width); transition-duration: 0s; animation-name: none; --radix-collapsible-content-height:30.3906px; --radix-collapsible-content-width:232px;">
        <div class="AccordionContentInner">
          <div class="flex flex-col gap-4">
            <span data-state="closed">
              <div class="flex items-center select-none gap-4 hover:bg-hover-ui" style="cursor: grab;">
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" class="block" width="22.4"
                  height="22.4" data-testid="CatalogItem-h">
                  <rect x="1.25" y="1.25" width="29.5" height="29.5"
                  style="fill: rgb(255, 255, 255); stroke-width: 2.5; stroke: rgb(22, 22, 22); paint-order: stroke;">
                  </rect>
                  <text x="16" y="16" dy=".3em"
                    style="font-family: &quot;IBM Plex Sans&quot;, sans-serif; font-size: 16px; font-style: normal; fill: rgb(0, 0, 0); font-weight: 400; text-anchor: middle;">${gate.symbol}</text>
                </svg>
                <div class="text-body-short-01">
                  ${gate.symbol}
                </div>
              </div>
            </span>
          </div>
        </div>
      </div>
                `
                gateSection.appendChild(gateView)
            }
        })
        gateList.appendChild(gateSection)
    })
}

export {initGateViews}
