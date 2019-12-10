import { GraphEditorNewNodeTool, GraphEditorNewEdgeTool, GraphEditorDraggingTool, GraphEditorDeleteTool } from "./tools/grapheditortools";
import { BTreeBeautifyTool } from "./tools/btree/beautifier";
import BTreeExporter from "./btree/exporter";
import { BTreeImporter } from "./btree/importer";
import { FSMExporter } from "./fsm/exporter";
import { FSMImporter } from "./fsm/importer";
import GraphEditor from "./grapheditor";
import * as cmdlinestring from "./cmdlinestring";
import btreeNodeModels from "./btree/nodemodels.json";
import btreeEdgeModels from "./btree/edgemodels.json";
import btreeNodeParams from "./btree/nodeparams.json";
import btreeEdgeParams from "./btree/edgeparams.json";
import fsmNodeModels from "./fsm/nodemodels.json";
import fsmEdgeModels from "./fsm/edgemodels.json";
import fsmNodeParams from "./fsm/nodeparams.json";
import fsmEdgeParams from "./fsm/edgeparams.json";
import OptionSelector from "./view/OptionSelector";
import ParamInput from "./view/ParamInput";
import ParamPane from "./view/ParamPane";
import GraphCanvas from "./view/GraphCanvas";


/**
 * Initialisations functions
 */

/**
 * Initialise editor and tools for BTrees
 */
function switchToBTree(graphEditor) {
    document.querySelector("#title").textContent = "AutoMoDe Behavior Trees Editor";
    document.querySelector("#switchlink").textContent = "switch to finite states machines";
    document.querySelector("#cmdline").value = "";

    graphEditor.clearElements();
    graphEditor.setMode("btree");

    var exporter = new BTreeExporter();
    graphEditor.setExporter(exporter);

    var importer = new BTreeImporter();
    graphEditor.setImporter(importer);

    graphEditor.setNodeModels(btreeNodeModels);
    graphEditor.setEdgeModels(btreeEdgeModels);
    graphEditor.setNodeParams(btreeNodeParams);
    graphEditor.setEdgeParams(btreeEdgeParams);

    graphEditor.clearTools();
    graphEditor.addTool(new GraphEditorDraggingTool(), true);
    graphEditor.addTool(new GraphEditorNewNodeTool());
    graphEditor.addTool(new GraphEditorNewEdgeTool());
    graphEditor.addTool(new GraphEditorDeleteTool());
    graphEditor.addTool(new BTreeBeautifyTool());
}

/**
 * Initialise tools and editor for FSM
 */
function switchToFSM(graphEditor) {
    document.querySelector("#title").textContent = "AutoMoDe Finite States Machines Editor";
    document.querySelector("#switchlink").textContent = "switch to behavior trees";
    document.querySelector("#cmdline").value = "";

    graphEditor.clearElements();
    graphEditor.setMode("fsm");

    var exporter = new FSMExporter();
    graphEditor.setExporter(exporter);

    var importer = new FSMImporter();
    graphEditor.setImporter(importer);

    graphEditor.setNodeModels(fsmNodeModels);
    graphEditor.setEdgeModels(fsmEdgeModels);
    graphEditor.setNodeParams(fsmNodeParams);
    graphEditor.setEdgeParams(fsmEdgeParams);

    graphEditor.clearTools();
    graphEditor.addTool(new GraphEditorDraggingTool(), true);
    graphEditor.addTool(new GraphEditorNewNodeTool());
    graphEditor.addTool(new GraphEditorNewEdgeTool());
    graphEditor.addTool(new GraphEditorDeleteTool());
}

/**
 * Toggle between btree and FSM mode
 */
function toggleMode(graphEditor) {
    document.querySelector("param-pane").clear();
    if (grapheditor.getMode() === "fsm") {
        switchToBTree(graphEditor);
    } else {
        switchToFSM(graphEditor);
    }
}

/**
 * Key pressed events
 */
document.addEventListener("keydown", (event) => {
    if(event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey) {
        if(event.key == "s") {
            event.preventDefault();
            cmdlinestring.exporttofile();
        }
        if(event.key == "c") {
            event.preventDefault();
            cmdlinestring.copytoclipboard();
        }
        if(event.key == "o") {
            event.preventDefault();
            cmdlinestring.triggeropenfile();
        }
        if(event.key == "e") {
            event.preventDefault();
            cmdlinestring.execinsimulator();
        }
    }
});


/**
 * Initialisation when loading ends
 */
window.customElements.define("option-selector", OptionSelector);
window.customElements.define("param-input", ParamInput);
window.customElements.define("param-pane", ParamPane);
window.customElements.define("graph-canvas", GraphCanvas);
let grapheditor = new GraphEditor();
const openFileInput = document.querySelector("#openfileinput");
const openFileButton = document.querySelector("#openfilebutton");
const cmdline = document.querySelector("#cmdline");
const copyButton = document.querySelector("#copybutton");
const fileExportButton = document.querySelector("#fileexportbutton");
const executeButton = document.querySelector("#executebutton");
const switchLink = document.querySelector("#switchlink");
const paramPane = document.querySelector("param-pane");

openFileInput.addEventListener("change", () => cmdlinestring.importfromfile(grapheditor));
openFileButton.addEventListener("click", cmdlinestring.triggeropenfile);
cmdline.addEventListener("change", () => cmdlinestring.importfromcmdline(grapheditor));
copyButton.addEventListener("click", cmdlinestring.copytoclipboard);
fileExportButton.addEventListener("click", cmdlinestring.exporttofile);
executeButton.addEventListener("click", cmdlinestring.execinsimulator);
switchLink.addEventListener("click", () => toggleMode(grapheditor));

paramPane.addEventListener("modelChange", e => {
    grapheditor.setSelectionModel(e.detail.model);
});
paramPane.addEventListener("categoryChange", e => {
    grapheditor.setSelectionCategory(e.detail.category);
});
paramPane.addEventListener("paramChange", e => {
    grapheditor.setSelectionParam(e.detail.id, e.detail.value);
});
	
switchToFSM(grapheditor);