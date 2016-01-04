var SIMPLE_FILT = function () {
    return {
        // checkArgs = [{ "prop": actualObj.kind.value, "values": [1,2] },
        //              { "boolSpecifier" : 'and', "prop": actualObj.addedBy, "values": [appViewModel.userName] },
        //              { "boolSpecifier" : 'or', "prop": actualObj.startDate, "predicate": predicateFunction }]
        checkByPropertyAndOrPredicate: function (checkArgs) {
            var currentArg, finalResult = false, localResult = false;
            for (var i = 0; i < checkArgs.length; i++) {
                currentArg = checkArgs[i];

                localResult = passesCheckByValues(currentArg) && passesCheckByPredicate(currentArg);

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
                            throw new Error("Incorrect input value. Accepted input values: 'or', 'and' ");
                    }
                }
            }
            return finalResult;

            function passesCheckByValues(argObject) {
                if (!argObject.values) {
                    return true;
                } else if (Object.prototype.toString.call(argObject.values) !== '[object Array]') {
                    throw new TypeError("Supplied 'values' property is not an Array.");
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
                    throw new TypeError("Supplied predicate parameter is not a function.");
                }
                else {
                    result = argObject.predicate(argObject.prop);

                    if (typeof result === "boolean") {
                        return result;
                    }
                    else {
                        throw new TypeError("Returned type from supplied predicate function is not a primitive boolean value such as 'true' or 'false'. ");
                    }
                }
            }
        },
        // inputArray = an array
        //
        // checkArgsFunc = function (actualObj, username) {
        // return  [{ "prop": actualObj.kind.value, "values": valueArr }, { "boolSpecifier": 'and', "prop": actualObj.addedBy, "values": [username] }]    
        // } 
        //
        // argsArr = [{ "name" : "foo" }, "AdminAlanik" ]
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