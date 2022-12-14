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

import { viewState } from "./viewState.js";

/**
 * @param {!Revision} revision
 * @param {!Observable.<boolean>} obsIsAnyOverlayShowing
 */
function initUndoRedo(revision, obsIsAnyOverlayShowing) {
    // const overlay_divs = [
    //     document.getElementById('gate-forge-div'),
    //     document.getElementById('export-div')
    // ];

    const undoButton = /** @type {!HTMLButtonElement} */ document.getElementById('undo-button');
    const redoButton = /** @type {!HTMLButtonElement} */ document.getElementById('redo-button');
    const clearButton = /** @type {!HTMLButtonElement} */ document.getElementById('clear-button');
    //const loadDataButton = /** @type {!HTMLButtonElement} */ document.getElementById('load-data');
    // Phu: Undo, redo
    // revision.latestActiveCommit().zipLatest(obsIsAnyOverlayShowing, (_, b) => b).subscribe(anyShowing => {
    //     undoButton.disabled = revision.isAtBeginningOfHistory() || anyShowing;
    //     redoButton.disabled = revision.isAtEndOfHistory() || anyShowing;
    // });

    undoButton.addEventListener('click', () => revision.undo());
    redoButton.addEventListener('click', () => revision.redo());
    clearButton.addEventListener('click', () => {
        revision.commit('{"cols":[]}')
    });

    const deleteGateBtn = document.getElementById('gate-menu-popup-delete-btn');
    const copyGateBtn = document.getElementById('gate-menu-popup-copy-btn');
    const cutGateBtn = document.getElementById('gate-menu-popup-cut-btn');
    const pasteGateBtn = document.getElementById('gate-menu-popup-paste-btn');

    const pasteBtn = document.getElementById('paste-menu-popup-btn');

    deleteGateBtn.addEventListener('click', () => {
        const {row, col} = viewState.getInstance().gateMenuPos;
        revision.deleteGate(row, col);
    });
    copyGateBtn.addEventListener('click', () => {
        const {row, col} = viewState.getInstance().gateMenuPos;
        const symbol = revision.getGateSymbol(row, col);
        viewState.getInstance().currentCopyGateSymbol = symbol;
    });
    pasteGateBtn.addEventListener('click', () => {
        const {row, col} = viewState.getInstance().gateMenuPos;
        const symbol = viewState.getInstance().currentCopyGateSymbol;
        if (symbol) {
            revision.pasteGate(symbol, row, col + 1);            
        }   
        else {
            alert("No copy gate!");
        }     
    });
    cutGateBtn.addEventListener('click', () => {
        const {row, col} = viewState.getInstance().gateMenuPos;
        const symbol = revision.getGateSymbol(row, col);
        viewState.getInstance().currentCopyGateSymbol = symbol;
        revision.deleteGate(row, col);
    });
    pasteBtn.addEventListener('click', () => {
        const {row, col} = viewState.getInstance().currentPastePos;
        const symbol = viewState.getInstance().currentCopyGateSymbol;
        if (symbol) {
            revision.pasteGate(symbol, row >= 0 ? row : 0, col >= 0 ? col : 0);            
        }        
        else {
            alert("No copy gate!");
        }
    });
    // document.addEventListener("keydown", e => {
    //     // Don't capture keystrokes while menus are showing.
    //     for (let div of overlay_divs) {
    //         if (div.style.display !== 'NONE' && div.style.display !== 'none') {
    //             return;
    //         }
    //     }

    //     const Y_KEY = 89;
    //     const Z_KEY = 90;
    //     let isUndo = e.keyCode === Z_KEY && e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey;
    //     let isRedo1 = e.keyCode === Z_KEY && e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey;
    //     let isRedo2 = e.keyCode === Y_KEY && e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey;
    //     if (isUndo) {
    //         revision.undo();
    //         e.preventDefault();
    //     }
    //     if (isRedo1 || isRedo2) {
    //         revision.redo();
    //         e.preventDefault();
    //     }
    // });
}

export {initUndoRedo}
