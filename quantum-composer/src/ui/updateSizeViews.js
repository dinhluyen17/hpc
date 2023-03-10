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
import {
  SIZE_INFO,
  viewState,
  getChartAreaHeight,
  getGateAreaWidth,
  getCodeAreaWidth,
} from "./viewState.js";

const updateSizeViews = (parentDiv) => {
  // GateArea
  const gateArea = document.getElementsByClassName('gate-area')[0];
  gateArea.style.width = getGateAreaWidth() + 'px';
  gateArea.style.maxWidth = getGateAreaWidth() + 'px';

  // Circuit body
  viewState.getInstance().minCircuitWidth = (parentDiv.clientWidth - getGateAreaWidth() - getCodeAreaWidth() - 8);
  const circuitBody = document.getElementById('circuit-area-body');
  circuitBody.style.width = (parentDiv.clientWidth - getGateAreaWidth() - getCodeAreaWidth()) + 'px';
  circuitBody.style.maxHeight = (
    parentDiv.clientHeight -
    SIZE_INFO.HEADER_HEIGHT -
    SIZE_INFO.CIRCUIT_AREA_HEADER_HEIGHT -
    getChartAreaHeight()
  ) + 'px';

  const circuitChart = document.getElementById('stateBarChart');
  circuitChart.style.width = circuitBody.style.width;
  circuitChart.style.height = getChartAreaHeight() + 'px';
  circuitChart.style.maxHeight = getChartAreaHeight() + 'px';

  const commonGates = document.getElementById('common-gates');
  const advancedGates = document.getElementById('advanced-gates');
  const commonGatesGrid = document.getElementById('common-gates-grid');
  const advancedGatesGrid = document.getElementById('advanced-gates-grid');
  const sampleHeight = (
    parentDiv.clientHeight -
    SIZE_INFO.HEADER_HEIGHT -
    SIZE_INFO.GATE_AREA_HEADER_HEIGHT -
    SIZE_INFO.GATE_AREA_SECTION_LABEL_HEIGHT * 2 -
    4 * SIZE_INFO.VERTICAL_SPACING) / 2.0;
  commonGates.style.maxHeight = sampleHeight + 'px';
  advancedGates.style.maxHeight = (parentDiv.clientHeight -
    SIZE_INFO.HEADER_HEIGHT -
    SIZE_INFO.GATE_AREA_HEADER_HEIGHT -
    SIZE_INFO.GATE_AREA_SECTION_LABEL_HEIGHT * 2 -
    sampleHeight / 2.0 - 25) + 'px';
  commonGatesGrid.style.maxHeight = commonGates.style.maxHeight;
  advancedGatesGrid.style.maxHeight = commonGates.style.maxHeight;

  // Code area
  const codeArea = document.getElementsByClassName('code-area')[0];
  codeArea.style.width = getCodeAreaWidth() + 'px';
  codeArea.style.maxWidth = getCodeAreaWidth() + 'px';

  // Chart area
  const chartArea = document.getElementsByClassName('circuit-area-chart')[0];
  chartArea.style.height = getChartAreaHeight() + 'px';
  chartArea.style.maxHeight = getChartAreaHeight() + 'px';

  const canvas = document.getElementById("circuit-area-body");
  let canvasBox = canvas.getBoundingClientRect();
  viewState.getInstance().canvasBoundingRect = {
    clientX: canvasBox.left,
    clientY: canvasBox.top,
    width: canvasBox.width,
    height: canvasBox.height
  }
}

const initSizeViews = (parentDiv) => {
  const gridGateBtn = document.getElementById('gate-area-header-grid-btn');
  const listGateBtn = document.getElementById('gate-area-header-list-btn');
  const searchGateBox = document.getElementById('gate-area-header-search');
  const gateArea = document.querySelectorAll('.gateList');

  $(".arrow-container").click(function () {
    if ($(this).data("side") === "left") {
      viewState.getInstance().expandCodeArea = !viewState.getInstance().expandCodeArea;
      if (viewState.getInstance().expandCodeArea) {
        viewState.getInstance().codeAreaWidth = 300;
      }
      else {
        viewState.getInstance().codeAreaWidth = 25;
      }
      updateSizeViews(parentDiv);
    } else if ($(this).data("side") === "right") {
      viewState.getInstance().expandGateArea = !viewState.getInstance().expandGateArea;
      if (viewState.getInstance().expandGateArea) {
        viewState.getInstance().gateAreaWidth = 239;
        gridGateBtn.style.display = 'flex';
        listGateBtn.style.display = 'flex';
        searchGateBox.style.display = 'flex';
        gateArea.forEach(item => {
          const gateArea2 = item.children[0]
          gateArea2.setAttribute("style", "justify-content:left;");
        })
      }
      else {
        viewState.getInstance().gateAreaWidth = 25;
        gridGateBtn.style.display = 'none';
        listGateBtn.style.display = 'none';
        searchGateBox.style.display = 'none';
        gateArea.forEach(item => {
          const gateArea2 = item.children[0]
          gateArea2.setAttribute("style", "justify-content:center;");
        })
      }
      updateSizeViews(parentDiv);
    } else {
      viewState.getInstance().expandChartArea = !viewState.getInstance().expandChartArea;
      if (viewState.getInstance().expandChartArea) {
        viewState.getInstance().chartAreaHeight = 220;
      }
      else {
        viewState.getInstance().chartAreaHeight = 25;
      }
      updateSizeViews(parentDiv);
    }
  });

  updateSizeViews(parentDiv);
}

export { initSizeViews, updateSizeViews }
