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
  gateArea.style.maxWidth = getGateAreaWidth() + 'px';

  // Circuit body
  const circuitBody = document.getElementById('circuit-area-body');
  circuitBody.style.width = (parentDiv.clientWidth - getGateAreaWidth() - getCodeAreaWidth()) + 'px';
  circuitBody.style.maxHeight = (
    parentDiv.clientHeight -
    SIZE_INFO.HEADER_HEIGHT -
    SIZE_INFO.CIRCUIT_AREA_HEADER_HEIGHT -
    getChartAreaHeight() -
    2 * SIZE_INFO.VERTICAL_SPACING
  ) + 'px';

  const commonGates = document.getElementById('common-gates');
  const advancedGates = document.getElementById('advanced-gates');
  const commonGatesGrid = document.getElementById('common-gates-grid');
  const advancedGatesGrid = document.getElementById('advanced-gates-grid');
  commonGates.style.maxHeight = (
    parentDiv.clientHeight -
    SIZE_INFO.HEADER_HEIGHT -
    SIZE_INFO.GATE_AREA_HEADER_HEIGHT -
    SIZE_INFO.GATE_AREA_SECTION_LABEL_HEIGHT * 2 -
    4 * SIZE_INFO.VERTICAL_SPACING) / 2.0 + 'px';
  advancedGates.style.maxHeight = commonGates.style.maxHeight;
  commonGatesGrid.style.maxHeight = commonGates.style.maxHeight;
  advancedGatesGrid.style.maxHeight = commonGates.style.maxHeight;

  // Code area
  const codeArea = document.getElementsByClassName('code-area')[0];
  codeArea.style.maxWidth = getCodeAreaWidth() + 'px';

  // Chart area
  const chartArea = document.getElementsByClassName('circuit-area-chart')[0];
  chartArea.style.maxHeight = getChartAreaHeight() + 'px';

  const canvas = document.getElementById("circuit-area-body");
  let canvasBox = canvas.getBoundingClientRect();
  viewState.getInstance().canvasBoundingRect = {
    clientX: canvasBox.left,
    clientY: canvasBox.top,
  }
}

const initSizeViews = (parentDiv) => {
  const closeGateAreaBtn = document.getElementById('gate-area-header-close-btn');
  const gridGateBtn = document.getElementById('gate-area-header-grid-btn');
  const listGateBtn = document.getElementById('gate-area-header-list-btn');
  const searchGateBox = document.getElementById('gate-area-header-search');
  closeGateAreaBtn.addEventListener('click', () => {
    viewState.getInstance().expandGateArea = !viewState.getInstance().expandGateArea;
    if (viewState.getInstance().expandGateArea) {
      gridGateBtn.style.display = 'block';
      listGateBtn.style.display = 'block';
      searchGateBox.style.display = 'block';
    }
    else {
      gridGateBtn.style.display = 'none';
      listGateBtn.style.display = 'none';
      searchGateBox.style.display = 'none';
    }
    updateSizeViews(parentDiv);
  });

  const closeCodeAreaBtn = document.getElementById('code-area-close-btn');
  closeCodeAreaBtn.addEventListener('click', () => {
    viewState.getInstance().expandCodeArea = !viewState.getInstance().expandCodeArea;
    updateSizeViews(parentDiv);
  });

  const closeChartAreaBtn = document.getElementById('circuit-area-chart-close-btn');
  closeChartAreaBtn.addEventListener('click', () => {
    viewState.getInstance().expandChartArea = !viewState.getInstance().expandChartArea;
    updateSizeViews(parentDiv);
  });
  updateSizeViews(parentDiv);
}

export {initSizeViews, updateSizeViews}
