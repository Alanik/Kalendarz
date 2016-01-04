var SIMPLE_FILT = function () {
    return {
        /// checkArgs = [{ "prop": actualObj.kind.value, "values": [1,2] },
        ///              { "boolSpecifier" : 'and', "prop": actualObj.addedBy, "values": [appViewModel.userName] },
    	///              { "boolSpecifier" : 'or', "prop": actualObj.startDate, "predicate": predicateFunction }]

		/// returns true or faslse
        checkByPropertyAndOrPredicate: function (checkArgs) {
            var currentArg, finalResult = false, localResult = false;
            for (var i = 0; i < checkArgs.length; i++) {
                currentArg = checkArgs[i];

                localResult = passesCheckByValues(currentArg) && passesCheckByPredicate(currentArg);

                if (i < 1) {
                    finalResult = localResult;
                } else
                {
                    switch (currentArg.boolSpecifier) {
                        case 'or':
                            finalResult = finalResult || localResult;
                            break;
                        case 'and':
                            finalResult = finalResult && localResult;
                            break;
                        default:
                            throw new Error("'boolSpecifier' property missing or is incorrect. Accepted boolSpecifier values: 'or', 'and' ");
                    }
                }
            }
            return finalResult;

            function passesCheckByValues(argObject) {
                if (!argObject.values) {
                	throw new Error( "'values' array property is missing." );
                } else if (Object.prototype.toString.call(argObject.values) !== '[object Array]') {
                    throw new TypeError("Provided 'values' property is not an Array.");
                }
                else {
                    for (var i = 0; i < argObject.values.length; i++) {
                        if (argObject.prop === argObject.values[i]) {
                            return true;
                        }
                    }
                    return false;
                }
            };
            function passesCheckByPredicate(argObject) {
                var result;
                if (!argObject.predicate) {
                    return true;

                } else if (Object.prototype.toString.call(argObject.predicate) !== '[object Function]') {
                    throw new TypeError("Provided predicate parameter is not a function.");
                }
                else {
                    result = argObject.predicate(argObject.prop);

                    if (typeof result === "boolean") {
                        return result;
                    }
                    else {
                        throw new TypeError("Returned type from provided predicate function is not a primitive boolean value such as 'true' or 'false'. ");
                    }
                }
            }
        },
        /// inputArray = an array from which to filter out elements
        ///
        /// checkArgsFunc = function (actualObj, somePropertyValue) {
    	/// return  [{ "prop": actualObj.kind.value, "values": valueArr }, { "boolSpecifier": 'and', "prop": actualObj.addedBy, "values": [somePropertyValue] }]    
        /// } 
        ///
        /// argsArr = [{}, "foo" ]
        filterByPropertyAndOrPredicate: function (inputArray, checkArgsFunc, argsArr) {
            var item, outputArray = [];
            for (var i = 0; i < inputArray.length; i++) {
                item = inputArray[i];
                argsArr[0] = item;
                if (this.checkByPropertyAndOrPredicate(checkArgsFunc.apply(checkArgsFunc, argsArr))) {
                    outputArray.push(item);
                }
            }
            return outputArray;
        }
    }
}