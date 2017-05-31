/// <reference path="../../../JSUtils/SimpleFilt.js" />

describe("SimpleFilt.js", function () {
  "use strict";

  var simpleFilt = SIMPLE_FILT();

  describe("method checkIf(checkArgs)", function () {
    describe("testing checkArg's prop against values", function () {
      it("returns true when value matches property (single check argument, shallow object property, single value)", function () {
        var obj = { "name": "foo" };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("returns false when value does not match property (single check argument, shallow object property, single value)", function () {
        var obj = { "name": "bar" };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });

      it("returns true when value matches property (single check argument, nested object property, single value)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["foo"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("returns false when value does not match property (single check argument, nested object property, single value)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["buzz"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });


      it("returns true when at least one value matches property (single check argument, shallow object property, multiple values)", function () {

        var obj = { "name": "foo" };
        var checkArgs = [{ "prop": obj.name, "values": ["bar", "foo"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);

      });

      it("returns false when no value matches property (single check argument, shallow object property, multiple values)", function () {
        var obj = { "name": "bar" };
        var checkArgs = [{ "prop": obj.name, "values": ["foo", "buzz"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });

      it("returns true when value matches property (single check argument, nested object property, multiple values)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["foo", "buzz"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("returns false when no value matches property (single check argument, nested object property, multiple values)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }
          }
        };

        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["buzz", "bar"] }];

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });


      it("returns true when value of all checkArgs matches property (multiple check arguments with 'and' as boolSpecifier, shallow property, single value)", function () {
        var obj = { "name": "foo", "age": 18 };

        var checkArgs = [{ "prop": obj.name, "values": ["foo"] }, { "boolSpecifier": "and", "prop": obj.age, "values": [18] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("returns false when value of first checkArg does not match property (multiple check arguments with 'and' as boolSpecifier, shallow property, single value)", function () {
        var obj = { "name": "foo", "age": 18 };

        var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "and", "prop": obj.age, "values": [18] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });

      it("returns false when value of other checkArgs does not match property (multiple check arguments with 'and' as boolSpecifier, shallow property, single value)", function () {
        var obj = { "name": "foo", "age": 18 };

        var checkArgs = [{ "prop": obj.name, "values": ["foo"] }, { "boolSpecifier": "and", "prop": obj.age, "values": [1] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });

      it("returns false when no value of all checkArgs matches property' value does not match property (multiple check arguments with 'and' as boolSpecifier, shallow property, single value)", function () {
        var obj = { "name": "foo", "age": 18 };

        var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "and", "prop": obj.age, "values": [1] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });


      it("returns true when value of all checkArgs matches property (multiple check arguments with 'or' as boolSpecifier, shallow object property, single value)", function () {
        var obj = { "name": "foo", "age": 18 };

        var checkArgs = [{ "prop": obj.name, "values": ["foo"] }, { "boolSpecifier": "or", "prop": obj.age, "values": [18] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("returns true when value of first checkArg matches property (multiple check arguments with 'or' as boolSpecifier, shallow object property, single value)", function () {
        var obj = { "name": "foo", "age": 18 };

        var checkArgs = [{ "prop": obj.name, "values": ["foo"] }, { "boolSpecifier": "or", "prop": obj.age, "values": [1] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("returns true when value of other checkArg matches property (multiple check arguments with 'or' as boolSpecifier, shallow object property, single value)", function () {
        var obj = { "name": "foo", "age": 18 };

        var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "or", "prop": obj.age, "values": [18] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("returns false when no value of all checkArgs matches property (multiple check arguments with 'or' as boolSpecifier, shallow object property, single value)", function () {
        var obj = { "name": "foo", "age": 18 };

        var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "or", "prop": obj.age, "values": [1] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });


      it("returns true when value of all checkArgs matches property (multiple check arguments with 'and' as boolSpecifier, nested object property, single value)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          },
          "buzz": {
            "bar": {
              "foo": {
                "bar": "buzz"
              }
            }
          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["foo"] }, { "boolSpecifier": "and", "prop": obj.buzz.bar.foo.bar, "values": ["buzz"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("returns false when value of first checkArg does not match property (multiple check arguments with 'and' as boolSpecifier, nested object property, single value)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          },
          "buzz": {
            "bar": {
              "foo": {
                "bar": "buzz"
              }
            }
          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["buzz"] }, { "boolSpecifier": "and", "prop": obj.buzz.bar.foo.bar, "values": ["buzz"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });

      it("returns false when value of other checkArgs does not match property (multiple check arguments with 'and' as boolSpecifier, nested object property, single value)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          },
          "buzz": {
            "bar": {
              "foo": {
                "bar": "buzz"
              }
            }
          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["foo"] }, { "boolSpecifier": "and", "prop": obj.buzz.bar.foo.bar, "values": ["foo"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });

      it("returns false when no value of all checkArgs matches property' value does not match property (multiple check arguments with 'and' as boolSpecifier, nested object property, single value)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          },
          "buzz": {
            "bar": {
              "foo": {
                "bar": "buzz"
              }
            }
          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["buzz"] }, { "boolSpecifier": "and", "prop": obj.buzz.bar.foo.bar, "values": ["foo"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });


      it("returns true when value of all checkArgs matches property (multiple check arguments with 'or' as boolSpecifier, nested object property, single value)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          },
          "buzz": {
            "bar": {
              "foo": {
                "bar": "buzz"
              }
            }
          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["foo"] }, { "boolSpecifier": "or", "prop": obj.buzz.bar.foo.bar, "values": ["buzz"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("returns true when value of first checkArg matches property (multiple check arguments with 'or' as boolSpecifier, nested object property, single value)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          },
          "buzz": {
            "bar": {
              "foo": {
                "bar": "buzz"
              }
            }
          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["foo"] }, { "boolSpecifier": "or", "prop": obj.buzz.bar.foo.bar, "values": ["foo"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("returns true when value of other checkArg matches property (multiple check arguments with 'or' as boolSpecifier, nested object property, single value)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          },
          "buzz": {
            "bar": {
              "foo": {
                "bar": "buzz"
              }
            }
          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["buzz"] }, { "boolSpecifier": "or", "prop": obj.buzz.bar.foo.bar, "values": ["buzz"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("returns false when no value of all checkArgs matches property (multiple check arguments with 'or' as boolSpecifier, nested object property, single value)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          },
          "buzz": {
            "bar": {
              "foo": {
                "bar": "buzz"
              }
            }
          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["buzz"] }, { "boolSpecifier": "or", "prop": obj.buzz.bar.foo.bar, "values": ["foo"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });


      it("returns true when at least one value of all checkArgs matches property (multiple check arguments with 'and' as boolSpecifier, nested object property, multiple values)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          },
          "buzz": {
            "bar": {
              "foo": {
                "bar": "buzz"
              }
            }
          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["bar", "foo"] }, { "boolSpecifier": "and", "prop": obj.buzz.bar.foo.bar, "values": ["buzz", "bar"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("returns false when value of first checkArg does not match property (multiple check arguments with 'and' as boolSpecifier, nested object property, multiple values)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          },
          "buzz": {
            "bar": {
              "foo": {
                "bar": "buzz"
              }
            }
          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["buzz", "bar"] }, { "boolSpecifier": "and", "prop": obj.buzz.bar.foo.bar, "values": ["buzz", "bar"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });

      it("returns false when value of other checkArg does not match property (multiple check arguments with 'and' as boolSpecifier, nested object property, multiple values)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          },
          "buzz": {
            "bar": {
              "foo": {
                "bar": "buzz"
              }
            }
          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["foo", "bar"] }, { "boolSpecifier": "and", "prop": obj.buzz.bar.foo.bar, "values": ["foo", "bar"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });

      it("returns false when no value of all checkArgs matches property (multiple check arguments with 'and' as boolSpecifier, nested object property, multiple values)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          },
          "buzz": {
            "bar": {
              "foo": {
                "bar": "buzz"
              }
            }
          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["buzz", "bar"] }, { "boolSpecifier": "and", "prop": obj.buzz.bar.foo.bar, "values": ["foo", "bar"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });


      it("returns true when at least one value of first checkArg match its corresponding object property (multiple check arguments with 'or' as boolSpecifier, nested object property, multiple values)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          },
          "buzz": {
            "bar": {
              "foo": {
                "bar": "buzz"
              }
            }
          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["bar", "foo"] }, { "boolSpecifier": "or", "prop": obj.buzz.bar.foo.bar, "values": ["foo", "bar"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("returns true when at least one value of other checkArg matches property (multiple check arguments with 'or' as boolSpecifier, nested object property, multiple values)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          },
          "buzz": {
            "bar": {
              "foo": {
                "bar": "buzz"
              }
            }
          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["buzz", "bar"] }, { "boolSpecifier": "or", "prop": obj.buzz.bar.foo.bar, "values": ["buzz", "bar"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("returns true when at least one value of all checkArgs matches property (multiple check arguments with 'or' as boolSpecifier, nested object property, multiple values)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          },
          "buzz": {
            "bar": {
              "foo": {
                "bar": "buzz"
              }
            }
          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["foo", "bar"] }, { "boolSpecifier": "or", "prop": obj.buzz.bar.foo.bar, "values": ["foo", "buzz"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("returns false when no value of all checkArgs matches property (multiple check arguments with 'or' as boolSpecifier, nested object property, multiple values)", function () {
        var obj = {
          "foo": {
            "foo": {
              "bar": "foo"
            }

          },
          "buzz": {
            "bar": {
              "foo": {
                "bar": "buzz"
              }
            }
          }
        };
        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["buzz", "bar"] }, { "boolSpecifier": "and", "prop": obj.buzz.bar.foo.bar, "values": ["foo", "bar"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });

      it("expect not to throw Error when child property does not exist (returns true)", function () {
        var param, prop, actual;
        var obj = {
          "foo": {
            "foo": {
            }
          }
        }

        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": [undefined] }];

        expect(function () { simpleFilt.checkIf(checkArgs) }).not.toThrowError();

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("expect not to throw Error when child property does not exist (returns false)", function () {
        var param, prop, actual;
        var obj = {
          "foo": {
            "foo": {
            }
          }
        }

        var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["foo"] }];

        expect(function () { simpleFilt.checkIf(checkArgs) }).not.toThrowError();

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

    });

    describe("testing checkArg's prop against predicate", function () {
      it("Expect to throw TypeError when return value of provided predicate is not a bolean type.", function () {
        var predicate = function (obj) {
          return 0;
        };

        var checkArgs = [{ "prop": "foo", "predicate": predicate }]
        expect(function () { simpleFilt.checkIf(checkArgs) }).toThrowError(TypeError, "Returned type from provided predicate function is not a primitive boolean value such as true or false.");
      });

      it("returns true when predicate returns true. (without passed param to predicate)", function () {
        var predicate = function () {
          return true;
        };

        var checkArgs = [{ "prop": "foo", "predicate": predicate }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("returns false when predicate returns false. (without passed param to predicate)", function () {
        var predicate = function () {
          return false;
        };

        var checkArgs = [{ "prop": "foo", "predicate": predicate }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });

      it("check being done on passed parameter works as expected (return true)", function () {
        var obj = { "name": "foo", "age": 18 }
        var predicate = function (obj) {
          return obj.name === "foo" && obj.age === 18;
        };

        var checkArgs = [{ "prop": obj, "predicate": predicate }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("check being done on passed parameter works as expected (return false)", function () {
        var obj = { "name": "foo", "age": 18 }
        var predicate = function (obj) {
          return obj.name === "foo123" && obj.age === 18;
        };

        var checkArgs = [{ "prop": obj, "predicate": predicate }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });

      it("check being done on passed parameter works as expected (return true, additional check done in predicate)", function () {
        var obj = { "name": "foo", "age": 18 }
        var obj2 = { "isCool": true };

        var predicate = function (propParam) {
          return (propParam.name === "foo" && propParam.age === 18) && obj2.isCool;
        };

        var checkArgs = [{ "prop": obj, "predicate": predicate }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      });

      it("check being done on passed parameter works as expected (return false, additional check done in predicate)", function () {
        var obj = { "name": "foo", "age": 18 }
        var obj2 = { "isCool": true };

        var predicate = function (propParam) {
          return propParam === "foo" && !obj2.isCool;
        };

        var checkArgs = [{ "prop": obj.name, "predicate": predicate }];

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      });

      it("check being done on passed parameter works as expected (return false, additional check done in predicate - using closure to return checkArgs array)", function () {
        function a1() {
          var obj = { "name": "foo", "age": 18 }
          var obj2 = { "isCool": true };

          var predicate = function (propParam) {
            return propParam === "foo" && !obj2.isCool;
          };

          var checkArgs = [{ "prop": obj.name, "predicate": predicate }];
          return checkArgs;
        }

        var actual = simpleFilt.checkIf(a1());

        expect(actual).toBe(false);
      });

      it("check being done on passed parameter works as expected (return false, additional check done in predicate - using closure to return checkArgs array)", function () {
        function a1() {
          var obj = { "name": "foo", "age": 18 }
          var obj2 = { "isCool": true };

          var predicate = function (propParam) {
            return propParam === "foo" && obj2.isCool;
          };

          var checkArgs = [{ "prop": obj.name, "predicate": predicate }];
          return checkArgs;
        }

        var actual = simpleFilt.checkIf(a1());

        expect(actual).toBe(true);
      });
    });

    describe("testing validation + exceptions", function () {
      it("different types of values shouldn't affect functionality when at least one value matches property", function () {
        var checkArgs = [{ "prop": "foo", "values": [0, -1, 1, true, false, undefined, null, NaN, "", " ", "buzz", String("buzz"), new String("buzz"), Number(-1), new Number(100), Boolean(false), new Boolean(true), Date, new Date(), function () { }, new Array(), [], "foo"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("different types of values shouldn't affect functionality when no value matches property", function () {
        var checkArgs = [{ "prop": "foo", "values": [0, -1, 1, true, false, undefined, null, NaN, "", " ", "buzz", String("buzz"), new String("buzz"), Number(-1), new Number(100), Boolean(false), new Boolean(true), Date, new Date(), function () { }, new Array(), []] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      })

      it("same types of values shouldn't affect functionality when all values match property", function () {
        var checkArgs = [{ "prop": 18, "values": [18, 18, 18] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("returns true 'prop' is undefined and is compared against undefined", function () {
        var checkArgs = [{ "prop": undefined, "values": [undefined] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("returns true when 'prop' is null and is compared against null", function () {
        var checkArgs = [{ "prop": null, "values": [null] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("returns false when 'prop' is NaN and is compared against NaN", function () {
        var checkArgs = [{ "prop": NaN, "values": [NaN] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      })

      it("returns true when 'prop' is '' and is compared against empty string", function () {
        var checkArgs = [{ "prop": '', "values": [""] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("returns true when 'prop' is string('') and is compared against empty string", function () {
        var checkArgs = [{ "prop": String(''), "values": [''] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("returns false when 'prop' is new string('') and is compared against empty string", function () {
        var checkArgs = [{ "prop": new String(''), "values": [''] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      })

      it("returns true when 'prop' is string and is compared against a string with the same value", function () {
        var checkArgs = [{ "prop": "john", "values": ["john"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("returns true when 'prop' is String(string) and is compared against a string with the same value", function () {
        var checkArgs = [{ "prop": String("john"), "values": ["john"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("returns false when 'prop' is new String(string) and is compared against a string with the same value", function () {
        var checkArgs = [{ "prop": new String("john"), "values": ["john"] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      })

      it("returns true when 'prop' is number and is compared against a number", function () {
        var checkArgs = [{ "prop": 18, "values": [18] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("returns true when 'prop' is Number(number) and is compared against a number", function () {
        var checkArgs = [{ "prop": Number(18), "values": [18] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("returns false when 'prop' is new Number(number) and is compared against a number", function () {
        var checkArgs = [{ "prop": new Number(18), "values": [18] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      })

      it("returns true when 'prop' is true and is compared against true", function () {
        var checkArgs = [{ "prop": true, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("returns true when 'prop' is Boolean(true) and is compared against true", function () {
        var checkArgs = [{ "prop": Boolean(true), "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("returns false when 'prop' is new Boolean(true) and is compared against true", function () {
        var checkArgs = [{ "prop": new Boolean(true), "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      })

      it("returns true when 'prop' is false and is compared against false", function () {
        var checkArgs = [{ "prop": false, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("returns true when 'prop' is Boolean(false) and is compared against false", function () {
        var checkArgs = [{ "prop": Boolean(false), "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("returns false when 'prop' is new Boolean(false) and is compared against false", function () {
        var checkArgs = [{ "prop": new Boolean(false), "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      })

      it("does not use hidden type conversion when comparing (0 -> false)", function () {
        var checkArgs = [{ "prop": 0, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      })

      it("does not use hidden type conversion when comparing ('' -> false)", function () {
        var checkArgs = [{ "prop": '', "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      })

      it("does not use hidden type conversion when comparing ('' -> 0)", function () {
        var checkArgs = [{ "prop": 0, "values": [''] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      })

      it("does not use hidden type conversion when comparing (0 -> '0')", function () {
        var checkArgs = [{ "prop": 0, "values": ['0'] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      })

      it("does not use hidden type conversion when comparing (1 -> '1')", function () {
        var checkArgs = [{ "prop": 1, "values": ['1'] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      })

      it("does not use hidden type conversion when comparing ([1,2,3] -> '1,2,3')", function () {
        var checkArgs = [{ "prop": [1, 2, 3], "values": ['1,2,3'] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      })

      it("does not use hidden type conversion when comparing (1 -> true)", function () {
        var checkArgs = [{ "prop": 1, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      })

      it("does not use hidden type conversion when comparing (undefined -> null)", function () {
        var checkArgs = [{ "prop": undefined, "values": [null] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      })

      it("return false for arrays with same elements but different reference", function () {
        var checkArgs = [{ "prop": [1, 1, 1], "values": [[1, 1, 1]] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      })

      it("return true for arrays with same reference", function () {
        var numbers = [1, 2, 3];
        var checkArgs = [{ "prop": numbers, "values": [numbers] }];

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("return false for same objects but different reference", function () {
        var obj = { "person": { "name": "john", "age": 18 } };
        var checkArgs = [{ "prop": obj.person, "values": [{ "name": "john", "age": 18 }] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      })

      it("return true for objects with same reference", function () {
        var obj = { "person": { "name": "john", "age": 18 } };
        var checkArgs = [{ "prop": obj.person, "values": [obj.person] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("return false for parents with different reference having nested objects with same reference ", function () {
        var obj = { "person": { "name": { "firstname": "john", "lastname": "smith" }, "age": 18 } };
        var checkArgs = [{ "prop": obj.person, "values": [{ "name": obj.person.name, "age": obj.age }] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(false);
      })

      it("return true for nested objects with same reference", function () {
        var obj = { "person": { "name": { "firstname": "john", "lastname": "smith" }, "age": 18 } };
        var checkArgs = [{ "prop": obj.person.name, "values": [obj.person.name] }]

        var actual = simpleFilt.checkIf(checkArgs);

        expect(actual).toBe(true);
      })

      it("expect not to throw Error if 'boolSpecifier' property is present in the first checkArg", function () {
        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "boolSpecifier": "and", "prop": obj.age, "values": [18] }, { "boolSpecifier": "and", "prop": obj.name, "values": ["foo"] }]

        expect(function () { simpleFilt.checkIf(checkArgs) }).not.toThrowError();

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("should ignore 'boolSpecifier' property found in the first checkArg (single checkArg)", function () {
        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "boolSpecifier": "and", "prop": obj.age, "values": [18] }]

        expect(function () { simpleFilt.checkIf(checkArgs) }).not.toThrowError();

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("should ignore 'boolSpecifier' property found in the first checkArg (multiple checkArgs)", function () {
        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "boolSpecifier": "and", "prop": obj.age, "values": [1] }, { "boolSpecifier": "or", "prop": obj.name, "values": ["foo"] }]

        expect(function () { simpleFilt.checkIf(checkArgs) }).not.toThrowError();

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("expect Error to be thrown when provided 'boolSpecifier' is incorrect", function () {
        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "andd", "prop": obj.age, "values": [18] }]

        expect(function () { simpleFilt.checkIf(checkArgs) }).toThrowError(Error, "'boolSpecifier' property missing or is incorrect. Accepted boolSpecifier values: or, and.");
      });

      it("expect Error to be thrown when provided 'boolSpecifier' is empty", function () {
        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "", "prop": obj.age, "values": [18] }]

        expect(function () { simpleFilt.checkIf(checkArgs) }).toThrowError(Error, "'boolSpecifier' property missing or is incorrect. Accepted boolSpecifier values: or, and.");
      });

      it("expect Error to be thrown when 'boolSpecifier' property is missing", function () {
        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "prop": obj.age, "values": [18] }]

        expect(function () { simpleFilt.checkIf(checkArgs) }).toThrowError(Error, "'boolSpecifier' property missing or is incorrect. Accepted boolSpecifier values: or, and.");
      });

      it("expect TypeError to be thrown when 'predicate' property is not a function (predicate is passed as null)", function () {
        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "prop": obj.age, "predicate": null }]

        expect(function () { simpleFilt.checkIf(checkArgs) }).toThrowError(TypeError, "Provided predicate parameter is not a function.");
      });

      it("expect TypeError to be thrown when 'predicate' property is not a function (predicate is passed as new func())", function () {
        var func = function () {
          return true;
        }

        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "prop": obj.age, "predicate": new func() }]

        expect(function () { simpleFilt.checkIf(checkArgs) }).toThrowError(TypeError, "Provided predicate parameter is not a function.");
      });

      it("expect TypeError to be thrown when provided 'values' property is not an array", function () {
        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "and", "prop": obj.age, "values": 18 }]

        expect(function () { simpleFilt.checkIf(checkArgs) }).toThrowError(TypeError, "Provided 'values' property is not an Array.");
      });

      it("expect Error to be thrown when both 'values' and 'predicate' properties are missing", function () {
        var obj = { "name": "foo" };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] }, { "prop": obj.name }]

        expect(function () { simpleFilt.checkIf(checkArgs) }).toThrowError(Error, "Missing both 'values' and 'predictate' properties. At least one of them must be present to perform proper checks.");
      });

      it("expect not to throw Error when 'values' property is missing while 'predicate' property is present", function () {
        var obj = { "name": "foo" };
        var predicate = function (prop) {
          if (prop === 'foo') {
            return true;
          } else {
            return false;
          }
        }
        var checkArgs = [{ "prop": obj.name, "predicate": predicate }];

        expect(function () { simpleFilt.checkIf(checkArgs) }).not.toThrowError();
      });

      it("expect not to throw Error when 'predicate' property is missing while 'values' property is present", function () {
        var obj = { "name": "foo" };

        var checkArgs = [{ "prop": obj.name, "values": ["foo"] }]
        expect(function () { simpleFilt.checkIf(checkArgs) }).not.toThrowError();
      });

      it("expect to throw Error when 'prop' property is missing", function () {
        var obj = { "name": "foo" };

        var checkArgs = [{ "values": ["foo"] }]
        expect(function () { simpleFilt.checkIf(checkArgs) }).toThrowError(Error, "Missing 'prop' property.");
      });
    });

    describe("testing boolean logic", function () {
      it("returns true when: true and true", function () {
        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] }, { "boolSpecifier": "and", "prop": obj.age, "values": [18] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns false when: false and false", function () {
        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] }, { "boolSpecifier": "and", "prop": obj.age, "values": [17] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns false when: true and false", function () {
        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] }, { "boolSpecifier": "and", "prop": obj.age, "values": [17] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns false when: false and true", function () {
        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] }, { "boolSpecifier": "and", "prop": obj.age, "values": [18] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns true when: true or true", function () {
        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] }, { "boolSpecifier": "or", "prop": obj.age, "values": [18] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns true when: false or true", function () {
        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] }, { "boolSpecifier": "or", "prop": obj.age, "values": [18] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns true when: true or false", function () {
        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] }, { "boolSpecifier": "or", "prop": obj.age, "values": [17] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns false when: false or false", function () {
        var obj = { "name": "foo", "age": 18 };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] }, { "boolSpecifier": "or", "prop": obj.age, "values": [17] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns true when: true and true and true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns false when: false and true and true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns false when: true and false and true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [17] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns false when: false and false and true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [17] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns false when: false and false and false", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [17] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns false when: true and false and false", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [17] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns false when: false and true and false", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns false when: true and true and false", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns false when: false and true and true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns true when: true or true or true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns true when: false or true or true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns true when: true or false or true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [17] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns true when: false or false or true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [17] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns false when: false or false or false", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [17] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns true when: true or false or false", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [17] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns true when: false or true or false", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns true when: true or true or false", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns true when: false or true or true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns true when: true and true or true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns true when: false and true or true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns true when: true and false or true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [17] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns true when: false and false or true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [17] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns false when: false and false or false", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [17] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns false when: true and false or false", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [17] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns false when: false and true or false", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns true when: true and true or false", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns true when: false and true or true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "and", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "or", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns true when: true or true and true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns true when: false or true and true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns true when: true or false and true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [17] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });

      it("returns false when: false or false and true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [17] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns false when: false or false and false", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [17] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns false when: true or false and false", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [17] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns false when: false or true and false", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns false when: true or true and false", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [false] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(false);
      });

      it("returns true when: false or true and true", function () {
        var obj = { "name": "foo", "age": 18, "isCool": true };
        var checkArgs = [{ "prop": obj.name, "values": ["foo123"] },
					{ "boolSpecifier": "or", "prop": obj.age, "values": [18] },
					{ "boolSpecifier": "and", "prop": obj.isCool, "values": [true] }]

        var actual = simpleFilt.checkIf(checkArgs);
        expect(actual).toBe(true);
      });
    });
  });

  describe("method filterBy(inputArray, checkArgsFunc, argsArr)", function () {
    it("first test", function () {
      var inputArr = [1, 1, 3, 6, 8, 8, 9, 3, 1, 4, 2];
      var checkArgsFunc = function (valueFromInputArr, otherValue) {
        return [{ "prop": valueFromInputArr, "values": [1, 3] }, { "boolSpecifier": 'and', "prop": otherValue, "values": [8] }];
      }

      var argsArr = [{}];

      var actual = simpleFilt.filterBy(inputArr, checkArgsFunc, argsArr);

      expect(actual).toEqual([1, 1, 3, 8, 8, 3, 1]);
    });
  });
});