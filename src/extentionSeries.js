var completeDimensions = require("echarts/lib/data/helper/completeDimensions");
var echarts = require("echarts/lib/echarts");
echarts.extendSeriesModel({
  type: "series.extention",
  VisualColorAccessPath: "textStyle.normal.color",
  optionUpdated: function() {
    // 此处可以处理option
    // var option = this.option;
    // option.gridSize = Math.max(Math.floor(option.gridSize), 4);
  },
  getInitialData: function(option, ecModel) {
    var dimensions = completeDimensions(["value"], option.data);
    var list = new echarts.List(dimensions, this);
    list.initData(option.data);
    return list;
  },
  // 默认属性
  defaultOption: {
    color: ["#294D99", "#156ACF", "#1598ED", "#45BDFF"],
    center: ["50%", "50%"],
    radius: "50%",
    amplitude: "8%",
    waveLength: "80%",
    phase: "auto",
    period: "auto",
    direction: "right",
    shape: "circle",
    data: []
  }
});
