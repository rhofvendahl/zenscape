class Zenscape {
  constructor({ xCells, zCells, cellDim, memory }) {
    this.xCells = xCells;
    this.zCells = zCells;
    this.cellDim = cellDim;
    this.map = undefined;
    this.clickLog = [];
    this.memory = memory;
  }

  makeFace = ({ className, shade, width, height, tx, ty, tz, rx, ry, rz }) => {
    $("." + className).append("<div class='" + shade + " object'></div>");
    let side = $("." + className).children().last();
    side.css("width", width);
    side.css("height", height);
    side.css("margin-left", -width / 2);
    side.css("margin-top", -height / 2);
    side.css("transform", "translate3d(" + tx + "px, " + ty + "px," + tz + "px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) rotateZ(" + rz + "deg)");
  };

  makeBox = ({ className, xCoord, yCoord, zCoord, xDim, yDim, zDim }) => {
    $("#scape").append("<div class='" + className + " object'></div>");
    //orthogonal to y axis (-y is up)
    this.makeFace({ className: className, shade: "light", width: xDim, height: zDim, tx: (xCoord + xDim / 2), ty: -(yCoord + yDim), tz: (zCoord + zDim / 2), rx: 90, ry: 0, rz: 0 });
    //orthogonal to z axis
    this.makeFace({ className: className, shade: "medium", width: xDim, height: yDim, tx: (xCoord + xDim / 2), ty: -(yCoord + yDim / 2), tz: (zCoord + zDim), rx: 0, ry: 0, rz: 0 });
  };

  makeMap = () => {
    this.map = new Array(this.xCells);
    for (let x = 0; x < this.xCells; x++) {
      this.map[x] = new Array(this.zCells).fill(0);
    };
  };

  makeScape = () => {
    $("#scape").css("margin-left", (-this.map.length * this.cellDim / 2) + "px");
    $("#scape").css("margin-top", (-this.map[0].length * this.cellDim / 2) + "px");
    for (let x = 0; x < this.map.length; x++) {
      for (let z = 0; z < this.map[0].length; z++) {
        this.makeBox({ className: x + "-" + z, xCoord: x * this.cellDim, yCoord: this.map[x][z] * this.cellDim, zCoord: z * this.cellDim, xDim: this.cellDim, yDim: this.cellDim, zDim: this.cellDim});
      };
    };
    this.makeBox({ className: "base", xCoord: 0, yCoord: -this.cellDim * 1.5, zCoord: 0, xDim: this.map.length * this.cellDim, yDim: this.cellDim, zDim: this.map[0].length * this.cellDim});
  };

  updateMap = () => {
    for (let x = 0; x < this.map.length; x++) {
      for (let z = 0; z < this.map[0].length; z++) {
        this.map[x][z] = 0;
        for (let i = 0; (i < this.memory) && (i < this.clickLog.length); i++) {
          const click = this.clickLog[this.clickLog.length - 1 - i];
          const seconds = (Date.now() - click[2]) / 1000;
          const distance = Math.pow((Math.pow(x - click[0], 2) + Math.pow(z - click[1], 2)), 1 / 2);
          if (Math.abs(distance / 2 - seconds) < Math.PI) this.map[x][z] += (Math.cos(distance / 2 - seconds) + 1) / 2;
        };
      };
    };
  };

  updateScape = () => {
    const snowLine = 3;
    for (let x = 0; x < this.map.length; x++) {
      for (let z = 0; z < this.map[0].length; z++) {
        const box = $("." + x + "-" + z);
        $("." + x + "-" + z).animate({ top: -this.map[x][z] * this.cellDim + "px" }, 250);
        if (this.map[x][z] <= .2 * snowLine) {
          //blue
          box.children(".light").css("background", "#4081f2");
          box.children(".medium").css("background", "#346dc7");
          box.children(".dark").css("background", "#275799");
        } else if (this.map[x][z] <= .3 * snowLine) {
          //tan
          box.children(".light").css("background", "#FFF089");
          box.children(".medium").css("background", "#C1B367");
          box.children(".dark").css("background", "#817847");
        } else if (this.map[x][z] <= .6 * snowLine) {
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
}

$(document).ready(function () {
  const zs = new Zenscape({ xCells: 20, zCells: 20, cellDim: 20, memory: 5 });
  zs.makeMap();
  zs.makeScape();

  zs.clickLog.push([5, 6, Date.now()]);
  zs.clickLog.push([5, 6, Date.now()]);
  zs.clickLog.push([16, 4, Date.now() + 1000]);
  zs.clickLog.push([14, 14, Date.now() + 500]);

  $("#scape").children().mousedown(function () {
    const click = new Array(3);
    click[0] = parseInt($(this).attr("class").split(/[- ]/)[0]);
    click[1] = parseInt($(this).attr("class").split(/[- ]/)[1]);
    click[2] = Date.now();
    zs.clickLog.push(click);
  });

  setInterval(function () {
    $("#scape").children().stop();
    zs.updateMap();
    zs.updateScape();
  }, 200, zs);
});
