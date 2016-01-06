var SIMPLE_FILT = function () {
    "use strict";

    return {

        /// description: Checks if element passes provided check conditions. 

        /// input params:
        ///
        /// 1. checkArgs - An array of checkArg objects. 
        /// example - [{ "prop": someObject.someProperty.value, "values": [1,2] },
    	///            { "boolSpecifier" : 'and', "prop": someObject.addedBy, "values": [appViewModel.userName] },
    	///            { "boolSpecifier" : 'or', "prop": someObject.startDate, "predicate": predicateFunction }]

        /// returns true or false
        checkIf: function (checkArgs) {
            var currentArg, finalResult = false, localResult = false, hasValuesProp = false, hasPredicateProp = false;

            for (var i = 0; i < checkArgs.length; i++) {
                currentArg = checkArgs[i];
                validateCheckArg(currentArg);
                localResult = (hasValuesProp ? passesCheckByValues(currentArg) : true) && (hasPredicateProp ? passesCheckByPredicate(currentArg) : true);

                if (i < 1) {
                    finalResult = localResult;
                } else {
                    switch (currentArg.boolSpecifier) {
                        case 'or':
                            finalResult = finalResult || localResult;
                            break;
                        case 'and':
                            finalResult = finalResult && localResult;
                            break;
                        default:
                            throw new Error("'boolSpecifier' property missing or is incorrect. Accepted boolSpecifier values: or, and.");
                    }
                }
            }

            return finalResult;

            function validateCheckArg(checkArg) {
                if (!checkArg.hasOwnProperty("prop")) {
                    throw new Error("Missing 'prop' property.");
                }

                hasValuesProp = checkArg.hasOwnProperty("values");
                hasPredicateProp = checkArg.hasOwnProperty("predicate");

                if (!hasValuesProp && !hasPredicateProp) {
                    throw new Error("Missing both 'values' and 'predictate' properties. At least one of them must be present to perform proper checks.");
                }

                if (hasValuesProp && Object.prototype.toString.call(checkArg.values) !== '[object Array]') {
                    throw new TypeError("Provided 'values' property is not an Array.");
                }

                if (hasPredicateProp && Object.prototype.toString.call(checkArg.predicate) !== '[object Function]') {
                    throw new TypeError("Provided predicate parameter is not a function.");
                }
            };
            function passesCheckByValues(checkArg) {
                for (var i = 0; i < checkArg.values.length; i++) {
                    if (checkArg.prop === checkArg.values[i]) {
                        return true;
                    }
                }
                return false;
            };
            function passesCheckByPredicate( checkArg )
            {
            	var result = checkArg.predicate( checkArg.prop );
                if (typeof result === "boolean") {
                    return result;
                }
                else {
                    throw new TypeError("Returned type from provided predicate function is not a primitive boolean value such as true or false.");
                }
            };
        },

        /// description: Filters array elements by provided check conditions.

        /// input params:
        ///
        /// 1. inputArray - An array from which to filter out elements.
        /// example - ["foo", "buzz", 1, null, {"name" : "john"}]
        ///
        /// 2. checkArgsFunc - Anonymous function that returns an array of checkArgs objects. Function's arguments are passed to the checkArgs to be checked against provided values/predicate function.
        /// example - function (actualObj, someOtherPassedValue) {
        /// return  [{ "prop": actualObj.kind.value, "values": [1, 2, 3] },
        ///          { "boolSpecifier": 'and', "prop": actualObj.addedBy, "values": [someOtherPassedValue] }] 
        ///          }
        /// 
        /// 3. argsArr - Actual values of arguments passed to checkArgsFunc (look above).
        /// *** Important - First element in the argsArr represents single object/element in the input array. The value of the provided parameter doesn't matter as the actual element/object from the inputArray will 
        ///                 be set behind the scenes as the current element when iterating over the element collection thus recommended value for the first element in the argsArr is an empty object literal - {}. Please note that all other elements in argsArr need to 
        ///                 be provided with the actual values that we want to pass into checkArgsFunc.
        ///                 
        /// example - [{}, "foo"]
        /// Empty literal object '{}' represents actualObj passed to checkArgsFunc and string 'foo' will be used as somePropertyValue - the second parameter passed to checkArgsFunc etc. Same logic applies 
        /// for all additional parameters passed. 

        /// returns new array with elements that fulfilled check conditions
        filterBy: function (inputArray, checkArgsFunc, argsArr) {
            var item, outputArray = [];
            for (var i = 0; i < inputArray.length; i++) {
                item = inputArray[i];
                argsArr[0] = item;
                if (this.checkIf(checkArgsFunc.apply(checkArgsFunc, argsArr))) {
                    outputArray.push(item);
                }
            }
            return outputArray;
        }
    }
}