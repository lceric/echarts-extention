var echarts = require("echarts/lib/echarts");
import * as zrUtil from "zrender/src/core/util";
var numberUtil = echarts.number;
var symbolUtil = require("echarts/lib/util/symbol");
// var parsePercent = numberUtil.parsePercent;

var ExtentionLayout = require("./extentionLayout");

function getShallow(model, path) {
  return model && model.getShallow(path);
}
function PiePiece(data, idx) {
  echarts.graphic.Group.call(this);

  var sector = new echarts.graphic.Sector({
    z2: 2
  });
  var polyline = new echarts.graphic.Polyline();
  var text = new echarts.graphic.Text();
  this.add(sector);
  this.add(polyline);
  this.add(text);

  this.updateData(data, idx, true);
}
var piePieceProto = PiePiece.prototype;

piePieceProto.updateData = function(data, idx, firstCreate) {
  var sector = this.childAt(0);
  var labelLine = this.childAt(1);
  var labelText = this.childAt(2);

  var seriesModel = data.hostModel;
  var itemModel = data.getItemModel(idx);
  var layout = data.getItemLayout(idx);
  var sectorShape = zrUtil.extend({}, layout);
  sectorShape.label = null;

  if (firstCreate) {
    sector.setShape(sectorShape);
    var animationType = seriesModel.getShallow("animationType");
    console.log("----", sector, layout);
    if (animationType === "scale") {
      sector.shape.r = layout.r0;
      echarts.graphic.initProps(
        sector,
        {
          shape: {
            r: layout.r
          }
        },
        seriesModel,
        idx
      );
    }
    // Expansion
    else {
      sector.shape.endAngle = layout.startAngle;
      echarts.graphic.updateProps(
        sector,
        {
          shape: {
            endAngle: layout.endAngle
          }
        },
        seriesModel,
        idx
      );
    }
  } else {
    echarts.graphic.updateProps(
      sector,
      {
        shape: sectorShape
      },
      seriesModel,
      idx
    );
  }

  // Update common style
  var visualColor = data.getItemVisual(idx, "color");
  console.log("----2", visualColor);
  sector.useStyle(
    zrUtil.defaults(
      {
        lineJoin: "bevel",
        fill: visualColor
      },
      itemModel.getModel("itemStyle").getItemStyle()
    )
  );
  sector.hoverStyle = itemModel.getModel("emphasis.itemStyle").getItemStyle();

  var cursorStyle = itemModel.getShallow("cursor");
  cursorStyle && sector.attr("cursor", cursorStyle);

  // Toggle selected
  toggleItemSelected(
    this,
    data.getItemLayout(idx),
    seriesModel.isSelected(null, idx),
    seriesModel.get("selectedOffset"),
    seriesModel.get("animation")
  );

  this._updateLabel(data, idx);

  this.highDownOnUpdate =
    itemModel.get("hoverAnimation") && seriesModel.isAnimationEnabled()
      ? function(fromState, toState) {
          if (toState === "emphasis") {
            labelLine.ignore = labelLine.hoverIgnore;
            labelText.ignore = labelText.hoverIgnore;

            // Sector may has animation of updating data. Force to move to the last frame
            // Or it may stopped on the wrong shape
            sector.stopAnimation(true);
            sector.animateTo(
              {
                shape: {
                  r: layout.r + seriesModel.get("hoverOffset")
                }
              },
              300,
              "elasticOut"
            );
          } else {
            labelLine.ignore = labelLine.normalIgnore;
            labelText.ignore = labelText.normalIgnore;

            sector.stopAnimation(true);
            sector.animateTo(
              {
                shape: {
                  r: layout.r
                }
              },
              300,
              "elasticOut"
            );
          }
        }
      : null;

  echarts.graphic.setHoverStyle(this);
};

piePieceProto._updateLabel = function(data, idx) {
  var labelLine = this.childAt(1);
  var labelText = this.childAt(2);

  var seriesModel = data.hostModel;
  var itemModel = data.getItemModel(idx);
  var layout = data.getItemLayout(idx);
  var labelLayout = layout.label;
  var visualColor = data.getItemVisual(idx, "color");

  if (!labelLayout || isNaN(labelLayout.x) || isNaN(labelLayout.y)) {
    labelText.ignore = labelText.normalIgnore = labelText.hoverIgnore = labelLine.ignore = labelLine.normalIgnore = labelLine.hoverIgnore = true;
    return;
  }

  echarts.graphic.updateProps(
    labelLine,
    {
      shape: {
        points: labelLayout.linePoints || [
          [labelLayout.x, labelLayout.y],
          [labelLayout.x, labelLayout.y],
          [labelLayout.x, labelLayout.y]
        ]
      }
    },
    seriesModel,
    idx
  );

  echarts.graphic.updateProps(
    labelText,
    {
      style: {
        x: labelLayout.x,
        y: labelLayout.y
      }
    },
    seriesModel,
    idx
  );
  labelText.attr({
    rotation: labelLayout.rotation,
    origin: [labelLayout.x, labelLayout.y],
    z2: 10
  });

  var labelModel = itemModel.getModel("label");
  var labelHoverModel = itemModel.getModel("emphasis.label");
  var labelLineModel = itemModel.getModel("labelLine");
  var labelLineHoverModel = itemModel.getModel("emphasis.labelLine");
  var visualColor = data.getItemVisual(idx, "color");

  echarts.graphic.setLabelStyle(
    labelText.style,
    (labelText.hoverStyle = {}),
    labelModel,
    labelHoverModel,
    {
      labelFetcher: data.hostModel,
      labelDataIndex: idx,
      defaultText: data.getName(idx),
      autoColor: visualColor,
      useInsideStyle: !!labelLayout.inside
    },
    {
      textAlign: labelLayout.textAlign,
      textVerticalAlign: labelLayout.verticalAlign,
      opacity: data.getItemVisual(idx, "opacity")
    }
  );

  labelText.ignore = labelText.normalIgnore = !labelModel.get("show");
  labelText.hoverIgnore = !labelHoverModel.get("show");

  labelLine.ignore = labelLine.normalIgnore = !labelLineModel.get("show");
  labelLine.hoverIgnore = !labelLineHoverModel.get("show");

  // Default use item visual color
  labelLine.setStyle({
    stroke: visualColor,
    opacity: data.getItemVisual(idx, "opacity")
  });
  labelLine.setStyle(labelLineModel.getModel("lineStyle").getLineStyle());

  labelLine.hoverStyle = labelLineHoverModel
    .getModel("lineStyle")
    .getLineStyle();

  var smooth = labelLineModel.get("smooth");
  if (smooth && smooth === true) {
    smooth = 0.4;
  }
  labelLine.setShape({
    smooth: smooth
  });
};

zrUtil.inherits(PiePiece, echarts.graphic.Group);
echarts.extendChartView({
  type: "extention",
  render: function(seriesModel, ecModel, api) {
    var data = seriesModel.getData();
    var oldData = this._data;
    var group = this.group;

    var hasAnimation = ecModel.get("animation");
    var isFirstRender = !oldData;
    var animationType = seriesModel.get("animationType");

    var selectedMode = seriesModel.get("selectedMode");
    data
      .diff(oldData)
      .add(function(idx) {
        var piePiece = new PiePiece(data, idx);
        // Default expansion animation
        if (isFirstRender && animationType !== "scale") {
          piePiece.eachChild(function(child) {
            child.stopAnimation(true);
          });
        }

        selectedMode && piePiece.on("click", onSectorClick);

        data.setItemGraphicEl(idx, piePiece);

        group.add(piePiece);
      })

      .update(function(newIdx, oldIdx) {
        var piePiece = oldData.getItemGraphicEl(oldIdx);

        piePiece.updateData(data, newIdx);

        piePiece.off("click");
        selectedMode && piePiece.on("click", onSectorClick);
        group.add(piePiece);
        data.setItemGraphicEl(newIdx, piePiece);
      })
      .remove(function(idx) {
        var piePiece = oldData.getItemGraphicEl(idx);
        group.remove(piePiece);
      })
      .execute();
    // data.each(idx => {
    //   var itemModel = data.getItemModel(idx);
    //   var textStyleModel = itemModel.getModel("textStyle.normal");
    //   var emphasisTextStyleModel = itemModel.getModel("textStyle.emphasis");
    //   var piePiece = new PiePiece(data, idx);
    //   // Default expansion animation
    //   piePiece.eachChild(function(child) {
    //     child.stopAnimation(true);
    //   });
    //   data.setItemGraphicEl(idx, piePiece);
    //   group.add(piePiece);
    // });
    // var shape = data.getItemLayout(0);
    // console.log(shape)
    // for (var s = 1; isNaN(shape.startAngle) && s < data.count(); ++s) {
    //     shape = data.getItemLayout(s);
    // }

    // var r = Math.max(api.getWidth(), api.getHeight()) / 2;

    // var removeClipPath = zrUtil.bind(group.removeClipPath, group);
    // group.setClipPath(this._createClipPath(
    //     shape.cx, shape.cy, r, shape.startAngle, shape.clockwise, removeClipPath, seriesModel
    // ));

    // this._model = seriesModel;
  },
  _createClipPath: function(cx, cy, r, startAngle, clockwise, cb, seriesModel) {
    var clipPath = new echarts.graphic.Sector({
      shape: {
        cx: cx,
        cy: cy,
        r0: 0,
        r: r,
        startAngle: startAngle,
        endAngle: startAngle,
        clockwise: clockwise
      }
    });

    echarts.graphic.initProps(
      clipPath,
      {
        shape: {
          endAngle: startAngle + (clockwise ? 1 : -1) * Math.PI * 2
        }
      },
      seriesModel,
      cb
    );

    return clipPath;
  },
  remove: function() {
    this.group.removeAll();

    this._model.layoutInstance.dispose();
  },

  dispose: function() {
    this._model.layoutInstance.dispose();
  }
});
