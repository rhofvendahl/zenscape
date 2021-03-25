function makeBox(className, xCoord, yCoord, zCoord, xDim, yDim, zDim) {
  //console.log("makeBox");
  $("#scape").append("<div class='" + className + " object'></div>");

  //comment sides to reduce latency
  //orthogonal to y axis (-y is up)
  makeFace(className, "light", xDim, zDim,  (xCoord+xDim/2), -(yCoord+yDim), (zCoord+zDim/2), 90, 0, 0);
  //makeFace(className, "dark", xDim, zDim, (xCoord+xDim/2), -(yCoord), (zCoord+zDim/2), 90, 0, 0);

  //orthogonal to z axis
  makeFace(className, "medium", xDim, yDim, (xCoord+xDim/2), -(yCoord+yDim/2), (zCoord+zDim), 0, 0, 0);
  //makeFace(className, "medium", xDim, yDim, (xCoord+xDim/2), -(yCoord+yDim/2), (zCoord), 0, 0, 0);

  //orthogonal to x axis
  //makeFace(className, "light", zDim, yDim, (xCoord + xDim), -(yCoord+yDim/2), (zCoord+zDim/2), 0, (90), 0);
  //makeFace(className, "dark", zDim, yDim, xCoord, -(yCoord+yDim/2), (zCoord+zDim/2), 0, (90), 0);
};

function makeFace(className, shade, width, height, tx, ty, tz, rx, ry, rz) {
  $("." + className).append("<div class='" + shade + " object'></div>");
  var side = $("." + className).children().last();
  side.css("width", width);
  side.css("height", height);
  side.css("margin-left", -width/2);
  side.css("margin-top", -height/2);
  side.css("transform", "translate3d("+tx+"px, "+ty+"px,"+tz+"px) rotateX("+rx+"deg) rotateY("+ry+"deg) rotateZ("+rz+"deg)");
};

function Zenscape(xCells, zCells, cellDim, memory) {
	this.xCells = xCells;
	this.zCells = zCells;
	this.cellDim = cellDim;
	this.map = undefined;
	this.clickLog = [];
	this.memory = memory;
};

Zenscape.prototype.makeMap = function() {
  this.map = new Array(this.xCells);
  for (var x=0; x<this.xCells; x++) {
    this.map[x] = new Array(this.zCells).fill(0);
  };
};

Zenscape.prototype.makeScape = function() {
  $("#scape").css("margin-left", (-this.map.length*this.cellDim/2) + "px");
  $("#scape").css("margin-top", (-this.map[0].length*this.cellDim/2) + "px");
  for (x=0; x<this.map.length; x++) {
    for (z=0; z<this.map[0].length; z++) {
      makeBox((x + "-" + z), x*this.cellDim, this.map[x][z]*this.cellDim, z*this.cellDim, this.cellDim, this.cellDim, this.cellDim);
    };
  };
  makeBox("base", 0, (-this.cellDim*1.5), 0, (this.map.length*this.cellDim), this.cellDim, (this.map[0].length*this.cellDim));
};

Zenscape.prototype.updateMap = function() {
  for (var x=0; x<this.map.length; x++) {
    for (var z=0; z<this.map[0].length; z++) {
      this.map[x][z] = 0;
      for (var i = 0; (i < this.memory) && (i < this.clickLog.length); i++) {
        var click = this.clickLog[this.clickLog.length-1-i];
        var seconds = (Date.now() - click[2])/1000;
        var distance = Math.pow((Math.pow(x-click[0], 2)+Math.pow(z-click[1], 2)), 1/2);
        if (Math.abs(distance/2 - seconds) < Math.PI) this.map[x][z] += (Math.cos(distance/2 - seconds) + 1)/2;
      };
    };
  };
};

Zenscape.prototype.updateScape = function() {
  var snowLine = 3;
  for (var x=0; x<this.map.length; x++) {
    for (var z=0; z<this.map[0].length; z++) {
      var box = $("." + x + "-" + z);
    $("." + x + "-" + z).animate({top: -this.map[x][z]*this.cellDim + "px"}, 250);
      if (this.map[x][z] <= .2*snowLine) {
        //blue
        box.children(".light").css("background", "#4081f2");
        box.children(".medium").css("background", "#346dc7");
        box.children(".dark").css("background", "#275799");
      } else if (this.map[x][z] <= .3*snowLine) {
        //tan
        box.children(".light").css("background", "#FFF089");
        box.children(".medium").css("background", "#C1B367");
        box.children(".dark").css("background", "#817847");
      } else if (this.map[x][z] <= .6*snowLine) {
        //green
        box.children(".light").css("background", "#2aa330");
        box.children(".medium").css("background", "#1f8c28");
        box.children(".dark").css("background", "#106e1f");
      } else if (this.map[x][z] <= snowLine) {
        //grey
        box.children(".light").css("background", "#BEBEBE");
        box.children(".medium").css("background", "#8E8E8E");
        box.children(".dark").css("background", "#606060");
      } else {
        //white
        box.children(".light").css("background", "#FFFFFF");
        box.children(".medium").css("background", "#BEBEBE");
        box.children(".dark").css("background", "#7F7F7F");
      };
    };
  };
};

$(document).ready(function() {
  var zs = new Zenscape(20, 20, 20, 5);
  zs.makeMap();
  zs.makeScape();

  zs.clickLog.push([5, 6, Date.now()]);
  zs.clickLog.push([5, 6, Date.now()]);
  zs.clickLog.push([16, 4, Date.now()+1000]);
  zs.clickLog.push([14, 14, Date.now()+500]);

  $("#scape").children().mousedown(function() {
    var click = new Array(3);
    click[0] = parseInt($(this).attr("class").split(/[- ]/)[0]);
    click[1] = parseInt($(this).attr("class").split(/[- ]/)[1]);
    click[2] = Date.now();
    zs.clickLog.push(click);
  });

  setInterval(function() {
    $("#scape").children().stop();
    zs.updateMap();
    zs.updateScape();
  }, 200, zs);

});
