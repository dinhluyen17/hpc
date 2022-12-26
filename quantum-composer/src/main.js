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

// It's important that the polyfills and error fallback get loaded first!
import {} from "./browser/Polyfills.js"
import {hookErrorHandler} from "./fallback.js"
hookErrorHandler();
import {doDetectIssues} from "./issues.js"
doDetectIssues();

import {CircuitStats} from "./circuit/CircuitStats.js"
import {CooldownThrottle} from "./base/CooldownThrottle.js"
import {Config} from "./Config.js"
import {DisplayedInspector} from "./ui/DisplayedInspector.js"
import {Painter} from "./draw/Painter.js"
import {Rect} from "./math/Rect.js"
import {RestartableRng} from "./base/RestartableRng.js"
import {Revision} from "./base/Revision.js"
import {initSerializer, fromJsonText_CircuitDefinition} from "./circuit/Serializer.js"
import {TouchScrollBlocker} from "./browser/TouchScrollBlocker.js"
import {Util} from "./base/Util.js"
import {initializedWglContext} from "./webgl/WglContext.js"
import {watchDrags, isMiddleClicking, eventPosRelativeTo} from "./browser/MouseWatcher.js"
import {ObservableValue, ObservableSource} from "./base/Obs.js"
import {initExports, obsExportsIsShowing} from "./ui/exports.js"
import {initForge, obsForgeIsShowing} from "./ui/forge.js"
import {initMenu, obsMenuIsShowing, closeMenu} from "./ui/menu.js"
import {initUndoRedo} from "./ui/undo.js"
import {initClear} from "./ui/clear.js"
import {initUrlCircuitSync} from "./ui/url.js"
import {initTitleSync} from "./ui/title.js"
import {simulate} from "./ui/sim.js"
import {GatePainting} from "./draw/GatePainting.js"
import {GATE_CIRCUIT_DRAWER} from "./ui/DisplayedCircuit.js"
import {GateColumn} from "./circuit/GateColumn.js";
import {Point} from "./math/Point.js";
import {initGateViews} from "./ui/initGateViews.js";
import {initSizeViews, updateSizeViews} from "./ui/updateSizeViews.js";
import { viewState } from "./ui/viewState.js";

const codeArea = document.getElementById("code-area");
const gateArea = document.getElementById("gate-area");
const chartArea = document.getElementById("circuit-chart");
let startResizeCodeArea = false;
let startResizeGateArea = false;
let startResizeChartArea = false;
let posResize;

initSerializer(
    GatePainting.LABEL_DRAWER,
    GatePainting.MATRIX_DRAWER,
    GATE_CIRCUIT_DRAWER,
    GatePainting.LOCATION_INDEPENDENT_GATE_DRAWER);

const canvasDiv = document.getElementById("app");
//noinspection JSValidateTypes
/** @type {!HTMLCanvasElement} */
const canvas = document.getElementById("drawCanvas");
const dragCanvas = document.getElementById("dragCanvas");
const gateInfoCanvas = document.getElementById("gateInfo");
const canvasSim = document.getElementById("drawCanvasSim");
//noinspection JSValidateTypes

if (!canvas) {
    throw new Error("Couldn't find 'drawCanvas'");
}
if (!canvasSim) {
    throw new Error("Couldn't find 'canvasSim");
}
//canvas.width = canvasDiv.clientWidth;
//canvas.height = window.innerHeight*0.9;
let haveLoaded = false;
const semiStableRng = (() => {
    const target = {cur: new RestartableRng()};
    let cycleRng;
    cycleRng = () => {
        target.cur = new RestartableRng();
        //noinspection DynamicallyGeneratedCodeJS
        setTimeout(cycleRng, Config.SEMI_STABLE_RANDOM_VALUE_LIFETIME_MILLIS*0.99);
    };
    cycleRng();
    return target;
})();

//noinspection JSValidateTypes
/** @type {!HTMLDivElement} */

/** @type {ObservableValue.<!DisplayedInspector>} */
const displayed = new ObservableValue(
    DisplayedInspector.empty(new Rect(0, 0, canvas.clientWidth, canvas.clientHeight)));
const mostRecentStats = new ObservableValue(CircuitStats.EMPTY);

/** @type {!Revision} */
let revision = Revision.startingAt(displayed.get().snapshot());

const changeTab = (tab) => {
    if (tab == 'circuit') {
        let e = document.getElementById("circuit");
        e.classList.remove("hidden");
        let eT = document.getElementById("circuitTab");
        eT.setAttribute("data-state","active")
    
        let e2 = document.getElementById("simulate");
        e2.classList.add("hidden");
        let e2T = document.getElementById("simulateTab");
        e2T.setAttribute("data-state","inactive");

        viewState.getInstance().currentTab = 'circuit';
        const canvas = document.getElementById("circuit-area-body");
        let canvasBox = canvas.getBoundingClientRect();
        viewState.getInstance().canvasBoundingRect = {
            clientX: canvasBox.left,
            clientY: canvasBox.top,
            width: canvasBox.width,
            height: canvasBox.height
        }        
    }
    else {
        let e = document.getElementById("circuit");
        e.classList.add("hidden");
        let eT = document.getElementById("circuitTab");
        eT.setAttribute("data-state","inactive");
    
        let e2 = document.getElementById("simulate");
        e2.classList.remove("hidden");
        let e2T = document.getElementById("simulateTab");
        e2T.setAttribute("data-state","active");
    
        viewState.getInstance().currentTab = 'simulate';
        let canvas = document.getElementById("canvasSimWrapper")
        let canvasBox = canvas.getBoundingClientRect();
        viewState.getInstance().canvasBoundingRect = {
            clientX: canvasBox.left,
            clientY: canvasBox.top,
            width: canvasBox.width,
            height: canvasBox.height
        }
        simStatCalc();
    }
}
window.addEventListener('message', (e) => {
    // handle message from vuejs
    if (e.data) {
        try {
            const obj = JSON.parse(e.data);
            if (obj && obj.messageFrom == 'vuejs') {
                const actionType = obj.actionType;
                if (actionType == 'loaded_circuit_json') {
                    if (obj.detailData && obj.detailData.length > 0) {
                        revision.commit(obj.detailData);
                    }                                       
                }
                else if (actionType == 'get_circuit_json') {
                    window.parent.postMessage(JSON.stringify({
                        messageFrom: 'quantum_composer',
                        actionType: 'current_circuit_json',
                        detailData: revision.getLatestCommit()
                    }));                                                    
                }
                else if (actionType == 'set_circuit_json') {
                    revision.commit(obj.detailData);                                              
                }
                else if (actionType == 'change_tab') {
                    changeTab(obj.detailData);                    
                }
            }
        } catch (e) {
        }
    }
});
//data for bar chart and simulation
let barData = [];
let stateBarCalc = () =>{
    let qHeight = mostRecentStats.get().finalState.height();
    let qNumWire = mostRecentStats.get().circuitDefinition.numWires;
    let qStates = [];
    for (let i = 0; i < qHeight; i++){
        qStates[i] = Util.bin(i,qNumWire);
    }
    let qProb = [];
    for (let i = 0; i < mostRecentStats.get().finalState._buffer.length; i++) {
        let x = mostRecentStats.get().finalState._buffer;
        let y = x[i];
        let z = x[i + 1];
        if (i % 2 == 0){
            let k = i/2;
            let j = Math.pow(y,2) + Math.pow(z, 2);
            qProb[k] = (j*100).toFixed(4);
        }
    }
    const stateObj = qStates.map((str, index)=>
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
}
function compareData(a,b){
    const dataA = a.Probability;
    const dataB = b.Probability;
    return dataB-dataA;
}
let sortSwitch = false;
let handleSortedData = (barData) => {
    let sortedData = barData.sort(compareData);
    document.D3_FUNCTION.bar(sortedData);
}
document.getElementById("sortBar").addEventListener("click", function (e){
    sortSwitch = !sortSwitch;
    if (barDataFilterSwitch == false){
        if (sortSwitch == false){
            document.D3_FUNCTION.bar(stateBarCalc())
        } else {
            handleSortedData(barData)
        }
    } else {
        let barDataFilter = barData.filter(val => !val.Probability.match(/^0.0000$/));
        if (sortSwitch == false){
            document.D3_FUNCTION.bar(barDataFilter);
        } else {
            handleSortedData(barDataFilter)
        }
    }
})
let simStatCalc = () => {
    let qHeight = mostRecentStats.get().finalState.height();
    let qNumWire = mostRecentStats.get().circuitDefinition.numWires;
    let qStates = [];
    for (let i = 0; i < qHeight; i++){
        qStates[i] = Util.bin(i,qNumWire);
    }
    let qProb = [];
    let qVector = [];
    let qPhase = [];
    for (let i = 0; i < mostRecentStats.get().finalState._buffer.length; i++) {
        let x = mostRecentStats.get().finalState._buffer;
        let y = x[i];
        let z = x[i + 1];
        if (i % 2 == 0){
            let k = i/2;
            let j = Math.pow(y,2) + Math.pow(z, 2);
            qVector[k] = (y < 0 ? "":"+") + y.toFixed(5) + (z < 0 ? "":"+") + z.toFixed(5) + "i";
            qPhase[k] = Math.atan2(z,y).toFixed(5) + "°";
            qProb[k] = (j*100).toFixed(4);
        }
    }
    let printVect = document.getElementById("dataOutput");
    printVect.innerHTML = "";
    for (let i = 0; i < qVector.length; i++){
        let output = document.createElement("tr");
        let state = document.createElement("td");
        state.innerText = qStates[i];
        let vect = document.createElement("td");
        vect.innerText = qVector[i];
        let rad = document.createElement("td");
        rad.innerText = qPhase[i];
        let prob = document.createElement("td");
        prob.innerText = qProb[i] + "%";
        output.append(state,vect,rad,prob)
        printVect.appendChild(output)
    }
    document.getElementById("vectorTable").appendChild(printVect)
}
let tableSortSwitch = false;
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
}
document.getElementById("sortTable").addEventListener("click", function (e){
    tableSortSwitch = !tableSortSwitch;
    if (tableSortSwitch){
        document.getElementById("sortTableDown").classList.add("hidden")
        document.getElementById("sortTableUp").classList.remove("hidden")
    } else {
        document.getElementById("sortTableDown").classList.remove("hidden")
        document.getElementById("sortTableUp").classList.add("hidden")
    }
    sortTable();
})
document.getElementById("cancelSortTable").addEventListener("click", function (e){
    tableSortSwitch = false;
    document.getElementById("sortTableDown").classList.remove("hidden")
    document.getElementById("sortTableUp").classList.add("hidden")
    simStatCalc();
})
let barDataFilterSwitch = true;
const stateBarChartFilter = document.getElementById("stateBarChartFilterZero");
stateBarChartFilter.addEventListener('click',()=>{
    barDataFilterSwitch = !barDataFilterSwitch;
    if (barDataFilterSwitch == false){
        stateBarChartFilter.innerHTML = "Hide zero states";
        if (sortSwitch == false) {
            document.D3_FUNCTION.bar(stateBarCalc());
        } else {
            handleSortedData(barData);
        }
    } else {
        stateBarChartFilter.innerHTML = "Show all states";
        let barDataFilter = stateBarCalc().filter(val => !val.Probability.match(/^0.0000$/));
        if (sortSwitch == false) {
            document.D3_FUNCTION.bar(barDataFilter);
        } else {
            handleSortedData(barDataFilter);
        }
    }
})
let vectFilterSwitch = false;
document.getElementById("vectFilter").addEventListener('click', function (e) {
    vectFilterSwitch = !vectFilterSwitch;
    let table = document.getElementById("vectorTable");
    let tr = table.getElementsByTagName("tr")
    if (vectFilterSwitch == true) {
        // document.getElementById("vectFilter").innerHTML = "Show all states"
        document.getElementById("probHeader").innerHTML = "Probability (Filtered)"
        document.getElementById("vectSearch").innerHTML = ""
        for (let i = 0; i < tr.length; i++) {
            let td = tr[i].getElementsByTagName("td")[3];
            if (td) {
                let value = td.textContent || td.innerText
                if (value.search(/^0.0000/) > -1) {
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
})
document.getElementById("stateSearchButton").addEventListener("click", function (e){
    document.getElementById("stateHeaderText").classList.add("hidden");
    document.getElementById("stateSearchButton").classList.add("hidden");
    document.getElementById("vectSearch").classList.remove("hidden");
    document.getElementById("vectSearchCancel").classList.remove("hidden");
})
document.getElementById("vectSearchCancel").addEventListener("click", function (e){
    document.getElementById("stateHeaderText").classList.remove("hidden");
    document.getElementById("stateSearchButton").classList.remove("hidden");
    document.getElementById("vectSearch").classList.add("hidden");
    document.getElementById("vectSearchCancel").classList.add("hidden");
})
document.getElementById("vectSearch").addEventListener("input", function (e) {
    let search = document.getElementById("vectSearch").value;
    let table = document.getElementById("vectorTable");
    let tr = table.getElementsByTagName("tr")
    if (search != null && search != '' && search != undefined){
        for (let i = 0; i < tr.length; i++){
            let td = tr[i].getElementsByTagName("td")[0];
            if (td) {
                let value = td.textContent || td.innerText;
                if (value.indexOf(search)){
                    tr[i].style.display = 'none';
                } else {
                    tr[i].style.display = "";
                }
            }
        }
        if ($("#dataOutput").children(":visible").length == 0 && $('#no-data3').length == 0){
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
})


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
document.addEventListener("DOMContentLoaded", function (){
        let barDataFilter = stateBarCalc().filter(val => !val.Probability.match(/^0.0000$/));
            document.D3_FUNCTION.bar(barDataFilter,viewState.getInstance().chartAreaHeight);
})

revision.latestActiveCommit().subscribe(jsonText => {
    let circuitDef = fromJsonText_CircuitDefinition(jsonText);
    let newInspector = displayed.get().withCircuitDefinition(circuitDef);
    displayed.set(newInspector);
    if (barDataFilterSwitch == false) {
        if (sortSwitch == false) {
            document.D3_FUNCTION.bar(stateBarCalc());
        } else {
            handleSortedData(barData)
        }
    } else {
        let barDataFilter = stateBarCalc().filter(val => !val.Probability.match(/^0.0000$/));
        if (sortSwitch == false) {
            document.D3_FUNCTION.bar(barDataFilter);
        } else {
            handleSortedData(barDataFilter)
        }
    }
});
/**
 * @param {!DisplayedInspector} curInspector
 * @returns {{w: number, h: !number}}
 */
let desiredCanvasSizeFor = curInspector => {
    return {
        w: curInspector.desiredWidth(),
        h: curInspector.desiredHeight()
    };
};

/**
 * @param {!DisplayedInspector} ins
 * @returns {!DisplayedInspector}
 */
const syncArea = ins => {
    let size = desiredCanvasSizeFor(ins);
    ins.updateArea(new Rect(0, 0, size.w, size.h));
    return ins;
};

// Gradually fade out old errors as user manipulates circuit.
displayed.observable().
    map(e => e.displayedCircuit.circuitDefinition).
    whenDifferent(Util.CUSTOM_IS_EQUAL_TO_EQUALITY).
    subscribe(() => {
        let errDivStyle = document.getElementById('error-div').style;
        errDivStyle.opacity *= 0.9;
        if (errDivStyle.opacity < 0.06) {
            errDivStyle.display = 'None'
        }
    });

/** @type {!CooldownThrottle} */
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

/** @type {undefined|!string} */
let clickDownGateButtonKey = undefined;
const hideAllMenu = () => {
    const pasteMenu = document.getElementById('paste-menu-popup');
    const gateMenu = document.getElementById('gate-menu-popup');
    const gateInfo = document.getElementById('gateInfo');
    gateMenu.style.display = 'none';
    pasteMenu.style.display = 'none';
    gateInfo.style.display = 'none';
}

canvasDiv.addEventListener('click', ev => {
    let pt = eventPosRelativeTo(ev, canvasDiv);
    let curInspector = displayed.get();
    if (curInspector.tryGetHandOverButtonKey() !== clickDownGateButtonKey) {
        return;
    }
    const pasteMenu = document.getElementById('paste-menu-popup');
    const element = document.getElementById('gate-menu-popup');
    element.style.display = 'none';

    if(pasteMenu.style.display == 'block') {
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
    resizeChartArea(ev);
    viewState.getInstance().canShowGateMenu = false;
    if (!displayed.get().hand.isBusy()) {
        let newHand = displayed.get().hand.withPos(eventPosRelativeTo(ev, canvas));
        let newInspector = displayed.get().withHand(newHand);
        displayed.set(newInspector);
    }
    
});
canvasDiv.addEventListener('mouseup', () => {
    startResizeCodeArea = false;
    startResizeGateArea = false;
    startResizeChartArea = false;
})
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
//initExports(revision, mostRecentStats, obsIsAnyOverlayShowing.observable());
//initForge(revision, obsIsAnyOverlayShowing.observable());
initUndoRedo(revision, obsIsAnyOverlayShowing.observable(), redrawThrottle);
//initClear(revision, obsIsAnyOverlayShowing.observable());
//initMenu(revision, obsIsAnyOverlayShowing.observable());
initTitleSync(revision);
obsForgeIsShowing.
    zipLatest(obsExportsIsShowing, (e1, e2) => e1 || e2).
    zipLatest(obsMenuIsShowing, (e1, e2) => e1 || e2).
    whenDifferent().
    subscribe(e => {
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
        if (barDataFilterSwitch == false) {
            if (sortSwitch == false) {
                document.D3_FUNCTION.bar(barData,viewState.getInstance().chartAreaHeight);
            } else {
                handleSortedData(barData,viewState.getInstance().chartAreaHeight)
            }
        } else {
            let barDataFilter = barData.filter(val => !val.Probability.match(/^0.0000$/));
            if (sortSwitch == false){
                document.D3_FUNCTION.bar(barDataFilter,viewState.getInstance().chartAreaHeight);
            } else {
                handleSortedData(barDataFilter,viewState.getInstance().chartAreaHeight)
            }
        }
        updateSizeViews(canvasDiv);
    }
}
function resizeGateArea(e) {
    if (startResizeGateArea) {
        const dx = posResize - e.clientX;
        posResize = e.clientX;
        viewState.getInstance().gateAreaWidth -= dx;
        if (viewState.getInstance().gateAreaWidth < 130) {
            viewState.getInstance().gateAreaWidth = 130;
        }
        if (barDataFilterSwitch == false) {
            if (sortSwitch == false) {
                document.D3_FUNCTION.bar(barData,viewState.getInstance().chartAreaHeight);
            } else {
                handleSortedData(barData,viewState.getInstance().chartAreaHeight)
            }
        } else {
            let barDataFilter = barData.filter(val => !val.Probability.match(/^0.0000$/));
            if (sortSwitch == false){
                document.D3_FUNCTION.bar(barDataFilter,viewState.getInstance().chartAreaHeight);
            } else {
                handleSortedData(barDataFilter,viewState.getInstance().chartAreaHeight)
            }
        }
        updateSizeViews(canvasDiv);
    }
}
function resizeChartArea(e) {
    if (startResizeChartArea) {
        const dy = posResize - e.clientY;
        posResize = e.clientY;
        viewState.getInstance().chartAreaHeight += dy;
        if (viewState.getInstance().chartAreaHeight < 50) {
            viewState.getInstance().chartAreaHeight = 50;
        }
        if (barDataFilterSwitch == false) {
            if (sortSwitch == false) {
                document.D3_FUNCTION.bar(barData,viewState.getInstance().chartAreaHeight);
            } else {
                handleSortedData(barData,viewState.getInstance().chartAreaHeight)
            }
        } else {
            let barDataFilter = barData.filter(val => !val.Probability.match(/^0.0000$/));
            if (sortSwitch == false){
                document.D3_FUNCTION.bar(barDataFilter,viewState.getInstance().chartAreaHeight);
            } else {
                handleSortedData(barDataFilter,viewState.getInstance().chartAreaHeight)
            }
        }
        updateSizeViews(canvasDiv);
    }
}
setTimeout(() => {
    redrawThrottle.trigger();
}, 500);