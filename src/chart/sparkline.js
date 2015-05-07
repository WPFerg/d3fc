(function(d3, fc) {
    'use strict';

    fc.charts.sparkline = function() {

        // creates an array with four elements, representing the high, low, open and close
        // values of the given array
        function highLowOpenClose(data) {
            var xValueAccessor = sparkline.xValue(),
                yValueAccessor = sparkline.yValue();

            var high = d3.max(data, yValueAccessor);
            var low = d3.min(data, yValueAccessor);

            function elementWithYValue(value) {
                return data.filter(function(d) {
                    return yValueAccessor(d) === value;
                })[0];
            }

            return [{
                    x: xValueAccessor(data[0]),
                    y: yValueAccessor(data[0])
                }, {
                    x: xValueAccessor(elementWithYValue(high)),
                    y: high
                }, {
                    x: xValueAccessor(elementWithYValue(low)),
                    y: low
                }, {
                    x: xValueAccessor(data[data.length - 1]),
                    y: yValueAccessor(data[data.length - 1])
                }];
        }

        var xScale = fc.scale.dateTime();
        var yScale = d3.scale.linear();
        var line = fc.series.line();

        // configure the point series to render the data from the
        // highLowOpenClose function
        var point = fc.series.point()
            .xValue(function(d) { return d.x; })
            .yValue(function(d) { return d.y; })
            .decorate(function(sel) {
                sel.attr('class', function(d, i) {
                    switch (i) {
                        case 0: return 'open';
                        case 1: return 'high';
                        case 2: return 'low';
                        case 3: return 'close';
                    }
                });
            });

        var multi = fc.series.multi()
            .series([line, point])
            .mapping(function(data, series) {
                switch (series) {
                    case point:
                        return highLowOpenClose(data);
                    default:
                        return data;
                }
            });

        var sparkline = function(selection) {

            point.radius(sparkline.radius.value);

            selection.each(function(data) {

                var container = d3.select(this);

                var mainContainer = container.selectAll('g')
                    .data([data]);
                mainContainer.enter()
                    .append('g')
                    .classed('sparkline', true)
                    .layout({
                        flex: 1,
                        margin: sparkline.radius.value
                    });

                container.layout();

                xScale.range([0, mainContainer.layout('width')]);
                yScale.range([mainContainer.layout('height'), 0]);

                multi.xScale(xScale)
                    .yScale(yScale);

                mainContainer.call(multi);

            });
        };

        fc.utilities.rebind(sparkline, xScale, {
            xDiscontinuityProvider: 'discontinuityProvider',
            xDomain: 'domain'
        });

        fc.utilities.rebind(sparkline, yScale, {
            yDomain: 'domain'
        });

        fc.utilities.rebind(sparkline, line, 'xValue', 'yValue');

        sparkline.xScale = function() { return xScale; };
        sparkline.yScale = function() { return yScale; };

        sparkline.radius = fc.utilities.property(2);

        return sparkline;
    };

})(d3, fc);