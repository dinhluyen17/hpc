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

const viewState = {
  expandGateArea: true,
  expandCodeArea: true,
  expandChartArea: true
};
const SIZE_INFO = {
  HEADER_HEIGHT: 60,
  CIRCUIT_AREA_HEADER_HEIGHT: 50,
  VERTICAL_SPACING: 10,
  GATE_AREA_HEADER_HEIGHT: 50,
  GATE_AREA_SECTION_LABEL_HEIGHT: 16,
};
const getGateAreaWidth = () => {
  if (viewState.expandGateArea) {
    return 300;
  }
  return 140;
};
const getCodeAreaWidth = () => {
  if (viewState.expandCodeArea) {
    return 300;
  }
  return 50;
};
const getChartAreaHeight = () => {
  if (viewState.expandChartArea) {
    return 200;
  }
  return 50;
};

const updateSizeViews = (parentDiv) => {
  const gateArea = document.getElementsByClassName('gate-area')[0];
  gateArea.style.maxWidth = getGateAreaWidth() + 'px';

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
  commonGates.style.maxHeight = (
    parentDiv.clientHeight -
    SIZE_INFO.HEADER_HEIGHT -
    SIZE_INFO.GATE_AREA_HEADER_HEIGHT -
    SIZE_INFO.GATE_AREA_SECTION_LABEL_HEIGHT * 2 -
    4 * SIZE_INFO.VERTICAL_SPACING) / 2.0 + 'px';
  advancedGates.style.maxHeight = commonGates.style.maxHeight;

  const codeArea = document.getElementsByClassName('code-area')[0];
  codeArea.style.maxWidth = getCodeAreaWidth() + 'px';

  const chartArea = document.getElementsByClassName('circuit-area-chart')[0];
  chartArea.style.maxHeight = getChartAreaHeight() + 'px';
}

const initSizeViews = (parentDiv) => {
  const closeGateAreaBtn = document.getElementById('gate-area-header-close-btn');
  const gridGateBtn = document.getElementById('gate-area-header-grid-btn');
  const listGateBtn = document.getElementById('gate-area-header-list-btn');
  const searchGateBox = document.getElementById('gate-area-header-search');
  closeGateAreaBtn.addEventListener('click', () => {
    viewState.expandGateArea = !viewState.expandGateArea;
    if (viewState.expandGateArea) {
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
    viewState.expandCodeArea = !viewState.expandCodeArea;
    updateSizeViews(parentDiv);
  });

  const closeChartAreaBtn = document.getElementById('circuit-area-chart-close-btn');
  closeChartAreaBtn.addEventListener('click', () => {
    viewState.expandChartArea = !viewState.expandChartArea;
    updateSizeViews(parentDiv);
  });
  updateSizeViews(parentDiv);
}

export {initSizeViews, updateSizeViews}
