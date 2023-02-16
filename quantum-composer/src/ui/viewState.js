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
    this.currentTab = 'circuit';
    
    this.gateAreaWidth = 239;
    this.codeAreaWidth = 300;
    this.chartAreaHeight = 220;

    this.expandGateArea = true;
    this.expandCodeArea = true;
    this.expandChartArea = true;

    this.canvasScrollX = 0;
    this.canvasScrollY = 0;

    this.simScrollX = 0;
    this.simScrollY = 0;

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

    const simWrapper = document.getElementById("canvasSimWrapper");
    simWrapper.addEventListener("scroll", event => {
      viewState.getInstance().simScrollX = simWrapper.scrollLeft;
      viewState.getInstance().simScrollY = simWrapper.scrollTop;
    }, { passive: true });

    const measureGateImage = new Image();
    measureGateImage.src = './svg/measure_gate.svg';
    this.measureGateImage = measureGateImage;

    const addWireImage = new Image();
    addWireImage.src = './icon/add_wire_btn.png';
    this.addWireImage = addWireImage;

    const deleteImage = new Image();
    deleteImage.src = './svg/delete.svg';
    this.deleteImage = deleteImage;
    
    this.minCircuitWidth = 700;
    this.skipDeleteWire = false;
    this.wireNumber = undefined;
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
  HEADER_HEIGHT: 0,
  CIRCUIT_AREA_HEADER_HEIGHT: 50,
  VERTICAL_SPACING: 10,
  GATE_AREA_HEADER_HEIGHT: 50,
  GATE_AREA_SECTION_LABEL_HEIGHT: 16,
};

const getGateAreaWidth = () => {
  return viewState.getInstance().gateAreaWidth;
};
const getCodeAreaWidth = () => {
  return viewState.getInstance().codeAreaWidth;
};
const getChartAreaHeight = () => {
  return viewState.getInstance().chartAreaHeight; 
};


export {
  SIZE_INFO,
  viewState,
  getGateAreaWidth,
  getCodeAreaWidth,
  getChartAreaHeight
}