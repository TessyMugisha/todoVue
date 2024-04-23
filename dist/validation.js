"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsonType = jsonType;
exports.jsonValidate = jsonValidate;
exports.parseIntStrict = parseIntStrict;
exports.Optional = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _errors = require("./errors");

/**
 * Wraps a value to make an entry optional
 */
var Optional =
/*#__PURE__*/
function () {
  function Optional(value) {
    (0, _classCallCheck2.default)(this, Optional);
    this.value = value;
  }

  (0, _createClass2.default)(Optional, [{
    key: "toJSON",
    value: function toJSON() {
      return this.value;
    }
  }]);
  return Optional;
}();
/**
 * Returns the json type of a value
 */


exports.Optional = Optional;

function jsonType(value) {
  if (value == null) return "null";
  if (Array.isArray(value)) return "array";
  if ((0, _typeof2.default)(value) === "object") return "object";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "unknown";
}
/**
 * Joins the given strings with a dot, filtering out null and empty strings.
 */


function join() {
  for (var _len = arguments.length, parts = new Array(_len), _key = 0; _key < _len; _key++) {
    parts[_key] = arguments[_key];
  }

  return parts.filter(Boolean).join(".");
}
/**
 * Subtracts everything in arr2 from arr.
 */


function minus(arr, arr2) {
  var set = new Set(arr2);
  return arr.filter(function (ele) {
    return !set.has(ele);
  });
}
/**
 * Validates that the given body matches the expected form. See server.js for examples of usage.
 */


function jsonValidate(actual, expected) {
  var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  if (expected instanceof Optional) {
    if (actual == null || actual === "") return actual;
    expected = expected.value;
  }

  var actualType = jsonType(actual);
  var expectedType = jsonType(expected);

  if (expectedType !== actualType) {
    if (path == null && actual === undefined) {
      throw new _errors.ClientError({
        code: "invalid-body",
        message: "Invalid body. Please set the 'Content-Type' header to 'application/json'."
      });
    } else {
      throw new _errors.ClientError({
        code: "invalid-body",
        message: "Invalid ".concat(path || "body", ". Expected '").concat(expectedType, "' but got '").concat(actualType, "'. See data for an example of the correct format."),
        data: expected
      });
    }
  }

  switch (expectedType) {
    case "string":
      {
        if (actual.length === 0) {
          throw new _errors.ClientError({
            code: "missing-fields",
            message: "Invalid ".concat(path || "body", ". Cannot be empty."),
            data: actual
          });
        }

        break;
      }

    case "array":
      {
        for (var i = 0; i < actual.length; i++) {
          jsonValidate(actual[i], expected[i % expected.length], join(path, i));
        }

        break;
      }

    case "object":
      {
        var actualKeys = Object.keys(actual);
        var expectedKeys = Object.keys(expected);
        var missingKeys = minus(expectedKeys.filter(function (key) {
          return !(expected[key] instanceof Optional);
        }), actualKeys);

        if (missingKeys.length > 0) {
          throw new _errors.ClientError({
            code: "missing-fields",
            message: "Missing required fields in ".concat(path || "body", ". These must be provided. See data for missing fields."),
            data: missingKeys
          });
        }

        var unexpectedKeys = minus(actualKeys, expectedKeys);

        if (unexpectedKeys.length > 0) {
          throw new _errors.ClientError({
            code: "unexpected-fields",
            message: "Unexpected fields in ".concat(path || "body", ". Remove these. See data for unexpected fields."),
            data: unexpectedKeys
          });
        }

        for (var _i = 0; _i < expectedKeys.length; _i++) {
          var key = expectedKeys[_i];
          var actualValue = actual[key];
          var expectedValue = expected[key];
          jsonValidate(actualValue, expectedValue, join(path, key));
        }

        break;
      }
  }

  return actual;
}
/**
 * Parses an integer, returning NaN if it is not a valid number.
 */


function parseIntStrict(x) {
  if (/^([-+])?(\d+|Infinity)$/.test(x)) return Number(x);
  return NaN;
}