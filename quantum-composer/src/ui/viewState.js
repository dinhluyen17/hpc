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

class ViewState {
  constructor() {
    this.expandGateArea = true;
    this.expandCodeArea = true;
    this.expandChartArea = true;

    this.canvasScrollX = 0;
    this.canvasScrollY = 0;

    this.highlightGate = null;
    this.gateMenuPos = null;
    this.canShowGateMenu = true;

    this.currentCopyGateSymbol = null;

    this.currentHoverPos = null; 
    this.currentPastePos = null;

    this.waitingInfoGate = null;
    this.showInfoGate = null;

    this.canvasBoundingRect = {
      clientX: 0,
      clientY: 0,
      clientWidth: 0,
      clientHeight: 0
    }; 

    const canvasWrapper = document.getElementById("circuit-area-body");
    canvasWrapper.addEventListener("scroll", event => {
      this.canvasScrollX = canvasWrapper.scrollLeft;
      this.canvasScrollY = canvasWrapper.scrollTop;
    }, { passive: true });
  }
}

const viewState = (function () {
  var instance;
  function init() {
    return new ViewState();
  }

  return {
    getInstance: function () {
      if (!instance) instance = init();
      return instance;
    }
  }
})();

const SIZE_INFO = {
  HEADER_HEIGHT: 60,
  CIRCUIT_AREA_HEADER_HEIGHT: 50,
  VERTICAL_SPACING: 10,
  GATE_AREA_HEADER_HEIGHT: 50,
  GATE_AREA_SECTION_LABEL_HEIGHT: 16,
};

const getGateAreaWidth = () => {
  if (viewState.getInstance().expandGateArea) {
    return 320;
  }
  return 130;
};
const getCodeAreaWidth = () => {
  if (viewState.getInstance().expandCodeArea) {
    return 300;
  }
  return 50;
};
const getChartAreaHeight = () => {
  if (viewState.getInstance().expandChartArea) {
    return 200;
  }
  return 50;
};


export {
  SIZE_INFO,
  viewState,
  getGateAreaWidth,
  getCodeAreaWidth,
  getChartAreaHeight
}