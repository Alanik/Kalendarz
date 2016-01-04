/// <reference path="../../../JSUtils/SimpleFilt.js" />

describe("SimpleFilt.js", function () {
    var simpleFilt = SIMPLE_FILT();

    describe("method checkByPropertyAndOrPredicate(checkArgs)", function () {

    	describe("testing checkArg's prop against values", function ()
    	{
    		it( "returns true when value matches property (single check argument, shallow object property, single value)", function ()
    		{
    			var obj = { "name": "foo" };
    			var checkArgs = [{ "prop": obj.name, "values": ["foo"] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );

    		} );

    		it( "returns false when value does not match property (single check argument, shallow object property, single value)", function ()
    		{
    			var obj = { "name": "bar" };
    			var checkArgs = [{ "prop": obj.name, "values": ["foo"] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( false );
    		} );

    		it( "returns true when value matches property (single check argument, nested object property, single value)", function ()
    		{
    			var obj = {
    				"foo": {
    					"foo": {
    						"bar": "foo"
    					}

    				}
    			};
    			var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["foo"] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );
    		} );

    		it( "returns false when value does not match property (single check argument, nested object property, single value)", function ()
    		{
    			var obj = {
    				"foo": {
    					"foo": {
    						"bar": "foo"
    					}

    				}
    			};
    			var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["buzz"] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( false );
    		} );


    		it( "returns true when at least one value matches property (single check argument, shallow object property, multiple values)", function ()
    		{

    			var obj = { "name": "foo" };
    			var checkArgs = [{ "prop": obj.name, "values": ["bar", "foo"] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );

    		} );

    		it( "returns false when no value matches property (single check argument, shallow object property, multiple values)", function ()
    		{
    			var obj = { "name": "bar" };
    			var checkArgs = [{ "prop": obj.name, "values": ["foo", "buzz"] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( false );
    		} );

    		it( "returns true when value matches property (single check argument, nested object property, multiple values)", function ()
    		{
    			var obj = {
    				"foo": {
    					"foo": {
    						"bar": "foo"
    					}

    				}
    			};
    			var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["foo", "buzz"] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );
    		} );

    		it( "returns false when no value matches property (single check argument, nested object property, multiple values)", function ()
    		{
    			var obj = {
    				"foo": {
    					"foo": {
    						"bar": "foo"
    					}

    				}
    			};
    			var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["buzz", "bar"] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( false );
    		} );


            it( "returns true when value of all checkArgs matches property (multiple check arguments with 'and' as boolSpecifier, shallow property, single value)", function ()
            {
            	var obj = { "name": "foo", "age": 18 };

            	var checkArgs = [{ "prop": obj.name, "values": ["foo"] }, { "boolSpecifier": "and", "prop": obj.age, "values": [18] }]

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( true );
            } );

            it( "returns false when value of first checkArg does not match property (multiple check arguments with 'and' as boolSpecifier, shallow property, single value)", function ()
            {
            	var obj = { "name": "foo", "age": 18 };

            	var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "and", "prop": obj.age, "values": [18] }]

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( false );
            } );

            it( "returns false when value of other checkArgs does not match property (multiple check arguments with 'and' as boolSpecifier, shallow property, single value)", function ()
            {
            	var obj = { "name": "foo", "age": 18 };

            	var checkArgs = [{ "prop": obj.name, "values": ["foo"] }, { "boolSpecifier": "and", "prop": obj.age, "values": [1] }]

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( false );
            } );

            it( "returns false when no value of all checkArgs matches property' value does not match property (multiple check arguments with 'and' as boolSpecifier, shallow property, single value)", function ()
            {
            	var obj = { "name": "foo", "age": 18 };

            	var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "and", "prop": obj.age, "values": [1] }]

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( false );
            } );


            it( "returns true when value of all checkArgs matches property (multiple check arguments with 'or' as boolSpecifier, shallow object property, single value)", function ()
            {
            	var obj = { "name": "foo", "age": 18 };

            	var checkArgs = [{ "prop": obj.name, "values": ["foo"] }, { "boolSpecifier": "or", "prop": obj.age, "values": [18] }]

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( true );
            } );

            it( "returns true when value of first checkArg matches property (multiple check arguments with 'or' as boolSpecifier, shallow object property, single value)", function ()
            {
            	var obj = { "name": "foo", "age": 18 };

            	var checkArgs = [{ "prop": obj.name, "values": ["foo"] }, { "boolSpecifier": "or", "prop": obj.age, "values": [1] }]

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( true );
            } );

            it( "returns true when value of other checkArg matches property (multiple check arguments with 'or' as boolSpecifier, shallow object property, single value)", function ()
            {
            	var obj = { "name": "foo", "age": 18 };

            	var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "or", "prop": obj.age, "values": [18] }]

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( true );
            } );

            it( "returns false when no value of all checkArgs matches property (multiple check arguments with 'or' as boolSpecifier, shallow object property, single value)", function ()
            {
            	var obj = { "name": "foo", "age": 18 };

            	var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "or", "prop": obj.age, "values": [1] }]

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( false );
            } );


            it( "returns true when value of all checkArgs matches property (multiple check arguments with 'and' as boolSpecifier, nested object property, single value)", function () {
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
            } );

            it( "returns false when value of first checkArg does not match property (multiple check arguments with 'and' as boolSpecifier, nested object property, single value)", function ()
            {
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

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( false );
            } );

            it( "returns false when value of other checkArgs does not match property (multiple check arguments with 'and' as boolSpecifier, nested object property, single value)", function ()
            {
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

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( false );
            } );

            it( "returns false when no value of all checkArgs matches property' value does not match property (multiple check arguments with 'and' as boolSpecifier, nested object property, single value)", function ()
            {
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

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( false );
            } );


            it( "returns true when value of all checkArgs matches property (multiple check arguments with 'or' as boolSpecifier, nested object property, single value)", function ()
            {
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

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( true );
            } );

            it( "returns true when value of first checkArg matches property (multiple check arguments with 'or' as boolSpecifier, nested object property, single value)", function ()
            {
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

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( true );
            } );

            it( "returns true when value of other checkArg matches property (multiple check arguments with 'or' as boolSpecifier, nested object property, single value)", function ()
            {
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

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( true );
            } );

            it( "returns false when no value of all checkArgs matches property (multiple check arguments with 'or' as boolSpecifier, nested object property, single value)", function ()
            {
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

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( false );
            } );


            it( "returns true when at least one value of all checkArgs matches property (multiple check arguments with 'and' as boolSpecifier, nested object property, multiple values)", function ()
            {
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
            	var checkArgs = [{ "prop": obj.foo.foo.bar, "values": ["bar","foo"] }, { "boolSpecifier": "and", "prop": obj.buzz.bar.foo.bar, "values": ["buzz", "bar"] }]

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( true );
            } );

            it( "returns false when value of first checkArg does not match property (multiple check arguments with 'and' as boolSpecifier, nested object property, multiple values)", function ()
            {
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

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( false );
            } );

            it( "returns false when value of other checkArg does not match property (multiple check arguments with 'and' as boolSpecifier, nested object property, multiple values)", function ()
            {
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

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( false );
            } );

            it( "returns false when no value of all checkArgs matches property (multiple check arguments with 'and' as boolSpecifier, nested object property, multiple values)", function ()
            {
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

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( false );
            } );


            it( "returns true when at least one value of first checkArg match its corresponding object property (multiple check arguments with 'or' as boolSpecifier, nested object property, multiple values)", function ()
            {
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

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( true );
            } );

            it( "returns true when at least one value of other checkArg matches property (multiple check arguments with 'or' as boolSpecifier, nested object property, multiple values)", function ()
            {
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

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( true );
            } );

            it( "returns true when at least one value of all checkArgs matches property (multiple check arguments with 'or' as boolSpecifier, nested object property, multiple values)", function ()
            {
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

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( true );
            } );

            it( "returns false when no value of all checkArgs matches property (multiple check arguments with 'or' as boolSpecifier, nested object property, multiple values)", function ()
            {
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

            	var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

            	expect( actual ).toBe( false );
            } );

    	} );

    	describe( "validation + exceptions", function (){

    		xit( "different types of values shouldn't affect functionality when at least one value matches property (with NaN)", function (){
    			var obj = { "name": "foo" };
    			var checkArgs = [{ "prop": obj.name, "values": [0, -1, 1, true, false, undefined, null, NAN, "", " ", "buzz", "foo"] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );
    		} )

    		it( "different types of values shouldn't affect functionality when at least one value matches property (without NaN)", function ()
    		{
    			var obj = { "name": "foo" };
    			var checkArgs = [{ "prop": obj.name, "values": [0, -1, 1, true, false, undefined, null, "", " ", "buzz", "foo"] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );
    		} )

    		xit( "different types of values shouldn't affect functionality when no value matches property (with NaN)", function ()
    		{
    			var obj = { "name": "foo" };
    			var checkArgs = [{ "prop": obj.name, "values": [0, -1, 1, true, false, undefined, null, NAN, "", " ", "buzz"] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( false );
    		} )

    		it( "different types of values shouldn't affect functionality when no value matches property (without NaN)", function ()
    		{
    			var obj = { "name": "foo" };
    			var checkArgs = [{ "prop": obj.name, "values": [0, -1, 1, true, false, undefined, null, "", " ", "buzz"] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( false );
    		} )

    		it( "same types of values shouldn't affect functionality when all values match property", function ()
    		{
    			var obj = { "age": 18 };
    			var checkArgs = [{ "prop": obj.age, "values": [18, 18, 18] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );
    		} )

    		it( "works when property's value is undefined", function ()
    		{
    			var obj = { "name": undefined };
    			var checkArgs = [{ "prop": obj.name, "values": [undefined] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );
    		} )

    		it( "works when property's value is null", function ()
    		{
    			var obj = { "name": null };
    			var checkArgs = [{ "prop": obj.name, "values": [null] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );
    		} )

    		xit( "works when property's value is NaN", function ()
    		{
    			var obj = { "age": NaN };
    			var checkArgs = [{ "prop": obj.age, "values": [NaN] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );
    		} )

    		it( "works when property's value is empty string", function ()
    		{
    			var obj = { "name": "" };
    			var checkArgs = [{ "prop": obj.name, "values": [""] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );
    		} )

    		it( "works when property's value is a string", function ()
    		{
    			var obj = { "name": "john" };
    			var checkArgs = [{ "prop": obj.name, "values": ["john"] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );
    		} )

    		it( "works when property's value is a number", function ()
    		{
    			var obj = { "age": 18 };
    			var checkArgs = [{ "prop": obj.age, "values": [18] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );
    		} )

    		it( "works when property's value is true", function ()
    		{
    			var obj = { "age": true };
    			var checkArgs = [{ "prop": obj.age, "values": [true] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );
    		} )

    		it( "works when property's value is false", function ()
    		{
    			var obj = { "age": false };
    			var checkArgs = [{ "prop": obj.age, "values": [false] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );
    		} )

    		it( "does not use hidden type conversion when comparing (0 -> false)", function ()
    		{
    			var obj = { "age": 0 };
    			var checkArgs = [{ "prop": obj.age, "values": [false] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );
    			expect( actual ).toBe( false );
    		} )

    		it( "does not use hidden type conversion when comparing (1 -> true)", function ()
    		{
    			var obj = { "age": 1 };
    			var checkArgs = [{ "prop": obj.age, "values": [true] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( false );
    		} )

    		it( "does not use hidden type conversion when comparing (null -> false)", function ()
    		{
    			var obj = { "age": null };
    			var checkArgs = [{ "prop": obj.age, "values": [false] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( false );
    		} )

    		it( "does not use hidden type conversion when comparing (undefined -> false)", function ()
    		{
    			var obj = { "age": undefined };
    			var checkArgs = [{ "prop": obj.age, "values": [false] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( false );
    		} )

    		it( "return false for arrays with same elements but different reference", function ()
    		{
    			var obj = { "numbers": [1, 1, 1] };
    			var checkArgs = [{ "prop": obj.numbers, "values": [[1, 1, 1]] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( false );
    		} )

    		it( "return true for arrays with same reference", function ()
    		{
    			var obj = { "numbers": [1, 2, 3] };
    			var checkArgs = [{ "prop": obj.numbers, "values": [obj.numbers] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );
    		} )

    		it( "return false for same objects but different reference", function ()
    		{
    			var obj = { "person": { "name" : "john", "age" : 18 } };
    			var checkArgs = [{ "prop": obj.person, "values": [{ "name" : "john", "age" : 18 }] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( false );
    		} )

    		it( "return true for objects with same reference", function ()
    		{
    			var obj = { "person": { "name": "john", "age": 18 } };
    			var checkArgs = [{ "prop": obj.person, "values": [obj.person] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );
    		} )

    		it( "return false for parents with different reference having nested objects with same reference ", function ()
    		{
    			var obj = { "person": { "name": { "firstname" : "john", "lastname" : "smith"}, "age": 18 } };
    			var checkArgs = [{ "prop": obj.person, "values": [{ "name": obj.person.name, "age": obj.age }] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( false );
    		} )

    		it( "return true for nested objects with same reference", function ()
    		{
    			var obj = { "person": { "name": { "firstname": "john", "lastname": "smith" }, "age": 18 } };
    			var checkArgs = [{ "prop": obj.person.name, "values": [obj.person.name] }]

    			var actual = simpleFilt.checkByPropertyAndOrPredicate( checkArgs );

    			expect( actual ).toBe( true );
    		} )

    		it( "expect Error to be thrown when provided boolSpecifier is incorrect", function ()
    		{
    			var obj = { "name": "foo", "age": 18 };
    			var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "andd", "prop": obj.age, "values": [18] }]

    			expect( function () { simpleFilt.checkByPropertyAndOrPredicate( checkArgs ) } ).toThrowError( Error, "'boolSpecifier' property missing or is incorrect. Accepted boolSpecifier values: 'or', 'and' " );
    		} );

    		it( "expect Error to be thrown when provided boolSpecifier is empty", function ()
    		{
    			var obj = { "name": "foo", "age": 18 };
    			var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "", "prop": obj.age, "values": [18] }]

    			expect( function () { simpleFilt.checkByPropertyAndOrPredicate( checkArgs ) } ).toThrowError( Error, "'boolSpecifier' property missing or is incorrect. Accepted boolSpecifier values: 'or', 'and' " );
    		} );

    		it( "expect Error to be thrown when provided boolSpecifier is missing", function ()
    		{
    			var obj = { "name": "foo", "age": 18 };
    			var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "prop": obj.age, "values": [18] }]

    			expect( function () { simpleFilt.checkByPropertyAndOrPredicate( checkArgs ) } ).toThrowError( Error, "'boolSpecifier' property missing or is incorrect. Accepted boolSpecifier values: 'or', 'and' " );
    		} );

    		it( "expect TypeError to be thrown when provided values property is not an array", function ()
    		{
    			var obj = { "name": "foo", "age": 18 };
    			var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "and", "prop": obj.age, "values": 18 }]

    			expect( function () { simpleFilt.checkByPropertyAndOrPredicate( checkArgs ) } ).toThrowError( TypeError, "Provided 'values' property is not an Array." );
    		} );

    		it( "expect Error to be thrown when values property is missing", function ()
    		{
    			var obj = { "name": "foo", "age": 18 };
    			var checkArgs = [{ "prop": obj.name, "values": ["bar"] }, { "boolSpecifier": "and", "prop": obj.age }]

    			expect( function () { simpleFilt.checkByPropertyAndOrPredicate( checkArgs ) } ).toThrowError( Error, "'values' array property is missing." );
    		} );

    	});
    });

    describe("method checkByPropertyAndOrPredicate(inputArray, checkArgsFunc, argsArr)", function () {

    });
});