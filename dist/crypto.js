"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSalt = getSalt;
exports.hashPassword = hashPassword;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.tagSize = exports.ivSize = exports.keySize = exports.saltSize = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _crypto = _interopRequireDefault(require("crypto"));

var _config = _interopRequireDefault(require("../config"));

var _errors = require("./errors");

//encryption/hashing settings
var saltSize = 16;
exports.saltSize = saltSize;
var keySize = 64;
exports.keySize = keySize;
var ivSize = 16;
exports.ivSize = ivSize;
var tagSize = 16;
exports.tagSize = tagSize;
var scryptOptions = {
  N: 16384,
  r: 8,
  p: 1
};
var secretKey = _config.default.server.secretKey;
/**
 * Gets a randomized salt for a new password
 */

function getSalt() {
  return _getSalt.apply(this, arguments);
}
/**
 * Hashes the given password with the given salt
 */


function _getSalt() {
  _getSalt = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee() {
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", new Promise(function (fulfill, reject) {
              _crypto.default.randomBytes(saltSize, function (err, salt) {
                if (err) reject(err);else fulfill(salt);
              });
            }));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _getSalt.apply(this, arguments);
}

function hashPassword(_x, _x2) {
  return _hashPassword.apply(this, arguments);
}
/**
 * Encryption the given JSON value
 */


function _hashPassword() {
  _hashPassword = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2(password, salt) {
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", new Promise(function (fulfill, reject) {
              _crypto.default.scrypt(password, salt, keySize, scryptOptions, function (err, key) {
                if (err) reject(err);else fulfill(key);
              });
            }));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return _hashPassword.apply(this, arguments);
}

function encrypt(_x3) {
  return _encrypt.apply(this, arguments);
}
/**
 * Decrypts the given token into a JSON value
 */


function _encrypt() {
  _encrypt = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3(content) {
    var str, iv, cipher, encrypted, tag, buffer;
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            str = JSON.stringify(content);
            _context3.next = 3;
            return _crypto.default.randomBytes(ivSize);

          case 3:
            iv = _context3.sent;
            cipher = _crypto.default.createCipheriv("aes-256-gcm", secretKey, iv);
            encrypted = Buffer.concat([cipher.update(str, "utf8"), cipher.final()]);
            tag = cipher.getAuthTag();

            if (!(tag.length !== tagSize)) {
              _context3.next = 9;
              break;
            }

            throw new Error("Unexpected tag size");

          case 9:
            buffer = Buffer.concat([iv, tag, encrypted]);
            return _context3.abrupt("return", buffer.toString("base64"));

          case 11:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));
  return _encrypt.apply(this, arguments);
}

function decrypt(_x4) {
  return _decrypt.apply(this, arguments);
}

function _decrypt() {
  _decrypt = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee4(token) {
    var buffer, iv, tag, encrypted, decipher, str;
    return _regenerator.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            buffer = Buffer.from(token, "base64");
            iv = buffer.slice(0, ivSize);
            tag = buffer.slice(ivSize, ivSize + tagSize);

            if (!(iv.length !== ivSize || tag.length !== tagSize)) {
              _context4.next = 6;
              break;
            }

            throw null;

          case 6:
            encrypted = buffer.slice(ivSize + tagSize);
            decipher = _crypto.default.createDecipheriv("aes-256-gcm", secretKey, iv);
            decipher.setAuthTag(tag);
            str = decipher.update(encrypted, "binary", "utf8") + decipher.final("utf8");
            return _context4.abrupt("return", JSON.parse(str));

          case 13:
            _context4.prev = 13;
            _context4.t0 = _context4["catch"](0);
            throw new _errors.ClientError({
              code: "invalid-auth",
              message: "Invalid authentication"
            });

          case 16:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 13]]);
  }));
  return _decrypt.apply(this, arguments);
}