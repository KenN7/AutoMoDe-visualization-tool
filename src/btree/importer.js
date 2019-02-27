function CmdLineIterator(cmdlinestring) {
  this.args = cmdlinestring.split(" ");
  this.i = 0;
}

CmdLineIterator.prototype.next = function() {
  if(this.i >= this.args.length)
    return "";

  while(this.args[this.i] == "")
  {
    this.i += 1;
    if(this.i >= this.args.length)
      return "";
  }

  var elem = this.args[this.i];
  this.i += 1;
  return elem;
}

CmdLineIterator.prototype.end = function() {
  return this.i >= this.args.length;
}

function BTreeImporter(inputHTML) {
  this.inputHTML = inputHTML;
}

BTreeImporter.prototype.isStartArg = function(arg) {
  return arg == "--bt-config";
}

BTreeImporter.prototype.isArg = function(arg) {
  return arg.substring(0,2) == "--";
}

BTreeImporter.prototype.isValue = function(arg) {
  return ! isNaN(arg);
}

BTreeImporter.prototype.import = function(graphEditor) {
  try {
    // build parameters dict
    var cmdlinestring = this.inputHTML.val();
    var iterator = new CmdLineIterator(cmdlinestring);

    var dict = {};

    while(! iterator.end()) {
      var key = iterator.next();

      if(this.isStartArg(key))
        continue;

      var value = iterator.next();

      if(this.isArg(key) && this.isValue(value))
        dict[key] = value;

      else
        throw "Argument " + key + " is invalid";
    }

    graphEditor.clearElements();

    var node = this.importNode(graphEditor, dict, "root");

    // reset cmdline to proper one
    graphEditor.callExporter();

    beautifyBTree(graphEditor, node);

  } catch(err) {
    graphEditor.clearElements();
    // rewrite cmdline, so user can fix it
    this.inputHTML.val(cmdlinestring);
    alert(err);
  }
}

BTreeImporter.prototype.importNode = function(graphEditor, dict, nodeID) {
  var argname = "--n" + nodeID;
  if(! dict.hasOwnProperty(argname))
    throw "Cannot find argument " + argname;

  var nodeType = dict[argname];
  var model = graphEditor.getNodeModelById(nodeType);
  var param = graphEditor.getNodeParamById(nodeType);

  var node = new GraphEditorNode("imp_node", {x:30, y:30});
  node.setModel(model);
  node.setParam(param);

  graphEditor.addElement(node);

  this.importParams(graphEditor, dict, nodeID, node);

  if(model.max_outgoing_edges > 0) {
    this.importChildren(graphEditor, dict, nodeID, node);
  }

  return node;
}

BTreeImporter.prototype.importChildren = function(graphEditor, dict, nodeID, parentNode) {
  var argname = "--nchild" + nodeID;
  if(! dict.hasOwnProperty(argname))
    return;

  var childrenNb = dict[argname];

  if(nodeID == "root") {
    nodeID = "";
  }

  for(var i = 0; i < childrenNb; ++i)
  {
    var node = this.importNode(graphEditor, dict, nodeID + i.toString());
    var edge = new GraphEditorEdge("imp_edge", parentNode, node);
    if(edge.isValid()) {
		  graphEditor.addElement(edge);
		}
  }
}

BTreeImporter.prototype.importParams = function(graphEditor, dict, nodeID, node) {
  var param = node.getParam();

  if(param.categories.length > 0)
  {
    // get category id
    var catargname = "--" + param.categoryid + nodeID;
    if(! dict.hasOwnProperty(catargname))
      return;

    var categoryid = dict[catargname];

    // get category
    var category = undefined;
    param.categories.forEach(function(c) {
      if(c.id == categoryid) {
        category = c;
      }
    });

    if(category === undefined)
      return;

    // set node category
    node.setParamValue(param.categoryid, categoryid);

    // get params
    category.param.forEach(function(p) {
      var paramargname = "--" + p.id + nodeID;
      if(dict.hasOwnProperty(paramargname)) {
        var value = dict[paramargname];
        node.setParamValue(p.id, value);
      }
    });
  }
}

