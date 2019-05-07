var echarts = require("echarts/lib/echarts");
console.log(echarts);
module.exports = echarts.graphic.extendShape({
  type: "ec-extention",
  shape: {
    cx: 0,
    cy: 0,
    width: 0,
    height: 0
  },
  buildPath: function(path, shape) {
    console.log(shape)
    // draw extend shape
    var x = shape.x;
    var y = shape.y;
    var w = shape.width;
    var h = w;
    var r = w / 2;
    console.log(path)
    path.rect(90, 180, 120, 120);
    // path.bezierCurveTo(x, y, tanX*2, tanY*2, x*6, y*6)
    path.closePath();
  }
});
