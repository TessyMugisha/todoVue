"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.route = route;
exports.authenticate = authenticate;
exports.checkPermissions = checkPermissions;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var database = _interopRequireWildcard(require("./database"));

var _crypto = require("./crypto");

var _errors = require("./errors");

var AuthError =
/*#__PURE__*/
function (_ClientError) {
  (0, _inherits2.default)(AuthError, _ClientError);

  function AuthError(req, obj) {
    (0, _classCallCheck2.default)(this, AuthError);
    var headers = obj.headers || {}; //if it was not an xhr request, tell the browser to prompt for a username/password

    if (!req.xhr) headers["WWW-Authenticate"] = 'Basic charset="UTF-8"';
    obj.headers = headers;
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(AuthError).call(this, obj));
  }

  return AuthError;
}(_errors.ClientError);
/**
 * A helper for creating routes. Automatically handles several things.
 * 1. Getting and releasing a DB connection
 * 2. Async handling
 * 3. Response body stringifying
 */


function route(func) {
  return (
    /*#__PURE__*/
    function () {
      var _ref = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(req, res, next) {
        var conn, body, status;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return database.getConnection();

              case 3:
                conn = _context.sent;
                _context.prev = 4;
                _context.next = 7;
                return func(req, res, conn);

              case 7:
                body = _context.sent;
                if (body == null) body = {};
                status = "status" in body ? body.status : 200;
                delete body.status;
                if (!("success" in body)) body.success = true;
                res.status(status).send(body);

              case 13:
                _context.prev = 13;
                _context.next = 16;
                return database.releaseConnection(conn);

              case 16:
                return _context.finish(13);

              case 17:
                next();
                _context.next = 23;
                break;

              case 20:
                _context.prev = 20;
                _context.t0 = _context["catch"](0);
                next(_context.t0);

              case 23:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 20], [4,, 13, 17]]);
      }));

      return function (_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      };
    }()
  );
}
/**
 * Gets the authentication for this request. Throws an error if there is an authentcation problem.
 * If require is false, makes authentication optional.
 * If require is a string, enforces a specific type of authentication (credentials or token).
 * @return {{type: string, userId: string}}
 */


function authenticate(_x4, _x5) {
  return _authenticate.apply(this, arguments);
}

function _authenticate() {
  _authenticate = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2(req, db) {
    var require,
        auth,
        credentials,
        i,
        username,
        password,
        _ref2,
        _ref3,
        results,
        _results$,
        userId,
        hash,
        salt,
        hash2,
        token,
        _ref4,
        sessionId,
        _ref5,
        _ref6,
        _results,
        _userId,
        _args2 = arguments;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            require = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : true;
            auth = req.get("authorization");

            if (!(auth != null)) {
              _context2.next = 38;
              break;
            }

            if (!(auth.startsWith("Basic ") && (typeof require !== "string" || require === "credentials"))) {
              _context2.next = 23;
              break;
            }

            credentials = auth.slice(6);
            credentials = Buffer.from(credentials, "base64").toString("utf8");
            i = credentials.indexOf(":");
            username = credentials.slice(0, i);
            password = credentials.slice(i + 1);
            _context2.next = 11;
            return db.query("SELECT id as userId, password as hash, salt FROM todo.users WHERE username = ?", [username]);

          case 11:
            _ref2 = _context2.sent;
            _ref3 = (0, _slicedToArray2.default)(_ref2, 1);
            results = _ref3[0];

            if (!(results.length === 0)) {
              _context2.next = 16;
              break;
            }

            throw new AuthError(req, {
              status: 401,
              code: "missing-user",
              message: "User not found.",
              data: username
            });

          case 16:
            _results$ = results[0], userId = _results$.userId, hash = _results$.hash, salt = _results$.salt;
            _context2.next = 19;
            return (0, _crypto.hashPassword)(password, salt);

          case 19:
            hash2 = _context2.sent;

            if (!(Buffer.compare(hash, hash2) !== 0)) {
              _context2.next = 22;
              break;
            }

            throw new AuthError(req, {
              status: 401,
              code: "invalid-password",
              message: "Invalid password.",
              data: username
            });

          case 22:
            return _context2.abrupt("return", {
              type: "credentials",
              userId: userId
            });

          case 23:
            if (!(auth.startsWith("Bearer ") && (typeof require !== "string" || require === "token"))) {
              _context2.next = 38;
              break;
            }

            token = auth.slice(7);
            _context2.next = 27;
            return (0, _crypto.decrypt)(token);

          case 27:
            _ref4 = _context2.sent;
            sessionId = _ref4.sessionId;
            _context2.next = 31;
            return db.query("SELECT userId FROM todo.sessions WHERE id = ? AND expirationDate >= NOW()", [sessionId]);

          case 31:
            _ref5 = _context2.sent;
            _ref6 = (0, _slicedToArray2.default)(_ref5, 1);
            _results = _ref6[0];

            if (!(_results.length === 0)) {
              _context2.next = 36;
              break;
            }

            throw new AuthError(req, {
              status: 401,
              code: "expired-session",
              message: "Session has expired"
            });

          case 36:
            _userId = _results[0].userId;
            return _context2.abrupt("return", {
              type: "token",
              userId: _userId,
              sessionId: sessionId
            });

          case 38:
            if (!require) {
              _context2.next = 40;
              break;
            }

            throw new AuthError(req, {
              status: 401,
              code: "auth-required",
              message: "Authentication required"
            });

          case 40:
            return _context2.abrupt("return", {
              type: "none",
              userId: null
            });

          case 41:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return _authenticate.apply(this, arguments);
}

function hasRole(role, required) {
  var roles = ["read", "write", "owner"];
  return roles.indexOf(role) >= roles.indexOf(required);
}
/**
 * Ensures that the given user has the permissions needed to enact a specific role on the given list. Throws an error if not allowed.
 */


function checkPermissions(_x6, _x7, _x8, _x9, _x10) {
  return _checkPermissions.apply(this, arguments);
}

function _checkPermissions() {
  _checkPermissions = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3(req, db, userId, listId, role) {
    var _ref7, _ref8, results;

    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return db.query("SELECT role FROM todo.permissions WHERE IF(? IS NOT NULL, userId = ?, userId IS NULL) AND listId = ?", [userId, userId, listId]);

          case 2:
            _ref7 = _context3.sent;
            _ref8 = (0, _slicedToArray2.default)(_ref7, 1);
            results = _ref8[0];

            if (!(results.length === 0 || !hasRole(results[0].role, role))) {
              _context3.next = 7;
              break;
            }

            throw new AuthError(req, {
              status: 401,
              code: "insufficient-perms",
              message: "Insufficient permissions"
            });

          case 7:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));
  return _checkPermissions.apply(this, arguments);
}