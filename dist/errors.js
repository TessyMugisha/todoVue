"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientError = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

/**
 * An error that represents a failure of the user (as opposed to an internal issue)
 */
var ClientError = function ClientError(_ref) {
  var _ref$status = _ref.status,
      status = _ref$status === void 0 ? 400 : _ref$status,
      code = _ref.code,
      message = _ref.message,
      _ref$data = _ref.data,
      data = _ref$data === void 0 ? undefined : _ref$data,
      _ref$headers = _ref.headers,
      headers = _ref$headers === void 0 ? {} : _ref$headers;
  (0, _classCallCheck2.default)(this, ClientError);
  this.status = status;
  this.code = code;
  this.message = message;
  this.data = data;
  this.headers = headers;
};

exports.ClientError = ClientError;