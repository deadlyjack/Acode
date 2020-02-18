import androidFileSystem from "./utils/internalFs";

var PHP = function (code, opts) {
    var opts = opts || {};
    opts.filesystem = opts.filesystem || typeof (window) !== "undefined" ? new PHP.Adapters.XHRFileSystem() : androidFileSystem;
    opts.SERVER = opts.SERVER || {};
    opts.SERVER.SCRIPT_FILENAME = opts.SERVER.SCRIPT_FILENAME || "";
    // if (opts.path) PHP.PATH = opts.path.slice(-1) === '/' ? opts.path.slice(0, -1) : opts.path;
    if (opts.path) PHP.PATH = opts.path;
    else PHP.PATH = '';

    var iniContent = opts.filesystem.readFileSync("cfg/php.ini"),
        iniSet = opts.ini || {};
    opts.ini = PHP.ini(iniContent);

    Object.keys(iniSet).forEach(function (key) {
        this[key] = iniSet[key];
    }, opts.ini);

    this.tokens = PHP.Lexer(code, opts.ini);
    try {
        this.AST = new PHP.Parser(this.tokens);
    } catch (e) {
        this.vm = {};
        this.vm.OUTPUT_BUFFER = "Parse error: " + e.message + " in " + opts.SERVER.SCRIPT_FILENAME + " on line " + e.line;
        return this;
    }


    var POST = opts.POST,
        RAW_POST = opts.RAW_POST,
        RAW = (RAW_POST !== undefined) ? PHP.RAWPost(RAW_POST) : {};

    opts.POST = (POST !== undefined) ? PHP.Utils.QueryString(POST) : (RAW_POST !== undefined) ? RAW.Post() : {};
    opts.RAW_POST = (RAW_POST !== undefined) ? RAW.Raw() : (POST !== undefined) ? POST.trim() : "";
    opts.GET = (opts.GET !== undefined) ? PHP.Utils.QueryString(opts.GET) : {};

    opts.FILES = (RAW_POST !== undefined) ? RAW.Files(opts.ini.upload_max_filesize, opts.ini.max_file_uploads, opts.ini.upload_tmp_dir) : {};

    // needs to be called after RAW.Files
    if (RAW_POST !== undefined) {
        RAW.WriteFiles(opts.filesystem.writeFileSync);
    }



    this.compiler = new PHP.Compiler(this.AST, opts.SERVER.SCRIPT_FILENAME);

    this.vm = new PHP.VM(this.compiler.src, opts);

    if (RAW_POST !== undefined) {
        RAW.Error(this.vm[PHP.Compiler.prototype.ERROR].bind(this.vm), opts.SERVER.SCRIPT_FILENAME);
    }

    this.vm.Run();
};

PHP.Constants = {};

PHP.Modules = function () {
    this.OUTPUT_BUFFER = "";
};

PHP.Adapters = {};

PHP.Utils = {};


PHP.Utils.$A = function (arr) {
    return Array.prototype.slice.call(arr);
};

PHP.Utils.ClassName = function (classVar) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;
    if (classVar instanceof PHP.VM.Variable) {
        if (classVar[VARIABLE.TYPE] === VARIABLE.STRING) {
            return classVar[COMPILER.VARIABLE_VALUE];
        } else {
            return classVar[COMPILER.VARIABLE_VALUE][COMPILER.CLASS_NAME];
        }
    }

};

PHP.Utils.Merge = function (obj1, obj2) {

    Object.keys(obj2).forEach(function (key) {
        obj1[key] = obj2[key];
    });

    return obj1;
};

PHP.Utils.Path = function (path) {

    path = path.substring(0, path.lastIndexOf("/"));

    return path;
};

PHP.Utils.Visible = function (name, objectValue, ctx) {

    // helper function for checking whether variable/method is of type
    function checkType(name, type) {
        var value = objectValue[PROPERTY_TYPE + name];
        if (value === undefined) {
            return true;
        }

        if (type === "PUBLIC") {
            return ((value & PHP.VM.Class[type]) === PHP.VM.Class[type]) || (value === PHP.VM.Class.STATIC);
        } else {
            return ((value & PHP.VM.Class[type]) === PHP.VM.Class[type]);
        }

    }

    function hasProperty(proto, prop) {
        while (proto !== undefined && proto[PHP.VM.Class.PROPERTY + prop] !== undefined) {
            proto = Object.getPrototypeOf(proto);
        }

        return proto;

    }

    var COMPILER = PHP.Compiler.prototype,
        PROPERTY_TYPE = PHP.VM.Class.PROPERTY_TYPE,
        VARIABLE = PHP.VM.Variable.prototype;

    if ((ctx instanceof PHP.VM.ClassPrototype) && objectValue[COMPILER.CLASS_NAME] === ctx[COMPILER.CLASS_NAME]) {
        return true;
    } else {

        if ((ctx instanceof PHP.VM.ClassPrototype) && this.$Class.Inherits(objectValue, ctx[COMPILER.CLASS_NAME]) && checkType(name, "PROTECTED")) {

            return true;
        } else if ((ctx instanceof PHP.VM.ClassPrototype) && this.$Class.Inherits(objectValue, ctx[COMPILER.CLASS_NAME]) && checkType(name, "PRIVATE")) {

            if (hasProperty(ctx, name) === ctx) {
                return true;
            }


        } else if (checkType(name, "PUBLIC")) {

            return true;
        }
    }

    return false;

};

PHP.Utils.ArgumentHandler = function (ENV, arg, argObject, value, index, functionName) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;

    if (argObject[COMPILER.PARAM_BYREF] === true) {

        // check that we aren't passing a constant for arg which is defined byRef
        if (ENV.FUNCTION_REFS[functionName] !== true && (value[VARIABLE.CLASS_CONSTANT] === true || value[VARIABLE.CONSTANT] === true || value[COMPILER.NAV] === true)) {
            ENV[PHP.Compiler.prototype.ERROR]("Only variables can be passed by reference", PHP.Constants.E_ERROR, true);
        }


        // check that we aren't passing a function return value
        if (value[VARIABLE.VARIABLE_TYPE] === VARIABLE.FUNCTION) {
            ENV[PHP.Compiler.prototype.ERROR]("Only variables should be passed by reference", PHP.Constants.E_STRICT, true);
            value[VARIABLE.VARIABLE_TYPE] = undefined;
            value = new PHP.VM.Variable(value[COMPILER.VARIABLE_VALUE]);

        }

        if (value[VARIABLE.DEFINED] !== true) {
            // trigger setter
            value[COMPILER.VARIABLE_VALUE] = null;
        }

        arg[VARIABLE.REF](value);
    } else {

        if (value !== undefined) {

            if (value instanceof PHP.VM.VariableProto) {

                if (value[VARIABLE.TYPE] === VARIABLE.ARRAY) {
                    // Array assignment always involves value copying. Use the reference operator to copy an array by reference.
                    arg[COMPILER.VARIABLE_VALUE] = value[COMPILER.METHOD_CALL]({}, COMPILER.ARRAY_CLONE);

                } else {
                    arg[COMPILER.VARIABLE_VALUE] = value[COMPILER.VARIABLE_VALUE];
                }
            } else {
                arg[COMPILER.VARIABLE_VALUE] = value;
            }


        } else {
            if (argObject[COMPILER.PROPERTY_DEFAULT] !== undefined) {
                arg[COMPILER.VARIABLE_VALUE] = argObject[COMPILER.PROPERTY_DEFAULT][COMPILER.VARIABLE_VALUE];
            } else {
                arg[COMPILER.VARIABLE_VALUE] = (new PHP.VM.Variable())[COMPILER.VARIABLE_VALUE];
            }
        }
    }



    if (argObject[COMPILER.PROPERTY_TYPE] !== undefined) {
        ENV[COMPILER.TYPE_CHECK](arg, argObject[COMPILER.PROPERTY_TYPE], argObject[COMPILER.PROPERTY_DEFAULT], index, functionName);
    }
};

PHP.Utils.StaticHandler = function (staticHandler, staticVars, handler, $Global) {

    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;

    staticHandler[COMPILER.FUNCTION_STATIC_SET] = function (name, def) {

        if (staticVars[name] === undefined) {
            // store it to storage for this variable
            staticVars[name] = {
                def: def[COMPILER.VARIABLE_VALUE],
                val: def
            };

            // assign it to current running context as well
            handler(name, def);

        } else {
            if (def[COMPILER.VARIABLE_VALUE] === staticVars[name].def) {
                handler(name, staticVars[name].val);
            } else {
                staticVars[name] = {
                    def: def[COMPILER.VARIABLE_VALUE],
                    val: def
                };
                handler(name, def);
            }
        }


        return staticHandler;


    };


    // global handler
    staticHandler[COMPILER.FUNCTION_GLOBAL] = function (vars) {
        vars.forEach(function (varName) {
            var val = $Global(varName);
            val[VARIABLE.DEFINED] = true;
            handler(varName, val);
        });
    };

    return staticHandler;

};

PHP.Utils.CheckRef = function (ret, byRef) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;

    if (ret instanceof PHP.VM.Variable) {
        if (byRef !== true) {

            ret[VARIABLE.VARIABLE_TYPE] = VARIABLE.FUNCTION;
        } else if (byRef === true) {

            if (ret[VARIABLE.REFERRING] === undefined && (ret[VARIABLE.VARIABLE_TYPE] === VARIABLE.NEW_VARIABLE || ret[VARIABLE.VARIABLE_TYPE] === VARIABLE.FUNCTION)) {

                this[PHP.Compiler.prototype.ERROR]("Only variable references should be returned by reference", PHP.Constants.E_NOTICE, true);
            }
            ret[VARIABLE.VARIABLE_TYPE] = undefined;
        }
    }

};


PHP.Utils.TokenName = function (token) {
    var constants = ["T_INCLUDE", "T_INCLUDE_ONCE", "T_EVAL", "T_REQUIRE", "T_REQUIRE_ONCE", "T_LOGICAL_OR", "T_LOGICAL_XOR", "T_LOGICAL_AND", "T_PRINT", "T_PLUS_EQUAL", "T_MINUS_EQUAL", "T_MUL_EQUAL", "T_DIV_EQUAL", "T_CONCAT_EQUAL", "T_MOD_EQUAL", "T_AND_EQUAL", "T_OR_EQUAL", "T_XOR_EQUAL", "T_SL_EQUAL", "T_SR_EQUAL", "T_BOOLEAN_OR", "T_BOOLEAN_AND", "T_IS_EQUAL", "T_IS_NOT_EQUAL", "T_IS_IDENTICAL", "T_IS_NOT_IDENTICAL", "T_IS_SMALLER_OR_EQUAL", "T_IS_GREATER_OR_EQUAL", "T_SL", "T_SR", "T_INSTANCEOF", "T_INC", "T_DEC", "T_INT_CAST", "T_DOUBLE_CAST", "T_STRING_CAST", "T_ARRAY_CAST", "T_OBJECT_CAST", "T_BOOL_CAST", "T_UNSET_CAST", "T_NEW", "T_CLONE", "T_EXIT", "T_IF", "T_ELSEIF", "T_ELSE", "T_ENDIF", "T_LNUMBER", "T_DNUMBER", "T_STRING", "T_STRING_VARNAME", "T_VARIABLE", "T_NUM_STRING", "T_INLINE_HTML", "T_CHARACTER", "T_BAD_CHARACTER", "T_ENCAPSED_AND_WHITESPACE", "T_CONSTANT_ENCAPSED_STRING", "T_ECHO", "T_DO", "T_WHILE", "T_ENDWHILE", "T_FOR", "T_ENDFOR", "T_FOREACH", "T_ENDFOREACH", "T_DECLARE", "T_ENDDECLARE", "T_AS", "T_SWITCH", "T_ENDSWITCH", "T_CASE", "T_DEFAULT", "T_BREAK", "T_CONTINUE", "T_GOTO", "T_FUNCTION", "T_CONST", "T_RETURN", "T_TRY", "T_CATCH", "T_THROW", "T_USE", "T_INSTEADOF", "T_GLOBAL", "T_STATIC", "T_ABSTRACT", "T_FINAL", "T_PRIVATE", "T_PROTECTED", "T_PUBLIC", "T_VAR", "T_UNSET", "T_ISSET", "T_EMPTY", "T_HALT_COMPILER", "T_CLASS", "T_TRAIT", "T_INTERFACE", "T_EXTENDS", "T_IMPLEMENTS", "T_OBJECT_OPERATOR", "T_DOUBLE_ARROW", "T_LIST", "T_ARRAY", "T_CALLABLE", "T_CLASS_C", "T_TRAIT_C", "T_METHOD_C", "T_FUNC_C", "T_LINE", "T_FILE", "T_COMMENT", "T_DOC_COMMENT", "T_OPEN_TAG", "T_OPEN_TAG_WITH_ECHO", "T_CLOSE_TAG", "T_WHITESPACE", "T_START_HEREDOC", "T_END_HEREDOC", "T_DOLLAR_OPEN_CURLY_BRACES", "T_CURLY_OPEN", "T_PAAMAYIM_NEKUDOTAYIM", "T_DOUBLE_COLON", "T_NAMESPACE", "T_NS_C", "T_DIR", "T_NS_SEPARATOR"];
    var current = "UNKNOWN";
    constants.some(function (constant) {
        if (PHP.Constants[constant] === token) {
            current = constant;
            return true;
        } else {
            return false;
        }
    });

    return current;
};

PHP.Utils.Filesize = function (size) {

    if (/^\d+M$/i.test(size)) {
        return (size.replace(/M/g, "") - 0) * 1024 * 1024;
    } else if (/^\d+K$/i.test(size)) {
        return (size.replace(/K/g, "") - 0) * 1024;
    }

    return size;

};

PHP.Utils.QueryString = function (str) {
    str = str.trim();
    var variables = str.split(/&/);

    var items = {};

    // going through each variable which have been split by &
    variables.forEach(function (variable) {

        var parts = variable.split(/=/),
            key = decodeURIComponent(parts[0]),
            value = (parts.length > 1) ? decodeURIComponent(parts[1]) : null,

            arrayManager = function (item, parse, value) {
                var arraySearch = parse.match(/^\[([a-z0-9+_\-\[]*)\]/i);
                if (arraySearch !== null) {
                    var key = (arraySearch[1] === undefined) ? Object.keys(item).length : arraySearch[1];

                    if (key.length === 0) {
                        key = Object.keys(item).length;

                    }
                    parse = parse.substring(arraySearch[0].length);

                    if (parse.length > 0) {
                        if (typeof item[key] !== "object" && item[key] !== null) {
                            item[key] = {};
                        }

                        var ret = arrayManager(item[key], parse, value);

                        if (ret !== undefined) {
                            item[key] = ret;
                        }

                    } else {

                        item[key] = (value !== null) ? value.replace(/\+/g, " ") : null;
                    }


                } else {
                    if (parse === "]") {
                        item = value;
                        return value;
                    }

                }


            };


        var arraySearch = key.match(/^(.*?)((\[[a-z+0-9_\-\[\]]*\])+)$/i);

        if (arraySearch !== null) {
            key = arraySearch[1];



            if (typeof items[key] !== "object") {
                items[key] = {};

            }

            arrayManager(items[key], arraySearch[2], value);


        } else {
            items[key] = (value !== null) ? value.replace(/\+/g, " ") : null;
        }

    }, this);

    return items;
};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 5.7.2012 
 * @website http://hertzen.com
 */


PHP.Halt = function (msg, level, lineAppend, catchable) {

    this.msg = msg;
    this.level = level;
    this.lineAppend = lineAppend;
    this.catchable = catchable;

};

PHP.Compiler = function (AST, file, opts) {

    this.file = file;
    this.src = "";
    this.FOREACH_COUNT = 0;
    opts = opts || {};

    this.FUNC_NUM = 0;
    this.dimVars = "";
    this.tmpDimVars = "";
    this.DEPRECATED = [];
    this.dimPrev = "";

    this.INSIDE_METHOD = (opts.INSIDE_METHOD !== undefined) ? opts.INSIDE_METHOD : false;

    this.src += this.stmts(AST, true);

    /*
    AST.forEach( function( action ){
        if ( this.FATAL_ERROR !== undefined ) {
            return;
        }
        this.src += this[ action.type ]( action ) + ";\n";     
    }, this );*/

    if (this.FATAL_ERROR !== undefined) {
        this.src = 'this[ PHP.Compiler.prototype.ERROR ]("' + this.FATAL_ERROR + '", ' + ((this.ERROR_TYPE === undefined) ? "PHP.Constants.E_ERROR" : this.ERROR_TYPE) + ');';
    }
    var tmp = "";
    this.DEPRECATED.forEach(function (error) {

        tmp += 'this[ PHP.Compiler.prototype.ERROR ]("' + error[0] + ' in ' + this.file + ' on line ' + error[1] + '", PHP.Constants.E_DEPRECATED);';

    }, this);

    this.src = tmp + this.src;



};

var COMPILER = PHP.Compiler.prototype;

COMPILER.getName = function (item) {
    var parts = item.parts;
    if (Array.isArray(parts)) {
        return parts[0];
    } else {
        return parts;
    }

};

COMPILER.stmts = function (stmts, main) {
    var src = "";

    stmts.forEach(function (stmt) {
        if (this.FATAL_ERROR !== undefined) {
            return;
        }

        var tmp = this.source(stmt);

        if (this.dimVars.length > 0 || this.tmpDimVars.length > 0) {
            src += this.dimVars + this.tmpDimVars;
            this.dimVars = this.tmpDimVars = "";
        }

        src += tmp;

        if (stmt.type === "Node_Expr_New") {
            // init class without assign, call destruct ( this might not be valid in all cases )
            src += "." + this.UNSET + "()";

        }

        if (/^Node_Expr_Post(Inc|Dec)$/.test(stmt.type)) {
            // trigger POST_MOD
            src += "." + this.VARIABLE_VALUE;
        }

        src += ";\n";
    }, this);

    return src;
};

COMPILER.source = function (action) {



    if (action === null) {
        return "undefined";
    }


    if (typeof action === "string") {
        return action;
    } else if (action === undefined) {

        return undefined;
    } else if (action.type === "Node_Name") {
        return this.getName(action);
    }

    if (Array.isArray(action)) {
        return this[action[0].type](action[0]);
    }

    return this[action.type](action);
};

COMPILER.FILE_PATH = "$FILE_PATH";

COMPILER.NAV = "$NaV"; // not a variable;

COMPILER.FILESYSTEM = "$FS";

COMPILER.RESOURCES = "\π";

COMPILER.TIMER = "$Timer";

COMPILER.ENV = "ENV";

COMPILER.OUTPUT_BUFFER = "OUTPUT_BUFFER";

COMPILER.OUTPUT_BUFFERS = "OUTPUT_BUFFERS";

COMPILER.CTX = COMPILER.ENV + ".";

COMPILER.PARAM_NAME = "n";

COMPILER.PARAM_BYREF = "r";

COMPILER.CATCH = "$Catch";

COMPILER.EXCEPTION = "$Exception";

COMPILER.SUPPRESS = "$Suppress";

COMPILER.CONSTANTS = "$Constants";

COMPILER.CONSTANT_GET = "get";

COMPILER.CLASS_CONSTANT_GET = "$Class.ConstantGet";

COMPILER.CONSTANT_SET = "set";

COMPILER.CONSTANT_DEFINED = "defined";

COMPILER.MAGIC_CONSTANTS = "$MConstants";

COMPILER.ASSIGN = "_";

COMPILER.ASSIGN_PLUS = "_Plus";

COMPILER.ASSIGN_MINUS = "_Minus";

COMPILER.ASSIGN_CONCAT = "_Concat";

COMPILER.NEG = "$Neg";

COMPILER.ADD = "$Add";

COMPILER.MUL = "$Mul";

COMPILER.MOD = "$Mod";

COMPILER.DIV = "$Div";

COMPILER.FUNCTION = "$F";

COMPILER.FUNCTION_HANDLER = "$FHandler";

COMPILER.FUNCTION_STATIC = "$Static";

COMPILER.FUNCTION_GLOBAL = "$Global";

COMPILER.FUNCTION_STATIC_SET = "$Set";

COMPILER.BOOLEAN_OR = "$Or";

COMPILER.PRE_INC = "$PreInc";

COMPILER.PRE_DEC = "$PreDec";

COMPILER.POST_INC = "$PostInc";

COMPILER.POST_DEC = "$PostDec";

COMPILER.MINUS = "$Minus";

COMPILER.CONCAT = "$Concat";

COMPILER.UNSET = "$Unset";

COMPILER.NOT_IDENTICAL = "$NIdentical";

COMPILER.IDENTICAL = "$Identical";

COMPILER.BOOLEAN_NOT = "$Not";

COMPILER.BOOLEAN_AND = "$And";

COMPILER.EQUAL = "$Equal";

COMPILER.NOT_EQUAL = "$Equal";

COMPILER.SMALLER = "$Smaller";

COMPILER.SMALLER_OR_EQUAL = "$S_Equal";

COMPILER.GREATER = "$Greater";

COMPILER.GREATER_OR_EQUAL = "$G_Equal";

COMPILER.LABEL = "LABEL";

COMPILER.LABEL_COUNT = 0;

COMPILER.VARIABLE = "$";

COMPILER.VARIABLE_VALUE = "$";

COMPILER.CREATE_VARIABLE = "$$";

COMPILER.ARRAY_CLONE = "$AClone";

COMPILER.VARIABLE_CLONE = "$VClone";

COMPILER.ARRAY_GET = "offsetGet";

COMPILER.ARRAY_SET = "offsetSet";

COMPILER.METHOD_CALL = "$Call";

COMPILER.DIM_FETCH = "$Dim";

COMPILER.DIM_ISSET = "$DimIsset";

COMPILER.DIM_UNSET = "$DimUnset";

COMPILER.DIM_EMPTY = "$DimEmpty";

COMPILER.STATIC_CALL = "$StaticCall";

COMPILER.CLASS_NAME = "$Name";

COMPILER.INTERFACE_NEW = "$Class.INew";

COMPILER.CLASS_NEW = "$Class.New";

COMPILER.CLASS_GET = "$Class.Get";

COMPILER.CLASS_STORED = "$StoredIn";

COMPILER.CLASS_CLONE = "$CClone";

COMPILER.CLASS_PROPERTY_GET = "$Prop";

COMPILER.CLASS_PROPERTY_ISSET = "$PropIsset";

COMPILER.CLASS_STATIC_PROPERTY_ISSET = "$SPropIsset";

COMPILER.STATIC_PROPERTY_GET = "$SProp";

COMPILER.CLASS_METHOD = "Method";

COMPILER.CLASS_CONSTANT = "Constant";

COMPILER.CLASS_CONSTANT_FETCH = "$Constant";

COMPILER.PROPERTY_TYPE = "p";

COMPILER.PROPERTY_DEFAULT = "d";

COMPILER.CLASS_PROPERTY = "Variable";

COMPILER.CLASS_DECLARE = "Create";

COMPILER.CLASS_NAMES = "$CLASSNAMES";

COMPILER.CLASS_DESTRUCT = "$Destruct";

COMPILER.CLASS_TYPE = "$CType";

COMPILER.ARRAY_VALUE = "v";

COMPILER.ARRAY_KEY = "k";

COMPILER.ERROR = "$ERROR";

COMPILER.GLOBAL = "$Global";

COMPILER.SIGNATURE = "$SIGNATURE";

COMPILER.DISPLAY_HANDLER = "$DisplayHandler";

COMPILER.TYPE_CHECK = "$TypeCheck";

COMPILER.INSTANCEOF = "$InstanceOf";

COMPILER.fixString = function (result) {




    if (result.match(/^("|')/) === null) {
        result = '"' + result + '"';
    }



    if (result.match(/\r\n/) !== null) {
        var quote = result.substring(0, 1);



        // this might have unexpected consequenses
        result = result.replace(/\r\n"$/, '"');

        result = '[' + result.split(/\r\n/).map(function (item) {
            var a = item.replace(/\r/g, "").replace(/\n/, "\\n");
            return a;
        }).join(quote + "," + quote) + '].join("\\n")';

    }

    result = result.replace(/([^\\])\\([^\\nrt\$'"])/g, "$1\\\\$2");

    return result;

    /*
        $val = str_replace("\\", "\\\\", $val);
        //$val = str_replace("\n", "\\n", $val);
        //$val = str_replace("\t", "\\t", $val);
        $val = str_replace('"', '\\"', $val);
        //$val = str_replace('\\\\', '\\\\\\\\', $val);

        $val = str_replace("\n", "\\n", $val);
        $val = str_replace("\t", "\\t", $val);
    */


};


PHP.Compiler.prototype.Node_Expr_ArrayDimFetch = function (action) {

    var part;

    if (action.dim !== undefined && action.dim !== null && (/^Node_Expr_(FuncCall|Plus)$/.test(action.dim.type))) {


        var tmp = "var dim" + (++this.FUNC_NUM) + " = " + this.CREATE_VARIABLE + "(" + this.source(action.dim) + "." + this.VARIABLE_VALUE + ");";



        if (this.tmpDimVars.length === 0) {
            this.tmpDimVars += tmp;
        } else {
            if (this.dimPrev === "Node_Expr_Plus") {
                this.dimVars += this.tmpDimVars + tmp;
            } else {
                this.dimVars += tmp + this.tmpDimVars;
            }
            this.tmpDimVars = "";
        }
        this.dimPrev = action.dim.type;



        part = "dim" + this.FUNC_NUM;
    } else {
        part = this.source(action.dim);
    }

    var src = "",
        variable;

    if (action.variable.type === "Node_Expr_PropertyFetch") {
        variable = this.Node_Expr_PropertyFetch(action.variable, true);
    } else {
        variable = this.source(action.variable);
    }

    src += variable + "." + this.DIM_FETCH + '( this, ' + part + " )";

    return src;
};

PHP.Compiler.prototype.Node_Expr_Assign = function (action) {

    if (action.variable.type === "Node_Expr_Variable" && action.variable.name === "this") {
        this.FATAL_ERROR = "Cannot re-assign $this in " + this.file + " on line " + action.attributes.startLine;
    }


    var src = this.source(action.variable) + "." + this.ASSIGN;
    if (action.expr !== undefined) {
        if (action.expr.type !== "Node_Expr_Assign") {
            src += "(" + this.source(action.expr) + ")";
        } else {
            src += "(" + this.source(action.expr.variable) + ", " + this.source(action.expr.expr) + ")";
        }
    } else {
        src += "(" + this.source(action.refVar) + ")";

    }
    /*
    if (!/Node_Expr_(Plus|Mul|Div|Minus|BitwiseOr|BitwiseAnd)/.test(action.expr.type)) {
        src += "." + this.VARIABLE_VALUE;
    }*/
    return src;
};

PHP.Compiler.prototype.Node_Expr_AssignMinus = function (action) {
    var src = this.source(action.variable) + "." + this.ASSIGN_MINUS + "(" + this.source(action.expr) + ")";
    /*
  if (!/Node_Expr_(Plus|Mul|Div|Minus|BitwiseOr|BitwiseAnd)/.test(action.expr.type)) {
        src += "." + this.VARIABLE_VALUE;
    }*/
    return src;
};

PHP.Compiler.prototype.Node_Expr_AssignPlus = function (action) {
    var src = this.source(action.variable) + "." + this.ASSIGN_PLUS + "(" + this.source(action.expr) + ")";
    /*
    if (!/Node_Expr_(Plus|Mul|Div|Minus|BitwiseOr|BitwiseAnd)/.test(action.expr.type)) {
        src += "." + this.VARIABLE_VALUE;
    }*/
    return src;
};


PHP.Compiler.prototype.Node_Expr_AssignMul = function (action) {
    var src = this.source(action.variable) + "." + this.VARIABLE_VALUE + " *= " + this.source(action.expr);
    if (!/Node_Expr_(Plus|Mul|Div|Minus|BitwiseOr|BitwiseAnd)/.test(action.expr.type)) {
        src += "." + this.VARIABLE_VALUE;
    }
    return src;
};


PHP.Compiler.prototype.Node_Expr_AssignDiv = function (action) {
    var src = this.source(action.variable) + "." + this.VARIABLE_VALUE + " /= " + this.source(action.expr);
    if (!/Node_Expr_(Plus|Mul|Div|Minus|BitwiseOr|BitwiseAnd)/.test(action.expr.type)) {
        src += "." + this.VARIABLE_VALUE;
    }
    return src;
};

PHP.Compiler.prototype.Node_Expr_AssignConcat = function (action) {
    var src = this.source(action.variable) + "." + this.ASSIGN_CONCAT + "(" + this.source(action.expr) + ")";
    /*
    if (!/Node_Expr_(Plus|Mul|Div|Minus|BitwiseOr|BitwiseAnd)/.test(action.expr.type)) {
        src += "." + this.VARIABLE_VALUE;
    }*/
    return src;
};

PHP.Compiler.prototype.Node_Expr_AssignRef = function (action) {
    if (action.refVar.type === "Node_Expr_New") {
        this.DEPRECATED.push(["Assigning the return value of new by reference is deprecated", action.attributes.startLine]);
    }


    var src = "";
    if (action.variable.type === "Node_Expr_StaticPropertyFetch") {
        src += this.Node_Expr_StaticPropertyFetch(action.variable, true);
    } else {
        src += this.source(action.variable);
    }
    src += "." + PHP.VM.Variable.prototype.REF + "(" + this.source(action.refVar) + ")";
    return src;
};

PHP.Compiler.prototype.Node_Expr_Ternary = function (action) {
    var src = "(( " + this.source(action.cond) + "." + this.VARIABLE_VALUE + " ) ? " + this.source(action.If) + " : " + this.source(action.Else) + ")";

    return src;
};

PHP.Compiler.prototype.Node_Expr_ErrorSuppress = function (action) {
    var src = this.CTX + this.SUPPRESS + "(function() { return " + this.source(action.expr) + " })";
    return src;
};

PHP.Compiler.prototype.Node_Expr_FuncCall = function (action) {

    var src = "(" + this.CTX + this.FUNCTION + '(';


    if (action.func.type !== "Node_Name") {
        src += this.source(action.func) + "." + this.VARIABLE_VALUE + ", arguments";
    } else {
        src += '"' + this.getName(action.func) + '", arguments';

        if (this.getName(action.func) === "eval") {
            src += ", $, $Static, this";

            if (this.INSIDE_METHOD) {
                src += ", ctx";
            } else {
                src += ", undefined";
            }
            src += ", ENV";
            // args.push("$");
        }

    }

    action.args.forEach(function (arg) {
        if (arg.value.type === "Node_Expr_PropertyFetch") {
            src += ", " + this.Node_Expr_PropertyFetch(arg.value, true);
        } else {
            src += ", " + this.source(arg.value);
        }

        //    args.push( this.source( arg.value ) );
    }, this);

    src += "))";

    return src;
};

PHP.Compiler.prototype.Node_Expr_Exit = function (action) {
    var src = this.CTX + "exit( " + this.source(action.expr) + " )";

    return src;
};

PHP.Compiler.prototype.Node_Expr_AssignList = function (action) {

    var src = this.CTX + "list( ";




    var addList = function (assignList) {
        var first = "";
        assignList.forEach(function (item) {
            if (Array.isArray(item)) {
                src += first + " [";
                addList(item);
                src += "]";

            } else {
                src += first + " " + this.source(item);
            }
            first = ", ";
        }, this);

    }.bind(this);
    addList(action.assignList);
    src += ", " + this.source(action.expr) + " )";

    return src;
};

PHP.Compiler.prototype.Node_Expr_Isset = function (action) {

    var src = this.CTX + "$isset( ";

    var args = [];
    action.variables.forEach(function (arg) {

        switch (arg.type) {

            case "Node_Expr_ArrayDimFetch":
                args.push(this.source(arg.variable) + "." + this.DIM_ISSET + '( this, ' + this.source(arg.dim) + " )");
                break;
            case "Node_Expr_PropertyFetch":

                args.push(this.source(arg.variable) + "." + this.VARIABLE_VALUE + "." + this.CLASS_PROPERTY_ISSET + '( this, "' + this.source(arg.name) + '" )');

                break;

            case "Node_Expr_StaticPropertyFetch":

                args.push(this.Node_Expr_StaticPropertyFetch(arg, undefined, true));

                break;
            default:
                args.push(this.source(arg));
        }


    }, this);

    src += args.join(", ") + " )";

    return src;
};

PHP.Compiler.prototype.Node_Expr_Empty = function (action) {

    var src = this.CTX + "$empty( ";
    switch (action.variable.type) {
        case "Node_Expr_ArrayDimFetch":
            src += this.source(action.variable.variable) + "." + this.DIM_EMPTY + '( this, ' + this.source(action.variable.dim) + " )";
            break;
        default:
            src += this.source(action.variable);
    }
    src += " )";

    return src;
};

PHP.Compiler.prototype.Node_Expr_Instanceof = function (action) {


    var classPart;

    if (action.right.type === "Node_Name") {
        classPart = '"' + this.source(action.right) + '"';
    } else {
        classPart = this.source(action.right) + "." + this.VARIABLE_VALUE;
    }

    return this.source(action.left) + "." + this.INSTANCEOF + '(' + classPart + ')';
};

PHP.Compiler.prototype.Node_Expr_UnaryPlus = function (action) {
    return this.source(action.expr);
};

PHP.Compiler.prototype.Node_Expr_UnaryMinus = function (action) {
    return this.source(action.expr) + "." + this.NEG + "()";
};

PHP.Compiler.prototype.Node_Expr_BitwiseOr = function (action) {
    return this.CREATE_VARIABLE + "(" + this.source(action.left) + "." + this.VARIABLE_VALUE + " | " + this.source(action.right) + "." + this.VARIABLE_VALUE + ")";
};

PHP.Compiler.prototype.Node_Expr_BitwiseAnd = function (action) {
    return this.CREATE_VARIABLE + "(" + this.source(action.left) + "." + this.VARIABLE_VALUE + " & " + this.source(action.right) + "." + this.VARIABLE_VALUE + ")";
};

PHP.Compiler.prototype.Node_Expr_BitwiseNot = function (action) {
    return this.CREATE_VARIABLE + "(" + "~" + this.source(action.expr) + "." + this.VARIABLE_VALUE + ")";
};

PHP.Compiler.prototype.Node_Expr_Div = function (action) {
    return this.source(action.left) + "." + this.DIV + "(" + this.source(action.right) + ")";
};

PHP.Compiler.prototype.Node_Expr_Minus = function (action) {
    return this.source(action.left) + "." + this.MINUS + "(" + this.source(action.right) + (/^Node_Expr_Post/.test(action.right.type) ? ", true" : "") + ")";
};

PHP.Compiler.prototype.Node_Expr_Mul = function (action) {
    return this.source(action.left) + "." + this.MUL + "(" + this.source(action.right) + ")";
};

PHP.Compiler.prototype.Node_Expr_Mod = function (action) {
    return this.source(action.left) + "." + this.MOD + "(" + this.source(action.right) + ")";
};

PHP.Compiler.prototype.Node_Expr_Plus = function (action) {

    var str = "";


    if (/^Node_Expr_((Static)?Property|ArrayDim)Fetch$/.test(action.left.type)) {
        str += this.CREATE_VARIABLE + "(" + this.source(action.left) + "." + PHP.VM.Variable.prototype.CAST_DOUBLE + "." + this.VARIABLE_VALUE + ")";
    } else {
        str += this.source(action.left);
    }

    str += "." + this.ADD + "(" + this.source(action.right) + ")";

    return str;


};

PHP.Compiler.prototype.Node_Expr_Equal = function (action) {
    return this.source(action.left) + "." + this.EQUAL + "(" + this.source(action.right) + ")";
};

PHP.Compiler.prototype.Node_Expr_NotEqual = function (action) {
    return this.source(action.left) + "." + this.NOT_EQUAL + "(" + this.source(action.right) + ")";
};

PHP.Compiler.prototype.Node_Expr_NotIdentical = function (action) {
    return this.source(action.left) + "." + this.NOT_IDENTICAL + "(" + this.source(action.right) + ")";
};

PHP.Compiler.prototype.Node_Expr_Identical = function (action) {
    return this.source(action.left) + "." + this.IDENTICAL + "(" + this.source(action.right) + ")";
};

PHP.Compiler.prototype.Node_Expr_LogicalOr = function (action) {
    return this.CREATE_VARIABLE + "(" + this.source(action.left) + "." + PHP.VM.Variable.prototype.CAST_BOOL + "." + this.VARIABLE_VALUE + " || " + this.source(action.right) + "." + PHP.VM.Variable.prototype.CAST_BOOL + "." + this.VARIABLE_VALUE + ")";
};

PHP.Compiler.prototype.Node_Expr_LogicalAnd = function (action) {
    return this.CREATE_VARIABLE + "(" + this.source(action.left) + "." + PHP.VM.Variable.prototype.CAST_BOOL + "." + this.VARIABLE_VALUE + " && " + this.source(action.right) + "." + PHP.VM.Variable.prototype.CAST_BOOL + "." + this.VARIABLE_VALUE + ")";
};

PHP.Compiler.prototype.Node_Expr_LogicalXor = function (action) {
    return this.CREATE_VARIABLE + "(" + "!" + this.source(action.left) + "." + PHP.VM.Variable.prototype.CAST_BOOL + "." + this.VARIABLE_VALUE + " != " + "!" + this.source(action.right) + "." + PHP.VM.Variable.prototype.CAST_BOOL + "." + this.VARIABLE_VALUE + ")";
};

PHP.Compiler.prototype.Node_Expr_BooleanOr = function (action) {
    return this.CREATE_VARIABLE + "(" + this.source(action.left) + "." + PHP.VM.Variable.prototype.CAST_BOOL + "." + this.VARIABLE_VALUE + " || " + this.source(action.right) + "." + PHP.VM.Variable.prototype.CAST_BOOL + "." + this.VARIABLE_VALUE + ")";
};

PHP.Compiler.prototype.Node_Expr_BooleanAnd = function (action) {
    return this.CREATE_VARIABLE + "(" + this.source(action.left) + "." + PHP.VM.Variable.prototype.CAST_BOOL + "." + this.VARIABLE_VALUE + " && " + this.source(action.right) + "." + PHP.VM.Variable.prototype.CAST_BOOL + "." + this.VARIABLE_VALUE + ")";
};

PHP.Compiler.prototype.Node_Expr_BooleanNot = function (action) {
    return this.CREATE_VARIABLE + "(" + "!" + this.source(action.expr) + "." + PHP.VM.Variable.prototype.CAST_BOOL + "." + this.VARIABLE_VALUE + ")";
};

PHP.Compiler.prototype.Node_Expr_Smaller = function (action) {
    return this.source(action.left) + "." + this.SMALLER + "(" + this.source(action.right) + ")";
};

PHP.Compiler.prototype.Node_Expr_Greater = function (action) {
    return this.source(action.left) + "." + this.GREATER + "(" + this.source(action.right) + ")";
};

PHP.Compiler.prototype.Node_Expr_GreaterOrEqual = function (action) {
    return this.source(action.left) + "." + this.GREATER_OR_EQUAL + "(" + this.source(action.right) + ")";
};

PHP.Compiler.prototype.Node_Expr_SmallerOrEqual = function (action) {
    return this.source(action.left) + "." + this.SMALLER_OR_EQUAL + "(" + this.source(action.right) + ")";
};

PHP.Compiler.prototype.Node_Expr_PreInc = function (action) {
    return this.source(action.variable) + "." + this.PRE_INC + "()";
};

PHP.Compiler.prototype.Node_Expr_PreDec = function (action) {
    return this.source(action.variable) + "." + this.PRE_DEC + "()";
};

PHP.Compiler.prototype.Node_Expr_PostInc = function (action) {
    return this.source(action.variable) + "." + this.POST_INC + "()";
};

PHP.Compiler.prototype.Node_Expr_PostDec = function (action) {
    return this.source(action.variable) + "." + this.POST_DEC + "()";
};

PHP.Compiler.prototype.Node_Expr_Concat = function (action) {
    var str = "";


    if (/^Node_Expr_((Static)?Property|ArrayDim)Fetch$/.test(action.left.type)) {
        str += this.CREATE_VARIABLE + "(" + this.source(action.left) + "." + PHP.VM.Variable.prototype.CAST_STRING + "." + this.VARIABLE_VALUE + ")";
    } else {
        str += this.source(action.left);
    }

    str += "." + this.CONCAT + "(" + this.source(action.right) + ")";

    return str;

};

PHP.Compiler.prototype.Node_Expr_Print = function (action) {

    var src = this.CTX + 'print( ';

    src += this.source(action.expr);


    src += ' )';
    return src;
};

PHP.Compiler.prototype.Node_Expr_Variable = function (action) {
    var src = this.VARIABLE + "(";

    if (action.name === "this") {
        src += '"' + this.source(action.name) + '"';
        //  return action.name;
    } else {

        if (typeof action.name === "string") {
            src += '"' + this.source(action.name) + '"';
        } else {
            src += this.source(action.name) + "." + this.VARIABLE_VALUE;
        }

        //  return this.VARIABLE + '("' + this.source( action.name ) + '")';
    }

    return src + ")";
};

PHP.Compiler.prototype.Node_Expr_Cast_String = function (action) {
    return this.source(action.expr) + "." + PHP.VM.Variable.prototype.CAST_STRING;
};

PHP.Compiler.prototype.Node_Expr_Cast_Int = function (action) {
    return this.source(action.expr) + "." + PHP.VM.Variable.prototype.CAST_INT;
};

PHP.Compiler.prototype.Node_Expr_Cast_Double = function (action) {
    return this.source(action.expr) + "." + PHP.VM.Variable.prototype.CAST_DOUBLE;
};

PHP.Compiler.prototype.Node_Expr_Cast_Bool = function (action) {
    return this.source(action.expr) + "." + PHP.VM.Variable.prototype.CAST_BOOL;
};

PHP.Compiler.prototype.Node_Expr_Include = function (action) {
    return this.CTX + "include( " + this.VARIABLE + ", " + this.FUNCTION_STATIC + ", " + this.source(action.expr) + " )";
};

PHP.Compiler.prototype.Node_Expr_IncludeOnce = function (action) {
    return this.CTX + "include_once( " + this.VARIABLE + ", " + this.FUNCTION_STATIC + ", " + this.source(action.expr) + " )";
};

PHP.Compiler.prototype.Node_Expr_Require = function (action) {
    return this.CTX + "require( " + this.VARIABLE + ", " + this.FUNCTION_STATIC + ", " + this.source(action.expr) + " )";
};

PHP.Compiler.prototype.Node_Expr_RequireOnce = function (action) {
    return this.CTX + "require_once( " + this.VARIABLE + ", " + this.FUNCTION_STATIC + ", " + this.source(action.expr) + " )";
};

PHP.Compiler.prototype.Node_Expr_New = function (action) {


    var classPart,
        src = "";

    if (action.Class.type === "Node_Name") {
        classPart = '"' + this.source(action.Class) + '"';
    } else {
        classPart = this.source(action.Class) + "." + this.VARIABLE_VALUE;
    }

    src += this.CREATE_VARIABLE + '(new (' + this.CTX + this.CLASS_GET + '(' + classPart + '))( this';

    action.args.forEach(function (arg) {
        if (arg.value.type === "Node_Expr_PropertyFetch") {
            src += ", " + this.Node_Expr_PropertyFetch(arg.value, true);
        } else {
            src += ", " + this.source(arg.value);
        }
        //   src += ", "  + this.source( arg.value );
    }, this);

    src += " ))";

    return src;
};



PHP.Compiler.prototype.Node_Expr_ConstFetch = function (action) {

    if (/true|false|null/i.test(action.name.parts)) {
        return this.CREATE_VARIABLE + '(' + action.name.parts.toString().toLowerCase() + ')';
    } else {
        return this.CTX + this.CONSTANTS + '.' + this.CONSTANT_GET + '("' + this.source(action.name) + '")';
    }

};


PHP.Compiler.prototype.Node_Expr_MethodCall = function (action) {

    var classPart, src = "";


    if (action.name.type === undefined) {
        classPart = '"' + action.name + '"';
    } else {
        classPart = this.source(action.name) + "." + this.VARIABLE_VALUE;
    }


    src += this.source(action.variable) + "." + this.METHOD_CALL + '( ';

    src += (action.variable.name === "this") ? "ctx" : "this";

    src += ', ' + classPart;

    action.args.forEach(function (arg) {

        if (arg.value.type === "Node_Expr_PropertyFetch") {
            src += ", " + this.Node_Expr_PropertyFetch(arg.value, true);
        } else {
            src += ", " + this.source(arg.value);
        }

        // src += ", " + this.source( arg.value );
    }, this);



    src += ")";

    return src;

};

PHP.Compiler.prototype.Node_Expr_PropertyFetch = function (action, funcCall) {

    var classParts = "";

    if (typeof action.name === "string") {
        classParts += '"' + this.source(action.name) + '"';
    } else {
        classParts += this.source(action.name) + "." + this.VARIABLE_VALUE;
    }
    var extra = "";
    if (funcCall === true) {
        extra = ", true";
    }

    var variable;
    if (action.variable.type === "Node_Expr_PropertyFetch") {
        variable = this.Node_Expr_PropertyFetch(action.variable, funcCall);
    } else {
        variable = this.source(action.variable);
    }

    if (action.variable.name !== "this") {
        return variable + "." + this.CLASS_PROPERTY_GET + '( this, ' + classParts + extra + ' )';
    } else {
        return variable + "." + this.CLASS_PROPERTY_GET + '( ctx, ' + classParts + extra + ' )';
    }

};

PHP.Compiler.prototype.Node_Expr_ClassConstFetch = function (action) {

    var classPart;

    if (action.Class.type === "Node_Name") {
        classPart = '"' + this.source(action.Class) + '"';
    } else {
        classPart = this.source(action.Class) + "." + this.VARIABLE_VALUE;
    }


    return this.CTX + this.CLASS_CONSTANT_GET + '(' + classPart + ', this, "' + action.name + '" )';


};

PHP.Compiler.prototype.Node_Expr_StaticCall = function (action) {

    var src = "";

    var classPart,
        funcPart;

    if (action.Class.type === "Node_Name") {
        classPart = '"' + this.source(action.Class) + '"';
    } else {
        classPart = this.source(action.Class) + "." + this.VARIABLE_VALUE;
    }

    if (typeof action.func === "string") {
        funcPart = '"' + this.source(action.func) + '"';
    } else {
        funcPart = this.source(action.func) + "." + this.VARIABLE_VALUE;
    }

    if (/^(parent|self)$/i.test(action.Class.parts)) {
        src += "this." + this.STATIC_CALL + '( ' + ((this.INSIDE_METHOD === true) ? "ctx" : "this") + ', ' + classPart + ', ' + funcPart;
    } else {
        src += this.CTX + this.CLASS_GET + '(' + classPart + ', this).' + this.STATIC_CALL + '( ' + ((this.INSIDE_METHOD === true) ? "ctx" : "this") + ', ' + classPart + ', ' + funcPart;
    }


    action.args.forEach(function (arg) {

        if (arg.value.type === "Node_Expr_PropertyFetch") {
            src += ", " + this.Node_Expr_PropertyFetch(arg.value, true);
        } else {
            src += ", " + this.source(arg.value);
        }

        //  src += ", " + this.source( arg.value );
    }, this);

    src += ")";

    return src;

};

PHP.Compiler.prototype.Node_Expr_StaticPropertyFetch = function (action, ref, isset) {

    var src = "",
        extra = "",
        classPart;


    var actionParts = "";

    if (typeof action.name === "string") {
        actionParts += '"' + this.source(action.name) + '"';
    } else {
        actionParts += this.source(action.name) + "." + this.VARIABLE_VALUE;
    }



    if (action.Class.type === "Node_Name") {
        classPart = '"' + this.source(action.Class) + '"';
    } else {
        classPart = this.source(action.Class) + "." + this.VARIABLE_VALUE;
    }

    if (ref === true) {
        extra = ", true";
    }





    if (/^(parent|self)$/i.test(action.Class.parts)) {
        src += "this." + ((isset === true) ? this.CLASS_STATIC_PROPERTY_ISSET : this.STATIC_PROPERTY_GET) + '( ' + ((this.INSIDE_METHOD === true) ? "ctx" : "this") + ', ' + classPart + ', ' + actionParts;
    } else {
        src += this.CTX + this.CLASS_GET + '(' + classPart + ', this).' + ((isset === true) ? this.CLASS_STATIC_PROPERTY_ISSET : this.STATIC_PROPERTY_GET) + '( ' + ((this.INSIDE_METHOD === true) ? "ctx" : "this") + ', ' + classPart + ', ' + actionParts;
    }


    src += extra + ")";

    return src;

};

PHP.Compiler.prototype.Node_Expr_Array = function (action) {

    var src = this.CTX + "array([",
        items = [];

    ((Array.isArray(action.items)) ? action.items : [action.items]).forEach(function (item) {
        if (item.value !== undefined) {
            items.push("{" + this.ARRAY_VALUE + ":" + this.source(item.value) + ((item.key !== undefined) ? ", " + this.ARRAY_KEY + ":" + this.source(item.key) : "") + "}");
        }
    }, this);

    src += items.join(", ") + "])";
    return src;

};

PHP.Compiler.prototype.Node_Expr_Clone = function (action) {

    var src = "";
    src += this.source(action.expr) + "." + this.VARIABLE_VALUE + "." + this.CLASS_CLONE + "( this )";
    return src;

};
PHP.Compiler.prototype.Node_Stmt_Interface = function (action) {
    action.stmts.forEach(function (stmt) {
        if (stmt.type === "Node_Stmt_ClassMethod" && stmt.stmts !== null) {
            this.FATAL_ERROR = "Interface function " + action.name + "::" + stmt.name + "() cannot contain body {} on line " + action.attributes.startLine;
        }
    }, this);

    var src = this.CTX + this.INTERFACE_NEW + '( "' + action.name + '", [';


    var ints = [];

    function addInterface(interf) {

        interf.forEach(function (item) {
            if (Array.isArray(item)) {
                addInterface(item);
            } else {

                ints.push('"' + item.parts + '"');
            }
        });
    }

    addInterface(action.Extends);
    /*
        src += (Array.isArray(action.Implements[ 0 ]) ? action.Implements[ 0 ] : action.Implements ).map(function( item ){

            return '"' + item.parts + '"';
        }).join(", ");
        */
    src += ints.join(", ");

    /*
    var exts = [];

    action.Extends.forEach(function( ext ){
        exts.push( '"' + ext.parts + '"' );
    }, this);

    src += exts.join(", ")
    */
    src += "], function( M, $, $$ ){\n M";

    this.currentClass = action.name;
    action.stmts.forEach(function (stmt) {
        src += this.source(stmt);
    }, this);


    src += "." + this.CLASS_DECLARE + '()})';


    return src;
};

PHP.Compiler.prototype.Node_Stmt_Class = function (action) {
    var src = this.CTX + this.CLASS_NEW + '( "' + action.name + '", ' + action.Type + ', {';

    if (action.Extends !== null) {
        src += 'Extends: "' + this.source(action.Extends) + '"';
    }

    if (action.Implements.length > 0) {
        if (action.Extends !== null) {
            src += ", ";
        }

        // properly borken somewhere in the parser
        src += 'Implements: [';

        var ints = [];

        addInterface(action.Implements, ints);
        /*
        src += (Array.isArray(action.Implements[ 0 ]) ? action.Implements[ 0 ] : action.Implements ).map(function( item ){

            return '"' + item.parts + '"';
        }).join(", ");
        */
        src += ints.join(", ");
        src += "]";
    }

    function addInterface(interf, ints) {

        interf.forEach(function (item) {
            if (Array.isArray(item)) {
                addInterface(item, ints);
            } else {

                ints.push('"' + item.parts + '"');
            }
        });
    }

    src += "}, function( M, $, $$ ){\n M";

    this.currentClass = action.name;
    action.stmts.forEach(function (stmt) {
        src += this.source(stmt);
    }, this);

    src += "." + this.CLASS_DECLARE + '()';

    src += "})";




    return src;
};


PHP.Compiler.prototype.Node_Stmt_Echo = function (action) {
    var src = this.CTX + 'echo( ',
        args = [];
    if (Array.isArray(action.exprs)) {
        action.exprs.forEach(function (arg) {
            args.push(this.source(arg));
        }, this);
        src += args.join(", ");
    } else {
        src += this.source(action.exprs);
    }

    src += ' )';
    return src;
};

PHP.Compiler.prototype.Node_Stmt_For = function (action) {

    var src = this.LABEL + this.LABEL_COUNT++ + ":\n";

    src += "for( ";

    if (!Array.isArray(action.init) || action.init.length !== 0) {
        src += this.source(action.init);
    }

    src += "; ";

    if (!Array.isArray(action.cond) || action.cond.length !== 0) {
        src += "(" + this.source(action.cond) + ")." + PHP.VM.Variable.prototype.CAST_BOOL + "." + this.VARIABLE_VALUE;
    }

    src += "; ";

    // if ( !Array.isArray(action.loop) || action.loop.length !== 1 ) { // change

    if (action.loop.length > 0) {
        src += this.source(action.loop) + "." + this.VARIABLE_VALUE;
    }
    // }
    src += " ) { ";

    src += this.CTX + this.TIMER + "();\n";

    src += this.stmts(action.stmts);

    src += "}";

    return src;
};

PHP.Compiler.prototype.Node_Stmt_While = function (action) {

    var src = this.LABEL + this.LABEL_COUNT++ + ":\n";

    src += "while( " + this.source(action.cond) + "." + PHP.VM.Variable.prototype.CAST_BOOL + "." + this.VARIABLE_VALUE + ") {";

    src += this.CTX + this.TIMER + "(); \n";

    src += this.stmts(action.stmts);

    src += "}";

    return src;
};

PHP.Compiler.prototype.Node_Stmt_Do = function (action) {

    var src = this.LABEL + this.LABEL_COUNT++ + ":\n";
    src += "do {\n";
    src += this.stmts(action.stmts);
    src += "} while( " + this.source(action.cond) + "." + PHP.VM.Variable.prototype.CAST_BOOL + "." + this.VARIABLE_VALUE + ")";

    return src;
};

PHP.Compiler.prototype.Node_Stmt_Switch = function (action) {
    var src = this.LABEL + this.LABEL_COUNT++ + ":\n";
    src += "switch(" + this.source(action.cond) + "." + this.VARIABLE_VALUE + ") {\n";

    action.cases.forEach(function (item) {
        src += this.source(item) + ";\n";
    }, this);
    src += "}";


    return src;
};

PHP.Compiler.prototype.Node_Stmt_Case = function (action) {

    var src = "";
    if (action.cond === null) {
        src += "default:\n";
    } else {
        src += "case (" + this.source(action.cond) + "." + this.VARIABLE_VALUE + "):\n";
    }


    action.stmts.forEach(function (item) {
        src += this.source(item) + ";\n";
    }, this);



    return src;
};

PHP.Compiler.prototype.Node_Stmt_Foreach = function (action) {

    if (action.expr.type === "Node_Expr_Array" && action.byRef === true) {

        if (action.keyVar === null) {
            this.FATAL_ERROR = "syntax error, unexpected '&' in " + this.file + " on line " + action.attributes.startLine;
            this.ERROR_TYPE = PHP.Constants.E_PARSE;
        } else {
            this.FATAL_ERROR = "Cannot create references to elements of a temporary array expression in " + this.file + " on line " + action.attributes.startLine;
        }
        return;
    }

    var count = ++this.FOREACH_COUNT;
    var src = "var iterator" + count + " = " + this.CTX + "$foreachInit(" + this.source(action.expr) + ", " + ((this.INSIDE_METHOD === true) ? "ctx" : "this") + ");\n";
    src += "while(" + this.CTX + 'foreach( iterator' + count + ', ' + action.byRef + ", " + this.source(action.valueVar);

    if (action.keyVar !== null) {
        src += ', ' + this.source(action.keyVar);
    }
    src += ')) {\n';
    src += this.stmts(action.stmts);
    src += '} ';

    src += this.CTX + "$foreachEnd( iterator" + count + " )";
    return src;
};


PHP.Compiler.prototype.Node_Stmt_Continue = function (action) {

    var src = "continue";
    return src;
};

PHP.Compiler.prototype.Node_Stmt_Break = function (action) {

    var src = "break";

    if (action.num !== null) {
        src += " " + this.LABEL + (this.LABEL_COUNT - action.num.value);
    }
    return src;
};

PHP.Compiler.prototype.Node_Stmt_Function = function (action) {

    var src = this.CTX + action.name + " = Function.prototype.bind.apply( function( " + this.VARIABLE + ", " + this.FUNCTION_STATIC + ", " + this.FUNCTION_GLOBAL + "  ) {\n";

    src += this.VARIABLE + " = " + this.VARIABLE + "([";
    var params = [];
    ((action.params[0] === undefined || !Array.isArray(action.params[0])) ? action.params : action.params[0]).forEach(function (param) {

        if (param.type === "Node_Param") {
            var item = '{' + this.PARAM_NAME + ':"' + param.name + '"';

            if (param.byRef === true) {
                item += "," + this.PARAM_BYREF + ':true';
            }

            if (param.def !== null) {
                item += ", " + this.PROPERTY_DEFAULT + ": " + this.source(param.def);
            }

            if (param.Type !== null) {
                item += ", " + this.PROPERTY_TYPE + ': "' + this.source(param.Type) + '"';
            }


            item += '}';
            params.push(item);
        }

    }, this);

    src += params.join(", ") + "], arguments);\n";
    src += this.stmts(action.stmts);
    src += "}, (" + this.CTX + this.FUNCTION_HANDLER + ')( ENV, "' + action.name + '", ' + action.byRef + '  ))';

    return src;
};

PHP.Compiler.prototype.Node_Stmt_Static = function (action) {
    // todo fix
    var src = this.FUNCTION_STATIC;
    action.vars.forEach(function (variable) {
        src += this.source(variable);
    }, this);


    return src;
};


PHP.Compiler.prototype.Node_Stmt_Global = function (action) {
    // todo fix
    var src = this.FUNCTION_STATIC + "." + this.FUNCTION_GLOBAL + "([",
        vars = [];

    action.vars.forEach(function (variable) {
        vars.push('"' + variable.name + '"');

    }, this);
    src += vars.join(", ") + "])";
    return src;
};

PHP.Compiler.prototype.Node_Stmt_StaticVar = function (action) {
    // todo fix
    var src = "." + this.FUNCTION_STATIC_SET + '("' + action.name + '", ' + ((action.def === null) ? "new PHP.VM.Variable()" : this.source(action.def)) + ")";

    return src;
};

PHP.Compiler.prototype.Node_Stmt_Property = function (action) {
    var src = "";

    action.props.forEach(function (prop) {

        src += "." + this.CLASS_PROPERTY + '( "' + prop.name + '", ' + action.Type;
        if (prop.def !== null) {
            src += ', ' + this.source(prop.def);
        }

        src += " )\n";

    }, this);

    return src;
};

PHP.Compiler.prototype.Node_Stmt_Unset = function (action) {
    var src = this.CTX + "unset( ",
        vars = [];

    action.variables.forEach(function (variable) {
        switch (variable.type) {

            case "Node_Expr_ArrayDimFetch":
                vars.push(this.source(variable.variable) + "." + this.DIM_UNSET + '( this, ' + this.source(variable.dim) + " )");
                break;
            default:
                vars.push(this.source(variable));
        }


    }, this);

    src += vars.join(", ") + " )";

    return src;
};

PHP.Compiler.prototype.Node_Stmt_InlineHTML = function (action) {
    var src = this.CTX + '$ob("' + action.value.replace(/[\\"]/g, '\\$&').replace(/\n/g, "\\n").replace(/\r/g, "") + '")';

    return src;
};

PHP.Compiler.prototype.Node_Stmt_If = function (action) {
    var src = "if ( (" + this.source(action.cond) + ")." + PHP.VM.Variable.prototype.CAST_BOOL + "." + this.VARIABLE_VALUE + ") {\n";

    action.stmts.forEach(function (stmt) {
        src += this.source(stmt) + ";\n";
    }, this);

    action.elseifs.forEach(function (Elseif) {
        src += this.source(Elseif) + "\n";
    }, this);


    if (action.Else !== null) {
        src += "} else {\n";

        action.Else.stmts.forEach(function (stmt) {
            src += this.source(stmt) + ";\n";
        }, this);
    }

    src += "}";



    return src;
};

PHP.Compiler.prototype.Node_Stmt_ElseIf = function (action) {
    var src = "} else if ( (" + this.source(action.cond) + ")." + PHP.VM.Variable.prototype.CAST_BOOL + "." + this.VARIABLE_VALUE + ") {\n";

    action.stmts.forEach(function (stmt) {
        src += this.source(stmt) + ";\n";
    }, this);

    return src;
};


PHP.Compiler.prototype.Node_Stmt_Throw = function (action) {
    var src = "throw " + this.source(action.expr);
    return src;
};

PHP.Compiler.prototype.Node_Stmt_TryCatch = function (action) {
    var src = "try {\n";
    src += this.stmts(action.stmts) + "} catch( emAll ) {\n";
    src += this.CTX + this.EXCEPTION + '( emAll )';

    action.catches.forEach(function (Catch) {
        src += this.source(Catch);
    }, this);

    src += ";\n }";

    this.source(action.expr);
    return src;
};

PHP.Compiler.prototype.Node_Stmt_Catch = function (action) {
    var src = "." + this.CATCH + '( "' + action.variable + '", "' + action.Type.parts + '", ' + this.VARIABLE + ', function() {\n';
    src += this.stmts(action.stmts);
    src += "})";
    return src;

};

PHP.Compiler.prototype.Node_Stmt_ClassMethod = function (action) {



    this.INSIDE_METHOD = true;
    var src = "." + this.CLASS_METHOD + '( "' + action.name + '", ' + action.Type + ', [';
    var props = [];



    ((Array.isArray(action.params[0])) ? action.params[0] : action.params).forEach(function (prop) {


        var obj = '{name:"' + prop.name + '"';



        if (prop.def !== null) {
            obj += ", " + this.PROPERTY_DEFAULT + ": " + this.source(prop.def);
        }

        if (prop.Type !== null) {
            obj += ", " + this.PROPERTY_TYPE + ': "' + this.source(prop.Type) + '"';
        }

        if (prop.byRef === true) {
            obj += ", " + this.PARAM_BYREF + ': true';
        }

        obj += "}";

        props.push(obj);

    }, this);

    src += props.join(", ") + '], ' + action.byRef + ', function( ' + this.VARIABLE + ', ctx, $Static ) {\n';

    if (action.stmts !== null) {
        src += this.stmts(action.stmts);
    }

    src += '})\n';
    this.INSIDE_METHOD = false;
    return src;
};

PHP.Compiler.prototype.Node_Stmt_ClassConst = function (action) {
    var src = "";

    ((Array.isArray(action.consts[0])) ? action.consts[0] : action.consts).forEach(function (constant) {
        src += "." + this.CLASS_CONSTANT + '("' + constant.name + '", ' + this.source(constant.value) + ")\n";
    }, this);
    return src;

};

PHP.Compiler.prototype.Node_Stmt_Return = function (action) {
    return "return " + this.source(action.expr);

};
PHP.Compiler.prototype.Node_Scalar_String = function (action) {

    return this.CREATE_VARIABLE + '(' + this.fixString(action.value) + ')';

};

PHP.Compiler.prototype.Node_Scalar_Encapsed = function (action) {

    var parts = [],
        VARIABLE = PHP.VM.Variable.prototype;

    action.parts.forEach(function (part) {
        if (typeof part === "string") {
            parts.push(this.fixString(part));
        } else {



            parts.push(this.source((part[0] === undefined) ? part : part[0]) + "." + VARIABLE.CAST_STRING + "." + this.VARIABLE_VALUE);
        }
    }, this);

    var src = this.CREATE_VARIABLE + "(" + parts.join(" + ") + ")";
    return src;


};

PHP.Compiler.prototype.Node_Scalar_LNumber = function (action) {

    return this.CREATE_VARIABLE + '(' + action.value + ')';

};


PHP.Compiler.prototype.Node_Scalar_DNumber = function (action) {

    return this.CREATE_VARIABLE + '(' + action.value + ')';

};


PHP.Compiler.prototype.Node_Scalar_LNumber = function (action) {

    return this.CREATE_VARIABLE + '(' + action.value + ')';

};

PHP.Compiler.prototype.Node_Scalar_MethodConst = function (action) {

    return this.VARIABLE + '("$__METHOD__")';
};

PHP.Compiler.prototype.Node_Scalar_FuncConst = function (action) {

    return this.VARIABLE + '("$__FUNCTION__")';
};

PHP.Compiler.prototype.Node_Scalar_ClassConst = function (action) {

    return this.VARIABLE + '("$__CLASS__")';
};

PHP.Compiler.prototype.Node_Scalar_FileConst = function (action) {

    return this.VARIABLE + '("$__FILE__")';
    //   return this.CTX + PHP.Compiler.prototype.MAGIC_CONSTANTS + '("FILE")';

};

PHP.Compiler.prototype.Node_Scalar_LineConst = function (action) {
    return this.VARIABLE + '("$__LINE__")';
    //    return this.CTX + PHP.Compiler.prototype.MAGIC_CONSTANTS + '("LINE")';

};

PHP.Compiler.prototype.Node_Scalar_DirConst = function (action) {
    return this.VARIABLE + '("$__DIR__")';

};
/*
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 29.6.2012
 * @website http://hertzen.com
 */

PHP.Modules.prototype[PHP.Compiler.prototype.FUNCTION_HANDLER] = function (ENV, functionName, funcByRef) {
    var args = [null], // undefined context for bind
        COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        handler,
        staticHandler = {},
        $GLOBAL = this[COMPILER.GLOBAL],
        __FILE__ = "$__FILE__",
        staticVars = {}; // static variable storage

    ENV.FUNCTION_REFS[functionName] = funcByRef;

    // initializer
    args.push(function (args, values) {

        handler = PHP.VM.VariableHandler(ENV);
        var vals = Array.prototype.slice.call(values, 2);



        args.forEach(function (argObject, index) {
            var arg = handler(argObject[COMPILER.PARAM_NAME]);

            PHP.Utils.ArgumentHandler(ENV, arg, argObject, vals[index], index, functionName);

            // redefine item in arguments object, to be used by func_get_arg(s)

            if (argObject[COMPILER.PARAM_BYREF] === true) {
                values[index + 2] = arg;
            } else {
                values[index + 2] = new PHP.VM.Variable(arg[COMPILER.VARIABLE_VALUE]);
            }
        });

        handler("GLOBALS", $GLOBAL("GLOBALS"));

        // magic constants
        handler("$__FILE__")[COMPILER.VARIABLE_VALUE] = $GLOBAL(__FILE__)[COMPILER.VARIABLE_VALUE];

        handler("$__METHOD__")[COMPILER.VARIABLE_VALUE] = functionName;
        handler("$__FUNCTION__")[COMPILER.VARIABLE_VALUE] = functionName;


        // static handler, the messed up ordering of things is needed due to js execution order
        PHP.Utils.StaticHandler(staticHandler, staticVars, handler, ENV[COMPILER.GLOBAL]);




        return handler;
    });

    args.push(staticHandler);


    return args;

};

PHP.Modules.prototype[PHP.Compiler.prototype.FUNCTION] = function (functionName, args) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        func_num_args = "func_num_args",
        message = "():  Called from the global scope - no function context",
        func_get_arg = "func_get_arg",
        func_get_args = "func_get_args",
        ret,
        item = PHP.VM.Array.arrayItem;

    if (/^func_(get_args?|num_args)$/.test(functionName)) {
        if (args[2] instanceof PHP.VM) {
            this[PHP.Compiler.prototype.ERROR](functionName + message, PHP.Constants.E_CORE_WARNING, true);
            if (functionName === func_num_args) {
                return new PHP.VM.Variable(-1);
            } else {
                return new PHP.VM.Variable(false);
            }
        }

    }


    if (functionName === func_num_args) {


        return new PHP.VM.Variable(args.length - 2);

    } else if (functionName === func_get_arg) {

        if (!this[COMPILER.SIGNATURE](Array.prototype.slice.call(arguments, 2), func_get_arg, 1, [VARIABLE.INT])) {
            return new PHP.VM.Variable(false);
        }

        if (arguments[2][COMPILER.VARIABLE_VALUE] < 0) {
            this[PHP.Compiler.prototype.ERROR](func_get_arg + "():  The argument number should be >= 0", PHP.Constants.E_WARNING, true);
            return new PHP.VM.Variable(false);
        }


        if (args[arguments[2][COMPILER.VARIABLE_VALUE] + 2] === undefined) {
            this[PHP.Compiler.prototype.ERROR](func_get_arg + "():  Argument " + arguments[2][COMPILER.VARIABLE_VALUE] + " not passed to function", PHP.Constants.E_CORE_WARNING, true);
            return new PHP.VM.Variable(false);
        } else {
            return args[arguments[2][COMPILER.VARIABLE_VALUE] + 2];
        }

    } else if (functionName === func_get_args) {
        var props = [];

        Array.prototype.slice.call(args, 2).forEach(function (val, index) {

            props.push(item(index, val));
        });

        return this.array(props);
    } else if (typeof functionName === "function") {
        // anonymous lambda function
        ret = functionName.apply(this, Array.prototype.slice.call(arguments, 2));

    } else if (this[functionName] === undefined) {
        this[PHP.Compiler.prototype.ERROR]("Call to undefined function " + functionName + "()", PHP.Constants.E_ERROR, true);
    } else {
        ret = this[functionName].apply(this, Array.prototype.slice.call(arguments, 2));
    }

    PHP.Utils.CheckRef.call(this, ret, this.FUNCTION_REFS[functionName]);


    return ret;
};

PHP.Modules.prototype[PHP.Compiler.prototype.TYPE_CHECK] = function (variable, propertyType, propertyDefault, index, name) {

    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        classObj,
        typeInterface = false;

    classObj = variable[COMPILER.VARIABLE_VALUE];
    if (propertyDefault === undefined || (propertyDefault[VARIABLE.TYPE] !== VARIABLE.NULL || variable[VARIABLE.TYPE] !== VARIABLE.NULL)) {

        var argPassedTo = "Argument " + (index + 1) + " passed to " + name + "() must ",
            argGiven,
            variableType = variable[VARIABLE.TYPE],
            errorMsg;

        switch (variableType) {

            case VARIABLE.OBJECT:
                argGiven = ", instance of " + classObj[COMPILER.CLASS_NAME] + " given";
                break;

            case VARIABLE.INT:
                argGiven = ", integer given";
                break;

            case VARIABLE.NULL:
                argGiven = ", none given";
                break;

        }

        // check if we are looking for implement or instance
        // do a check if it exists before getting, so we don't trigger an __autoload
        if (this.$Class.Exists(propertyType) && this.$Class.Get(propertyType).prototype[COMPILER.CLASS_TYPE] === PHP.VM.Class.INTERFACE) {
            typeInterface = true;
        }


        switch (propertyType.toLowerCase()) {

            case "array":
                if (VARIABLE.ARRAY !== variableType) {
                    errorMsg = argPassedTo + "be of the type array" + argGiven;
                }
                break;

            default:
                // we are looking for an instance
                if (classObj === null) {
                    errorMsg = argPassedTo + "be an instance of " + propertyType + argGiven;
                } else if (!typeInterface && classObj[COMPILER.CLASS_NAME] !== propertyType) {
                    // not of same class type
                    errorMsg = argPassedTo + "be an instance of " + propertyType + argGiven;

                }

                // we are looking for an implementation of interface
                else if (typeInterface && classObj[PHP.VM.Class.INTERFACES].indexOf(propertyType) === -1) {
                    errorMsg = argPassedTo + "implement interface " + propertyType + argGiven;
                }

        }


        if (errorMsg !== undefined) {
            this[COMPILER.ERROR](errorMsg, PHP.Constants.E_RECOVERABLE_ERROR, false);
        }

    }



};

PHP.Modules.prototype[PHP.Compiler.prototype.SIGNATURE] = function (args, name, len, types) {
    var COMPILER = PHP.Compiler.prototype,
        $GLOBAL = this[COMPILER.GLOBAL],
        __FILE__ = "$__FILE__",
        VARIABLE = PHP.VM.Variable.prototype,
        typeStrings = {};

    typeStrings[VARIABLE.NULL] = "null";
    typeStrings[VARIABLE.BOOL] = "boolean";
    typeStrings[VARIABLE.INT] = "long";
    typeStrings[VARIABLE.FLOAT] = "float";
    typeStrings[VARIABLE.STRING] = "string";
    typeStrings[VARIABLE.ARRAY] = "array";
    typeStrings[VARIABLE.OBJECT] = "object";
    typeStrings[VARIABLE.RESOURCE] = "resource";

    if (len < 0 && args.length > -len) {
        len = -len;
        this[COMPILER.ERROR](name + "() expects at most " + len + " parameter" + ((len !== 1) ? "s" : "") + ", " + args.length + " given", PHP.Constants.E_WARNING, true);
        return false;
    } else if (args.length !== len && len >= 0) {

        this[COMPILER.ERROR](name + "() expects exactly " + len + " parameter" + ((len !== 1) ? "s" : "") + ", " + args.length + " given", PHP.Constants.E_WARNING, true);
        return false;
    } else {

        if (Array.isArray(types)) {
            var fail = false;
            types.forEach(function (type, paramIndex) {

                if (Array.isArray(type)) {

                    if (type.indexOf(args[paramIndex][VARIABLE.TYPE]) === -1) {
                        if (type.indexOf(VARIABLE.STRING) === -1 || (args[paramIndex][VARIABLE.CAST_STRING][VARIABLE.TYPE] !== VARIABLE.STRING)) {

                            this[COMPILER.ERROR](name + "() expects parameter " + (paramIndex + 1) + " to be " + typeStrings[type[0]] + ", " + typeStrings[args[paramIndex][VARIABLE.TYPE]] + " given in " +
                                $GLOBAL(__FILE__)[COMPILER.VARIABLE_VALUE] +
                                " on line " + 0, PHP.Constants.E_CORE_WARNING);
                            fail = true;
                        }
                    }

                } else {

                    if (args[paramIndex] !== undefined && type !== args[paramIndex][VARIABLE.TYPE] && type !== null) {

                        if (type === VARIABLE.INT && args[paramIndex][VARIABLE.TYPE] === VARIABLE.BOOL) {
                            return;
                        }


                        if (type !== VARIABLE.STRING || (typeof args[paramIndex][VARIABLE.CAST_STRING] !== "function")) {
                            this[COMPILER.ERROR](name + "() expects parameter " + (paramIndex + 1) + " to be " + typeStrings[type] + ", " + typeStrings[args[paramIndex][VARIABLE.TYPE]] + " given in " +
                                $GLOBAL(__FILE__)[COMPILER.VARIABLE_VALUE] +
                                " on line " + 0, PHP.Constants.E_CORE_WARNING);
                            fail = true;
                        }
                    }
                }



            }, this);
            if (fail === true) {
                return false;
            }

        }

        return true;
    }
};

(function (MODULES) {

    var COMPILER = PHP.Compiler.prototype,
        lastError,
        errorHandler,
        reportingLevel = 32767,
        shutdownFunc,
        shutdownParams,
        suppress = false;

    MODULES.$ErrorReset = function () {
        lastError = undefined;
        errorHandler = undefined;
        shutdownFunc = undefined;
        shutdownParams = undefined;
        suppress = false;
        reportingLevel = 32767; // E_ALL
    };

    MODULES.register_shutdown_function = function (func) {
        shutdownFunc = func;
        shutdownParams = Array.prototype.slice.call(arguments, 1);
    };

    MODULES.$shutdown = function () {

        this.$Class.Shutdown();

        if (shutdownFunc !== undefined) {
            this.call_user_func.apply(this, [shutdownFunc].concat(arguments));
        }
    };


    MODULES[COMPILER.SUPPRESS] = function (expr) {
        suppress = true;

        var result = expr();

        if (result === undefined) {
            result = new PHP.VM.Variable();
        }

        result[COMPILER.SUPPRESS] = true;

        suppress = false;
        return result;
    };

    MODULES[COMPILER.EXCEPTION] = function (variable) {

        var methods = {},
            VARIABLE = PHP.VM.Variable.prototype,
            caught = false;

        methods[COMPILER.CATCH] = function (name, type, $, func) {
            if (caught) return methods;
            if (variable[VARIABLE.TYPE] === VARIABLE.OBJECT) {

                var classObj = variable[COMPILER.VARIABLE_VALUE];

                if (this.$Class.Inherits(classObj, type) || classObj[PHP.VM.Class.INTERFACES].indexOf(type) !== -1) {
                    $(name, variable);
                    caught = true;
                    func();
                }
            } else if (variable instanceof PHP.Halt && /^Exception$/i.test(type)) {

                if (variable.catchable !== true) {

                    $(name, new(this.$Class.Get("Exception"))(this, new PHP.VM.Variable(variable.msg)));
                    caught = true;
                    func();
                } else {
                    throw variable;
                }
            }
            return methods;

        }.bind(this);

        return methods;
    };

    MODULES.error_get_last = function () {
        var item = PHP.VM.Array.arrayItem;

        return this.array([
            item("type", lastError.type),
            item("message", lastError.message),
            item("file", lastError.file),
            item("line", lastError.line)
        ]);

    };

    MODULES.error_reporting = function (level) {
        reportingLevel = level[COMPILER.VARIABLE_VALUE];
    };

    MODULES.set_error_handler = function (error_handler, error_types) {
        errorHandler = error_handler;
    };

    MODULES[COMPILER.ERROR] = function (msg, level, lineAppend, strict, catchable) {

        var C = PHP.Constants,
            $GLOBAL = this[COMPILER.GLOBAL],
            __FILE__ = "$__FILE__";
        lastError = {
            message: msg,
            line: 1,
            type: level,
            file: $GLOBAL(__FILE__)[COMPILER.VARIABLE_VALUE]
        };

        function checkType(type) {

            return ((reportingLevel & C[type]) === C[type]);
        }

        if (lineAppend === false) {
            lineAppend = ", called in " + $GLOBAL(__FILE__)[COMPILER.VARIABLE_VALUE] + " on line 1 and defined in " + $GLOBAL(__FILE__)[COMPILER.VARIABLE_VALUE] + " on line 1";
        } else if (lineAppend === true) {
            if (this.EVALING === true) {
                lineAppend = " in " + $GLOBAL(__FILE__)[COMPILER.VARIABLE_VALUE] + "(1) : eval()'d code on line 1";
            } else {
                lineAppend = " in " + $GLOBAL(__FILE__)[COMPILER.VARIABLE_VALUE] + " on line 1";
            }
        } else {
            lineAppend = "";
        }

        if (this.$ini.track_errors == 1 || this.$ini.track_errors == "On") {
            $GLOBAL("php_errormsg")[COMPILER.VARIABLE_VALUE] = msg;
        }


        if (reportingLevel !== 0) {
            if (suppress === false) {
                if (errorHandler !== undefined) {


                    this.call_user_func(
                        errorHandler,
                        new PHP.VM.Variable(level),
                        new PHP.VM.Variable(msg),
                        new PHP.VM.Variable($GLOBAL(__FILE__)[COMPILER.VARIABLE_VALUE]),
                        new PHP.VM.Variable(1),
                        this.array([])
                    );

                } else {
                    switch (level) {
                        case C.E_ERROR:
                            this[COMPILER.DISPLAY_HANDLER] = false;
                            throw new PHP.Halt(msg, level, lineAppend, catchable);
                        case C.E_RECOVERABLE_ERROR:
                            this[COMPILER.DISPLAY_HANDLER] = false;
                            //    this.$ob( "\nCatchable fatal error: " + msg + lineAppend + "\n");

                            throw new PHP.Halt(msg, level, lineAppend, catchable);
                            //   throw new PHP.Halt( level );

                        case C.E_WARNING:
                        case C.E_CORE_WARNING:
                        case C.E_COMPILE_WARNING:
                        case C.E_USER_WARNING:
                            if (this.$ini.display_errors != 0 && this.$ini.display_errors != "Off") {
                                this.echo(new PHP.VM.Variable("\nWarning: " + msg + lineAppend + "\n"));
                            }
                            return;
                        case C.E_PARSE:
                            this.echo(new PHP.VM.Variable("\nParse error: " + msg + lineAppend + "\n"));
                            return;
                        case C.E_CORE_NOTICE:
                        case C.E_NOTICE:
                            if (checkType("E_NOTICE")) {
                                this.echo(new PHP.VM.Variable("\nNotice: " + msg + lineAppend + "\n"));
                                return;
                            }
                            break;
                        case C.E_STRICT:
                            if (checkType("E_STRICT")) {
                                if (strict) {
                                    this.$strict += "Strict Standards: " + msg + lineAppend + "\n";
                                } else {
                                    this.echo(new PHP.VM.Variable("\nStrict Standards: " + msg + lineAppend + "\n"));
                                }
                            }
                            return;
                        case C.E_DEPRECATED:
                            if (checkType("E_DEPRECATED")) {
                                this.echo(new PHP.VM.Variable("\nDeprecated: " + msg + lineAppend + "\n"));
                                return;
                            }
                            break;
                        default:
                            this.echo(new PHP.VM.Variable("\nDefault Warning: " + msg + lineAppend + "\n"));
                            return;


                    }
                }
            }
        }

    };

})(PHP.Modules.prototype);






/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 26.6.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.array = function () {

    var arr;

    if (Array.isArray(arguments[0])) {
        arr = new(this.$Class.Get("ArrayObject"))(this, arguments[0]);
    } else {
        arr = new(this.$Class.Get("ArrayObject"))(this);
    }

    return new PHP.VM.Variable(arr);

};

PHP.Modules.prototype.array_key_exists = function (key, search) {

    var COMPILER = PHP.Compiler.prototype,
        VAR = PHP.VM.Variable.prototype;

    if (search[VAR.TYPE] === VAR.ARRAY) {
        var keys = search[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.KEYS][COMPILER.VARIABLE_VALUE];



        var index = -1,
            value = key[COMPILER.VARIABLE_VALUE];



        keys.some(function (item, i) {

            if (item instanceof PHP.VM.Variable) {
                item = item[COMPILER.VARIABLE_VALUE];
            }



            if (item === value) {
                index = i;
                return true;
            }

            return false;
        });

        return new PHP.VM.Variable((index !== -1));
    }

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 19.7.2012 
 * @website http://hertzen.com
 */




PHP.Modules.prototype.$array_merge = function () {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        ARRAY = PHP.VM.Array.prototype,
        CLASS_PROPERTY = PHP.VM.Class.PROPERTY;

    var array = this.array([]);

    var value = array[COMPILER.VARIABLE_VALUE][CLASS_PROPERTY + ARRAY.VALUES][COMPILER.VARIABLE_VALUE].pop(),
        key = array[COMPILER.VARIABLE_VALUE][CLASS_PROPERTY + ARRAY.KEYS][COMPILER.VARIABLE_VALUE].pop();


    return array;

};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 14.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.array_pop = function (array) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        ARRAY = PHP.VM.Array.prototype,
        CLASS_PROPERTY = PHP.VM.Class.PROPERTY;


    var value = array[COMPILER.VARIABLE_VALUE][CLASS_PROPERTY + ARRAY.VALUES][COMPILER.VARIABLE_VALUE].pop(),
        key = array[COMPILER.VARIABLE_VALUE][CLASS_PROPERTY + ARRAY.KEYS][COMPILER.VARIABLE_VALUE].pop();

    this.reset(array);

    return value;

};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 14.7.2012 
 * @website http://hertzen.com
 */

PHP.Modules.prototype.array_push = function (array) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;

    array[COMPILER.VARIABLE_VALUE][COMPILER.METHOD_CALL](this, "append", arguments[1]);
};


/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 17.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.array_search = function (needle, haystack, strict) {

    var COMPILER = PHP.Compiler.prototype,
        VAR = PHP.VM.Variable.prototype;

    if (haystack[VAR.TYPE] === VAR.ARRAY) {
        var values = haystack[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.VALUES][COMPILER.VARIABLE_VALUE],
            keys = haystack[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.KEYS][COMPILER.VARIABLE_VALUE];



        var index = -1,
            value = needle[COMPILER.VARIABLE_VALUE];



        values.some(function (item, i) {

            if (item instanceof PHP.VM.Variable) {
                item = item[COMPILER.VARIABLE_VALUE];
            }



            if (item === value) {
                index = i;
                return true;
            }

            return false;
        });

        if (index !== -1) {
            return new PHP.VM.Variable(keys[index]);
        }

        return new PHP.VM.Variable(false);
    }

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 16.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.array_shift = function (array) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        ARRAY = PHP.VM.Array.prototype,
        CLASS_PROPERTY = PHP.VM.Class.PROPERTY;


    if (array[VARIABLE.VARIABLE_TYPE] === VARIABLE.FUNCTION) {
        this.ENV[COMPILER.ERROR]("Only variables should be passed by reference", PHP.Constants.E_STRICT, true);

    }


    var value = array[COMPILER.VARIABLE_VALUE][CLASS_PROPERTY + ARRAY.VALUES][COMPILER.VARIABLE_VALUE].shift(),
        key = array[COMPILER.VARIABLE_VALUE][CLASS_PROPERTY + ARRAY.KEYS][COMPILER.VARIABLE_VALUE].shift();

    this.reset(array);


    // key remapper    
    array[COMPILER.VARIABLE_VALUE][PHP.VM.Class.METHOD + "remap"]();


    return value;

};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 16.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.array_unshift = function (array) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        ARRAY = PHP.VM.Array.prototype,
        CLASS_PROPERTY = PHP.VM.Class.PROPERTY;

    var items = Array.prototype.slice.call(arguments, 1),
        vals = [],
        lastIndex,
        keys = [];
    items.forEach(function (item, index) {
        if (item[VARIABLE.IS_REF]) {
            vals.push(item);
        } else {
            vals.push(new PHP.VM.Variable(item[COMPILER.VARIABLE_VALUE]));
        }
        keys.push(index);
        lastIndex = index;
    });
    lastIndex++;
    var value = Array.prototype.unshift.apply(array[COMPILER.VARIABLE_VALUE][CLASS_PROPERTY + ARRAY.VALUES][COMPILER.VARIABLE_VALUE], vals);

    // remap keys
    array[COMPILER.VARIABLE_VALUE][CLASS_PROPERTY + ARRAY.KEYS][COMPILER.VARIABLE_VALUE].forEach(function (key, index) {
        // todo take into account other type of keys
        if (typeof key === "number" && key % 1 === 0) {
            array[COMPILER.VARIABLE_VALUE][CLASS_PROPERTY + ARRAY.KEYS][COMPILER.VARIABLE_VALUE][index] = key + lastIndex;
        }
    });

    Array.prototype.unshift.apply(array[COMPILER.VARIABLE_VALUE][CLASS_PROPERTY + ARRAY.KEYS][COMPILER.VARIABLE_VALUE], keys);
    array[COMPILER.VARIABLE_VALUE][CLASS_PROPERTY + ARRAY.POINTER][COMPILER.VARIABLE_VALUE] -= vals.length;

    return new PHP.VM.Variable(value.length);

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 29.6.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.count = function (variable) {

    var COMPILER = PHP.Compiler.prototype,
        VAR = PHP.VM.Variable.prototype;

    if (variable[VAR.TYPE] === VAR.ARRAY) {
        var values = variable[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.VALUES][COMPILER.VARIABLE_VALUE];

        return new PHP.VM.Variable(values.length);
    }

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 10.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.current = function (array) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        ARRAY = PHP.VM.Array.prototype;



    if (array[VARIABLE.TYPE] === VARIABLE.ARRAY) {
        var pointer = array[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.POINTER],
            values = array[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.VALUES][COMPILER.VARIABLE_VALUE];

        if (pointer[COMPILER.VARIABLE_VALUE] >= values.length) {
            return new PHP.VM.Variable(false);
        } else {
            return new PHP.VM.Variable(values[pointer[COMPILER.VARIABLE_VALUE]]);
        }


    }


};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 10.7.2012 
 * @website http://hertzen.com
 */



PHP.Modules.prototype.each = function (array) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        ARRAY = PHP.VM.Array.prototype,
        item = PHP.VM.Array.arrayItem;

    if (array[VARIABLE.TYPE] === VARIABLE.ARRAY) {

        var pointer = array[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.POINTER],
            values = array[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.VALUES][COMPILER.VARIABLE_VALUE];

        if (pointer[COMPILER.VARIABLE_VALUE] >= values.length) {
            return new PHP.VM.Variable(false);
        }

        var value = this.current(array),
            key = this.key(array);

        this.next(array);

        return this.array([item(0, key), item(1, value)]);


    }


};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 2.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.is_array = function (variable) {

    var COMPILER = PHP.Compiler.prototype,
        VAR = PHP.VM.Variable.prototype;


    return new PHP.VM.Variable((variable[VAR.TYPE] === VAR.ARRAY));


};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 12.7.2012 
 * @website http://hertzen.com
 */



PHP.Modules.prototype.key = function (array) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        ARRAY = PHP.VM.Array.prototype;



    if (array[VARIABLE.TYPE] === VARIABLE.ARRAY) {
        var pointer = array[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.POINTER],
            keys = array[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.KEYS][COMPILER.VARIABLE_VALUE];

        if (pointer[COMPILER.VARIABLE_VALUE] >= keys.length) {
            return new PHP.VM.Variable(false);
        } else {
            return new PHP.VM.Variable(keys[pointer[COMPILER.VARIABLE_VALUE]]);
        }


    }


};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 10.7.2012 
 * @website http://hertzen.com
 */




PHP.Modules.prototype.list = function () {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        ARRAY = PHP.VM.Array.prototype,
        array = Array.prototype.pop.call(arguments);

    if (array[VARIABLE.TYPE] === VARIABLE.ARRAY) {
        var pointer = array[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.POINTER],
            values = array[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.VALUES][COMPILER.VARIABLE_VALUE];

        Array.prototype.slice.call(arguments, 0).forEach(function (variable, index) {
            if (variable instanceof PHP.VM.Variable) {
                if (values[index] !== undefined) {
                    variable[COMPILER.VARIABLE_VALUE] = values[index][COMPILER.VARIABLE_VALUE];
                } else {
                    this.ENV[COMPILER.ERROR]("Undefined offset: " + index, PHP.Constants.E_NOTICE, true);
                    variable[COMPILER.VARIABLE_VALUE] = new PHP.VM.Variable();
                }
            } else if (Array.isArray(variable)) {
                this.list.apply(this, variable.concat(values[index]));
            }
        }, this);


        return array;



    }

    // fill with null
    Array.prototype.slice.call(arguments, 0).forEach(function (variable) {
        if (variable instanceof PHP.VM.Variable) {
            variable[COMPILER.VARIABLE_VALUE] = (new PHP.VM.Variable())[COMPILER.VARIABLE_VALUE];
        }
    });

    return new PHP.VM.Variable(false);


};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 12.7.2012 
 * @website http://hertzen.com
 */

PHP.Modules.prototype.next = function (array) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        ARRAY = PHP.VM.Array.prototype;



    if (array[VARIABLE.TYPE] === VARIABLE.ARRAY) {
        var pointer = array[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.POINTER],
            values = array[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.VALUES][COMPILER.VARIABLE_VALUE];
        pointer[COMPILER.VARIABLE_VALUE]++; // advance pointer

        if (pointer[COMPILER.VARIABLE_VALUE] >= values.length) {
            return new PHP.VM.Variable(false);
        } else {

            return new PHP.VM.Variable(values[pointer[COMPILER.VARIABLE_VALUE]]);
        }


    }


};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 10.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.reset = function (array) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        ARRAY = PHP.VM.Array.prototype;



    if (array[VARIABLE.TYPE] === VARIABLE.ARRAY) {
        var pointer = array[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.POINTER],
            values = array[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.VALUES][COMPILER.VARIABLE_VALUE];

        pointer[COMPILER.VARIABLE_VALUE] = 0;

        if (values.length === 0) {
            return new PHP.VM.Variable(false);
        } else {
            return values[0];
        }
    }


};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 11.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.class_exists = function (class_name, autoload) {
    var COMPILER = PHP.Compiler.prototype;

    if ((autoload === undefined || autoload[COMPILER.VARIABLE_VALUE] === true) && !this.$Class.Exists(class_name[COMPILER.VARIABLE_VALUE])) {
        return new PHP.VM.Variable(this.$Class.__autoload(class_name[COMPILER.VARIABLE_VALUE]));
    }

    return new PHP.VM.Variable(this.$Class.Exists(class_name[COMPILER.VARIABLE_VALUE]));

};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 9.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.get_class = function (object) {
    var COMPILER = PHP.Compiler.prototype;

    if (object instanceof PHP.VM.Variable) {
        return new PHP.VM.Variable(object[COMPILER.VARIABLE_VALUE][COMPILER.CLASS_NAME]);
    } else {
        return new PHP.VM.Variable(object[COMPILER.CLASS_NAME]);
    }


};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 17.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.get_declared_classes = function () {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        item = PHP.VM.Array.arrayItem;

    var items = [];
    this.$Class.DeclaredClasses().forEach(function (name, index) {
        items.push(item(index, name));
    });

    return this.array(items);

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 12.7.2012 
 * @website http://hertzen.com
 */




PHP.Modules.prototype.get_class_methods = function (object) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;

    var prefix = PHP.VM.Class.METHOD,
        items = [],
        classObj,
        index = 0;

    if (object[VARIABLE.TYPE] === VARIABLE.STRING) {
        classObj = this.$Class.Get(object[COMPILER.VARIABLE_VALUE]).prototype;
    } else if (object[VARIABLE.TYPE] === VARIABLE.OBJECT) {
        classObj = object[COMPILER.VARIABLE_VALUE];
    }
    var item = PHP.VM.Array.arrayItem;



    for (var key in classObj) {
        if (key.substring(0, prefix.length) === prefix) {
            var name = key.substring(prefix.length);


            items.push(item(index++, classObj[PHP.VM.Class.METHOD_REALNAME + name]));
        }
    }

    return this.array(items);


};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 13.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.get_parent_class = function (object) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        classObj,
        parent;

    if (object[VARIABLE.TYPE] === VARIABLE.STRING) {
        classObj = this.$Class.Get(object[COMPILER.VARIABLE_VALUE]).prototype;
    } else {
        classObj = Object.getPrototypeOf(object[COMPILER.VARIABLE_VALUE]);
    }

    if ((parent = Object.getPrototypeOf(classObj)[COMPILER.CLASS_NAME]) === undefined) {
        return new PHP.VM.Variable(false);
    } else {
        return new PHP.VM.Variable(parent);
    }

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 11.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.interface_exists = function (class_name, autoload) {
    var COMPILER = PHP.Compiler.prototype;

    if ((autoload === undefined || autoload[COMPILER.VARIABLE_VALUE] === true) && !this.$Class.Exists(class_name[COMPILER.VARIABLE_VALUE])) {
        return new PHP.VM.Variable(this.$Class.__autoload(class_name[COMPILER.VARIABLE_VALUE]));
    }

    return new PHP.VM.Variable(this.$Class.Exists(class_name[COMPILER.VARIABLE_VALUE]));

};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 13.7.2012 
 * @website http://hertzen.com
 */




PHP.Modules.prototype.is_subclass_of = function (object, classNameObj) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        classObj,
        parent,
        className = classNameObj[COMPILER.VARIABLE_VALUE];

    if (object[VARIABLE.TYPE] === VARIABLE.STRING) {
        classObj = this.$Class.Get(object[COMPILER.VARIABLE_VALUE]).prototype;
    } else {
        classObj = Object.getPrototypeOf(object[COMPILER.VARIABLE_VALUE]);
    }


    while ((parent = Object.getPrototypeOf(classObj)[COMPILER.CLASS_NAME]) !== undefined && parent !== className) {

    }

    if (parent === undefined) {
        return new PHP.VM.Variable(false);
    } else {
        return new PHP.VM.Variable(true);
    }

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 11.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.method_exists = function (object, method) {
    var VARIABLE = PHP.VM.Variable.prototype,
        COMPILER = PHP.Compiler.prototype;

    if (object instanceof PHP.VM.Variable && object[VARIABLE.TYPE] === VARIABLE.STRING) {
        object = this.$Class.Get(object[COMPILER.VARIABLE_VALUE]).prototype;
    }

    if (object instanceof PHP.VM.Variable) {
        if (object[VARIABLE.TYPE] === VARIABLE.STRING) {
            object = this.$Class.Get(object[COMPILER.VARIABLE_VALUE]).prototype;
        }

        return new PHP.VM.Variable((object[COMPILER.VARIABLE_VALUE][PHP.VM.Class.METHOD + method[COMPILER.VARIABLE_VALUE].toLowerCase()]) !== undefined);
    } else {
        return new PHP.VM.Variable((object[PHP.VM.Class.METHOD + method[COMPILER.VARIABLE_VALUE].toLowerCase()]) !== undefined);
    }

};
PHP.Modules.prototype.$foreachInit = function (expr, ctx) {

    var COMPILER = PHP.Compiler.prototype,
        VAR = PHP.VM.Variable.prototype,
        ARRAY = PHP.VM.Array.prototype;

    var itm = expr[COMPILER.VARIABLE_VALUE]; // trigger get

    if (expr[VAR.TYPE] === VAR.ARRAY) {
        var pointer = itm[PHP.VM.Class.PROPERTY + ARRAY.POINTER];
        pointer[COMPILER.VARIABLE_VALUE] = 0;

        return {
            len: itm[PHP.VM.Class.PROPERTY + ARRAY.VALUES][COMPILER.VARIABLE_VALUE].length,
            expr: expr,
            clone: itm[COMPILER.METHOD_CALL](this, COMPILER.ARRAY_CLONE)
        };

    } else if (expr[VAR.TYPE] === VAR.OBJECT) {
        var objectValue = itm;


        // iteratorAggregate implemented objects

        if (objectValue[PHP.VM.Class.INTERFACES].indexOf("Traversable") !== -1) {

            var iterator = objectValue;

            try {
                while ((iterator instanceof PHP.VM.ClassPrototype) && iterator[PHP.VM.Class.INTERFACES].indexOf("Iterator") === -1) {
                    iterator = iterator[COMPILER.METHOD_CALL](this, "getIterator")[COMPILER.VARIABLE_VALUE];
                }
            } catch (e) {

            }
            if (!(iterator instanceof PHP.VM.ClassPrototype) || iterator[PHP.VM.Class.INTERFACES].indexOf("Iterator") === -1) {
                this[COMPILER.ERROR]("Objects returned by " + objectValue[COMPILER.CLASS_NAME] + "::getIterator() must be traversable or implement interface Iterator", PHP.Constants.E_ERROR, true);
                return;
            }

            iterator[COMPILER.METHOD_CALL](this, "rewind");

            return {
                expr: expr,
                Class: iterator
            };
        } else {
            //  members in object

            var classProperty = PHP.VM.Class.PROPERTY;

            return {
                expr: expr,
                pointer: 0,
                keys: (function (objectValue) {
                    var items = [],

                        needReorder = false;
                    for (var key in objectValue) {

                        if (key.substring(0, classProperty.length) === classProperty) {

                            var name = key.substring(classProperty.length);

                            if (PHP.Utils.Visible.call(this, name, objectValue, ctx)) {
                                items.push(name);
                            }

                        }

                        if (((objectValue[PHP.VM.Class.PROPERTY_TYPE + name] & PHP.VM.Class.PUBLIC) === PHP.VM.Class.PUBLIC) || objectValue[PHP.VM.Class.PROPERTY_TYPE + name] === undefined) {


                        } else {
                            needReorder = true;
                        }
                    }
                    if (needReorder) {
                        items.sort();
                    }

                    return items;
                }.bind(this))(objectValue)

            };

        }
    } else {
        this[COMPILER.ERROR]("Invalid argument supplied for foreach()", PHP.Constants.E_CORE_WARNING, true);

    }

};

PHP.Modules.prototype.$foreachEnd = function (iterator) {

    var COMPILER = PHP.Compiler.prototype;

    // destruct iterator
    if (iterator !== undefined && iterator.Class !== undefined) {
        iterator.Class[COMPILER.CLASS_DESTRUCT]();
    }

};

PHP.Modules.prototype.foreach = function (iterator, byRef, value, key) {

    var COMPILER = PHP.Compiler.prototype,
        VAR = PHP.VM.Variable.prototype,
        ARRAY = PHP.VM.Array.prototype,
        expr;

    if (iterator === undefined || iterator.expr === undefined) {
        return false;
    }
    expr = iterator.expr;

    if (iterator.count === undefined) {
        iterator.count = 0;
    }

    if (expr[VAR.TYPE] === VAR.ARRAY) {
        var clonedValues = iterator.clone[PHP.VM.Class.PROPERTY + ARRAY.VALUES][COMPILER.VARIABLE_VALUE],
            clonedKeys = iterator.clone[PHP.VM.Class.PROPERTY + ARRAY.KEYS][COMPILER.VARIABLE_VALUE],
            origValues = expr[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.VALUES][COMPILER.VARIABLE_VALUE],
            origKeys = expr[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.KEYS][COMPILER.VARIABLE_VALUE],
            len = (byRef === true || iterator.expr[VAR.IS_REF] === true) ? origValues.length : iterator.len,
            pointer = ((byRef === true || iterator.expr[VAR.IS_REF] === true) ? expr[COMPILER.VARIABLE_VALUE] : iterator.clone)[PHP.VM.Class.PROPERTY + ARRAY.POINTER];

        var compareTo = (byRef === true || iterator.expr[VAR.IS_REF] === true) ? origValues : clonedValues,
            result;

        var index, lowerLoop = function (index) {
            while (compareTo[--index] === undefined && index > 0) {}
            return index;
        };

        if (iterator.breakNext === true) {
            return false;
        }

        if (pointer[COMPILER.VARIABLE_VALUE] !== iterator.count) {
            if (iterator.last !== undefined && iterator.last !== compareTo[pointer[COMPILER.VARIABLE_VALUE]]) {
                index = pointer[COMPILER.VARIABLE_VALUE];
            } else if (compareTo[iterator.count] !== undefined) {
                index = iterator.count;
            } else if (compareTo[pointer[COMPILER.VARIABLE_VALUE]] !== undefined) {
                index = pointer[COMPILER.VARIABLE_VALUE];
            } else {
                index = lowerLoop(pointer[COMPILER.VARIABLE_VALUE]);
            }

        } else if (compareTo[iterator.count] !== undefined) {
            index = iterator.count;
        } else {
            index = lowerLoop(pointer[COMPILER.VARIABLE_VALUE]);
        }


        if (byRef === true || iterator.expr[VAR.IS_REF] === true) {
            result = (origValues[pointer[COMPILER.VARIABLE_VALUE]] !== undefined && (iterator.count <= origValues.length || iterator.diff || iterator.first !== origValues[0]));

        } else {
            result = (clonedValues[iterator.count] !== undefined);
        }



        iterator.first = origValues[0];
        iterator.last = compareTo[index];
        iterator.diff = (iterator.count === origValues.length);


        if (result === true) {




            if (byRef === true || iterator.expr[VAR.IS_REF] === true) {
                value[VAR.REF](origValues[index]);
            } else {
                value[COMPILER.VARIABLE_VALUE] = clonedValues[iterator.count][COMPILER.VARIABLE_VALUE];
            }
            if (key instanceof PHP.VM.Variable) {
                if (byRef === true || iterator.expr[VAR.IS_REF] === true) {
                    key[COMPILER.VARIABLE_VALUE] = origKeys[index];
                } else {
                    key[COMPILER.VARIABLE_VALUE] = clonedKeys[index];
                }

            }
            /*
            if (!byRef && iterator.expr[ VAR.IS_REF ] !== true ) {
                iterator.expr[ COMPILER.VARIABLE_VALUE ][ PHP.VM.Class.PROPERTY + ARRAY.POINTER][ COMPILER.VARIABLE_VALUE ]++;
            }*/
            iterator.prev = origValues[index];
            iterator.count++;

            expr[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.POINTER][COMPILER.VARIABLE_VALUE]++;
            iterator.clone[PHP.VM.Class.PROPERTY + ARRAY.POINTER][COMPILER.VARIABLE_VALUE]++;
            if ((byRef === true || iterator.expr[VAR.IS_REF] === true) && expr[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.POINTER][COMPILER.VARIABLE_VALUE] >= origValues.length) {

                iterator.breakNext = true;
            }

            // pointer[ COMPILER.VARIABLE_VALUE ]++;

        }

        return result;




    } else if (expr[VAR.TYPE] === VAR.OBJECT) {
        var objectValue = expr[COMPILER.VARIABLE_VALUE];


        // iteratorAggregate implemented objects
        if (objectValue[PHP.VM.Class.INTERFACES].indexOf("Traversable") !== -1) {

            if (byRef === true) {
                this.ENV[PHP.Compiler.prototype.ERROR]("An iterator cannot be used with foreach by reference", PHP.Constants.E_ERROR, true);
            }


            if (iterator.first === undefined) {
                iterator.first = true;
            } else {
                if (iterator.Class[COMPILER.METHOD_CALL](this, "next")[VAR.DEFINED] !== true) {
                    this.ENV[PHP.Compiler.prototype.ERROR]("Undefined offset: 3", PHP.Constants.E_NOTICE, true);
                }
            }

            var result = iterator.Class[COMPILER.METHOD_CALL](this, "valid")[VAR.CAST_BOOL][COMPILER.VARIABLE_VALUE];

            if (result === true) {

                value[COMPILER.VARIABLE_VALUE] = iterator.Class[COMPILER.METHOD_CALL](this, "current")[COMPILER.VARIABLE_VALUE];

                if (key instanceof PHP.VM.Variable) {
                    key[COMPILER.VARIABLE_VALUE] = iterator.Class[COMPILER.METHOD_CALL](this, "key")[COMPILER.VARIABLE_VALUE];
                }
            }

            return result;

        } else {
            // loop through public members



            if (iterator.pointer < iterator.keys.length) {

                value[COMPILER.VARIABLE_VALUE] = objectValue[PHP.VM.Class.PROPERTY + iterator.keys[iterator.pointer]];

                if (key instanceof PHP.VM.Variable) {
                    key[COMPILER.VARIABLE_VALUE] = iterator.keys[iterator.pointer];
                }
                iterator.pointer++;
                return true;
            }
            return false;
        }
    } else {
        this[COMPILER.ERROR]("Invalid argument supplied for foreach()", PHP.Constants.E_CORE_WARNING, true);
        return false;
    }
};
PHP.Modules.prototype.$include = function ($, $Static, file) {

    var COMPILER = PHP.Compiler.prototype,
        filename = file[COMPILER.VARIABLE_VALUE];

    // this[COMPILER.FILE_PATH] = this[COMPILER.FILE_PATH] || PHP.PATH;

    // var path = this[COMPILER.FILE_PATH];
    let path = PHP.PATH;
    // var loaded_file = (/^(.:|\/)/.test(filename)) ? filename : path + "/" + filename;
    let loaded_file = resolve(path, filename);

    var $this = this;
    this.$Included.Include(loaded_file);
    try {
        var source = this[COMPILER.FILESYSTEM].readFileSync(loaded_file);
    } catch (e) {

        $this.ENV[COMPILER.ERROR]("include(" + filename + "): failed to open stream: No such file or directory", PHP.Constants.E_CORE_WARNING, true);
        $this.ENV[COMPILER.ERROR]("include(): Failed opening '" + filename + "' for inclusion (include_path='" + path + "')", PHP.Constants.E_CORE_WARNING, true);
    }

    var COMPILER = PHP.Compiler.prototype;

    // tokenizer
    var tokens = new PHP.Lexer(source);

    // build ast tree

    var AST = new PHP.Parser(tokens);

    // compile tree into JS
    var compiler = new PHP.Compiler(AST);

    // execture code in current context ($)
    var exec = new Function("$$", "$", "ENV", "$Static", compiler.src);

    // this[COMPILER.FILE_PATH] = PHP.Utils.Path(loaded_file);
    PHP.PATH = PHP.Utils.Path(loaded_file);

    exec.call(this, function (arg) {
        return new PHP.VM.Variable(arg);
    }, $, this, $Static);

    PHP.PATH = path;

    /**
     * 
     * @param {string} path 
     * @param {string} filename 
     */
    function resolve(path, filename) {
        const REGEX_back = /^(\.\.\/)/;
        const REGEX_current = /^(\.\/)/;
        const REGEX_root = /^(\/)+/;

        path = path.slice(-1) === '/' ? path.slice(0, -1) : path;

        if (REGEX_root.test(filename)) {
            return filename.replace(REGEX_root, '/');
        } else if (REGEX_current.test(filename)) {
            return resolve(path, filename.replace(REGEX_current, ''));
        } else if (REGEX_back.test(filename)) {
            path = path.substring(0, path.lastIndexOf('/'));
            filename = filename.replace(REGEX_back, '');
            return resolve(path, filename);
        } else {
            return path + '/' + filename;
        }
    }
};


PHP.Modules.prototype.include = function () {
    this.$include.apply(this, arguments);
};
PHP.Modules.prototype.include_once = function ($, $Static, file) {

    var COMPILER = PHP.Compiler.prototype,
        filename = file[COMPILER.VARIABLE_VALUE];


    var path = this[COMPILER.FILE_PATH];


    var loaded_file = (/^(.:|\/)/.test(filename)) ? filename : path + "/" + filename;

    if (!this.$Included.Included(loaded_file)) {
        this.$include.apply(this, arguments);
    }

};
PHP.Modules.prototype.require = function () {
    this.$include.apply(this, arguments);
};
PHP.Modules.prototype.require_once = function ($, $Static, file) {

    var COMPILER = PHP.Compiler.prototype,
        filename = file[COMPILER.VARIABLE_VALUE];


    var path = this[COMPILER.FILE_PATH];


    var loaded_file = (/^(.:|\/)/.test(filename)) ? filename : path + "/" + filename;

    if (!this.$Included.Included(loaded_file)) {
        this.$include.apply(this, arguments);
    }

};
/* Automatically built from PHP version: 5.4.0-ZS5.6.0 */
PHP.Constants.DATE_ATOM = "Y-m-d\\TH:i:sP";
PHP.Constants.DATE_COOKIE = "l, d-M-y H:i:s T";
PHP.Constants.DATE_ISO8601 = "Y-m-d\\TH:i:sO";
PHP.Constants.DATE_RFC822 = "D, d M y H:i:s O";
PHP.Constants.DATE_RFC850 = "l, d-M-y H:i:s T";
PHP.Constants.DATE_RFC1036 = "D, d M y H:i:s O";
PHP.Constants.DATE_RFC1123 = "D, d M Y H:i:s O";
PHP.Constants.DATE_RFC2822 = "D, d M Y H:i:s O";
PHP.Constants.DATE_RFC3339 = "Y-m-d\\TH:i:sP";
PHP.Constants.DATE_RSS = "D, d M Y H:i:s O";
PHP.Constants.DATE_W3C = "Y-m-d\\TH:i:sP";
PHP.Constants.SUNFUNCS_RET_TIMESTAMP = 0;
PHP.Constants.SUNFUNCS_RET_STRING = 1;
PHP.Constants.SUNFUNCS_RET_DOUBLE = 2;

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 20.7.2012 
 * @website http://hertzen.com
 */

PHP.Modules.prototype.date_default_timezone_set = function () {
    // todo add functionality
    return new PHP.VM.Variable(true);
};



/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 3.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.mktime = function (hour, minute, second, month, day, year, is_dst) {

    var date = new Date(),
        COMPILER = PHP.Compiler.prototype;

    hour = (hour === undefined) ? date.getHours() : hour[COMPILER.VARIABLE_VALUE];
    minute = (minute === undefined) ? date.getMinutes() : minute[COMPILER.VARIABLE_VALUE];
    second = (second === undefined) ? date.getSeconds() : second[COMPILER.VARIABLE_VALUE];
    month = (month === undefined) ? date.getMonth() : month[COMPILER.VARIABLE_VALUE];
    day = (day === undefined) ? date.getDay() : day[COMPILER.VARIABLE_VALUE];
    year = (year === undefined) ? date.getFullYear() : year[COMPILER.VARIABLE_VALUE];


    var createDate = new Date(year, month, day, hour, minute, second);


    return new PHP.VM.Variable(Math.round(createDate.getTime() / 1000));
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 3.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.time = function () {

    return new PHP.VM.Variable(Math.round(Date.now() / 1000));
};


/* Automatically built from PHP version: 5.4.0-ZS5.6.0 */
PHP.Constants.E_ERROR = 1;
PHP.Constants.E_RECOVERABLE_ERROR = 4096;
PHP.Constants.E_WARNING = 2;
PHP.Constants.E_PARSE = 4;
PHP.Constants.E_NOTICE = 8;
PHP.Constants.E_STRICT = 2048;
PHP.Constants.E_DEPRECATED = 8192;
PHP.Constants.E_CORE_ERROR = 16;
PHP.Constants.E_CORE_WARNING = 32;
PHP.Constants.E_COMPILE_ERROR = 64;
PHP.Constants.E_COMPILE_WARNING = 128;
PHP.Constants.E_USER_ERROR = 256;
PHP.Constants.E_USER_WARNING = 512;
PHP.Constants.E_USER_NOTICE = 1024;
PHP.Constants.E_USER_DEPRECATED = 16384;
PHP.Constants.E_ALL = 32767;

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 26.6.2012 
 * @website http://hertzen.com
 */

PHP.Modules.prototype.trigger_error = function (msg, level) {
    this[PHP.Compiler.prototype.ERROR](msg.$, (level !== undefined) ? level.$ : PHP.Constants.E_USER_NOTICE, true);
    //   throw new Error( "Fatal error: " + msg.$ );

};
/* Automatically built from PHP version: 5.4.0-ZS5.6.0 */
PHP.Constants.UPLOAD_ERR_OK = 0;
PHP.Constants.UPLOAD_ERR_INI_SIZE = 1;
PHP.Constants.UPLOAD_ERR_FORM_SIZE = 2;
PHP.Constants.UPLOAD_ERR_PARTIAL = 3;
PHP.Constants.UPLOAD_ERR_NO_FILE = 4;
PHP.Constants.UPLOAD_ERR_NO_TMP_DIR = 6;
PHP.Constants.UPLOAD_ERR_CANT_WRITE = 7;
PHP.Constants.UPLOAD_ERR_EXTENSION = 8;

PHP.Modules.prototype.dirname = function (path) {
    var COMPILER = PHP.Compiler.prototype,
        dir = PHP.Utils.Path(path[COMPILER.VARIABLE_VALUE])
    return new PHP.VM.Variable(dir);
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 30.6.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.fclose = function (fp) {

    return new PHP.VM.Variable(true);
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 18.7.2012 
 * @website http://hertzen.com
 */



PHP.Modules.prototype.file_get_contents = function (filenameObj) {
    var COMPILER = PHP.Compiler.prototype,
        filename = filenameObj[COMPILER.VARIABLE_VALUE];

    if (filename === "php://input") {
        return new PHP.VM.Variable(this.INPUT_BUFFER);
    } else {

        try {
            if (PHP.Adapters.XHRFileSystem !== undefined) {
                return new PHP.VM.Variable(this[COMPILER.FILESYSTEM].readFileSync(filename, true));
            } else {
                return new PHP.VM.Variable(this[COMPILER.FILESYSTEM].readFileSync(filename).toString());
            }
        } catch (e) {
            this.ENV[COMPILER.ERROR]("file_get_contents(" + filename + "): failed to open stream: No such file or directory", PHP.Constants.E_WARNING, true);
            return new PHP.VM.Variable(false);
        }
    }

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 29.6.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.fopen = function (filenameObj) {
    var COMPILER = PHP.Compiler.prototype,
        filename = filenameObj[COMPILER.VARIABLE_VALUE];

    this.ENV[COMPILER.ERROR]("fopen(" + filename + "): failed to open stream: No such file or directory", PHP.Constants.E_WARNING, true);

    return new PHP.VM.Variable(new PHP.VM.Resource());
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 18.7.2012 
 * @website http://hertzen.com
 */



PHP.Modules.prototype.is_uploaded_file = function (filenameObj) {
    var COMPILER = PHP.Compiler.prototype,
        filename = filenameObj[COMPILER.VARIABLE_VALUE];

    // todo add check to see it is an uploaded file
    try {
        var stats = this[COMPILER.FILESYSTEM].lstatSync(filename);
    } catch (e) {
        return new PHP.VM.Variable(false);
    }


    return new PHP.VM.Variable(true);
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 18.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.realpath = function (filenameObj) {
    var COMPILER = PHP.Compiler.prototype,
        filename = filenameObj[COMPILER.VARIABLE_VALUE];

    // todo implement properly

    return new PHP.VM.Variable(filename);
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 17.7.2012 
 * @website http://hertzen.com
 */

PHP.Modules.prototype.rename = function (from, to) {
    var COMPILER = PHP.Compiler.prototype,
        filename = from[COMPILER.VARIABLE_VALUE],
        filename2 = to[COMPILER.VARIABLE_VALUE];

    this.ENV[COMPILER.ERROR]("rename(" + filename + "," + filename2 + "):  The system cannot find the file specified. (code: 2)", PHP.Constants.E_WARNING, true);

    return new PHP.VM.Variable(false);
};


/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 4.7.2012 
 * @website http://hertzen.com
 */

PHP.Modules.prototype.call_user_func = function (callback) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        Class,
        methodParts;

    if (callback[VARIABLE.TYPE] === VARIABLE.ARRAY) {

        var ClassVar = callback[COMPILER.VARIABLE_VALUE][COMPILER.METHOD_CALL](this, COMPILER.ARRAY_GET, 0),
            methodName = callback[COMPILER.VARIABLE_VALUE][COMPILER.METHOD_CALL](this, COMPILER.ARRAY_GET, 1)[COMPILER.VARIABLE_VALUE],
            args;

        methodParts = methodName.split("::");



        if (ClassVar[VARIABLE.TYPE] === VARIABLE.STRING) {
            Class = this.$Class.Get(ClassVar[COMPILER.VARIABLE_VALUE]).prototype;
        } else if (ClassVar[VARIABLE.TYPE] === VARIABLE.OBJECT) {
            Class = ClassVar[COMPILER.VARIABLE_VALUE];
        }

        // method call
        if (methodParts.length === 1) {
            args = [this, methodName].concat(Array.prototype.slice.call(arguments, 1));
            return Class[COMPILER.METHOD_CALL].apply(Class, args);
        } else {
            args = [this, methodParts[0], methodParts[1]].concat(Array.prototype.slice.call(arguments, 1));
            return Class[COMPILER.STATIC_CALL].apply(Class, args);
        }

    } else {
        methodParts = callback[COMPILER.VARIABLE_VALUE].split("::");

        if (methodParts.length === 1) {
            // function call
            args = Array.prototype.slice.call(arguments, 1);

            return this[callback[COMPILER.VARIABLE_VALUE]].apply(this, args);
        } else {
            // static call

            if (this.$Class.__autoload(methodParts[0])) {
                Class = this.$Class.Get(methodParts[0]).prototype;

                args = [this, methodParts[0], methodParts[1]].concat(Array.prototype.slice.call(arguments, 1));

                return Class[COMPILER.STATIC_CALL].apply(Class, args);
            } else {
                this[PHP.Compiler.prototype.ERROR]("call_user_func() expects parameter 1 to be a valid callback, class '" + methodParts[0] + "' not found", PHP.Constants.E_CORE_WARNING, true);
            }


        }


    }




};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 4.7.2012 
 * @website http://hertzen.com
 */

PHP.Modules.prototype.call_user_func_array = function (callback) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        Class,
        methodParts;

    if (callback[VARIABLE.TYPE] === VARIABLE.ARRAY) {

        var ClassVar = callback[COMPILER.VARIABLE_VALUE][COMPILER.METHOD_CALL](this, COMPILER.ARRAY_GET, 0),
            methodName = callback[COMPILER.VARIABLE_VALUE][COMPILER.METHOD_CALL](this, COMPILER.ARRAY_GET, 1)[COMPILER.VARIABLE_VALUE],
            args;

        methodParts = methodName.split("::");



        if (ClassVar[VARIABLE.TYPE] === VARIABLE.STRING) {
            Class = this.$Class.Get(ClassVar[COMPILER.VARIABLE_VALUE]).prototype;
        } else if (ClassVar[VARIABLE.TYPE] === VARIABLE.OBJECT) {
            Class = ClassVar[COMPILER.VARIABLE_VALUE];
        }

        // method call
        if (methodParts.length === 1) {
            args = [this, methodName].concat(Array.prototype.slice.call(arguments, 1));

            if ((Class["$£" + methodName] & PHP.VM.Class.PRIVATE) === PHP.VM.Class.PRIVATE) {
                this[COMPILER.ERROR]("call_user_func_array() expects parameter 1 to be a valid callback, cannot access private method " + Class[COMPILER.CLASS_NAME] + "::" + methodName + "()", PHP.Constants.E_WARNING, true);

            }


            return Class[COMPILER.METHOD_CALL].apply(Class, args);
        } else {
            args = [this, methodParts[0], methodParts[1]].concat(Array.prototype.slice.call(arguments, 1));
            return Class[COMPILER.STATIC_CALL].apply(Class, args);
        }

    } else {
        methodParts = callback[COMPILER.VARIABLE_VALUE].split("::");

        if (methodParts.length === 1) {
            // function call
            args = Array.prototype.slice.call(arguments, 1);

            return this[callback[COMPILER.VARIABLE_VALUE]].apply(this, args);
        } else {
            // static call

            if (this.$Class.__autoload(methodParts[0])) {
                Class = this.$Class.Get(methodParts[0]).prototype;

                args = [this, methodParts[0], methodParts[1]].concat(Array.prototype.slice.call(arguments, 1));

                return Class[COMPILER.STATIC_CALL].apply(Class, args);
            } else {
                this[PHP.Compiler.prototype.ERROR]("call_user_func() expects parameter 1 to be a valid callback, class '" + methodParts[0] + "' not found", PHP.Constants.E_CORE_WARNING, true);
            }


        }


    }




};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 16.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.create_function = function (args, source) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;


    // tokenizer
    var tokens = new PHP.Lexer("<?php " + source[COMPILER.VARIABLE_VALUE]);

    // build ast tree

    var AST = new PHP.Parser(tokens);

    if (Array.isArray(AST)) {



        // compile tree into JS
        var compiler = new PHP.Compiler(AST);


    }

    var src = "function " + COMPILER.CREATE_VARIABLE + "( val ) { return new PHP.VM.Variable( val ); }\n" + COMPILER.VARIABLE + " = " + COMPILER.VARIABLE + "(";
    src += "[]"; // todo, add function variables
    src += ", arguments";

    src += ");\n" + compiler.src;


    // execture code in current context ($)

    var lambda = new PHP.VM.Variable(Function.prototype.bind.apply(
        new Function("$", COMPILER.FUNCTION_STATIC, COMPILER.FUNCTION_GLOBAL, src),
        (this.$FHandler)(this, "anonymous")));



    return lambda;

};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 11.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.function_exists = function (function_name) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;


    return new PHP.VM.Variable(typeof this[function_name[COMPILER.VARIABLE_VALUE]] === "function");





};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 15.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.dechex = function (variable) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;

    var num = variable[COMPILER.VARIABLE_VALUE];

    return new PHP.VM.Variable(parseInt(num, 10).toString(16));
};
PHP.Modules.prototype.constant = function (name) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        variableValue = name[COMPILER.VARIABLE_VALUE];

    var constant = this[COMPILER.CONSTANTS][COMPILER.CONSTANT_GET](variableValue);
    if (constant[VARIABLE.DEFINED] !== true) {
        this.ENV[COMPILER.ERROR]("constant(): Couldn't find constant " + variableValue, PHP.Constants.E_CORE_WARNING, true);
        return new PHP.VM.Variable();
    }
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 7.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.define = function (name, value, case_insensitive) {

    var COMPILER = PHP.Compiler.prototype,

        variableValue = value[COMPILER.VARIABLE_VALUE],
        variableName = name[COMPILER.VARIABLE_VALUE];

    if (variableName.indexOf("::") !== -1) {
        this.ENV[COMPILER.ERROR]("Class constants cannot be defined or redefined", PHP.Constants.E_CORE_WARNING, true);
        return new PHP.VM.Variable(false);
    }


    this[COMPILER.CONSTANTS][COMPILER.CONSTANT_SET](variableName, variableValue);

    return new PHP.VM.Variable(true);

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 7.7.2012 
 * @website http://hertzen.com
 */

PHP.Modules.prototype.defined = function (name) {

    var COMPILER = PHP.Compiler.prototype,

        variableName = name[COMPILER.VARIABLE_VALUE];


    return new PHP.VM.Variable(this.$Constants[COMPILER.CONSTANT_DEFINED](variableName));

};


PHP.Modules.prototype.eval = function ($, $Static, $this, ctx, ENV, code) {
    var COMPILER = PHP.Compiler.prototype;

    var source = code[COMPILER.VARIABLE_VALUE];


    // tokenizer
    var tokens = new PHP.Lexer("<?php " + source);

    // build ast tree

    var AST = new PHP.Parser(tokens, true);

    if (Array.isArray(AST)) {
        // compile tree into JS
        var compiler = new PHP.Compiler(AST, undefined, {
            INSIDE_METHOD: (ctx !== undefined) ? true : false
        });


        // execture code in current context ($)
        var exec = new Function("$$", "$", "ENV", "$Static", "ctx", compiler.src);
        this.EVALING = true;
        var ret = exec.call($this, function (arg) {
            return new PHP.VM.Variable(arg);
        }, $, ENV, $Static, ctx);

        this.EVALING = undefined;
        return ret;
    } else {

        this[COMPILER.ERROR]("syntax error, unexpected $end in " +
            this[COMPILER.GLOBAL]("$__FILE__")[COMPILER.VARIABLE_VALUE] +
            "(1) : eval()'d code on line " + 1, PHP.Constants.E_PARSE);

    }

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 17.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.exit = function (message) {


};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 9.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.php_egg_logo_guid = function () {

    return new PHP.VM.Variable("PHPE9568F36-D428-11d2-A769-00AA001ACF42");
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 9.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.php_logo_guid = function () {

    return new PHP.VM.Variable("PHPE9568F34-D428-11d2-A769-00AA001ACF42");
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 9.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.php_real_logo_guid = function () {

    return new PHP.VM.Variable("PHPE9568F34-D428-11d2-A769-00AA001ACF42");
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 9.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.zend_logo_guid = function () {

    return new PHP.VM.Variable("PHPE9568F35-D428-11d2-A769-00AA001ACF42");
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 18.7.2012 
 * @website http://hertzen.com
 */



PHP.Modules.prototype.header = function (string) {

    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        variableValue = string[COMPILER.VARIABLE_VALUE];

    // todo add to output

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 14.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.assert = function (assertion) {
    // todo add  
    var COMPILER = PHP.Compiler.prototype;
    return (new PHP.VM.Variable(assertion[COMPILER.VARIABLE_VALUE]));

};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 15.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.ini_get = function (varname) {
    var COMPILER = PHP.Compiler.prototype,
        old = this.$ini[varname[COMPILER.VARIABLE_VALUE]];

    if (old === undefined) {
        return new PHP.VM.Variable(false);
    } else {

        old = old.toString().replace(/^On$/i, "1");
        old = old.toString().replace(/^Off$/i, "0");

        return new PHP.VM.Variable(old + "");
    }



};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 15.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.ini_restore = function (varname) {
    var COMPILER = PHP.Compiler.prototype;
    this.$ini[varname[COMPILER.VARIABLE_VALUE]] = Object.getPrototypeOf(this.$ini)[varname[COMPILER.VARIABLE_VALUE]];


    return new PHP.VM.Variable();




};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 5.7.2012 
 * @website http://hertzen.com
 */

PHP.Modules.prototype.ini_set = PHP.Modules.prototype.ini_alter = function (varname, newvalue) {
    var COMPILER = PHP.Compiler.prototype;
    var old = this.$ini[varname[COMPILER.VARIABLE_VALUE]];

    this.$ini[varname[COMPILER.VARIABLE_VALUE]] = newvalue[COMPILER.VARIABLE_VALUE];


    return new PHP.VM.Variable(old);
};


PHP.Modules.prototype.getenv = function (name) {
    var COMPILER = PHP.Compiler.prototype,
        variableValue = name[COMPILER.VARIABLE_VALUE];


    switch (variableValue) {
        case "TEST_PHP_EXECUTABLE":
            return new PHP.VM.Variable(PHP.Constants.PHP_BINARY);

        default:
            return new PHP.VM.Variable(false);

    }
};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 11.7.2012 
 * @website http://hertzen.com
 */

(function (MODULES) {
    MODULES.set_time_limit = function (newvalue) {

        var COMPILER = PHP.Compiler.prototype;


        this.$ini.max_execution_time = newvalue[COMPILER.VARIABLE_VALUE];

    };
})(PHP.Modules.prototype);

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 20.7.2012 
 * @website http://hertzen.com
 */



PHP.Modules.prototype.zend_version = function () {

    return new PHP.VM.Variable("1.0.0");
};
/* Automatically built from PHP version: 5.4.0-ZS5.6.0 */
PHP.Constants.PHP_OUTPUT_HANDLER_START = 1;
PHP.Constants.PHP_OUTPUT_HANDLER_WRITE = 0;
PHP.Constants.PHP_OUTPUT_HANDLER_FLUSH = 4;
PHP.Constants.PHP_OUTPUT_HANDLER_CLEAN = 2;
PHP.Constants.PHP_OUTPUT_HANDLER_FINAL = 8;
PHP.Constants.PHP_OUTPUT_HANDLER_CONT = 0;
PHP.Constants.PHP_OUTPUT_HANDLER_END = 8;
PHP.Constants.PHP_OUTPUT_HANDLER_CLEANABLE = 16;
PHP.Constants.PHP_OUTPUT_HANDLER_FLUSHABLE = 32;
PHP.Constants.PHP_OUTPUT_HANDLER_REMOVABLE = 64;
PHP.Constants.PHP_OUTPUT_HANDLER_STDFLAGS = 112;
PHP.Constants.PHP_OUTPUT_HANDLER_STARTED = 4096;
PHP.Constants.PHP_OUTPUT_HANDLER_DISABLED = 8192;

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 10.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.flush = function () {
    return new PHP.VM.Variable();
};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 10.7.2012 
 * @website http://hertzen.com
 */

(function (MODULES) {

    var DEFAULT = "default output handler",
        COMPILER = PHP.Compiler.prototype,
        OUTPUT_BUFFERS = COMPILER.OUTPUT_BUFFERS,
        CONSTANTS = PHP.Constants,
        flags = [],
        types = [],
        erasable = [],
        recurring = 0,
        NO_BUFFER_MSG = "(): failed to delete buffer. No buffer to delete",
        handlers = [];

    function pop() {
        handlers.pop();
        flags.pop();
        types.pop();
        erasable.pop();
    }

    MODULES.ob_gzhandler = function (str) {
        return str;
    };

    MODULES.$obreset = function () {
        flags = [];
        types = [];
        handlers = [];
        erasable = [];
        recurring = 0;
    };

    MODULES.$ob = function (str) {

        var index = this[OUTPUT_BUFFERS].length - 1,
            VARIABLE = PHP.VM.Variable.prototype;

        this[OUTPUT_BUFFERS][index] += str;



    };

    MODULES.$flush = function (str, minus) {
        minus = (minus === undefined) ? 1 : 0;
        var index = (this[COMPILER.OUTPUT_BUFFERS].length - 1) - minus,
            VARIABLE = PHP.VM.Variable.prototype;
        // trigger flush
        if (handlers[index] !== DEFAULT && handlers[index] !== undefined && this[COMPILER.DISPLAY_HANDLER] !== false) {
            recurring++;
            // check that we aren't ending up in any endless error loop

            if (recurring <= 10) {
                this[COMPILER.DISPLAY_HANDLER] = true;

                var result = this[handlers[index]].call(this, new PHP.VM.Variable(str), new PHP.VM.Variable(types[index]));

                recurring = 0;
                this[COMPILER.DISPLAY_HANDLER] = undefined;
                if (result[VARIABLE.TYPE] !== VARIABLE.NULL) {
                    return result[COMPILER.VARIABLE_VALUE];
                }




            }
            return "";
        } else {
            return str;
        }
    };

    MODULES.ob_clean = function () {


        if (!this[COMPILER.SIGNATURE](arguments, "ob_clean", 0, [])) {
            return new PHP.VM.Variable(null);
        }

        var index = erasable.length - 1;

        if (erasable[index] === false) {
            this[COMPILER.ERROR]("ob_clean(): failed to delete buffer of " + handlers[index] + " (0)", PHP.Constants.E_CORE_NOTICE, true);
            return new PHP.VM.Variable(false);
        }

        if (this[COMPILER.OUTPUT_BUFFERS].length > 1) {
            this[COMPILER.OUTPUT_BUFFERS].pop();
            this[COMPILER.OUTPUT_BUFFERS].push("");
            return new PHP.VM.Variable(true);
        } else {
            this[COMPILER.ERROR]("ob_clean(): failed to delete buffer. No buffer to delete", PHP.Constants.E_CORE_NOTICE, true);
            return new PHP.VM.Variable(false);
        }
    };


    MODULES.$obflush = function () {
        var index = this[COMPILER.OUTPUT_BUFFERS].length - 1,
            VARIABLE = PHP.VM.Variable.prototype;
        var content = this[COMPILER.OUTPUT_BUFFERS][index];
        this[COMPILER.OUTPUT_BUFFERS][index] = "";
        var value = this.$flush.call(this, content);

        this[COMPILER.OUTPUT_BUFFERS][index] = value;

    };

    MODULES.ob_start = function (output_callback, chunk_size, erase) {

        var FUNCTION_NAME = "ob_start",
            VARIABLE = PHP.VM.Variable.prototype;

        if (!this[PHP.Compiler.prototype.SIGNATURE](arguments, FUNCTION_NAME, -3, [null, VARIABLE.INT, VARIABLE.INT])) {
            return new PHP.VM.Variable(null);
        }

        if (output_callback !== undefined) {
            var fail = false,
                splitClassVar;
            if ((output_callback[VARIABLE.TYPE] !== VARIABLE.STRING && output_callback[VARIABLE.TYPE] !== VARIABLE.ARRAY && output_callback[VARIABLE.TYPE] !== VARIABLE.LAMBDA)) {
                this[COMPILER.ERROR](FUNCTION_NAME + "(): no array or string given", PHP.Constants.E_WARNING, true);
                fail = true;

            } else if (output_callback[VARIABLE.TYPE] === VARIABLE.ARRAY || (output_callback[VARIABLE.TYPE] === VARIABLE.STRING && (splitClassVar = output_callback[COMPILER.VARIABLE_VALUE].split("::")).length > 1)) {
                // method call
                var classVar,
                    methodVar;

                if (output_callback[VARIABLE.TYPE] === VARIABLE.STRING) {
                    classVar = new PHP.VM.Variable(splitClassVar[0]);
                    methodVar = new PHP.VM.Variable(splitClassVar[1]);
                } else {
                    classVar = output_callback[COMPILER.DIM_FETCH](this, new PHP.VM.Variable(0));
                    methodVar = output_callback[COMPILER.DIM_FETCH](this, new PHP.VM.Variable(1));

                    if (this.count(output_callback)[COMPILER.VARIABLE_VALUE] !== 2) {
                        this[COMPILER.ERROR](FUNCTION_NAME + "(): array must have exactly two members", PHP.Constants.E_WARNING, true);
                        fail = true;
                    }

                }

                if (!fail) {
                    if (classVar[VARIABLE.TYPE] === VARIABLE.STRING && this.class_exists(classVar)[COMPILER.VARIABLE_VALUE] === false) {
                        this[COMPILER.ERROR](FUNCTION_NAME + "(): class '" + PHP.Utils.ClassName(classVar) + "' not found", PHP.Constants.E_WARNING, true);
                        fail = true;
                    } else if (this.method_exists(classVar, methodVar)[COMPILER.VARIABLE_VALUE] === false) {
                        this[COMPILER.ERROR](FUNCTION_NAME + "(): class '" + PHP.Utils.ClassName(classVar) + "' does not have a method '" + methodVar[COMPILER.VARIABLE_VALUE] + "'", PHP.Constants.E_WARNING, true);
                        fail = true;

                    }
                }
            } else if (output_callback[VARIABLE.TYPE] === VARIABLE.STRING) {
                // function call
                if (this.function_exists(output_callback)[COMPILER.VARIABLE_VALUE] === false) {
                    this[COMPILER.ERROR](FUNCTION_NAME + "(): function '" + output_callback[COMPILER.VARIABLE_VALUE] + "' not found or invalid function name", PHP.Constants.E_WARNING, true);
                    fail = true;
                }
            }

            if (fail) {
                this[COMPILER.ERROR](FUNCTION_NAME + "(): failed to create buffer", PHP.Constants.E_CORE_NOTICE, true);
                return new PHP.VM.Variable(false);
            }
        }

        var handler = DEFAULT,
            type;

        if (output_callback !== undefined) {
            handler = output_callback[COMPILER.VARIABLE_VALUE];
            type = CONSTANTS.PHP_OUTPUT_HANDLER_START;
        } else {
            type = CONSTANTS.PHP_OUTPUT_HANDLER_WRITE;
        }

        this[OUTPUT_BUFFERS].push("");
        types.push(type);
        flags.push(CONSTANTS.PHP_OUTPUT_HANDLER_STDFLAGS | type);
        handlers.push(handler);

        if (erase === undefined || erase[COMPILER.VARIABLE_VALUE] === true) {
            erasable.push(true);
        } else {
            erasable.push(false);
        }

        return new PHP.VM.Variable(true);
    };

    MODULES.ob_end_clean = function () {

        var FUNCTION_NAME = "ob_end_clean";

        if (!this[PHP.Compiler.prototype.SIGNATURE](arguments, FUNCTION_NAME, 0, [])) {
            return new PHP.VM.Variable(null);
        }

        var index = erasable.length - 1;
        if (erasable[index] === false) {
            this[COMPILER.ERROR](FUNCTION_NAME + "(): failed to discard buffer of " + handlers[index] + " (0)", PHP.Constants.E_CORE_NOTICE, true);
            return new PHP.VM.Variable(false);
        }

        if (this[COMPILER.OUTPUT_BUFFERS].length > 1) {
            this[OUTPUT_BUFFERS].pop();
            pop();
            return new PHP.VM.Variable(true);
        } else {
            this[COMPILER.ERROR](FUNCTION_NAME + NO_BUFFER_MSG, PHP.Constants.E_CORE_NOTICE, true);
            return new PHP.VM.Variable(false);
        }



    };


    MODULES.ob_end_flush = function () {

        var FUNCTION_NAME = "ob_end_flush";

        if (!this[PHP.Compiler.prototype.SIGNATURE](arguments, FUNCTION_NAME, 0, [])) {
            return new PHP.VM.Variable(null);
        }

        var index = erasable.length - 1;
        if (erasable[index] === false) {
            this[COMPILER.ERROR](FUNCTION_NAME + "(): failed to send buffer of " + handlers[index] + " (0)", PHP.Constants.E_CORE_NOTICE, true);
            return new PHP.VM.Variable(false);
        }

        if (this[COMPILER.OUTPUT_BUFFERS].length > 1) {
            var flush = this[OUTPUT_BUFFERS].pop();
            this[OUTPUT_BUFFERS][this[OUTPUT_BUFFERS].length - 1] += this.$flush(flush, 1);
            pop();

            return new PHP.VM.Variable(true);
        } else {
            this[COMPILER.ERROR](FUNCTION_NAME + "(): failed to delete and flush buffer. No buffer to delete or flush", PHP.Constants.E_CORE_NOTICE, true);
            return new PHP.VM.Variable(false);
        }

    };

    MODULES.ob_get_flush = function () {
        var FUNCTION_NAME = "ob_get_flush";

        if (this[COMPILER.DISPLAY_HANDLER] === true) {
            this[COMPILER.ERROR]("ob_get_flush(): Cannot use output buffering in output buffering display handlers", PHP.Constants.E_ERROR, true);
        }

        //  var flush = this[ OUTPUT_BUFFERS ].pop();
        var index = erasable.length - 1;
        var flush = this[OUTPUT_BUFFERS][this[OUTPUT_BUFFERS].length - 1];

        if (erasable[index] === false) {
            this[COMPILER.ERROR](FUNCTION_NAME + "(): failed to send buffer of " + handlers[index] + " (0)", PHP.Constants.E_CORE_NOTICE, true);

            this[COMPILER.ERROR](FUNCTION_NAME + "(): failed to delete buffer of " + handlers[index] + " (0)", PHP.Constants.E_CORE_NOTICE, true);
        } else {
            this[OUTPUT_BUFFERS].pop();
            this[OUTPUT_BUFFERS][this[OUTPUT_BUFFERS].length - 1] += this.$flush(flush, 1);

            pop();
        }



        return new PHP.VM.Variable(flush);
    };


    MODULES.ob_get_clean = function () {

        var FUNCTION_NAME = "ob_get_clean";

        if (!this[PHP.Compiler.prototype.SIGNATURE](arguments, FUNCTION_NAME, 0, [])) {
            return new PHP.VM.Variable(null);
        }


        var index = erasable.length - 1;


        if (this[OUTPUT_BUFFERS].length > 1) {

            var flush = this[OUTPUT_BUFFERS][this[OUTPUT_BUFFERS].length - 1];

            if (erasable[index] === false) {
                this[COMPILER.ERROR](FUNCTION_NAME + "(): failed to discard buffer of " + handlers[index] + " (0)", PHP.Constants.E_CORE_NOTICE, true);

                this[COMPILER.ERROR](FUNCTION_NAME + "(): failed to delete buffer of " + handlers[index] + " (0)", PHP.Constants.E_CORE_NOTICE, true);
            } else {
                this[OUTPUT_BUFFERS].pop();
                pop();
            }
            return new PHP.VM.Variable(flush);
        } else {
            return new PHP.VM.Variable(false);
        }

    };

    MODULES.ob_list_handlers = function () {
        return PHP.VM.Array.fromObject.call(this, handlers);
    };

    MODULES.ob_get_status = function (full_status) {

        var item = PHP.VM.Array.arrayItem,

            get_status = function (index) {
                return [
                    item("name", handlers[index]),
                    item("type", types[index]),
                    item("flags", flags[index]),
                    item("level", index),
                    item("chunk_size", 0),
                    item("buffer_size", 16384),
                    item("buffer_used", this[OUTPUT_BUFFERS][index + 1].length)

                ];

            }.bind(this);



        if (this[OUTPUT_BUFFERS].length === 1) {
            return this.array([]);
        }

        if (full_status !== undefined && full_status[COMPILER.VARIABLE_VALUE] === true) {
            var arr = [];
            handlers.forEach(function (handler, index) {
                arr.push(item(index, this.array(get_status(index))));
            }, this);
            return this.array(arr);
        } else {
            return this.array(get_status(handlers.length - 1));
        }



    };

    MODULES.ob_implicit_flush = function () {
        var FUNCTION_NAME = "ob_implicit_flush";

        if (!this[PHP.Compiler.prototype.SIGNATURE](arguments, FUNCTION_NAME, -1, [])) {
            return new PHP.VM.Variable(null);
        }
        return new PHP.VM.Variable();
    };

})(PHP.Modules.prototype);

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 10.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.ob_flush = function () {

    var FUNCTION_NAME = "ob_flush",
        COMPILER = PHP.Compiler.prototype;

    if (!this[PHP.Compiler.prototype.SIGNATURE](arguments, FUNCTION_NAME, 0, [])) {
        return new PHP.VM.Variable(null);
    }

    if (this[COMPILER.OUTPUT_BUFFERS].length > 1) {
        var flush = this[PHP.Compiler.prototype.OUTPUT_BUFFERS].pop();
        this[PHP.Compiler.prototype.OUTPUT_BUFFERS][this[PHP.Compiler.prototype.OUTPUT_BUFFERS].length - 1] += flush;
        this[PHP.Compiler.prototype.OUTPUT_BUFFERS].push("");
        this.$obflush();
        return new PHP.VM.Variable(true);
    } else {
        this.ENV[COMPILER.ERROR](FUNCTION_NAME + "(): failed to flush buffer. No buffer to flush", PHP.Constants.E_CORE_NOTICE, true);
        return new PHP.VM.Variable(false);
    }

};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 10.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.ob_get_contents = function () {
    var FUNCTION_NAME = "ob_get_contents",
        COMPILER = PHP.Compiler.prototype;

    if (!this[PHP.Compiler.prototype.SIGNATURE](arguments, FUNCTION_NAME, 0, [])) {
        return new PHP.VM.Variable(null);
    }

    if (this[COMPILER.OUTPUT_BUFFERS].length > 1) {
        return new PHP.VM.Variable(this[PHP.Compiler.prototype.OUTPUT_BUFFERS][this[PHP.Compiler.prototype.OUTPUT_BUFFERS].length - 1]);
    } else {
        //   this.ENV[ COMPILER.ERROR ]( FUNCTION_NAME + "(): failed to flush buffer. No buffer to flush", PHP.Constants.E_CORE_NOTICE, true );
        return new PHP.VM.Variable(false);
    }

};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 10.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.ob_get_length = function () {
    var FUNCTION_NAME = "ob_get_length",
        COMPILER = PHP.Compiler.prototype;

    if (!this[PHP.Compiler.prototype.SIGNATURE](arguments, FUNCTION_NAME, 0, [])) {
        return new PHP.VM.Variable(null);
    }

    if (this[COMPILER.OUTPUT_BUFFERS].length > 1) {
        return new PHP.VM.Variable(this[PHP.Compiler.prototype.OUTPUT_BUFFERS][this[PHP.Compiler.prototype.OUTPUT_BUFFERS].length - 1].length);
    } else {
        //   this.ENV[ COMPILER.ERROR ]( FUNCTION_NAME + "(): failed to flush buffer. No buffer to flush", PHP.Constants.E_CORE_NOTICE, true );
        return new PHP.VM.Variable(false);
    }

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 10.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.ob_get_level = function () {

    var FUNCTION_NAME = "ob_get_level",
        COMPILER = PHP.Compiler.prototype;

    if (!this[COMPILER.SIGNATURE](arguments, FUNCTION_NAME, 0, [])) {
        return new PHP.VM.Variable(null);
    }

    return new PHP.VM.Variable(this[COMPILER.OUTPUT_BUFFERS].length - 1);

};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 16.7.2012 
 * @website http://hertzen.com
 */

// todo improve
PHP.Modules.prototype.preg_match = function (pattern, subject, matches) {
    var COMPILER = PHP.Compiler.prototype;

    var re = new RegExp(pattern[COMPILER.VARIABLE_VALUE].substr(1, pattern[COMPILER.VARIABLE_VALUE].length - 2));
    var result = subject[COMPILER.VARIABLE_VALUE].toString().match(re);

    return new PHP.VM.Variable((result === null) ? 0 : result.length);
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 24.6.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.echo = function () {
    var COMPILER = PHP.Compiler.prototype,
        __toString = "__toString",
        VARIABLE = PHP.VM.Variable.prototype;
    Array.prototype.slice.call(arguments).forEach(function (arg) {

        if (arg instanceof PHP.VM.VariableProto) {
            var value = arg[VARIABLE.CAST_STRING][COMPILER.VARIABLE_VALUE];

            if (arg[VARIABLE.TYPE] === VARIABLE.FLOAT) {
                this.$ob(value.toString().replace(/\./, this.$locale.decimal_point));
            } else if (arg[VARIABLE.TYPE] === VARIABLE.BOOL && value != 1) {
                return;
            } else if (arg[VARIABLE.TYPE] !== VARIABLE.NULL) {

                this.$ob(value);

            }

        } else {
            this.$ob(arg);
            //   this[ COMPILER.OUTPUT_BUFFERS ][this[ COMPILER.OUTPUT_BUFFERS ].length - 1] += arg;
        }

    }, this);

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 27.6.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.explode = function (delim, string) {
    var VARIABLE = PHP.VM.Variable.prototype,
        COMPILER = PHP.Compiler.prototype,
        item = PHP.VM.Array.arrayItem;

    if (string[VARIABLE.TYPE] === VARIABLE.STRING) {
        // Defaults to an empty string
        var items = string[COMPILER.VARIABLE_VALUE].split(delim[COMPILER.VARIABLE_VALUE]),
            arr = [];


        items.forEach(function (val, index) {
            arr.push(item(index, val));
        });

        return this.array(arr);
    }

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 27.6.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.implode = function (glue, pieces) {
    var VARIABLE = PHP.VM.Variable.prototype,
        COMPILER = PHP.Compiler.prototype;

    if (glue[VARIABLE.TYPE] === VARIABLE.ARRAY) {
        // Defaults to an empty string
        pieces = glue;
        glue = "";
    } else {
        glue = glue[COMPILER.VARIABLE_VALUE];
    }

    var values = pieces[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.VALUES][COMPILER.VARIABLE_VALUE];



    return new PHP.VM.Variable(values.map(function (val) {
        return val[COMPILER.VARIABLE_VALUE];
    }).join(glue));
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 20.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.localeconv = function () {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        item = PHP.VM.Array.arrayItem;

    var locale = this.$locale;


    // todo add all
    return this.array([
        item("decimal_point", locale.decimal_point),
        item("thousands_sep", locale.thousands_sep)
    ]);

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 27.6.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.parse_str = function (str, arr) {






};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 4.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.print = function (variable) {
    this.echo(variable);
    return new PHP.VM.Variable(1);
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 15.7.2012 
 * @website http://hertzen.com
 */



PHP.Modules.prototype.printf = function (format) {
    var COMPILER = PHP.Compiler.prototype,
        __toString = "__toString",
        VARIABLE = PHP.VM.Variable.prototype;


    if (format instanceof PHP.VM.VariableProto) {




        var value = format[VARIABLE.CAST_STRING][COMPILER.VARIABLE_VALUE];

        if (format[COMPILER.VARIABLE_VALUE][COMPILER.CLASS_NAME] === "stdClass") {
            this.ENV[COMPILER.ERROR]("Object of class stdClass to string conversion", PHP.Constants.E_NOTICE, true);
            value = "Object";
        }

        if (format[VARIABLE.TYPE] !== VARIABLE.NULL) {


            // todo fix to make more specific
            Array.prototype.slice.call(arguments, 1).forEach(function (item) {
                value = value.replace(/%./, item[COMPILER.VARIABLE_VALUE]);
            });
            this.$ob(value);

        }

    }



};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 17.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.setlocale = function (category) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;

    var cat = category[COMPILER.VARIABLE_VALUE],
        localeObj,
        localeName;

    Array.prototype.slice.call(arguments, 1).some(function (localeVar) {

        var locale = localeVar[COMPILER.VARIABLE_VALUE];

        return Object.keys(PHP.Locales).some(function (key) {

            if (key === locale) {
                localeName = key;
                localeObj = PHP.Locales[key];
                return true;
            }
            return false;

        });

    });

    if (localeObj === undefined) {
        return new PHP.VM.Variable(false);
    }

    // console.log( cat );

    Object.keys(this.$locale).forEach(function (key) {

        if (localeObj[key] !== undefined) {
            this.$locale[key] = localeObj[key];
        }

    }, this);

    return new PHP.VM.Variable(localeName);

};
/*
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 23.7.2012
 * @website http://hertzen.com
 */



PHP.Modules.prototype.sprintf = function (format) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;

    if (format instanceof PHP.VM.VariableProto) {
        var value = format[VARIABLE.CAST_STRING][COMPILER.VARIABLE_VALUE];
        if (format[VARIABLE.TYPE] !== VARIABLE.NULL) {

            // todo fix to make more specific
            Array.prototype.slice.call(arguments, 1).forEach(function (item) {
                value = value.replace(/%./, item[VARIABLE.CAST_STRING][COMPILER.VARIABLE_VALUE]);
            });

            return new PHP.VM.Variable(value);
        }
    }
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 18.7.2012 
 * @website http://hertzen.com
 */



PHP.Modules.prototype.str_repeat = function (input, multiplier) {

    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        variableValue = input[COMPILER.VARIABLE_VALUE];
    var str = "";

    for (var i = 0, len = multiplier[COMPILER.VARIABLE_VALUE]; i < len; i++) {
        str += variableValue;
    }

    return new PHP.VM.Variable(str);

};
PHP.Modules.prototype.str_replace = function (search, replace, subject) {
    var COMPILER = PHP.Compiler.prototype;

    var re = new RegExp(search[COMPILER.VARIABLE_VALUE], "g");
    return new PHP.VM.Variable(subject[COMPILER.VARIABLE_VALUE].replace(re, replace[COMPILER.VARIABLE_VALUE]));
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 10.7.2012 
 * @website http://hertzen.com
 */

PHP.Modules.prototype.str_rot13 = function (str, arr) {

    var FUNCTION_NAME = "str_rot13";

    if (!this[PHP.Compiler.prototype.SIGNATURE](arguments, FUNCTION_NAME, 1, [])) {
        return new PHP.VM.Variable(null);
    }




};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 3.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.strlen = function (string) {

    var COMPILER = PHP.Compiler.prototype;

    return new PHP.VM.Variable(string[COMPILER.VARIABLE_VALUE].length);

};
PHP.Modules.prototype.strncmp = function (str1, str2, len) {

    var COMPILER = PHP.Compiler.prototype,
        VAR = PHP.VM.Variable.prototype;

    if ((str1[VAR.CAST_STRING][COMPILER.VARIABLE_VALUE].substring(0, len[COMPILER.VARIABLE_VALUE]) === str2[VAR.CAST_STRING][COMPILER.VARIABLE_VALUE].substring(0, len[COMPILER.VARIABLE_VALUE]))) {
        return new PHP.VM.Variable(0);
    } else {
        return new PHP.VM.Variable(1);
    }
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 10.7.2012 
 * @website http://hertzen.com
 */



PHP.Modules.prototype.strtolower = function (str) {
    var VARIABLE = PHP.VM.Variable.prototype,
        COMPILER = PHP.Compiler.prototype;

    return new PHP.VM.Variable(str[COMPILER.VARIABLE_VALUE].toLowerCase());
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 10.7.2012 
 * @website http://hertzen.com
 */



PHP.Modules.prototype.strtoupper = function (str) {
    var VARIABLE = PHP.VM.Variable.prototype,
        COMPILER = PHP.Compiler.prototype;

    return new PHP.VM.Variable(str[COMPILER.VARIABLE_VALUE].toUpperCase());
};
PHP.Modules.prototype.trim = function (variable) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;

    if (variable[VARIABLE.TYPE] !== VARIABLE.STRING) {
        variable = variable[VARIABLE.CAST_STRING];
    }

    return new PHP.VM.Variable(variable[COMPILER.VARIABLE_VALUE].toString().trim());
};




PHP.Constants.T_INCLUDE = 262;
PHP.Constants.T_INCLUDE_ONCE = 261;
PHP.Constants.T_EVAL = 260;
PHP.Constants.T_REQUIRE = 259;
PHP.Constants.T_REQUIRE_ONCE = 258;
PHP.Constants.T_LOGICAL_OR = 263;
PHP.Constants.T_LOGICAL_XOR = 264;
PHP.Constants.T_LOGICAL_AND = 265;
PHP.Constants.T_PRINT = 266;
PHP.Constants.T_PLUS_EQUAL = 277;
PHP.Constants.T_MINUS_EQUAL = 276;
PHP.Constants.T_MUL_EQUAL = 275;
PHP.Constants.T_DIV_EQUAL = 274;
PHP.Constants.T_CONCAT_EQUAL = 273;
PHP.Constants.T_MOD_EQUAL = 272;
PHP.Constants.T_AND_EQUAL = 271;
PHP.Constants.T_OR_EQUAL = 270;
PHP.Constants.T_XOR_EQUAL = 269;
PHP.Constants.T_SL_EQUAL = 268;
PHP.Constants.T_SR_EQUAL = 267;
PHP.Constants.T_BOOLEAN_OR = 278;
PHP.Constants.T_BOOLEAN_AND = 279;
PHP.Constants.T_IS_EQUAL = 283;
PHP.Constants.T_IS_NOT_EQUAL = 282;
PHP.Constants.T_IS_IDENTICAL = 281;
PHP.Constants.T_IS_NOT_IDENTICAL = 280;
PHP.Constants.T_IS_SMALLER_OR_EQUAL = 285;
PHP.Constants.T_IS_GREATER_OR_EQUAL = 284;
PHP.Constants.T_SL = 287;
PHP.Constants.T_SR = 286;
PHP.Constants.T_INSTANCEOF = 288;
PHP.Constants.T_INC = 297;
PHP.Constants.T_DEC = 296;
PHP.Constants.T_INT_CAST = 295;
PHP.Constants.T_DOUBLE_CAST = 294;
PHP.Constants.T_STRING_CAST = 293;
PHP.Constants.T_ARRAY_CAST = 292;
PHP.Constants.T_OBJECT_CAST = 291;
PHP.Constants.T_BOOL_CAST = 290;
PHP.Constants.T_UNSET_CAST = 289;
PHP.Constants.T_NEW = 299;
PHP.Constants.T_CLONE = 298;
PHP.Constants.T_EXIT = 300;
PHP.Constants.T_IF = 301;
PHP.Constants.T_ELSEIF = 302;
PHP.Constants.T_ELSE = 303;
PHP.Constants.T_ENDIF = 304;
PHP.Constants.T_LNUMBER = 305;
PHP.Constants.T_DNUMBER = 306;
PHP.Constants.T_STRING = 307;
PHP.Constants.T_STRING_VARNAME = 308;
PHP.Constants.T_VARIABLE = 309;
PHP.Constants.T_NUM_STRING = 310;
PHP.Constants.T_INLINE_HTML = 311;
PHP.Constants.T_CHARACTER = 312;
PHP.Constants.T_BAD_CHARACTER = 313;
PHP.Constants.T_ENCAPSED_AND_WHITESPACE = 314;
PHP.Constants.T_CONSTANT_ENCAPSED_STRING = 315;
PHP.Constants.T_ECHO = 316;
PHP.Constants.T_DO = 317;
PHP.Constants.T_WHILE = 318;
PHP.Constants.T_ENDWHILE = 319;
PHP.Constants.T_FOR = 320;
PHP.Constants.T_ENDFOR = 321;
PHP.Constants.T_FOREACH = 322;
PHP.Constants.T_ENDFOREACH = 323;
PHP.Constants.T_DECLARE = 324;
PHP.Constants.T_ENDDECLARE = 325;
PHP.Constants.T_AS = 326;
PHP.Constants.T_SWITCH = 327;
PHP.Constants.T_ENDSWITCH = 328;
PHP.Constants.T_CASE = 329;
PHP.Constants.T_DEFAULT = 330;
PHP.Constants.T_BREAK = 331;
PHP.Constants.T_CONTINUE = 332;
PHP.Constants.T_GOTO = 333;
PHP.Constants.T_FUNCTION = 334;
PHP.Constants.T_CONST = 335;
PHP.Constants.T_RETURN = 336;
PHP.Constants.T_TRY = 337;
PHP.Constants.T_CATCH = 338;
PHP.Constants.T_THROW = 339;
PHP.Constants.T_USE = 340;
//PHP.Constants.T_INSTEADOF = ;
PHP.Constants.T_GLOBAL = 341;
PHP.Constants.T_STATIC = 347;
PHP.Constants.T_ABSTRACT = 346;
PHP.Constants.T_FINAL = 345;
PHP.Constants.T_PRIVATE = 344;
PHP.Constants.T_PROTECTED = 343;
PHP.Constants.T_PUBLIC = 342;
PHP.Constants.T_VAR = 348;
PHP.Constants.T_UNSET = 349;
PHP.Constants.T_ISSET = 350;
PHP.Constants.T_EMPTY = 351;
PHP.Constants.T_HALT_COMPILER = 352;
PHP.Constants.T_CLASS = 353;
PHP.Constants.T_TRAIT = 382;
PHP.Constants.T_INTERFACE = 354;
PHP.Constants.T_EXTENDS = 355;
PHP.Constants.T_IMPLEMENTS = 356;
PHP.Constants.T_OBJECT_OPERATOR = 357;
PHP.Constants.T_DOUBLE_ARROW = 358;
PHP.Constants.T_LIST = 359;
PHP.Constants.T_ARRAY = 360;
//PHP.Constants.T_CALLABLE = ;
PHP.Constants.T_CLASS_C = 361;
PHP.Constants.T_TRAIT_C = 381;
PHP.Constants.T_METHOD_C = 362;
PHP.Constants.T_FUNC_C = 363;
PHP.Constants.T_LINE = 364;
PHP.Constants.T_FILE = 365;
PHP.Constants.T_COMMENT = 366;
PHP.Constants.T_DOC_COMMENT = 367;
PHP.Constants.T_OPEN_TAG = 368;
PHP.Constants.T_OPEN_TAG_WITH_ECHO = 369;
PHP.Constants.T_CLOSE_TAG = 370;
PHP.Constants.T_WHITESPACE = 371;
PHP.Constants.T_START_HEREDOC = 372;
PHP.Constants.T_END_HEREDOC = 373;
PHP.Constants.T_DOLLAR_OPEN_CURLY_BRACES = 374;
PHP.Constants.T_CURLY_OPEN = 375;
PHP.Constants.T_PAAMAYIM_NEKUDOTAYIM = 376;
PHP.Constants.T_DOUBLE_COLON = 376;
PHP.Constants.T_NAMESPACE = 377;
PHP.Constants.T_NS_C = 378;
PHP.Constants.T_DIR = 379;
PHP.Constants.T_NS_SEPARATOR = 380;

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 28.6.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.token_get_all = function (code) {
    var VARIABLE = PHP.VM.Variable.prototype,
        COMPILER = PHP.Compiler.prototype;


    if (!this[COMPILER.SIGNATURE](arguments, "token_get_all", 1, [
            [VARIABLE.STRING, VARIABLE.NULL]
        ])) {
        return new PHP.VM.Variable(null);
    }

    switch (code[VARIABLE.TYPE]) {

        case VARIABLE.BOOL:
            if (code[COMPILER.VARIABLE_VALUE] === true) {
                return PHP.VM.Array.fromObject.call(this, PHP.Lexer("1"));
            } else {
                return PHP.VM.Array.fromObject.call(this, PHP.Lexer(null));
            }
            break;
        case VARIABLE.STRING:
        case VARIABLE.NULL:
            return PHP.VM.Array.fromObject.call(this, PHP.Lexer(code[COMPILER.VARIABLE_VALUE]));
            break;

        default:
            return PHP.VM.Array.fromObject.call(this, PHP.Lexer(code[VARIABLE.CAST_STRING][COMPILER.VARIABLE_VALUE]));

    }



};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 15.6.2012 
 * @website http://hertzen.com
 */

/* token_name — Get the symbolic name of a given PHP token
 * string token_name ( int $token )
 */

PHP.Modules.prototype.token_name = function (token) {

    if (!this[PHP.Compiler.prototype.SIGNATURE](arguments, "token_name", 1, [PHP.VM.Variable.prototype.INT])) {
        return new PHP.VM.Variable(null);
    }

    // TODO invert this for faster performance
    var constants = {};
    constants.T_INCLUDE = 262;
    constants.T_INCLUDE_ONCE = 261;
    constants.T_EVAL = 260;
    constants.T_REQUIRE = 259;
    constants.T_REQUIRE_ONCE = 258;
    constants.T_LOGICAL_OR = 263;
    constants.T_LOGICAL_XOR = 264;
    constants.T_LOGICAL_AND = 265;
    constants.T_PRINT = 266;
    constants.T_PLUS_EQUAL = 277;
    constants.T_MINUS_EQUAL = 276;
    constants.T_MUL_EQUAL = 275;
    constants.T_DIV_EQUAL = 274;
    constants.T_CONCAT_EQUAL = 273;
    constants.T_MOD_EQUAL = 272;
    constants.T_AND_EQUAL = 271;
    constants.T_OR_EQUAL = 270;
    constants.T_XOR_EQUAL = 269;
    constants.T_SL_EQUAL = 268;
    constants.T_SR_EQUAL = 267;
    constants.T_BOOLEAN_OR = 278;
    constants.T_BOOLEAN_AND = 279;
    constants.T_IS_EQUAL = 283;
    constants.T_IS_NOT_EQUAL = 282;
    constants.T_IS_IDENTICAL = 281;
    constants.T_IS_NOT_IDENTICAL = 280;
    constants.T_IS_SMALLER_OR_EQUAL = 285;
    constants.T_IS_GREATER_OR_EQUAL = 284;
    constants.T_SL = 287;
    constants.T_SR = 286;
    constants.T_INSTANCEOF = 288;
    constants.T_INC = 297;
    constants.T_DEC = 296;
    constants.T_INT_CAST = 295;
    constants.T_DOUBLE_CAST = 294;
    constants.T_STRING_CAST = 293;
    constants.T_ARRAY_CAST = 292;
    constants.T_OBJECT_CAST = 291;
    constants.T_BOOL_CAST = 290;
    constants.T_UNSET_CAST = 289;
    constants.T_NEW = 299;
    constants.T_CLONE = 298;
    constants.T_EXIT = 300;
    constants.T_IF = 301;
    constants.T_ELSEIF = 302;
    constants.T_ELSE = 303;
    constants.T_ENDIF = 304;
    constants.T_LNUMBER = 305;
    constants.T_DNUMBER = 306;
    constants.T_STRING = 307;
    constants.T_STRING_VARNAME = 308;
    constants.T_VARIABLE = 309;
    constants.T_NUM_STRING = 310;
    constants.T_INLINE_HTML = 311;
    constants.T_CHARACTER = 312;
    constants.T_BAD_CHARACTER = 313;
    constants.T_ENCAPSED_AND_WHITESPACE = 314;
    constants.T_CONSTANT_ENCAPSED_STRING = 315;
    constants.T_ECHO = 316;
    constants.T_DO = 317;
    constants.T_WHILE = 318;
    constants.T_ENDWHILE = 319;
    constants.T_FOR = 320;
    constants.T_ENDFOR = 321;
    constants.T_FOREACH = 322;
    constants.T_ENDFOREACH = 323;
    constants.T_DECLARE = 324;
    constants.T_ENDDECLARE = 325;
    constants.T_AS = 326;
    constants.T_SWITCH = 327;
    constants.T_ENDSWITCH = 328;
    constants.T_CASE = 329;
    constants.T_DEFAULT = 330;
    constants.T_BREAK = 331;
    constants.T_CONTINUE = 332;
    constants.T_GOTO = 333;
    constants.T_FUNCTION = 334;
    constants.T_CONST = 335;
    constants.T_RETURN = 336;
    constants.T_TRY = 337;
    constants.T_CATCH = 338;
    constants.T_THROW = 339;
    constants.T_USE = 340;
    //constants.T_INSTEADOF = ;
    constants.T_GLOBAL = 341;
    constants.T_STATIC = 347;
    constants.T_ABSTRACT = 346;
    constants.T_FINAL = 345;
    constants.T_PRIVATE = 344;
    constants.T_PROTECTED = 343;
    constants.T_PUBLIC = 342;
    constants.T_VAR = 348;
    constants.T_UNSET = 349;
    constants.T_ISSET = 350;
    constants.T_EMPTY = 351;
    constants.T_HALT_COMPILER = 352;
    constants.T_CLASS = 353;
    //constants.T_TRAIT = ;
    constants.T_INTERFACE = 354;
    constants.T_EXTENDS = 355;
    constants.T_IMPLEMENTS = 356;
    constants.T_OBJECT_OPERATOR = 357;
    constants.T_DOUBLE_ARROW = 358;
    constants.T_LIST = 359;
    constants.T_ARRAY = 360;
    //constants.T_CALLABLE = ;
    constants.T_CLASS_C = 361;
    //constants.T_TRAIT_C = ;
    constants.T_METHOD_C = 362;
    constants.T_FUNC_C = 363;
    constants.T_LINE = 364;
    constants.T_FILE = 365;
    constants.T_COMMENT = 366;
    constants.T_DOC_COMMENT = 367;
    constants.T_OPEN_TAG = 368;
    constants.T_OPEN_TAG_WITH_ECHO = 369;
    constants.T_CLOSE_TAG = 370;
    constants.T_WHITESPACE = 371;
    constants.T_START_HEREDOC = 372;
    constants.T_END_HEREDOC = 373;
    constants.T_DOLLAR_OPEN_CURLY_BRACES = 374;
    constants.T_CURLY_OPEN = 375;
    constants.T_DOUBLE_COLON = 376;
    constants.T_PAAMAYIM_NEKUDOTAYIM = 376;
    constants.T_NAMESPACE = 377;
    constants.T_NS_C = 378;
    constants.T_DIR = 379;
    constants.T_NS_SEPARATOR = 380;



    for (var key in constants) {
        if (constants[key] === token[PHP.Compiler.prototype.VARIABLE_VALUE]) {
            return new PHP.VM.Variable(key);
        }
    }

    return new PHP.VM.Variable("UNKNOWN");





};
/* Automatically built from PHP version: 5.4.0-ZS5.6.0 */
PHP.Constants.CONNECTION_ABORTED = 1;
PHP.Constants.CONNECTION_NORMAL = 0;
PHP.Constants.CONNECTION_TIMEOUT = 2;
PHP.Constants.INI_USER = 1;
PHP.Constants.INI_PERDIR = 2;
PHP.Constants.INI_SYSTEM = 4;
PHP.Constants.INI_ALL = 7;
PHP.Constants.INI_SCANNER_NORMAL = 0;
PHP.Constants.INI_SCANNER_RAW = 1;
PHP.Constants.PHP_URL_SCHEME = 0;
PHP.Constants.PHP_URL_HOST = 1;
PHP.Constants.PHP_URL_PORT = 2;
PHP.Constants.PHP_URL_USER = 3;
PHP.Constants.PHP_URL_PASS = 4;
PHP.Constants.PHP_URL_PATH = 5;
PHP.Constants.PHP_URL_QUERY = 6;
PHP.Constants.PHP_URL_FRAGMENT = 7;
PHP.Constants.PHP_QUERY_RFC1738 = 1;
PHP.Constants.PHP_QUERY_RFC3986 = 2;
PHP.Constants.M_E = 2.718281828459;
PHP.Constants.M_LOG2E = 1.442695040889;
PHP.Constants.M_LOG10E = 0.43429448190325;
PHP.Constants.M_LN2 = 0.69314718055995;
PHP.Constants.M_LN10 = 2.302585092994;
PHP.Constants.M_PI = 3.1415926535898;
PHP.Constants.M_PI_2 = 1.5707963267949;
PHP.Constants.M_PI_4 = 0.78539816339745;
PHP.Constants.M_1_PI = 0.31830988618379;
PHP.Constants.M_2_PI = 0.63661977236758;
PHP.Constants.M_SQRTPI = 1.7724538509055;
PHP.Constants.M_2_SQRTPI = 1.1283791670955;
PHP.Constants.M_LNPI = 1.1447298858494;
PHP.Constants.M_EULER = 0.57721566490153;
PHP.Constants.M_SQRT2 = 1.4142135623731;
PHP.Constants.M_SQRT1_2 = 0.70710678118655;
PHP.Constants.M_SQRT3 = 1.7320508075689;
PHP.Constants.INF = "INF";
PHP.Constants.NAN = "NAN";
PHP.Constants.PHP_ROUND_HALF_UP = 1;
PHP.Constants.PHP_ROUND_HALF_DOWN = 2;
PHP.Constants.PHP_ROUND_HALF_EVEN = 3;
PHP.Constants.PHP_ROUND_HALF_ODD = 4;
PHP.Constants.INFO_GENERAL = 1;
PHP.Constants.INFO_CREDITS = 2;
PHP.Constants.INFO_CONFIGURATION = 4;
PHP.Constants.INFO_MODULES = 8;
PHP.Constants.INFO_ENVIRONMENT = 16;
PHP.Constants.INFO_VARIABLES = 32;
PHP.Constants.INFO_LICENSE = 64;
PHP.Constants.INFO_ALL = -1;
PHP.Constants.CREDITS_GROUP = 1;
PHP.Constants.CREDITS_GENERAL = 2;
PHP.Constants.CREDITS_SAPI = 4;
PHP.Constants.CREDITS_MODULES = 8;
PHP.Constants.CREDITS_DOCS = 16;
PHP.Constants.CREDITS_FULLPAGE = 32;
PHP.Constants.CREDITS_QA = 64;
PHP.Constants.CREDITS_ALL = -1;
PHP.Constants.HTML_SPECIALCHARS = 0;
PHP.Constants.HTML_ENTITIES = 1;
PHP.Constants.ENT_COMPAT = 2;
PHP.Constants.ENT_QUOTES = 3;
PHP.Constants.ENT_NOQUOTES = 0;
PHP.Constants.ENT_IGNORE = 4;
PHP.Constants.ENT_SUBSTITUTE = 8;
PHP.Constants.ENT_DISALLOWED = 128;
PHP.Constants.ENT_HTML401 = 0;
PHP.Constants.ENT_XML1 = 16;
PHP.Constants.ENT_XHTML = 32;
PHP.Constants.ENT_HTML5 = 48;
PHP.Constants.STR_PAD_LEFT = 0;
PHP.Constants.STR_PAD_RIGHT = 1;
PHP.Constants.STR_PAD_BOTH = 2;
PHP.Constants.PATHINFO_DIRNAME = 1;
PHP.Constants.PATHINFO_BASENAME = 2;
PHP.Constants.PATHINFO_EXTENSION = 4;
PHP.Constants.PATHINFO_FILENAME = 8;
PHP.Constants.CHAR_MAX = 127;
PHP.Constants.LC_CTYPE = 2;
PHP.Constants.LC_NUMERIC = 4;
PHP.Constants.LC_TIME = 5;
PHP.Constants.LC_COLLATE = 1;
PHP.Constants.LC_MONETARY = 3;
PHP.Constants.LC_ALL = 0;
PHP.Constants.SEEK_SET = 0;
PHP.Constants.SEEK_CUR = 1;
PHP.Constants.SEEK_END = 2;
PHP.Constants.LOCK_SH = 1;
PHP.Constants.LOCK_EX = 2;
PHP.Constants.LOCK_UN = 3;
PHP.Constants.LOCK_NB = 4;
PHP.Constants.STREAM_NOTIFY_CONNECT = 2;
PHP.Constants.STREAM_NOTIFY_AUTH_REQUIRED = 3;
PHP.Constants.STREAM_NOTIFY_AUTH_RESULT = 10;
PHP.Constants.STREAM_NOTIFY_MIME_TYPE_IS = 4;
PHP.Constants.STREAM_NOTIFY_FILE_SIZE_IS = 5;
PHP.Constants.STREAM_NOTIFY_REDIRECTED = 6;
PHP.Constants.STREAM_NOTIFY_PROGRESS = 7;
PHP.Constants.STREAM_NOTIFY_FAILURE = 9;
PHP.Constants.STREAM_NOTIFY_COMPLETED = 8;
PHP.Constants.STREAM_NOTIFY_RESOLVE = 1;
PHP.Constants.STREAM_NOTIFY_SEVERITY_INFO = 0;
PHP.Constants.STREAM_NOTIFY_SEVERITY_WARN = 1;
PHP.Constants.STREAM_NOTIFY_SEVERITY_ERR = 2;
PHP.Constants.STREAM_FILTER_READ = 1;
PHP.Constants.STREAM_FILTER_WRITE = 2;
PHP.Constants.STREAM_FILTER_ALL = 3;
PHP.Constants.STREAM_CLIENT_PERSISTENT = 1;
PHP.Constants.STREAM_CLIENT_ASYNC_CONNECT = 2;
PHP.Constants.STREAM_CLIENT_CONNECT = 4;
PHP.Constants.STREAM_CRYPTO_METHOD_SSLv2_CLIENT = 0;
PHP.Constants.STREAM_CRYPTO_METHOD_SSLv3_CLIENT = 1;
PHP.Constants.STREAM_CRYPTO_METHOD_SSLv23_CLIENT = 2;
PHP.Constants.STREAM_CRYPTO_METHOD_TLS_CLIENT = 3;
PHP.Constants.STREAM_CRYPTO_METHOD_SSLv2_SERVER = 4;
PHP.Constants.STREAM_CRYPTO_METHOD_SSLv3_SERVER = 5;
PHP.Constants.STREAM_CRYPTO_METHOD_SSLv23_SERVER = 6;
PHP.Constants.STREAM_CRYPTO_METHOD_TLS_SERVER = 7;
PHP.Constants.STREAM_SHUT_RD = 0;
PHP.Constants.STREAM_SHUT_WR = 1;
PHP.Constants.STREAM_SHUT_RDWR = 2;
PHP.Constants.STREAM_PF_INET = 2;
PHP.Constants.STREAM_PF_UNIX = 1;
PHP.Constants.STREAM_IPPROTO_IP = 0;
PHP.Constants.STREAM_IPPROTO_TCP = 6;
PHP.Constants.STREAM_IPPROTO_UDP = 17;
PHP.Constants.STREAM_IPPROTO_ICMP = 1;
PHP.Constants.STREAM_IPPROTO_RAW = 255;
PHP.Constants.STREAM_SOCK_STREAM = 1;
PHP.Constants.STREAM_SOCK_DGRAM = 2;
PHP.Constants.STREAM_SOCK_RAW = 3;
PHP.Constants.STREAM_SOCK_SEQPACKET = 5;
PHP.Constants.STREAM_SOCK_RDM = 4;
PHP.Constants.STREAM_PEEK = 2;
PHP.Constants.STREAM_OOB = 1;
PHP.Constants.STREAM_SERVER_BIND = 4;
PHP.Constants.STREAM_SERVER_LISTEN = 8;
PHP.Constants.FILE_USE_INCLUDE_PATH = 1;
PHP.Constants.FILE_IGNORE_NEW_LINES = 2;
PHP.Constants.FILE_SKIP_EMPTY_LINES = 4;
PHP.Constants.FILE_APPEND = 8;
PHP.Constants.FILE_NO_DEFAULT_CONTEXT = 16;
PHP.Constants.FILE_TEXT = 0;
PHP.Constants.FILE_BINARY = 0;
PHP.Constants.FNM_NOESCAPE = 1;
PHP.Constants.FNM_PATHNAME = 2;
PHP.Constants.FNM_PERIOD = 4;
PHP.Constants.FNM_CASEFOLD = 16;
PHP.Constants.PSFS_PASS_ON = 2;
PHP.Constants.PSFS_FEED_ME = 1;
PHP.Constants.PSFS_ERR_FATAL = 0;
PHP.Constants.PSFS_FLAG_NORMAL = 0;
PHP.Constants.PSFS_FLAG_FLUSH_INC = 1;
PHP.Constants.PSFS_FLAG_FLUSH_CLOSE = 2;
PHP.Constants.CRYPT_SALT_LENGTH = 123;
PHP.Constants.CRYPT_STD_DES = 1;
PHP.Constants.CRYPT_EXT_DES = 1;
PHP.Constants.CRYPT_MD5 = 1;
PHP.Constants.CRYPT_BLOWFISH = 1;
PHP.Constants.CRYPT_SHA256 = 1;
PHP.Constants.CRYPT_SHA512 = 1;
PHP.Constants.DIRECTORY_SEPARATOR = "\\";
PHP.Constants.PATH_SEPARATOR = ";";
PHP.Constants.SCANDIR_SORT_ASCENDING = 0;
PHP.Constants.SCANDIR_SORT_DESCENDING = 1;
PHP.Constants.SCANDIR_SORT_NONE = 2;
PHP.Constants.GLOB_BRACE = 128;
PHP.Constants.GLOB_MARK = 8;
PHP.Constants.GLOB_NOSORT = 32;
PHP.Constants.GLOB_NOCHECK = 16;
PHP.Constants.GLOB_NOESCAPE = 4096;
PHP.Constants.GLOB_ERR = 4;
PHP.Constants.GLOB_ONLYDIR = 1073741824;
PHP.Constants.GLOB_AVAILABLE_FLAGS = 1073746108;
PHP.Constants.LOG_EMERG = 1;
PHP.Constants.LOG_ALERT = 1;
PHP.Constants.LOG_CRIT = 1;
PHP.Constants.LOG_ERR = 4;
PHP.Constants.LOG_WARNING = 5;
PHP.Constants.LOG_NOTICE = 6;
PHP.Constants.LOG_INFO = 6;
PHP.Constants.LOG_DEBUG = 6;
PHP.Constants.LOG_KERN = 0;
PHP.Constants.LOG_USER = 8;
PHP.Constants.LOG_MAIL = 16;
PHP.Constants.LOG_DAEMON = 24;
PHP.Constants.LOG_AUTH = 32;
PHP.Constants.LOG_SYSLOG = 40;
PHP.Constants.LOG_LPR = 48;
PHP.Constants.LOG_NEWS = 56;
PHP.Constants.LOG_UUCP = 64;
PHP.Constants.LOG_CRON = 72;
PHP.Constants.LOG_AUTHPRIV = 80;
PHP.Constants.LOG_PID = 1;
PHP.Constants.LOG_CONS = 2;
PHP.Constants.LOG_ODELAY = 4;
PHP.Constants.LOG_NDELAY = 8;
PHP.Constants.LOG_NOWAIT = 16;
PHP.Constants.LOG_PERROR = 32;
PHP.Constants.EXTR_OVERWRITE = 0;
PHP.Constants.EXTR_SKIP = 1;
PHP.Constants.EXTR_PREFIX_SAME = 2;
PHP.Constants.EXTR_PREFIX_ALL = 3;
PHP.Constants.EXTR_PREFIX_INVALID = 4;
PHP.Constants.EXTR_PREFIX_IF_EXISTS = 5;
PHP.Constants.EXTR_IF_EXISTS = 6;
PHP.Constants.EXTR_REFS = 256;
PHP.Constants.SORT_ASC = 4;
PHP.Constants.SORT_DESC = 3;
PHP.Constants.SORT_REGULAR = 0;
PHP.Constants.SORT_NUMERIC = 1;
PHP.Constants.SORT_STRING = 2;
PHP.Constants.SORT_LOCALE_STRING = 5;
PHP.Constants.SORT_NATURAL = 6;
PHP.Constants.SORT_FLAG_CASE = 8;
PHP.Constants.CASE_LOWER = 0;
PHP.Constants.CASE_UPPER = 1;
PHP.Constants.COUNT_NORMAL = 0;
PHP.Constants.COUNT_RECURSIVE = 1;
PHP.Constants.ASSERT_ACTIVE = 1;
PHP.Constants.ASSERT_CALLBACK = 2;
PHP.Constants.ASSERT_BAIL = 3;
PHP.Constants.ASSERT_WARNING = 4;
PHP.Constants.ASSERT_QUIET_EVAL = 5;
PHP.Constants.STREAM_USE_PATH = 1;
PHP.Constants.STREAM_IGNORE_URL = 2;
PHP.Constants.STREAM_REPORT_ERRORS = 8;
PHP.Constants.STREAM_MUST_SEEK = 16;
PHP.Constants.STREAM_URL_STAT_LINK = 1;
PHP.Constants.STREAM_URL_STAT_QUIET = 2;
PHP.Constants.STREAM_MKDIR_RECURSIVE = 1;
PHP.Constants.STREAM_IS_URL = 1;
PHP.Constants.STREAM_OPTION_BLOCKING = 1;
PHP.Constants.STREAM_OPTION_READ_TIMEOUT = 4;
PHP.Constants.STREAM_OPTION_READ_BUFFER = 2;
PHP.Constants.STREAM_OPTION_WRITE_BUFFER = 3;
PHP.Constants.STREAM_BUFFER_NONE = 0;
PHP.Constants.STREAM_BUFFER_LINE = 1;
PHP.Constants.STREAM_BUFFER_FULL = 2;
PHP.Constants.STREAM_CAST_AS_STREAM = 0;
PHP.Constants.STREAM_CAST_FOR_SELECT = 3;
PHP.Constants.STREAM_META_TOUCH = 1;
PHP.Constants.STREAM_META_OWNER = 3;
PHP.Constants.STREAM_META_OWNER_NAME = 2;
PHP.Constants.STREAM_META_GROUP = 5;
PHP.Constants.STREAM_META_GROUP_NAME = 4;
PHP.Constants.STREAM_META_ACCESS = 6;
PHP.Constants.IMAGETYPE_GIF = 1;
PHP.Constants.IMAGETYPE_JPEG = 2;
PHP.Constants.IMAGETYPE_PNG = 3;
PHP.Constants.IMAGETYPE_SWF = 4;
PHP.Constants.IMAGETYPE_PSD = 5;
PHP.Constants.IMAGETYPE_BMP = 6;
PHP.Constants.IMAGETYPE_TIFF_II = 7;
PHP.Constants.IMAGETYPE_TIFF_MM = 8;
PHP.Constants.IMAGETYPE_JPC = 9;
PHP.Constants.IMAGETYPE_JP2 = 10;
PHP.Constants.IMAGETYPE_JPX = 11;
PHP.Constants.IMAGETYPE_JB2 = 12;
PHP.Constants.IMAGETYPE_SWC = 13;
PHP.Constants.IMAGETYPE_IFF = 14;
PHP.Constants.IMAGETYPE_WBMP = 15;
PHP.Constants.IMAGETYPE_JPEG2000 = 9;
PHP.Constants.IMAGETYPE_XBM = 16;
PHP.Constants.IMAGETYPE_ICO = 17;
PHP.Constants.IMAGETYPE_UNKNOWN = 0;
PHP.Constants.IMAGETYPE_COUNT = 18;
PHP.Constants.DNS_A = 1;
PHP.Constants.DNS_NS = 2;
PHP.Constants.DNS_CNAME = 16;
PHP.Constants.DNS_SOA = 32;
PHP.Constants.DNS_PTR = 2048;
PHP.Constants.DNS_HINFO = 4096;
PHP.Constants.DNS_MX = 16384;
PHP.Constants.DNS_TXT = 32768;
PHP.Constants.DNS_SRV = 33554432;
PHP.Constants.DNS_NAPTR = 67108864;
PHP.Constants.DNS_AAAA = 134217728;
PHP.Constants.DNS_A6 = 16777216;
PHP.Constants.DNS_ANY = 268435456;
PHP.Constants.DNS_ALL = 251713587;

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 6.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.$empty = function (arg) {

    var len = arguments.length,
        i = -1,
        arg,
        COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;


    // http://www.php.net/manual/en/types.comparisons.php

    if (arg instanceof PHP.VM.Variable) {
        var tmp = arg[COMPILER.VARIABLE_VALUE];
        return new PHP.VM.Variable(((arg[VARIABLE.TYPE] === VARIABLE.NULL || tmp === "" || tmp == 0 || tmp === false)));
    } else {
        return new PHP.VM.Variable(arg);
    }



};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 20.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.gettype = function (arg) {

    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;



    var tmp = arg[COMPILER.VARIABLE_VALUE], // trigger get
        type = "unknown type";

    switch (arg[VARIABLE.TYPE]) {

        case VARIABLE.BOOL:
            type = "boolean";
            break;
        case VARIABLE.INT:
            type = "integer";
            break;
        case VARIABLE.FLOAT:
            type = "double";
            break;
        case VARIABLE.STRING:
            type = "string";
            break;
        case VARIABLE.ARRAY:
            type = "array";
            break;
        case VARIABLE.OBJECT:
            type = "object";
            break;
        case VARIABLE.RESOURCE:
            type = "resource";
            break;
        case VARIABLE.NULL:
            type = "NULL";
            break;



    }

    return new PHP.VM.Variable(type);


};

/*
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 4.7.2012
 * @website http://hertzen.com
 */


PHP.Modules.prototype.is_callable = function (callback) {

    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;

    if (callback[VARIABLE.TYPE] === VARIABLE.ARRAY) {
        var Class = callback[COMPILER.VARIABLE_VALUE][COMPILER.METHOD_CALL](this, COMPILER.ARRAY_GET, 0)[COMPILER.VARIABLE_VALUE],
            methodName = callback[COMPILER.VARIABLE_VALUE][COMPILER.METHOD_CALL](this, COMPILER.ARRAY_GET, 1)[COMPILER.VARIABLE_VALUE];

        return new PHP.VM.Variable(typeof Class[PHP.VM.Class.METHOD + methodName.toLowerCase()] === "function");

    }
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 13.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.is_float = function (variable) {

    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;

    return new PHP.VM.Variable(variable[VARIABLE.TYPE] === VARIABLE.FLOAT);



};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 15.7.2012 
 * @website http://hertzen.com
 */




PHP.Modules.prototype.is_null = function (variable) {

    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;

    return new PHP.VM.Variable(variable[VARIABLE.TYPE] === VARIABLE.NULL);



};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 13.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.is_string = function (variable) {

    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;

    return new PHP.VM.Variable(variable[VARIABLE.TYPE] === VARIABLE.STRING);



};
PHP.Modules.prototype.$isset = function () {

    var len = arguments.length,
        i = -1,
        arg,
        VARIABLE = PHP.VM.Variable.prototype;

    while (++i < len) {
        arg = arguments[i];

        // http://www.php.net/manual/en/types.comparisons.php

        if (arg instanceof PHP.VM.Variable) {
            if (arg[VARIABLE.TYPE] === VARIABLE.NULL) {
                return new PHP.VM.Variable(false);
            }
        } else if (arg === false) {
            return new PHP.VM.Variable(false);
        }



    }

    return new PHP.VM.Variable(true);

};


/*
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 26.6.2012
 * @website http://hertzen.com
 */


PHP.Modules.prototype.print_r = function () {

    var str = "",
        indent = 0,
        COMPILER = PHP.Compiler.prototype,
        PRIVATE = PHP.VM.Class.PRIVATE,
        PROTECTED = PHP.VM.Class.PROTECTED,
        PROPERTY = PHP.VM.Class.PROPERTY,
        VAR = PHP.VM.Variable.prototype;

    if (this[COMPILER.DISPLAY_HANDLER] === true) {
        this[COMPILER.ERROR]("print_r(): Cannot use output buffering in output buffering display handlers", PHP.Constants.E_ERROR, true);
    }

    var $dump = function (argument, indent) {
            var str = "",
                value = argument[COMPILER.VARIABLE_VALUE],
                ARG_TYPE = argument[VAR.TYPE]; // trigger get for undefined

            if (ARG_TYPE === VAR.ARRAY) {
                str += "Array\n";
                str += $INDENT(indent) + "(";
                var values = value[PROPERTY + PHP.VM.Array.prototype.VALUES][COMPILER.VARIABLE_VALUE];
                var keys = value[PROPERTY + PHP.VM.Array.prototype.KEYS][COMPILER.VARIABLE_VALUE];

                str += "\n";

                keys.forEach(function (key, index) {
                    str += $INDENT(indent + 4) + "[";
                    if (key instanceof PHP.VM.Variable) {
                        str += key[COMPILER.VARIABLE_VALUE]; // constants
                    } else {
                        str += key;
                    }
                    str += "] => ";

                    str += $dump(values[index], indent + 8) + "\n";



                }, this);

                str += $INDENT(indent) + ")\n";
            } else if (ARG_TYPE === VAR.OBJECT || argument instanceof PHP.VM.ClassPrototype) {
                var classObj;
                if (argument instanceof PHP.VM.Variable) {
                    classObj = value;
                } else {
                    classObj = argument;
                }
                str += classObj[COMPILER.CLASS_NAME] + " Object\n";
                str += $INDENT(indent) + "(\n";


                var added = false,
                    definedItems = [],
                    tmp = "";

                // search whole prototype chain
                for (var item in classObj) {
                    if (item.substring(0, PROPERTY.length) === PROPERTY) {


                        if (classObj.hasOwnProperty(item)) {
                            definedItems.push(item);
                            str += $INDENT(indent + 4) + '[' + item.substring(PROPERTY.length);
                            str += '] => ';
                            str += $dump(classObj[item], indent + 8);
                            str += "\n";
                        }
                        //  props.push( item );

                        var parent = classObj;
                        // search for overwritten private members
                        do {

                            if (parent.hasOwnProperty(item)) {

                                if ((Object.getPrototypeOf(parent)[PHP.VM.Class.PROPERTY_TYPE + item.substring(PROPERTY.length)] & PRIVATE) === PRIVATE) {
                                    str += $INDENT(indent + 4) + '[' + item.substring(PROPERTY.length) + ':' + Object.getPrototypeOf(parent)[COMPILER.CLASS_NAME] + ':private] => ';
                                    str += $dump(parent[item], indent + 8);
                                    str += "\n";
                                } else if ((Object.getPrototypeOf(parent)[PHP.VM.Class.PROPERTY_TYPE + item.substring(PROPERTY.length)] & PROTECTED) === PROTECTED && definedItems.indexOf(item) === -1) {
                                    str += $INDENT(indent + 4) + '[' + item.substring(PROPERTY.length) + ':' + Object.getPrototypeOf(parent)[COMPILER.CLASS_NAME] + ':protected] => ';
                                    str += $dump(parent[item], indent + 8);
                                    str += "\n";
                                    definedItems.push(item);
                                } else if (definedItems.indexOf(item) === -1) {
                                    str += $INDENT(indent + 4) + '[' + item.substring(PROPERTY.length) + '] => ';
                                    str += $dump(parent[item], indent + 8);
                                    str += "\n";
                                    definedItems.push(item);
                                }
                            }
                            parent = Object.getPrototypeOf(parent);
                        } while (parent instanceof PHP.VM.ClassPrototype);




                    }
                }
                str += tmp;




                str += $INDENT(indent) + ")\n";

            } else if (ARG_TYPE === VAR.NULL) {
                str += $INDENT(indent) + "NULL";
            } else if (ARG_TYPE === VAR.STRING) {


                str += value;
            } else if (ARG_TYPE === VAR.INT) {


                str += value;

            }
            return str;
        },
        $INDENT = function (num) {
            var str = "",
                i;
            for (i = 0; i < num; i++) {
                str += " ";
            }
            return str;
        };

    PHP.Utils.$A(arguments).forEach(function (argument) {
        str += $dump(argument, 0);
    }, this);

    this.echo(str);
};
/*
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 22.7.2012
 * @website http://hertzen.com
 */
PHP.Modules.prototype.serialize = function (valueObj) {

    var COMPILER = PHP.Compiler.prototype,
        serialize = "serialize",
        __sleep = "__sleep",
        VARIABLE = PHP.VM.Variable.prototype;

    var item,
        str = "",
        func = function (item) {
            var val = item[COMPILER.VARIABLE_VALUE],
                str = "";

            switch (item[VARIABLE.TYPE]) {

                case VARIABLE.NULL:
                    str += "N;";
                    break;

                case VARIABLE.STRING:

                    str += val.length + ":{" + val + "}";


                    break;
                default:

            }

            return str;

        }.bind(this),
        value = valueObj[COMPILER.VARIABLE_VALUE];

    // serializable interface
    if ((value[PHP.VM.Class.METHOD + serialize]) !== undefined) {
        item = value[COMPILER.METHOD_CALL](this, serialize);

        if (item[VARIABLE.TYPE] !== VARIABLE.NULL && item[VARIABLE.TYPE] !== VARIABLE.STRING) {
            this.ENV[COMPILER.ERROR](value[COMPILER.CLASS_NAME] + "::" + serialize + "() must return a string or NULL", PHP.Constants.E_ERROR, true);
            return new PHP.VM.Variable();
        }

    } else {

        item = value;

        if ((value[PHP.VM.Class.METHOD + __sleep]) !== undefined) {
            item = value[COMPILER.METHOD_CALL](this, __sleep);

            if (item[VARIABLE.TYPE] !== VARIABLE.ARRAY) {
                this.ENV[COMPILER.ERROR](value[COMPILER.CLASS_NAME] + "::" + serialize + "() must return a string or NULL", PHP.Constants.E_ERROR, true);
                return new PHP.VM.Variable();
            }

            item[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.VALUES][COMPILER.VARIABLE_VALUE].forEach(function (member) {

                if (value[PHP.VM.Class.PROPERTY + member[COMPILER.VARIABLE_VALUE]] === undefined) {
                    this.ENV[COMPILER.ERROR](serialize + '(): "' + member[COMPILER.VARIABLE_VALUE] + '" returned as member variable from ' + __sleep + "() but does not exist", PHP.Constants.E_NOTICE, true);
                }


            }, this);

            str += "O:" + value[COMPILER.CLASS_NAME].length + ':"' + value[COMPILER.CLASS_NAME] + '":';



        }

    }

    if (item instanceof PHP.VM.Variable) {
        if (item[VARIABLE.TYPE] === VARIABLE.ARRAY) {
            var arr = item[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.VALUES][COMPILER.VARIABLE_VALUE];
            str += arr.length + ":{";
            arr.forEach(function (arrItem) {

                if ((value[PHP.VM.Class.PROPERTY_TYPE + arrItem[COMPILER.VARIABLE_VALUE]] & PHP.VM.Class.PRIVATE) === PHP.VM.Class.PRIVATE) {
                    str += "s:" + (2 + value[COMPILER.CLASS_NAME].length + arrItem[COMPILER.VARIABLE_VALUE].length) + ":";
                    str += '"\\0' + value[COMPILER.CLASS_NAME] + "\\0" + arrItem[COMPILER.VARIABLE_VALUE] + '";';
                } else if ((value[PHP.VM.Class.PROPERTY_TYPE + arrItem[COMPILER.VARIABLE_VALUE]] & PHP.VM.Class.PROTECTED) === PHP.VM.Class.PROTECTED) {
                    str += "s:" + (3 + arrItem[COMPILER.VARIABLE_VALUE].length) + ":";
                    str += '"\\0*\\0' + arrItem[COMPILER.VARIABLE_VALUE] + '";';
                } else {
                    str += "s:" + (arrItem[COMPILER.VARIABLE_VALUE].length) + ":";
                    str += '"' + arrItem[COMPILER.VARIABLE_VALUE] + '";';
                }

                var tmp = value[PHP.VM.Class.PROPERTY + arrItem[COMPILER.VARIABLE_VALUE]];

                if (tmp !== undefined) {
                    tmp = tmp[COMPILER.VARIABLE_VALUE];
                    str += "s:" + tmp.length + ':"' + tmp + '";';
                } else {
                    str += "N;";
                }


            });
            str += "}"
        } else if (item[VARIABLE.TYPE] !== VARIABLE.NULL) {
            str += "C:" + value[COMPILER.CLASS_NAME].length + ':"' + value[COMPILER.CLASS_NAME] + '":' + func(item);
        } else {
            str += "N;"
        }

    }


    return new PHP.VM.Variable(str);



};



/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 22.7.2012 
 * @website http://hertzen.com
 */
PHP.Modules.prototype.unserialize = function (valueObj) {

    var COMPILER = PHP.Compiler.prototype,
        unserialize = "unserialize",
        VARIABLE = PHP.VM.Variable.prototype;


    var value = valueObj[COMPILER.VARIABLE_VALUE],
        parts = value.split(":");


    var item, pos, len, val;
    /*
    switch( parts[ 0 ]) {
        case "C":
            
            item = new (this.$Class.Get( parts[ 2 ].substring(1, parts[ 2 ].length - 1 ) ))( true );
            pos = 6 + parts[ 1 ].length + (parts[ 1 ]-0);
            
            break;
        case "N;":
            item = null;
            pos = 2;
            break;
    }
    */


    //value = value.substring( pos );

    // todo add proper unserialization
    while (value.length > 0) {
        var pos = value.indexOf(":");
        if (pos !== -1) {
            if (item === undefined) {
                len = value.substring(0, pos);
                switch (len) {

                    case "O":
                        var className = parts[2].substring(1, parts[2].length - 1),
                            tmp = this.$Class.__autoload(className);
                        item = new(this.$Class.Get("__PHP_Incomplete_Class"))(this, className);
                        value = value.substring(100); // tmp fix
                        break;

                    case "C":

                        item = new(this.$Class.Get(parts[2].substring(1, parts[2].length - 1)))(true);
                        pos = 6 + parts[1].length + (parts[1] - 0);
                        value = value.substring(pos);
                        continue;

                        break;
                    case "N;":
                        item = null;
                        pos = 2;
                        value = value.substring(pos);
                        continue;
                        break;

                }
            } else {
                len = value.substring(0, pos);
            }
        } else {
            break;
        }
        value = value.substring(len.length + 1);
        val = value.substr(1, len);
        value = value.substring(val.length + 2);



    }



    if (item !== null && item !== undefined && (item[PHP.VM.Class.METHOD + unserialize]) !== undefined) {
        item[COMPILER.METHOD_CALL](this, unserialize, new PHP.VM.Variable(val));

    }



    return new PHP.VM.Variable(item);



};



/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 1.7.2012 
 * @website http://hertzen.com
 */


PHP.Modules.prototype.unset = function () {

    PHP.Utils.$A(arguments).forEach(function (arg) {
        if (arg !== undefined) {
            arg[PHP.Compiler.prototype.UNSET]();
        }
    }, this);

};
PHP.Modules.prototype.var_dump = function () {

    var str = "",
        indent = 0,
        COMPILER = PHP.Compiler.prototype,
        VAR = PHP.VM.Variable.prototype;

    var $dump = function (argument, indent) {

            var str = "",
                value = argument[COMPILER.VARIABLE_VALUE],
                ARG_TYPE = argument[VAR.TYPE]; // trigger get for undefined
            str += $INDENT(indent);

            if (ARG_TYPE === VAR.NULL || (argument[VAR.DEFINED] !== true && !(argument instanceof PHP.VM.ClassPrototype))) {

                str += "NULL\n";
            } else if (ARG_TYPE === VAR.ARRAY) {
                str += "array(";

                var values = value[PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.VALUES][COMPILER.VARIABLE_VALUE];
                var keys = value[PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.KEYS][COMPILER.VARIABLE_VALUE];

                str += values.length;

                str += ") {\n";

                keys.forEach(function (key, index) {

                    if (key instanceof PHP.VM.Variable) {
                        key = key[COMPILER.VARIABLE_VALUE];
                    }

                    str += $INDENT(indent + 2) + "[";
                    if (typeof key === "string") {
                        str += '"' + key + '"';
                    } else {
                        str += key;
                    }
                    str += "]=>\n";
                    str += $dump(values[index], indent + 2);

                }, this);

                str += $INDENT(indent) + "}\n";
            } else if (ARG_TYPE === VAR.BOOL) {
                str += "bool(" + value + ")\n";
            } else if (ARG_TYPE === VAR.STRING) {

                str += "string(" + value.length + ') "' + value + '"\n';
            } else if (ARG_TYPE === VAR.INT) {
                str += "int(" + value + ')\n';
            } else if (argument instanceof PHP.VM.ClassPrototype || ARG_TYPE === VAR.OBJECT) {
                // todo, complete
                if (ARG_TYPE === VAR.OBJECT) {
                    argument = value;
                }

                str += "object(" + argument[COMPILER.CLASS_NAME] + ')#1 ';



                // search whole prototype chain

                var tmp = "",
                    count = 0;

                for (var item in argument) {
                    var ignore = false,
                        parent;
                    if (item.substring(0, PHP.VM.Class.PROPERTY.length) === PHP.VM.Class.PROPERTY) {

                        if (!((argument[PHP.VM.Class.PROPERTY_TYPE + item.substring(PHP.VM.Class.PROPERTY.length)] & PHP.VM.Class.PRIVATE) === PHP.VM.Class.PRIVATE) && !((argument[PHP.VM.Class.PROPERTY_TYPE + item.substring(PHP.VM.Class.PROPERTY.length)] & PHP.VM.Class.PROTECTED) === PHP.VM.Class.PROTECTED)) {

                            tmp += $INDENT(indent + 2) + '["' + item.substring(PHP.VM.Class.PROPERTY.length);
                            tmp += '"]=>\n';
                            tmp += $dump(argument[item], indent + 2);
                            count++;
                        } else {
                            ignore = true;
                        }

                    }

                    parent = argument;
                    // search for overwritten private members
                    do {
                        if ((argument[item] !== parent[item] || ignore) && parent[item] instanceof PHP.VM.Variable && parent.hasOwnProperty(item)) {


                            tmp += $INDENT(indent + 2) + '["' + item.substring(PHP.VM.Class.PROPERTY.length) + '":';
                            if ((argument[PHP.VM.Class.PROPERTY_TYPE + item.substring(PHP.VM.Class.PROPERTY.length)] & PHP.VM.Class.PRIVATE) === PHP.VM.Class.PRIVATE) {
                                tmp += '"' + Object.getPrototypeOf(parent)[COMPILER.CLASS_NAME] + '":' + "private";
                            } else {
                                tmp += "protected";
                            }

                            tmp += ']=>\n';
                            tmp += $dump(parent[item], indent + 2);
                            count++;
                        }
                        parent = Object.getPrototypeOf(parent);
                    } while (parent instanceof PHP.VM.ClassPrototype);

                }


                str += '(' + count + ') {\n' + tmp;





                str += $INDENT(indent) + '}\n';
            } else if (ARG_TYPE === VAR.FLOAT) {
                str += "float(" + value + ')\n';
            }

            return str;
        }.bind(this),
        $INDENT = function (num) {
            var str = "",
                i;
            for (i = 0; i < num; i++) {
                str += " ";
            }
            return str;
        };

    PHP.Utils.$A(arguments).forEach(function (argument) {
        str += $dump(argument, 0);
    }, this);

    this.echo(str);

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 15.7.2012 
 * @website http://hertzen.com
 */




PHP.Modules.prototype.var_export = function (variable, ret) {
    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;

    var val = "";

    switch (variable[VARIABLE.TYPE]) {
        case VARIABLE.STRING:
            val += "'" + variable[COMPILER.VARIABLE_VALUE] + "'";
            break;
    }

    val = new PHP.VM.Variable(val);

    if (ret === undefined || ret[COMPILER.VARIABLE_VALUE] === false) {
        this.echo(val);
    } else {
        return val;
    }

    return new PHP.VM.Variable();

};
PHP.Lexer = function (src, ini) {


    var heredoc,
        lineBreaker = function (result) {
            if (result.match(/\n/) !== null) {
                var quote = result.substring(0, 1);
                result = '[' + result.split(/\n/).join(quote + "," + quote) + '].join("\\n")';

            }

            return result;
        },
        prev,

        openTag = (ini === undefined || (/^(on|true|1)$/i.test(ini.short_open_tag)) ? /(\<\?php\s|\<\?|\<\%|\<script language\=('|")?php('|")?\>)/i : /(\<\?php\s|<\?=|\<script language\=('|")?php('|")?\>)/i),
        openTagStart = (ini === undefined || (/^(on|true|1)$/i.test(ini.short_open_tag)) ? /^(\<\?php\s|\<\?|\<\%|\<script language\=('|")?php('|")?\>)/i : /^(\<\?php\s|<\?=|\<script language\=('|")?php('|")?\>)/i),
        tokens = [{
                value: PHP.Constants.T_NAMESPACE,
                re: /^namespace(?=\s)/i
            },
            {
                value: PHP.Constants.T_USE,
                re: /^use(?=\s)/i
            },
            {
                value: PHP.Constants.T_ABSTRACT,
                re: /^abstract(?=\s)/i
            },
            {
                value: PHP.Constants.T_IMPLEMENTS,
                re: /^implements(?=\s)/i
            },
            {
                value: PHP.Constants.T_INTERFACE,
                re: /^interface(?=\s)/i
            },
            {
                value: PHP.Constants.T_CONST,
                re: /^const(?=\s)/i
            },
            {
                value: PHP.Constants.T_STATIC,
                re: /^static(?=\s)/i
            },
            {
                value: PHP.Constants.T_FINAL,
                re: /^final(?=\s)/i
            },
            {
                value: PHP.Constants.T_VAR,
                re: /^var(?=\s)/i
            },
            {
                value: PHP.Constants.T_GLOBAL,
                re: /^global(?=\s)/i
            },
            {
                value: PHP.Constants.T_CLONE,
                re: /^clone(?=\s)/i
            },
            {
                value: PHP.Constants.T_THROW,
                re: /^throw(?=\s)/i
            },
            {
                value: PHP.Constants.T_EXTENDS,
                re: /^extends(?=\s)/i
            },
            {
                value: PHP.Constants.T_AND_EQUAL,
                re: /^&=/
            },
            {
                value: PHP.Constants.T_AS,
                re: /^as(?=\s)/i
            },
            {
                value: PHP.Constants.T_ARRAY_CAST,
                re: /^\(array\)/i
            },
            {
                value: PHP.Constants.T_BOOL_CAST,
                re: /^\((bool|boolean)\)/i
            },
            {
                value: PHP.Constants.T_DOUBLE_CAST,
                re: /^\((real|float|double)\)/i
            },
            {
                value: PHP.Constants.T_INT_CAST,
                re: /^\((int|integer)\)/i
            },
            {
                value: PHP.Constants.T_OBJECT_CAST,
                re: /^\(object\)/i
            },
            {
                value: PHP.Constants.T_STRING_CAST,
                re: /^\(string\)/i
            },
            {
                value: PHP.Constants.T_UNSET_CAST,
                re: /^\(unset\)/i
            },
            {
                value: PHP.Constants.T_TRY,
                re: /^try(?=\s*{)/i
            },
            {
                value: PHP.Constants.T_CATCH,
                re: /^catch(?=\s*\()/i
            },
            {
                value: PHP.Constants.T_INSTANCEOF,
                re: /^instanceof(?=\s)/i
            },
            {
                value: PHP.Constants.T_LOGICAL_OR,
                re: /^or(?=\s)/i
            },
            {
                value: PHP.Constants.T_LOGICAL_AND,
                re: /^and(?=\s)/i
            },
            {
                value: PHP.Constants.T_LOGICAL_XOR,
                re: /^xor(?=\s)/i
            },
            {
                value: PHP.Constants.T_BOOLEAN_AND,
                re: /^&&/
            },
            {
                value: PHP.Constants.T_BOOLEAN_OR,
                re: /^\|\|/
            },
            {
                value: PHP.Constants.T_CONTINUE,
                re: /^continue(?=\s|;)/i
            },
            {
                value: PHP.Constants.T_BREAK,
                re: /^break(?=\s|;)/i
            },
            {
                value: PHP.Constants.T_ENDDECLARE,
                re: /^enddeclare(?=\s|;)/i
            },
            {
                value: PHP.Constants.T_ENDFOR,
                re: /^endfor(?=\s|;)/i
            },
            {
                value: PHP.Constants.T_ENDFOREACH,
                re: /^endforeach(?=\s|;)/i
            },
            {
                value: PHP.Constants.T_ENDIF,
                re: /^endif(?=\s|;)/i
            },
            {
                value: PHP.Constants.T_ENDSWITCH,
                re: /^endswitch(?=\s|;)/i
            },
            {
                value: PHP.Constants.T_ENDWHILE,
                re: /^endwhile(?=\s|;)/i
            },
            {
                value: PHP.Constants.T_CASE,
                re: /^case(?=\s)/i
            },
            {
                value: PHP.Constants.T_DEFAULT,
                re: /^default(?=\s|:)/i
            },
            {
                value: PHP.Constants.T_SWITCH,
                re: /^switch(?=[ (])/i
            },
            {
                value: PHP.Constants.T_EXIT,
                re: /^(exit|die)(?=[ \(;])/i
            },
            {
                value: PHP.Constants.T_CLOSE_TAG,
                re: /^(\?\>|\%\>|\<\/script\>)\s?\s?/i,
                func: function (result) {
                    insidePHP = false;
                    return result;
                }
            },
            {
                value: PHP.Constants.T_DOUBLE_ARROW,
                re: /^\=\>/
            },
            {
                value: PHP.Constants.T_DOUBLE_COLON,
                re: /^\:\:/
            },
            {
                value: PHP.Constants.T_METHOD_C,
                re: /^__METHOD__/
            },
            {
                value: PHP.Constants.T_LINE,
                re: /^__LINE__/
            },
            {
                value: PHP.Constants.T_FILE,
                re: /^__FILE__/
            },
            {
                value: PHP.Constants.T_FUNC_C,
                re: /^__FUNCTION__/
            },
            {
                value: PHP.Constants.T_NS_C,
                re: /^__NAMESPACE__/
            },
            {
                value: PHP.Constants.T_TRAIT_C,
                re: /^__TRAIT__/
            },
            {
                value: PHP.Constants.T_DIR,
                re: /^__DIR__/
            },
            {
                value: PHP.Constants.T_CLASS_C,
                re: /^__CLASS__/
            },
            {
                value: PHP.Constants.T_INC,
                re: /^\+\+/
            },
            {
                value: PHP.Constants.T_DEC,
                re: /^\-\-/
            },
            {
                value: PHP.Constants.T_CONCAT_EQUAL,
                re: /^\.\=/
            },
            {
                value: PHP.Constants.T_DIV_EQUAL,
                re: /^\/\=/
            },
            {
                value: PHP.Constants.T_XOR_EQUAL,
                re: /^\^\=/
            },
            {
                value: PHP.Constants.T_MUL_EQUAL,
                re: /^\*\=/
            },
            {
                value: PHP.Constants.T_MOD_EQUAL,
                re: /^\%\=/
            },
            {
                value: PHP.Constants.T_SL_EQUAL,
                re: /^<<=/
            },
            {
                value: PHP.Constants.T_START_HEREDOC,
                re: /^<<<[A-Z_0-9]+\s/i,
                func: function (result) {
                    heredoc = result.substring(3, result.length - 1);
                    return result;
                }
            },
            {
                value: PHP.Constants.T_SL,
                re: /^<</
            },
            {
                value: PHP.Constants.T_IS_SMALLER_OR_EQUAL,
                re: /^<=/
            },
            {
                value: PHP.Constants.T_SR_EQUAL,
                re: /^>>=/
            },
            {
                value: PHP.Constants.T_SR,
                re: /^>>/
            },
            {
                value: PHP.Constants.T_IS_GREATER_OR_EQUAL,
                re: /^>=/
            },
            {
                value: PHP.Constants.T_OR_EQUAL,
                re: /^\|\=/
            },
            {
                value: PHP.Constants.T_PLUS_EQUAL,
                re: /^\+\=/
            },
            {
                value: PHP.Constants.T_MINUS_EQUAL,
                re: /^-\=/
            },
            {
                value: PHP.Constants.T_OBJECT_OPERATOR,
                re: /^\-\>/i
            },
            {
                value: PHP.Constants.T_CLASS,
                re: /^class(?=[\s\{])/i,
                afterWhitespace: true
            },
            {
                value: PHP.Constants.T_TRAIT,
                re: /^trait(?=[\s]+[A-Za-z])/i,
            },
            {
                value: PHP.Constants.T_PUBLIC,
                re: /^public(?=[\s])/i
            },
            {
                value: PHP.Constants.T_PRIVATE,
                re: /^private(?=[\s])/i
            },
            {
                value: PHP.Constants.T_PROTECTED,
                re: /^protected(?=[\s])/i
            },
            {
                value: PHP.Constants.T_ARRAY,
                re: /^array(?=\s*?\()/i
            },
            {
                value: PHP.Constants.T_EMPTY,
                re: /^empty(?=[ \(])/i
            },
            {
                value: PHP.Constants.T_ISSET,
                re: /^isset(?=[ \(])/i
            },
            {
                value: PHP.Constants.T_UNSET,
                re: /^unset(?=[ \(])/i
            },
            {
                value: PHP.Constants.T_RETURN,
                re: /^return(?=[ "'(;])/i
            },
            {
                value: PHP.Constants.T_FUNCTION,
                re: /^function(?=[ "'(;])/i
            },
            {
                value: PHP.Constants.T_ECHO,
                re: /^echo(?=[ "'(;])/i
            },
            {
                value: PHP.Constants.T_LIST,
                re: /^list(?=\s*?\()/i
            },
            {
                value: PHP.Constants.T_PRINT,
                re: /^print(?=[ "'(;])/i
            },
            {
                value: PHP.Constants.T_INCLUDE,
                re: /^include(?=[ "'(;])/i
            },
            {
                value: PHP.Constants.T_INCLUDE_ONCE,
                re: /^include_once(?=[ "'(;])/i
            },
            {
                value: PHP.Constants.T_REQUIRE,
                re: /^require(?=[ "'(;])/i
            },
            {
                value: PHP.Constants.T_REQUIRE_ONCE,
                re: /^require_once(?=[ "'(;])/i
            },
            {
                value: PHP.Constants.T_NEW,
                re: /^new(?=[ ])/i
            },
            {
                value: PHP.Constants.T_COMMENT,
                re: /^\/\*([\S\s]*?)(?:\*\/|$)/
            },
            {
                value: PHP.Constants.T_COMMENT,
                re: /^\/\/.*(\s)?/
            },
            {
                value: PHP.Constants.T_COMMENT,
                re: /^\#.*(\s)?/
            },
            {
                value: PHP.Constants.T_ELSEIF,
                re: /^elseif(?=[\s(])/i
            },
            {
                value: PHP.Constants.T_GOTO,
                re: /^goto(?=[\s(])/i
            },
            {
                value: PHP.Constants.T_ELSE,
                re: /^else(?=[\s{:])/i
            },
            {
                value: PHP.Constants.T_IF,
                re: /^if(?=[\s(])/i
            },
            {
                value: PHP.Constants.T_DO,
                re: /^do(?=[ {])/i
            },
            {
                value: PHP.Constants.T_WHILE,
                re: /^while(?=[ (])/i
            },
            {
                value: PHP.Constants.T_FOREACH,
                re: /^foreach(?=[ (])/i
            },
            {
                value: PHP.Constants.T_ISSET,
                re: /^isset(?=[ (])/i
            },
            {
                value: PHP.Constants.T_IS_IDENTICAL,
                re: /^===/
            },
            {
                value: PHP.Constants.T_IS_EQUAL,
                re: /^==/
            },
            {
                value: PHP.Constants.T_IS_NOT_IDENTICAL,
                re: /^\!==/
            },
            {
                value: PHP.Constants.T_IS_NOT_EQUAL,
                re: /^(\!=|\<\>)/
            },
            {
                value: PHP.Constants.T_FOR,
                re: /^for(?=[ (])/i
            },

            {
                value: PHP.Constants.T_DNUMBER,
                re: /^[0-9]*\.[0-9]+([eE][-]?[0-9]*)?/
                /*,
        func: function( result ) {

            // transform e to E - token_get_all_variation1.phpt
            return (result - 0).toString().toUpperCase();
        }*/

            },
            {
                value: PHP.Constants.T_LNUMBER,
                re: /^(0x[0-9A-F]+|[0-9]+)/i
            },
            {
                value: PHP.Constants.T_OPEN_TAG_WITH_ECHO,
                re: /^(\<\?=|\<\%=)/i
            },
            {
                value: PHP.Constants.T_OPEN_TAG,
                re: openTagStart
            },
            {
                value: PHP.Constants.T_VARIABLE,
                re: /^\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/
            },
            {
                value: PHP.Constants.T_WHITESPACE,
                re: /^\s+/
            },
            {
                value: PHP.Constants.T_CONSTANT_ENCAPSED_STRING,
                re: /^("(?:[^"\\]|\\[\s\S])*"|'(?:[^'\\]|\\[\s\S])*')/,
                func: function (result, token) {

                    var curlyOpen = 0,
                        len,
                        bracketOpen = 0;

                    if (result.substring(0, 1) === "'") {
                        return result;
                    }

                    var match = result.match(/(?:[^\\]|\\.)*[^\\]\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/g);
                    if (match !== null) {
                        // string has a variable

                        while (result.length > 0) {
                            len = result.length;
                            match = result.match(/^[\[\]\;\:\?\(\)\!\.\,\>\<\=\+\-\/\*\|\&\@\^\%\"\'\{\}]/);

                            if (match !== null) {

                                results.push(match[0]);
                                result = result.substring(1);

                                if (curlyOpen > 0 && match[0] === "}") {
                                    curlyOpen--;
                                }

                                if (match[0] === "[") {
                                    bracketOpen++;
                                }

                                if (match[0] === "]") {
                                    bracketOpen--;
                                }

                            }

                            match = result.match(/^\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/);



                            if (match !== null) {

                                results.push([
                                    parseInt(PHP.Constants.T_VARIABLE, 10),
                                    match[0],
                                    line
                                ]);

                                result = result.substring(match[0].length);

                                match = result.match(/^(\-\>)\s*([a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)\s*(\()/);

                                if (match !== null) {

                                    results.push([
                                        parseInt(PHP.Constants.T_OBJECT_OPERATOR, 10),
                                        match[1],
                                        line
                                    ]);
                                    results.push([
                                        parseInt(PHP.Constants.T_STRING, 10),
                                        match[2],
                                        line
                                    ]);
                                    if (match[3])
                                        results.push(match[3]);
                                    result = result.substring(match[0].length);
                                }


                                if (result.match(/^\[/g) !== null) {
                                    continue;
                                }
                            }

                            var re;
                            if (curlyOpen > 0) {
                                re = /^([^\\\$"{}\]\(\)\->]|\\.)+/g;
                            } else {
                                re = /^([^\\\$"{]|\\.|{[^\$]|\$(?=[^a-zA-Z_\x7f-\uffff]))+/g;
                            }

                            var type, match2;
                            while ((match = result.match(re)) !== null) {
                                if (result.length === 1) {
                                    throw new Error(match);
                                }

                                type = 0;

                                if (curlyOpen > 0) {
                                    if (match2 = match[0].match(/^[\[\]\;\:\?\(\)\!\.\,\>\<\=\+\-\/\*\|\&\{\}\@\^\%\$\~]/)) {
                                        results.push(match2[0]);
                                    } else {
                                        type = PHP.Constants.T_STRING;
                                    }
                                } else {
                                    type = PHP.Constants.T_ENCAPSED_AND_WHITESPACE;
                                }

                                if (type) {
                                    results.push([
                                        parseInt(type, 10),
                                        match[0].replace(/\n/g, "\\n").replace(/\r/g, ""),
                                        line
                                    ]);
                                }

                                line += match[0].split('\n').length - 1;

                                result = result.substring(match[0].length);
                            }

                            if (curlyOpen > 0 && result.match(/^\->/) !== null) {
                                results.push([
                                    parseInt(PHP.Constants.T_OBJECT_OPERATOR, 10),
                                    '->',
                                    line
                                ]);
                                result = result.substring(2);
                            }

                            if (result.match(/^{\$/) !== null) {
                                results.push([
                                    parseInt(PHP.Constants.T_CURLY_OPEN, 10),
                                    "{",
                                    line
                                ]);
                                result = result.substring(1);
                                curlyOpen++;
                            }

                            if (len === result.length) {
                                //  nothing has been found yet
                                if ((match = result.match(/^(([^\\]|\\.)*?[^\\]\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)/g)) !== null) {
                                    return;
                                }
                            }

                        }

                        return undefined;

                    } else {
                        result = result.replace(/\n/g, "\\n").replace(/\r/g, "");
                    }

                    /*
            if (result.match(/\r\n/) !== null) {
                var quote = result.substring(0, 1);

                result = '[' + result.split(/\r\n/).join( quote + "," + quote ) + '].join("\\n")';

            }
             */
                    return result;
                }
            },
            {
                value: PHP.Constants.T_NS_SEPARATOR,
                re: /^\\(?=[a-zA-Z_])/
            },
            {
                value: PHP.Constants.T_STRING,
                re: /^[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/
            },
            {
                value: -1,
                re: /^[\[\]\;\:\?\(\)\!\.\,\>\<\=\+\-\/\*\|\&\{\}\@\^\%\"\'\$\~]/
            }
        ];





    var results = [],
        line = 1,
        insidePHP = false,
        cancel = true;

    if (src === null) {
        return results;
    }

    if (typeof src !== "string") {
        src = src.toString();
    }



    while (src.length > 0 && cancel === true) {

        if (insidePHP === true) {

            if (heredoc !== undefined) {
                // we are in a heredoc

                var regexp = new RegExp('([\\S\\s]*)(\\r\\n|\\n|\\r)(' + heredoc + ')(;|\\r\\n|\\n)', "i");



                var result = src.match(regexp);
                if (result !== null) {
                    // contents

                    results.push([
                        parseInt(PHP.Constants.T_ENCAPSED_AND_WHITESPACE, 10),
                        result[1].replace(/^\n/g, "").replace(/\\\$/g, "$") + "\n",
                        line
                    ]);


                    // note the no - 1 for length as regexp include one line as well
                    line += result[1].split('\n').length;

                    // heredoc end tag
                    results.push([
                        parseInt(PHP.Constants.T_END_HEREDOC, 10),
                        result[3],
                        line
                    ]);

                    src = src.substring(result[1].length + result[2].length + result[3].length);
                    heredoc = undefined;
                }

                if (result === null) {
                    throw Error("sup");
                }


            } else {
                cancel = tokens.some(function (token) {
                    if (token.afterWhitespace === true) {
                        // check last
                        var last = results[results.length - 1];
                        if (!Array.isArray(last) || (last[0] !== PHP.Constants.T_WHITESPACE && last[0] !== PHP.Constants.T_OPEN_TAG && last[0] !== PHP.Constants.T_COMMENT)) {
                            return false;
                        }
                    }
                    var result = src.match(token.re);

                    if (result !== null) {
                        if (token.value !== -1) {
                            var resultString = result[0];



                            if (token.func !== undefined) {
                                resultString = token.func(resultString, token);
                            }
                            if (resultString !== undefined) {

                                results.push([
                                    parseInt(token.value, 10),
                                    resultString,
                                    line
                                ]);
                                line += resultString.split('\n').length - 1;
                            }

                        } else {
                            // character token
                            results.push(result[0]);
                        }

                        src = src.substring(result[0].length);

                        return true;
                    }
                    return false;


                });
            }

        } else {

            var result = openTag.exec(src);


            if (result !== null) {
                if (result.index > 0) {
                    var resultString = src.substring(0, result.index);
                    results.push([
                        parseInt(PHP.Constants.T_INLINE_HTML, 10),
                        resultString,
                        line
                    ]);

                    line += resultString.split('\n').length - 1;

                    src = src.substring(result.index);
                }

                insidePHP = true;
            } else {

                results.push([
                    parseInt(PHP.Constants.T_INLINE_HTML, 10),
                    src.replace(/^\n/, ""),
                    line
                ]);
                return results;
            }

            //    src = src.substring(result[ 0 ].length);

        }



    }



    return results;



};


/*
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 15.6.2012
 * @website http://hertzen.com
 */

/*
 * The skeleton for this parser was written by Moriyoshi Koizumi and is based on
 * the work by Masato Bito and is in the PUBLIC DOMAIN.
 * Ported to JavaScript by Niklas von Hertzen
 */


PHP.Parser = function (preprocessedTokens) {

    var yybase = this.yybase,
        yydefault = this.yydefault,
        yycheck = this.yycheck,
        yyaction = this.yyaction,
        yylen = this.yylen,
        yygbase = this.yygbase,
        yygcheck = this.yygcheck,
        yyp = this.yyp,
        yygoto = this.yygoto,
        yylhs = this.yylhs,
        terminals = this.terminals,
        translate = this.translate,
        yygdefault = this.yygdefault;


    this.pos = -1;
    this.line = 1;

    this.tokenMap = this.createTokenMap();

    this.dropTokens = {};
    this.dropTokens[PHP.Constants.T_WHITESPACE] = 1;
    this.dropTokens[PHP.Constants.T_OPEN_TAG] = 1;
    var tokens = [];

    // pre-process
    preprocessedTokens.forEach(function (token, index) {
        if (typeof token === "object" && token[0] === PHP.Constants.T_OPEN_TAG_WITH_ECHO) {
            tokens.push([
                PHP.Constants.T_OPEN_TAG,
                token[1],
                token[2]
            ]);
            tokens.push([
                PHP.Constants.T_ECHO,
                token[1],
                token[2]
            ]);
        } else {
            tokens.push(token);
        }
    });
    this.tokens = tokens;

    // We start off with no lookahead-token
    var tokenId = this.TOKEN_NONE;

    // The attributes for a node are taken from the first and last token of the node.
    // From the first token only the startAttributes are taken and from the last only
    // the endAttributes. Both are merged using the array union operator (+).
    this.startAttributes = {
        'startLine': 1
    };

    this.endAttributes = {};

    // In order to figure out the attributes for the starting token, we have to keep
    // them in a stack
    var attributeStack = [this.startAttributes];

    // Start off in the initial state and keep a stack of previous states
    var state = 0;
    var stateStack = [state];

    // AST stack
    this.yyastk = [];

    // Current position in the stack(s)
    this.stackPos = 0;

    var yyn;

    var origTokenId;


    for (;;) {

        if (yybase[state] === 0) {
            yyn = yydefault[state];
        } else {
            if (tokenId === this.TOKEN_NONE) {
                // fetch the next token id from the lexer and fetch additional info by-ref
                origTokenId = this.getNextToken();

                // map the lexer token id to the internally used token id's
                tokenId = (origTokenId >= 0 && origTokenId < this.TOKEN_MAP_SIZE) ? translate[origTokenId] : this.TOKEN_INVALID;

                attributeStack[this.stackPos] = this.startAttributes;
            }

            if (((yyn = yybase[state] + tokenId) >= 0 &&
                    yyn < this.YYLAST && yycheck[yyn] === tokenId ||
                    (state < this.YY2TBLSTATE &&
                        (yyn = yybase[state + this.YYNLSTATES] + tokenId) >= 0 &&
                        yyn < this.YYLAST &&
                        yycheck[yyn] === tokenId)) &&
                (yyn = yyaction[yyn]) !== this.YYDEFAULT) {
                /*
                 * >= YYNLSTATE: shift and reduce
                 * > 0: shift
                 * = 0: accept
                 * < 0: reduce
                 * = -YYUNEXPECTED: error
                 */
                if (yyn > 0) {
                    /* shift */
                    ++this.stackPos;

                    stateStack[this.stackPos] = state = yyn;
                    this.yyastk[this.stackPos] = this.tokenValue;
                    attributeStack[this.stackPos] = this.startAttributes;
                    tokenId = this.TOKEN_NONE;

                    if (yyn < this.YYNLSTATES)
                        continue;

                    /* $yyn >= YYNLSTATES means shift-and-reduce */
                    yyn -= this.YYNLSTATES;
                } else {
                    yyn = -yyn;
                }
            } else {
                yyn = yydefault[state];
            }
        }

        for (;;) {
            /* reduce/error */

            if (yyn === 0) {
                /* accept */
                return this.yyval;
            } else if (yyn !== this.YYUNEXPECTED) {
                /* reduce */
                try {
                    this['yyn' + yyn](PHP.Utils.Merge(attributeStack[this.stackPos - yylen[yyn]], this.endAttributes));
                } catch (e) {
                    /*
                        if (-1 === $e->getRawLine()) {
                            $e->setRawLine($startAttributes['startLine']);
                        }
                     */
                    throw e;
                }

                /* Goto - shift nonterminal */
                this.stackPos -= yylen[yyn];
                yyn = yylhs[yyn];
                if ((yyp = yygbase[yyn] + stateStack[this.stackPos]) >= 0 &&
                    yyp < this.YYGLAST &&
                    yygcheck[yyp] === yyn) {
                    state = yygoto[yyp];
                } else {
                    state = yygdefault[yyn];
                }

                ++this.stackPos;

                stateStack[this.stackPos] = state;
                this.yyastk[this.stackPos] = this.yyval;
                attributeStack[this.stackPos] = this.startAttributes;
            } else {
                /* error */
                if (eval !== true) {

                    var expected = [];

                    for (var i = 0; i < this.TOKEN_MAP_SIZE; ++i) {
                        if ((yyn = yybase[state] + i) >= 0 && yyn < this.YYLAST && yycheck[yyn] == i ||
                            state < this.YY2TBLSTATE &&
                            (yyn = yybase[state + this.YYNLSTATES] + i) &&
                            yyn < this.YYLAST && yycheck[yyn] == i
                        ) {
                            if (yyaction[yyn] != this.YYUNEXPECTED) {
                                if (expected.length == 4) {
                                    /* Too many expected tokens */
                                    expected = [];
                                    break;
                                }

                                expected.push(this.terminals[i]);
                            }
                        }
                    }

                    var expectedString = '';
                    if (expected.length) {
                        expectedString = ', expecting ' + expected.join(' or ');
                    }
                    throw new PHP.ParseError('syntax error, unexpected ' + terminals[tokenId] + expectedString, this.startAttributes['startLine']);
                } else {
                    return this.startAttributes['startLine'];
                }

            }

            if (state < this.YYNLSTATES)
                break;
            /* >= YYNLSTATES means shift-and-reduce */
            yyn = state - this.YYNLSTATES;
        }
    }
};

PHP.ParseError = function (msg, line) {
    this.message = msg;
    this.line = line;
};

PHP.Parser.prototype.MODIFIER_PUBLIC = 1;
PHP.Parser.prototype.MODIFIER_PROTECTED = 2;
PHP.Parser.prototype.MODIFIER_PRIVATE = 4;
PHP.Parser.prototype.MODIFIER_STATIC = 8;
PHP.Parser.prototype.MODIFIER_ABSTRACT = 16;
PHP.Parser.prototype.MODIFIER_FINAL = 32;

PHP.Parser.prototype.getNextToken = function () {

    this.startAttributes = {};
    this.endAttributes = {};

    var token,
        tmp;

    while (this.tokens[++this.pos] !== undefined) {
        token = this.tokens[this.pos];

        if (typeof token === "string") {
            this.startAttributes['startLine'] = this.line;
            this.endAttributes['endLine'] = this.line;

            // bug in token_get_all
            if ('b"' === token) {
                this.tokenValue = 'b"';
                return '"'.charCodeAt(0);
            } else {
                this.tokenValue = token;
                return token.charCodeAt(0);
            }
        } else {



            this.line += ((tmp = token[1].match(/\n/g)) === null) ? 0 : tmp.length;

            if (PHP.Constants.T_COMMENT === token[0]) {

                if (!Array.isArray(this.startAttributes['comments'])) {
                    this.startAttributes['comments'] = [];
                }

                this.startAttributes['comments'].push({
                    type: "comment",
                    comment: token[1],
                    line: token[2]
                });

            } else if (PHP.Constants.T_DOC_COMMENT === token[0]) {
                this.startAttributes['comments'].push(new PHPParser_Comment_Doc(token[1], token[2]));
            } else if (this.dropTokens[token[0]] === undefined) {
                this.tokenValue = token[1];
                this.startAttributes['startLine'] = token[2];
                this.endAttributes['endLine'] = this.line;

                return this.tokenMap[token[0]];
            }
        }
    }

    this.startAttributes['startLine'] = this.line;

    // 0 is the EOF token
    return 0;
};


/**
 * Creates the token map.
 *
 * The token map maps the PHP internal token identifiers
 * to the identifiers used by the PHP.Parser. Additionally it
 * maps T_OPEN_TAG_WITH_ECHO to T_ECHO and T_CLOSE_TAG to ';'.
 *
 * @return array The token map
 */

PHP.Parser.prototype.createTokenMap = function () {
    var tokenMap = {},
        name,
        i;
    var T_DOUBLE_COLON = PHP.Constants.T_PAAMAYIM_NEKUDOTAYIM;
    // 256 is the minimum possible token number, as everything below
    // it is an ASCII value
    for (i = 256; i < 1000; ++i) {
        // T_DOUBLE_COLON is equivalent to T_PAAMAYIM_NEKUDOTAYIM
        if (T_DOUBLE_COLON === i) {
            tokenMap[i] = this.T_PAAMAYIM_NEKUDOTAYIM;
            // T_OPEN_TAG_WITH_ECHO with dropped T_OPEN_TAG results in T_ECHO
        } else if (PHP.Constants.T_OPEN_TAG_WITH_ECHO === i) {
            tokenMap[i] = PHP.Constants.T_ECHO;
            // T_CLOSE_TAG is equivalent to ';'
        } else if (PHP.Constants.T_CLOSE_TAG === i) {
            tokenMap[i] = 59;
            // and the others can be mapped directly
        } else if ('UNKNOWN' !== (name = PHP.Utils.TokenName(i))) {
            tokenMap[i] = this[name];
        }
    }
    return tokenMap;
};

var yynStandard = function () {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};
// todo fix

PHP.Parser.prototype.MakeArray = function (arr) {
    return Array.isArray(arr) ? arr : [arr];
}


PHP.Parser.prototype.parseString = function (str) {
    var bLength = 0;
    if ('b' === str[0]) {
        bLength = 1;
    }

    if ('\'' === str[bLength]) {
        str = str.replace(
            ['\\\\', '\\\''],
            ['\\', '\'']);
    } else {

        str = this.parseEscapeSequences(str, '"');

    }

    return str;

};

PHP.Parser.prototype.parseEscapeSequences = function (str, quote) {



    if (undefined !== quote) {
        str = str.replace(new RegExp('\\' + quote, "g"), quote);
    }

    var replacements = {
        '\\': '\\',
        '$': '$',
        'n': "\n",
        'r': "\r",
        't': "\t",
        'f': "\f",
        'v': "\v",
        'e': "\x1B"
    };

    return str.replace(
        /~\\\\([\\\\$nrtfve]|[xX][0-9a-fA-F]{1,2}|[0-7]{1,3})~/g,
        function (matches) {
            var str = matches[1];

            if (replacements[str] !== undefined) {
                return replacements[str];
            } else if ('x' === str[0] || 'X' === str[0]) {
                return chr(hexdec(str));
            } else {
                return chr(octdec(str));
            }
        }
    );

    return str;
};


/* This is an automatically GENERATED file, which should not be manually edited.
 * Instead edit one of the following:
 *  * the grammar file grammar/zend_language_parser.jsy
 *  * the parser skeleton grammar/kymacc.js.parser
 *  * the preprocessing script grammar/rebuildParser.php
 *
 * The skeleton for this parser was written by Moriyoshi Koizumi and is based on
 * the work by Masato Bito and is in the PUBLIC DOMAIN.
 * Ported to JavaScript by Niklas von Hertzen
 */

PHP.Parser.prototype.TOKEN_NONE = -1;
PHP.Parser.prototype.TOKEN_INVALID = 149;

PHP.Parser.prototype.TOKEN_MAP_SIZE = 384;

PHP.Parser.prototype.YYLAST = 913;
PHP.Parser.prototype.YY2TBLSTATE = 328;
PHP.Parser.prototype.YYGLAST = 415;
PHP.Parser.prototype.YYNLSTATES = 544;
PHP.Parser.prototype.YYUNEXPECTED = 32767;
PHP.Parser.prototype.YYDEFAULT = -32766;

// {{{ Tokens
PHP.Parser.prototype.YYERRTOK = 256;
PHP.Parser.prototype.T_INCLUDE = 257;
PHP.Parser.prototype.T_INCLUDE_ONCE = 258;
PHP.Parser.prototype.T_EVAL = 259;
PHP.Parser.prototype.T_REQUIRE = 260;
PHP.Parser.prototype.T_REQUIRE_ONCE = 261;
PHP.Parser.prototype.T_LOGICAL_OR = 262;
PHP.Parser.prototype.T_LOGICAL_XOR = 263;
PHP.Parser.prototype.T_LOGICAL_AND = 264;
PHP.Parser.prototype.T_PRINT = 265;
PHP.Parser.prototype.T_PLUS_EQUAL = 266;
PHP.Parser.prototype.T_MINUS_EQUAL = 267;
PHP.Parser.prototype.T_MUL_EQUAL = 268;
PHP.Parser.prototype.T_DIV_EQUAL = 269;
PHP.Parser.prototype.T_CONCAT_EQUAL = 270;
PHP.Parser.prototype.T_MOD_EQUAL = 271;
PHP.Parser.prototype.T_AND_EQUAL = 272;
PHP.Parser.prototype.T_OR_EQUAL = 273;
PHP.Parser.prototype.T_XOR_EQUAL = 274;
PHP.Parser.prototype.T_SL_EQUAL = 275;
PHP.Parser.prototype.T_SR_EQUAL = 276;
PHP.Parser.prototype.T_BOOLEAN_OR = 277;
PHP.Parser.prototype.T_BOOLEAN_AND = 278;
PHP.Parser.prototype.T_IS_EQUAL = 279;
PHP.Parser.prototype.T_IS_NOT_EQUAL = 280;
PHP.Parser.prototype.T_IS_IDENTICAL = 281;
PHP.Parser.prototype.T_IS_NOT_IDENTICAL = 282;
PHP.Parser.prototype.T_IS_SMALLER_OR_EQUAL = 283;
PHP.Parser.prototype.T_IS_GREATER_OR_EQUAL = 284;
PHP.Parser.prototype.T_SL = 285;
PHP.Parser.prototype.T_SR = 286;
PHP.Parser.prototype.T_INSTANCEOF = 287;
PHP.Parser.prototype.T_INC = 288;
PHP.Parser.prototype.T_DEC = 289;
PHP.Parser.prototype.T_INT_CAST = 290;
PHP.Parser.prototype.T_DOUBLE_CAST = 291;
PHP.Parser.prototype.T_STRING_CAST = 292;
PHP.Parser.prototype.T_ARRAY_CAST = 293;
PHP.Parser.prototype.T_OBJECT_CAST = 294;
PHP.Parser.prototype.T_BOOL_CAST = 295;
PHP.Parser.prototype.T_UNSET_CAST = 296;
PHP.Parser.prototype.T_NEW = 297;
PHP.Parser.prototype.T_CLONE = 298;
PHP.Parser.prototype.T_EXIT = 299;
PHP.Parser.prototype.T_IF = 300;
PHP.Parser.prototype.T_ELSEIF = 301;
PHP.Parser.prototype.T_ELSE = 302;
PHP.Parser.prototype.T_ENDIF = 303;
PHP.Parser.prototype.T_LNUMBER = 304;
PHP.Parser.prototype.T_DNUMBER = 305;
PHP.Parser.prototype.T_STRING = 306;
PHP.Parser.prototype.T_STRING_VARNAME = 307;
PHP.Parser.prototype.T_VARIABLE = 308;
PHP.Parser.prototype.T_NUM_STRING = 309;
PHP.Parser.prototype.T_INLINE_HTML = 310;
PHP.Parser.prototype.T_CHARACTER = 311;
PHP.Parser.prototype.T_BAD_CHARACTER = 312;
PHP.Parser.prototype.T_ENCAPSED_AND_WHITESPACE = 313;
PHP.Parser.prototype.T_CONSTANT_ENCAPSED_STRING = 314;
PHP.Parser.prototype.T_ECHO = 315;
PHP.Parser.prototype.T_DO = 316;
PHP.Parser.prototype.T_WHILE = 317;
PHP.Parser.prototype.T_ENDWHILE = 318;
PHP.Parser.prototype.T_FOR = 319;
PHP.Parser.prototype.T_ENDFOR = 320;
PHP.Parser.prototype.T_FOREACH = 321;
PHP.Parser.prototype.T_ENDFOREACH = 322;
PHP.Parser.prototype.T_DECLARE = 323;
PHP.Parser.prototype.T_ENDDECLARE = 324;
PHP.Parser.prototype.T_AS = 325;
PHP.Parser.prototype.T_SWITCH = 326;
PHP.Parser.prototype.T_ENDSWITCH = 327;
PHP.Parser.prototype.T_CASE = 328;
PHP.Parser.prototype.T_DEFAULT = 329;
PHP.Parser.prototype.T_BREAK = 330;
PHP.Parser.prototype.T_CONTINUE = 331;
PHP.Parser.prototype.T_GOTO = 332;
PHP.Parser.prototype.T_FUNCTION = 333;
PHP.Parser.prototype.T_CONST = 334;
PHP.Parser.prototype.T_RETURN = 335;
PHP.Parser.prototype.T_TRY = 336;
PHP.Parser.prototype.T_CATCH = 337;
PHP.Parser.prototype.T_THROW = 338;
PHP.Parser.prototype.T_USE = 339;
PHP.Parser.prototype.T_INSTEADOF = 340;
PHP.Parser.prototype.T_GLOBAL = 341;
PHP.Parser.prototype.T_STATIC = 342;
PHP.Parser.prototype.T_ABSTRACT = 343;
PHP.Parser.prototype.T_FINAL = 344;
PHP.Parser.prototype.T_PRIVATE = 345;
PHP.Parser.prototype.T_PROTECTED = 346;
PHP.Parser.prototype.T_PUBLIC = 347;
PHP.Parser.prototype.T_VAR = 348;
PHP.Parser.prototype.T_UNSET = 349;
PHP.Parser.prototype.T_ISSET = 350;
PHP.Parser.prototype.T_EMPTY = 351;
PHP.Parser.prototype.T_HALT_COMPILER = 352;
PHP.Parser.prototype.T_CLASS = 353;
PHP.Parser.prototype.T_TRAIT = 354;
PHP.Parser.prototype.T_INTERFACE = 355;
PHP.Parser.prototype.T_EXTENDS = 356;
PHP.Parser.prototype.T_IMPLEMENTS = 357;
PHP.Parser.prototype.T_OBJECT_OPERATOR = 358;
PHP.Parser.prototype.T_DOUBLE_ARROW = 359;
PHP.Parser.prototype.T_LIST = 360;
PHP.Parser.prototype.T_ARRAY = 361;
PHP.Parser.prototype.T_CALLABLE = 362;
PHP.Parser.prototype.T_CLASS_C = 363;
PHP.Parser.prototype.T_TRAIT_C = 364;
PHP.Parser.prototype.T_METHOD_C = 365;
PHP.Parser.prototype.T_FUNC_C = 366;
PHP.Parser.prototype.T_LINE = 367;
PHP.Parser.prototype.T_FILE = 368;
PHP.Parser.prototype.T_COMMENT = 369;
PHP.Parser.prototype.T_DOC_COMMENT = 370;
PHP.Parser.prototype.T_OPEN_TAG = 371;
PHP.Parser.prototype.T_OPEN_TAG_WITH_ECHO = 372;
PHP.Parser.prototype.T_CLOSE_TAG = 373;
PHP.Parser.prototype.T_WHITESPACE = 374;
PHP.Parser.prototype.T_START_HEREDOC = 375;
PHP.Parser.prototype.T_END_HEREDOC = 376;
PHP.Parser.prototype.T_DOLLAR_OPEN_CURLY_BRACES = 377;
PHP.Parser.prototype.T_CURLY_OPEN = 378;
PHP.Parser.prototype.T_PAAMAYIM_NEKUDOTAYIM = 379;
PHP.Parser.prototype.T_NAMESPACE = 380;
PHP.Parser.prototype.T_NS_C = 381;
PHP.Parser.prototype.T_DIR = 382;
PHP.Parser.prototype.T_NS_SEPARATOR = 383;
// }}}

/* @var array Map of token ids to their respective names */
PHP.Parser.prototype.terminals = [
    "$EOF",
    "error",
    "T_INCLUDE",
    "T_INCLUDE_ONCE",
    "T_EVAL",
    "T_REQUIRE",
    "T_REQUIRE_ONCE",
    "','",
    "T_LOGICAL_OR",
    "T_LOGICAL_XOR",
    "T_LOGICAL_AND",
    "T_PRINT",
    "'='",
    "T_PLUS_EQUAL",
    "T_MINUS_EQUAL",
    "T_MUL_EQUAL",
    "T_DIV_EQUAL",
    "T_CONCAT_EQUAL",
    "T_MOD_EQUAL",
    "T_AND_EQUAL",
    "T_OR_EQUAL",
    "T_XOR_EQUAL",
    "T_SL_EQUAL",
    "T_SR_EQUAL",
    "'?'",
    "':'",
    "T_BOOLEAN_OR",
    "T_BOOLEAN_AND",
    "'|'",
    "'^'",
    "'&'",
    "T_IS_EQUAL",
    "T_IS_NOT_EQUAL",
    "T_IS_IDENTICAL",
    "T_IS_NOT_IDENTICAL",
    "'<'",
    "T_IS_SMALLER_OR_EQUAL",
    "'>'",
    "T_IS_GREATER_OR_EQUAL",
    "T_SL",
    "T_SR",
    "'+'",
    "'-'",
    "'.'",
    "'*'",
    "'/'",
    "'%'",
    "'!'",
    "T_INSTANCEOF",
    "'~'",
    "T_INC",
    "T_DEC",
    "T_INT_CAST",
    "T_DOUBLE_CAST",
    "T_STRING_CAST",
    "T_ARRAY_CAST",
    "T_OBJECT_CAST",
    "T_BOOL_CAST",
    "T_UNSET_CAST",
    "'@'",
    "'['",
    "T_NEW",
    "T_CLONE",
    "T_EXIT",
    "T_IF",
    "T_ELSEIF",
    "T_ELSE",
    "T_ENDIF",
    "T_LNUMBER",
    "T_DNUMBER",
    "T_STRING",
    "T_STRING_VARNAME",
    "T_VARIABLE",
    "T_NUM_STRING",
    "T_INLINE_HTML",
    "T_ENCAPSED_AND_WHITESPACE",
    "T_CONSTANT_ENCAPSED_STRING",
    "T_ECHO",
    "T_DO",
    "T_WHILE",
    "T_ENDWHILE",
    "T_FOR",
    "T_ENDFOR",
    "T_FOREACH",
    "T_ENDFOREACH",
    "T_DECLARE",
    "T_ENDDECLARE",
    "T_AS",
    "T_SWITCH",
    "T_ENDSWITCH",
    "T_CASE",
    "T_DEFAULT",
    "T_BREAK",
    "T_CONTINUE",
    "T_GOTO",
    "T_FUNCTION",
    "T_CONST",
    "T_RETURN",
    "T_TRY",
    "T_CATCH",
    "T_THROW",
    "T_USE",
    "T_INSTEADOF",
    "T_GLOBAL",
    "T_STATIC",
    "T_ABSTRACT",
    "T_FINAL",
    "T_PRIVATE",
    "T_PROTECTED",
    "T_PUBLIC",
    "T_VAR",
    "T_UNSET",
    "T_ISSET",
    "T_EMPTY",
    "T_HALT_COMPILER",
    "T_CLASS",
    "T_TRAIT",
    "T_INTERFACE",
    "T_EXTENDS",
    "T_IMPLEMENTS",
    "T_OBJECT_OPERATOR",
    "T_DOUBLE_ARROW",
    "T_LIST",
    "T_ARRAY",
    "T_CALLABLE",
    "T_CLASS_C",
    "T_TRAIT_C",
    "T_METHOD_C",
    "T_FUNC_C",
    "T_LINE",
    "T_FILE",
    "T_START_HEREDOC",
    "T_END_HEREDOC",
    "T_DOLLAR_OPEN_CURLY_BRACES",
    "T_CURLY_OPEN",
    "T_PAAMAYIM_NEKUDOTAYIM",
    "T_NAMESPACE",
    "T_NS_C",
    "T_DIR",
    "T_NS_SEPARATOR",
    "';'",
    "'{'",
    "'}'",
    "'('",
    "')'",
    "'$'",
    "']'",
    "'`'",
    "'\"'", "???"
];

/* @var Map which translates lexer tokens to internal tokens */
PHP.Parser.prototype.translate = [
    0, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 47, 148, 149, 145, 46, 30, 149,
    143, 144, 44, 41, 7, 42, 43, 45, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 25, 140,
    35, 12, 37, 24, 59, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 60, 149, 146, 29, 149, 147, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 141, 28, 142, 49, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 149, 149, 149, 149,
    149, 149, 149, 149, 149, 149, 1, 2, 3, 4,
    5, 6, 8, 9, 10, 11, 13, 14, 15, 16,
    17, 18, 19, 20, 21, 22, 23, 26, 27, 31,
    32, 33, 34, 36, 38, 39, 40, 48, 50, 51,
    52, 53, 54, 55, 56, 57, 58, 61, 62, 63,
    64, 65, 66, 67, 68, 69, 70, 71, 72, 73,
    74, 149, 149, 75, 76, 77, 78, 79, 80, 81,
    82, 83, 84, 85, 86, 87, 88, 89, 90, 91,
    92, 93, 94, 95, 96, 97, 98, 99, 100, 101,
    102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121,
    122, 123, 124, 125, 126, 127, 128, 129, 130, 149,
    149, 149, 149, 149, 149, 131, 132, 133, 134, 135,
    136, 137, 138, 139
];

PHP.Parser.prototype.yyaction = [
    61, 62, 363, 63, 64, -32766, -32766, -32766, 509, 65,
    708, 709, 710, 707, 706, 705, -32766, -32766, -32766, -32766,
    -32766, -32766, 132, -32766, -32766, -32766, -32766, -32766, -32767, -32767,
    -32767, -32767, -32766, 335, -32766, -32766, -32766, -32766, -32766, 66,
    67, 351, 663, 664, 40, 68, 548, 69, 232, 233,
    70, 71, 72, 73, 74, 75, 76, 77, 30, 246,
    78, 336, 364, -112, 0, 469, 833, 834, 365, 641,
    890, 436, 590, 41, 835, 53, 27, 366, 294, 367,
    687, 368, 921, 369, 923, 922, 370, -32766, -32766, -32766,
    42, 43, 371, 339, 126, 44, 372, 337, 79, 297,
    349, 292, 293, -32766, 918, -32766, -32766, 373, 374, 375,
    376, 377, 391, 199, 361, 338, 573, 613, 378, 379,
    380, 381, 845, 839, 840, 841, 842, 836, 837, 253,
    -32766, 87, 88, 89, 391, 843, 838, 338, 597, 519,
    128, 80, 129, 273, 332, 257, 261, 47, 673, 90,
    91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
    101, 102, 103, 104, 105, 106, 107, 108, 109, 110,
    799, 247, 884, 108, 109, 110, 226, 247, 21, -32766,
    310, -32766, -32766, -32766, 642, 548, -32766, -32766, -32766, -32766,
    56, 353, -32766, -32766, -32766, 55, -32766, -32766, -32766, -32766,
    -32766, 58, -32766, -32766, -32766, -32766, -32766, -32766, -32766, -32766,
    -32766, 557, -32766, -32766, 518, -32766, 548, 890, -32766, 390,
    -32766, 228, 252, -32766, -32766, -32766, -32766, -32766, 275, -32766,
    234, -32766, 587, 588, -32766, -32766, -32766, -32766, -32766, -32766,
    -32766, 46, 236, -32766, -32766, 281, -32766, 682, 348, -32766,
    390, -32766, 346, 333, 521, -32766, -32766, -32766, 271, 911,
    262, 237, 446, 911, -32766, 894, 59, 700, 358, 135,
    548, 123, 538, 35, -32766, 333, 122, -32766, -32766, -32766,
    271, -32766, 124, -32766, 692, -32766, -32766, -32766, -32766, 700,
    273, 22, -32766, -32766, -32766, -32766, 239, -32766, -32766, 612,
    -32766, 548, 134, -32766, 390, -32766, 462, 354, -32766, -32766,
    -32766, -32766, -32766, 227, -32766, 238, -32766, 845, 542, -32766,
    856, 611, 200, -32766, -32766, -32766, 259, 280, -32766, -32766,
    201, -32766, 855, 129, -32766, 390, 130, 202, 333, 206,
    -32766, -32766, -32766, 271, -32766, -32766, -32766, 125, 601, -32766,
    136, 299, 700, 489, 28, 548, 105, 106, 107, -32766,
    498, 499, -32766, -32766, -32766, 207, -32766, 133, -32766, 525,
    -32766, -32766, -32766, -32766, 663, 664, 527, -32766, -32766, -32766,
    -32766, 528, -32766, -32766, 610, -32766, 548, 427, -32766, 390,
    -32766, 532, 539, -32766, -32766, -32766, -32766, -32766, 240, -32766,
    247, -32766, 697, 543, -32766, 554, 523, 608, -32766, -32766,
    -32766, 686, 535, -32766, -32766, 54, -32766, 57, 60, -32766,
    390, 246, -155, 278, 345, -32766, -32766, -32766, 506, 347,
    -152, 471, 402, 403, -32766, 405, 404, 272, 493, 416,
    548, 318, 417, 505, -32766, 517, 548, -32766, -32766, -32766,
    549, -32766, 562, -32766, 916, -32766, -32766, -32766, -32766, 564,
    826, 848, -32766, -32766, -32766, -32766, 694, -32766, -32766, 485,
    -32766, 548, 487, -32766, 390, -32766, 504, 802, -32766, -32766,
    -32766, -32766, -32766, 279, -32766, 911, -32766, 502, 492, -32766,
    413, 483, 269, -32766, -32766, -32766, 243, 337, -32766, -32766,
    418, -32766, 454, 229, -32766, 390, 274, 373, 374, 344,
    -32766, -32766, -32766, 360, 614, -32766, 573, 613, 378, 379,
    -274, 548, 615, -332, 844, -32766, 258, 51, -32766, -32766,
    -32766, 270, -32766, 346, -32766, 52, -32766, 260, 0, -32766,
    -333, -32766, -32766, -32766, -32766, -32766, -32766, 205, -32766, -32766,
    49, -32766, 548, 424, -32766, 390, -32766, -266, 264, -32766,
    -32766, -32766, -32766, -32766, 409, -32766, 343, -32766, 265, 312,
    -32766, 470, 513, -275, -32766, -32766, -32766, 920, 337, -32766,
    -32766, 530, -32766, 531, 600, -32766, 390, 592, 373, 374,
    578, 581, -32766, -32766, 644, 629, -32766, 573, 613, 378,
    379, 635, 548, 636, 576, 627, -32766, 625, 693, -32766,
    -32766, -32766, 691, -32766, 591, -32766, 582, -32766, 203, 204,
    -32766, 584, 583, -32766, -32766, -32766, -32766, 586, 599, -32766,
    -32766, 589, -32766, 690, 558, -32766, 390, 197, 683, 919,
    86, 520, 522, -32766, 524, 833, 834, 529, 533, -32766,
    534, 537, 541, 835, 48, 111, 112, 113, 114, 115,
    116, 117, 118, 119, 120, 121, 127, 31, 633, 337,
    330, 634, 585, -32766, 32, 291, 337, 330, 478, 373,
    374, 917, 291, 891, 889, 875, 373, 374, 553, 613,
    378, 379, 737, 739, 887, 553, 613, 378, 379, 824,
    451, 675, 839, 840, 841, 842, 836, 837, 320, 895,
    277, 885, 23, 33, 843, 838, 556, 277, 337, 330,
    -32766, 34, -32766, 555, 291, 36, 37, 38, 373, 374,
    39, 45, 50, 81, 82, 83, 84, 553, 613, 378,
    379, -32767, -32767, -32767, -32767, 103, 104, 105, 106, 107,
    337, 85, 131, 137, 337, 138, 198, 224, 225, 277,
    373, 374, -332, 230, 373, 374, 24, 337, 231, 573,
    613, 378, 379, 573, 613, 378, 379, 373, 374, 235,
    248, 249, 250, 337, 251, 0, 573, 613, 378, 379,
    276, 329, 331, 373, 374, -32766, 337, 574, 490, 792,
    337, 609, 573, 613, 378, 379, 373, 374, 25, 300,
    373, 374, 319, 337, 795, 573, 613, 378, 379, 573,
    613, 378, 379, 373, 374, 516, 355, 359, 445, 482,
    796, 507, 573, 613, 378, 379, 508, 548, 337, 890,
    775, 791, 337, 604, 803, 808, 806, 698, 373, 374,
    888, 807, 373, 374, -32766, -32766, -32766, 573, 613, 378,
    379, 573, 613, 378, 379, 873, 832, 804, 872, 851,
    -32766, 809, -32766, -32766, -32766, -32766, 805, 20, 26, 29,
    298, 480, 515, 770, 778, 827, 457, 0, 900, 455,
    774, 0, 0, 0, 874, 870, 886, 823, 915, 852,
    869, 488, 0, 391, 793, 0, 338, 0, 0, 0,
    340, 0, 273
];

PHP.Parser.prototype.yycheck = [
    2, 3, 4, 5, 6, 8, 9, 10, 70, 11,
    104, 105, 106, 107, 108, 109, 8, 9, 10, 8,
    9, 24, 60, 26, 27, 28, 29, 30, 31, 32,
    33, 34, 24, 7, 26, 27, 28, 29, 30, 41,
    42, 7, 123, 124, 7, 47, 70, 49, 50, 51,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
    62, 63, 64, 144, 0, 75, 68, 69, 70, 25,
    72, 70, 74, 7, 76, 77, 78, 79, 7, 81,
    142, 83, 70, 85, 72, 73, 88, 8, 9, 10,
    92, 93, 94, 95, 7, 97, 98, 95, 100, 7,
    7, 103, 104, 24, 142, 26, 27, 105, 106, 111,
    112, 113, 136, 7, 7, 139, 114, 115, 116, 117,
    122, 123, 132, 125, 126, 127, 128, 129, 130, 131,
    8, 8, 9, 10, 136, 137, 138, 139, 140, 141,
    25, 143, 141, 145, 142, 147, 148, 24, 72, 26,
    27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
    37, 38, 39, 40, 41, 42, 43, 44, 45, 46,
    144, 48, 72, 44, 45, 46, 30, 48, 144, 64,
    72, 8, 9, 10, 140, 70, 8, 9, 10, 74,
    60, 25, 77, 78, 79, 60, 81, 24, 83, 26,
    85, 60, 24, 88, 26, 27, 28, 92, 93, 94,
    64, 140, 97, 98, 70, 100, 70, 72, 103, 104,
    74, 145, 7, 77, 78, 79, 111, 81, 7, 83,
    30, 85, 140, 140, 88, 8, 9, 10, 92, 93,
    94, 133, 134, 97, 98, 145, 100, 140, 7, 103,
    104, 24, 139, 96, 141, 140, 141, 111, 101, 75,
    75, 30, 70, 75, 64, 70, 60, 110, 121, 12,
    70, 141, 25, 143, 74, 96, 141, 77, 78, 79,
    101, 81, 141, 83, 140, 85, 140, 141, 88, 110,
    145, 144, 92, 93, 94, 64, 7, 97, 98, 142,
    100, 70, 141, 103, 104, 74, 145, 141, 77, 78,
    79, 111, 81, 7, 83, 30, 85, 132, 25, 88,
    132, 142, 12, 92, 93, 94, 120, 60, 97, 98,
    12, 100, 148, 141, 103, 104, 141, 12, 96, 12,
    140, 141, 111, 101, 8, 9, 10, 141, 25, 64,
    90, 91, 110, 65, 66, 70, 41, 42, 43, 74,
    65, 66, 77, 78, 79, 12, 81, 25, 83, 25,
    85, 140, 141, 88, 123, 124, 25, 92, 93, 94,
    64, 25, 97, 98, 142, 100, 70, 120, 103, 104,
    74, 25, 25, 77, 78, 79, 111, 81, 30, 83,
    48, 85, 140, 141, 88, 140, 141, 30, 92, 93,
    94, 140, 141, 97, 98, 60, 100, 60, 60, 103,
    104, 61, 72, 75, 70, 140, 141, 111, 67, 70,
    87, 99, 70, 70, 64, 70, 72, 102, 89, 70,
    70, 71, 70, 70, 74, 70, 70, 77, 78, 79,
    70, 81, 70, 83, 70, 85, 140, 141, 88, 70,
    144, 70, 92, 93, 94, 64, 70, 97, 98, 72,
    100, 70, 72, 103, 104, 74, 72, 72, 77, 78,
    79, 111, 81, 75, 83, 75, 85, 89, 86, 88,
    79, 101, 118, 92, 93, 94, 87, 95, 97, 98,
    87, 100, 87, 87, 103, 104, 118, 105, 106, 95,
    140, 141, 111, 95, 115, 64, 114, 115, 116, 117,
    135, 70, 115, 120, 132, 74, 120, 140, 77, 78,
    79, 119, 81, 139, 83, 140, 85, 120, -1, 88,
    120, 140, 141, 92, 93, 94, 64, 121, 97, 98,
    121, 100, 70, 122, 103, 104, 74, 135, 135, 77,
    78, 79, 111, 81, 139, 83, 139, 85, 135, 135,
    88, 135, 135, 135, 92, 93, 94, 142, 95, 97,
    98, 140, 100, 140, 140, 103, 104, 140, 105, 106,
    140, 140, 141, 111, 140, 140, 64, 114, 115, 116,
    117, 140, 70, 140, 140, 140, 74, 140, 140, 77,
    78, 79, 140, 81, 140, 83, 140, 85, 41, 42,
    88, 140, 140, 141, 92, 93, 94, 140, 140, 97,
    98, 140, 100, 140, 140, 103, 104, 60, 140, 142,
    141, 141, 141, 111, 141, 68, 69, 141, 141, 72,
    141, 141, 141, 76, 12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23, 141, 143, 142, 95,
    96, 142, 140, 141, 143, 101, 95, 96, 142, 105,
    106, 142, 101, 142, 142, 142, 105, 106, 114, 115,
    116, 117, 50, 51, 142, 114, 115, 116, 117, 142,
    123, 142, 125, 126, 127, 128, 129, 130, 131, 142,
    136, 142, 144, 143, 137, 138, 142, 136, 95, 96,
    143, 143, 145, 142, 101, 143, 143, 143, 105, 106,
    143, 143, 143, 143, 143, 143, 143, 114, 115, 116,
    117, 35, 36, 37, 38, 39, 40, 41, 42, 43,
    95, 143, 143, 143, 95, 143, 143, 143, 143, 136,
    105, 106, 120, 143, 105, 106, 144, 95, 143, 114,
    115, 116, 117, 114, 115, 116, 117, 105, 106, 143,
    143, 143, 143, 95, 143, -1, 114, 115, 116, 117,
    143, 143, 143, 105, 106, 143, 95, 142, 80, 146,
    95, 142, 114, 115, 116, 117, 105, 106, 144, 144,
    105, 106, 144, 95, 142, 114, 115, 116, 117, 114,
    115, 116, 117, 105, 106, 82, 144, 144, 144, 144,
    142, 84, 114, 115, 116, 117, 144, 70, 95, 72,
    144, 144, 95, 142, 144, 146, 144, 142, 105, 106,
    146, 144, 105, 106, 8, 9, 10, 114, 115, 116,
    117, 114, 115, 116, 117, 144, 144, 144, 144, 144,
    24, 104, 26, 27, 28, 29, 144, 144, 144, 144,
    144, 144, 144, 144, 144, 144, 144, -1, 144, 144,
    144, -1, -1, -1, 146, 146, 146, 146, 146, 146,
    146, 146, -1, 136, 147, -1, 139, -1, -1, -1,
    143, -1, 145
];

PHP.Parser.prototype.yybase = [
    0, 574, 581, 623, 655, 2, 718, 402, 747, 659,
    672, 688, 743, 701, 705, 483, 483, 483, 483, 483,
    351, 356, 366, 366, 367, 366, 344, -2, -2, -2,
    200, 200, 231, 231, 231, 231, 231, 231, 231, 231,
    200, 231, 451, 482, 532, 316, 370, 115, 146, 285,
    401, 401, 401, 401, 401, 401, 401, 401, 401, 401,
    401, 401, 401, 401, 401, 401, 401, 401, 401, 401,
    401, 401, 401, 401, 401, 401, 401, 401, 401, 401,
    401, 401, 401, 401, 401, 401, 401, 401, 401, 401,
    401, 401, 401, 401, 401, 401, 401, 401, 401, 401,
    401, 401, 401, 401, 401, 401, 401, 401, 401, 401,
    401, 401, 401, 401, 401, 401, 401, 401, 401, 401,
    401, 401, 401, 401, 401, 401, 401, 401, 401, 401,
    401, 401, 401, 401, 401, 401, 401, 401, 401, 44,
    474, 429, 476, 481, 487, 488, 739, 740, 741, 734,
    733, 416, 736, 539, 541, 342, 542, 543, 552, 557,
    559, 536, 567, 737, 755, 569, 735, 738, 123, 123,
    123, 123, 123, 123, 123, 123, 123, 122, 11, 336,
    336, 336, 336, 336, 336, 336, 336, 336, 336, 336,
    336, 336, 336, 336, 227, 227, 173, 577, 577, 577,
    577, 577, 577, 577, 577, 577, 577, 577, 79, 178,
    846, 8, -3, -3, -3, -3, 642, 706, 706, 706,
    706, 157, 179, 242, 431, 431, 360, 431, 525, 368,
    767, 767, 767, 767, 767, 767, 767, 767, 767, 767,
    767, 767, 350, 375, 315, 315, 652, 652, -81, -81,
    -81, -81, 251, 185, 188, 184, -62, 348, 195, 195,
    195, 408, 392, 410, 1, 192, 129, 129, 129, -24,
    -24, -24, -24, 499, -24, -24, -24, 113, 108, 108,
    12, 161, 349, 526, 271, 398, 529, 438, 130, 206,
    265, 427, 76, 414, 427, 288, 295, 76, 166, 44,
    262, 422, 141, 491, 372, 494, 413, 71, 92, 93,
    267, 135, 100, 34, 415, 745, 746, 742, -38, 420,
    -10, 135, 147, 744, 498, 107, 26, 493, 144, 377,
    363, 369, 332, 363, 400, 377, 588, 377, 376, 377,
    360, 37, 582, 376, 377, 374, 376, 388, 363, 364,
    412, 369, 377, 441, 443, 390, 106, 332, 377, 390,
    377, 400, 64, 590, 591, 323, 592, 589, 593, 649,
    608, 362, 500, 399, 407, 620, 625, 636, 365, 354,
    614, 524, 425, 359, 355, 423, 570, 578, 357, 406,
    414, 394, 352, 403, 531, 433, 403, 653, 434, 385,
    417, 411, 444, 310, 318, 501, 425, 668, 757, 380,
    637, 684, 403, 609, 387, 87, 325, 638, 382, 403,
    639, 403, 696, 503, 615, 403, 697, 384, 435, 425,
    352, 352, 352, 700, 66, 699, 583, 702, 707, 704,
    748, 721, 749, 584, 750, 358, 583, 722, 751, 682,
    215, 613, 422, 436, 389, 447, 221, 257, 752, 403,
    403, 506, 499, 403, 395, 685, 397, 426, 753, 392,
    391, 647, 683, 403, 418, 754, 221, 723, 587, 724,
    450, 568, 507, 648, 509, 327, 725, 353, 497, 610,
    454, 622, 455, 461, 404, 510, 373, 732, 612, 247,
    361, 664, 463, 405, 692, 641, 464, 465, 511, 343,
    437, 335, 409, 396, 665, 293, 467, 468, 472, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2,
    -2, 0, 0, 0, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, 123, 123, 123, 123, 123, 123, 123,
    123, 123, 123, 123, 123, 123, 123, 123, 123, 123,
    123, 123, 123, 123, 123, 123, 123, 123, 123, 123,
    123, 123, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 123, 123, 123, 123, 123, 123, 123, 123, 123,
    123, 123, 123, 123, 123, 123, 123, 123, 123, 123,
    123, 767, 767, 767, 767, 767, 767, 767, 767, 767,
    767, 767, 123, 123, 123, 123, 123, 123, 123, 123,
    0, 129, 129, 129, 129, -94, -94, -94, 767, 767,
    767, 767, 767, 767, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, -94, -94, 129, 129,
    767, 767, -24, -24, -24, -24, -24, 108, 108, 108,
    -24, 108, 145, 145, 145, 108, 108, 108, 100, 100,
    0, 0, 0, 0, 0, 0, 0, 145, 0, 0,
    0, 376, 0, 0, 0, 145, 260, 260, 221, 260,
    260, 135, 0, 0, 425, 376, 0, 364, 376, 0,
    0, 0, 0, 0, 0, 531, 0, 87, 637, 241,
    425, 0, 0, 0, 0, 0, 0, 0, 425, 289,
    289, 306, 0, 358, 0, 0, 0, 306, 241, 0,
    0, 221
];

PHP.Parser.prototype.yydefault = [
    3, 32767, 32767, 1, 32767, 32767, 32767, 32767, 32767, 32767,
    32767, 32767, 32767, 32767, 32767, 104, 96, 110, 95, 106,
    32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
    358, 358, 122, 122, 122, 122, 122, 122, 122, 122,
    316, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
    173, 173, 173, 32767, 348, 348, 348, 348, 348, 348,
    348, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
    32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
    32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
    32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
    32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
    32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
    32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
    32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
    32767, 363, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
    32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
    32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 232, 233,
    235, 236, 172, 125, 349, 362, 171, 199, 201, 250,
    200, 177, 182, 183, 184, 185, 186, 187, 188, 189,
    190, 191, 192, 176, 229, 228, 197, 313, 313, 316,
    32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 198, 202,
    204, 203, 219, 220, 217, 218, 175, 221, 222, 223,
    224, 157, 157, 157, 357, 357, 32767, 357, 32767, 32767,
    32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
    32767, 32767, 158, 32767, 211, 212, 276, 276, 117, 117,
    117, 117, 117, 32767, 32767, 32767, 32767, 284, 32767, 32767,
    32767, 32767, 32767, 286, 32767, 32767, 206, 207, 205, 32767,
    32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 285, 32767,
    32767, 32767, 32767, 32767, 32767, 32767, 32767, 334, 321, 272,
    32767, 32767, 32767, 265, 32767, 107, 109, 32767, 32767, 32767,
    32767, 302, 339, 32767, 32767, 32767, 17, 32767, 32767, 32767,
    370, 334, 32767, 32767, 19, 32767, 32767, 32767, 32767, 227,
    32767, 338, 332, 32767, 32767, 32767, 32767, 32767, 32767, 63,
    32767, 32767, 32767, 32767, 32767, 63, 281, 63, 32767, 63,
    32767, 315, 287, 32767, 63, 74, 32767, 72, 32767, 32767,
    76, 32767, 63, 93, 93, 254, 315, 54, 63, 254,
    63, 32767, 32767, 32767, 32767, 4, 32767, 32767, 32767, 32767,
    32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
    32767, 32767, 267, 32767, 323, 32767, 337, 336, 324, 32767,
    265, 32767, 215, 194, 266, 32767, 196, 32767, 32767, 270,
    273, 32767, 32767, 32767, 134, 32767, 268, 180, 32767, 32767,
    32767, 32767, 365, 32767, 32767, 174, 32767, 32767, 32767, 130,
    32767, 61, 332, 32767, 32767, 355, 32767, 32767, 332, 269,
    208, 209, 210, 32767, 121, 32767, 310, 32767, 32767, 32767,
    32767, 32767, 32767, 327, 32767, 333, 32767, 32767, 32767, 32767,
    111, 32767, 302, 32767, 32767, 32767, 75, 32767, 32767, 178,
    126, 32767, 32767, 364, 32767, 32767, 32767, 320, 32767, 32767,
    32767, 32767, 32767, 62, 32767, 32767, 77, 32767, 32767, 32767,
    32767, 332, 32767, 32767, 32767, 115, 32767, 169, 32767, 32767,
    32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
    32767, 332, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 4,
    32767, 151, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 25,
    25, 3, 137, 3, 137, 25, 101, 25, 25, 137,
    93, 93, 25, 25, 25, 144, 25, 25, 25, 25,
    25, 25, 25, 25
];

PHP.Parser.prototype.yygoto = [
    141, 141, 173, 173, 173, 173, 173, 173, 173, 173,
    141, 173, 142, 143, 144, 148, 153, 155, 181, 175,
    172, 172, 172, 172, 174, 174, 174, 174, 174, 174,
    174, 168, 169, 170, 171, 179, 757, 758, 392, 760,
    781, 782, 783, 784, 785, 786, 787, 789, 725, 145,
    146, 147, 149, 150, 151, 152, 154, 177, 178, 180,
    196, 208, 209, 210, 211, 212, 213, 214, 215, 217,
    218, 219, 220, 244, 245, 266, 267, 268, 430, 431,
    432, 182, 183, 184, 185, 186, 187, 188, 189, 190,
    191, 192, 156, 157, 158, 159, 176, 160, 194, 161,
    162, 163, 164, 195, 165, 193, 139, 166, 167, 452,
    452, 452, 452, 452, 452, 452, 452, 452, 452, 452,
    453, 453, 453, 453, 453, 453, 453, 453, 453, 453,
    453, 551, 551, 551, 464, 491, 394, 394, 394, 394,
    394, 394, 394, 394, 394, 394, 394, 394, 394, 394,
    394, 394, 394, 394, 407, 552, 552, 552, 810, 810,
    662, 662, 662, 662, 662, 594, 283, 595, 510, 399,
    399, 567, 679, 632, 849, 850, 863, 660, 714, 426,
    222, 622, 622, 622, 622, 223, 617, 623, 494, 395,
    395, 395, 395, 395, 395, 395, 395, 395, 395, 395,
    395, 395, 395, 395, 395, 395, 395, 465, 472, 514,
    904, 398, 398, 425, 425, 459, 425, 419, 322, 421,
    421, 393, 396, 412, 422, 428, 460, 463, 473, 481,
    501, 5, 476, 284, 327, 1, 15, 2, 6, 7,
    550, 550, 550, 8, 9, 10, 668, 16, 11, 17,
    12, 18, 13, 19, 14, 704, 328, 881, 881, 643,
    628, 626, 626, 624, 626, 526, 401, 652, 647, 847,
    847, 847, 847, 847, 847, 847, 847, 847, 847, 847,
    437, 438, 441, 447, 477, 479, 497, 290, 910, 910,
    400, 400, 486, 880, 880, 263, 913, 910, 303, 255,
    723, 306, 822, 821, 306, 896, 896, 896, 861, 304,
    323, 410, 913, 913, 897, 316, 420, 769, 658, 559,
    879, 671, 536, 324, 466, 565, 311, 311, 311, 801,
    241, 676, 496, 439, 440, 442, 444, 448, 475, 631,
    858, 311, 285, 286, 603, 495, 712, 0, 406, 321,
    0, 0, 0, 314, 0, 0, 429, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 411
];

PHP.Parser.prototype.yygcheck = [
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 35,
    35, 35, 35, 35, 35, 35, 35, 35, 35, 35,
    86, 86, 86, 86, 86, 86, 86, 86, 86, 86,
    86, 6, 6, 6, 21, 21, 35, 35, 35, 35,
    35, 35, 35, 35, 35, 35, 35, 35, 35, 35,
    35, 35, 35, 35, 71, 7, 7, 7, 35, 35,
    35, 35, 35, 35, 35, 29, 44, 29, 35, 86,
    86, 12, 12, 12, 12, 12, 12, 12, 12, 75,
    40, 35, 35, 35, 35, 40, 35, 35, 35, 82,
    82, 82, 82, 82, 82, 82, 82, 82, 82, 82,
    82, 82, 82, 82, 82, 82, 82, 36, 36, 36,
    104, 82, 82, 28, 28, 28, 28, 28, 28, 28,
    28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
    28, 13, 42, 42, 42, 2, 13, 2, 13, 13,
    5, 5, 5, 13, 13, 13, 54, 13, 13, 13,
    13, 13, 13, 13, 13, 67, 67, 83, 83, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 93,
    93, 93, 93, 93, 93, 93, 93, 93, 93, 93,
    52, 52, 52, 52, 52, 52, 52, 4, 105, 105,
    89, 89, 94, 84, 84, 92, 105, 105, 26, 92,
    71, 4, 91, 91, 4, 84, 84, 84, 97, 30,
    70, 30, 105, 105, 102, 27, 30, 72, 50, 10,
    84, 55, 46, 9, 30, 11, 90, 90, 90, 80,
    30, 56, 30, 85, 85, 85, 85, 85, 85, 43,
    96, 90, 44, 44, 34, 77, 69, -1, 4, 90,
    -1, -1, -1, 4, -1, -1, 4, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, 71
];

PHP.Parser.prototype.yygbase = [
    0, 0, -286, 0, 10, 239, 130, 154, 0, -10,
    25, -23, -29, -289, 0, -30, 0, 0, 0, 0,
    0, 83, 0, 0, 0, 0, 245, 84, -11, 142,
    -28, 0, 0, 0, -13, -88, -42, 0, 0, 0,
    -344, 0, -38, -12, -188, 0, 23, 0, 0, 0,
    66, 0, 247, 0, 205, 24, -18, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 13, 0, -15,
    85, 74, 70, 0, 0, 148, 0, -14, 0, 0,
    -6, 0, -35, 11, 47, 278, -77, 0, 0, 44,
    68, 43, 38, 72, 94, 0, -16, 109, 0, 0,
    0, 0, 87, 0, 170, 34, 0
];

PHP.Parser.prototype.yygdefault = [
    -32768, 362, 3, 546, 382, 570, 571, 572, 307, 305,
    560, 566, 467, 4, 568, 140, 295, 575, 296, 500,
    577, 414, 579, 580, 308, 309, 415, 315, 216, 593,
    503, 313, 596, 357, 602, 301, 449, 383, 350, 461,
    221, 423, 456, 630, 282, 638, 540, 646, 649, 450,
    657, 352, 433, 434, 667, 672, 677, 680, 334, 325,
    474, 684, 685, 256, 689, 511, 512, 703, 242, 711,
    317, 724, 342, 788, 790, 397, 408, 484, 797, 326,
    800, 384, 385, 386, 387, 435, 818, 815, 289, 866,
    287, 443, 254, 853, 468, 356, 903, 862, 288, 388,
    389, 302, 898, 341, 905, 912, 458
];

PHP.Parser.prototype.yylhs = [
    0, 1, 2, 2, 4, 4, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 8, 8, 10, 10, 10,
    10, 9, 9, 11, 13, 13, 14, 14, 14, 14,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 33, 33,
    34, 27, 27, 30, 30, 6, 7, 7, 7, 37,
    37, 37, 38, 38, 41, 41, 39, 39, 42, 42,
    22, 22, 29, 29, 32, 32, 31, 31, 43, 23,
    23, 23, 23, 44, 44, 45, 45, 46, 46, 20,
    20, 16, 16, 47, 18, 18, 48, 17, 17, 19,
    19, 36, 36, 49, 49, 50, 50, 51, 51, 51,
    51, 52, 52, 53, 53, 54, 54, 24, 24, 55,
    55, 55, 25, 25, 56, 56, 40, 40, 57, 57,
    57, 57, 62, 62, 63, 63, 64, 64, 64, 64,
    65, 66, 66, 61, 61, 58, 58, 60, 60, 68,
    68, 67, 67, 67, 67, 67, 67, 59, 59, 69,
    69, 26, 26, 21, 21, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 71, 77, 77, 79, 79, 80, 81,
    81, 81, 81, 81, 81, 86, 86, 35, 35, 35,
    72, 72, 87, 87, 82, 82, 88, 88, 88, 88,
    88, 73, 73, 73, 76, 76, 76, 78, 78, 93,
    93, 93, 93, 93, 93, 93, 93, 93, 93, 93,
    93, 93, 93, 12, 12, 12, 12, 12, 12, 74,
    74, 74, 74, 94, 94, 96, 96, 95, 95, 97,
    97, 28, 28, 28, 28, 99, 99, 98, 98, 98,
    98, 98, 100, 100, 84, 84, 89, 89, 83, 83,
    101, 101, 101, 101, 90, 90, 90, 90, 85, 85,
    91, 91, 91, 70, 70, 102, 102, 102, 75, 75,
    103, 103, 104, 104, 104, 104, 92, 92, 92, 92,
    105, 105, 105, 105, 105, 105, 105, 106, 106, 106
];

PHP.Parser.prototype.yylen = [
    1, 1, 2, 0, 1, 3, 1, 1, 1, 1,
    3, 5, 4, 3, 3, 3, 1, 1, 3, 2,
    4, 3, 1, 3, 2, 0, 1, 1, 1, 1,
    3, 7, 10, 5, 7, 9, 5, 2, 3, 2,
    3, 2, 3, 3, 3, 3, 1, 2, 5, 7,
    8, 10, 5, 1, 5, 3, 3, 2, 1, 2,
    8, 1, 3, 0, 1, 9, 7, 6, 5, 1,
    2, 2, 0, 2, 0, 2, 0, 2, 1, 3,
    1, 4, 1, 4, 1, 4, 1, 3, 3, 3,
    4, 4, 5, 0, 2, 4, 3, 1, 1, 1,
    4, 0, 2, 5, 0, 2, 6, 0, 2, 0,
    3, 1, 0, 1, 3, 3, 5, 0, 1, 1,
    1, 1, 0, 1, 3, 1, 2, 3, 1, 1,
    2, 4, 3, 1, 1, 3, 2, 0, 3, 3,
    8, 3, 1, 3, 0, 2, 4, 5, 4, 4,
    3, 1, 1, 1, 3, 1, 1, 0, 1, 1,
    2, 1, 1, 1, 1, 1, 1, 1, 3, 1,
    3, 3, 1, 0, 1, 1, 6, 3, 4, 4,
    1, 2, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 2, 2, 2, 2, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 2, 2, 2, 2, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 5, 4,
    4, 4, 2, 2, 4, 2, 2, 2, 2, 2,
    2, 2, 2, 2, 2, 2, 1, 4, 3, 3,
    2, 9, 10, 3, 0, 4, 1, 3, 2, 4,
    6, 8, 4, 4, 4, 1, 1, 1, 2, 3,
    1, 1, 1, 1, 1, 1, 0, 3, 3, 4,
    4, 0, 2, 3, 0, 1, 1, 0, 3, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    3, 2, 1, 1, 3, 2, 2, 4, 3, 1,
    3, 3, 3, 0, 2, 0, 1, 3, 1, 3,
    1, 1, 1, 1, 1, 6, 4, 3, 6, 4,
    4, 4, 1, 3, 1, 2, 1, 1, 4, 1,
    3, 6, 4, 4, 4, 4, 1, 4, 0, 1,
    1, 3, 1, 3, 1, 1, 4, 0, 0, 2,
    3, 1, 3, 1, 4, 2, 2, 2, 1, 2,
    1, 4, 3, 3, 3, 6, 3, 1, 1, 1
];







PHP.Parser.prototype.yyn0 = function () {
    this.yyval = this.yyastk[this.stackPos];
};

PHP.Parser.prototype.yyn1 = function (attributes) {
    this.yyval = this.Stmt_Namespace_postprocess(this.yyastk[this.stackPos - (1 - 1)]);
};

PHP.Parser.prototype.yyn2 = function (attributes) {
    if (Array.isArray(this.yyastk[this.stackPos - (2 - 2)])) {
        this.yyval = this.yyastk[this.stackPos - (2 - 1)].concat(this.yyastk[this.stackPos - (2 - 2)]);
    } else {
        this.yyastk[this.stackPos - (2 - 1)].push(this.yyastk[this.stackPos - (2 - 2)]);
        this.yyval = this.yyastk[this.stackPos - (2 - 1)];
    };
};

PHP.Parser.prototype.yyn3 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn4 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn5 = function (attributes) {
    this.yyastk[this.stackPos - (3 - 1)].push(this.yyastk[this.stackPos - (3 - 3)]);
    this.yyval = this.yyastk[this.stackPos - (3 - 1)];
};

PHP.Parser.prototype.yyn6 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn7 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn8 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn9 = function (attributes) {
    this.yyval = this.Node_Stmt_HaltCompiler(attributes);
};

PHP.Parser.prototype.yyn10 = function (attributes) {
    this.yyval = this.Node_Stmt_Namespace(this.Node_Name(this.yyastk[this.stackPos - (3 - 2)], attributes), null, attributes);
};

PHP.Parser.prototype.yyn11 = function (attributes) {
    this.yyval = this.Node_Stmt_Namespace(this.Node_Name(this.yyastk[this.stackPos - (5 - 2)], attributes), this.yyastk[this.stackPos - (5 - 4)], attributes);
};

PHP.Parser.prototype.yyn12 = function (attributes) {
    this.yyval = this.Node_Stmt_Namespace(null, this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn13 = function (attributes) {
    this.yyval = this.Node_Stmt_Use(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn14 = function (attributes) {
    this.yyval = this.Node_Stmt_Const(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn15 = function (attributes) {
    this.yyastk[this.stackPos - (3 - 1)].push(this.yyastk[this.stackPos - (3 - 3)]);
    this.yyval = this.yyastk[this.stackPos - (3 - 1)];
};

PHP.Parser.prototype.yyn16 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn17 = function (attributes) {
    this.yyval = this.Node_Stmt_UseUse(this.Node_Name(this.yyastk[this.stackPos - (1 - 1)], attributes), null, attributes);
};

PHP.Parser.prototype.yyn18 = function (attributes) {
    this.yyval = this.Node_Stmt_UseUse(this.Node_Name(this.yyastk[this.stackPos - (3 - 1)], attributes), this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn19 = function (attributes) {
    this.yyval = this.Node_Stmt_UseUse(this.Node_Name(this.yyastk[this.stackPos - (2 - 2)], attributes), null, attributes);
};

PHP.Parser.prototype.yyn20 = function (attributes) {
    this.yyval = this.Node_Stmt_UseUse(this.Node_Name(this.yyastk[this.stackPos - (4 - 2)], attributes), this.yyastk[this.stackPos - (4 - 4)], attributes);
};

PHP.Parser.prototype.yyn21 = function (attributes) {
    this.yyastk[this.stackPos - (3 - 1)].push(this.yyastk[this.stackPos - (3 - 3)]);
    this.yyval = this.yyastk[this.stackPos - (3 - 1)];
};

PHP.Parser.prototype.yyn22 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn23 = function (attributes) {
    this.yyval = this.Node_Const(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn24 = function (attributes) {
    if (Array.isArray(this.yyastk[this.stackPos - (2 - 2)])) {
        this.yyval = this.yyastk[this.stackPos - (2 - 1)].concat(this.yyastk[this.stackPos - (2 - 2)]);
    } else {
        this.yyastk[this.stackPos - (2 - 1)].push(this.yyastk[this.stackPos - (2 - 2)]);
        this.yyval = this.yyastk[this.stackPos - (2 - 1)];
    };
};

PHP.Parser.prototype.yyn25 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn26 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn27 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn28 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn29 = function (attributes) {
    throw new Error('__halt_compiler() can only be used from the outermost scope');
};

PHP.Parser.prototype.yyn30 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (3 - 2)];
};

PHP.Parser.prototype.yyn31 = function (attributes) {
    this.yyval = this.Node_Stmt_If(this.yyastk[this.stackPos - (7 - 3)], {
        'stmts': Array.isArray(this.yyastk[this.stackPos - (7 - 5)]) ? this.yyastk[this.stackPos - (7 - 5)] : [this.yyastk[this.stackPos - (7 - 5)]],
        'elseifs': this.yyastk[this.stackPos - (7 - 6)],
        'Else': this.yyastk[this.stackPos - (7 - 7)]
    }, attributes);
};

PHP.Parser.prototype.yyn32 = function (attributes) {
    this.yyval = this.Node_Stmt_If(this.yyastk[this.stackPos - (10 - 3)], {
        'stmts': this.yyastk[this.stackPos - (10 - 6)],
        'elseifs': this.yyastk[this.stackPos - (10 - 7)],
        'else': this.yyastk[this.stackPos - (10 - 8)]
    }, attributes);
};

PHP.Parser.prototype.yyn33 = function (attributes) {
    this.yyval = this.Node_Stmt_While(this.yyastk[this.stackPos - (5 - 3)], this.yyastk[this.stackPos - (5 - 5)], attributes);
};

PHP.Parser.prototype.yyn34 = function (attributes) {
    this.yyval = this.Node_Stmt_Do(this.yyastk[this.stackPos - (7 - 5)], Array.isArray(this.yyastk[this.stackPos - (7 - 2)]) ? this.yyastk[this.stackPos - (7 - 2)] : [this.yyastk[this.stackPos - (7 - 2)]], attributes);
};

PHP.Parser.prototype.yyn35 = function (attributes) {
    this.yyval = this.Node_Stmt_For({
        'init': this.yyastk[this.stackPos - (9 - 3)],
        'cond': this.yyastk[this.stackPos - (9 - 5)],
        'loop': this.yyastk[this.stackPos - (9 - 7)],
        'stmts': this.yyastk[this.stackPos - (9 - 9)]
    }, attributes);
};

PHP.Parser.prototype.yyn36 = function (attributes) {
    this.yyval = this.Node_Stmt_Switch(this.yyastk[this.stackPos - (5 - 3)], this.yyastk[this.stackPos - (5 - 5)], attributes);
};

PHP.Parser.prototype.yyn37 = function (attributes) {
    this.yyval = this.Node_Stmt_Break(null, attributes);
};

PHP.Parser.prototype.yyn38 = function (attributes) {
    this.yyval = this.Node_Stmt_Break(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn39 = function (attributes) {
    this.yyval = this.Node_Stmt_Continue(null, attributes);
};

PHP.Parser.prototype.yyn40 = function (attributes) {
    this.yyval = this.Node_Stmt_Continue(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn41 = function (attributes) {
    this.yyval = this.Node_Stmt_Return(null, attributes);
};

PHP.Parser.prototype.yyn42 = function (attributes) {
    this.yyval = this.Node_Stmt_Return(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn43 = function (attributes) {
    this.yyval = this.Node_Stmt_Global(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn44 = function (attributes) {
    this.yyval = this.Node_Stmt_Static(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn45 = function (attributes) {
    this.yyval = this.Node_Stmt_Echo(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn46 = function (attributes) {
    this.yyval = this.Node_Stmt_InlineHTML(this.yyastk[this.stackPos - (1 - 1)], attributes);
};

PHP.Parser.prototype.yyn47 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (2 - 1)];
};

PHP.Parser.prototype.yyn48 = function (attributes) {
    this.yyval = this.Node_Stmt_Unset(this.yyastk[this.stackPos - (5 - 3)], attributes);
};

PHP.Parser.prototype.yyn49 = function (attributes) {
    this.yyval = this.Node_Stmt_Foreach(this.yyastk[this.stackPos - (7 - 3)], this.yyastk[this.stackPos - (7 - 5)], {
        'keyVar': null,
        'byRef': false,
        'stmts': this.yyastk[this.stackPos - (7 - 7)]
    }, attributes);
};

PHP.Parser.prototype.yyn50 = function (attributes) {
    this.yyval = this.Node_Stmt_Foreach(this.yyastk[this.stackPos - (8 - 3)], this.yyastk[this.stackPos - (8 - 6)], {
        'keyVar': null,
        'byRef': true,
        'stmts': this.yyastk[this.stackPos - (8 - 8)]
    }, attributes);
};

PHP.Parser.prototype.yyn51 = function (attributes) {
    this.yyval = this.Node_Stmt_Foreach(this.yyastk[this.stackPos - (10 - 3)], this.yyastk[this.stackPos - (10 - 8)], {
        'keyVar': this.yyastk[this.stackPos - (10 - 5)],
        'byRef': this.yyastk[this.stackPos - (10 - 7)],
        'stmts': this.yyastk[this.stackPos - (10 - 10)]
    }, attributes);
};

PHP.Parser.prototype.yyn52 = function (attributes) {
    this.yyval = this.Node_Stmt_Declare(this.yyastk[this.stackPos - (5 - 3)], this.yyastk[this.stackPos - (5 - 5)], attributes);
};

PHP.Parser.prototype.yyn53 = function (attributes) {
    this.yyval = []; /* means: no statement */
};

PHP.Parser.prototype.yyn54 = function (attributes) {
    this.yyval = this.Node_Stmt_TryCatch(this.yyastk[this.stackPos - (5 - 3)], this.yyastk[this.stackPos - (5 - 5)], attributes);
};

PHP.Parser.prototype.yyn55 = function (attributes) {
    this.yyval = this.Node_Stmt_Throw(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn56 = function (attributes) {
    this.yyval = this.Node_Stmt_Goto(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn57 = function (attributes) {
    this.yyval = this.Node_Stmt_Label(this.yyastk[this.stackPos - (2 - 1)], attributes);
};

PHP.Parser.prototype.yyn58 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn59 = function (attributes) {
    this.yyastk[this.stackPos - (2 - 1)].push(this.yyastk[this.stackPos - (2 - 2)]);
    this.yyval = this.yyastk[this.stackPos - (2 - 1)];
};

PHP.Parser.prototype.yyn60 = function (attributes) {
    this.yyval = this.Node_Stmt_Catch(this.yyastk[this.stackPos - (8 - 3)], this.yyastk[this.stackPos - (8 - 4)].substring(1), this.yyastk[this.stackPos - (8 - 7)], attributes);
};

PHP.Parser.prototype.yyn61 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn62 = function (attributes) {
    this.yyastk[this.stackPos - (3 - 1)].push(this.yyastk[this.stackPos - (3 - 3)]);
    this.yyval = this.yyastk[this.stackPos - (3 - 1)];
};

PHP.Parser.prototype.yyn63 = function (attributes) {
    this.yyval = false;
};

PHP.Parser.prototype.yyn64 = function (attributes) {
    this.yyval = true;
};

PHP.Parser.prototype.yyn65 = function (attributes) {
    this.yyval = this.Node_Stmt_Function(this.yyastk[this.stackPos - (9 - 3)], {
        'byRef': this.yyastk[this.stackPos - (9 - 2)],
        'params': this.yyastk[this.stackPos - (9 - 5)],
        'stmts': this.yyastk[this.stackPos - (9 - 8)]
    }, attributes);
};

PHP.Parser.prototype.yyn66 = function (attributes) {
    this.yyval = this.Node_Stmt_Class(this.yyastk[this.stackPos - (7 - 2)], {
        'type': this.yyastk[this.stackPos - (7 - 1)],
        'Extends': this.yyastk[this.stackPos - (7 - 3)],
        'Implements': this.yyastk[this.stackPos - (7 - 4)],
        'stmts': this.yyastk[this.stackPos - (7 - 6)]
    }, attributes);
};

PHP.Parser.prototype.yyn67 = function (attributes) {
    this.yyval = this.Node_Stmt_Interface(this.yyastk[this.stackPos - (6 - 2)], {
        'Extends': this.yyastk[this.stackPos - (6 - 3)],
        'stmts': this.yyastk[this.stackPos - (6 - 5)]
    }, attributes);
};

PHP.Parser.prototype.yyn68 = function (attributes) {
    this.yyval = this.Node_Stmt_Trait(this.yyastk[this.stackPos - (5 - 2)], this.yyastk[this.stackPos - (5 - 4)], attributes);
};

PHP.Parser.prototype.yyn69 = function (attributes) {
    this.yyval = 0;
};

PHP.Parser.prototype.yyn70 = function (attributes) {
    this.yyval = this.MODIFIER_ABSTRACT;
};

PHP.Parser.prototype.yyn71 = function (attributes) {
    this.yyval = this.MODIFIER_FINAL;
};

PHP.Parser.prototype.yyn72 = function (attributes) {
    this.yyval = null;
};

PHP.Parser.prototype.yyn73 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (2 - 2)];
};

PHP.Parser.prototype.yyn74 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn75 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (2 - 2)];
};

PHP.Parser.prototype.yyn76 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn77 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (2 - 2)];
};

PHP.Parser.prototype.yyn78 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn79 = function (attributes) {
    this.yyastk[this.stackPos - (3 - 1)].push(this.yyastk[this.stackPos - (3 - 3)]);
    this.yyval = this.yyastk[this.stackPos - (3 - 1)];
};

PHP.Parser.prototype.yyn80 = function (attributes) {
    this.yyval = Array.isArray(this.yyastk[this.stackPos - (1 - 1)]) ? this.yyastk[this.stackPos - (1 - 1)] : [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn81 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (4 - 2)];
};

PHP.Parser.prototype.yyn82 = function (attributes) {
    this.yyval = Array.isArray(this.yyastk[this.stackPos - (1 - 1)]) ? this.yyastk[this.stackPos - (1 - 1)] : [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn83 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (4 - 2)];
};

PHP.Parser.prototype.yyn84 = function (attributes) {
    this.yyval = Array.isArray(this.yyastk[this.stackPos - (1 - 1)]) ? this.yyastk[this.stackPos - (1 - 1)] : [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn85 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (4 - 2)];
};

PHP.Parser.prototype.yyn86 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn87 = function (attributes) {
    this.yyastk[this.stackPos - (3 - 1)].push(this.yyastk[this.stackPos - (3 - 3)]);
    this.yyval = this.yyastk[this.stackPos - (3 - 1)];
};

PHP.Parser.prototype.yyn88 = function (attributes) {
    this.yyval = this.Node_Stmt_DeclareDeclare(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn89 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (3 - 2)];
};

PHP.Parser.prototype.yyn90 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (4 - 3)];
};

PHP.Parser.prototype.yyn91 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (4 - 2)];
};

PHP.Parser.prototype.yyn92 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (5 - 3)];
};

PHP.Parser.prototype.yyn93 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn94 = function (attributes) {
    this.yyastk[this.stackPos - (2 - 1)].push(this.yyastk[this.stackPos - (2 - 2)]);
    this.yyval = this.yyastk[this.stackPos - (2 - 1)];
};

PHP.Parser.prototype.yyn95 = function (attributes) {
    this.yyval = this.Node_Stmt_Case(this.yyastk[this.stackPos - (4 - 2)], this.yyastk[this.stackPos - (4 - 4)], attributes);
};

PHP.Parser.prototype.yyn96 = function (attributes) {
    this.yyval = this.Node_Stmt_Case(null, this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn97 = function () {
    this.yyval = this.yyastk[this.stackPos];
};

PHP.Parser.prototype.yyn98 = function () {
    this.yyval = this.yyastk[this.stackPos];
};

PHP.Parser.prototype.yyn99 = function (attributes) {
    this.yyval = Array.isArray(this.yyastk[this.stackPos - (1 - 1)]) ? this.yyastk[this.stackPos - (1 - 1)] : [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn100 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (4 - 2)];
};

PHP.Parser.prototype.yyn101 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn102 = function (attributes) {
    this.yyastk[this.stackPos - (2 - 1)].push(this.yyastk[this.stackPos - (2 - 2)]);
    this.yyval = this.yyastk[this.stackPos - (2 - 1)];
};

PHP.Parser.prototype.yyn103 = function (attributes) {
    this.yyval = this.Node_Stmt_ElseIf(this.yyastk[this.stackPos - (5 - 3)], Array.isArray(this.yyastk[this.stackPos - (5 - 5)]) ? this.yyastk[this.stackPos - (5 - 5)] : [this.yyastk[this.stackPos - (5 - 5)]], attributes);
};

PHP.Parser.prototype.yyn104 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn105 = function (attributes) {
    this.yyastk[this.stackPos - (2 - 1)].push(this.yyastk[this.stackPos - (2 - 2)]);
    this.yyval = this.yyastk[this.stackPos - (2 - 1)];
};

PHP.Parser.prototype.yyn106 = function (attributes) {
    this.yyval = this.Node_Stmt_ElseIf(this.yyastk[this.stackPos - (6 - 3)], this.yyastk[this.stackPos - (6 - 6)], attributes);
};

PHP.Parser.prototype.yyn107 = function (attributes) {
    this.yyval = null;
};

PHP.Parser.prototype.yyn108 = function (attributes) {
    this.yyval = this.Node_Stmt_Else(Array.isArray(this.yyastk[this.stackPos - (2 - 2)]) ? this.yyastk[this.stackPos - (2 - 2)] : [this.yyastk[this.stackPos - (2 - 2)]], attributes);
};

PHP.Parser.prototype.yyn109 = function (attributes) {
    this.yyval = null;
};

PHP.Parser.prototype.yyn110 = function (attributes) {
    this.yyval = this.Node_Stmt_Else(this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn111 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn112 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn113 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn114 = function (attributes) {
    this.yyastk[this.stackPos - (3 - 1)].push(this.yyastk[this.stackPos - (3 - 3)]);
    this.yyval = this.yyastk[this.stackPos - (3 - 1)];
};

PHP.Parser.prototype.yyn115 = function (attributes) {
    this.yyval = this.Node_Param(this.yyastk[this.stackPos - (3 - 3)].substring(1), null, this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn116 = function (attributes) {
    this.yyval = this.Node_Param(this.yyastk[this.stackPos - (5 - 3)].substring(1), this.yyastk[this.stackPos - (5 - 5)], this.yyastk[this.stackPos - (5 - 1)], this.yyastk[this.stackPos - (5 - 2)], attributes);
};

PHP.Parser.prototype.yyn117 = function (attributes) {
    this.yyval = null;
};

PHP.Parser.prototype.yyn118 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn119 = function (attributes) {
    this.yyval = 'array';
};

PHP.Parser.prototype.yyn120 = function (attributes) {
    this.yyval = 'callable';
};

PHP.Parser.prototype.yyn121 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn122 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn123 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn124 = function (attributes) {
    this.yyastk[this.stackPos - (3 - 1)].push(this.yyastk[this.stackPos - (3 - 3)]);
    this.yyval = this.yyastk[this.stackPos - (3 - 1)];
};

PHP.Parser.prototype.yyn125 = function (attributes) {
    this.yyval = this.Node_Arg(this.yyastk[this.stackPos - (1 - 1)], false, attributes);
};

PHP.Parser.prototype.yyn126 = function (attributes) {
    this.yyval = this.Node_Arg(this.yyastk[this.stackPos - (2 - 2)], true, attributes);
};

PHP.Parser.prototype.yyn127 = function (attributes) {
    this.yyastk[this.stackPos - (3 - 1)].push(this.yyastk[this.stackPos - (3 - 3)]);
    this.yyval = this.yyastk[this.stackPos - (3 - 1)];
};

PHP.Parser.prototype.yyn128 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn129 = function (attributes) {
    this.yyval = this.Node_Expr_Variable(this.yyastk[this.stackPos - (1 - 1)].substring(1), attributes);
};

PHP.Parser.prototype.yyn130 = function (attributes) {
    this.yyval = this.Node_Expr_Variable(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn131 = function (attributes) {
    this.yyval = this.Node_Expr_Variable(this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn132 = function (attributes) {
    this.yyastk[this.stackPos - (3 - 1)].push(this.yyastk[this.stackPos - (3 - 3)]);
    this.yyval = this.yyastk[this.stackPos - (3 - 1)];
};

PHP.Parser.prototype.yyn133 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn134 = function (attributes) {
    this.yyval = this.Node_Stmt_StaticVar(this.yyastk[this.stackPos - (1 - 1)].substring(1), null, attributes);
};

PHP.Parser.prototype.yyn135 = function (attributes) {
    this.yyval = this.Node_Stmt_StaticVar(this.yyastk[this.stackPos - (3 - 1)].substring(1), this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn136 = function (attributes) {
    this.yyastk[this.stackPos - (2 - 1)].push(this.yyastk[this.stackPos - (2 - 2)]);
    this.yyval = this.yyastk[this.stackPos - (2 - 1)];
};

PHP.Parser.prototype.yyn137 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn138 = function (attributes) {
    this.yyval = this.Node_Stmt_Property(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn139 = function (attributes) {
    this.yyval = this.Node_Stmt_ClassConst(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn140 = function (attributes) {
    this.yyval = this.Node_Stmt_ClassMethod(this.yyastk[this.stackPos - (8 - 4)], {
        'type': this.yyastk[this.stackPos - (8 - 1)],
        'byRef': this.yyastk[this.stackPos - (8 - 3)],
        'params': this.yyastk[this.stackPos - (8 - 6)],
        'stmts': this.yyastk[this.stackPos - (8 - 8)]
    }, attributes);
};

PHP.Parser.prototype.yyn141 = function (attributes) {
    this.yyval = this.Node_Stmt_TraitUse(this.yyastk[this.stackPos - (3 - 2)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn142 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn143 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (3 - 2)];
};

PHP.Parser.prototype.yyn144 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn145 = function (attributes) {
    this.yyastk[this.stackPos - (2 - 1)].push(this.yyastk[this.stackPos - (2 - 2)]);
    this.yyval = this.yyastk[this.stackPos - (2 - 1)];
};

PHP.Parser.prototype.yyn146 = function (attributes) {
    this.yyval = this.Node_Stmt_TraitUseAdaptation_Precedence(this.yyastk[this.stackPos - (4 - 1)][0], this.yyastk[this.stackPos - (4 - 1)][1], this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn147 = function (attributes) {
    this.yyval = this.Node_Stmt_TraitUseAdaptation_Alias(this.yyastk[this.stackPos - (5 - 1)][0], this.yyastk[this.stackPos - (5 - 1)][1], this.yyastk[this.stackPos - (5 - 3)], this.yyastk[this.stackPos - (5 - 4)], attributes);
};

PHP.Parser.prototype.yyn148 = function (attributes) {
    this.yyval = this.Node_Stmt_TraitUseAdaptation_Alias(this.yyastk[this.stackPos - (4 - 1)][0], this.yyastk[this.stackPos - (4 - 1)][1], this.yyastk[this.stackPos - (4 - 3)], null, attributes);
};

PHP.Parser.prototype.yyn149 = function (attributes) {
    this.yyval = this.Node_Stmt_TraitUseAdaptation_Alias(this.yyastk[this.stackPos - (4 - 1)][0], this.yyastk[this.stackPos - (4 - 1)][1], null, this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn150 = function (attributes) {
    this.yyval = array(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)]);
};

PHP.Parser.prototype.yyn151 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn152 = function (attributes) {
    this.yyval = array(null, this.yyastk[this.stackPos - (1 - 1)]);
};

PHP.Parser.prototype.yyn153 = function (attributes) {
    this.yyval = null;
};

PHP.Parser.prototype.yyn154 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (3 - 2)];
};

PHP.Parser.prototype.yyn155 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn156 = function (attributes) {
    this.yyval = this.MODIFIER_PUBLIC;
};

PHP.Parser.prototype.yyn157 = function (attributes) {
    this.yyval = this.MODIFIER_PUBLIC;
};

PHP.Parser.prototype.yyn158 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn159 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn160 = function (attributes) {
    this.Stmt_Class_verifyModifier(this.yyastk[this.stackPos - (2 - 1)], this.yyastk[this.stackPos - (2 - 2)]);
    this.yyval = this.yyastk[this.stackPos - (2 - 1)] | this.yyastk[this.stackPos - (2 - 2)];
};

PHP.Parser.prototype.yyn161 = function (attributes) {
    this.yyval = this.MODIFIER_PUBLIC;
};

PHP.Parser.prototype.yyn162 = function (attributes) {
    this.yyval = this.MODIFIER_PROTECTED;
};

PHP.Parser.prototype.yyn163 = function (attributes) {
    this.yyval = this.MODIFIER_PRIVATE;
};

PHP.Parser.prototype.yyn164 = function (attributes) {
    this.yyval = this.MODIFIER_STATIC;
};

PHP.Parser.prototype.yyn165 = function (attributes) {
    this.yyval = this.MODIFIER_ABSTRACT;
};

PHP.Parser.prototype.yyn166 = function (attributes) {
    this.yyval = this.MODIFIER_FINAL;
};

PHP.Parser.prototype.yyn167 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn168 = function (attributes) {
    this.yyastk[this.stackPos - (3 - 1)].push(this.yyastk[this.stackPos - (3 - 3)]);
    this.yyval = this.yyastk[this.stackPos - (3 - 1)];
};

PHP.Parser.prototype.yyn169 = function (attributes) {
    this.yyval = this.Node_Stmt_PropertyProperty(this.yyastk[this.stackPos - (1 - 1)].substring(1), null, attributes);
};

PHP.Parser.prototype.yyn170 = function (attributes) {
    this.yyval = this.Node_Stmt_PropertyProperty(this.yyastk[this.stackPos - (3 - 1)].substring(1), this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn171 = function (attributes) {
    this.yyastk[this.stackPos - (3 - 1)].push(this.yyastk[this.stackPos - (3 - 3)]);
    this.yyval = this.yyastk[this.stackPos - (3 - 1)];
};

PHP.Parser.prototype.yyn172 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn173 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn174 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn175 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn176 = function (attributes) {
    this.yyval = this.Node_Expr_AssignList(this.yyastk[this.stackPos - (6 - 3)], this.yyastk[this.stackPos - (6 - 6)], attributes);
};

PHP.Parser.prototype.yyn177 = function (attributes) {
    this.yyval = this.Node_Expr_Assign(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn178 = function (attributes) {
    this.yyval = this.Node_Expr_AssignRef(this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 4)], attributes);
};

PHP.Parser.prototype.yyn179 = function (attributes) {
    this.yyval = this.Node_Expr_AssignRef(this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 4)], attributes);
};

PHP.Parser.prototype.yyn180 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn181 = function (attributes) {
    this.yyval = this.Node_Expr_Clone(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn182 = function (attributes) {
    this.yyval = this.Node_Expr_AssignPlus(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn183 = function (attributes) {
    this.yyval = this.Node_Expr_AssignMinus(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn184 = function (attributes) {
    this.yyval = this.Node_Expr_AssignMul(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn185 = function (attributes) {
    this.yyval = this.Node_Expr_AssignDiv(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn186 = function (attributes) {
    this.yyval = this.Node_Expr_AssignConcat(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn187 = function (attributes) {
    this.yyval = this.Node_Expr_AssignMod(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn188 = function (attributes) {
    this.yyval = this.Node_Expr_AssignBitwiseAnd(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn189 = function (attributes) {
    this.yyval = this.Node_Expr_AssignBitwiseOr(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn190 = function (attributes) {
    this.yyval = this.Node_Expr_AssignBitwiseXor(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn191 = function (attributes) {
    this.yyval = this.Node_Expr_AssignShiftLeft(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn192 = function (attributes) {
    this.yyval = this.Node_Expr_AssignShiftRight(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn193 = function (attributes) {
    this.yyval = this.Node_Expr_PostInc(this.yyastk[this.stackPos - (2 - 1)], attributes);
};

PHP.Parser.prototype.yyn194 = function (attributes) {
    this.yyval = this.Node_Expr_PreInc(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn195 = function (attributes) {
    this.yyval = this.Node_Expr_PostDec(this.yyastk[this.stackPos - (2 - 1)], attributes);
};

PHP.Parser.prototype.yyn196 = function (attributes) {
    this.yyval = this.Node_Expr_PreDec(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn197 = function (attributes) {
    this.yyval = this.Node_Expr_BooleanOr(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn198 = function (attributes) {
    this.yyval = this.Node_Expr_BooleanAnd(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn199 = function (attributes) {
    this.yyval = this.Node_Expr_LogicalOr(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn200 = function (attributes) {
    this.yyval = this.Node_Expr_LogicalAnd(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn201 = function (attributes) {
    this.yyval = this.Node_Expr_LogicalXor(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn202 = function (attributes) {
    this.yyval = this.Node_Expr_BitwiseOr(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn203 = function (attributes) {
    this.yyval = this.Node_Expr_BitwiseAnd(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn204 = function (attributes) {
    this.yyval = this.Node_Expr_BitwiseXor(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn205 = function (attributes) {
    this.yyval = this.Node_Expr_Concat(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn206 = function (attributes) {
    this.yyval = this.Node_Expr_Plus(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn207 = function (attributes) {
    this.yyval = this.Node_Expr_Minus(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn208 = function (attributes) {
    this.yyval = this.Node_Expr_Mul(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn209 = function (attributes) {
    this.yyval = this.Node_Expr_Div(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn210 = function (attributes) {
    this.yyval = this.Node_Expr_Mod(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn211 = function (attributes) {
    this.yyval = this.Node_Expr_ShiftLeft(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn212 = function (attributes) {
    this.yyval = this.Node_Expr_ShiftRight(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn213 = function (attributes) {
    this.yyval = this.Node_Expr_UnaryPlus(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn214 = function (attributes) {
    this.yyval = this.Node_Expr_UnaryMinus(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn215 = function (attributes) {
    this.yyval = this.Node_Expr_BooleanNot(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn216 = function (attributes) {
    this.yyval = this.Node_Expr_BitwiseNot(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn217 = function (attributes) {
    this.yyval = this.Node_Expr_Identical(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn218 = function (attributes) {
    this.yyval = this.Node_Expr_NotIdentical(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn219 = function (attributes) {
    this.yyval = this.Node_Expr_Equal(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn220 = function (attributes) {
    this.yyval = this.Node_Expr_NotEqual(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn221 = function (attributes) {
    this.yyval = this.Node_Expr_Smaller(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn222 = function (attributes) {
    this.yyval = this.Node_Expr_SmallerOrEqual(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn223 = function (attributes) {
    this.yyval = this.Node_Expr_Greater(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn224 = function (attributes) {
    this.yyval = this.Node_Expr_GreaterOrEqual(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn225 = function (attributes) {
    this.yyval = this.Node_Expr_Instanceof(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn226 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (3 - 2)];
};

PHP.Parser.prototype.yyn227 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (3 - 2)];
};

PHP.Parser.prototype.yyn228 = function (attributes) {
    this.yyval = this.Node_Expr_Ternary(this.yyastk[this.stackPos - (5 - 1)], this.yyastk[this.stackPos - (5 - 3)], this.yyastk[this.stackPos - (5 - 5)], attributes);
};

PHP.Parser.prototype.yyn229 = function (attributes) {
    this.yyval = this.Node_Expr_Ternary(this.yyastk[this.stackPos - (4 - 1)], null, this.yyastk[this.stackPos - (4 - 4)], attributes);
};

PHP.Parser.prototype.yyn230 = function (attributes) {
    this.yyval = this.Node_Expr_Isset(this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn231 = function (attributes) {
    this.yyval = this.Node_Expr_Empty(this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn232 = function (attributes) {
    this.yyval = this.Node_Expr_Include(this.yyastk[this.stackPos - (2 - 2)], "Node_Expr_Include", attributes);
};

PHP.Parser.prototype.yyn233 = function (attributes) {
    this.yyval = this.Node_Expr_Include(this.yyastk[this.stackPos - (2 - 2)], "Node_Expr_IncludeOnce", attributes);
};

PHP.Parser.prototype.yyn234 = function (attributes) {
    this.yyval = this.Node_Expr_Eval(this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn235 = function (attributes) {
    this.yyval = this.Node_Expr_Include(this.yyastk[this.stackPos - (2 - 2)], "Node_Expr_Require", attributes);
};

PHP.Parser.prototype.yyn236 = function (attributes) {
    this.yyval = this.Node_Expr_Include(this.yyastk[this.stackPos - (2 - 2)], "Node_Expr_RequireOnce", attributes);
};

PHP.Parser.prototype.yyn237 = function (attributes) {
    this.yyval = this.Node_Expr_Cast_Int(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn238 = function (attributes) {
    this.yyval = this.Node_Expr_Cast_Double(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn239 = function (attributes) {
    this.yyval = this.Node_Expr_Cast_String(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn240 = function (attributes) {
    this.yyval = this.Node_Expr_Cast_Array(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn241 = function (attributes) {
    this.yyval = this.Node_Expr_Cast_Object(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn242 = function (attributes) {
    this.yyval = this.Node_Expr_Cast_Bool(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn243 = function (attributes) {
    this.yyval = this.Node_Expr_Cast_Unset(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn244 = function (attributes) {
    this.yyval = this.Node_Expr_Exit(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn245 = function (attributes) {
    this.yyval = this.Node_Expr_ErrorSuppress(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn246 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn247 = function (attributes) {
    this.yyval = this.Node_Expr_Array(this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn248 = function (attributes) {
    this.yyval = this.Node_Expr_Array(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn249 = function (attributes) {
    this.yyval = this.Node_Expr_ShellExec(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn250 = function (attributes) {
    this.yyval = this.Node_Expr_Print(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn251 = function (attributes) {
    this.yyval = this.Node_Expr_Closure({
        'static': false,
        'byRef': this.yyastk[this.stackPos - (9 - 2)],
        'params': this.yyastk[this.stackPos - (9 - 4)],
        'uses': this.yyastk[this.stackPos - (9 - 6)],
        'stmts': this.yyastk[this.stackPos - (9 - 8)]
    }, attributes);
};

PHP.Parser.prototype.yyn252 = function (attributes) {
    this.yyval = this.Node_Expr_Closure({
        'static': true,
        'byRef': this.yyastk[this.stackPos - (10 - 3)],
        'params': this.yyastk[this.stackPos - (10 - 5)],
        'uses': this.yyastk[this.stackPos - (10 - 7)],
        'stmts': this.yyastk[this.stackPos - (10 - 9)]
    }, attributes);
};

PHP.Parser.prototype.yyn253 = function (attributes) {
    this.yyval = this.Node_Expr_New(this.yyastk[this.stackPos - (3 - 2)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn254 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn255 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (4 - 3)];
};

PHP.Parser.prototype.yyn256 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn257 = function (attributes) {
    this.yyastk[this.stackPos - (3 - 1)].push(this.yyastk[this.stackPos - (3 - 3)]);
    this.yyval = this.yyastk[this.stackPos - (3 - 1)];
};

PHP.Parser.prototype.yyn258 = function (attributes) {
    this.yyval = this.Node_Expr_ClosureUse(this.yyastk[this.stackPos - (2 - 2)].substring(1), this.yyastk[this.stackPos - (2 - 1)], attributes);
};

PHP.Parser.prototype.yyn259 = function (attributes) {
    this.yyval = this.Node_Expr_FuncCall(this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn260 = function (attributes) {
    this.yyval = this.Node_Expr_StaticCall(this.yyastk[this.stackPos - (6 - 1)], this.yyastk[this.stackPos - (6 - 3)], this.yyastk[this.stackPos - (6 - 5)], attributes);
};

PHP.Parser.prototype.yyn261 = function (attributes) {
    this.yyval = this.Node_Expr_StaticCall(this.yyastk[this.stackPos - (8 - 1)], this.yyastk[this.stackPos - (8 - 4)], this.yyastk[this.stackPos - (8 - 7)], attributes);
};

PHP.Parser.prototype.yyn262 = function (attributes) {

    if (this.yyastk[this.stackPos - (4 - 1)].type === "Node_Expr_StaticPropertyFetch") {
        this.yyval = this.Node_Expr_StaticCall(this.yyastk[this.stackPos - (4 - 1)].Class, this.Node_Expr_Variable(this.yyastk[this.stackPos - (4 - 1)].name, attributes), this.yyastk[this.stackPos - (4 - 3)], attributes);
    } else if (this.yyastk[this.stackPos - (4 - 1)].type === "Node_Expr_ArrayDimFetch") {
        var tmp = this.yyastk[this.stackPos - (4 - 1)];
        while (tmp.variable.type === "Node_Expr_ArrayDimFetch") {
            tmp = tmp.variable;
        }

        this.yyval = this.Node_Expr_StaticCall(tmp.variable.Class, this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 3)], attributes);
        tmp.variable = this.Node_Expr_Variable(tmp.variable.name, attributes);
    } else {
        throw new Exception;
    }

};

PHP.Parser.prototype.yyn263 = function (attributes) {
    this.yyval = this.Node_Expr_FuncCall(this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn264 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayDimFetch(this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn265 = function (attributes) {
    this.yyval = this.Node_Name('static', attributes);
};

PHP.Parser.prototype.yyn266 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn267 = function (attributes) {
    this.yyval = this.Node_Name(this.yyastk[this.stackPos - (1 - 1)], attributes);
};

PHP.Parser.prototype.yyn268 = function (attributes) {
    this.yyval = this.Node_Name_FullyQualified(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn269 = function (attributes) {
    this.yyval = this.Node_Name_Relative(this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn270 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn271 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn272 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn273 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn274 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn275 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn276 = function () {
    this.yyval = this.yyastk[this.stackPos];
};

PHP.Parser.prototype.yyn277 = function (attributes) {
    this.yyval = this.Node_Expr_PropertyFetch(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn278 = function (attributes) {
    this.yyval = this.Node_Expr_PropertyFetch(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn279 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayDimFetch(this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn280 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayDimFetch(this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn281 = function (attributes) {
    this.yyval = null;
};

PHP.Parser.prototype.yyn282 = function (attributes) {
    this.yyval = null;
};

PHP.Parser.prototype.yyn283 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (3 - 2)];
};

PHP.Parser.prototype.yyn284 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn285 = function (attributes) {
    this.yyval = [this.Scalar_String_parseEscapeSequences(this.yyastk[this.stackPos - (1 - 1)], '`')];
};

PHP.Parser.prototype.yyn286 = function (attributes) {
    ;
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn287 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn288 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (3 - 2)];
};

PHP.Parser.prototype.yyn289 = function (attributes) {
    this.yyval = this.Node_Scalar_LNumber(this.Scalar_LNumber_parse(this.yyastk[this.stackPos - (1 - 1)]), attributes);
};

PHP.Parser.prototype.yyn290 = function (attributes) {
    this.yyval = this.Node_Scalar_DNumber(this.Scalar_DNumber_parse(this.yyastk[this.stackPos - (1 - 1)]), attributes);
};

PHP.Parser.prototype.yyn291 = function (attributes) {
    this.yyval = this.Scalar_String_create(this.yyastk[this.stackPos - (1 - 1)], attributes);
};

PHP.Parser.prototype.yyn292 = function (attributes) {
    this.yyval = {
        type: "Node_Scalar_LineConst",
        attributes: attributes
    };
};

PHP.Parser.prototype.yyn293 = function (attributes) {
    this.yyval = {
        type: "Node_Scalar_FileConst",
        attributes: attributes
    };
};

PHP.Parser.prototype.yyn294 = function (attributes) {
    this.yyval = {
        type: "Node_Scalar_DirConst",
        attributes: attributes
    };
};

PHP.Parser.prototype.yyn295 = function (attributes) {
    this.yyval = {
        type: "Node_Scalar_ClassConst",
        attributes: attributes
    };
};

PHP.Parser.prototype.yyn296 = function (attributes) {
    this.yyval = {
        type: "Node_Scalar_TraitConst",
        attributes: attributes
    };
};

PHP.Parser.prototype.yyn297 = function (attributes) {
    this.yyval = {
        type: "Node_Scalar_MethodConst",
        attributes: attributes
    };
};

PHP.Parser.prototype.yyn298 = function (attributes) {
    this.yyval = {
        type: "Node_Scalar_FuncConst",
        attributes: attributes
    };
};

PHP.Parser.prototype.yyn299 = function (attributes) {
    this.yyval = {
        type: "Node_Scalar_NSConst",
        attributes: attributes
    };
};

PHP.Parser.prototype.yyn300 = function (attributes) {
    this.yyval = this.Node_Scalar_String(this.Scalar_String_parseDocString(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 2)]), attributes);
};

PHP.Parser.prototype.yyn301 = function (attributes) {
    this.yyval = this.Node_Scalar_String('', attributes);
};

PHP.Parser.prototype.yyn302 = function (attributes) {
    this.yyval = this.Node_Expr_ConstFetch(this.yyastk[this.stackPos - (1 - 1)], attributes);
};

PHP.Parser.prototype.yyn303 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn304 = function (attributes) {
    this.yyval = this.Node_Expr_ClassConstFetch(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn305 = function (attributes) {
    this.yyval = this.Node_Expr_UnaryPlus(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn306 = function (attributes) {
    this.yyval = this.Node_Expr_UnaryMinus(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn307 = function (attributes) {
    this.yyval = this.Node_Expr_Array(this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn308 = function (attributes) {
    this.yyval = this.Node_Expr_Array(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn309 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn310 = function (attributes) {
    this.yyval = this.Node_Expr_ClassConstFetch(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn311 = function (attributes) {
    ;
    this.yyval = this.Node_Scalar_Encapsed(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn312 = function (attributes) {
    ;
    this.yyval = this.Node_Scalar_Encapsed(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn313 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn314 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (2 - 1)];
};

PHP.Parser.prototype.yyn315 = function () {
    this.yyval = this.yyastk[this.stackPos];
};

PHP.Parser.prototype.yyn316 = function () {
    this.yyval = this.yyastk[this.stackPos];
};

PHP.Parser.prototype.yyn317 = function (attributes) {
    this.yyastk[this.stackPos - (3 - 1)].push(this.yyastk[this.stackPos - (3 - 3)]);
    this.yyval = this.yyastk[this.stackPos - (3 - 1)];
};

PHP.Parser.prototype.yyn318 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn319 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayItem(this.yyastk[this.stackPos - (3 - 3)], this.yyastk[this.stackPos - (3 - 1)], false, attributes);
};

PHP.Parser.prototype.yyn320 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayItem(this.yyastk[this.stackPos - (1 - 1)], null, false, attributes);
};

PHP.Parser.prototype.yyn321 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn322 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn323 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn324 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn325 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayDimFetch(this.yyastk[this.stackPos - (6 - 2)], this.yyastk[this.stackPos - (6 - 5)], attributes);
};

PHP.Parser.prototype.yyn326 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayDimFetch(this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn327 = function (attributes) {
    this.yyval = this.Node_Expr_PropertyFetch(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn328 = function (attributes) {
    this.yyval = this.Node_Expr_MethodCall(this.yyastk[this.stackPos - (6 - 1)], this.yyastk[this.stackPos - (6 - 3)], this.yyastk[this.stackPos - (6 - 5)], attributes);
};

PHP.Parser.prototype.yyn329 = function (attributes) {
    this.yyval = this.Node_Expr_FuncCall(this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn330 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayDimFetch(this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn331 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayDimFetch(this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn332 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn333 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (3 - 2)];
};

PHP.Parser.prototype.yyn334 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn335 = function (attributes) {
    this.yyval = this.Node_Expr_Variable(this.yyastk[this.stackPos - (2 - 2)], attributes);
};

PHP.Parser.prototype.yyn336 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn337 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn338 = function (attributes) {
    this.yyval = this.Node_Expr_StaticPropertyFetch(this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 4)], attributes);
};

PHP.Parser.prototype.yyn339 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn340 = function (attributes) {
    this.yyval = this.Node_Expr_StaticPropertyFetch(this.yyastk[this.stackPos - (3 - 1)], this.yyastk[this.stackPos - (3 - 3)].substring(1), attributes);
};

PHP.Parser.prototype.yyn341 = function (attributes) {
    this.yyval = this.Node_Expr_StaticPropertyFetch(this.yyastk[this.stackPos - (6 - 1)], this.yyastk[this.stackPos - (6 - 5)], attributes);
};

PHP.Parser.prototype.yyn342 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayDimFetch(this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn343 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayDimFetch(this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn344 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayDimFetch(this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn345 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayDimFetch(this.yyastk[this.stackPos - (4 - 1)], this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn346 = function (attributes) {
    this.yyval = this.Node_Expr_Variable(this.yyastk[this.stackPos - (1 - 1)].substring(1), attributes);
};

PHP.Parser.prototype.yyn347 = function (attributes) {
    this.yyval = this.Node_Expr_Variable(this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn348 = function (attributes) {
    this.yyval = null;
};

PHP.Parser.prototype.yyn349 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn350 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn351 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (3 - 2)];
};

PHP.Parser.prototype.yyn352 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn353 = function (attributes) {
    this.yyastk[this.stackPos - (3 - 1)].push(this.yyastk[this.stackPos - (3 - 3)]);
    this.yyval = this.yyastk[this.stackPos - (3 - 1)];
};

PHP.Parser.prototype.yyn354 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn355 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (1 - 1)];
};

PHP.Parser.prototype.yyn356 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (4 - 3)];
};

PHP.Parser.prototype.yyn357 = function (attributes) {
    this.yyval = null;
};

PHP.Parser.prototype.yyn358 = function (attributes) {
    this.yyval = [];
};

PHP.Parser.prototype.yyn359 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (2 - 1)];
};

PHP.Parser.prototype.yyn360 = function (attributes) {
    this.yyastk[this.stackPos - (3 - 1)].push(this.yyastk[this.stackPos - (3 - 3)]);
    this.yyval = this.yyastk[this.stackPos - (3 - 1)];
};

PHP.Parser.prototype.yyn361 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn362 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayItem(this.yyastk[this.stackPos - (3 - 3)], this.yyastk[this.stackPos - (3 - 1)], false, attributes);
};

PHP.Parser.prototype.yyn363 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayItem(this.yyastk[this.stackPos - (1 - 1)], null, false, attributes);
};

PHP.Parser.prototype.yyn364 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayItem(this.yyastk[this.stackPos - (4 - 4)], this.yyastk[this.stackPos - (4 - 1)], true, attributes);
};

PHP.Parser.prototype.yyn365 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayItem(this.yyastk[this.stackPos - (2 - 2)], null, true, attributes);
};

PHP.Parser.prototype.yyn366 = function (attributes) {
    this.yyastk[this.stackPos - (2 - 1)].push(this.yyastk[this.stackPos - (2 - 2)]);
    this.yyval = this.yyastk[this.stackPos - (2 - 1)];
};

PHP.Parser.prototype.yyn367 = function (attributes) {
    this.yyastk[this.stackPos - (2 - 1)].push(this.yyastk[this.stackPos - (2 - 2)]);
    this.yyval = this.yyastk[this.stackPos - (2 - 1)];
};

PHP.Parser.prototype.yyn368 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (1 - 1)]];
};

PHP.Parser.prototype.yyn369 = function (attributes) {
    this.yyval = [this.yyastk[this.stackPos - (2 - 1)], this.yyastk[this.stackPos - (2 - 2)]];
};

PHP.Parser.prototype.yyn370 = function (attributes) {
    this.yyval = this.Node_Expr_Variable(this.yyastk[this.stackPos - (1 - 1)].substring(1), attributes);
};

PHP.Parser.prototype.yyn371 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayDimFetch(this.Node_Expr_Variable(this.yyastk[this.stackPos - (4 - 1)].substring(1), attributes), this.yyastk[this.stackPos - (4 - 3)], attributes);
};

PHP.Parser.prototype.yyn372 = function (attributes) {
    this.yyval = this.Node_Expr_PropertyFetch(this.Node_Expr_Variable(this.yyastk[this.stackPos - (3 - 1)].substring(1), attributes), this.yyastk[this.stackPos - (3 - 3)], attributes);
};

PHP.Parser.prototype.yyn373 = function (attributes) {
    this.yyval = this.Node_Expr_Variable(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn374 = function (attributes) {
    this.yyval = this.Node_Expr_Variable(this.yyastk[this.stackPos - (3 - 2)], attributes);
};

PHP.Parser.prototype.yyn375 = function (attributes) {
    this.yyval = this.Node_Expr_ArrayDimFetch(this.Node_Expr_Variable(this.yyastk[this.stackPos - (6 - 2)], attributes), this.yyastk[this.stackPos - (6 - 4)], attributes);
};

PHP.Parser.prototype.yyn376 = function (attributes) {
    this.yyval = this.yyastk[this.stackPos - (3 - 2)];
};

PHP.Parser.prototype.yyn377 = function (attributes) {
    this.yyval = this.Node_Scalar_String(this.yyastk[this.stackPos - (1 - 1)], attributes);
};

PHP.Parser.prototype.yyn378 = function (attributes) {
    this.yyval = this.Node_Scalar_String(this.yyastk[this.stackPos - (1 - 1)], attributes);
};

PHP.Parser.prototype.yyn379 = function (attributes) {
    this.yyval = this.Node_Expr_Variable(this.yyastk[this.stackPos - (1 - 1)].substring(1), attributes);
};


/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 20.7.2012 
 * @website http://hertzen.com
 */


PHP.Parser.prototype.Stmt_Namespace_postprocess = function (a) {
    return a;
};


PHP.Parser.prototype.Node_Stmt_Echo = function () {
    return {
        type: "Node_Stmt_Echo",
        exprs: arguments[0],
        attributes: arguments[1]
    };

};


PHP.Parser.prototype.Node_Stmt_If = function () {
    return {
        type: "Node_Stmt_If",
        cond: arguments[0],
        stmts: arguments[1].stmts,
        elseifs: arguments[1].elseifs,
        Else: arguments[1].Else || null,
        attributes: arguments[2]
    };

};


PHP.Parser.prototype.Node_Stmt_For = function () {

    return {
        type: "Node_Stmt_For",
        init: arguments[0].init,
        cond: arguments[0].cond,
        loop: arguments[0].loop,
        stmts: arguments[0].stmts,
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Stmt_Function = function () {
    return {
        type: "Node_Stmt_Function",
        name: arguments[0],
        byRef: arguments[1].byRef,
        params: arguments[1].params,
        stmts: arguments[1].stmts,
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Stmt_Class_verifyModifier = function () {


};

PHP.Parser.prototype.Node_Stmt_Namespace = function () {
    return {
        type: "Node_Stmt_Namespace",
        name: arguments[0],
        attributes: arguments[2]
    };
};

PHP.Parser.prototype.Node_Stmt_Use = function () {
    return {
        type: "Node_Stmt_Use",
        name: arguments[0],
        attributes: arguments[2]
    };
};

PHP.Parser.prototype.Node_Stmt_UseUse = function () {
    return {
        type: "Node_Stmt_UseUse",
        name: arguments[0],
        as: arguments[1],
        attributes: arguments[2]
    };
};

PHP.Parser.prototype.Node_Stmt_TraitUseAdaptation_Precedence = function () {
    return {
        type: "Node_Stmt_TraitUseAdaptation_Precedence",
        name: arguments[0],
        attributes: arguments[2]
    };
};

PHP.Parser.prototype.Node_Stmt_TraitUseAdaptation_Alias = function () {
    return {
        type: "Node_Stmt_TraitUseAdaptation_Alias",
        name: arguments[0],
        attributes: arguments[2]
    };
};

PHP.Parser.prototype.Node_Stmt_Trait = function () {
    return {
        type: "Node_Stmt_Trait",
        name: arguments[0],
        attributes: arguments[2]
    };
};

PHP.Parser.prototype.Node_Stmt_TraitUse = function () {
    return {
        type: "Node_Stmt_TraitUse",
        name: arguments[0],
        attributes: arguments[2]
    };
};

PHP.Parser.prototype.Node_Stmt_Class = function () {
    return {
        type: "Node_Stmt_Class",
        name: arguments[0],
        Type: arguments[1].type,
        Extends: arguments[1].Extends,
        Implements: arguments[1].Implements,
        stmts: arguments[1].stmts,
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Stmt_ClassMethod = function () {
    return {
        type: "Node_Stmt_ClassMethod",
        name: arguments[0],
        Type: arguments[1].type,
        byRef: arguments[1].byRef,
        params: arguments[1].params,
        stmts: arguments[1].stmts,
        attributes: arguments[2]
    };

};


PHP.Parser.prototype.Node_Stmt_ClassConst = function () {
    return {
        type: "Node_Stmt_ClassConst",
        consts: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Stmt_Interface = function () {
    return {
        type: "Node_Stmt_Interface",
        name: arguments[0],
        Extends: arguments[1].Extends,
        stmts: arguments[1].stmts,
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Stmt_Throw = function () {
    return {
        type: "Node_Stmt_Throw",
        expr: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Stmt_Catch = function () {
    return {
        type: "Node_Stmt_Catch",
        Type: arguments[0],
        variable: arguments[1],
        stmts: arguments[2],
        attributes: arguments[3]
    };

};


PHP.Parser.prototype.Node_Stmt_TryCatch = function () {
    return {
        type: "Node_Stmt_TryCatch",
        stmts: arguments[0],
        catches: arguments[1],
        attributes: arguments[2]
    };

};


PHP.Parser.prototype.Node_Stmt_Foreach = function () {
    return {
        type: "Node_Stmt_Foreach",
        expr: arguments[0],
        valueVar: arguments[1],
        keyVar: arguments[2].keyVar,
        byRef: arguments[2].byRef,
        stmts: arguments[2].stmts,
        attributes: arguments[3]
    };

};

PHP.Parser.prototype.Node_Stmt_While = function () {
    return {
        type: "Node_Stmt_While",
        cond: arguments[0],
        stmts: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Stmt_Do = function () {
    return {
        type: "Node_Stmt_Do",
        cond: arguments[0],
        stmts: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Stmt_Break = function () {
    return {
        type: "Node_Stmt_Break",
        num: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Stmt_Continue = function () {
    return {
        type: "Node_Stmt_Continue",
        num: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Stmt_Return = function () {
    return {
        type: "Node_Stmt_Return",
        expr: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Stmt_Case = function () {
    return {
        type: "Node_Stmt_Case",
        cond: arguments[0],
        stmts: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Stmt_Switch = function () {
    return {
        type: "Node_Stmt_Switch",
        cond: arguments[0],
        cases: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Stmt_Else = function () {

    return {
        type: "Node_Stmt_Else",
        stmts: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Stmt_ElseIf = function () {
    return {
        type: "Node_Stmt_ElseIf",
        cond: arguments[0],
        stmts: arguments[1],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Stmt_InlineHTML = function () {
    return {
        type: "Node_Stmt_InlineHTML",
        value: arguments[0],
        attributes: arguments[1]
    };

};


PHP.Parser.prototype.Node_Stmt_StaticVar = function () {
    return {
        type: "Node_Stmt_StaticVar",
        name: arguments[0],
        def: arguments[1],
        attributes: arguments[2]
    };

};


PHP.Parser.prototype.Node_Stmt_Static = function () {
    return {
        type: "Node_Stmt_Static",
        vars: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Stmt_Global = function () {
    return {
        type: "Node_Stmt_Global",
        vars: arguments[0],
        attributes: arguments[1]
    };

};


PHP.Parser.prototype.Node_Stmt_PropertyProperty = function () {
    return {
        type: "Node_Stmt_PropertyProperty",
        name: arguments[0],
        def: arguments[1],
        attributes: arguments[2]
    };

};


PHP.Parser.prototype.Node_Stmt_Property = function () {
    return {
        type: "Node_Stmt_Property",
        Type: arguments[0],
        props: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Stmt_Unset = function () {
    return {
        type: "Node_Stmt_Unset",
        variables: arguments[0],
        attributes: arguments[1]
    };

};

/*
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 20.7.2012
 * @website http://hertzen.com
 */


PHP.Parser.prototype.Node_Expr_Variable = function (a) {
    return {
        type: "Node_Expr_Variable",
        name: arguments[0],
        attributes: arguments[1]
    };
};

PHP.Parser.prototype.Node_Expr_FuncCall = function () {

    return {
        type: "Node_Expr_FuncCall",
        func: arguments[0],
        args: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_MethodCall = function () {

    return {
        type: "Node_Expr_MethodCall",
        variable: arguments[0],
        name: arguments[1],
        args: arguments[2],
        attributes: arguments[3]
    };

};

PHP.Parser.prototype.Node_Expr_StaticCall = function () {

    return {
        type: "Node_Expr_StaticCall",
        Class: arguments[0],
        func: arguments[1],
        args: arguments[2],
        attributes: arguments[3]
    };

};


PHP.Parser.prototype.Node_Expr_Ternary = function () {

    return {
        type: "Node_Expr_Ternary",
        cond: arguments[0],
        If: arguments[1],
        Else: arguments[2],
        attributes: arguments[3]
    };

};

PHP.Parser.prototype.Node_Expr_AssignList = function () {

    return {
        type: "Node_Expr_AssignList",
        assignList: arguments[0],
        expr: arguments[1],
        attributes: arguments[2]
    };

};


PHP.Parser.prototype.Node_Expr_Assign = function () {

    return {
        type: "Node_Expr_Assign",
        variable: arguments[0],
        expr: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_AssignConcat = function () {

    return {
        type: "Node_Expr_AssignConcat",
        variable: arguments[0],
        expr: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_AssignMinus = function () {

    return {
        type: "Node_Expr_AssignMinus",
        variable: arguments[0],
        expr: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_AssignPlus = function () {

    return {
        type: "Node_Expr_AssignPlus",
        variable: arguments[0],
        expr: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_AssignDiv = function () {

    return {
        type: "Node_Expr_AssignDiv",
        variable: arguments[0],
        expr: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_AssignRef = function () {

    return {
        type: "Node_Expr_AssignRef",
        variable: arguments[0],
        refVar: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_AssignMul = function () {

    return {
        type: "Node_Expr_AssignMul",
        variable: arguments[0],
        expr: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_AssignMod = function () {

    return {
        type: "Node_Expr_AssignMod",
        variable: arguments[0],
        expr: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_Plus = function () {

    return {
        type: "Node_Expr_Plus",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_Minus = function () {

    return {
        type: "Node_Expr_Minus",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};


PHP.Parser.prototype.Node_Expr_Mul = function () {

    return {
        type: "Node_Expr_Mul",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};


PHP.Parser.prototype.Node_Expr_Div = function () {

    return {
        type: "Node_Expr_Div",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};


PHP.Parser.prototype.Node_Expr_Mod = function () {

    return {
        type: "Node_Expr_Mod",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_Greater = function () {

    return {
        type: "Node_Expr_Greater",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_Equal = function () {

    return {
        type: "Node_Expr_Equal",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_NotEqual = function () {

    return {
        type: "Node_Expr_NotEqual",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};


PHP.Parser.prototype.Node_Expr_Identical = function () {

    return {
        type: "Node_Expr_Identical",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};


PHP.Parser.prototype.Node_Expr_NotIdentical = function () {

    return {
        type: "Node_Expr_NotIdentical",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_GreaterOrEqual = function () {

    return {
        type: "Node_Expr_GreaterOrEqual",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_SmallerOrEqual = function () {

    return {
        type: "Node_Expr_SmallerOrEqual",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_Concat = function () {

    return {
        type: "Node_Expr_Concat",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_Smaller = function () {

    return {
        type: "Node_Expr_Smaller",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_PostInc = function () {

    return {
        type: "Node_Expr_PostInc",
        variable: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Expr_PostDec = function () {

    return {
        type: "Node_Expr_PostDec",
        variable: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Expr_PreInc = function () {

    return {
        type: "Node_Expr_PreInc",
        variable: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Expr_PreDec = function () {

    return {
        type: "Node_Expr_PreDec",
        variable: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Expr_Include = function () {
    return {
        expr: arguments[0],
        type: arguments[1],
        attributes: arguments[2]
    };
};

PHP.Parser.prototype.Node_Expr_ArrayDimFetch = function () {

    return {
        type: "Node_Expr_ArrayDimFetch",
        variable: arguments[0],
        dim: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_StaticPropertyFetch = function () {

    return {
        type: "Node_Expr_StaticPropertyFetch",
        Class: arguments[0],
        name: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_ClassConstFetch = function () {

    return {
        type: "Node_Expr_ClassConstFetch",
        Class: arguments[0],
        name: arguments[1],
        attributes: arguments[2]
    };

};


PHP.Parser.prototype.Node_Expr_StaticPropertyFetch = function () {

    return {
        type: "Node_Expr_StaticPropertyFetch",
        Class: arguments[0],
        name: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_ConstFetch = function () {

    return {
        type: "Node_Expr_ConstFetch",
        name: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Expr_ArrayItem = function () {

    return {
        type: "Node_Expr_ArrayItem",
        value: arguments[0],
        key: arguments[1],
        byRef: arguments[2],
        attributes: arguments[3]
    };

};

PHP.Parser.prototype.Node_Expr_Array = function () {

    return {
        type: "Node_Expr_Array",
        items: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Expr_PropertyFetch = function () {

    return {
        type: "Node_Expr_PropertyFetch",
        variable: arguments[0],
        name: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_New = function () {

    return {
        type: "Node_Expr_New",
        Class: arguments[0],
        args: arguments[1],
        attributes: arguments[2]
    };

};


PHP.Parser.prototype.Node_Expr_Print = function () {
    return {
        type: "Node_Expr_Print",
        expr: arguments[0],
        attributes: arguments[1]
    };

};


PHP.Parser.prototype.Node_Expr_Exit = function () {
    return {
        type: "Node_Expr_Exit",
        expr: arguments[0],
        attributes: arguments[1]
    };

};


PHP.Parser.prototype.Node_Expr_Cast_Bool = function () {
    return {
        type: "Node_Expr_Cast_Bool",
        expr: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Expr_Cast_Int = function () {
    return {
        type: "Node_Expr_Cast_Int",
        expr: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Expr_Cast_String = function () {
    return {
        type: "Node_Expr_Cast_String",
        expr: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Expr_Cast_Double = function () {
    return {
        type: "Node_Expr_Cast_Double",
        expr: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Expr_Cast_Array = function () {
    return {
        type: "Node_Expr_Cast_Array",
        expr: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Expr_Cast_Object = function () {
    return {
        type: "Node_Expr_Cast_Object",
        expr: arguments[0],
        attributes: arguments[1]
    };

};


PHP.Parser.prototype.Node_Expr_ErrorSuppress = function () {
    return {
        type: "Node_Expr_ErrorSuppress",
        expr: arguments[0],
        attributes: arguments[1]
    };

};


PHP.Parser.prototype.Node_Expr_Isset = function () {
    return {
        type: "Node_Expr_Isset",
        variables: arguments[0],
        attributes: arguments[1]
    };

};




PHP.Parser.prototype.Node_Expr_UnaryMinus = function () {
    return {
        type: "Node_Expr_UnaryMinus",
        expr: arguments[0],
        attributes: arguments[1]
    };

};


PHP.Parser.prototype.Node_Expr_UnaryPlus = function () {
    return {
        type: "Node_Expr_UnaryPlus",
        expr: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Expr_Empty = function () {
    return {
        type: "Node_Expr_Empty",
        variable: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Expr_BooleanOr = function () {
    return {
        type: "Node_Expr_BooleanOr",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_LogicalOr = function () {
    return {
        type: "Node_Expr_LogicalOr",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_LogicalAnd = function () {
    return {
        type: "Node_Expr_LogicalAnd",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};


PHP.Parser.prototype.Node_Expr_LogicalXor = function () {
    return {
        type: "Node_Expr_LogicalXor",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_BitwiseAnd = function () {
    return {
        type: "Node_Expr_BitwiseAnd",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_BitwiseOr = function () {
    return {
        type: "Node_Expr_BitwiseOr",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_BitwiseXor = function () {
    return {
        type: "Node_Expr_BitwiseXor",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_BitwiseNot = function () {
    return {
        type: "Node_Expr_BitwiseNot",
        expr: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Expr_BooleanNot = function () {
    return {
        type: "Node_Expr_BooleanNot",
        expr: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Expr_BooleanAnd = function () {
    return {
        type: "Node_Expr_BooleanAnd",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_Instanceof = function () {

    return {
        type: "Node_Expr_Instanceof",
        left: arguments[0],
        right: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Expr_Clone = function () {

    return {
        type: "Node_Expr_Clone",
        expr: arguments[0],
        attributes: arguments[1]
    };

};

/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 20.7.2012 
 * @website http://hertzen.com
 */



PHP.Parser.prototype.Scalar_LNumber_parse = function (a) {

    return a;
};

PHP.Parser.prototype.Scalar_DNumber_parse = function (a) {

    return a;
};

PHP.Parser.prototype.Scalar_String_parseDocString = function () {

    return '"' + arguments[1].replace(/([^"\\]*(?:\\.[^"\\]*)*)"/g, '$1\\"') + '"';
};


PHP.Parser.prototype.Node_Scalar_String = function () {

    return {
        type: "Node_Scalar_String",
        value: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Scalar_String_create = function () {
    return {
        type: "Node_Scalar_String",
        value: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Scalar_LNumber = function () {

    return {
        type: "Node_Scalar_LNumber",
        value: arguments[0],
        attributes: arguments[1]
    };

};


PHP.Parser.prototype.Node_Scalar_DNumber = function () {

    return {
        type: "Node_Scalar_DNumber",
        value: arguments[0],
        attributes: arguments[1]
    };

};


PHP.Parser.prototype.Node_Scalar_Encapsed = function () {

    return {
        type: "Node_Scalar_Encapsed",
        parts: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Name = function () {

    return {
        type: "Node_Name",
        parts: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Name_FullyQualified = function () {

    return {
        type: "Node_Name_FullyQualified",
        parts: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Name_Relative = function () {

    return {
        type: "Node_Name_Relative",
        parts: arguments[0],
        attributes: arguments[1]
    };

};

PHP.Parser.prototype.Node_Param = function () {

    return {
        type: "Node_Param",
        name: arguments[0],
        def: arguments[1],
        Type: arguments[2],
        byRef: arguments[3],
        attributes: arguments[4]
    };

};

PHP.Parser.prototype.Node_Arg = function () {

    return {
        type: "Node_Name",
        value: arguments[0],
        byRef: arguments[1],
        attributes: arguments[2]
    };

};

PHP.Parser.prototype.Node_Const = function () {

    return {
        type: "Node_Const",
        name: arguments[0],
        value: arguments[1],
        attributes: arguments[2]
    };

};

/* 
 * based on node-iniparser Copyright (c) 2009-2010 Jordy van Gelder <jordyvangelder@gmail.com>
 * The MIT License
 */


PHP.ini = function (contents) {

    var regex = {
            section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
            param: /^\s*([\w\.\-\_]+)\s*=\s*"?(.*?)"?\s*$/,
            comment: /^\s*;.*$/
        },
        section = null,
        value = {};
    contents.toString().split(/\r\n|\r|\n/).forEach(function (line) {
        var match;

        if (regex.comment.test(line)) {
            return;

        } else if (regex.param.test(line)) {

            match = line.match(regex.param);

            if (section) {
                value[section][match[1]] = match[2];
            } else {
                value[match[1]] = match[2];
            }

        } else if (regex.section.test(line)) {

            match = line.match(regex.section);
            value[match[1]] = {};
            section = match[1];

        } else if (line.length === 0 && section) {
            section = null;
        }

    });

    return value;

};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 17.7.2012 
 * @website http://hertzen.com
 */


PHP.RAWPost = function (content) {

    var lines = content.split(/\r\n|\r|\n/),
        CONTENT_TYPE = "Content-Type:",
        CONTENT_DISPOSITION = "Content-Disposition:",
        BOUNDARY = "boundary=",
        item,
        items = [],
        startCapture,
        itemValue,
        boundary,
        storedFiles = [],
        emptyFiles = [],
        totalFiles = 0,
        errors = [],
        post;


    function is(part, item) {
        return (part !== undefined && part.substring(0, item.length) === item);
    }

    lines.forEach(function (line) {


        var parts = line.split(";")
        if (boundary === line.replace(/-/g, "").trim()) {
            if (item !== undefined) {
                item.value = itemValue;
                items.push(item);
            }
            startCapture = false;
            itemValue = "";
            item = {};
        } else if (is(parts[0], CONTENT_TYPE)) {

            if (item !== undefined) {
                item.contentType = parts[0].substring(CONTENT_TYPE.length).trim();
            }



            parts[1] = (parts[1] !== undefined) ? parts[1].trim() : undefined;


            if (parts[0].substring(CONTENT_TYPE.length).trim() === "multipart/form-data") {
                if (is(parts[1], BOUNDARY)) {


                    var part = parts[1].split(",");
                    part = part[0];

                    boundary = part.substring(BOUNDARY.length).replace(/[-]/g, "").trim();

                    // starts OR finishes with quotes
                    if (boundary.substring(0, 1) === '"' || boundary.substr(-1, 1) === '"') {
                        // starts AND finishes with quotes
                        if (boundary.substring(0, 1) === '"' && boundary.substr(-1, 1) === '"') {
                            boundary = boundary.substring(1, boundary.length - 1);
                        } else {
                            errors.push(["Invalid boundary in multipart/form-data POST data", PHP.Constants.E_WARNING, true]);
                        }
                    }

                } else {
                    errors.push(["Missing boundary in multipart/form-data POST data", PHP.Constants.E_WARNING, true]);
                }
            }
        } else if (is(parts[0], CONTENT_DISPOSITION)) {
            if (item !== undefined) {
                item.contentDisposition = parts[0].substring(CONTENT_DISPOSITION.length).trim();
                parts.shift();
                parts.forEach(function (part) {
                    var vals = part.split("=");

                    if (vals.length === 2) {
                        var val = vals[1].trim();
                        val = val.replace(/\\\\/g, "\\");
                        if (/^('|").*('|")$/.test(val)) {
                            var quote = val.substring(0, 1);
                            val = val.substring(1, val.length - 1);
                            val = val.replace(new RegExp("\\\\" + quote, "g"), quote);

                        }

                        item[vals[0].trim()] = val;
                    }
                });
            }

            if (parts.length === 0 && item !== undefined) {
                item.garbled = true;
            }

        } else if (startCapture) {
            if (line.length === 0 && itemValue !== undefined && itemValue.length > 0) {
                line = "\n";
            }
            itemValue += line;
        } else {
            startCapture = true;
        }




    });

    if (item !== undefined && Object.keys(item).length > 0) {
        item.value = itemValue;
        item.contentType = "";
        items.push(item);
    }




    return {
        Post: function () {
            var arr = {};
            items.forEach(function (item) {
                if (item.filename === undefined) {

                    if (item.garbled === true) {
                        errors.push(["File Upload Mime headers garbled", PHP.Constants.E_WARNING, true]);
                        return;
                    }

                    arr[item.name] = item.value;
                }
            });
            post = arr;
            return arr;
        },
        Files: function (max_filesize, max_files, path) {
            var arr = {};
            items.forEach(function (item, index) {


                if (item.filename !== undefined) {




                    if (!/^[a-z0-9]+\[.*[a-z]+.*\]/i.test(item.name)) {

                        var error = 0;
                        if (item.filename.length === 0) {
                            error = PHP.Constants.UPLOAD_ERR_NO_FILE;

                        } else if (post.MAX_FILE_SIZE !== undefined && post.MAX_FILE_SIZE < item.value.length) {
                            error = PHP.Constants.UPLOAD_ERR_FORM_SIZE;

                        } else if (item.value.length > max_filesize) {
                            error = PHP.Constants.UPLOAD_ERR_INI_SIZE;

                        } else if (item.contentType.length === 0) {
                            error = PHP.Constants.UPLOAD_ERR_PARTIAL;

                        }


                        item.filename = item.filename.substring(item.filename.lastIndexOf("/") + 1);
                        item.filename = item.filename.substring(item.filename.lastIndexOf("\\") + 1);


                        if (/^[a-z0-9]+\[\d*\]/i.test(item.name)) {

                            if (!/^[a-z0-9]+\[\d*\]$/i.test(item.name)) {
                                // malicious input
                                return;
                            }

                            var name = item.name.substring(0, item.name.indexOf("["));
                            //replace(/\[\]/g,"");

                            if (arr[name] === undefined) {
                                arr[name] = {
                                    name: [],
                                    type: [],
                                    tmp_name: [],
                                    error: [],
                                    size: []
                                }
                            }

                            arr[name].name.push(item.filename);
                            arr[name].type.push((error) ? "" : item.contentType);
                            arr[name].tmp_name.push((error) ? "" : path + item.filename);
                            arr[name].error.push(error);
                            arr[name].size.push((error) ? 0 : item.value.length);



                        } else {
                            arr[(item.name === undefined) ? index : item.name] = {
                                name: item.filename,
                                type: (error) ? "" : item.contentType,
                                tmp_name: (error) ? "" : path + item.filename,
                                error: error,
                                size: (error) ? 0 : item.value.length
                            }


                        }

                        // store file
                        if (!error) {
                            if (item.value.length === 0) {
                                emptyFiles.push({
                                    real: (item.name === undefined) ? index : item.name,
                                    name: path + item.filename,
                                    content: item.value
                                });
                            } else {
                                storedFiles.push({
                                    name: path + item.filename,
                                    content: item.value
                                });
                                totalFiles++;
                            }


                        }
                    }
                }
            });

            while (totalFiles < max_files && emptyFiles.length > 0) {
                var item = emptyFiles.shift();
                storedFiles.push(item);
                totalFiles++;
            }

            // no room
            emptyFiles.forEach(function (file) {

                var item = arr[file.real];
                item.error = 5;
                item.tmp_name = "";
                item.type = "";
                errors.push(["No file uploaded in Unknown on line 0", PHP.Constants.E_NOTICE]);
                errors.push(["No file uploaded in Unknown on line 0", PHP.Constants.E_NOTICE]);
                errors.push(["Uploaded file size 0 - file [" + file.real + "=" + item.name + "] not saved in Unknown on line 0", PHP.Constants.E_WARNING]);

            });

            return arr;
        },
        WriteFiles: function (func) {
            storedFiles.forEach(function (item) {

                func(item.name, item.content);
            });
        },
        Error: function (func, file) {
            errors.forEach(function (err) {
                func(err[0] + ((err[2] === true) ? " in " + file : ""), err[1]);
            });

        },
        Raw: function () {
            lines = content.split(/\r\n|\r|\n/);
            lines.shift();
            lines.pop();
            return lines.join("\n");
        }
    };



};



PHP.VM = function (src, opts) {

    var $ = PHP.VM.VariableHandler(this);

    var $$ = function (arg) {

            var item = new PHP.VM.Variable(arg);
            item[PHP.Compiler.prototype.NAV] = true;

            return item;
        },
        COMPILER = PHP.Compiler.prototype,
        ENV = this;

    this.ENV = ENV;

    PHP.VM.Variable.prototype.ENV = ENV;

    ENV[PHP.Compiler.prototype.FILESYSTEM] = (opts.filesystem === undefined) ? {} : opts.filesystem;

    // bind global variablehandler to ENV
    ENV[PHP.Compiler.prototype.GLOBAL] = $;

    ENV[PHP.Compiler.prototype.CONSTANTS] = PHP.VM.Constants(PHP.Constants, ENV);

    ENV.$ini = Object.create(opts.ini);

    ENV.$locale = {
        decimal_point: ".",
        thousands_sep: ","
    };

    ENV.$Included = (function () {

        var files = [];

        return {
            Include: function (file) {
                files.push(file.toLowerCase());
            },
            Included: function (file) {
                return (files.indexOf(file.toLowerCase()) !== -1)
            }
        }

    })();

    ENV.$Class = (function (declaredClasses) {
        var classRegistry = {},
            COMPILER = PHP.Compiler.prototype,
            VARIABLE = PHP.VM.Variable.prototype,
            magicConstants = {},
            initiatedClasses = [],
            undefinedConstants = {},
            declaredClasses = [],
            autoloadedClasses = [],
            classHandler = new PHP.VM.Class(ENV, classRegistry, magicConstants, initiatedClasses, undefinedConstants, declaredClasses);

        ENV[COMPILER.MAGIC_CONSTANTS] = function (constantName) {
            return new PHP.VM.Variable(magicConstants[constantName]);
        };

        var methods = {
            Shutdown: function () {

                initiatedClasses.forEach(function (classObj) {
                    classObj[COMPILER.CLASS_DESTRUCT](ENV, true);
                });

            },
            __autoload: function (name) {

                if (typeof ENV.__autoload === "function" && autoloadedClasses.indexOf(name.toLowerCase()) === -1) {
                    autoloadedClasses.push(name.toLowerCase())
                    ENV.__autoload(new PHP.VM.Variable(name));
                }

                return methods.Exists(name);
            },
            Inherits: function (obj, name) {
                do {
                    if (obj[COMPILER.CLASS_NAME] === name) {
                        return true;
                    }

                    obj = Object.getPrototypeOf(obj);
                }

                while (obj !== undefined && obj instanceof PHP.VM.ClassPrototype);
                return false;
            },
            INew: function (name, exts, func) {
                return classHandler(name, PHP.VM.Class.INTERFACE, exts, func);
            },
            DeclaredClasses: function () {
                return declaredClasses;
            },
            New: function () {
                return classHandler.apply(null, arguments);
            },
            Exists: function (name) {
                return (classRegistry[name.toLowerCase()] !== undefined);
            },
            ConstantGet: function (className, state, constantName) {

                if (!/^(self|parent)$/i.test(className) && classRegistry[className.toLowerCase()] === undefined) {
                    if (undefinedConstants[className + "::" + constantName] === undefined) {
                        var variable = new PHP.VM.Variable();
                        variable[VARIABLE.CLASS_CONSTANT] = true;
                        variable[VARIABLE.REGISTER_GETTER] = function () {
                            if (classRegistry[className.toLowerCase()] === undefined) {
                                ENV[COMPILER.ERROR]("Class '" + className + "' not found", PHP.Constants.E_ERROR, true);
                            }
                        }
                        variable[VARIABLE.DEFINED] = className + "::$" + constantName;
                        undefinedConstants[className + "::" + constantName] = variable;

                    }

                    return undefinedConstants[className + "::" + constantName];

                } else if (/^(self|parent)$/i.test(className)) {

                    if (/^(self)$/i.test(className)) {

                        return ((typeof state === "function") ? state.prototype : state)[COMPILER.CLASS_CONSTANT_FETCH](state, constantName);

                    } else {
                        return Object.getPrototypeOf((typeof state === "function") ? state.prototype : state)[COMPILER.CLASS_CONSTANT_FETCH](state, constantName);
                    }


                } else {

                    return methods.Get(className, state)[COMPILER.CLASS_CONSTANT_FETCH](state, constantName);
                }

            },
            Get: function (className, state, isInterface) {

                if (!/^(self|parent)$/i.test(className)) {

                    if (classRegistry[className.toLowerCase()] === undefined && methods.__autoload(className) === false) {

                        ENV[COMPILER.ERROR](((isInterface === true) ? "Interface" : "Class") + " '" + className + "' not found", PHP.Constants.E_ERROR, true);
                    }

                    if (state !== undefined) {
                        return classRegistry[className.toLowerCase()].prototype;
                    } else {
                        return classRegistry[className.toLowerCase()];
                    }
                } else if (/^self$/i.test(className)) {
                    return state.prototype;
                    //      return Object.getPrototypeOf( state );
                } else if (/parent/i.test(className)) {
                    return Object.getPrototypeOf(state.prototype);
                    //   return Object.getPrototypeOf( Object.getPrototypeOf( state ) );
                } else {

                }



            }
        };

        return methods;
    })();

    ENV[PHP.Compiler.prototype.RESOURCES] = PHP.VM.ResourceManager(ENV);

    ENV.$Array = new PHP.VM.Array(ENV);
    var variables_order = this.$ini.variables_order;

    this.FUNCTION_REFS = {};
    $('php_errormsg').$ = new PHP.VM.Variable();

    ENV[PHP.Compiler.prototype.FILE_PATH] = PHP.Utils.Path(opts.SERVER.SCRIPT_FILENAME);

    this.OUTPUT_BUFFERS = [""];
    this.$obreset();
    this.$ErrorReset();
    this.$strict = "";
    this.INPUT_BUFFER = opts.RAW_POST;

    // todo add error reporting level parser

    if (isNaN(this.$ini.error_reporting - 0)) {
        var lvl = this.$ini.error_reporting;
        ["E_ERROR",
            "E_RECOVERABLE_ERROR",
            "E_WARNING",
            "E_PARSE",
            "E_NOTICE",
            "E_STRICT",
            "E_DEPRECATED",
            "E_CORE_ERROR",
            "E_CORE_WARNING",
            "E_COMPILE_ERROR",
            "E_COMPILE_WARNING",
            "E_USER_ERROR",
            "E_USER_WARNING",
            "E_USER_NOTICE",
            "E_USER_DEPRECATED",
            "E_ALL"
        ].forEach(function (err) {
            lvl = lvl.replace(err, PHP.Constants[err]);
        });
        this.$ini.error_reporting = eval(lvl);


    }
    this.error_reporting(new PHP.VM.Variable(this.$ini.error_reporting));




    $('$__FILE__').$ = opts.SERVER.SCRIPT_FILENAME;
    $('$__DIR__').$ = ENV[PHP.Compiler.prototype.FILE_PATH];

    var post_max_size;

    if ((post_max_size = PHP.Utils.Filesize(this.$ini.post_max_size)) > opts.RAW_POST.length || post_max_size == 0) {
        if (this.$ini.enable_post_data_reading != 0) {
            $('_POST').$ = PHP.VM.Array.fromObject.call(this, (variables_order.indexOf("P") !== -1) ? opts.POST : {}).$;
            $('HTTP_RAW_POST_DATA').$ = opts.RAW_POST;
        } else {
            $('_POST').$ = PHP.VM.Array.fromObject.call(this, {}).$;
        }
    } else {
        $('_POST').$ = PHP.VM.Array.fromObject.call(this, {}).$;
        if (this.$ini.always_populate_raw_post_data == 1) {
            ENV[PHP.Compiler.prototype.ERROR]("Unknown: POST Content-Length of " + opts.RAW_POST.length + " bytes exceeds the limit of " + post_max_size + " bytes in Unknown on line 0", PHP.Constants.E_WARNING);
            ENV[PHP.Compiler.prototype.ERROR]("Cannot modify header information - headers already sent in Unknown on line 0", PHP.Constants.E_WARNING);
        } else {
            ENV[PHP.Compiler.prototype.ERROR]("POST Content-Length of " + opts.RAW_POST.length + " bytes exceeds the limit of " + post_max_size + " bytes in Unknown on line 0", PHP.Constants.E_WARNING);
        }
    }

    $('_GET').$ = PHP.VM.Array.fromObject.call(this, (variables_order.indexOf("G") !== -1) ? opts.GET : {}).$;


    $('_SERVER').$ = PHP.VM.Array.fromObject.call(this, (variables_order.indexOf("S") !== -1) ? opts.SERVER : {}).$;
    $('_FILES').$ = PHP.VM.Array.fromObject.call(this, (variables_order.indexOf("P") !== -1 && this.$ini.enable_post_data_reading != 0 && this.$ini.file_uploads == 1) ? opts.FILES : {}).$;

    $('_ENV').$ = PHP.VM.Array.fromObject.call(this, (variables_order.indexOf("E") !== -1) ? {} : {}).$;


    var staticHandler = {},
        staticVars = {};

    PHP.Utils.StaticHandler(staticHandler, staticVars, $, $);

    this.$Static = staticHandler;

    Object.keys(PHP.VM.Class.Predefined).forEach(function (className) {
        PHP.VM.Class.Predefined[className](ENV, $$);
    });

    //$('GLOBALS').$ = new (ENV.$Class.Get("__Globals"))( this );

    var obj = {};

    obj[COMPILER.DIM_FETCH] = function (ctx, variable) {
        return $(variable[COMPILER.VARIABLE_VALUE]);
    };



    $('GLOBALS', obj);

    var shutdown = false;
    ENV[COMPILER.TIMER] = function () {
        if (Date.now() > this.start + (this.$ini.max_execution_time - 0) * 1000) {

            if (this.$ini.display_errors != 0) {
                this.$ob("\nFatal error: Maximum execution time of " + this.$ini.max_execution_time + " second exceeded in " + $('$__FILE__').$ + " on line 1\n");

            }
            if (shutdown === false) {
                shutdown = true;
                this.$obflush.call(ENV);
                this.$shutdown.call(ENV);
            }

            // we aint killing it always with a single throw?? todo examine why
            throw Error;
            throw Error;
            throw Error;
            throw Error;
        }
    }.bind(this);

    this.Run = function () {
        this.start = Date.now();

        if (false) {


            var exec = new Function("$$", "$", "ENV", "$Static", src);
            exec.call(this, $$, $, ENV, staticHandler);


        } else {
            try {


                var exec = new Function("$$", "$", "ENV", "$Static", src);
                exec.call(this, $$, $, ENV, staticHandler);
                if (shutdown === false) {
                    shutdown = true;
                    this.$obflush.call(ENV);
                    this.$shutdown.call(ENV);
                }

            } catch (e) {
                var C = PHP.Constants;
                if (e instanceof PHP.Halt) {
                    switch (e.level) {
                        case C.E_ERROR:
                            this.$ob("\nFatal error: " + e.msg + e.lineAppend + "\n");
                            break;
                        case C.E_RECOVERABLE_ERROR:
                            this.$ob("\nCatchable fatal error: " + e.msg + e.lineAppend + "\n");
                            break;
                    }
                }
            }
        }

        this.OUTPUT_BUFFER = this.$strict + this.OUTPUT_BUFFERS.join("");
    }.bind(this);


};

PHP.VM.prototype = new PHP.Modules();


/*
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 26.6.2012
 * @website http://hertzen.com
 */


PHP.VM.Class = function (ENV, classRegistry, magicConstants, initiatedClasses, undefinedConstants, declaredClasses) {

    var methodPrefix = PHP.VM.Class.METHOD,
        methodArgumentPrefix = "_$_",
        propertyPrefix = PHP.VM.Class.PROPERTY,
        methodTypePrefix = "$£",
        methodByRef = "__byRef",
        propertyTypePrefix = PHP.VM.Class.PROPERTY_TYPE,
        COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        __call = "__call",
        __set = "__set",
        __get = "__get",
        PRIVATE = "PRIVATE",
        PUBLIC = "PUBLIC",
        STATIC = "STATIC",
        ABSTRACT = "ABSTRACT",
        FINAL = "FINAL",
        INTERFACE = "INTERFACE",
        PROTECTED = "PROTECTED",
        __destruct = "__destruct",
        __construct = "__construct";


    // helper function for checking whether variable/method is of type
    function checkType(value, type) {
        if (type === PUBLIC) {
            return ((value & PHP.VM.Class[type]) === PHP.VM.Class[type]) || (value === PHP.VM.Class[STATIC]);
        } else {
            return ((value & PHP.VM.Class[type]) === PHP.VM.Class[type]);
        }

    }

    // check if obj inherits className
    function inherits(obj, name) {
        return ENV.$Class.Inherits(obj, name);
    }

    var buildVariableContext = function (methodName, args, className, realName, ctx) {

        var $ = PHP.VM.VariableHandler(ENV),
            argumentObj = this[methodArgumentPrefix + methodName];

        if (Array.isArray(argumentObj)) {
            argumentObj.forEach(function (argObject, index) {


                var arg = $(argObject.name);

                PHP.Utils.ArgumentHandler(ENV, arg, argObject, args[index], index, className + "::" + realName);
                /*

                    // assign arguments to correct variable names
                    if ( args[ index ] !== undefined ) {


                        if ( args[ index ] instanceof PHP.VM.VariableProto) {
                            $( arg.name )[ COMPILER.VARIABLE_VALUE ] = args[ index ][ COMPILER.VARIABLE_VALUE ];
                        } else {
                            $( arg.name )[ COMPILER.VARIABLE_VALUE ] = args[ index ];
                        }
                    } else {
                        // no argument passed for the specified index

                        if ( arg[ COMPILER.PROPERTY_DEFAULT ] !== undefined ) {
                            $( arg.name )[ COMPILER.VARIABLE_VALUE ] = arg[ COMPILER.PROPERTY_DEFAULT ][ COMPILER.VARIABLE_VALUE ];
                        } else {
                            $( arg.name )[ COMPILER.VARIABLE_VALUE ] = (new PHP.VM.Variable())[ COMPILER.VARIABLE_VALUE ];
                        }
                    }


                    // perform type hint check

                    if ( arg[ COMPILER.PROPERTY_TYPE ] !== undefined ) {
                        ENV[ COMPILER.TYPE_CHECK ]( $( arg.name ), arg[ COMPILER.PROPERTY_TYPE ], arg[ COMPILER.PROPERTY_DEFAULT ], index, className + "::" + realName );
                    }

                     */


            });
        }

        $("GLOBALS", ENV[COMPILER.GLOBAL]("GLOBALS"));

        $("$__CLASS__")[COMPILER.VARIABLE_VALUE] = className;
        $("$__FUNCTION__")[COMPILER.VARIABLE_VALUE] = realName;
        $("$__METHOD__")[COMPILER.VARIABLE_VALUE] = className + "::" + realName;

        if (ctx !== false) {
            $("this")[COMPILER.VARIABLE_VALUE] = (ctx !== undefined) ? ctx : this;
        }

        return $;
    }



    return function () {

        var className = arguments[0],
            classType = arguments[1],
            opts = arguments[2],
            classDefinition = arguments[3],
            DECLARED = false,
            staticVars = {},
            props = {},

            callMethod = function (methodName, args, variablesCallback) {
                var $ = buildVariableContext.call(this, methodName, args, this[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME], this[PHP.VM.Class.METHOD_REALNAME + methodName], (checkType(this[methodTypePrefix + methodName], STATIC)) ? false : this);

                if (staticVars[methodName] === undefined) {
                    staticVars[methodName] = {};
                }

                Object.keys(staticVars[methodName]).forEach(function (key) {

                    $(key, staticVars[methodName][key]);
                });

                var staticHandler = {};
                PHP.Utils.StaticHandler.call(this, staticHandler, staticVars, $, ENV[COMPILER.GLOBAL]);

                if (variablesCallback !== undefined) {
                    variablesCallback();
                }

                return this[methodPrefix + methodName].call(this, $, this[PHP.VM.Class.METHOD_PROTOTYPE + methodName], staticHandler);
            };

        var Class = function (ctx) {
                Object.keys(props).forEach(function (propertyName) {

                    if (checkType(this[propertyTypePrefix + propertyName], STATIC)) {
                        // static, so refer to the one and only same value defined in actual prototype
                    } else {
                        if (Array.isArray(props[propertyName])) {
                            this[propertyPrefix + propertyName] = new PHP.VM.Variable([]);
                        } else {
                            this[propertyPrefix + propertyName] = new PHP.VM.Variable(props[propertyName]);
                        }
                    }

                    this[PHP.VM.Class.CLASS_PROPERTY + className + "_" + propertyPrefix + propertyName] = this[propertyPrefix + propertyName];
                }, this);


                var callConstruct = function ($this, name, args, ctx) {

                    if (checkType($this[methodTypePrefix + name], PRIVATE) && this[PHP.VM.Class.METHOD_PROTOTYPE + name][COMPILER.CLASS_NAME] !== ctx[COMPILER.CLASS_NAME]) {
                        ENV[PHP.Compiler.prototype.ERROR]("Call to private " + $this[PHP.VM.Class.METHOD_PROTOTYPE + name][COMPILER.CLASS_NAME] + "::" + name + "() from invalid context", PHP.Constants.E_ERROR, true);
                    }

                    if (checkType(this[methodTypePrefix + name], PROTECTED) && (!(ctx instanceof PHP.VM.ClassPrototype) || !inherits(ctx, this[COMPILER.CLASS_NAME]))) {
                        ENV[PHP.Compiler.prototype.ERROR]("Call to protected " + className + "::" + name + "() from invalid context", PHP.Constants.E_ERROR, true);
                    }

                    this[PHP.VM.Class.KILLED] = true;
                    var ret = callMethod.call($this, name, Array.prototype.slice.call(args, 1));
                    this[PHP.VM.Class.KILLED] = undefined;
                    return ret;
                }.bind(this);

                // call constructor

                if (ctx !== true) {
                    // check if we are extending class, i.e. don't call constructors
                    if (!/^(ArrayObject|__Globals)$/i.test(className)) {
                        Object.keys(undefinedConstants).forEach(function (itm) {
                            var parts = itm.split("::");
                            if (!this.$Class.Exists(parts[0])) {
                                ENV[PHP.Compiler.prototype.ERROR]("Class '" + parts[0] + "' not found", PHP.Constants.E_ERROR, true);
                            }
                        }, ENV);
                        undefinedConstants = [];
                    }

                    this[COMPILER.CLASS_STORED] = []; // variables that store an instance of this class, needed for destructors


                    // make sure we aren't initiating an abstract class
                    if (checkType(this[COMPILER.CLASS_TYPE], ABSTRACT)) {
                        ENV[PHP.Compiler.prototype.ERROR]("Cannot instantiate abstract class " + className, PHP.Constants.E_ERROR, true);
                    }

                    // make sure we aren't initiating an interface
                    if (checkType(this[COMPILER.CLASS_TYPE], INTERFACE)) {
                        ENV[PHP.Compiler.prototype.ERROR]("Cannot instantiate interface " + className, PHP.Constants.E_ERROR, true);
                    }

                    // register new class initiated into registry (for destructors at shutdown)
                    if (className !== "ArrayObject") {
                        initiatedClasses.push(this);

                        this[PHP.VM.Class.CLASS_INDEX] = initiatedClasses.length;
                    }

                    // PHP 5 style constructor in current class
                    if (Object.getPrototypeOf(this).hasOwnProperty(methodPrefix + __construct)) {
                        return callConstruct(this, __construct, arguments, ctx);
                    }

                    // PHP 4 style constructor in current class
                    else if (Object.getPrototypeOf(this).hasOwnProperty(methodPrefix + className.toLowerCase())) {
                        return callConstruct(this, className.toLowerCase(), arguments, ctx);
                    }

                    // PHP 5 style constructor in any inherited class
                    else if (typeof this[methodPrefix + __construct] === "function") {
                        return callConstruct(this, __construct, arguments, ctx);
                    }

                    // PHP 4 style constructor in any inherited class
                    else {
                        var proto = this;

                        while ((proto = Object.getPrototypeOf(proto)) instanceof PHP.VM.ClassPrototype) {

                            if (proto.hasOwnProperty(methodPrefix + proto[COMPILER.CLASS_NAME].toLowerCase())) {
                                return callConstruct(proto, proto[COMPILER.CLASS_NAME].toLowerCase(), arguments, ctx);
                            }


                        }

                    }
                }



            },
            methods = {};

        /*
         * Declare class constant
         */
        methods[COMPILER.CLASS_CONSTANT] = function (constantName, constantValue) {

            if (classType === PHP.VM.Class.INTERFACE) {
                Class.prototype[PHP.VM.Class.INTERFACES].forEach(function (interfaceName) {
                    if (ENV.$Class.Get(interfaceName).prototype[PHP.VM.Class.CONSTANT + constantName] !== undefined) {
                        ENV[PHP.Compiler.prototype.ERROR]("Cannot inherit previously-inherited or override constant " + constantName + " from interface " + interfaceName, PHP.Constants.E_ERROR, true);
                    }

                }, this);

            }

            if (Class.prototype[PHP.VM.Class.CONSTANT + className + "$" + constantName] !== undefined) {
                ENV[PHP.Compiler.prototype.ERROR]("Cannot redefine class constant " + className + "::" + constantName, PHP.Constants.E_ERROR, true);
            }



            if (undefinedConstants[className + "::" + constantName] !== undefined) {

                Class.prototype[PHP.VM.Class.CONSTANT + constantName] = undefinedConstants[className + "::" + constantName];

                if (constantValue[VARIABLE.CLASS_CONSTANT]) {
                    // class constant referring another class constant, use reference
                    undefinedConstants[className + "::" + constantName][VARIABLE.REFERRING] = constantValue;
                    undefinedConstants[className + "::" + constantName][VARIABLE.DEFINED] = true;
                } else {
                    Class.prototype[PHP.VM.Class.CONSTANT + constantName][COMPILER.VARIABLE_VALUE] = constantValue[COMPILER.VARIABLE_VALUE];
                }


            } else {
                constantValue[VARIABLE.CLASS_CONSTANT] = true;
                Class.prototype[PHP.VM.Class.CONSTANT + constantName] = constantValue;
            }

            Class.prototype[PHP.VM.Class.CONSTANT + className + "$" + constantName] = Class.prototype[PHP.VM.Class.CONSTANT + constantName];

            if (Class.prototype[PHP.VM.Class.CONSTANT + constantName][VARIABLE.TYPE] === VARIABLE.ARRAY) {
                ENV[PHP.Compiler.prototype.ERROR]("Arrays are not allowed in class constants", PHP.Constants.E_ERROR, true);
            }

            return methods;
        };

        /*
         * Declare class property
         */

        methods[COMPILER.CLASS_PROPERTY] = function (propertyName, propertyType, propertyDefault) {
            props[propertyName] = propertyDefault;

            // can't define members for interface
            if (classType === PHP.VM.Class.INTERFACE) {
                ENV[PHP.Compiler.prototype.ERROR]("Interfaces may not include member variables", PHP.Constants.E_ERROR, true);
            }

            if (Class.prototype[propertyTypePrefix + propertyName] !== undefined && Class.prototype[propertyTypePrefix + propertyName] !== propertyType) {
                // property has been defined in an inherited class and isn't of same type as newly defined one,
                // so let's make sure it is weaker or throw an error

                var type = Class.prototype[propertyTypePrefix + propertyName],
                    inheritClass = Object.getPrototypeOf(Class.prototype)[COMPILER.CLASS_NAME];

                // redeclaring a (non-private) static as non-static
                if (!checkType(propertyType, STATIC) && checkType(type, STATIC) && !checkType(type, PRIVATE)) {
                    ENV[PHP.Compiler.prototype.ERROR]("Cannot redeclare static " + inheritClass + "::$" + propertyName + " as non static " + className + "::$" + propertyName, PHP.Constants.E_ERROR, true);
                }

                // redeclaring a (non-private) non-static as static
                if (checkType(propertyType, STATIC) && !checkType(type, STATIC) && !checkType(type, PRIVATE)) {
                    ENV[PHP.Compiler.prototype.ERROR]("Cannot redeclare non static " + inheritClass + "::$" + propertyName + " as static " + className + "::$" + propertyName, PHP.Constants.E_ERROR, true);
                }

                if (!checkType(propertyType, PUBLIC)) {

                    if ((checkType(propertyType, PRIVATE) || checkType(propertyType, PROTECTED)) && checkType(type, PUBLIC)) {
                        ENV[PHP.Compiler.prototype.ERROR]("Access level to " + className + "::$" + propertyName + " must be public (as in class " + inheritClass + ")", PHP.Constants.E_ERROR, true);
                    }

                    if ((checkType(propertyType, PRIVATE)) && checkType(type, PROTECTED)) {
                        ENV[PHP.Compiler.prototype.ERROR]("Access level to " + className + "::$" + propertyName + " must be protected (as in class " + inheritClass + ") or weaker", PHP.Constants.E_ERROR, true);
                    }

                }


            }



            if (checkType(propertyType, STATIC)) {
                /*
                Object.defineProperty( Class.prototype,  propertyPrefix + propertyName, {
                    value: propertyDefault
                });
                 */
                Object.defineProperty(Class.prototype, PHP.VM.Class.CLASS_STATIC_PROPERTY + propertyName, {
                    value: propertyDefault || new PHP.VM.Variable(null)
                });


            }




            Object.defineProperty(Class.prototype, propertyTypePrefix + propertyName, {
                value: propertyType
            });

            return methods;
        };

        /*
         * Declare method
         */

        methods[COMPILER.CLASS_METHOD] = function (realName, methodType, methodProps, byRef, methodFunc) {

            /*
             * signature checks
             */
            var methodName = realName.toLowerCase();

            // can't override final
            if (Class.prototype[PHP.VM.Class.METHOD_PROTOTYPE + methodName] !== undefined && checkType(Class.prototype[methodTypePrefix + methodName], FINAL)) {
                ENV[PHP.Compiler.prototype.ERROR]("Cannot override final method " + Class.prototype[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME] + "::" + realName + "()", PHP.Constants.E_ERROR, true);
            }

            // can't override final php4 ctor extending php5 ctor
            if (methodName === className.toLowerCase() && Class.prototype[PHP.VM.Class.METHOD_PROTOTYPE + __construct] !== undefined && checkType(Class.prototype[methodTypePrefix + __construct], FINAL)) {
                ENV[PHP.Compiler.prototype.ERROR]("Cannot override final " + Class.prototype[PHP.VM.Class.METHOD_PROTOTYPE + __construct][COMPILER.CLASS_NAME] + "::" + __construct + "() with " + className + "::" + realName + "()", PHP.Constants.E_ERROR, true);
            }

            var ctorProto = (function (proto) {


                while ((proto = Object.getPrototypeOf(proto)) instanceof PHP.VM.ClassPrototype) {

                    if (proto.hasOwnProperty(methodPrefix + proto[COMPILER.CLASS_NAME].toLowerCase())) {
                        return proto;
                    }

                }

            })(Class.prototype);

            // can't override final php5 ctor extending php4 ctor
            if (methodName === __construct && ctorProto !== undefined && checkType(ctorProto[methodTypePrefix + ctorProto[COMPILER.CLASS_NAME].toLowerCase()], FINAL)) {
                ENV[PHP.Compiler.prototype.ERROR]("Cannot override final " + ctorProto[COMPILER.CLASS_NAME] + "::" + ctorProto[COMPILER.CLASS_NAME] + "() with " + className + "::" + realName + "()", PHP.Constants.E_ERROR, true);
            }

            // can't make static non-static
            if (Class.prototype[PHP.VM.Class.METHOD_PROTOTYPE + methodName] !== undefined && checkType(Class.prototype[methodTypePrefix + methodName], STATIC) && !checkType(methodType, STATIC)) {
                ENV[PHP.Compiler.prototype.ERROR]("Cannot make static method " + Class.prototype[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME] + "::" + realName + "() non static in class " + className, PHP.Constants.E_ERROR, true);
            }

            // can't make non-static  static
            if (Class.prototype[PHP.VM.Class.METHOD_PROTOTYPE + methodName] !== undefined && !checkType(Class.prototype[methodTypePrefix + methodName], STATIC) && checkType(methodType, STATIC)) {
                ENV[PHP.Compiler.prototype.ERROR]("Cannot make non static method " + Class.prototype[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME] + "::" + realName + "() static in class " + className, PHP.Constants.E_ERROR, true);
            }

            // A final method cannot be abstract
            if (checkType(methodType, ABSTRACT) && checkType(methodType, FINAL)) {
                ENV[PHP.Compiler.prototype.ERROR]("Cannot use the final modifier on an abstract class member", PHP.Constants.E_ERROR, true);
            }

            // abstract static warning
            if (!checkType(classType, INTERFACE) && checkType(methodType, STATIC) && checkType(methodType, ABSTRACT)) {
                ENV[PHP.Compiler.prototype.ERROR]("Static function " + className + "::" + methodName + "() should not be abstract", PHP.Constants.E_STRICT, true);
            }

            // visibility from public
            if (Class.prototype[PHP.VM.Class.METHOD_PROTOTYPE + methodName] !== undefined && checkType(Class.prototype[methodTypePrefix + methodName], PUBLIC) && (checkType(methodType, PROTECTED) || checkType(methodType, PRIVATE))) {
                ENV[PHP.Compiler.prototype.ERROR]("Access level to " + className + "::" + realName + "() must be public (as in class same)", PHP.Constants.E_ERROR, true);
            }
            // visibility from protected
            if (Class.prototype[PHP.VM.Class.METHOD_PROTOTYPE + methodName] !== undefined && checkType(Class.prototype[methodTypePrefix + methodName], PROTECTED) && checkType(methodType, PRIVATE)) {
                ENV[PHP.Compiler.prototype.ERROR]("Access level to " + className + "::" + realName + "() must be protected (as in class same) or weaker", PHP.Constants.E_ERROR, true);
            }

            // interface methods can't be private
            if (classType === PHP.VM.Class.INTERFACE && checkType(methodType, PRIVATE)) {
                ENV[PHP.Compiler.prototype.ERROR]("Access type for interface method " + className + "::" + realName + "() must be omitted", PHP.Constants.E_ERROR, true);
            }

            // Default value for parameters with a class type hint can only be NULL
            methodProps.forEach(function (prop) {
                if (prop[COMPILER.PROPERTY_TYPE] !== undefined && prop[COMPILER.PROPERTY_DEFAULT] instanceof PHP.VM.Variable && !/^(string|array)$/i.test(prop[COMPILER.PROPERTY_TYPE]) && prop[COMPILER.PROPERTY_DEFAULT][VARIABLE.TYPE] !== VARIABLE.NULL) {
                    ENV[PHP.Compiler.prototype.ERROR]("Default value for parameters with a class type hint can only be NULL", PHP.Constants.E_ERROR, true);
                }
            }, this);


            // __call
            if (methodName === __call) {

                if (methodProps.length !== 2) {
                    ENV[PHP.Compiler.prototype.ERROR]("Method " + className + "::" + realName + "() must take exactly 2 arguments", PHP.Constants.E_ERROR, true);
                }

                if (!checkType(methodType, PUBLIC) || checkType(methodType, STATIC)) {
                    ENV[PHP.Compiler.prototype.ERROR]("The magic method " + realName + "() must have public visibility and cannot be static", PHP.Constants.E_CORE_WARNING, true);
                }

            }

            // __get
            else if (methodName === __get) {
                if (methodProps.length !== 1) {
                    ENV[PHP.Compiler.prototype.ERROR]("Method " + className + "::" + realName + "() must take exactly 1 argument", PHP.Constants.E_ERROR, true);
                }
            }

            // __set
            else if (methodName === __set) {
                if (methodProps.length !== 2) {
                    ENV[PHP.Compiler.prototype.ERROR]("Method " + className + "::" + realName + "() must take exactly 2 arguments", PHP.Constants.E_ERROR, true);
                }
            }


            // strict standards checks

            if (Class.prototype[PHP.VM.Class.METHOD_PROTOTYPE + methodName] !== undefined) {

                // method has been defined in an inherited class
                var propName,
                    propDef,
                    lastIndex = -1;
                if (methodName !== __construct && (!Class.prototype[methodArgumentPrefix + methodName].every(function (item, index) {
                        propName = item;
                        lastIndex = index;

                        if ((methodProps[index] !== undefined || item[COMPILER.PROPERTY_DEFAULT] !== undefined)) {

                            if (methodProps[index] !== undefined) {

                                if (item[COMPILER.PROPERTY_TYPE] === methodProps[index][COMPILER.PROPERTY_TYPE]) {

                                    return true;
                                }
                            }
                        }
                        // or
                        if (item[COMPILER.PROPERTY_DEFAULT] !== undefined) {
                            propDef = item[COMPILER.PROPERTY_DEFAULT][COMPILER.VARIABLE_VALUE];
                        }
                        return false;

                        // return (( (methodProps[ index ] !== undefined || item[ COMPILER.PROPERTY_DEFAULT ] !== undefined) && methodProps[ index ] !== undefined && item[ COMPILER.PROPERTY_TYPE ] === methodProps[ index ][ COMPILER.PROPERTY_TYPE ]) || item[ COMPILER.PROPERTY_DEFAULT ] !== undefined);
                        //                                                                                                ^^ ^^^^^^ rechecking it on purpose
                    }) || (methodProps[++lastIndex] !== undefined && methodProps[lastIndex][COMPILER.PROPERTY_DEFAULT] === undefined))) {
                    ENV[PHP.Compiler.prototype.ERROR]("Declaration of " + className + "::" + realName + "() should be compatible with " + Class.prototype[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME] + "::" + realName + "(" + ((propName !== undefined) ? ((propName[COMPILER.PROPERTY_TYPE] === undefined) ? "" : propName[COMPILER.PROPERTY_TYPE] + " ") + "$" + propName.name : "") + ((propDef !== undefined) ? " = " + propDef : "") + ")", PHP.Constants.E_STRICT, true, true);
                }


            }


            // end signature checks

            Object.defineProperty(Class.prototype, PHP.VM.Class.METHOD_PROTOTYPE + methodName, {
                value: Class.prototype
            });

            Object.defineProperty(Class.prototype, PHP.VM.Class.METHOD_REALNAME + methodName, {
                value: realName
            });

            Object.defineProperty(Class.prototype, methodTypePrefix + methodName, {
                value: methodType
            });

            Object.defineProperty(Class.prototype, methodByRef + methodName, {
                value: byRef
            });

            Object.defineProperty(Class.prototype, methodPrefix + methodName, {
                value: methodFunc,
                enumerable: true
            });

            Object.defineProperty(Class.prototype, methodArgumentPrefix + methodName, {
                value: methodProps
            });

            return methods;
        };

        methods[COMPILER.CLASS_DECLARE] = function () {

            if (!checkType(classType, ABSTRACT)) {
                // make sure there are no abstract methods left undeclared

                if (classType !== PHP.VM.Class.INTERFACE) {
                    Object.keys(Class.prototype).forEach(function (item) {
                        if (item.substring(0, methodPrefix.length) === methodPrefix) {

                            var methodName = item.substring(methodPrefix.length);
                            if (checkType(Class.prototype[methodTypePrefix + methodName], ABSTRACT)) {
                                ENV[PHP.Compiler.prototype.ERROR]("Class " + className + " contains 1 abstract method and must therefore be declared abstract or implement the remaining methods (" + className + "::" + methodName + ")", PHP.Constants.E_ERROR, true);
                            }

                        }
                    });

                    // interfaces

                    Class.prototype[PHP.VM.Class.INTERFACES].forEach(function (interfaceName) {

                        var interfaceProto = classRegistry[interfaceName.toLowerCase()].prototype;
                        Object.keys(interfaceProto).forEach(function (item) {




                            if (item.substring(0, PHP.VM.Class.CONSTANT.length) === PHP.VM.Class.CONSTANT) {

                                if (Class.prototype[item] !== undefined) {
                                    Class.prototype[PHP.VM.Class.INTERFACES].forEach(function (interfaceName2) {
                                        if (interfaceName2 === interfaceName) {
                                            if (ENV.$Class.Get(interfaceName2).prototype[item] !== undefined) {
                                                ENV[PHP.Compiler.prototype.ERROR]("Cannot inherit previously-inherited or override constant " + item.substring(PHP.VM.Class.CONSTANT.length) + " from interface " + interfaceName2, PHP.Constants.E_ERROR, true);
                                            }
                                        }
                                    }, this);
                                }

                                methods[COMPILER.CLASS_CONSTANT](item.substring(PHP.VM.Class.CONSTANT.length), interfaceProto[item]);
                            }




                            // method checks
                            if (item.substring(0, methodPrefix.length) === methodPrefix) {

                                var methodName = item.substring(methodPrefix.length),
                                    propName,
                                    propDef,
                                    lastIndex = -1;

                                if (Class.prototype[methodTypePrefix + methodName] === undefined) {
                                    ENV[PHP.Compiler.prototype.ERROR]("Class " + className + " contains 1 abstract method and must therefore be declared abstract or implement the remaining methods (" + interfaceName + "::" + methodName + ")", PHP.Constants.E_ERROR, true);
                                }

                                if (methodName === __construct && interfaceProto[methodTypePrefix + methodName] !== undefined || interfaceProto[methodTypePrefix + interfaceName.toLowerCase()] !== undefined) {

                                    var methodProps = Class.prototype[methodArgumentPrefix + __construct];

                                    if ((!interfaceProto[methodArgumentPrefix + __construct].every(function (item, index) {

                                            propName = item;
                                            lastIndex = index;

                                            if ((methodProps[index] !== undefined || item[COMPILER.PROPERTY_DEFAULT] !== undefined)) {

                                                if (methodProps[index] !== undefined) {

                                                    if (item[COMPILER.PROPERTY_TYPE] === methodProps[index][COMPILER.PROPERTY_TYPE]) {

                                                        return true;
                                                    }
                                                }
                                            }
                                            if (item[COMPILER.PROPERTY_DEFAULT] !== undefined) {
                                                propDef = item[COMPILER.PROPERTY_DEFAULT][COMPILER.VARIABLE_VALUE];

                                            }

                                            return false;

                                        }) || (methodProps[++lastIndex] !== undefined && methodProps[lastIndex][COMPILER.PROPERTY_DEFAULT] === undefined))) {
                                        ENV[PHP.Compiler.prototype.ERROR]("Declaration of " + className + "::" + __construct + "() must be compatible with " + interfaceName + "::" + __construct + "(" + ((propName !== undefined) ? ((propName[COMPILER.PROPERTY_TYPE] === undefined) ? "" : propName[COMPILER.PROPERTY_TYPE] + " ") + "$" + propName.name : "") + ((propDef !== undefined) ? " = " + propDef : "") + ")", PHP.Constants.E_ERROR, true);
                                    }


                                }
                            }
                        });

                    });
                }


            }


            DECLARED = true;

            if (classType !== PHP.VM.Class.INTERFACE) {
                declaredClasses.push(className);
            }

            return Class;
        };


        /*
         * Extends and implements
         */

        if (opts.Extends !== undefined) {

            var Extends = ENV.$Class.Get(opts.Extends);

            if (Extends.prototype[COMPILER.CLASS_TYPE] === PHP.VM.Class.INTERFACE) {
                // can't extend interface
                ENV[PHP.Compiler.prototype.ERROR]("Class " + className + " cannot extend from interface " + opts.Extends, PHP.Constants.E_ERROR, true);

            } else if (checkType(Extends.prototype[COMPILER.CLASS_TYPE], FINAL)) {
                // can't extend final class
                ENV[PHP.Compiler.prototype.ERROR]("Class " + className + " may not inherit from final class (" + opts.Extends + ")", PHP.Constants.E_ERROR, true);

            }

            Class.prototype = new Extends(true);
        } else {
            Class.prototype = new PHP.VM.ClassPrototype();

        }


        Class.prototype[PHP.VM.Class.INTERFACES] = (Class.prototype[PHP.VM.Class.INTERFACES] === undefined) ? [] : Array.prototype.slice.call(Class.prototype[PHP.VM.Class.INTERFACES], 0);

        var pushInterface = function (interfaceName, interfaces, ignore) {

            if (interfaceName.toLowerCase() === "traversable" && ignore !== true && !/^iterato(r|raggregate)$/i.test(className)) {
                ENV[PHP.Compiler.prototype.ERROR]("Class " + className + " must implement interface Traversable as part of either Iterator or IteratorAggregate", PHP.Constants.E_ERROR, true);
            }



            if (interfaces.indexOf(interfaceName) === -1) {
                // only add interface if it isn't present already
                interfaces.push(interfaceName);
            }


        }

        if (opts.Implements !== undefined || classType === PHP.VM.Class.INTERFACE) {

            ((classType === PHP.VM.Class.INTERFACE) ? opts : opts.Implements).forEach(function (interfaceName) {

                var Implements = ENV.$Class.Get(interfaceName, undefined, true);

                if (Implements.prototype[COMPILER.CLASS_TYPE] !== PHP.VM.Class.INTERFACE) {
                    // can't implement non-interface
                    ENV[PHP.Compiler.prototype.ERROR](className + " cannot implement " + interfaceName + " - it is not an interface", PHP.Constants.E_ERROR, true);
                }

                pushInterface(interfaceName, Class.prototype[PHP.VM.Class.INTERFACES]);

                // add interfaces from interface

                Implements.prototype[PHP.VM.Class.INTERFACES].forEach(function (interfaceName) {
                    pushInterface(interfaceName, Class.prototype[PHP.VM.Class.INTERFACES], true);
                });

            });
        }


        Class.prototype[COMPILER.CLASS_TYPE] = classType;

        Class.prototype[COMPILER.CLASS_NAME] = className;

        Class.prototype[COMPILER.METHOD_CALL] = function (ctx, methodName) {
            methodName = methodName.toLowerCase();
            var args = Array.prototype.slice.call(arguments, 2),
                value;

            if (typeof this[methodPrefix + methodName] !== "function") {
                // no method with that name found

                if (typeof this[methodPrefix + __call] === "function") {
                    // __call method defined, let's call that instead then


                    // determine which __call to use in case there are several defined
                    if (ctx instanceof PHP.VM) {
                        // normal call, use current context
                        value = callMethod.call(this, __call, [new PHP.VM.Variable(methodName), new PHP.VM.Variable(PHP.VM.Array.fromObject.call(ENV, args))]);
                    } else {
                        // static call, ensure current scope's __call() is favoured over the specified class's  __call()
                        value = ctx.callMethod.call(ctx, __call, [new PHP.VM.Variable(methodName), new PHP.VM.Variable(PHP.VM.Array.fromObject.call(ENV, args))]);
                    }

                    return ((value === undefined) ? new PHP.VM.Variable() : value);

                }

            } else {

                if (checkType(this[methodTypePrefix + methodName], PRIVATE) && this[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME] !== ctx[COMPILER.CLASS_NAME]) {

                    // targeted function is private and inaccessible from current context,
                    // but let's make sure current context doesn't have it's own private method that has been overwritten
                    if (!ctx instanceof PHP.VM.ClassPrototype ||
                        ctx[PHP.VM.Class.METHOD_PROTOTYPE + methodName] === undefined ||
                        ctx[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME] !== ctx[COMPILER.CLASS_NAME]) {
                        ENV[PHP.Compiler.prototype.ERROR]("Call to private method " + this[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME] + "::" + methodName + "() from context '" + ((ctx instanceof PHP.VM.ClassPrototype) ? ctx[COMPILER.CLASS_NAME] : '') + "'", PHP.Constants.E_ERROR, true);
                    }

                } else if (checkType(this[methodTypePrefix + methodName], PROTECTED)) {
                    // we are calling a protected method, let's see if we are inside it
                    if (!(ctx instanceof PHP.VM.ClassPrototype)) { // todo check actually parents as well
                        ENV[PHP.Compiler.prototype.ERROR]("Call to protected method " + this[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME] + "::" + methodName + "() from context '" + ((ctx instanceof PHP.VM.ClassPrototype) ? ctx[COMPILER.CLASS_NAME] : '') + "'", PHP.Constants.E_ERROR, true);
                    }
                }


            }



            // favor current context's private method
            if (ctx instanceof PHP.VM.ClassPrototype &&
                ctx[PHP.VM.Class.METHOD_PROTOTYPE + methodName] !== undefined &&
                checkType(ctx[methodTypePrefix + methodName], PRIVATE) &&
                ctx[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME] === ctx[COMPILER.CLASS_NAME]) {

                value = this.callMethod.call(ctx, methodName, args);

            } else {
                value = this.callMethod.call(this, methodName, args);

            }

            value = ((value === undefined) ? new PHP.VM.Variable() : value);
            if (className !== "ArrayObject") {
                PHP.Utils.CheckRef.call(ENV, value, this[methodByRef + methodName]);
            }
            return value;


        };

        Class.prototype.callMethod = callMethod;


        Class.prototype[COMPILER.STATIC_CALL] = function (ctx, methodClass, realName) {
            var methodName = realName.toLowerCase();
            var ret;
            var args = Array.prototype.slice.call(arguments, 3);

            if (typeof this[methodPrefix + methodName] !== "function") {
                // no method with that name found

                if (typeof this[methodPrefix + __call] === "function") {
                    // __call method defined, let's call that instead then


                    // determine which __call to use in case there are several defined
                    if (ctx instanceof PHP.VM) {
                        // normal call, use current context
                        return callMethod.call(this, __call, [new PHP.VM.Variable(methodName), new PHP.VM.Variable(PHP.VM.Array.fromObject.call(ENV, args))]);
                    } else {
                        // static call, ensure current scope's __call() is favoured over the specified class's  __call()
                        return ctx.callMethod.call(ctx, __call, [new PHP.VM.Variable(methodName), new PHP.VM.Variable(PHP.VM.Array.fromObject.call(ENV, args))]);
                    }

                }

            } else {

                if (checkType(this[methodTypePrefix + methodName], PRIVATE) && this[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME] !== ctx[COMPILER.CLASS_NAME]) {
                    ENV[PHP.Compiler.prototype.ERROR]("Call to private method " + this[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME] + "::" + realName + "() from context '" + ((ctx instanceof PHP.VM.ClassPrototype) ? ctx[COMPILER.CLASS_NAME] : '') + "'", PHP.Constants.E_ERROR, true);
                } else if (checkType(this[methodTypePrefix + methodName], PROTECTED)) {
                    // we are calling a protected method, let's see if we are inside it
                    if (!(ctx instanceof PHP.VM.ClassPrototype) || !inherits(ctx, this[COMPILER.CLASS_NAME])) {
                        ENV[PHP.Compiler.prototype.ERROR]("Call to protected method " + this[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME] + "::" + realName + "() from context '" + ((ctx instanceof PHP.VM.ClassPrototype) ? ctx[COMPILER.CLASS_NAME] : '') + "'", PHP.Constants.E_ERROR, true);
                    }

                }



            }


            var methodToCall,
                methodCTX,
                $;
            var proto;



            if (/^parent$/i.test(methodClass)) {
                proto = Object.getPrototypeOf(Object.getPrototypeOf(this));

            } else if (/^self$/i.test(methodClass)) {
                proto = Object.getPrototypeOf(this);

            } else if (methodClass !== className) {


                proto = Object.getPrototypeOf(this);
                while (proto !== null && proto[COMPILER.CLASS_NAME] !== methodClass) {
                    proto = Object.getPrototypeOf(proto);
                }

            }

            if (proto !== undefined) {
                methodToCall = proto[methodPrefix + methodName];
                methodCTX = proto[PHP.VM.Class.METHOD_PROTOTYPE + methodName];

                $ = buildVariableContext.call(proto, methodName, args, methodCTX[COMPILER.CLASS_NAME], realName, (checkType(proto[methodTypePrefix + methodName], STATIC)) ? false : this);



                if (checkType(proto[methodTypePrefix + methodName], PRIVATE) && methodCTX[COMPILER.CLASS_NAME] !== ctx[COMPILER.CLASS_NAME]) {
                    if (methodName === __construct) {
                        ENV[PHP.Compiler.prototype.ERROR]("Cannot call private " + methodCTX[COMPILER.CLASS_NAME] + "::" + realName + "()", PHP.Constants.E_ERROR, true);
                    }

                    ENV[PHP.Compiler.prototype.ERROR]("Call to private method " + methodCTX[COMPILER.CLASS_NAME] + "::" + realName + "() from context '" + ((ctx instanceof PHP.VM.ClassPrototype) ? ctx[COMPILER.CLASS_NAME] : '') + "'", PHP.Constants.E_ERROR, true);

                }

                if (checkType(proto[methodTypePrefix + methodName], ABSTRACT)) {

                    ENV[PHP.Compiler.prototype.ERROR]("Cannot call abstract method " + methodCTX[COMPILER.CLASS_NAME] + "::" + realName + "()", PHP.Constants.E_ERROR, true);
                }

                if (!checkType(proto[methodTypePrefix + methodName], STATIC) && !/^(parent|self)$/i.test(methodClass) && !inherits(ctx, proto[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME])) {
                    ENV[PHP.Compiler.prototype.ERROR]("Non-static method " + proto[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME] + "::" + realName + "() should not be called statically", PHP.Constants.E_STRICT, true);
                }

                ret = methodToCall.call(this, $, methodCTX);


                PHP.Utils.CheckRef.call(ENV, ret, methodCTX[methodByRef + methodName]);

                return ret;
            }



            ret = this.callMethod.call(this, methodName, args, function () {
                if (!checkType(this[methodTypePrefix + methodName], STATIC) && !/^(parent|self)$/i.test(methodClass) && !inherits(ctx, this[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME])) {
                    ENV[PHP.Compiler.prototype.ERROR]("Non-static method " + this[PHP.VM.Class.METHOD_PROTOTYPE + methodName][COMPILER.CLASS_NAME] + "::" + realName + "() should not be called statically", PHP.Constants.E_STRICT, true);
                }

            }.bind(this));


            PHP.Utils.CheckRef.call(ENV, ret, this[methodByRef + methodName]);


            return ret;

        };

        Class.prototype[COMPILER.STATIC_PROPERTY_GET] = function (ctx, propertyClass, propertyName, ref) {

            var methodCTX;
            if (/^self$/i.test(propertyClass)) {
                methodCTX = ctx;
            } else if (/^parent$/i.test(propertyClass)) {
                methodCTX = Object.getPrototypeOf(ctx);
            } else {
                methodCTX = this;
            }

            if (methodCTX[PHP.VM.Class.CLASS_STATIC_PROPERTY + propertyName] === undefined) {
                ENV[PHP.Compiler.prototype.ERROR]("Access to undeclared static property: " + methodCTX[COMPILER.CLASS_NAME] + "::$" + propertyName, PHP.Constants.E_ERROR, true);
            }


            if (ref === true && !methodCTX.hasOwnProperty(PHP.VM.Class.CLASS_STATIC_PROPERTY + propertyName)) {
                methodCTX[PHP.VM.Class.CLASS_STATIC_PROPERTY_REF + propertyClass + "$" + propertyName] = new PHP.VM.Variable();
                return methodCTX[PHP.VM.Class.CLASS_STATIC_PROPERTY_REF + propertyClass + "$" + propertyName];
            }



            if (methodCTX[PHP.VM.Class.CLASS_STATIC_PROPERTY_REF + propertyClass + "$" + propertyName] !== undefined) {
                return methodCTX[PHP.VM.Class.CLASS_STATIC_PROPERTY_REF + propertyClass + "$" + propertyName];
            }

            if (methodCTX[PHP.VM.Class.CLASS_STATIC_PROPERTY + propertyName] !== undefined) {

                return methodCTX[PHP.VM.Class.CLASS_STATIC_PROPERTY + propertyName];
            } else {

                //      return methodCTX[ propertyPrefix + propertyName ];
            }


        };


        Class.prototype[COMPILER.CLASS_STATIC_PROPERTY_ISSET] = function (ctx, propertyClass, propertyName) {

            var methodCTX;
            if (/^self$/i.test(propertyClass)) {
                methodCTX = ctx;
            } else if (/^parent$/i.test(propertyClass)) {
                methodCTX = Object.getPrototypeOf(ctx);
            } else {
                methodCTX = this;
            }

            if (methodCTX[PHP.VM.Class.CLASS_STATIC_PROPERTY + propertyName] === undefined) {
                return false;
            }




            if (methodCTX[PHP.VM.Class.CLASS_STATIC_PROPERTY_REF + propertyClass + "$" + propertyName] !== undefined) {
                return true;
            }

            if (methodCTX[PHP.VM.Class.CLASS_STATIC_PROPERTY + propertyName] !== undefined) {

                return true;
            }

            return false;


        };

        Class.prototype[COMPILER.CLASS_CONSTANT_FETCH] = function (ctx, constantName) {
            if (this[PHP.VM.Class.CONSTANT + constantName] === undefined && DECLARED === true) {
                ENV[PHP.Compiler.prototype.ERROR]("Undefined class constant '" + constantName + "'", PHP.Constants.E_ERROR, true);
            } else if (this[PHP.VM.Class.CONSTANT + constantName] === undefined) {
                //  undefinedConstants
                if (undefinedConstants[className + "::" + constantName] === undefined) {
                    var variable = new PHP.VM.Variable();
                    variable[VARIABLE.CLASS_CONSTANT] = true;
                    variable[VARIABLE.DEFINED] = className + "::$" + constantName;
                    undefinedConstants[className + "::" + constantName] = variable;

                }

                return undefinedConstants[className + "::" + constantName];
            }



            return this[PHP.VM.Class.CONSTANT + constantName];

        };

        Class.prototype[COMPILER.CLASS_PROPERTY_ISSET] = function (ctx, propertyName) {
            if (this[propertyPrefix + propertyName] === undefined || checkType(this[propertyTypePrefix + propertyName], STATIC)) {
                return false;
            } else {
                return true;
            }

        };

        Class.prototype[COMPILER.CLASS_PROPERTY_GET] = function (ctx, propertyName) {

            if (this[propertyPrefix + propertyName] === undefined && this[PHP.VM.Class.CLASS_STATIC_PROPERTY + propertyName] === undefined) {


                var obj = {},
                    props = {};

                // property set
                if (this[methodPrefix + __set] !== undefined) {
                    obj[COMPILER.ASSIGN] = function (value) {

                        callMethod.call(this, __set, [new PHP.VM.Variable(propertyName), value]);
                        return value;
                    }.bind(this);
                }

                // Post inc ++
                // getting value

                obj[VARIABLE.DEFINED] = true;

                obj[COMPILER.POST_INC] = function () {

                    if (this[methodPrefix + __get] !== undefined) {

                        var value = callMethod.call(this, __get, [new PHP.VM.Variable(propertyName)]);


                        // setting ++
                        if (this[methodPrefix + __set] !== undefined) {

                            callMethod.call(this, __set, [new PHP.VM.Variable(propertyName), (value instanceof PHP.VM.Variable) ? ++value[COMPILER.VARIABLE_VALUE] : new PHP.VM.Variable(1)]);
                        }
                        if (value === undefined) {
                            return new PHP.VM.Variable();
                        }
                        return value;

                    }
                }.bind(this);


                obj[COMPILER.PRE_INC] = function () {

                    if (this[methodPrefix + __get] !== undefined) {

                        var value = callMethod.call(this, __get, [new PHP.VM.Variable(propertyName)]);


                        // setting ++
                        if (this[methodPrefix + __set] !== undefined) {

                            callMethod.call(this, __set, [new PHP.VM.Variable(propertyName), (value instanceof PHP.VM.Variable) ? ++value[COMPILER.VARIABLE_VALUE] : new PHP.VM.Variable(1)]);
                        }

                        return value;

                    }
                }.bind(this);

                obj[COMPILER.ASSIGN_PLUS] = function (combined) {

                    if (this[methodPrefix + __get] !== undefined) {

                        var value = callMethod.call(this, __get, [new PHP.VM.Variable(propertyName)]);


                        // setting ++
                        if (this[methodPrefix + __set] !== undefined) {

                            callMethod.call(this, __set, [new PHP.VM.Variable(propertyName), (value instanceof PHP.VM.Variable) ? value[COMPILER.VARIABLE_VALUE] + combined[COMPILER.VARIABLE_VALUE] : new PHP.VM.Variable(1)]);
                        }

                        return value;

                    }
                }.bind(this);

                obj[COMPILER.CLASS_PROPERTY_GET] = function () {

                    if (this[methodPrefix + __get] !== undefined) {

                        var value = callMethod.call(this, __get, [new PHP.VM.Variable(propertyName)]);

                        return value[COMPILER.CLASS_PROPERTY_GET].apply(value, arguments);
                    }

                }.bind(this);

                obj[COMPILER.ASSIGN_MINUS] = function (combined) {

                    if (this[methodPrefix + __get] !== undefined) {

                        var value = callMethod.call(this, __get, [new PHP.VM.Variable(propertyName)]);


                        // setting ++
                        if (this[methodPrefix + __set] !== undefined) {

                            callMethod.call(this, __set, [new PHP.VM.Variable(propertyName), (value instanceof PHP.VM.Variable) ? value[COMPILER.VARIABLE_VALUE] - combined[COMPILER.VARIABLE_VALUE] : new PHP.VM.Variable(1)]);
                        }

                        return value;

                    }
                }.bind(this);


                var $this = this;
                // property get
                if (this[methodPrefix + __get] !== undefined) {

                    props[COMPILER.VARIABLE_VALUE] = {
                        get: function () {

                            if (obj.__get === undefined) {
                                obj.__get = callMethod.call($this, __get, [new PHP.VM.Variable(propertyName)]);
                            }
                            return obj.__get[COMPILER.VARIABLE_VALUE];


                        }
                    };

                    props[VARIABLE.TYPE] = {
                        get: function () {

                            if (obj.__get === undefined) {
                                obj.__get = callMethod.call($this, __get, [new PHP.VM.Variable(propertyName)]);
                            }
                            return obj.__get[VARIABLE.TYPE];
                        }

                    };

                    Object.defineProperties(obj, props);

                } else {



                    if (this[PHP.VM.Class.CLASS_UNDEFINED_PROPERTY + propertyName] === undefined) {
                        var variable = new PHP.VM.Variable();
                        variable[VARIABLE.PROPERTY] = true;
                        variable[VARIABLE.DEFINED] = className + "::$" + propertyName;

                        this[PHP.VM.Class.CLASS_UNDEFINED_PROPERTY + propertyName] = variable;

                        variable[VARIABLE.REGISTER_SETTER] = function () {
                            this[propertyPrefix + propertyName] = variable;
                        }.bind(this);



                        return variable;
                    } else {
                        return this[PHP.VM.Class.CLASS_UNDEFINED_PROPERTY + propertyName];
                    }

                }
                return obj;


            } else {

                var checkPermissions = function (propertyPrefix) {
                        if (checkType(this[propertyTypePrefix + propertyName], PROTECTED) && !(ctx instanceof PHP.VM.ClassPrototype)) {
                            ENV[PHP.Compiler.prototype.ERROR]("Cannot access protected property " + className + "::$" + propertyName, PHP.Constants.E_ERROR, true);
                        }

                        if (checkType(this[propertyTypePrefix + propertyName], PRIVATE) && !(ctx instanceof PHP.VM.ClassPrototype)) {
                            ENV[PHP.Compiler.prototype.ERROR]("Cannot access private property " + className + "::$" + propertyName, PHP.Constants.E_ERROR, true);
                        }

                        if (this[propertyPrefix + propertyName][VARIABLE.DEFINED] !== true && (!(ctx instanceof PHP.VM.ClassPrototype) || this[PHP.VM.Class.CLASS_PROPERTY + ctx[COMPILER.CLASS_NAME] + "_" + propertyPrefix + propertyName] === undefined)) {
                            if (!(ctx instanceof PHP.VM.ClassPrototype) && checkType(this[propertyTypePrefix + propertyName], PRIVATE)) {
                                ENV[PHP.Compiler.prototype.ERROR]("Cannot access private property " + className + "::$" + propertyName, PHP.Constants.E_ERROR, true);
                            }

                            if (checkType(this[propertyTypePrefix + propertyName], PROTECTED) && ctx instanceof PHP.VM.ClassPrototype) {
                                // no change?
                            } else {
                                Object.getPrototypeOf(this)[propertyTypePrefix + propertyName] = 1;
                            }


                        }

                        if (ctx instanceof PHP.VM.ClassPrototype && this[PHP.VM.Class.CLASS_PROPERTY + ctx[COMPILER.CLASS_NAME] + "_" + propertyPrefix + propertyName] !== undefined) {
                            // favor current context over object only if current context property is private
                            if (checkType(ctx[propertyTypePrefix + propertyName], PRIVATE)) {
                                return this[PHP.VM.Class.CLASS_PROPERTY + ctx[COMPILER.CLASS_NAME] + "_" + propertyPrefix + propertyName];
                            }
                        }

                    }.bind(this),
                    ret;

                if (this[propertyPrefix + propertyName] !== undefined) {
                    ret = checkPermissions(propertyPrefix);

                    if (ret !== undefined) {
                        return ret;
                    }

                }

                if (checkType(this[propertyTypePrefix + propertyName], STATIC)) {



                    ret = checkPermissions(PHP.VM.Class.CLASS_STATIC_PROPERTY);
                    if (ret !== undefined) {
                        return ret;
                    }

                    ENV[PHP.Compiler.prototype.ERROR]("Accessing static property " + className + "::$" + propertyName + " as non static", PHP.Constants.E_STRICT, true);
                    if (this[PHP.VM.Class.CLASS_UNDEFINED_PROPERTY + propertyName] === undefined) {
                        var variable = new PHP.VM.Variable();
                        variable[VARIABLE.PROPERTY] = true;
                        variable[VARIABLE.DEFINED] = className + "::$" + propertyName;

                        this[PHP.VM.Class.CLASS_UNDEFINED_PROPERTY + propertyName] = variable;

                        variable[VARIABLE.REGISTER_SETTER] = function () {
                            this[propertyPrefix + propertyName] = variable;
                        }.bind(this);



                        return variable;
                    } else {
                        if (this[PHP.VM.Class.CLASS_UNDEFINED_PROPERTY + propertyName][VARIABLE.DEFINED] !== true) {
                            this[PHP.VM.Class.CLASS_UNDEFINED_PROPERTY + propertyName][VARIABLE.DEFINED] = className + "::$" + propertyName;
                        }
                        return this[PHP.VM.Class.CLASS_UNDEFINED_PROPERTY + propertyName];
                    }
                }


                return this[propertyPrefix + propertyName];
            }


        };

        Class.prototype[COMPILER.CLASS_CLONE] = function (ctx) {

            var cloned = new(ENV.$Class.Get(this[COMPILER.CLASS_NAME]))(true),
                __clone = "__clone";
            cloned[COMPILER.CLASS_STORED] = []; // variables that store an instance of this class, needed for destructors

            // for...in, since we wanna go through the whole proto chain
            for (var prop in this) {
                if (prop.substring(0, propertyPrefix.length) === propertyPrefix) {

                    if (cloned[prop] === undefined) {
                        cloned[prop] = new PHP.VM.Variable(this[prop][COMPILER.VARIABLE_VALUE]);
                    } else {
                        cloned[prop][COMPILER.VARIABLE_VALUE] = this[prop][COMPILER.VARIABLE_VALUE];
                    }
                }
            }

            if (this[methodPrefix + __clone] !== undefined) {


                if (checkType(this[methodTypePrefix + __clone], PRIVATE) && this[PHP.VM.Class.METHOD_PROTOTYPE + __clone][COMPILER.CLASS_NAME] !== ctx[COMPILER.CLASS_NAME]) {

                    // targeted function is private and inaccessible from current context,
                    // but let's make sure current context doesn't have it's own private method that has been overwritten
                    if (!ctx instanceof PHP.VM.ClassPrototype ||
                        ctx[PHP.VM.Class.METHOD_PROTOTYPE + __clone] === undefined ||
                        ctx[PHP.VM.Class.METHOD_PROTOTYPE + __clone][COMPILER.CLASS_NAME] !== ctx[COMPILER.CLASS_NAME]) {
                        ENV[PHP.Compiler.prototype.ERROR]("Call to private " + this[PHP.VM.Class.METHOD_PROTOTYPE + __clone][COMPILER.CLASS_NAME] + "::" + __clone + "() from context '" + ((ctx instanceof PHP.VM.ClassPrototype) ? ctx[COMPILER.CLASS_NAME] : '') + "'", PHP.Constants.E_ERROR, true);
                    }

                } else if (checkType(this[methodTypePrefix + __clone], PROTECTED)) {
                    // we are calling a protected method, let's see if we are inside it
                    if (!(ctx instanceof PHP.VM.ClassPrototype)) { // todo check actually parents as well
                        ENV[PHP.Compiler.prototype.ERROR]("Call to protected " + this[PHP.VM.Class.METHOD_PROTOTYPE + __clone][COMPILER.CLASS_NAME] + "::" + __clone + "() from context '" + ((ctx instanceof PHP.VM.ClassPrototype) ? ctx[COMPILER.CLASS_NAME] : '') + "'", PHP.Constants.E_ERROR, true);
                    }
                }




                var $ = buildVariableContext.call(this, __clone, [], className, __clone, cloned);



                this[methodPrefix + __clone].call(this, $, Object.getPrototypeOf(this));


                // cloned.callMethod.call( cloned, __clone );
            }








            return new PHP.VM.Variable(cloned);
        };


        Class.prototype[COMPILER.CLASS_DESTRUCT] = function (ctx, shutdown) {
            // check if this class has been destructed already



            if (this[PHP.VM.Class.KILLED] === true) {
                return;
            }

            // go through all assigned class props to see if we have closure classes to be killed
            // for...in, since we wanna go through the whole proto chain
            for (var prop in this) {
                if (prop.substring(0, propertyPrefix.length) === propertyPrefix) {
                    this[prop][PHP.VM.Class.KILLED] = true;
                }
            }


            if (checkType(this[methodTypePrefix + __destruct], PRIVATE) && (!(ctx instanceof PHP.VM.ClassPrototype) || this[PHP.VM.Class.METHOD_PROTOTYPE + __destruct][COMPILER.CLASS_NAME] !== ctx[COMPILER.CLASS_NAME])) {

                // targeted function is private and inaccessible from current context,
                // but let's make sure current context doesn't have it's own private method that has been overwritten
                if (!(ctx instanceof PHP.VM.ClassPrototype) ||
                    ctx[PHP.VM.Class.METHOD_PROTOTYPE + __destruct] === undefined ||
                    ctx[PHP.VM.Class.METHOD_PROTOTYPE + __destruct][COMPILER.CLASS_NAME] !== ctx[COMPILER.CLASS_NAME]) {

                    if (shutdown === true) {
                        ENV[PHP.Compiler.prototype.ERROR]("Call to private " + className + "::" + __destruct + "() from context '" + ((ctx instanceof PHP.VM.ClassPrototype) ? ctx[COMPILER.CLASS_NAME] : '') + "' during shutdown ignored in Unknown on line 0", PHP.Constants.E_WARNING);
                        return;
                    } else {
                        ENV[PHP.Compiler.prototype.ERROR]("Call to private " + className + "::" + __destruct + "() from context '" + ((ctx instanceof PHP.VM.ClassPrototype) ? ctx[COMPILER.CLASS_NAME] : '') + "'", PHP.Constants.E_ERROR, true);
                    }
                }

            }


            if (checkType(this[methodTypePrefix + __destruct], PROTECTED) && (!(ctx instanceof PHP.VM.ClassPrototype) || !inherits(ctx, this[COMPILER.CLASS_NAME]))) {

                if (shutdown === true) {
                    ENV[PHP.Compiler.prototype.ERROR]("Call to protected " + className + "::" + __destruct + "() from context '" + ((ctx instanceof PHP.VM.ClassPrototype) ? ctx[COMPILER.CLASS_NAME] : '') + "' during shutdown ignored in Unknown on line 0", PHP.Constants.E_WARNING);
                    return;
                } else {
                    ENV[PHP.Compiler.prototype.ERROR]("Call to protected " + className + "::" + __destruct + "() from context '" + ((ctx instanceof PHP.VM.ClassPrototype) ? ctx[COMPILER.CLASS_NAME] : '') + "'", PHP.Constants.E_ERROR, true);
                }

            }


            this[PHP.VM.Class.KILLED] = true;

            if (this[methodPrefix + __destruct] !== undefined) {
                return callMethod.call(this, __destruct, []);
            }


        };

        // register class
        classRegistry[className.toLowerCase()] = Class;


        var constant$ = PHP.VM.VariableHandler();


        constant$("$__FILE__")[COMPILER.VARIABLE_VALUE] = "__FILE__";

        //   constant$("$__FILE__")[ COMPILER.VARIABLE_VALUE ] = ENV[ COMPILER.GLOBAL ]('_SERVER')[ COMPILER.VARIABLE_VALUE ][ COMPILER.METHOD_CALL ]( ENV, COMPILER.ARRAY_GET, 'SCRIPT_FILENAME' )[ COMPILER.VARIABLE_VALUE ];

        constant$("$__METHOD__")[COMPILER.VARIABLE_VALUE] = className;

        constant$("$__CLASS__")[COMPILER.VARIABLE_VALUE] = className;

        constant$("$__FUNCTION__")[COMPILER.VARIABLE_VALUE] = "";

        constant$("$__LINE__")[COMPILER.VARIABLE_VALUE] = 1;

        classDefinition.call(Class, methods, constant$, function (arg) {
            var item = new PHP.VM.Variable(arg);
            item[PHP.Compiler.prototype.NAV] = true;
            item[VARIABLE.INSTANCE] = Class.prototype;

            return item;
        });

        return methods;
    };



};
PHP.VM.Class.KILLED = "$Killed";

PHP.VM.ClassPrototype = function () {};

PHP.VM.Class.METHOD = "_";

PHP.VM.Class.METHOD_REALNAME = "€€";

PHP.VM.Class.CLASS_UNDEFINED_PROPERTY = "_£$";

PHP.VM.Class.CLASS_PROPERTY = "_£";

PHP.VM.Class.CLASS_STATIC_PROPERTY = "$_";

PHP.VM.Class.CLASS_STATIC_PROPERTY_REF = "Ö";

PHP.VM.Class.INTERFACES = "$Interfaces";

PHP.VM.Class.METHOD_PROTOTYPE = "$MP";

PHP.VM.Class.CONSTANT = "€";

PHP.VM.Class.PROPERTY = "$$";

PHP.VM.Class.PROPERTY_TYPE = "$£$";

PHP.VM.Class.CLASS_INDEX = "$CIndex";

PHP.VM.Class.Predefined = {};

PHP.VM.Class.PUBLIC = 1;
PHP.VM.Class.PROTECTED = 2;
PHP.VM.Class.PRIVATE = 4;
PHP.VM.Class.STATIC = 8;
PHP.VM.Class.ABSTRACT = 16;
PHP.VM.Class.FINAL = 32;
PHP.VM.Class.INTERFACE = 64;


/*
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 24.6.2012
 * @website http://hertzen.com
 */

PHP.VM.VariableHandler = function (ENV) {

    var variables = {},
        methods = function (variableName, setTo) {

            if (setTo !== undefined) {
                variables[variableName] = setTo;
                return methods;
            }

            if (variables[variableName] === undefined) {
                variables[variableName] = new PHP.VM.Variable();
                variables[variableName][PHP.VM.Variable.prototype.DEFINED] = variableName;
                variables[variableName].ENV = ENV;
                variables[variableName][PHP.VM.Variable.prototype.NAME] = variableName;
            }
            return variables[variableName];
        };

    return methods;
};

PHP.VM.VariableProto = function () {

}

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.ASSIGN] = function (combinedVariable) {

    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;

    this[VARIABLE.VARIABLE_TYPE] = undefined;

    if (arguments.length > 1) {
        // chaining, todo make it work for unlimited vars
        this[COMPILER.VARIABLE_VALUE] = arguments[0][COMPILER.VARIABLE_VALUE] = arguments[1][COMPILER.VARIABLE_VALUE];
    } else {
        var val = combinedVariable[COMPILER.VARIABLE_VALUE]; // trigger get
        if (combinedVariable[VARIABLE.TYPE] === VARIABLE.ARRAY) {
            // Array assignment always involves value copying. Use the reference operator to copy an array by reference.
            this[COMPILER.VARIABLE_VALUE] = val[COMPILER.METHOD_CALL]({}, COMPILER.ARRAY_CLONE);

        } else {
            if (combinedVariable[VARIABLE.TYPE] === VARIABLE.NULL && this[VARIABLE.TYPE] === VARIABLE.OBJECT) {
                this.TMPCTX = combinedVariable[VARIABLE.INSTANCE];
            }

            this[COMPILER.VARIABLE_VALUE] = val;
        }

        if (combinedVariable[VARIABLE.TYPE] === VARIABLE.ARRAY || combinedVariable[VARIABLE.TYPE] === VARIABLE.OBJECT) {
            this[COMPILER.VARIABLE_VALUE][COMPILER.CLASS_STORED].push(this);
        }


    }

    return this;

};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.INSTANCEOF] = function (instanceName) {

    var COMPILER = PHP.Compiler.prototype;

    var className,
        classObj = this[COMPILER.VARIABLE_VALUE];

    // search interfaces
    if (classObj[PHP.VM.Class.INTERFACES].indexOf(instanceName) !== -1) {

        return new PHP.VM.Variable(true);
    }

    // search parents
    do {
        className = classObj[COMPILER.CLASS_NAME];
        if (className === instanceName) {
            return new PHP.VM.Variable(true);
        }
        classObj = Object.getPrototypeOf(classObj);
    } while (className !== undefined);
    return new PHP.VM.Variable(false);

};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.CONCAT] = function (combinedVariable) {

    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;

    return new PHP.VM.Variable(this[VARIABLE.CAST_STRING][COMPILER.VARIABLE_VALUE] + "" + combinedVariable[VARIABLE.CAST_STRING][COMPILER.VARIABLE_VALUE]);
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.ASSIGN_CONCAT] = function (combinedVariable) {

    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;
    this.NO_ERROR = true;

    var val = this[COMPILER.VARIABLE_VALUE]; // trigger get

    if (this[this.TYPE] === this.NULL) {
        this[COMPILER.VARIABLE_VALUE] = "" + combinedVariable[COMPILER.VARIABLE_VALUE];
    } else {
        this[COMPILER.VARIABLE_VALUE] = val + "" + combinedVariable[COMPILER.VARIABLE_VALUE];
    }
    this.NO_ERROR = false;
    return this;
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.ASSIGN_PLUS] = function (combinedVariable) {

    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;
    this[COMPILER.VARIABLE_VALUE] = (this[COMPILER.VARIABLE_VALUE] - 0) + (combinedVariable[COMPILER.VARIABLE_VALUE] - 0);
    return this;
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.ASSIGN_MINUS] = function (combinedVariable) {

    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype;
    this[COMPILER.VARIABLE_VALUE] = this[COMPILER.VARIABLE_VALUE] - combinedVariable[COMPILER.VARIABLE_VALUE];
    return this;
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.ADD] = function (combinedVariable) {

    var COMPILER = PHP.Compiler.prototype,
        val1 = this[COMPILER.VARIABLE_VALUE],
        val2 = combinedVariable[COMPILER.VARIABLE_VALUE];

    if (isNaN(val1 - 0)) {
        val1 = 0;
    }

    if (isNaN(val2 - 0)) {
        val2 = 0;
    }

    return new PHP.VM.Variable((val1 - 0) + (val2 - 0));
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.MUL] = function (combinedVariable) {

    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable((this[COMPILER.VARIABLE_VALUE] - 0) * (combinedVariable[COMPILER.VARIABLE_VALUE] - 0));
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.DIV] = function (combinedVariable) {

    var COMPILER = PHP.Compiler.prototype;

    var val = (this[COMPILER.VARIABLE_VALUE] - 0) / (combinedVariable[COMPILER.VARIABLE_VALUE] - 0);
    if (val === Number.POSITIVE_INFINITY) {
        this.ENV[COMPILER.ERROR]("Division by zero", PHP.Constants.E_WARNING, true);
        return new PHP.VM.Variable();
    }
    return new PHP.VM.Variable(val);
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.MOD] = function (combinedVariable) {

    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable((this[COMPILER.VARIABLE_VALUE]) % (combinedVariable[COMPILER.VARIABLE_VALUE]));
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.MINUS] = function (combinedVariable, post) {

    var COMPILER = PHP.Compiler.prototype;

    if (post === true) {
        var after = combinedVariable[COMPILER.VARIABLE_VALUE] - 0,
            before = this[COMPILER.VARIABLE_VALUE] - 0;
        return new PHP.VM.Variable(before - after);

    } else {
        return new PHP.VM.Variable((this[COMPILER.VARIABLE_VALUE] - 0) - (combinedVariable[COMPILER.VARIABLE_VALUE] - 0));
    }
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.METHOD_CALL] = function () {

    var COMPILER = PHP.Compiler.prototype;

    return this[COMPILER.VARIABLE_VALUE][PHP.Compiler.prototype.METHOD_CALL].apply(this[COMPILER.VARIABLE_VALUE], arguments);
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.BOOLEAN_NOT] = function () {

    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable(!(this[COMPILER.VARIABLE_VALUE]));
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.IDENTICAL] = function (compareTo) {

    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable((this[COMPILER.VARIABLE_VALUE]) === (compareTo[COMPILER.VARIABLE_VALUE]));
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.NOT_IDENTICAL] = function (compareTo) {

    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable((this[COMPILER.VARIABLE_VALUE]) !== (compareTo[COMPILER.VARIABLE_VALUE]));
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.EQUAL] = function (compareTo) {

    var COMPILER = PHP.Compiler.prototype,
        ARRAY = PHP.VM.Array.prototype,
        first = this,
        second = compareTo,
        cast;

    if (first[this.TYPE] === this.OBJECT && second[this.TYPE] === this.OBJECT) {
        cast = (first[COMPILER.VARIABLE_VALUE].Native === true || second[COMPILER.VARIABLE_VALUE].Native === true);
        if (cast) {
            first = first[this.CAST_INT];
            second = second[this.CAST_INT];
        }
    } else if (first[this.TYPE] === this.ARRAY && second[this.TYPE] === this.ARRAY) {
        var firstVals = first[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.VALUES][COMPILER.VARIABLE_VALUE],
            secondVals = second[COMPILER.VARIABLE_VALUE][PHP.VM.Class.PROPERTY + ARRAY.VALUES][COMPILER.VARIABLE_VALUE];

        if (firstVals.length !== secondVals.length) {
            return new PHP.VM.Variable(false);
        }

        var result = firstVals.every(function (val, index) {
            return (val[COMPILER.VARIABLE_VALUE] == secondVals[index][COMPILER.VARIABLE_VALUE]);
        });

        return new PHP.VM.Variable(result);

    }



    return new PHP.VM.Variable((first[COMPILER.VARIABLE_VALUE]) == (second[COMPILER.VARIABLE_VALUE]));
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.SMALLER_OR_EQUAL] = function (compareTo) {

    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable((this[COMPILER.VARIABLE_VALUE]) <= (compareTo[COMPILER.VARIABLE_VALUE]));
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.GREATER_OR_EQUAL] = function (compareTo) {

    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable((this[COMPILER.VARIABLE_VALUE]) >= (compareTo[COMPILER.VARIABLE_VALUE]));
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.SMALLER] = function (compareTo) {

    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable((this[COMPILER.VARIABLE_VALUE]) < (compareTo[COMPILER.VARIABLE_VALUE]));
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.GREATER] = function (compareTo) {

    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable((this[this.CAST_DOUBLE][COMPILER.VARIABLE_VALUE]) > (compareTo[this.CAST_DOUBLE][COMPILER.VARIABLE_VALUE]));
};

PHP.VM.VariableProto.prototype[PHP.Compiler.prototype.BOOLEAN_OR] = function (compareTo) {
    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable((this[this.CAST_STRING][COMPILER.VARIABLE_VALUE]) | (compareTo[this.CAST_STRING][COMPILER.VARIABLE_VALUE]));
};

PHP.VM.Variable = function (arg) {

    var value,
        POST_MOD = 0,
        __toString = "__toString",
        COMPILER = PHP.Compiler.prototype,

        setValue = function (newValue) {

            var prev = value;
            var setType = function (newValue) {
                if (this[this.OVERLOADED] === undefined) {



                    if (newValue === undefined) {
                        newValue = null;
                    }

                    if (newValue instanceof PHP.VM.Variable) {
                        newValue = newValue[COMPILER.VARIABLE_VALUE];
                    }

                    if (typeof newValue === "string") {
                        this[this.TYPE] = this.STRING;
                    } else if (typeof newValue === "function") {
                        this[this.TYPE] = this.LAMBDA;
                    } else if (typeof newValue === "number") {
                        if (newValue % 1 === 0) {
                            this[this.TYPE] = this.INT;
                        } else {
                            this[this.TYPE] = this.FLOAT;
                        }
                    } else if (newValue === null) {
                        if (this[this.TYPE] === this.OBJECT && value instanceof PHP.VM.ClassPrototype) {

                            this[PHP.VM.Class.KILLED] = true;
                            if (value[COMPILER.CLASS_STORED].every(function (variable) {

                                    return (variable[PHP.VM.Class.KILLED] === true);
                                })) {
                                // all variable instances have been killed, can safely destruct

                                value[COMPILER.CLASS_DESTRUCT](this.TMPCTX);
                            }

                        }

                        this[this.TYPE] = this.NULL;

                    } else if (typeof newValue === "boolean") {
                        this[this.TYPE] = this.BOOL;
                    } else if (newValue instanceof PHP.VM.ClassPrototype) {
                        if (newValue[COMPILER.CLASS_NAME] === PHP.VM.Array.prototype.CLASS_NAME) {
                            this[this.TYPE] = this.ARRAY;

                        } else {

                            this[this.TYPE] = this.OBJECT;
                        }
                    } else if (newValue instanceof PHP.VM.Resource) {
                        this[this.TYPE] = this.RESOURCE;
                    } else {

                    }
                    this[this.DEFINED] = true;

                    // is variable a reference
                    if (this[this.REFERRING] !== undefined) {

                        this[this.REFERRING][COMPILER.VARIABLE_VALUE] = newValue;
                    } else {

                        value = newValue;

                        // remove this later, debugging only
                        this.val = newValue;

                    }
                }

            }.bind(this);
            setType(newValue);
            if (typeof this[this.REGISTER_SETTER] === "function") {
                var ret = this[this.REGISTER_SETTER](value);
                if (ret === false) {
                    setType(prev);
                    value = prev;
                }
            }

        }.bind(this); // something strange going on with context in node.js?? iterators_2.phpt

    this.rand = Math.random();
    this.NO_ERROR = false;
    setValue.call(this, arg);


    if (this[this.TYPE] === this.INT) {
        this[this.VARIABLE_TYPE] = this.NEW_VARIABLE;
    }

    this[COMPILER.VARIABLE_CLONE] = function () {
        var variable;

        if (this[this.IS_REF]) {
            return this;
        }

        switch (this[this.TYPE]) {
            case this.NULL:
            case this.BOOL:
            case this.INT:
            case this.FLOAT:
            case this.STRING:
                variable = new PHP.VM.Variable(this[COMPILER.VARIABLE_VALUE]);
                break;
            case this.OBJECT:
            case this.RESOURCE:
                return this;
            case this.ARRAY:
                variable = new PHP.VM.Variable(this[COMPILER.VARIABLE_VALUE][COMPILER.METHOD_CALL]({}, COMPILER.ARRAY_CLONE))
                break;
            default:
                return this;
        }

        variable[this.REFERRING] = this[this.REFERRING];




        return variable;

    };

    this[this.REF] = function (variable) {

        if (this === variable) {
            /// hehehehehe referring yourself... results in thread lock
            return this;
        }
        if (variable[this.VARIABLE_TYPE] === this.FUNCTION) {
            this.ENV[COMPILER.ERROR]("Only variables should be assigned by reference", PHP.Constants.E_STRICT, true);
            this[COMPILER.ASSIGN](variable);
            return this;
        }

        var tmp = variable[COMPILER.VARIABLE_VALUE]; // trigger get

        // call setter incase we need to complete array push transaction
        if (typeof this[this.REGISTER_SETTER] === "function") {
            this[this.REGISTER_SETTER]();
        }

        this[this.REFERRING] = variable;
        this[this.DEFINED] = true;

        variable[this.IS_REF] = true;

        return this;
    };

    this[COMPILER.NEG] = function () {
        return new PHP.VM.Variable(-this[COMPILER.VARIABLE_VALUE]);
    };

    this[COMPILER.PRE_INC] = function () {
        this[COMPILER.VARIABLE_VALUE]++;
        return this;
    };

    this[COMPILER.PRE_DEC] = function () {
        this[COMPILER.VARIABLE_VALUE]--;
        return this;
    };

    this[COMPILER.POST_INC] = function () {
        this.NO_ERROR = true;
        var tmp = this[COMPILER.VARIABLE_VALUE]; // trigger get, incase there is POST_MOD

        if (this[this.DEFINED] !== true) {
            this[COMPILER.VARIABLE_VALUE] = 0;
        }

        this.NO_ERROR = false;
        POST_MOD++;
        this.POST_MOD = POST_MOD;
        return this;

    };


    this[COMPILER.POST_DEC] = function () {
        var tmp = this[COMPILER.VARIABLE_VALUE]; // trigger get, incase there is POST_MOD
        POST_MOD--;
        this.POST_MOD = POST_MOD;
        return this;
    };




    this[PHP.Compiler.prototype.UNSET] = function () {

        setValue(null);
        this[this.DEFINED] = this[this.NAME];

        if (this[this.REFERRING] !== undefined) {
            this[this.REFERRING][PHP.Compiler.prototype.UNSET]();
        }
    };
    // property get proxy
    this[COMPILER.CLASS_PROPERTY_GET] = function (ctx, propertyName, funcCall) {
        var val, $this = this;

        if (this[this.REFERRING] !== undefined) {
            $this = this[this.REFERRING];
        }

        if ($this[this.TYPE] !== this.OBJECT) {

            val = new(this.ENV.$Class.Get("stdClass"))(this);

            if ($this[this.TYPE] === this.NULL ||
                ($this[this.TYPE] === this.BOOL && $this[COMPILER.VARIABLE_VALUE] === false) ||
                ($this[this.TYPE] === this.STRING && $this[COMPILER.VARIABLE_VALUE].length === 0)
            ) {
                if (funcCall !== true) {
                    if ($this[this.PROPERTY] !== true) {
                        this.ENV[COMPILER.ERROR]("Creating default object from empty value", PHP.Constants.E_WARNING, true);
                    }
                }
                $this[COMPILER.VARIABLE_VALUE] = val;
            } else {
                this.ENV[COMPILER.ERROR]("Attempt to assign property of non-object", PHP.Constants.E_WARNING, true);


            }

        } else {
            val = $this[COMPILER.VARIABLE_VALUE];
        }
        return val[COMPILER.CLASS_PROPERTY_GET].apply(val, arguments);
    };

    Object.defineProperty(this, COMPILER.VARIABLE_VALUE, {
        get: function () {
            var $this = this,
                returning;
            if (this[this.REFERRING] !== undefined) {
                $this = this[this.REFERRING];
            }

            if (typeof this[this.REGISTER_GETTER] === "function") {
                var returned = this[this.REGISTER_GETTER]();
                if (returned instanceof PHP.VM.Variable) {
                    this[this.TYPE] = returned[this.TYPE];
                    this[this.DEFINED] = returned[this.DEFINED];
                    return returned[COMPILER.VARIABLE_VALUE];
                }

            }

            if ($this[this.DEFINED] !== true && $this[COMPILER.SUPPRESS] !== true) {

                if ($this[this.CONSTANT] === true) {
                    this.ENV[COMPILER.ERROR]("Use of undefined constant " + $this[this.DEFINED] + " - assumed '" + $this[this.DEFINED] + "'", PHP.Constants.E_CORE_NOTICE, true);
                    $this[this.TYPE] = this.STRING;

                    returning = $this[this.DEFINED];
                    $this[COMPILER.VARIABLE_VALUE] = $this[this.DEFINED];
                    $this[this.DEFINED] = true;

                    return returning;
                } else {
                    if (this.NO_ERROR !== true) {
                        this.ENV[COMPILER.ERROR]("Undefined " + ($this[this.PROPERTY] === true ? "property" : "variable") + ": " + $this[this.DEFINED], PHP.Constants.E_NOTICE, true);
                    }
                }
            }
            if (this[this.REFERRING] === undefined) {
                returning = value;
            } else {
                var referLoop = $this;

                while (referLoop[this.REFERRING] !== undefined) {
                    referLoop = referLoop[this.REFERRING];
                }

                this[this.TYPE] = referLoop[this.TYPE];
                returning = $this[COMPILER.VARIABLE_VALUE];
            }

            // perform POST_MOD change

            if (POST_MOD !== 0) {
                var setPOST_MOD = POST_MOD;
                POST_MOD = 0; // reset counter
                $this[COMPILER.VARIABLE_VALUE] += setPOST_MOD - 0;
                //     value = POST_MOD + (value - 0);

            }


            return returning;
        },
        set: setValue
    });

    Object.defineProperty(this, this.CAST_BOOL, {
        get: function () {
            // http://www.php.net/manual/en/language.types.boolean.php#language.types.boolean.casting

            var value = this[COMPILER.VARIABLE_VALUE]; // trigger get, incase there is POST_MOD

            switch (this[this.TYPE]) {
                case this.INT:
                case this.FLOAT:
                    if (value === 0) {
                        return new PHP.VM.Variable(false);
                    } else {
                        return new PHP.VM.Variable(true);
                    }
                    break;

                case this.STRING:
                    if (value.length === 0 || value === "0") {
                        return new PHP.VM.Variable(false);
                    } else {
                        return new PHP.VM.Variable(true);
                    }
                    break;

                case this.ARRAY:
                    if (value[PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.VALUES][COMPILER.VARIABLE_VALUE].length === 0) {
                        return new PHP.VM.Variable(false);
                    } else {
                        return new PHP.VM.Variable(true);
                    }
                    break;

                case this.OBJECT:
                    // TODO
                    return new PHP.VM.Variable(true);

                case this.NULL:
                    return new PHP.VM.Variable(false);
                    break;
            }


            return this;
        }
    });

    Object.defineProperty(this, this.CAST_INT, {
        get: function () {
            // http://www.php.net/manual/en/language.types.integer.php

            var value = this[COMPILER.VARIABLE_VALUE]; // trigger get, incase there is POST_MOD


            switch (this[this.TYPE]) {

                case this.BOOL:
                    return new PHP.VM.Variable((value === true) ? 1 : 0);
                    break;

                case this.FLOAT:
                    return new PHP.VM.Variable(Math.floor(value));
                    break;
                case this.STRING:
                    if (isNaN(parseInt(value, 10))) {
                        return new PHP.VM.Variable(0);
                    } else {
                        return new PHP.VM.Variable(parseInt(value, 10));
                    }
                    break;
                case this.OBJECT:
                    this.ENV[COMPILER.ERROR]("Object of class " + value[COMPILER.CLASS_NAME] + " could not be converted to int", PHP.Constants.E_NOTICE, true);
                    return new PHP.VM.Variable();
                    break;

                default:
                    return this;
            }

        }
    });


    Object.defineProperty(this, this.CAST_DOUBLE, {
        get: function () {
            // http://www.php.net/manual/en/language.types.integer.php

            var value = this[COMPILER.VARIABLE_VALUE], // trigger get, incase there is POST_MOD
                ret;


            switch (this[this.TYPE]) {

                case this.BOOL:
                    return new PHP.VM.Variable((value === true) ? 1.0 : 0.0);
                    break;

                case this.INT:

                    ret = new PHP.VM.Variable(parseFloat(value));
                    ret[this.TYPE] = this.FLOAT;
                    return ret;
                    break;
                case this.STRING:
                    if (isNaN(parseFloat(value))) {
                        ret = new PHP.VM.Variable(0.0);

                    } else {
                        ret = new PHP.VM.Variable(parseFloat(value));
                    }
                    ret[this.TYPE] = this.FLOAT;
                    return ret;
                    break;

                default:
                    return this;
            }

        }
    });

    Object.defineProperty(this, this.CAST_STRING, {
        get: function () {
            //   http://www.php.net/manual/en/language.types.string.php#language.types.string.casting

            var value = this[COMPILER.VARIABLE_VALUE]; // trigger get, incase there is POST_MOD

            if (value instanceof PHP.VM.ClassPrototype && value[COMPILER.CLASS_NAME] !== PHP.VM.Array.prototype.CLASS_NAME) {
                // class
                // check for __toString();



                if (typeof value[PHP.VM.Class.METHOD + __toString.toLowerCase()] === "function") {
                    try {
                        var val = value[COMPILER.METHOD_CALL](this, __toString);
                    } catch (e) {
                        this.ENV[COMPILER.ERROR]("Method " + value[COMPILER.CLASS_NAME] + "::" + __toString + "() must not throw an exception", PHP.Constants.E_ERROR, true, false, true);
                        return new PHP.VM.Variable("");
                    }
                    if (val[this.TYPE] !== this.STRING) {
                        this.ENV[COMPILER.ERROR]("Method " + value[COMPILER.CLASS_NAME] + "::" + __toString + "() must return a string value", PHP.Constants.E_RECOVERABLE_ERROR, true);
                        return new PHP.VM.Variable("");
                    }
                    val[this.VARIABLE_TYPE] = this.FUNCTION;
                    return val;
                    //  return new PHP.VM.Variable( value[PHP.VM.Class.METHOD + __toString ]() );
                } else {
                    this.ENV[COMPILER.ERROR]("Object of class " + value[COMPILER.CLASS_NAME] + " could not be converted to string", PHP.Constants.E_RECOVERABLE_ERROR, true);



                    return new PHP.VM.Variable("");
                }

            } else if (this[this.TYPE] === this.BOOL) {
                return new PHP.VM.Variable((value) ? "1" : "");
            } else if (this[this.TYPE] === this.INT) {
                return new PHP.VM.Variable(value + "");
            } else if (this[this.TYPE] === this.NULL) {
                return new PHP.VM.Variable("");
            }
            return this;
        }
    });

    this[COMPILER.DIM_UNSET] = function (ctx, variable) {

        var value = this[COMPILER.VARIABLE_VALUE]; // trigger get

        if (this[this.TYPE] !== this.ARRAY) {
            if (this[this.TYPE] === this.OBJECT && value[PHP.VM.Class.INTERFACES].indexOf("ArrayAccess") !== -1) {

                value[COMPILER.METHOD_CALL](ctx, "offsetUnset", variable)[COMPILER.VARIABLE_VALUE]; // trigger offsetUnset
            }
        } else {

            value[COMPILER.METHOD_CALL](ctx, "offsetUnset", variable);
        }



    };

    this[COMPILER.DIM_ISSET] = function (ctx, variable) {

        var $this = this;

        if (this[this.REFERRING] !== undefined) {

            var referLoop = $this;

            while (referLoop[this.REFERRING] !== undefined) {
                referLoop = referLoop[this.REFERRING];
            }

            $this = referLoop;

        }

        if ($this[this.TYPE] !== this.ARRAY) {
            if ($this[this.TYPE] === this.OBJECT && $this.val[PHP.VM.Class.INTERFACES].indexOf("ArrayAccess") !== -1) {

                var exists = $this.val[COMPILER.METHOD_CALL](ctx, "offsetExists", variable)[COMPILER.VARIABLE_VALUE]; // trigger offsetExists
                return exists;


            } else {

                return false;
            }
        }

        var returning = $this.val[COMPILER.METHOD_CALL](ctx, COMPILER.ARRAY_GET, variable);

        return (returning[this.DEFINED] === true);

    };

    this[COMPILER.DIM_EMPTY] = function (ctx, variable) {

        if (this[this.TYPE] !== this.ARRAY) {

            if (this[this.TYPE] === this.OBJECT && value[PHP.VM.Class.INTERFACES].indexOf("ArrayAccess") !== -1) {

                var exists = value[COMPILER.METHOD_CALL](ctx, "offsetExists", variable)[COMPILER.VARIABLE_VALUE]; // trigger offsetExists


                if (exists === true) {
                    var val = value[COMPILER.METHOD_CALL](ctx, COMPILER.ARRAY_GET, variable); // trigger offsetGet
                    return val;

                } else {
                    return true;
                }


            } else {
                // looking in a non-existant array, so obviously its empty
                return true;
            }
        } else {
            return this[COMPILER.DIM_FETCH](ctx, variable);
        }



    };

    Object.defineProperty(this, COMPILER.DIM_FETCH, {
        get: function () {

            return function (ctx, variable) {

                var $this = this;

                if (variable instanceof PHP.VM.Variable && variable[this.TYPE] === this.OBJECT) {
                    this.ENV[COMPILER.ERROR]("Illegal offset type", PHP.Constants.E_WARNING, true);
                    return new PHP.VM.Variable();
                }

                if (typeof this[this.REGISTER_GETTER] === "function") {
                    var returned = this[this.REGISTER_GETTER]();
                    if (returned instanceof PHP.VM.Variable) {

                        this[this.TYPE] = returned[this.TYPE];
                        this[this.DEFINED] = returned[this.DEFINED];
                        var item = returned[COMPILER.DIM_FETCH](ctx, variable);
                        /*
                        if (returned[ this.OVERLOADING ] !== undefined) {
                            item[ this.OVERLOADED ] = returned[ this.OVERLOADING ];

                        }

                        item[ this.REGISTER_SETTER ] = function() {

                            if (item[ this.OVERLOADING ] !== undefined) {
                                this.ENV[ COMPILER.ERROR ]("Indirect modification of overloaded element of " + item[ this.OVERLOADING ] + " has no effect", PHP.Constants.E_CORE_NOTICE, true );
                                item[ this.OVERLOADED ] = item[ this.OVERLOADING ];
                            //   item[ this.OVERLOADED ] = returned[ this.OVERLOADING ];
                            }
                        }
                     */
                        return item;
                    }

                }

                if (this[this.TYPE] === this.INT) {
                    this.ENV[COMPILER.ERROR]("Cannot use a scalar value as an array", PHP.Constants.E_WARNING, true);
                    return new PHP.VM.Variable();
                } else if (this[this.TYPE] === this.STRING) {
                    if (variable[this.TYPE] !== this.INT) {
                        this.ENV[COMPILER.ERROR]("Illegal string offset '" + variable[COMPILER.VARIABLE_VALUE] + "'", PHP.Constants.E_WARNING, true);
                        return new PHP.VM.Variable(this[COMPILER.VARIABLE_VALUE]);
                    } else {
                        var ret = new PHP.VM.Variable(this[COMPILER.VARIABLE_VALUE].substr(variable[COMPILER.VARIABLE_VALUE], 1));

                        ret[this.REGISTER_SETTER] = function (value) {
                            this[COMPILER.VARIABLE_VALUE] = this[COMPILER.VARIABLE_VALUE].substr(0, variable[COMPILER.VARIABLE_VALUE]) + value + this[COMPILER.VARIABLE_VALUE].substr(1 + variable[COMPILER.VARIABLE_VALUE]);
                        }.bind(this);

                        return ret;
                    }
                }


                if (this[this.REFERRING] !== undefined) {
                    $this = this[this.REFERRING];
                }



                if ($this[this.TYPE] !== this.ARRAY) {
                    if ($this[this.TYPE] === this.OBJECT && value[PHP.VM.Class.INTERFACES].indexOf("ArrayAccess") !== -1) {

                        var dimHandler = new PHP.VM.Variable();
                        dimHandler[this.REGISTER_GETTER] = function () {
                            var val = value[COMPILER.METHOD_CALL](ctx, COMPILER.ARRAY_GET, variable);
                            val[$this.OVERLOADING] = value[COMPILER.CLASS_NAME];
                            if (val[this.DEFINED] !== true) {
                                this.ENV[COMPILER.ERROR]("Undefined " + (variable[this.TYPE] === this.INT ? "offset" : "index") + ": " + variable[COMPILER.VARIABLE_VALUE], PHP.Constants.E_CORE_NOTICE, true);
                                return new PHP.VM.Variable();
                            }

                            if (val[this.TYPE] === this.ARRAY) {

                                val[COMPILER.VARIABLE_VALUE][this.REGISTER_ARRAY_SETTER] = function () {

                                    this.ENV[COMPILER.ERROR]("Indirect modification of overloaded element of " + value[COMPILER.CLASS_NAME] + " has no effect", PHP.Constants.E_CORE_NOTICE, true);
                                    return false;
                                }.bind(val);
                            }

                            return val;
                        };

                        dimHandler[this.REGISTER_SETTER] = function (val) {

                            if (val === null) {
                                this.ENV[COMPILER.ERROR]("Indirect modification of overloaded element of " + value[COMPILER.CLASS_NAME] + " has no effect", PHP.Constants.E_CORE_NOTICE, true);
                            }


                            var val = value[COMPILER.METHOD_CALL](ctx, COMPILER.ARRAY_SET, variable, val);

                            if (val[this.DEFINED] !== true) {
                                this.ENV[COMPILER.ERROR]("Undefined " + (variable[this.TYPE] === this.INT ? "offset" : "index") + ": " + variable[COMPILER.VARIABLE_VALUE], PHP.Constants.E_CORE_NOTICE, true);
                                return new PHP.VM.Variable();
                            }
                            return val;
                        };

                        dimHandler[COMPILER.POST_INC] = function () {
                            var val = value[COMPILER.METHOD_CALL](ctx, COMPILER.ARRAY_GET, variable); // trigger get
                            this.ENV[COMPILER.ERROR]("Indirect modification of overloaded element of " + value[COMPILER.CLASS_NAME] + " has no effect", PHP.Constants.E_CORE_NOTICE, true);
                            return val;
                        };

                        dimHandler[this.REF] = function () {
                            this.ENV[PHP.Compiler.prototype.ERROR]("Cannot assign by reference to overloaded object", PHP.Constants.E_ERROR, true);
                        };

                        return dimHandler;
                    } else {

                        var notdefined = false;

                        // cache DEFINED value
                        if ($this[this.DEFINED] !== true && $this[COMPILER.SUPPRESS] !== true) {
                            notdefined = $this[this.DEFINED];
                        }

                        $this[COMPILER.VARIABLE_VALUE] = this.ENV.array([]);
                        if (notdefined !== false) {
                            $this[this.DEFINED] = notdefined;
                        }
                    }
                }

                var returning;
                if (value === null) {
                    returning = this[COMPILER.VARIABLE_VALUE][COMPILER.METHOD_CALL](ctx, COMPILER.ARRAY_GET, variable);
                } else {
                    returning = value[COMPILER.METHOD_CALL](ctx, COMPILER.ARRAY_GET, variable);
                }

                if (returning[this.DEFINED] !== true) {
                    var saveFunc = returning[this.REGISTER_SETTER],
                        arrThis = this;


                    returning[this.REGISTER_SETTER] = function (val) {
                        arrThis[this.DEFINED] = true;
                        if (saveFunc !== undefined) {
                            saveFunc(val);
                        }
                    };

                    if (this[this.DEFINED] !== true) {
                        returning[this.DEFINED] = this[this.DEFINED];
                    }

                    //
                }

                return returning

            };
        },
        set: setValue
    });


    return this;

};

PHP.VM.Variable.prototype = new PHP.VM.VariableProto();

PHP.VM.Variable.prototype.NAME = "$Name";

PHP.VM.Variable.prototype.DEFINED = "$Defined";

PHP.VM.Variable.prototype.CAST_INT = "$Int";

PHP.VM.Variable.prototype.CAST_DOUBLE = "$Double";

PHP.VM.Variable.prototype.CAST_BOOL = "$Bool";

PHP.VM.Variable.prototype.CAST_STRING = "$String";

PHP.VM.Variable.prototype.NULL = 0;
PHP.VM.Variable.prototype.BOOL = 1;
PHP.VM.Variable.prototype.INT = 2;
PHP.VM.Variable.prototype.FLOAT = 3;
PHP.VM.Variable.prototype.STRING = 4;
PHP.VM.Variable.prototype.ARRAY = 5;
PHP.VM.Variable.prototype.OBJECT = 6;
PHP.VM.Variable.prototype.RESOURCE = 7;
PHP.VM.Variable.prototype.LAMBDA = 8;

// variable types
PHP.VM.Variable.prototype.FUNCTION = 0;

PHP.VM.Variable.prototype.NEW_VARIABLE = 1;

PHP.VM.Variable.prototype.OVERLOADING = "$Overloading";

PHP.VM.Variable.prototype.OVERLOADED = "$Overloaded";

PHP.VM.Variable.prototype.TYPE = "type";

PHP.VM.Variable.prototype.VARIABLE_TYPE = "vtype";

PHP.VM.Variable.prototype.PROPERTY = "$Property";

PHP.VM.Variable.prototype.CONSTANT = "$Constant";

PHP.VM.Variable.prototype.CLASS_CONSTANT = "$ClassConstant";

PHP.VM.Variable.prototype.REF = "$Ref";

PHP.VM.Variable.prototype.IS_REF = "$IsRef";

PHP.VM.Variable.prototype.REFERRING = "$Referring";

PHP.VM.Variable.prototype.REGISTER_SETTER = "$Setter";

PHP.VM.Variable.prototype.REGISTER_ARRAY_SETTER = "$ASetter";

PHP.VM.Variable.prototype.REGISTER_GETTER = "$Getter";

PHP.VM.Variable.prototype.INSTANCE = "$Instance";
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 27.6.2012 
 * @website http://hertzen.com
 */

PHP.VM.Array = function (ENV) {

    var COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        ARRAY = PHP.VM.Array.prototype,
        CLASS = PHP.VM.Class,
        $this = this;

    ENV.$Class.New("ArrayObject", 0, {}, function (M) {

        // internal storage for keys/values
        M[COMPILER.CLASS_PROPERTY]($this.KEYS, PHP.VM.Class.PRIVATE, [])[COMPILER.CLASS_PROPERTY]($this.VALUES, PHP.VM.Class.PRIVATE, [])

        // internal key of largest previously used (int) key
        [COMPILER.CLASS_PROPERTY]($this.INTKEY, PHP.VM.Class.PRIVATE, -1)


        // internal pointer
        [COMPILER.CLASS_PROPERTY]($this.POINTER, PHP.VM.Class.PRIVATE, 0)

        /*
         * __construct method
         */
        [COMPILER.CLASS_METHOD]("__construct", PHP.VM.Class.PUBLIC, [{
            "name": "input"
        }], false, function ($) {
            this[COMPILER.CLASS_NAME] = $this.CLASS_NAME;

            var items = $('input')[COMPILER.VARIABLE_VALUE];


            if (Array.isArray(items)) {

                items.forEach(function (item) {

                    // this.$Prop( this, $this.VALUES ).$.push( item[ COMPILER.ARRAY_VALUE ] );
                    if (item[COMPILER.ARRAY_VALUE][VARIABLE.CLASS_CONSTANT] !== true && item[COMPILER.ARRAY_VALUE][VARIABLE.CONSTANT] !== true) {
                        this.$Prop(this, $this.VALUES)[COMPILER.VARIABLE_VALUE].push(new PHP.VM.Variable(item[COMPILER.ARRAY_VALUE][COMPILER.VARIABLE_VALUE]));
                    } else {
                        this.$Prop(this, $this.VALUES)[COMPILER.VARIABLE_VALUE].push(item[COMPILER.ARRAY_VALUE]);
                    }


                    if (item[COMPILER.ARRAY_KEY] !== undefined) {
                        if (!item[COMPILER.ARRAY_KEY] instanceof PHP.VM.Variable || (item[COMPILER.ARRAY_KEY][VARIABLE.CLASS_CONSTANT] !== true && item[COMPILER.ARRAY_KEY][VARIABLE.CONSTANT] !== true)) {
                            var key = (item[COMPILER.ARRAY_KEY] instanceof PHP.VM.Variable) ? item[COMPILER.ARRAY_KEY][COMPILER.VARIABLE_VALUE] : item[COMPILER.ARRAY_KEY];
                            if (key === true || key === false) {
                                key = (key === true) ? 1 : 0;
                            }
                            if (/^\d+$/.test(key)) {
                                // integer key

                                this.$Prop(this, $this.KEYS)[COMPILER.VARIABLE_VALUE].push(key);

                                // todo complete
                                this.$Prop(this, $this.INTKEY)[COMPILER.VARIABLE_VALUE] = Math.max(this.$Prop(this, $this.INTKEY)[COMPILER.VARIABLE_VALUE], key);
                            } else {
                                // custom text key
                                this.$Prop(this, $this.KEYS)[COMPILER.VARIABLE_VALUE].push(key);
                            }
                        } else {
                            // class constant as key

                            this.$Prop(this, $this.KEYS)[COMPILER.VARIABLE_VALUE].push(item[COMPILER.ARRAY_KEY]);

                        }
                    } else {
                        this.$Prop(this, $this.KEYS)[COMPILER.VARIABLE_VALUE].push(++this.$Prop(this, $this.INTKEY)[COMPILER.VARIABLE_VALUE]);
                    }



                }, this);
            }



        })
        /*
         * append
         */
        [COMPILER.CLASS_METHOD]("append", PHP.VM.Class.PUBLIC, [{
            "name": "value"
        }], false, function ($) {


            var append = function (item) {

                if (item[VARIABLE.CLASS_CONSTANT] !== true && item[VARIABLE.CONSTANT] !== true) {
                    this.$Prop(this, $this.VALUES)[COMPILER.VARIABLE_VALUE].push(new PHP.VM.Variable(item[COMPILER.VARIABLE_VALUE]));
                } else {
                    this.$Prop(this, $this.VALUES)[COMPILER.VARIABLE_VALUE].push(item[COMPILER.ARRAY_VALUE]);
                }


                this.$Prop(this, $this.KEYS)[COMPILER.VARIABLE_VALUE].push(++this.$Prop(this, $this.INTKEY)[COMPILER.VARIABLE_VALUE]);

            }.bind(this);

            var value = $("value");

            if (value[VARIABLE.TYPE] === VARIABLE.STRING) {
                append($("value"));
            }




        })

        /*
         * Custom $clone method, shouldn't be triggerable by php manually
         */
        [COMPILER.CLASS_METHOD](COMPILER.ARRAY_CLONE, PHP.VM.Class.PUBLIC, [{
            "name": "index"
        }], false, function ($) {
            var newArr = new(ENV.$Class.Get("ArrayObject"))(ENV);


            // copy keys, can do direct copy ( probably? ) 
            var keys = newArr[PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.KEYS][COMPILER.VARIABLE_VALUE];
            this[PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.KEYS][COMPILER.VARIABLE_VALUE].forEach(function (key) {
                keys.push(key);
            });

            // copy values, need to do deep clone
            var values = newArr[PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.VALUES][COMPILER.VARIABLE_VALUE];
            this[PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.VALUES][COMPILER.VARIABLE_VALUE].forEach(function (valueObj) {

                values.push(valueObj[COMPILER.VARIABLE_CLONE]());

            });

            // reset pointers
            this[PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.POINTER][COMPILER.VARIABLE_VALUE] = 0;

            // copy key index
            newArr[PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.INTKEY][COMPILER.VARIABLE_VALUE] = this[PHP.VM.Class.PROPERTY + PHP.VM.Array.prototype.INTKEY][COMPILER.VARIABLE_VALUE];
            return newArr;


        })

        /*
         * offsetUnset method
         */
        [COMPILER.CLASS_METHOD]("offsetUnset", PHP.VM.Class.PUBLIC, [{
            "name": "index"
        }], false, function ($) {

            var value = $('index')[COMPILER.VARIABLE_VALUE];
            var keys = this.$Prop(this, $this.KEYS)[COMPILER.VARIABLE_VALUE],
                removeIndex = keys.indexOf(value);

            if (removeIndex !== -1) {
                keys.splice(removeIndex, 1);
                this.$Prop(this, $this.VALUES)[COMPILER.VARIABLE_VALUE].splice(removeIndex, 1);
            }

            if (removeIndex <= this[CLASS.PROPERTY + ARRAY.POINTER][COMPILER.VARIABLE_VALUE]) {
                this[CLASS.PROPERTY + ARRAY.POINTER][COMPILER.VARIABLE_VALUE]--;
            }




        })
        // remap keys
        [COMPILER.CLASS_METHOD]("remap", PHP.VM.Class.PRIVATE, [], false, function ($) {

            this[CLASS.PROPERTY + ARRAY.KEYS][COMPILER.VARIABLE_VALUE].forEach(function (key, index) {
                // todo take into account other type of keys
                if (typeof key === "number" && key % 1 === 0) {

                    this[CLASS.PROPERTY + ARRAY.KEYS][COMPILER.VARIABLE_VALUE][index]--;
                }
            }, this);

        })

        /*
         * offsetGet method
         */
        [COMPILER.CLASS_METHOD](COMPILER.ARRAY_GET, PHP.VM.Class.PUBLIC, [{
            "name": "index"
        }], false, function ($) {

            var index = -1,
                value = $('index')[COMPILER.VARIABLE_VALUE];

            this.$Prop(this, $this.KEYS)[COMPILER.VARIABLE_VALUE].some(function (item, i) {

                if (item instanceof PHP.VM.Variable) {
                    item = item[COMPILER.VARIABLE_VALUE];
                }



                if (item === value) {
                    index = i;
                    return true;
                }

                return false;
            });

            if (index !== -1) {
                var item = this.$Prop(this, $this.VALUES)[COMPILER.VARIABLE_VALUE][index];
                if (this[VARIABLE.REGISTER_ARRAY_SETTER] !== undefined) {
                    var func = this[VARIABLE.REGISTER_ARRAY_SETTER];
                    item[VARIABLE.REGISTER_SETTER] = function (val) {
                        return func(val);
                    };
                }
                return item;
            } else {
                // no such key found in array, let's create one
                //    

                var variable = new PHP.VM.Variable();

                variable[VARIABLE.REGISTER_SETTER] = function () {
                    // the value was actually defined, let's register item into array

                    var key = ++this.$Prop(this, $this.INTKEY)[COMPILER.VARIABLE_VALUE];

                    this.$Prop(this, $this.KEYS)[COMPILER.VARIABLE_VALUE].push(($('index')[COMPILER.VARIABLE_VALUE] !== null) ? $('index')[COMPILER.VARIABLE_VALUE] : key);
                    this.$Prop(this, $this.VALUES)[COMPILER.VARIABLE_VALUE].push(variable);
                    delete variable[VARIABLE.REGISTER_SETTER];
                }.bind(this);
                variable[VARIABLE.DEFINED] = false;
                return variable;

            }


        })

        .Create();

    });

    /*
 Convert JavaScript array/object into a PHP array 
     */

    PHP.VM.Array.arrayItem = function (key, value) {
        var obj = {};

        obj[COMPILER.ARRAY_KEY] = (key instanceof PHP.VM.Variable) ? key : new PHP.VM.Variable(key);
        obj[COMPILER.ARRAY_VALUE] = (value instanceof PHP.VM.Variable) ? value : new PHP.VM.Variable(value);
        return obj;
    };


    PHP.VM.Array.fromObject = function (items, depth) {
        var COMPILER = PHP.Compiler.prototype,
            arr = [],
            obj,
            depth = (depth === undefined) ? 0 : depth,

            addItem = function (value, key) {
                obj = {};

                obj[PHP.Compiler.prototype.ARRAY_KEY] = (/^\d+$/.test(key)) ? key - 0 : key; // use int for int

                if (value instanceof PHP.VM.Variable) {
                    obj[PHP.Compiler.prototype.ARRAY_VALUE] = value;
                } else if (typeof value === "object" && value !== null) {
                    if (depth >= this.$ini.max_input_nesting_level) {
                        throw Error;
                    } else {
                        obj[PHP.Compiler.prototype.ARRAY_VALUE] = PHP.VM.Array.fromObject.call(this, value, depth + 1);
                    }
                } else {
                    obj[PHP.Compiler.prototype.ARRAY_VALUE] = new PHP.VM.Variable(value);
                }
                arr.push(obj);

            }.bind(this);


        var $this = this;
        if (Array.isArray(items)) {
            items.forEach(addItem);
        } else {
            Object.keys(items).forEach(function (key) {
                try {
                    addItem(items[key], key);
                } catch (e) {
                    // error all the way down the array
                    if (depth !== 0) {
                        throw Error;
                    } else if ($this.$ini.track_errors == 1) {
                        $this[COMPILER.GLOBAL]("php_errormsg")[COMPILER.VARIABLE_VALUE] = "Unknown: Input variable nesting level exceeded " + $this.$ini.max_input_nesting_level + ". To increase the limit change max_input_nesting_level in php.ini.";
                    }


                }
            }), this;
        }


        var arr = this.array(arr);


        return arr;


    };
};

PHP.VM.Array.prototype.KEYS = "keys";
PHP.VM.Array.prototype.VALUES = "values";

PHP.VM.Array.prototype.INTKEY = "intkey";

PHP.VM.Array.prototype.POINTER = "pointer";

PHP.VM.Array.prototype.CLASS_NAME = "array";
PHP.VM.ResourceManager = function () {
    var resources = [],
        RESOURCE = PHP.VM.ResourceManager.prototype,
        id = 0,
        methods = {};

    methods[RESOURCE.REGISTER] = function () {
        var resource = new PHP.VM.Resource(id++);
        resources.push(resource);
        return resource;
    };

    return methods;
};

PHP.VM.ResourceManager.prototype.ID = "$Id";

PHP.VM.ResourceManager.prototype.REGISTER = "$Register";

PHP.VM.Resource = function (id) {
    this[PHP.VM.ResourceManager.prototype.ID] = id;
};
PHP.VM.Constants = function (predefined, ENV) {

    var constants = {},
        constantVariables = {},
        COMPILER = PHP.Compiler.prototype,
        VARIABLE = PHP.VM.Variable.prototype,
        methods = {};

    Object.keys(predefined).forEach(function (key) {

        constants[key] = predefined[key];
    }, this);

    methods[COMPILER.CONSTANT_GET] = function (constantName) {

        var variable = new PHP.VM.Variable(constants[constantName]);

        if (constants[constantName] === undefined) {

            if (constantVariables[constantName] === undefined) {
                constantVariables[constantName] = variable;
            } else {
                return constantVariables[constantName];
            }
            variable[VARIABLE.DEFINED] = constantName;
            variable[VARIABLE.CONSTANT] = true;
        }
        return variable;
    };

    methods[COMPILER.CONSTANT_DEFINED] = function (constantName) {
        return (constants[constantName] === undefined);
    };

    methods[COMPILER.CONSTANT_SET] = function (constantName, constantValue) {

        if (constantVariables[constantName] !== undefined) {
            constantVariables[constantName][COMPILER.VARIABLE_VALUE] = constantValue;
        }
        constants[constantName] = constantValue;
    };

    return methods;

};

// manually defined constants

PHP.Constants.PHP_BINARY = "/bin/php";
/* automatically built from DateTime.php*/
PHP.VM.Class.Predefined.DateTime = function (ENV, $$) {
    ENV.$Class.New("DateTime", 0, {}, function (M, $, $$) {
        M.Constant("ATOM", $$("Y-m-d\\TH:i:sP"))
            .Constant("COOKIE", $$("l, d-M-y H:i:s T"))
            .Constant("ISO8601", $$("Y-m-d\\TH:i:sO"))
            .Constant("RFC822", $$("D, d M y H:i:s O"))
            .Constant("RFC850", $$("l, d-M-y H:i:s T"))
            .Constant("RFC1036", $$("D, d M y H:i:s O"))
            .Constant("RFC1123", $$("D, d M Y H:i:s O"))
            .Constant("RFC2822", $$("D, d M Y H:i:s O"))
            .Constant("RFC3339", $$("Y-m-d\\TH:i:sP"))
            .Constant("RSS", $$("D, d M Y H:i:s O"))
            .Constant("W3C", $$("Y-m-d\\TH:i:sP"))
            .Method("__construct", 1, [{
                name: "time",
                d: $$("now")
            }, {
                name: "timezone",
                d: $$(null),
                p: "DateTimeZone"
            }], false, function ($, ctx, $Static) {})
            .Method("add", 1, [{
                name: "interval",
                p: "DateInterval"
            }], false, function ($, ctx, $Static) {})
            .Method("createFromFormat", 9, [{
                name: "format",
                p: "string"
            }, {
                name: "time",
                p: "string"
            }, {
                name: "timezone",
                p: "DateTimeZone"
            }], false, function ($, ctx, $Static) {})
            .Method("diff", 1, [{
                name: "datetime2",
                p: "DateTime"
            }, {
                name: "absolute",
                d: $$(false)
            }], false, function ($, ctx, $Static) {})
            .Method("format", 1, [{
                name: "format"
            }], false, function ($, ctx, $Static) {})
            .Method("getLastErrors", 9, [], false, function ($, ctx, $Static) {})
            .Method("getOffset", 1, [], false, function ($, ctx, $Static) {})
            .Method("getTimestamp", 1, [], false, function ($, ctx, $Static) {})
            .Method("getTimezone", 1, [], false, function ($, ctx, $Static) {})
            .Method("modify", 1, [{
                name: "modify"
            }], false, function ($, ctx, $Static) {})
            .Method("__set_state", 9, [{
                name: "array",
                p: "array"
            }], false, function ($, ctx, $Static) {})
            .Method("setDate", 1, [{
                name: "year"
            }, {
                name: "month"
            }, {
                name: "day"
            }], false, function ($, ctx, $Static) {})
            .Method("setISODate", 1, [{
                name: "year"
            }, {
                name: "week"
            }, {
                name: "day",
                d: $$(1)
            }], false, function ($, ctx, $Static) {})
            .Method("setTime", 1, [{
                name: "hour"
            }, {
                name: "minute"
            }, {
                name: "second",
                d: $$(0)
            }], false, function ($, ctx, $Static) {})
            .Method("setTimestamp", 1, [{
                name: "unixtimestamp"
            }], false, function ($, ctx, $Static) {})
            .Method("setTimezone", 1, [{
                name: "timezone",
                p: "DateTimeZone"
            }], false, function ($, ctx, $Static) {})
            .Method("sub", 1, [{
                name: "interval",
                p: "DateInterval"
            }], false, function ($, ctx, $Static) {})
            .Method("__wakeup", 1, [], false, function ($, ctx, $Static) {})
            .Create()
    });

    ENV.$Class.Get("DateTime").prototype.Native = true;
};
/* automatically built from Exception.php*/
PHP.VM.Class.Predefined.Exception = function (ENV, $$) {
    ENV.$Class.New("Exception", 0, {}, function (M, $, $$) {
        M.Variable("message", 2)
            .Variable("code", 2)
            .Variable("file", 2)
            .Variable("line", 2)
            .Method("__construct", 1, [{
                name: "message",
                d: $$("")
            }, {
                name: "code",
                d: $$(0)
            }, {
                name: "previous",
                d: $$(null)
            }], false, function ($, ctx, $Static) {
                $("this").$Prop(ctx, "message")._($("message"));
                $("this").$Prop(ctx, "line")._($$(1));
            })
            .Method("getMessage", 33, [], false, function ($, ctx, $Static) {
                return $("this").$Prop(ctx, "message");
            })
            .Method("getPrevious", 33, [], false, function ($, ctx, $Static) {})
            .Method("getCode", 33, [], false, function ($, ctx, $Static) {})
            .Method("getFile", 33, [], false, function ($, ctx, $Static) {})
            .Method("getLine", 33, [], false, function ($, ctx, $Static) {
                return $("this").$Prop(ctx, "line");
            })
            .Method("getTrace", 33, [], false, function ($, ctx, $Static) {
                return ENV.array([{
                    v: ENV.array([{
                        v: $$("Error2Exception"),
                        k: $$("function")
                    }]),
                    k: undefined
                }, {
                    v: ENV.array([{
                        v: $$("fopen"),
                        k: $$("function")
                    }]),
                    k: undefined
                }]);
            })
            .Method("getTraceAsString", 33, [], false, function ($, ctx, $Static) {})
            .Method("__toString", 1, [], false, function ($, ctx, $Static) {})
            .Method("__clone", 36, [], false, function ($, ctx, $Static) {})
            .Create()
    });

    ENV.$Class.Get("DateTime").prototype.Native = true;
};
/* automatically built from ReflectionClass.php*/
PHP.VM.Class.Predefined.ReflectionClass = function (ENV, $$) {
    ENV.$Class.New("ReflectionClass", 0, {}, function (M, $, $$) {
        M.Constant("IS_IMPLICIT_ABSTRACT", $$(16))
            .Constant("IS_EXPLICIT_ABSTRACT", $$(32))
            .Constant("IS_FINAL", $$(64))
            .Variable("name", 1)
            .Variable("class", 4)
            .Method("__construct", 1, [{
                name: "argument"
            }], false, function ($, ctx, $Static) {
                if (((ENV.$F("is_string", arguments, $("argument")))).$Bool.$) {
                    if (($$(!(ENV.$F("class_exists", arguments, $("argument"))).$Bool.$)).$Bool.$) {
                        throw $$(new(ENV.$Class.Get("ReflectionException"))(this, $$("Class ").$Concat($("argument")).$Concat($$(" does not exist "))));
                    } else {
                        $("this").$Prop(ctx, "name")._($("argument"));
                    };
                };
            })
            .Method("getMethods", 1, [], false, function ($, ctx, $Static) {
                $("methods")._((ENV.$F("get_class_methods", arguments, $("this").$Prop(ctx, "name", true))));
                $("arr")._(ENV.array([]));
                var iterator1 = ENV.$foreachInit($("methods"), ctx);
                while (ENV.foreach(iterator1, false, $("methodName"))) {
                    $("parent")._((ENV.$F("get_parent_class", arguments, $("this").$Prop(ctx, "name", true))));
                    if (((ENV.$F("method_exists", arguments, $("parent"), $("methodName")))).$Bool.$) {
                        $("arr").$Dim(this, undefined)._($$(new(ENV.$Class.Get("ReflectionMethod"))(this, $("parent"), $("methodName"))));
                    } else {
                        $("arr").$Dim(this, undefined)._($$(new(ENV.$Class.Get("ReflectionMethod"))(this, $("this").$Prop(ctx, "name", true), $("methodName"))));
                    };
                }
                ENV.$foreachEnd(iterator1);
                return $("arr");
            })
            .Method("getProperty", 1, [{
                name: "name"
            }], false, function ($, ctx, $Static) {
                $("parts")._((ENV.$F("explode", arguments, $$("::"), $("name"))));
                if (((ENV.$F("count", arguments, $("parts"))).$Greater($$(1))).$Bool.$) {
                    $$(new(ENV.$Class.Get("ReflectionMethod"))(this, $("parts").$Dim(this, $$(0)), $("parts").$Dim(this, $$(1))));
                };
            })
            .Method("implementsInterface", 1, [{
                name: "interface"
            }], false, function ($, ctx, $Static) {
                if (($$(!(ENV.$F("interface_exists", arguments, $("interface"))).$Bool.$)).$Bool.$) {
                    throw $$(new(ENV.$Class.Get("ReflectionException"))(this, $$("Interface ").$Concat($("interface")).$Concat($$(" does not exist "))));
                };
            })
            .Method("export", 9, [{
                name: "argument"
            }, {
                name: "return",
                d: $$(false)
            }], false, function ($, ctx, $Static) {})
            .Method("__toString", 1, [], false, function ($, ctx, $Static) {})
            .Create()
    });

    ENV.$Class.Get("DateTime").prototype.Native = true;
};
/* automatically built from ReflectionException.php*/
PHP.VM.Class.Predefined.ReflectionException = function (ENV, $$) {
    ENV.$Class.New("ReflectionException", 0, {
        Extends: "Exception"
    }, function (M, $, $$) {
        M.Create()
    });

    ENV.$Class.Get("DateTime").prototype.Native = true;
};
/* automatically built from ReflectionMethod.php*/
PHP.VM.Class.Predefined.ReflectionMethod = function (ENV, $$) {
    ENV.$Class.New("ReflectionMethod", 0, {}, function (M, $, $$) {
        M.Constant("IS_IMPLICIT_ABSTRACT", $$(16))
            .Constant("IS_EXPLICIT_ABSTRACT", $$(32))
            .Constant("IS_FINAL", $$(64))
            .Variable("name", 1)
            .Variable("class", 1)
            .Method("__construct", 1, [{
                name: "class"
            }, {
                name: "name",
                d: $$(null)
            }], false, function ($, ctx, $Static) {
                $("parts")._((ENV.$F("explode", arguments, $$("::"), $("class"))));
                if (((ENV.$F("count", arguments, $("parts"))).$Greater($$(1))).$Bool.$) {
                    $("class")._($("parts").$Dim(this, $$(0)));
                    $("name")._($("parts").$Dim(this, $$(1)));
                };
                if (($$(!(ENV.$F("class_exists", arguments, $("class"))).$Bool.$)).$Bool.$) {
                    throw $$(new(ENV.$Class.Get("ReflectionException"))(this, $$("Class ").$Concat($("class")).$Concat($$(" does not exist "))));
                };
                $("this").$Prop(ctx, "name")._($("name"));
                $("this").$Prop(ctx, "class")._($("class"));
            })
            .Method("export", 9, [{
                name: "argument"
            }, {
                name: "return",
                d: $$(false)
            }], false, function ($, ctx, $Static) {})
            .Method("__toString", 1, [], false, function ($, ctx, $Static) {})
            .Create()
    });

    ENV.$Class.Get("DateTime").prototype.Native = true;
};
/* automatically built from ReflectionProperty.php*/
PHP.VM.Class.Predefined.ReflectionProperty = function (ENV, $$) {
    ENV.$Class.New("ReflectionProperty", 0, {}, function (M, $, $$) {
        M.Constant("IS_STATIC", $$(1))
            .Constant("IS_PUBLIC", $$(256))
            .Constant("IS_PROTECTED", $$(512))
            .Constant("IS_PRIVATE", $$(1024))
            .Variable("name", 1)
            .Variable("class", 1)
            .Method("__construct", 1, [{
                name: "class"
            }, {
                name: "name",
                d: $$(null)
            }], false, function ($, ctx, $Static) {
                if (($$(!(ENV.$F("class_exists", arguments, $("class"))).$Bool.$)).$Bool.$) {
                    throw $$(new(ENV.$Class.Get("ReflectionException"))(this, $$("Class ").$Concat($("class")).$Concat($$(" does not exist "))));
                };
            })
            .Method("export", 9, [{
                name: "argument"
            }, {
                name: "return",
                d: $$(false)
            }], false, function ($, ctx, $Static) {})
            .Method("__toString", 1, [], false, function ($, ctx, $Static) {})
            .Create()
    });

    ENV.$Class.Get("DateTime").prototype.Native = true;
};
/* automatically built from __PHP_Incomplete_Class.php*/
PHP.VM.Class.Predefined.__PHP_Incomplete_Class = function (ENV, $$) {
    ENV.$Class.New("__PHP_Incomplete_Class", 0, {}, function (M, $, $$) {
        M.Variable("__PHP_Incomplete_Class_Name", 1)
            .Method("__construct", 1, [{
                name: "name"
            }], false, function ($, ctx, $Static) {
                $("this").$Prop(ctx, "__PHP_Incomplete_Class_Name")._($("name"));
            })
            .Create()
    });

    ENV.$Class.Get("DateTime").prototype.Native = true;
};
/* automatically built from stdClass.php*/
PHP.VM.Class.Predefined.stdClass = function (ENV, $$) {
    ENV.$Class.New("stdClass", 0, {}, function (M, $, $$) {
        M.Create()
    });

    ENV.$Class.Get("DateTime").prototype.Native = true;
};
/* automatically built from Traversable.php*/
PHP.VM.Class.Predefined.Traversable = function (ENV, $$) {
    ENV.$Class.INew("Traversable", [], function (M, $, $$) {
        M.Create()
    });

    ENV.$Class.Get("DateTime").prototype.Native = true;
};
/* automatically built from ArrayAccess.php*/
PHP.VM.Class.Predefined.ArrayAccess = function (ENV, $$) {
    ENV.$Class.INew("ArrayAccess", [], function (M, $, $$) {
        M.Method("offsetExists", 1, [{
                name: "offset"
            }], false, function ($, ctx, $Static) {})
            .Method("offsetGet", 1, [{
                name: "offset"
            }], false, function ($, ctx, $Static) {})
            .Method("offsetSet", 1, [{
                name: "offset"
            }, {
                name: "value"
            }], false, function ($, ctx, $Static) {})
            .Method("offsetUnset", 1, [{
                name: "offset"
            }], false, function ($, ctx, $Static) {})
            .Create()
    });

    ENV.$Class.Get("DateTime").prototype.Native = true;
};
/* automatically built from Iterator.php*/
PHP.VM.Class.Predefined.Iterator = function (ENV, $$) {
    ENV.$Class.INew("Iterator", ["Traversable"], function (M, $, $$) {
        M.Method("current", 1, [], false, function ($, ctx, $Static) {})
            .Method("key", 1, [], false, function ($, ctx, $Static) {})
            .Method("next", 1, [], false, function ($, ctx, $Static) {})
            .Method("rewind", 1, [], false, function ($, ctx, $Static) {})
            .Method("valid", 1, [], false, function ($, ctx, $Static) {})
            .Create()
    });

    ENV.$Class.Get("DateTime").prototype.Native = true;
};
/* automatically built from IteratorAggregate.php*/
PHP.VM.Class.Predefined.IteratorAggregate = function (ENV, $$) {
    ENV.$Class.INew("IteratorAggregate", ["Traversable"], function (M, $, $$) {
        M.Method("getIterator", 17, [], false, function ($, ctx, $Static) {})
            .Create()
    });

    ENV.$Class.Get("DateTime").prototype.Native = true;
};
/* automatically built from Reflector.php*/
PHP.VM.Class.Predefined.Reflector = function (ENV, $$) {
    ENV.$Class.INew("Reflector", [], function (M, $, $$) {
        M.Method("export", 25, [], false, function ($, ctx, $Static) {})
            .Method("__toString", 17, [], false, function ($, ctx, $Static) {})
            .Create()
    });

    ENV.$Class.Get("DateTime").prototype.Native = true;
};
/* automatically built from Serializable.php*/
PHP.VM.Class.Predefined.Serializable = function (ENV, $$) {
    ENV.$Class.INew("Serializable", [], function (M, $, $$) {
        M.Method("serialize", 17, [], false, function ($, ctx, $Static) {})
            .Method("unserialize", 17, [{
                name: "serialized"
            }], false, function ($, ctx, $Static) {})
            .Create()
    });

    ENV.$Class.Get("DateTime").prototype.Native = true;
};
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 3.7.2012 
 * @website http://hertzen.com
 */


PHP.Adapters.XHRFileSystem = function () {
    /*
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB,
    request = indexedDB.open("filesystem"),
    $this = this;

    request.onsuccess = function(e) {

        $this.db = e.target.result;
  
    };
    
    request.onupgradeneeded = function( e ) {
      
        $this.db.createObjectStore( $this.FILES,
        {
            keyPath: "filename"
        });
        
    };

    request.onfailure = this.error;
    */


};

PHP.Adapters.XHRFileSystem.prototype.lstatSync = function (filename) {

    if (localStorage[filename] === undefined) {
        throw Error;
    } else {
        return true;
    }

}

PHP.Adapters.XHRFileSystem.prototype.error = function (e) {
    this.db = false;
    console.log(e);
    throw e;
}

PHP.Adapters.XHRFileSystem.prototype.writeFileSync = function (filename, data) {


    localStorage[filename] = data;

    /*
        if ( this.db === false ) {
            return;
        }
        console.log( this.db );
        var db = this.db,
        trans = db.transaction([ this.files ], IDBTransaction.READ_WRITE, 0),
        store = trans.objectStore( this.files );
        
        var request = store.put({
            "filename": filename,
            "content" : data
        });
        
        var processing = true;

        request.onsuccess = function(e) {
            processing = false;
        };

        request.onerror = function(e) {
            processing = false;
            console.log(e.value);
        };
        
        while ( processing ) {}
        
        */


};

PHP.Adapters.XHRFileSystem.prototype.readFileSync = function (filename, xhr) {

    if (xhr === undefined) {

        var xhr = new XMLHttpRequest();

        xhr.open('GET', filename, false); // async set to false!

        var response;
        xhr.onload = function () {
            response = this.responseText;

        };

        xhr.send();

        return response;
    } else {
        if (localStorage[filename] === undefined) {
            throw Error;
        } else {
            return localStorage[filename];
        }
    }


};
PHP.Adapters.XHRFileSystem.prototype.xhr = true;

PHP.Adapters.XHRFileSystem.prototype.version = "1.2";

PHP.Adapters.XHRFileSystem.prototype.FILES = "files";
/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 17.7.2012 
 * @website http://hertzen.com
 */

PHP.Locales = {

    de_DE: {
        decimal_point: ",",
        thousands_sep: "."
    }


};

export default PHP;