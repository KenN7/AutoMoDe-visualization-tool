"use strict";

/**
 * Create a new SVG element (in JQuery object)
 */
function createSVGElement(tagname, attrObject) {
	var svgElem = document.createElementNS("http://www.w3.org/2000/svg", 
		tagname);
	Object.keys(attrObject).forEach(function(key) {
		svgElem.setAttribute(key, attrObject[key]);
	});
	return $(svgElem);
}



function GraphEditorElement() {
	this.grapheditor = undefined;
}
GraphEditorElement.prototype.getSVGElement = function() {}
GraphEditorElement.prototype.move = function(newPos) {}
GraphEditorElement.prototype.update = function() {}
GraphEditorElement.prototype.onRemoval = function() {}



function GraphEditorTool() {
	this.grapheditor = undefined;
}
GraphEditorTool.prototype.onToolSelect = function() {}
GraphEditorTool.prototype.onToolDeselect = function() {}
GraphEditorTool.prototype.onMouseDown = function(pos, element) {}
GraphEditorTool.prototype.onMouseUp = function(pos) {}
GraphEditorTool.prototype.onMouseLeave = function() {}
GraphEditorTool.prototype.onMouseMove = function(pos) {}



/**
 * Create a GraphEditor, an object that manages tools and graph elements,
 * create the svg area and receive input from the user 
 */
function GraphEditor(graphcontainer, toolscontainer) {
	this.graphcontainer = graphcontainer;
	this.toolscontainer = toolscontainer;
	this.svg = undefined;
	this.elements = [];
	this.tools = [];
	this.currentTool = undefined;
	
	this.createGraph();
	
	var that = this;
	
	this.svg.on("mousedown", function(e) { that.onMouseDown(e); });
	this.svg.on("mouseup", function(e) { that.onMouseUp(e);	});
	this.svg.on("mouseleave", function(e) {	that.onMouseLeave(e); });
	this.svg.on("mousemove", function(e) { that.onMouseMove(e);	});
}


GraphEditor.prototype.createGraph = function() {
	this.graphcontainer.empty();
	this.toolscontainer.empty();
	
	this.svg = createSVGElement("svg", {id:"graph"});
	this.svg.on("selectstart", function(e) { e.preventDefault(); });
	this.graphcontainer.append(this.svg);
	
	this.defs = createSVGElement("defs", {});
	var arrowMarker = createSVGElement("marker", 
		{id:"arrowhead", refX:10, refY:5, markerWidth:10, markerHeight:10,
		orient:"auto-start-reverse"});
	var arrowMarkerShape = createSVGElement("path", 
		{d:"M 0 0 L 10 5 L 0 10 Z"});
	arrowMarker.append(arrowMarkerShape);
	this.defs.append(arrowMarker);
	this.svg.append(this.defs);
}

GraphEditor.prototype.addElement = function(element) {
	if(element instanceof GraphEditorElement) {
		this.elements.push(element);
		element.graphEditor = this;
		
		var that = this;
		element.getSVGElement().on("mousedown", function(e) {
			that.onMouseDown(e, element);
			e.stopPropagation();
		});
		this.svg.append(element.getSVGElement());	
	}
}

GraphEditor.prototype.removeElement = function(element) {
	if(this.elements.remove(element)) {
		element.onRemoval();
		element.getSVGElement().remove();
	}
}

GraphEditor.prototype.addTool = function(tool) {
	if(tool instanceof GraphEditorTool) {
		this.tools.push(tool);
		tool.graphEditor = this;
		
		var graphEditor = this;
		var element = jQuery("<p/>", {class:"tool", 
		id:"tool_" + tool.getToolId(), text:tool.getName()});
		element.on("click", function(e) {
			graphEditor.setCurrentTool(tool);
		});
		this.toolscontainer.append(element);
	}
}

GraphEditor.prototype.setCurrentTool = function(tool) {
	if(this.currentTool !== undefined) {
		$("#tool_" + this.currentTool.getToolId())
		.attr("class", "tool");
		this.currentTool.onToolDeselect();
	}
	
	this.currentTool = tool;
	
	if(this.currentTool !== undefined) {
		$("#tool_" + this.currentTool.getToolId())
		.attr("class", "tool selected");
		this.currentTool.onToolSelect();
	}
}

GraphEditor.prototype.SVGCoordFromHTML = function(x, y) {
	var svgPt = this.svg[0].createSVGPoint();
	svgPt.x = x;
	svgPt.y = y;
	svgPt = svgPt.matrixTransform(this.svg[0].getScreenCTM().inverse());
	return svgPt;
}

GraphEditor.prototype.onMouseDown = function(e, element) {
	if(this.currentTool !== undefined) {
		var pos = this.SVGCoordFromHTML(e.pageX, e.pageY);
		this.currentTool.onMouseDown(pos, element);
	}
}
GraphEditor.prototype.onMouseUp = function(e) {
	if(this.currentTool !== undefined) {
		var pos = this.SVGCoordFromHTML(e.pageX, e.pageY);
		this.currentTool.onMouseUp(pos);
	}
}
GraphEditor.prototype.onMouseLeave = function(e) {
	if(this.currentTool !== undefined) {
		this.currentTool.onMouseLeave();
	}
}
GraphEditor.prototype.onMouseMove = function(e) {
	if(this.currentTool !== undefined) {
		var pos = this.SVGCoordFromHTML(e.pageX, e.pageY);
		this.currentTool.onMouseMove(pos);
	}
}

GraphEditor.prototype.addSVGElement = function(element) {
	this.svg.append(element);
}

