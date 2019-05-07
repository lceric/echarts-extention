var echarts = require("echarts/lib/echarts");
var numberUtil = echarts.number;
var symbolUtil = require("echarts/lib/util/symbol");
// var parsePercent = numberUtil.parsePercent;

var ExtentionLayout = require("./extentionLayout");

function getShallow(model, path) {
  return model && model.getShallow(path);
}

echarts.extendChartView({
  type: "extention",
  render: function(seriesModel, ecModel, api) {
    var group = this.group;
    group.removeAll();
    var data = seriesModel.getData();
    var gridSize = seriesModel.get("gridSize");
    console.log(seriesModel, data, gridSize, seriesModel.get('color'));

    data.each(idx => {
      var itemModel = data.getItemModel(idx);
      var textStyleModel = itemModel.getModel("textStyle.normal");
      var emphasisTextStyleModel = itemModel.getModel("textStyle.emphasis");

      // var textEl = new echarts.graphic.Text({
      //   style: echarts.graphic.setTextStyle({}, textStyleModel, {
      //     x: 0,
      //     y: 0,
      //     text: itemModel.option.name,
      //     textBaseline: "middle",
      //     textFill: data.getItemVisual(idx, "color"),
      //     fontSize: itemModel.option.value / 100
      //   }),
      //   // scale: [1 / 2, 1 / 1],
      //   position: [
      //     (itemModel.option.value / 10000) * gridSize,
      //     (itemModel.option.value * 4 / 10000) * gridSize
      //   ]
      // });

      // group.add(textEl);

      var extentionEl = new ExtentionLayout({
        shape: {
          x: itemModel.option.value,
          y: itemModel.option.value / 10,
          width: 200,
          height: 100
        }
      })
      group.add(extentionEl)
      // data.setItemGraphicEl(idx, textEl);

      // echarts.graphic.setHoverStyle(
      //   textEl,
      //   echarts.graphic.setTextStyle(
      //     {},
      //     emphasisTextStyleModel,
      //     null,
      //     { forMerge: true },
      //     true
      //   )
      // );
    });
    // var extentionEl = new ExtentionLayout({
    //   shape: {
    //     x: 230,
    //     y: 100,
    //     width: 200,
    //     height: 100
    //   }
    // })
    // group.add(extentionEl)
    this._model = seriesModel;
  },

  remove: function() {
    this.group.removeAll();

    this._model.layoutInstance.dispose();
  },

  dispose: function() {
    this._model.layoutInstance.dispose();
  }
});
