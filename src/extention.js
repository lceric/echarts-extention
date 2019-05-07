var echarts = require("echarts/lib/echarts");

require("./extentionSeries");
require("./extentionView");
echarts.registerVisual(
  echarts.util.curry(require("echarts/lib/visual/dataColor"), "extention")
);