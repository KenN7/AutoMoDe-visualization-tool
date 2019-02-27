
function beautifyBTree(graphEditor, rootNode) {

  var area = {x:0, y:0, w:0, h:0, relh:0, relw:0};
  area.w = graphEditor.width();
  area.h = graphEditor.height();

  var rootInfo = getBTreeNodeInfo(rootNode);

  setBTreeNodePosition(rootNode, rootInfo, area);
}

function getBTreeNodeInfo(node) {

  var info = {depth:1, cumulativeChildrenNb:0, childrenInfo:[]};
  var edges = node.getOutgoingEdges();

  if(edges.length == 0) {
    info.cumulativeChildrenNb = 1;
  }

  edges.forEach(function(e) {
    var i = getBTreeNodeInfo(e.getDestNode());
    if(info.depth < i.depth + 1) {
      info.depth = i.depth + 1;
    }
    info.cumulativeChildrenNb += i.cumulativeChildrenNb;
    info.childrenInfo.push(i);
  });

  return info;
}

function setBTreeNodePosition(node, info, area) {

  if(area.relh == 0)
    area.relh = area.h / info.depth;
  if(area.relw == 0)
    area.relw = area.w / info.cumulativeChildrenNb;

  node.move({x:(area.x + area.w/2), y:(area.y + area.relh/2)});

  var edges = node.getOutgoingEdges();
  var widthAccumulator = 0;

  for(var i = 0; i < edges.length; ++i) {
    var n = edges[i].getDestNode();
    var ci = info.childrenInfo[i];

    var relwidth = area.relw * ci.cumulativeChildrenNb;

    var a = {x:area.x + widthAccumulator,
             y:area.y + area.relh,
             w:relwidth,
             h:area.h - area.relh,
             relw:area.relw,
             relh:area.relh};

    setBTreeNodePosition(n, ci, a);

    widthAccumulator += relwidth;
  }
}
