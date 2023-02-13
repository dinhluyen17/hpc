import { hookErrorHandler } from "./fallback.js";
import { doDetectIssues } from "./issues.js";
hookErrorHandler();
doDetectIssues();

import { CircuitStats } from "./circuit/CircuitStats.js";
import { CooldownThrottle } from "./base/CooldownThrottle.js";
import { Config } from "./Config.js";
import { DisplayedInspector } from "./ui/DisplayedInspector.js";
import { Painter } from "./draw/Painter.js";
import { Rect } from "./math/Rect.js";
import { RestartableRng } from "./base/RestartableRng.js";
import { Revision } from "./base/Revision.js";
import { initSerializer, fromJsonText_CircuitDefinition } from "./circuit/Serializer.js";
import { TouchScrollBlocker } from "./browser/TouchScrollBlocker.js";
import { Util } from "./base/Util.js";
import { initializedWglContext } from "./webgl/WglContext.js";
import { watchDrags, isMiddleClicking, eventPosRelativeTo } from "./browser/MouseWatcher.js";
import { ObservableValue, ObservableSource } from "./base/Obs.js";
import { obsExportsIsShowing } from "./ui/exports.js";
import { obsForgeIsShowing } from "./ui/forge.js";
import { obsMenuIsShowing, closeMenu } from "./ui/menu.js";
import { initUndoRedo } from "./ui/undo.js";
import { initUrlCircuitSync } from "./ui/url.js";
import { initTitleSync } from "./ui/title.js";
import { simulate } from "./ui/sim.js";
import { GatePainting } from "./draw/GatePainting.js";
import { GATE_CIRCUIT_DRAWER } from "./ui/DisplayedCircuit.js";
import { GateColumn } from "./circuit/GateColumn.js";
import { Point } from "./math/Point.js";
import { initGateViews } from "./ui/initGateViews.js";
import { initSizeViews, updateSizeViews } from "./ui/updateSizeViews.js";
import { viewState } from "./ui/viewState.js";
import { Gates } from "./gates/AllGates.js";
import backendApiConfig from "./configs/apiConfig.js";
document.API_ADDRESS.qpshere(backendApiConfig.API_Q_SPHERE);
document.API_ADDRESS.historyQSphere(backendApiConfig.API_HISTORY_Q_SPHERE);

const codeArea = document.getElementById("code-area");
const gateArea = document.getElementById("gate-area");
const chartArea = document.getElementById("circuit-chart");
const canvasDiv = document.getElementById("app");
const canvas = document.getElementById("drawCanvas");
const dragCanvas = document.getElementById("dragCanvas");
const gateInfoCanvas = document.getElementById("gateInfo");
const canvasSim = document.getElementById("drawCanvasSim");
const loader = document.getElementById("loading");
const simulator = document.getElementById("simSelectId");
const stateBarChartFilter = document.getElementById("stateBarChartFilterZero");
const textCode = document.getElementById("text-code");
let startResizeCodeArea = false;
let startResizeGateArea = false;
let startResizeChartArea = false;
let posResize;
let haveLoaded = false;
let circuitName;
let barData = [];
let simulatorType = "client";
let aerVector;
let aerStates;
let aerPhase;
let aerProb;
let aerKeys;
let sortSwitch = false;
let tableSortSwitch = false;
let barDataFilterSwitch = true;
let vectFilterSwitch = false;
let clickDownGateButtonKey = undefined;
let timmer;
let qasmHistory = "";

initSerializer(
  GatePainting.LABEL_DRAWER,
  GatePainting.MATRIX_DRAWER,
  GATE_CIRCUIT_DRAWER,
  GatePainting.LOCATION_INDEPENDENT_GATE_DRAWER
);
const displayed = new ObservableValue(DisplayedInspector.empty(new Rect(0, 0, canvas.clientWidth, canvas.clientHeight)));
const mostRecentStats = new ObservableValue(CircuitStats.EMPTY);
let revision = Revision.startingAt(displayed.get().snapshot());
viewState.getInstance().revision = revision;

const semiStableRng = (() => {
  const target = { cur: new RestartableRng() };
  let cycleRng;
  cycleRng = () => {
    target.cur = new RestartableRng();
    setTimeout(cycleRng, Config.SEMI_STABLE_RANDOM_VALUE_LIFETIME_MILLIS * 0.99);
  };
  cycleRng();
  return target;
})();

const isSupportBarChart = () => {
  const currentWireNumber = displayed.get().displayedCircuit.circuitDefinition.numWires;
  if (currentWireNumber <= 10) {
    document.getElementById("barChartDes").style.visibility = 'hidden';
    document.getElementById("stateBarChart").style.visibility = 'visible';
    return true;
  } else {
    //NOT SUPPORT > 10 QUBITS
    document.getElementById("barChartDes").style.visibility = 'visible';
    document.getElementById("stateBarChart").style.visibility = 'hidden';
    return false;
  }
}

const isSupportClientChart = () => {
  if (simulatorType == "client") {
    document.getElementById("stateBarChart").style.visibility = 'visible';
    document.getElementById("stateBarChartFilterZero").style.visibility = "visible";
    document.getElementById("stateBarChartFilterZero").disabled = false;
    document.getElementById("sortBar").style.visibility = "visible";
    document.getElementById("changeState").style.visibility = "visible";
    return true;
  } else {
    document.getElementById("stateBarChart").style.visibility = "hidden";
    document.getElementById("stateBarChartFilterZero").style.visibility = "hidden";
    document.getElementById("sortBar").style.visibility = "hidden";
    document.getElementById("changeState").style.visibility = "hidden";
    return false;
  }
};

const isSupportStateTable = () => {
  const currentWireNumber = displayed.get().displayedCircuit.circuitDefinition.numWires;
  if (currentWireNumber <= 10) {
    document.getElementById("stateTableDes").style.display = 'none';
    document.getElementById("vectorTable").style.display = 'table';
    return true;
  } else {
    //NOT SUPPORT > 10 QUBITS
    document.getElementById("stateTableDes").style.display = 'block';
    document.getElementById("vectorTable").style.display = 'none';
    return false;
  }
};

const changeTab = (tab) => {
  if (tab == 'circuit') {
    let e = document.getElementById("circuit");
    e.classList.remove("hidden");
    let eT = document.getElementById("circuitTab");
    eT.setAttribute("data-state", "active")

    let e2 = document.getElementById("simulate");
    e2.classList.add("hidden");
    let e2T = document.getElementById("simulateTab");
    e2T.setAttribute("data-state", "inactive");

    viewState.getInstance().currentTab = 'circuit';
    const canvas = document.getElementById("circuit-area-body");
    let canvasBox = canvas.getBoundingClientRect();
    viewState.getInstance().canvasBoundingRect = {
      clientX: canvasBox.left,
      clientY: canvasBox.top,
      width: canvasBox.width,
      height: canvasBox.height
    }
  } else {
    let e = document.getElementById("circuit");
    e.classList.add("hidden");
    let eT = document.getElementById("circuitTab");
    eT.setAttribute("data-state", "inactive");

    let e2 = document.getElementById("simulate");
    e2.classList.remove("hidden");
    let e2T = document.getElementById("simulateTab");
    e2T.setAttribute("data-state", "active");

    viewState.getInstance().currentTab = 'simulate';
    let canvas = document.getElementById("canvasSimWrapper")
    let canvasBox = canvas.getBoundingClientRect();
    viewState.getInstance().canvasBoundingRect = {
      clientX: canvasBox.left,
      clientY: canvasBox.top,
      width: canvasBox.width,
      height: canvasBox.height
    }
    if (isSupportStateTable()) {
      simStatCalc();
    }
  }
};

window.addEventListener('message', (e) => {
  // Handle message from vuejs
  if (e.data) {
    try {
      const obj = JSON.parse(e.data);
      if (obj && obj.messageFrom == 'vuejs') {
        const actionType = obj.actionType;
        console.log(actionType)
        if (actionType == 'loaded_circuit_json') {
          if (obj.detailData && obj.detailData.length > 0) {
            revision.commit(obj.detailData);
          }
        } else if (actionType == 'get_circuit_json') {
          const qasm = document.getElementById("text-code")
          const qiskit = convert(document.getElementById("text-code-qiskit"));
          const postDetailData = {
            "json": revision.getLatestCommit(),
            "qasm": qasm.value,
            "qiskit": qiskit
          }
          window.parent.postMessage(JSON.stringify({
            messageFrom: 'quantum_composer',
            actionType: 'current_circuit_json',
            detailData: postDetailData,
          })
          );
        } else if (actionType == 'set_circuit_json' || actionType == 'set_circuit_qasm') {
          viewState.getInstance().wireNumber = undefined;
          revision.commit(obj.detailData);
        } else if (actionType == 'change_tab') {
          changeTab(obj.detailData);
        } else if (actionType == 'send_circuit_name') {
          circuitName = obj.detailData;
          document.qSphere.history(circuitName);
        }
      }
    } catch (e) {
    }
  }
});

//data for bar chart and simulation
simulator.addEventListener("change", function () {
  simulatorType = simulator.value;
  if (simulatorType == "client") {
    document.getElementById("runButton").disabled = true;
    if (isSupportBarChart() && isSupportClientChart()) {
      if (barDataFilterSwitch == false) {
        if (sortSwitch == false) {
          document.D3_FUNCTION.bar(stateBarCalc());
        } else {
          handleSortedData(barData);
        }
      } else {
        let barDataFilter = stateBarCalc().filter(
          (val) => !val.Probability.match(/^0\.0+$/)
        );
        if (sortSwitch == false) {
          document.D3_FUNCTION.bar(barDataFilter);
        } else {
          handleSortedData(barDataFilter);
        }
      }
    }
  }
  if (simulatorType != "client") {
    let printVect = document.getElementById("dataOutput");
    printVect.innerHTML = "";
    aerVector = "";
    aerStates = "";
    aerPhase = "";
    aerProb = "";
    aerKeys = "";
    document.getElementById("runButton").disabled = false;
  }
  isSupportClientChart();
});

$('#runButton').click(function () {
  if (simulatorType != "qAer") {
    return
  }
  loader.classList.add("display");
  const qiskitCode = document.querySelectorAll(".line-content");
  fetch(backendApiConfig.API_RETURN_HISTORY, {
    method: "POST",
    headers: {
      "content-type": "text/plain",
    },
    body: getContentQiskit(qiskitCode) + importPythonLibraryCount,
  })
    .then((res) => {
      return res.text()
    })
    .then((data) => {
      loader.classList.remove("display");
      barData = jQuery.parseJSON(data)
      document.getElementById("barChartDes").style.visibility = 'hidden';
      document.getElementById("stateBarChart").style.visibility = 'visible';
      document.getElementById("sortBar").style.visibility = "visible";
      document.D3_FUNCTION.bar(barData)
    })
    .catch((error) => {
      console.error("Error: ", error);
    });
  fetch(backendApiConfig.API_SIM_DATA, {
    method: "POST",
    headers: {
      "content-type": "text/plain"
    },
    body: getContentQiskit(qiskitCode) + importPythonLibrary,
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      aerVector = data.qVector;
      aerStates = data.qStates;
      aerPhase = data.qPhase;
      aerProb = data.qProb;
      simStatCalc()
    });
  fetch(backendApiConfig.API_SAVE_HISTORY, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "circuitName": circuitName
    })
  })
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      console.log(data)
    })
    .catch((error) => {
      console.error("Error: ", error)
    });
});

let stateBarCalc = () => {
  if (simulatorType == "client") {
    let qHeight = mostRecentStats.get().finalState.height();
    if (qHeight <= 2048) {
      document.getElementById("barChartDes").style.visibility = 'hidden';
      document.getElementById("stateBarChart").style.visibility = 'visible';
      let qNumWire = mostRecentStats.get().circuitDefinition.numWires;
      let qStates = [];
      for (let i = 0; i < qHeight; i++) {
        qStates[i] = Util.bin(i, qNumWire);
      }
      let select = document.getElementById("changeState");
      let val = select.value;
      let currentVal = "default";
      switch (val) {
        case "Binary":
          if (currentVal != "default")
            for (let i in qStates) {
              let x = parseInt(qStates[i])
              qStates[i] = x.toString(2)
            }
          currentVal = "Binary";
          break;
        case "Decimal":
          for (let i in qStates) {
            let x;
            if (currentVal == "Binary" || currentVal == "default") {
              x = parseInt(qStates[i], 2)
            } else {
              x = qStates[i].toString(10)
            }
            qStates[i] = x
          }
          currentVal = "Decimal";
          break;
        case "Hexadecimal":
          for (let i in qStates) {
            let x;
            if (currentVal == "Binary" || currentVal == "default") {
              x = parseInt(qStates[i], 2).toString(16).toUpperCase();
            } else {
              x = qStates[i].toString(16).toUpperCase();
            }
            qStates[i] = x;
          }
          currentVal = "Hexadecimal";
          break;
      }
      let qProb = [];
      for (let i = 0; i < mostRecentStats.get().finalState._buffer.length; i++) {
        let x = mostRecentStats.get().finalState._buffer;
        let y = x[i];
        let z = x[i + 1];
        if (i % 2 == 0) {
          let k = i / 2;
          let j = Math.pow(y, 2) + Math.pow(z, 2);
          qProb[k] = (j * 100).toFixed(4);
        }
      }
      const stateObj = qStates.map((str, index) =>
      ({
        id: index, State: qStates[index]
      }))
      const probObj = qProb.map((str, index) => ({
        id: index, Probability: qProb[index]
      }))
      let data = {}
      const data2 = stateObj.reduce((a, c) => (a[c.id] = c, a), {})
      data = probObj.map(o => Object.assign(o, data2[o.id]))
      barData = data;
      return data;
    } else {
      //NOT SUPPORT > 10 QUBITS
      document.getElementById("barChartDes").style.visibility = 'visible';
      document.getElementById("stateBarChart").style.visibility = 'hidden';
    }
  } else {
    return barData
  }
};

function compareData(a, b) {
  const dataA = a.Probability;
  const dataB = b.Probability;
  return dataB - dataA;
};

let handleSortedData = (barData) => {
  let sortedData = barData.sort(compareData);
  document.D3_FUNCTION.bar(sortedData);
};

document.getElementById("sortBar").addEventListener("click", function (e) {
  if (!isSupportBarChart()) {
    return;
  }
  sortSwitch = !sortSwitch;
  if (barDataFilterSwitch == false) {
    if (sortSwitch == false) {
      document.D3_FUNCTION.bar(stateBarCalc())
    } else {
      handleSortedData(barData)
    }
  } else {
    let barDataFilter = barData.filter(val => !val.Probability.match(/^0\.0+$/));
    if (sortSwitch == false) {
      document.D3_FUNCTION.bar(barDataFilter);
    } else {
      handleSortedData(barDataFilter)
    }
  }
});

document.getElementById("changeState").addEventListener("change", function (e) {
  if (!isSupportBarChart()) {
    return;
  }
  if (document.getElementById("changeState").value !== "Binary" || document.getElementById("changeState").value !== "default") {
    document.D3_FUNCTION.bar(stateBarCalc(), viewState.getInstance().chartAreaHeight + 50);
  } else {
    document.D3_FUNCTION.bar(stateBarCalc())
  }
});

let simStatCalc = () => {
  if (simulatorType == "client") {
    let qHeight = mostRecentStats.get().finalState.height();
    if (qHeight <= 2048) {
      let qNumWire = mostRecentStats.get().circuitDefinition.numWires;
      let qStates = [];
      for (let i = 0; i < qHeight; i++) {
        qStates[i] = Util.bin(i, qNumWire);
      }
      let qProb = [];
      let qVector = [];
      let qPhase = [];
      for (let i = 0; i < mostRecentStats.get().finalState._buffer.length; i++) {
        let x = mostRecentStats.get().finalState._buffer;
        let y = x[i];
        let z = x[i + 1];
        if (i % 2 == 0) {
          let k = i / 2;
          let j = Math.pow(y, 2) + Math.pow(z, 2);
          qVector[k] = (y < 0 ? "" : "+") + y.toFixed(5) + (z < 0 ? "" : "+") + z.toFixed(5) + "i";
          qPhase[k] = Math.atan2(z, y).toFixed(5) + "°";
          qProb[k] = (j * 100).toFixed(4);
        }
      }
      let printVect = document.getElementById("dataOutput");
      printVect.innerHTML = "";
      for (let i = 0; i < qVector.length; i++) {
        let output = document.createElement("tr");
        let state = document.createElement("td");
        state.innerText = qStates[i];
        let vect = document.createElement("td");
        vect.innerText = qVector[i];
        let rad = document.createElement("td");
        rad.innerText = qPhase[i];
        let prob = document.createElement("td");
        prob.innerText = qProb[i] + "%";
        output.append(state, vect, rad, prob)
        printVect.appendChild(output)
      }
      document.getElementById("vectorTable").appendChild(printVect)
      document.getElementById("barChartDes").style.visibility = 'hidden';
    } else {
      //NOT SUPPORT > 10 QUBITS
      document.getElementById("barChartDes").style.visibility = 'visible';
    }
  } else {
    let printVect = document.getElementById("dataOutput");
    printVect.innerHTML = "";
    aerKeys = Object.keys(aerVector);
    for (let i = 0; i < aerKeys.length; i++) {
      let key = aerKeys[i]
      let output = document.createElement("tr");
      let state = document.createElement("td");
      state.innerText = aerStates[i];
      let vect = document.createElement("td");
      vect.innerText = "+" + aerVector[key].real.toFixed(3) + "+" + aerVector[key].imag.toFixed(3) + "i";
      let rad = document.createElement("td");
      rad.innerText = aerPhase[i].toFixed(3) + " radian";
      let prob = document.createElement("td");
      prob.innerText = aerProb[i].toFixed(3) + "%";
      output.append(state, vect, rad, prob)
      printVect.appendChild(output)
    }
    document.getElementById("vectorTable").appendChild(printVect)
  }
};

let sortTable = () => {
  let table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("dataOutput");
  switching = true;
  if (tableSortSwitch == false) {
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 0; i < rows.length; i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("td")[3];
        y = rows[i + 1].getElementsByTagName("td")[3];
        if (parseFloat(x.innerHTML) > parseFloat(y.innerHTML)) {
          shouldSwitch = true;
          break;
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  } else {
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 0; i < rows.length; i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("td")[3];
        y = rows[i + 1].getElementsByTagName("td")[3];
        if (parseFloat(x.innerHTML) < parseFloat(y.innerHTML)) {
          shouldSwitch = true;
          break;
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }
};

document.getElementById("sortTable").addEventListener("click", function (e) {
  tableSortSwitch = !tableSortSwitch;
  if (tableSortSwitch) {
    document.getElementById("sortTableDown").classList.add("hidden")
    document.getElementById("sortTableUp").classList.remove("hidden")
  } else {
    document.getElementById("sortTableDown").classList.remove("hidden")
    document.getElementById("sortTableUp").classList.add("hidden")
  }
  sortTable();
});

document.getElementById("cancelSortTable").addEventListener("click", function (e) {
  if (!isSupportStateTable()) {
    return;
  }
  tableSortSwitch = false;
  document.getElementById("sortTableDown").classList.remove("hidden")
  document.getElementById("sortTableUp").classList.add("hidden")
  simStatCalc();
});

stateBarChartFilter.addEventListener('click', () => {
  if (!isSupportBarChart()) {
    return;
  }
  barDataFilterSwitch = !barDataFilterSwitch;
  if (barDataFilterSwitch == false) {
    stateBarChartFilter.innerHTML = "Hide zero states";
    if (sortSwitch == false) {
      document.D3_FUNCTION.bar(stateBarCalc());
    } else {
      handleSortedData(barData);
    }
  } else {
    stateBarChartFilter.innerHTML = "Show all states";
    let barDataFilter = stateBarCalc().filter(val => !val.Probability.match(/^0\.0+$/));
    if (sortSwitch == false) {
      document.D3_FUNCTION.bar(barDataFilter);
    } else {
      handleSortedData(barDataFilter);
    }
  }
});

document.getElementById("vectFilter").addEventListener('click', function (e) {
  if (!isSupportStateTable()) {
    return;
  }
  vectFilterSwitch = !vectFilterSwitch;
  let table = document.getElementById("vectorTable");
  let tr = table.getElementsByTagName("tr")
  if (vectFilterSwitch == true) {
    document.getElementById("probHeader").innerHTML = "Probability (Filtered)"
    document.getElementById("vectSearch").innerHTML = ""
    for (let i = 0; i < tr.length; i++) {
      let td = tr[i].getElementsByTagName("td")[3];
      if (td) {
        let value = td.textContent || td.innerText
        if (value.search(/^0.0000/) > -1) {
          tr[i].style.display = "none";
        } else if (value.search(/^0\%/) > -1) {
          tr[i].style.display = "none";
        } else {
          tr[i].style.display = "";
        }
      }
    }
  } else {
    document.getElementById("probHeader").innerHTML = "Probability (Full)"
    document.getElementById("vectSearch").innerHTML = ""
    simStatCalc();
  }
});

document.getElementById("stateSearchButton").addEventListener("click", function (e) {
  document.getElementById("stateHeaderText").classList.add("hidden");
  document.getElementById("stateSearchButton").classList.add("hidden");
  document.getElementById("vectSearch").classList.remove("hidden");
  document.getElementById("vectSearchCancel").classList.remove("hidden");
});

document.getElementById("vectSearchCancel").addEventListener("click", function (e) {
  document.getElementById("stateHeaderText").classList.remove("hidden");
  document.getElementById("stateSearchButton").classList.remove("hidden");
  document.getElementById("vectSearch").classList.add("hidden");
  document.getElementById("vectSearchCancel").classList.add("hidden");
});

document.getElementById("vectSearch").addEventListener("input", function (e) {
  if (!isSupportStateTable()) {
    return;
  }
  let search = document.getElementById("vectSearch").value;
  let table = document.getElementById("vectorTable");
  let tr = table.getElementsByTagName("tr")
  if (search != null && search != '' && search != undefined) {
    for (let i = 0; i < tr.length; i++) {
      let td = tr[i].getElementsByTagName("td")[0];
      if (td) {
        let value = td.textContent || td.innerText;
        if (value.indexOf(search)) {
          tr[i].style.display = 'none';
        } else {
          tr[i].style.display = "";
        }
      }
    }
    if ($("#dataOutput").children(":visible").length == 0 && $('#no-data3').length == 0) {
      let noData = document.createElement("div");
      noData.setAttribute('id', 'no-data3')
      noData.innerHTML = "No data"
      document.getElementById("simulateOutput").appendChild(noData)
    } else if ($("#dataOutput").children(":visible").length != 0) {
      $('#no-data3').remove()
    }
  } else {
    $('#no-data3').remove()
    simStatCalc()
  }
});

document.addEventListener('contextmenu', function (e) {
  if (viewState.getInstance().currentTab == 'circuit') {
    const hoverPos = viewState.getInstance().currentHoverPos;
    if (hoverPos) {
      const posX = hoverPos.x - viewState.getInstance().canvasScrollX + viewState.getInstance().canvasBoundingRect.clientX;
      const posY = hoverPos.y - viewState.getInstance().canvasScrollY + viewState.getInstance().canvasBoundingRect.clientY;
      if (posX >= viewState.getInstance().canvasBoundingRect.clientX &&
        posY >= viewState.getInstance().canvasBoundingRect.clientY &&
        posY <= viewState.getInstance().canvasBoundingRect.clientY + viewState.getInstance().canvasBoundingRect.height &&
        posX <= viewState.getInstance().canvasBoundingRect.clientX + viewState.getInstance().canvasBoundingRect.width) {
        viewState.getInstance().currentPastePos = hoverPos;
        const element = document.getElementById('paste-menu-popup');
        element.style.display = 'block';
        element.style.left = (hoverPos.x - viewState.getInstance().canvasScrollX + viewState.getInstance().canvasBoundingRect.clientX) + "px";
        element.style.top = (hoverPos.y - viewState.getInstance().canvasScrollY + viewState.getInstance().canvasBoundingRect.clientY - 44) + "px";
        e.preventDefault();
      }
    }
  }
}, false);

document.addEventListener("DOMContentLoaded", function () {
  if (!isSupportBarChart()) {
    return;
  }
  let barDataFilter = stateBarCalc().filter(val => !val.Probability.match(/^0\.0+$/));
  document.D3_FUNCTION.bar(barDataFilter, viewState.getInstance().chartAreaHeight);
});

revision.latestActiveCommit().subscribe(jsonText => {
  let circuitDef = fromJsonText_CircuitDefinition(
    jsonText,
    true,
    viewState.getInstance().wireNumber
  );
  if (
    circuitDef.customGateSet &&
    circuitDef.customGateSet.gates &&
    circuitDef.customGateSet.gates.length > 0
  ) {
    let hasNewGate = false;
    const newGateSet = new Set();
    circuitDef.customGateSet.gates.forEach((gate) => {
      gate.colorIndex = 3;
      if (!Gates.customGateSet.has(gate.serializedId)) {
        hasNewGate = true;
      }
      newGateSet.add(gate.serializedId);
    });
    if (hasNewGate) {
      Gates.CustomGateGroups[0].gates = [...circuitDef.customGateSet.gates];
      Gates.customGateSet = newGateSet;
      initGateViews();
    }
  }
  let newInspector = displayed.get().withCircuitDefinition(circuitDef);
  displayed.set(newInspector);

  if (isSupportBarChart() && isSupportClientChart()) {
    if (barDataFilterSwitch == false) {
      if (sortSwitch == false) {
        document.D3_FUNCTION.bar(stateBarCalc());
      } else {
        handleSortedData(barData);
      }
    } else {
      let barDataFilter = stateBarCalc().filter(
        (val) => !val.Probability.match(/^0\.0+$/)
      );
      if (sortSwitch == false) {
        document.D3_FUNCTION.bar(barDataFilter);
      } else {
        handleSortedData(barDataFilter);
      }
    }
  }

  //call api to generate qasm code
  const quantumCode = document.getElementById("text-code");
  const textQiskit = document.getElementById("text-code-qiskit");
  const error = document.getElementById("error-notice")
  fetch(backendApiConfig.API_JSON_TO_QASM, {
    method: "POST",
    headers: {
      "content-type": "text/html",
    },
    body: jsonText,
  })
    .then((res) => {
      return res.text();
    })
    .then((data) => {
      if (quantumCode.readOnly == true) {
        quantumCode.readOnly = false
      }
      quantumCode.value = data;
      const lineNumbers = document.querySelector(".line-numbers-qasm");
      const numberOfLines = data.split("\n").length;
      lineNumbers.innerHTML = Array(numberOfLines)
        .fill("<span></span>")
        .join("");
      //css height of text area qasm code
      quantumCode.style.height = (quantumCode.scrollHeight > quantumCode.clientHeight) ? (quantumCode.scrollHeight) + "px" : "100%";
      //if data is not start with //generate then show error message
      if (data.startsWith('OPENQASM 2.0;')) {
        qasmHistory = data;
        if (!error.classList.contains('hide')) {
          error.classList.add('hide')
        }
      }
      else {
        if (error.classList.contains('hide')) {
          error.classList.remove('hide')
          quantumCode.readOnly = true;
          quantumCode.value = qasmHistory;
        }
      }
      //function to generate qiskit code
      const dataTest = qasmToQiskit(quantumCode.value)
      const a = dataTest.split('\n')
      textQiskit.innerHTML = ''
      for (var i = 0; i < a.length; i++) {
        const divElement = document.createElement('div'); divElement.setAttribute("class", "code-line")
        const divLineCount = document.createElement("div"); divLineCount.setAttribute("class", "line-number")
        const divLineContent = document.createElement("div"); divLineContent.setAttribute("class", "line-content")
        if (a[i] != '') {
          divLineContent.innerText = a[i]
        } else {
          divLineContent.appendChild(document.createElement('br'))
        }
        divLineCount.innerText = i + 1
        divElement.appendChild(divLineCount)
        divElement.appendChild(divLineContent)
        textQiskit.appendChild(divElement)
      }
    })
    .catch((error) => {
      console.error("Log error:", error);
    });
});

let desiredCanvasSizeFor = curInspector => {
  return {
    w: curInspector.desiredWidth(),
    h: curInspector.desiredHeight()
  };
};
const syncArea = ins => {
  let size = desiredCanvasSizeFor(ins);
  ins.updateArea(new Rect(0, 0, size.w, size.h));
  return ins;
};

// Gradually fade out old errors as user manipulates circuit.
displayed.observable().map(e => e.displayedCircuit.circuitDefinition).whenDifferent(Util.CUSTOM_IS_EQUAL_TO_EQUALITY).subscribe(() => {
  let errDivStyle = document.getElementById('error-div').style;
  errDivStyle.opacity *= 0.9;
  if (errDivStyle.opacity < 0.06) {
    errDivStyle.display = 'None'
  }
});

let redrawThrottle;
const scrollBlocker = new TouchScrollBlocker(canvasDiv);
const redrawNow = () => {
  if (!haveLoaded) {
    // Don't draw while loading. It's a huge source of false-positive circuit-load-failed errors during development.
    return;
  }

  let shown = syncArea(displayed.get()).previewDrop();
  if (displayed.get().hand.isHoldingSomething() && !shown.hand.isHoldingSomething()) {
    shown = shown.withHand(shown.hand.withHeldGateColumn(new GateColumn([]), new Point(0, 0)))
  }
  let stats = simulate(shown.displayedCircuit.circuitDefinition);
  mostRecentStats.set(stats);

  let size = desiredCanvasSizeFor(shown);
  canvas.width = size.w;
  canvas.height = size.h;
  let simArea = document.getElementById("simulate");
  canvasSim.width = size.w + 250;
  canvasSim.height = size.h;
  gateInfo.width = 500;
  gateInfo.height = 500;
  let painter = new Painter(canvas, semiStableRng.cur.restarted());
  let dragPainter = new Painter(dragCanvas, semiStableRng.cur.restarted());
  let gateInfoPainter = new Painter(gateInfoCanvas, semiStableRng.cur.restarted());
  let simPainter = new Painter(canvasSim, semiStableRng.cur.restarted());
  shown.updateArea(painter.paintableArea());
  shown.paint(painter, stats, dragPainter, simPainter, gateInfoPainter);
  painter.paintDeferred();
  dragPainter.paintDeferred();
  gateInfoPainter.paintDeferred();
  simPainter.paintDeferred();

  displayed.get().hand.paintCursor(painter);
  scrollBlocker.setBlockers(painter.touchBlockers, painter.desiredCursorStyle);
  canvas.style.cursor = painter.desiredCursorStyle || 'auto';

  let dt = displayed.get().stableDuration();
  if (dt < Infinity) {
    window.requestAnimationFrame(() => redrawThrottle.trigger());
  }
};
redrawThrottle = new CooldownThrottle(redrawNow, Config.REDRAW_COOLDOWN_MILLIS, 0.1, true);
window.addEventListener('resize', () => {
  updateSizeViews(canvasDiv);
  redrawThrottle.trigger()
}, false);
displayed.observable().subscribe(() => redrawThrottle.trigger());

const hideAllMenu = () => {
  const pasteMenu = document.getElementById('paste-menu-popup');
  const gateMenu = document.getElementById('gate-menu-popup');
  const gateInfo = document.getElementById('gateInfo');
  gateMenu.style.display = 'none';
  pasteMenu.style.display = 'none';
  gateInfo.style.display = 'none';
};

canvasDiv.addEventListener('click', ev => {
  let pt = eventPosRelativeTo(ev, canvasDiv);
  let curInspector = displayed.get();
  if (curInspector.tryGetHandOverButtonKey() !== clickDownGateButtonKey) {
    return;
  }
  const pasteMenu = document.getElementById('paste-menu-popup');
  const element = document.getElementById('gate-menu-popup');
  element.style.display = 'none';

  if (pasteMenu.style.display == 'block') {
    pasteMenu.style.display = 'none';
  }
  else {
    if (viewState.getInstance().waitingInfoGate) {
      viewState.getInstance().waitingInfoGate = null;
      const gateRect = viewState.getInstance().gateMenuPos.gateRect;
      const element = document.getElementById('gateInfo');
      element.style.display = 'block';
      element.style.left = (gateRect.x - viewState.getInstance().canvasScrollX + viewState.getInstance().canvasBoundingRect.clientX + 50) + "px";
      element.style.top = (gateRect.y - viewState.getInstance().canvasScrollY + viewState.getInstance().canvasBoundingRect.clientY) + "px";
    }
    else {
      const gateInfo = document.getElementById('gateInfo');
      gateInfo.style.display = 'none';
      viewState.getInstance().showInfoGate = null;

      if (viewState.getInstance().canShowGateMenu && viewState.getInstance().highlightGate != null) {
        viewState.getInstance().gateMenuPos = viewState.getInstance().highlightGate;
        const gateRect = viewState.getInstance().highlightGate.gateRect;
        const element = document.getElementById('gate-menu-popup');
        element.style.display = 'flex';
        element.style.left = (gateRect.x - viewState.getInstance().canvasScrollX + viewState.getInstance().canvasBoundingRect.clientX) + "px";
        element.style.top = (gateRect.y - viewState.getInstance().canvasScrollY + viewState.getInstance().canvasBoundingRect.clientY - 50) + "px";
      }

      redrawThrottle.trigger();
    }
  }

  let clicked = syncArea(curInspector.withHand(curInspector.hand.withPos(pt))).tryClick();

  if (clicked !== undefined) {
    revision.commit(clicked.afterTidyingUp().snapshot());
  }
  viewState.getInstance().skipDeleteWire = false;
});

watchDrags(canvasDiv,
  /**
   * Grab
   * @param {!Point} pt
   * @param {!MouseEvent|!TouchEvent} ev
   */
  (pt, ev) => {
    let oldInspector = displayed.get();
    let newHand = oldInspector.hand.withPos(pt);
    let newInspector = syncArea(oldInspector.withHand(newHand));
    clickDownGateButtonKey = (
      ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey ? undefined : newInspector.tryGetHandOverButtonKey());
    if (clickDownGateButtonKey !== undefined) {
      displayed.set(newInspector);
      return;
    }

    newInspector = newInspector.afterGrabbing(ev.shiftKey, ev.ctrlKey || ev.metaKey);
    if (displayed.get().isEqualTo(newInspector) || !newInspector.hand.isBusy()) {
      return;
    }

    // Add extra wire temporarily.
    revision.startedWorkingOnCommit();
    displayed.set(
      syncArea(oldInspector.withHand(newHand).withJustEnoughWires(newInspector.hand, 1)).
        afterGrabbing(ev.shiftKey, ev.ctrlKey || ev.metaKey, false, ev.altKey));

    ev.preventDefault();
  },
  /**
   * Cancel
   * @param {!MouseEvent|!TouchEvent} ev
   */
  ev => {
    revision.cancelCommitBeingWorkedOn();
    ev.preventDefault();
  },
  /**
   * Drag
   * @param {undefined|!Point} pt
   * @param {!MouseEvent|!TouchEvent} ev
   */
  (pt, ev) => {
    if (!displayed.get().hand.isBusy()) {
      return;
    }

    let newHand = displayed.get().hand.withPos(pt);
    let newInspector = displayed.get().withHand(newHand);
    displayed.set(newInspector);
    ev.preventDefault();
  },
  /**
   * Drop
   * @param {undefined|!Point} pt
   * @param {!MouseEvent|!TouchEvent} ev
   */
  (pt, ev) => {
    if (!displayed.get().hand.isBusy()) {
      return;
    }

    let newHand = displayed.get().hand.withPos(pt);
    let newInspector = syncArea(displayed.get()).withHand(newHand).afterDropping().afterTidyingUp();
    let clearHand = newInspector.hand.withPos(undefined);
    let clearInspector = newInspector.withJustEnoughWires(clearHand, 0);
    revision.commit(clearInspector.snapshot());
    ev.preventDefault();
  });

// Middle-click to delete a gate.
canvasDiv.addEventListener('mousedown', ev => {
  const codeAreaBox = codeArea.getBoundingClientRect();
  const gateAreaBox = gateArea.getBoundingClientRect();
  const chartAreaBox = chartArea.getBoundingClientRect();
  if (Math.abs(codeAreaBox.left - ev.clientX) < 4) {
    startResizeCodeArea = true;
    posResize = ev.clientX;
  }
  else if (Math.abs(gateAreaBox.right - ev.clientX) < 4) {
    startResizeGateArea = true;
    posResize = ev.clientX;
  }
  else if (Math.abs(chartAreaBox.top - ev.clientY) < 4) {
    startResizeChartArea = true;
    posResize = ev.clientY;
  }

  document.GRAB_GATE = undefined;
  viewState.getInstance().highlightGate = null;
  viewState.getInstance().canShowGateMenu = true;
  if (!isMiddleClicking(ev)) {
    return;
  }
  let cur = syncArea(displayed.get());
  let initOver = cur.tryGetHandOverButtonKey();
  let newHand = cur.hand.withPos(eventPosRelativeTo(ev, canvas));
  let newInspector;
  if (initOver !== undefined && initOver.startsWith('wire-init-')) {
    let newCircuit = cur.displayedCircuit.circuitDefinition.withSwitchedInitialStateOn(
      parseInt(initOver.substr(10)), 0);
    newInspector = cur.withCircuitDefinition(newCircuit).withHand(newHand).afterTidyingUp();
  } else {
    newInspector = cur.
      withHand(newHand).
      afterGrabbing(false, false, true, false). // Grab the gate.
      withHand(newHand). // Lose the gate.
      afterTidyingUp().
      withJustEnoughWires(newHand, 0);
  }
  if (!displayed.get().isEqualTo(newInspector)) {
    revision.commit(newInspector.snapshot());
    ev.preventDefault();
  }
});

// When mouse moves without dragging, track it (for showing hints and things).
canvasDiv.addEventListener('mousemove', ev => {
  resizeCodeArea(ev);
  resizeGateArea(ev);
  const isChartResizableArea = ev.target.classList.contains('circuit-area-chart') || ev.target.nodeName === "svg" || ev.target.nodeName === "CANVAS";
  if (isChartResizableArea)
    resizeChartArea(ev);
  viewState.getInstance().canShowGateMenu = false;
  if (!displayed.get().hand.isBusy()) {
    const pos = eventPosRelativeTo(ev, canvas);
    let newHand = displayed.get().hand.withPos(pos);
    let newInspector = displayed.get().withHand(newHand);
    displayed.set(newInspector);
  }
});

canvasDiv.addEventListener('mouseup', ev => {
  startResizeCodeArea = false;
  startResizeGateArea = false;
  startResizeChartArea = false;

  const pos = eventPosRelativeTo(ev, canvas);
  if (viewState.getInstance().addWireBtnRect.containsPoint(pos)) {
    viewState.getInstance().skipDeleteWire = true;
    const currentWireNumber = displayed.get().displayedCircuit.circuitDefinition.numWires;
    viewState.getInstance().wireNumber = currentWireNumber + 1;
    let circuitDef = fromJsonText_CircuitDefinition(revision.getLatestCommit(), true, viewState.getInstance().wireNumber);
    let newInspector = displayed.get().withCircuitDefinition(circuitDef);
    displayed.set(newInspector);
  }
});

canvasDiv.addEventListener('mouseleave', () => {
  startResizeCodeArea = false;
  startResizeGateArea = false;
  startResizeChartArea = false;
  document.GRAB_GATE = undefined;
  viewState.getInstance().highlightGate = null;
  viewState.getInstance().canShowGateMenu = true;
  if (!displayed.get().hand.isBusy()) {
    let newHand = displayed.get().hand.withPos(undefined);
    let newInspector = displayed.get().withHand(newHand);
    displayed.set(newInspector);
  }
});

let obsIsAnyOverlayShowing = new ObservableSource();
initGateViews();
initSizeViews(canvasDiv);
initUrlCircuitSync(revision);
initUndoRedo(revision, obsIsAnyOverlayShowing.observable(), redrawThrottle);
initTitleSync(revision);
obsForgeIsShowing.zipLatest(obsExportsIsShowing, (e1, e2) => e1 || e2).zipLatest(obsMenuIsShowing, (e1, e2) => e1 || e2).whenDifferent().subscribe(e => {
  obsIsAnyOverlayShowing.send(e);
  canvasDiv.tabIndex = e ? -1 : 0;
});

// If the webgl initialization is going to fail, don't fail during the module loading phase.
haveLoaded = true;
setTimeout(() => {
  redrawNow();
  document.getElementById("loading-div").style.display = 'none';
  document.getElementById("close-menu-button").style.display = 'block';
  if (!displayed.get().displayedCircuit.circuitDefinition.isEmpty()) {
    closeMenu();
  }

  try {
    initializedWglContext().onContextRestored = () => redrawThrottle.trigger();
  } catch (ex) {
    // If that failed, the user is already getting warnings about WebGL not being supported.
    // Just silently log it.
    console.error(ex);
  }
}, 0);
window.parent.postMessage(JSON.stringify({
  messageFrom: 'quantum_composer',
  actionType: 'setup_finish'
}));
hideAllMenu();

function resizeCodeArea(e) {
  if (startResizeCodeArea) {
    const dx = posResize - e.clientX;
    posResize = e.clientX;
    viewState.getInstance().codeAreaWidth += dx;
    if (viewState.getInstance().codeAreaWidth < 50) {
      viewState.getInstance().codeAreaWidth = 50;
    }
    updateSizeViews(canvasDiv);
  }
};

function resizeGateArea(e) {
  if (startResizeGateArea) {
    const dx = posResize - e.clientX;
    posResize = e.clientX;
    viewState.getInstance().gateAreaWidth -= dx;
    if (viewState.getInstance().gateAreaWidth < 130) {
      viewState.getInstance().gateAreaWidth = 130;
    }
    updateSizeViews(canvasDiv);
  }
};

function resizeChartArea(e) {
  if (startResizeChartArea) {
    const dy = posResize - e.clientY;
    posResize = e.clientY;
    viewState.getInstance().chartAreaHeight += dy;
    if (viewState.getInstance().chartAreaHeight < 50) {
      viewState.getInstance().chartAreaHeight = 50;
    }
    if (isSupportBarChart()) {
      if (barDataFilterSwitch == false) {
        if (sortSwitch == false) {
          document.D3_FUNCTION.bar(barData, viewState.getInstance().chartAreaHeight);
        } else {
          handleSortedData(barData, viewState.getInstance().chartAreaHeight)
        }
      } else {
        let barDataFilter = barData.filter(val => !val.Probability.match(/^0\.0+$/));
        if (sortSwitch == false) {
          document.D3_FUNCTION.bar(barDataFilter, viewState.getInstance().chartAreaHeight);
        } else {
          handleSortedData(barDataFilter, viewState.getInstance().chartAreaHeight)
        }
      }
    }
    updateSizeViews(canvasDiv);
  }
};

setTimeout(() => {
  redrawThrottle.trigger();
}, 500);

// draw circuit whenever there is a change on qasm code
textCode.addEventListener("keydown", () => {
  clearTimeout(timmer);
  timmer = setTimeout(() => {
    if (textCode && textCode.value.length > 0) {
      fetch(backendApiConfig.API_QASM_TO_JSON, {
        method: "POST",
        headers: {
          "content-type": "text/html",
        },
        body: textCode.value,
      })
        .then((res) => {
          return res.text();
        })
        .then((data) => {
          revision.commit(data)
        })
        .catch((error) => {
          const startText = `{"detail":`;
          const errorMessage = error.message.length >= error.message.indexOf(startText) + startText.length
            ? error.message.substr(error.message.indexOf(startText) + startText.length).replace('}', '')
            : 'Something went wrong with qasm code. Please try again!';
          window.parent.postMessage(JSON.stringify({
            messageFrom: 'quantum_composer',
            actionType: 'error_qasm_code_message',
            detailData: errorMessage
          }));
        });
    }
  }, 2500);
});

//replace <br> tag from a node element to \n
var convert = (function () {
  var convertElement = function (element) {
    switch (element.tagName) {
      case "BR":
        return "\n";
      case "P": // fall through to DIV
      case "DIV":
        return (element.previousSibling ? "\n" : "") + [].map.call(element.childNodes, convertElement).join("");
      default:
        return element.textContent;
    }
  };

  return function (element) {
    return [].map.call(element.childNodes, convertElement).join("");
  };
})();

const qasmToQiskit = (qasm) => {
  let circuit = new QuantumCircuit();
  circuit.importQASM(qasm);
  let qiskit = circuit.exportToQiskit()
  let remove = "backend = Aer.get_backend('qasm_simulator')\njob = execute(qc, backend=backend, shots=shots)\njob_result = job.result()\nprint(job_result.get_counts(qc))"
  qiskit = qiskit.replace(remove, "")
  return qiskit;
};

const qasmToJson = (qasm) => { //not used at this moment 
  let circuit = new QuantumCircuit();
  circuit.importQASM(qasm);
  let json = circuit.exportQuirk(true);
  json = JSON.stringify(json);
  return json
};