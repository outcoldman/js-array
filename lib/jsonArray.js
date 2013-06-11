"use strict";

var fromJSONArrayToArray = function (schema, values) {
    var result = [];
    var itemSchema = schema[0];
    for (var index = 0; index < values.length; index++) {
        result.push(fromJSONArrayToUnknown(itemSchema, values[index]));
    }
    return result;
};

var fromJSONArrayToObject = function (schema, values) {
    if (!Array.isArray(values)) {
        return values;
    }

    var result = {};
    var propertyNames = Object.getOwnPropertyNames(schema);
    for (var i = 0; i < values.length, i < propertyNames.length; i++) {
        var propertyValue = values[i];
        var propertyName = propertyNames[i];
        result[propertyName] = fromJSONArrayToUnknown(schema[propertyName], propertyValue);
    }
    return result;
};

var fromJSONArrayToUnknown = function (schema, values) {
    if (Array.isArray(schema)) {
        return fromJSONArrayToArray(schema, values);
    } else if (typeof schema === 'object') {
        return fromJSONArrayToObject(schema, values);
    } else return values;
};

var fromJSONArray = function (data) {
    return fromJSONArrayToUnknown(data.schema, data.value)
};

var unknownToJSONArray = function (obj, parentSchema) {
    if (Array.isArray(obj)) {
        return arrayToJSONArray(obj, parentSchema);
    } else if (typeof obj === 'object') {
        return objectToJSONArray(obj, parentSchema);
    } else return { schema: '', value: obj };
};

var arrayToJSONArray = function (obj, parentSchema) {
    var result = [];
    var schema = [];

    for (var index = 0; index < obj.length; index ++) {
        var res = unknownToJSONArray(obj[index], schema);
        result.push(res.value);
        if (schema.length == 0) {
            schema.push(res.schema);
        }
    }

    return { schema: schema, value: result };
};

var objectToJSONArray = function (obj, parentSchema) {
    var result = [];
    var schema = null;

    if (Array.isArray(parentSchema) && parentSchema.length > 0) {
        schema = parentSchema[0];
    } else {
        schema = {};
    }

    var knownProperties = Object.getOwnPropertyNames(schema);
    for (var pIndex = 0; pIndex < knownProperties.length; pIndex ++) {
        var propertyName = knownProperties[pIndex];
        var propertyValue = obj[propertyName];
        if (typeof propertyValue != 'undefined') {
            result.push(unknownToJSONArray(obj[propertyName]).value);
        } else {
            result.push(null);
        }
    }

    var propertyNames = Object.getOwnPropertyNames(obj);
    for (var pIndex = 0; pIndex < propertyNames.length; pIndex ++) {
        var propertyName = propertyNames[pIndex];
        if (!schema.hasOwnProperty(propertyName)) {
            var res = unknownToJSONArray(obj[propertyName]);
            result.push(res.value);
            schema[propertyName] = res.schema;
        }
    }
    return { schema: schema, value: result };
};

var toJSONArray = function (obj) {
    return unknownToJSONArray(obj);
};

module.exports = {
  toJSONArray : toJSONArray,
  fromJSONArray : fromJSONArray
};