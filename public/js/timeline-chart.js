'use strict';
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
var TimelineChart = function() {
    function TimelineChart(element, data, opts) {
        _classCallCheck(this, TimelineChart);
        var self = this;
        element.classList.add('timeline-chart');
        var options = this.extendOptions(opts);
        var allElements = data.reduce(function(agg, e) {
            return agg.concat(e.data);
        }, []);
        var minDt = d3.min(allElements, this.getPointMinDt);
        var maxDt = d3.max(allElements, this.getPointMaxDt);
        var elementWidth = options.width || element.clientWidth;
        var elementHeight = options.height || element.clientHeight;
        var margin = {
            top: 0,
            right: 0,
            bottom: 20,
            left: 0
        };
        var width = elementWidth - margin.left - margin.right;
        var height = elementHeight - margin.top - margin.bottom;
        var groupWidth = 36;
        var x = d3.time.scale().domain([minDt, maxDt]).range([groupWidth, width]);
        var xAxis = d3.svg.axis().scale(x).orient('bottom').tickSize(-height);
        var zoom = d3.behavior.zoom().x(x).on('zoom', zoomed);
        var svg = d3.select(element).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')').call(zoom);
        svg.append('defs').append('clipPath').attr('id', 'chart-content').append('rect').attr('x', groupWidth).attr('y', 0).attr('height', height).attr('width', width - groupWidth);
        svg.append('rect').attr('class', 'labels').attr('x', 0).attr('y', 0).attr('height', height).attr('width', groupWidth);
        svg.append('rect').attr('class', 'chart-bounds').attr('x', groupWidth).attr('y', 0).attr('height', height).attr('width', width - groupWidth);
        svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
        var groupHeight = height / data.length;
        var groupSection = svg.selectAll('.group-section').data(data).enter().append('line').attr('class', 'group-section').attr('x1', 0).attr('x2', width).attr('y1', function(d, i) {
            return groupHeight * (i + 1);
        }).attr('y2', function(d, i) {
            return groupHeight * (i + 1);
        });
      var groupLabels = svg.selectAll('.group-label').data(data).enter().append('text').attr('class', '.group-label').attr('font-weight','bold').attr('fill','white').attr('width',36).attr('x', 0).attr('y', function(d, i) {
            return groupHeight * i + groupHeight / 2 + 5.5;
          }).attr('dx', '0.5em').attr('style','text-anchor: right;').text(function(d) {
            return d.label;
        });
        var lineSection = svg.append('line').attr('x1', groupWidth).attr('x2', groupWidth).attr('y1', 0).attr('y2', height).attr('stroke', 'black');
        var groupIntervalItems = svg.selectAll('.item').data(data).enter().append('g').attr('clip-path', 'url(#chart-content)').attr('class', '.item').attr('transform', function(d, i) {
            return 'translate(0, ' + groupHeight * i + ')';
        }).selectAll('.dot').data(function(d) {
            return d.data.filter(function(_) {
                return _.type === TimelineChart.TYPE.INTERVAL;
            });
        }).enter();
        var intervalBarHeight = 0.8 * groupHeight;
        var intervalBarMargin = (groupHeight - intervalBarHeight) / 2;
        var intervals = groupIntervalItems.append('rect').attr('class', 'interval').attr('width', function(d) {
            return x(d.to) - x(d.from);
        }).attr('height', intervalBarHeight).attr('y', intervalBarMargin).attr('x', function(d) {
            return x(d.from);
        }).attr("data-d", function(d) {
            return d.d
        }).attr("data-fn", function(d) {
            return d.fn
        }); 
        /*var intervalTexts=groupIntervalItems.append('text').text(function(d){return d.label;}).attr('fill','white').attr('class','interval-text').attr('y',groupHeight/2+5).attr('x',function(d){return x(d.from);});*/
        var groupDotItems = svg.selectAll('.item').data(data).enter().append('g').attr('clip-path', 'url(#chart-content)').attr('class', '.item').attr('transform', function(d, i) {
            return 'translate(0, ' + groupHeight * i + ')';
        }).selectAll('.dot').data(function(d) {
            return d.data.filter(function(_) {
                return _.type === TimelineChart.TYPE.POINT;
            });
        }).enter();
        var dots = groupDotItems.append('circle').attr('class', 'dot').attr('cx', function(d) {
            return x(d.at);
        }).attr('cy', groupHeight / 2).attr('r', 5);
        if (options.tip) {
            var tip = d3.tip().attr('class', 'd3-tip').html(options.tip);
            svg.call(tip);
            dots.on('mouseover', tip.show).on('mouseout', tip.hide);
        }
        zoomed();

        function zoomed() {
            if (self.onVizChange && d3.event) {
                self.onVizChange.call(self, {
                    scale: d3.event.scale,
                    translate: d3.event.translate,
                    domain: x.domain()
                });
            } else {
              if (typeof state == "string") { state = JSON.parse(state); }
              console.log(state);
              console.log(zoom.scale(state.scale).translate(state.translate))
            }
            svg.select('.x.axis').call(xAxis);
            svg.selectAll('circle.dot').attr('cx', function(d) {
                return x(d.at);
            });
            svg.selectAll('rect.interval').attr('x', function(d) {
                return x(d.from);
            }).attr('width', function(d) {
                return x(d.to) - x(d.from);
            });
            /*svg.selectAll('.interval-text').attr('x', function(d) {
                var positionData = getTextPositionData.call(this, d);
                if (positionData.upToPosition - groupWidth - 10 < positionData.textWidth) {
                    return positionData.upToPosition;
                } else if (positionData.xPosition < groupWidth && positionData.upToPosition > groupWidth) {
                    return groupWidth;
                }
                return positionData.xPosition;
            }).attr('text-anchor', function(d) {
                var positionData = getTextPositionData.call(this, d);
                if (positionData.upToPosition - groupWidth - 10 < positionData.textWidth) {
                    return 'end';
                }
                return 'start';
            }).attr('dx', function(d) {
                var positionData = getTextPositionData.call(this, d);
                if (positionData.upToPosition - groupWidth - 10 < positionData.textWidth) {
                    return '-0.5em';
                }
                return '0.5em';
            });

            function getTextPositionData(d) {
                return {
                    xPosition: x(d.from),
                    upToPosition: x(d.to),
                    textWidth: this.getComputedTextLength()
                };
            }*/
        }
    }
    _createClass(TimelineChart, [{
        key: 'extendOptions',
        value: function extendOptions() {
            var ext = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
            var defaultOptions = {
                tip: undefined
            };
            Object.keys(ext).map(function(k) {
                return defaultOptions[k] = ext[k];
            });
            return defaultOptions;
        }
    }, {
        key: 'getPointMinDt',
        value: function getPointMinDt(p) {
            return p.type === TimelineChart.TYPE.POINT ? p.at : p.from;
        }
    }, {
        key: 'getPointMaxDt',
        value: function getPointMaxDt(p) {
            return p.type === TimelineChart.TYPE.POINT ? p.at : p.to;
        }
    }, {
        key: 'onVizChange',
        value: function onVizChange(fn) {
            this.onVizChange = fn;
            return this;
        }
    }, {
        key: 'setState',
        value: function setState(state,data) {
          if (typeof state == "string") { state = JSON.parse(state); }
          var margin = { top: 0, right: 0, bottom: 20, left: 0 };
          var element = $("#chart")[0];
          var allElements = data.reduce(function(agg, e) {
              return agg.concat(e.data);
          }, []);
          var minDt = new Date(state.domain[0]);
          var maxDt = new Date(state.domain[1]);
          var elementWidth = element.clientWidth;
          var elementHeight = element.clientHeight;
          var width = elementWidth - margin.left - margin.right;
          var height = elementHeight - margin.top - margin.bottom;
          var groupWidth = 36;
          var x = d3.time.scale().domain([minDt, maxDt]).range([groupWidth, width]);
          var xAxis = d3.svg.axis().scale(x).orient('bottom').tickSize(-height);
          var svg = d3.select("#chart")
          svg.select('.x.axis').call(xAxis);
          svg.selectAll('circle.dot').attr('cx', function(d) {
              return x(d.at);
          });
          svg.selectAll('rect.interval').attr('x', function(d) {
              return x(d.from);
          }).attr('width', function(d) {
              return x(d.to) - x(d.from);
          });
        }
    }]);
    return TimelineChart;
}();
TimelineChart.TYPE = {
    POINT: Symbol(),
    INTERVAL: Symbol()
};

