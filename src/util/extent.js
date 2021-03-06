import d3 from 'd3';

/**
 * The extent function enhances the functionality of the equivalent D3 extent function, allowing
 * you to pass an array of fields, or accessors, which will be used to derive the extent of the supplied array. For
 * example, if you have an array of items with properties of 'high' and 'low', you
 * can use <code>fc.util.extent().fields(['high', 'low'])(data)</code> to compute the extent of your data.
 *
 * @memberof fc.util
 */
export default function() {

    var fields = [],
        extraPoint = null,
        padding = 0,
        symmetricalAbout = null;

    /**
    * @param {array} data an array of data points, or an array of arrays of data points
    */
    var extents = function(data) {

        // we need an array of arrays if we don't have one already
        if (!Array.isArray(data[0])) {
            data = [data];
        }

        // the fields can be a mixed array of property names or accessor functions
        fields = fields.map(function(field) {
            if (typeof field !== 'string') {
                return field;
            }
            return function(d) {
                return d[field];
            };
        });

        var dataMin = d3.min(data, function(d0) {
            return d3.min(d0, function(d1) {
                return d3.min(fields.map(function(f) {
                    return f(d1);
                }));
            });
        });

        var dataMax = d3.max(data, function(d0) {
            return d3.max(d0, function(d1) {
                return d3.max(fields.map(function(f) {
                    return f(d1);
                }));
            });
        });

        var dateExtent = Object.prototype.toString.call(dataMin) === '[object Date]';

        var min = dateExtent ? dataMin.getTime() : dataMin;
        var max = dateExtent ? dataMax.getTime() : dataMax;

        // apply symmetry rules
        if (symmetricalAbout != null) {
            var symmetrical = dateExtent ? symmetricalAbout.getTime() : symmetricalAbout;
            var distanceFromMax = Math.abs(max - symmetrical),
                distanceFromMin = Math.abs(min - symmetrical),
                halfRange = Math.max(distanceFromMax, distanceFromMin);

            min = symmetrical - halfRange;
            max = symmetrical + halfRange;
        }

        // pad
        if (Array.isArray(padding)) {
            var deltaArray = [padding[0] * (max - min), padding[1] * (max - min)];
            min -= deltaArray[0];
            max += deltaArray[1];
        } else {
            var delta = padding * (max - min) / 2;
            min -= delta;
            max += delta;
        }

        // Include the specified point in the range
        if (extraPoint !== null) {
            if (extraPoint < min) {
                min = extraPoint;
            } else if (extraPoint > max) {
                max = extraPoint;
            }
        }

        if (dateExtent) {
            min = new Date(min);
            max = new Date(max);
        }

        // Return the smallest and largest
        return [min, max];
    };

    /*
    * @param {array} fields the names of object properties that represent field values, or accessor functions.
    */
    extents.fields = function(x) {
        if (!arguments.length) {
            return fields;
        }

        // the fields parameter must be an array of field names,
        // but we can pass non-array types in
        if (!Array.isArray(x)) {
            x = [x];
        }

        fields = x;
        return extents;
    };

    extents.include = function(x) {
        if (!arguments.length) {
            return extraPoint;
        }
        extraPoint = x;
        return extents;
    };

    extents.pad = function(x) {
        if (!arguments.length) {
            return padding;
        }
        padding = x;
        return extents;
    };

    extents.symmetricalAbout = function(x) {
        if (!arguments.length) {
            return symmetricalAbout;
        }
        symmetricalAbout = x;
        return extents;
    };

    return extents;
}
