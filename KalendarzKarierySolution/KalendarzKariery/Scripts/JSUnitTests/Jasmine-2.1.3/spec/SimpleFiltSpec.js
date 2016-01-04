/// <reference path="../../../JSUtils/SimpleFilt.js" />

describe("SimpleFilt.js", function () {
    var simpleFilt = SIMPLE_FILT();

    describe("method checkByPropertyAndOrPredicate(checkArgs)", function () {

        describe("testing checkArg's prop against values", function () {
            it("returns true when value matches object property (single check argument, shallow object property, single value)", function () {

                var obj = { "name": "foo" };
                var checkArgs = [{ "prop": obj.name, "values": ["foo"] }]

                var actual = simpleFilt.checkByPropertyAndOrPredicate(checkArgs);

                expect(actual).toBe(true);

            });

            it("returns false when value does not match object property (single check argument, shallow object property, single value)", function () {
                var obj = { "name": "bar" };
                var checkArgs = [{ "prop": obj.name, "values": ["foo"] }]

                var actual = simpleFilt.checkByPropertyAndOrPredicate(checkArgs);

                expect(actual).toBe(false);
            });

            it("returns true when all checkArgs values match their corresponding object property (multiple check argument with 'and' as bool specifier, shallow object property, single value)", function () {
                var obj = { "name": "foo", "age": 18 };
                var checkArgs = [{ "prop": obj.name, "values": ["foo"] }, { "boolSpecifier": "and", "prop": obj.age, "values": [18] }]

                var actual = simpleFilt.checkByPropertyAndOrPredicate(checkArgs);

                expect(actual).toBe(true);
            });

            it("returns false when one checkArg does not match its corresponding object property (multiple check argument with 'and' as bool specifier, shallow object property, single value)", function () {
                var obj = { "name": "foo", "age": 18 };
                var checkArgs = [{ "prop": obj.name, "values": ["foo"] }, { "boolSpecifier": "and", "prop": obj.age, "values": [-1] }]

                var actual = simpleFilt.checkByPropertyAndOrPredicate(checkArgs);

                expect(actual).toBe(false);
            });

            it("returns false when all checkArgs do not match their corresponding object property (multiple check argument with 'and' as bool specifier, shallow object property, single value)", function () {
                var obj = { "name": "foo", "age": 18 };
                var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "and", "prop": obj.age, "values": [-1] }]

                var actual = simpleFilt.checkByPropertyAndOrPredicate(checkArgs);

                expect(actual).toBe(false);
            });

            it("returns true when one checkArg matches its corresponding object property (multiple check argument with 'or' as bool specifier, shallow object property, single value)", function () {
                var obj = { "name": "foo", "age": 18 };
                var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "or", "prop": obj.age, "values": [18] }]

                var actual = simpleFilt.checkByPropertyAndOrPredicate(checkArgs);

                expect(actual).toBe(true);
            });

            it("returns true when all checkArgs match its corresponding object property (multiple check argument with 'or' as bool specifier, shallow object property, single value)", function () {
                var obj = { "name": "foo", "age": 18 };
                var checkArgs = [{ "prop": obj.name, "values": ["foo"] }, { "boolSpecifier": "or", "prop": obj.age, "values": [18] }]

                var actual = simpleFilt.checkByPropertyAndOrPredicate(checkArgs);

                expect(actual).toBe(true);
            });

            it("returns false when all checkArgs do not match its corresponding object property (multiple check argument with 'or' as bool specifier, shallow object property, single value)", function () {
                var obj = { "name": "foo", "age": 18 };
                var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "or", "prop": obj.age, "values": [-1] }]

                var actual = simpleFilt.checkByPropertyAndOrPredicate(checkArgs);

                expect(actual).toBe(false);
            });

            it("returns true when value matches object property (single check argument, nested object property, single value)", function () {
                var obj = {
                    "foo": {
                        "foo": {
                                "bar": "foo"
                        }

                    }
                };
                var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["foo"] }]

                var actual = simpleFilt.checkByPropertyAndOrPredicate(checkArgs);

                expect(actual).toBe(true);
            });

            it("returns false when value does not match object property (single check argument, nested object property, single value)", function () {
                var obj = {
                    "foo": {
                        "foo": {
                            "bar": "foo"
                        }

                    }
                };
                var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["buzz"] }]

                var actual = simpleFilt.checkByPropertyAndOrPredicate(checkArgs);

                expect(actual).toBe(false);
            });

            xit("returns true when value matches object property (multiple check argument, nested object property, single value)", function () {
                var obj = {
                    "foo": {
                        "foo": {
                            "bar": "foo"
                        }

                    },
                    "buzz": {
                        "bar": {
                            "foo": {
                                "bar":"buzz"
                            }
                        }
                    }
                };
                var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["foo"] }, {"boolSpecifier": "and", "prop": obj.buzz.bar.foo.bar, "values": ["buzz"] }]

                var actual = simpleFilt.checkByPropertyAndOrPredicate(checkArgs);

                expect(actual).toBe(true);
            });

        });
    });

    describe("method checkByPropertyAndOrPredicate(inputArray, checkArgsFunc, argsArr)", function () {
        it("", function () {

        });

        it("", function () {

        });
    });
});