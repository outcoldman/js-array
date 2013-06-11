require.config({
    baseUrl: "/test"
});
require(["config"]);

describe("toJSONArray Tests", function() {
    var input;
    var jsonArray;

    beforeEach(function () {
        runs(function () {
            require(["lib/jsonArray"], function (module) {
                jsonArray = {};
            });
        });

        waitsFor(function () {
            return jsonArray;
        });
    });

    describe("unknownToJSONArray tests", function() {
        var backupArrayToJSONArray, backupObjectToJSONArray;

        beforeEach(function(){
            backupArrayToJSONArray = arrayToJSONArray;
            backupObjectToJSONArray = objectToJSONArray;
        });

        afterEach(function() {
            arrayToJSONArray = backupArrayToJSONArray;
            objectToJSONArray = backupObjectToJSONArray;
        })

        it("array passed to arrayToJSONArray", function() {
            input = [ 1, 2 ];
            var expectedInput = null;
            arrayToJSONArray = function(functionInput) {
                return expectedInput = functionInput;
            };

            unknownToJSONArray(input, {});

            expect(expectedInput).toBe(input);
        });

        it("object passed to objectToJSONArray", function() {
            input = { a : "1", b : 2 };
            var expectedInput = null;
            objectToJSONArray = function(functionInput) {
                return expectedInput = functionInput;
            };

            unknownToJSONArray(input, {});

            expect(expectedInput).toBe(input);
        });

        it("string handled as a simple value", function() {
            input = 'test';

            var result = unknownToJSONArray(input, {});

            expect(result).toEqual({ schema: '', value: 'test' });
        });
    });

    describe("objectToJSONArray tests", function() {
        it("simple object", function(){
            input = { a : "1", b : 2 }

            var result = objectToJSONArray(input, []);

            expect(result).toEqual({ schema: {  a: '', b: '' }, value : [ "1", 2 ] });
        });

        it("simple object and existing schema in parent schema", function(){
            input = { a : "1", b : 2 }

            var result = objectToJSONArray(input, [{  a: '', b: '' }]);

            expect(result).toEqual({ schema: {  a: '', b: '' }, value : [ "1", 2 ] });
        });

        it("simple object with additional field and existing schema in parent schema", function(){
            input = { a : "1", c : 3, b : 2 }

            var result = objectToJSONArray(input, [{  a: '', b: '' }]);

            expect(result).toEqual({ schema: {  a: '', b: '', c : '' }, value : [ "1", 2, 3 ] });
        });
    });

    describe("arrayToJSONArray tests", function() {
        it("simple array of objects", function() {
            input = [ { a: 1 }, { a: 2 }, { a: 3 } ];

            var result = arrayToJSONArray(input, {});

            expect(result).toEqual({ schema : [{ a : '' }], value : [ [1], [2], [3] ] });
        });

        it("simple array of objects with sub arrays", function() {
            input = [ { a: [ { b : 1 } ] }, { a: [ { b : 2 } ] }, { a: [ { b : 3 } ] } ];

            var result = arrayToJSONArray(input, {});

            expect(result).toEqual({ schema : [{ a : [ { b : '' } ] }], value : [ [ [ [1] ] ] , [ [ [2] ] ] , [ [ [3] ] ] ] });
        });
    });
});