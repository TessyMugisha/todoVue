"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.getConnection = getConnection;
exports.releaseConnection = releaseConnection;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _promise = _interopRequireDefault(require("mysql2/promise"));

var _config = require("../config");

var _crypto = require("./crypto");

//create the database connection pool
var pool = _promise.default.createPool({
  host: _config.database.hostname,
  port: _config.database.port,
  user: _config.database.username,
  password: _config.database.password,
  supportBigNumbers: true,
  bigNumberStrings: true,
  connectionLimit: 10
});
/**
 * Initializes the database tables
 * @param {boolean} reset True if the existing tables should be deleted
 */


function init() {
  return _init.apply(this, arguments);
}
/**
 * Gets a new database connection
 */


function _init() {
  _init = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee() {
    var reset,
        conn,
        _args = arguments;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            reset = _args.length > 0 && _args[0] !== undefined ? _args[0] : false;
            _context.next = 3;
            return pool.getConnection();

          case 3:
            conn = _context.sent;
            _context.prev = 4;

            if (!reset) {
              _context.next = 8;
              break;
            }

            _context.next = 8;
            return conn.query("\n                DROP DATABASE IF EXISTS todo\n            ");

          case 8:
            _context.next = 10;
            return conn.query("\n            CREATE DATABASE IF NOT EXISTS todo\n        ");

          case 10:
            _context.next = 12;
            return conn.query("\n            CREATE TABLE IF NOT EXISTS todo.users (\n                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,\n                firstName VARCHAR(255),\n                lastName VARCHAR(255),\n                username VARCHAR(255) NOT NULL,\n                password BINARY(".concat(_crypto.keySize, ") NOT NULL,\n                salt BINARY(").concat(_crypto.saltSize, ") NOT NULL,\n                PRIMARY KEY(id),\n                UNIQUE(username)\n            )\n        "));

          case 12:
            _context.next = 14;
            return conn.query("\n            CREATE TABLE IF NOT EXISTS todo.sessions (\n                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,\n                userId BIGINT UNSIGNED NOT NULL,\n                expirationDate DATETIME NOT NULL,\n                PRIMARY KEY(id),\n                FOREIGN KEY(userId)\n                  REFERENCES todo.users(id)\n                  ON UPDATE CASCADE\n                  ON DELETE CASCADE\n            )\n        ");

          case 14:
            _context.next = 16;
            return conn.query("\n            CREATE TABLE IF NOT EXISTS todo.lists (\n                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,\n                name VARCHAR(255) NOT NULL,\n                PRIMARY KEY(id)\n            )\n        ");

          case 16:
            _context.next = 18;
            return conn.query("\n            CREATE TABLE IF NOT EXISTS todo.items (\n                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,\n                listId BIGINT UNSIGNED NOT NULL,\n                name VARCHAR(255) NOT NULL,\n                description VARCHAR(1024),\n                state ENUM('in-progress', 'complete', 'canceled') DEFAULT 'in-progress' NOT NULL,\n                PRIMARY KEY(id),\n                FOREIGN KEY(listId) \n                    REFERENCES todo.lists(id)\n                    ON UPDATE CASCADE\n                    ON DELETE CASCADE\n            )\n        ");

          case 18:
            _context.next = 20;
            return conn.query("\n            CREATE TABLE IF NOT EXISTS todo.permissions (\n                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,\n                userId BIGINT UNSIGNED,\n                listId BIGINT UNSIGNED NOT NULL,\n                role ENUM('owner', 'write', 'read') NOT NULL,\n                PRIMARY KEY(id),\n                UNIQUE(userId, listId),\n                FOREIGN KEY(userId) \n                    REFERENCES todo.users(id)\n                    ON UPDATE CASCADE\n                    ON DELETE CASCADE,\n                FOREIGN KEY(listId) \n                    REFERENCES todo.lists(id)\n                    ON UPDATE CASCADE\n                    ON DELETE CASCADE\n            )\n        ");

          case 20:
            _context.next = 26;
            break;

          case 22:
            _context.prev = 22;
            _context.t0 = _context["catch"](4);
            _context.t0.message = "Database init failed: " + _context.t0.message;
            throw _context.t0;

          case 26:
            _context.prev = 26;
            conn.release();
            return _context.finish(26);

          case 29:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[4, 22, 26, 29]]);
  }));
  return _init.apply(this, arguments);
}

function getConnection() {
  return _getConnection.apply(this, arguments);
}
/**
 * Release a database connection back to the pool
 */


function _getConnection() {
  _getConnection = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2() {
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return pool.getConnection();

          case 2:
            return _context2.abrupt("return", _context2.sent);

          case 3:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return _getConnection.apply(this, arguments);
}

function releaseConnection(_x) {
  return _releaseConnection.apply(this, arguments);
}
/**
 * Removes expired sessions and inaccessible lists
 */


function _releaseConnection() {
  _releaseConnection = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3(conn) {
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            conn.release();

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));
  return _releaseConnection.apply(this, arguments);
}

function purge() {
  return _purge.apply(this, arguments);
} //purge shortly after startup and then every hour on a schedule


function _purge() {
  _purge = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee4() {
    var db, _ref, _ref2, results, _ref3, _ref4;

    return _regenerator.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return getConnection();

          case 2:
            db = _context4.sent;
            _context4.prev = 3;
            _context4.next = 6;
            return db.query("DELETE FROM todo.sessions WHERE expirationDate < NOW()");

          case 6:
            _ref = _context4.sent;
            _ref2 = (0, _slicedToArray2.default)(_ref, 1);
            results = _ref2[0];
            if (results.affectedRows !== 0) console.log("Purged ".concat(results.affectedRows, " expired sessions."));
            _context4.next = 12;
            return db.query("DELETE FROM todo.lists WHERE id NOT IN (SELECT DISTINCT listId FROM todo.permissions)");

          case 12:
            _ref3 = _context4.sent;
            _ref4 = (0, _slicedToArray2.default)(_ref3, 1);
            results = _ref4[0];
            if (results.affectedRows !== 0) console.log("Purged ".concat(results.affectedRows, " orphaned lists."));

          case 16:
            _context4.prev = 16;
            _context4.next = 19;
            return releaseConnection(db);

          case 19:
            return _context4.finish(16);

          case 20:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this, [[3,, 16, 20]]);
  }));
  return _purge.apply(this, arguments);
}

setTimeout(function () {
  return purge().catch(console.error);
}, 10 * 1000);
setInterval(function () {
  return purge().catch(console.error);
}, 60 * 60 * 1000);