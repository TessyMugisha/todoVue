"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _config = _interopRequireDefault(require("../config"));

var database = _interopRequireWildcard(require("./database"));

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

var _errors = require("./errors");

var _validation = require("./validation");

var _crypto = require("./crypto");

var _util = require("./util");

function start() {
  return _start.apply(this, arguments);
} //the the server immediately


function _start() {
  _start = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee22() {
    var _config$server, hostname, port, app, cors, jsonMiddleware;

    return _regenerator.default.wrap(function _callee22$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
            if (!_config.default.database.autoInit) {
              _context22.next = 3;
              break;
            }

            _context22.next = 3;
            return database.init();

          case 3:
            _config$server = _config.default.server, hostname = _config$server.hostname, port = _config$server.port; //create our Express app

            app = (0, _express.default)(); //create a handler for CORS

            cors = (0, _cors.default)({
              origin: function origin(_origin, callback) {
                callback(null, true);
              },
              credentials: true
            }); //setup our artificial delay (if configured)

            if (_config.default.server.artificialDelay > 0) {
              app.use(function (req, res, next) {
                setTimeout(next, _config.default.server.artificialDelay);
              });
            } //handle CORS requests


            app.use(cors);
            jsonMiddleware = _express.default.json({
              strict: false
            }); //parse JSON bodies

            app.use(function (req, res, next) {
              var type = req.get("content-type");
              if (type != null && type.toLowerCase() === "application/json") jsonMiddleware(req, res, next);else next();
            }); //disable caching responses

            app.use(function (req, res, next) {
              res.set("Cache-Control", "no-cache, no-store, must-revalidate");
              res.set("Pragma", "no-cache");
              res.set("Expires", "0");
              next();
            }); //reply to all options requests

            app.options("*", cors); //region user
            //creates a new user

            app.post("/users", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee(req, res, db) {
                var body, salt, hash, results, _ref2, _ref3, userId, expireTime, _ref4, _ref5, sessionId, token;

                return _regenerator.default.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        body = req.body; //this is an example of how to specify the structure of a body
                        //  all entries are required unless wrapped in an optional (like firstName and lastName)
                        //  strings specify that the type should be a string (the value of the string is what's used in the response to an invalid body)

                        body = (0, _validation.jsonValidate)(body, {
                          firstName: new _validation.Optional("John"),
                          lastName: new _validation.Optional("Doe"),
                          username: "johndoe",
                          password: "secret"
                        }); //create a new salt for our user

                        _context.next = 4;
                        return (0, _crypto.getSalt)();

                      case 4:
                        salt = _context.sent;
                        _context.next = 7;
                        return (0, _crypto.hashPassword)(body.password, salt);

                      case 7:
                        hash = _context.sent;
                        //update the body
                        body.password = hash;
                        body.salt = salt; //insert the user into the database

                        _context.prev = 10;
                        _context.next = 13;
                        return db.query("INSERT INTO todo.users SET ?", [body]);

                      case 13:
                        _ref2 = _context.sent;
                        _ref3 = (0, _slicedToArray2.default)(_ref2, 1);
                        results = _ref3[0];
                        _context.next = 23;
                        break;

                      case 18:
                        _context.prev = 18;
                        _context.t0 = _context["catch"](10);

                        if (!(_context.t0.code === "ER_DUP_ENTRY")) {
                          _context.next = 22;
                          break;
                        }

                        throw new _errors.ClientError({
                          status: 409,
                          code: "username-taken",
                          message: "Username already in use.",
                          data: body.username
                        });

                      case 22:
                        throw _context.t0;

                      case 23:
                        //also log in the new user
                        userId = "".concat(results.insertId);
                        expireTime = new Date(Date.now() + _config.default.tokenLifetime); //insert the new session into the database

                        _context.next = 27;
                        return db.query("INSERT INTO todo.sessions(userId, expirationDate) VALUES (?, ?)", [userId, expireTime]);

                      case 27:
                        _ref4 = _context.sent;
                        _ref5 = (0, _slicedToArray2.default)(_ref4, 1);
                        results = _ref5[0];
                        sessionId = "".concat(results.insertId);
                        _context.next = 33;
                        return (0, _crypto.encrypt)({
                          sessionId: sessionId
                        });

                      case 33:
                        token = _context.sent;
                        return _context.abrupt("return", {
                          status: 201,
                          //201 CREATED
                          userId: userId,
                          token: token,
                          expireTime: expireTime
                        });

                      case 35:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee, this, [[10, 18]]);
              }));

              return function (_x, _x2, _x3) {
                return _ref.apply(this, arguments);
              };
            }())); //gets the user's information

            app.get("/users", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref6 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee2(req, res, db) {
                var _ref7, userId, _ref8, _ref9, results, user;

                return _regenerator.default.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.next = 2;
                        return (0, _util.authenticate)(req, db);

                      case 2:
                        _ref7 = _context2.sent;
                        userId = _ref7.userId;
                        _context2.next = 6;
                        return db.query("SELECT id, firstName, lastName, username FROM todo.users WHERE id = ?", [userId]);

                      case 6:
                        _ref8 = _context2.sent;
                        _ref9 = (0, _slicedToArray2.default)(_ref8, 1);
                        results = _ref9[0];

                        if (!(results.length === 0)) {
                          _context2.next = 11;
                          break;
                        }

                        throw new Error("Unexpected missing user");

                      case 11:
                        user = results[0];
                        return _context2.abrupt("return", {
                          user: user
                        });

                      case 13:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2, this);
              }));

              return function (_x4, _x5, _x6) {
                return _ref6.apply(this, arguments);
              };
            }())); //updates the user's information

            app.put("/users", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref10 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee3(req, res, db) {
                var _ref11, userId, body, id, salt, hash, _ref12, _ref13, results;

                return _regenerator.default.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        _context3.next = 2;
                        return (0, _util.authenticate)(req, db);

                      case 2:
                        _ref11 = _context3.sent;
                        userId = _ref11.userId;
                        body = req.body;
                        body = (0, _validation.jsonValidate)(body, {
                          id: new _validation.Optional("1"),
                          firstName: new _validation.Optional("John"),
                          lastName: new _validation.Optional("Doe"),
                          password: new _validation.Optional("secret")
                        });

                        if (!("id" in body)) {
                          _context3.next = 11;
                          break;
                        }

                        id = (0, _validation.parseIntStrict)(body.id);

                        if (!(id !== userId)) {
                          _context3.next = 10;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "immutable-id",
                          message: "User ids are immutable."
                        });

                      case 10:
                        delete body.id;

                      case 11:
                        if (!(Object.keys(body).length === 0)) {
                          _context3.next = 13;
                          break;
                        }

                        return _context3.abrupt("return");

                      case 13:
                        if (!("password" in body)) {
                          _context3.next = 22;
                          break;
                        }

                        _context3.next = 16;
                        return (0, _crypto.getSalt)();

                      case 16:
                        salt = _context3.sent;
                        _context3.next = 19;
                        return (0, _crypto.hashPassword)(body.password, salt);

                      case 19:
                        hash = _context3.sent;
                        body.password = hash;
                        body.salt = salt;

                      case 22:
                        _context3.next = 24;
                        return db.query("UPDATE todo.users SET ? WHERE id = ?", [body, userId]);

                      case 24:
                        _ref12 = _context3.sent;
                        _ref13 = (0, _slicedToArray2.default)(_ref12, 1);
                        results = _ref13[0];

                        if (!(results.affectedRows === 0)) {
                          _context3.next = 29;
                          break;
                        }

                        throw new Error("Unexpected missing user");

                      case 29:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3, this);
              }));

              return function (_x7, _x8, _x9) {
                return _ref10.apply(this, arguments);
              };
            }())); //deletes the user

            app.delete("/users", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref14 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee4(req, res, db) {
                var _ref15, userId, _ref16, _ref17, results;

                return _regenerator.default.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        _context4.next = 2;
                        return (0, _util.authenticate)(req, db);

                      case 2:
                        _ref15 = _context4.sent;
                        userId = _ref15.userId;
                        _context4.next = 6;
                        return db.query("DELETE FROM todo.users WHERE id = ?", [userId]);

                      case 6:
                        _ref16 = _context4.sent;
                        _ref17 = (0, _slicedToArray2.default)(_ref16, 1);
                        results = _ref17[0];

                        if (!(results.affectedRows === 0)) {
                          _context4.next = 11;
                          break;
                        }

                        throw new Error("Unexpected missing user");

                      case 11:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4, this);
              }));

              return function (_x10, _x11, _x12) {
                return _ref14.apply(this, arguments);
              };
            }())); //checks if the username is taken

            app.get("/users/name-taken", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref18 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee5(req, res, db) {
                var body, _body, username, _ref19, _ref20, results, isTaken;

                return _regenerator.default.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        body = req.query;
                        body = (0, _validation.jsonValidate)(body, {
                          username: "johndoe"
                        });
                        _body = body, username = _body.username;
                        _context5.next = 5;
                        return db.query("SELECT TRUE as isTaken FROM todo.users WHERE username = ? UNION SELECT FALSE as isTaken", [username]);

                      case 5:
                        _ref19 = _context5.sent;
                        _ref20 = (0, _slicedToArray2.default)(_ref19, 1);
                        results = _ref20[0];
                        isTaken = Boolean(+results[0].isTaken);
                        return _context5.abrupt("return", {
                          isTaken: isTaken
                        });

                      case 10:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _callee5, this);
              }));

              return function (_x13, _x14, _x15) {
                return _ref18.apply(this, arguments);
              };
            }())); //endregion
            //region auth
            //creates a new session

            app.post("/users/login", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref21 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee6(req, res, db) {
                var _ref22, userId, expireTime, _ref23, _ref24, results, sessionId, token;

                return _regenerator.default.wrap(function _callee6$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        _context6.next = 2;
                        return (0, _util.authenticate)(req, db, "credentials");

                      case 2:
                        _ref22 = _context6.sent;
                        userId = _ref22.userId;
                        expireTime = new Date(Date.now() + _config.default.tokenLifetime);
                        _context6.next = 7;
                        return db.query("INSERT INTO todo.sessions(userId, expirationDate) VALUES (?, ?)", [userId, expireTime]);

                      case 7:
                        _ref23 = _context6.sent;
                        _ref24 = (0, _slicedToArray2.default)(_ref23, 1);
                        results = _ref24[0];
                        sessionId = "".concat(results.insertId);
                        _context6.next = 13;
                        return (0, _crypto.encrypt)({
                          sessionId: sessionId
                        });

                      case 13:
                        token = _context6.sent;
                        return _context6.abrupt("return", {
                          token: token,
                          expireTime: expireTime
                        });

                      case 15:
                      case "end":
                        return _context6.stop();
                    }
                  }
                }, _callee6, this);
              }));

              return function (_x16, _x17, _x18) {
                return _ref21.apply(this, arguments);
              };
            }())); //logs out an existing session

            app.post("/users/logout", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref25 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee7(req, res, db) {
                var _ref26, sessionId;

                return _regenerator.default.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        _context7.next = 2;
                        return (0, _util.authenticate)(req, db, false);

                      case 2:
                        _ref26 = _context7.sent;
                        sessionId = _ref26.sessionId;

                        if (!(sessionId == null)) {
                          _context7.next = 6;
                          break;
                        }

                        return _context7.abrupt("return");

                      case 6:
                        _context7.next = 8;
                        return db.query("DELETE FROM todo.sessions WHERE id = ?", [sessionId]);

                      case 8:
                      case "end":
                        return _context7.stop();
                    }
                  }
                }, _callee7, this);
              }));

              return function (_x19, _x20, _x21) {
                return _ref25.apply(this, arguments);
              };
            }())); //endregion
            //region list
            //gets the user's lists

            app.get("/lists", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref27 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee8(req, res, db) {
                var _ref28, userId, _ref29, _ref30, results;

                return _regenerator.default.wrap(function _callee8$(_context8) {
                  while (1) {
                    switch (_context8.prev = _context8.next) {
                      case 0:
                        _context8.next = 2;
                        return (0, _util.authenticate)(req, db, false);

                      case 2:
                        _ref28 = _context8.sent;
                        userId = _ref28.userId;
                        _context8.next = 6;
                        return db.query("SELECT id, name FROM todo.lists WHERE id in (SELECT listId FROM todo.permissions WHERE IF(? IS NOT NULL, userId = ?, userId IS NULL))", [userId, userId]);

                      case 6:
                        _ref29 = _context8.sent;
                        _ref30 = (0, _slicedToArray2.default)(_ref29, 1);
                        results = _ref30[0];
                        return _context8.abrupt("return", {
                          lists: results
                        });

                      case 10:
                      case "end":
                        return _context8.stop();
                    }
                  }
                }, _callee8, this);
              }));

              return function (_x22, _x23, _x24) {
                return _ref27.apply(this, arguments);
              };
            }())); //creates a new list

            app.post("/lists", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref31 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee9(req, res, db) {
                var _ref32, userId, body, _ref33, _ref34, results, listId;

                return _regenerator.default.wrap(function _callee9$(_context9) {
                  while (1) {
                    switch (_context9.prev = _context9.next) {
                      case 0:
                        _context9.next = 2;
                        return (0, _util.authenticate)(req, db, false);

                      case 2:
                        _ref32 = _context9.sent;
                        userId = _ref32.userId;
                        body = req.body;
                        body = (0, _validation.jsonValidate)(body, {
                          name: "Groceries"
                        });
                        _context9.next = 8;
                        return db.query("INSERT INTO todo.lists SET ?", [body]);

                      case 8:
                        _ref33 = _context9.sent;
                        _ref34 = (0, _slicedToArray2.default)(_ref33, 1);
                        results = _ref34[0];
                        listId = "".concat(results.insertId);
                        _context9.next = 14;
                        return db.query("INSERT INTO todo.permissions(userId, listId, role) VALUES (?, ?, 'owner')", [userId, listId]);

                      case 14:
                        return _context9.abrupt("return", {
                          status: 201,
                          listId: listId
                        });

                      case 15:
                      case "end":
                        return _context9.stop();
                    }
                  }
                }, _callee9, this);
              }));

              return function (_x25, _x26, _x27) {
                return _ref31.apply(this, arguments);
              };
            }())); //gets the info for a list

            app.get("/lists/:listId", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref35 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee10(req, res, db) {
                var _ref36, userId, listId, _ref37, _ref38, results, list;

                return _regenerator.default.wrap(function _callee10$(_context10) {
                  while (1) {
                    switch (_context10.prev = _context10.next) {
                      case 0:
                        _context10.next = 2;
                        return (0, _util.authenticate)(req, db, false);

                      case 2:
                        _ref36 = _context10.sent;
                        userId = _ref36.userId;
                        listId = req.params.listId;
                        listId = (0, _validation.parseIntStrict)(listId);

                        if (!isNaN(listId)) {
                          _context10.next = 8;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "invalid-route-param",
                          message: "Invalid route parameter. A valid number is required."
                        });

                      case 8:
                        _context10.next = 10;
                        return (0, _util.checkPermissions)(req, db, userId, listId, "read");

                      case 10:
                        _context10.next = 12;
                        return db.query("SELECT id, name FROM todo.lists WHERE id = ?", [listId]);

                      case 12:
                        _ref37 = _context10.sent;
                        _ref38 = (0, _slicedToArray2.default)(_ref37, 1);
                        results = _ref38[0];

                        if (!(results.length === 0)) {
                          _context10.next = 17;
                          break;
                        }

                        throw new Error("Unexpected missing list");

                      case 17:
                        list = results[0];
                        return _context10.abrupt("return", {
                          list: list
                        });

                      case 19:
                      case "end":
                        return _context10.stop();
                    }
                  }
                }, _callee10, this);
              }));

              return function (_x28, _x29, _x30) {
                return _ref35.apply(this, arguments);
              };
            }())); //update the info for a list

            app.put("/lists/:listId", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref39 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee11(req, res, db) {
                var _ref40, userId, listId, body, id, _ref41, _ref42, results;

                return _regenerator.default.wrap(function _callee11$(_context11) {
                  while (1) {
                    switch (_context11.prev = _context11.next) {
                      case 0:
                        _context11.next = 2;
                        return (0, _util.authenticate)(req, db, false);

                      case 2:
                        _ref40 = _context11.sent;
                        userId = _ref40.userId;
                        listId = req.params.listId;
                        listId = (0, _validation.parseIntStrict)(listId);

                        if (!isNaN(listId)) {
                          _context11.next = 8;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "invalid-route-param",
                          message: "Invalid route parameter. A valid number is required."
                        });

                      case 8:
                        _context11.next = 10;
                        return (0, _util.checkPermissions)(req, db, userId, listId, "write");

                      case 10:
                        body = req.body;
                        body = (0, _validation.jsonValidate)(body, {
                          id: new _validation.Optional("1"),
                          name: new _validation.Optional("Groceries")
                        });

                        if (!("id" in body)) {
                          _context11.next = 17;
                          break;
                        }

                        id = (0, _validation.parseIntStrict)(body.id);

                        if (!(id !== listId)) {
                          _context11.next = 16;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "immutable-id",
                          message: "List ids are immutable."
                        });

                      case 16:
                        delete body.id;

                      case 17:
                        if (!(Object.keys(body).length === 0)) {
                          _context11.next = 19;
                          break;
                        }

                        return _context11.abrupt("return");

                      case 19:
                        _context11.next = 21;
                        return db.query("UPDATE todo.lists SET ? WHERE id = ?", [body, listId]);

                      case 21:
                        _ref41 = _context11.sent;
                        _ref42 = (0, _slicedToArray2.default)(_ref41, 1);
                        results = _ref42[0];

                        if (!(results.affectedRows === 0)) {
                          _context11.next = 26;
                          break;
                        }

                        throw new Error("Unexpected missing list");

                      case 26:
                      case "end":
                        return _context11.stop();
                    }
                  }
                }, _callee11, this);
              }));

              return function (_x31, _x32, _x33) {
                return _ref39.apply(this, arguments);
              };
            }())); //deletes a list (and it's items)

            app.delete("/lists/:listId", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref43 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee12(req, res, db) {
                var _ref44, userId, listId, _ref45, _ref46, results;

                return _regenerator.default.wrap(function _callee12$(_context12) {
                  while (1) {
                    switch (_context12.prev = _context12.next) {
                      case 0:
                        _context12.next = 2;
                        return (0, _util.authenticate)(req, db, false);

                      case 2:
                        _ref44 = _context12.sent;
                        userId = _ref44.userId;
                        listId = req.params.listId;
                        listId = (0, _validation.parseIntStrict)(listId);

                        if (!isNaN(listId)) {
                          _context12.next = 8;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "invalid-route-param",
                          message: "Invalid route parameter. A valid number is required."
                        });

                      case 8:
                        _context12.next = 10;
                        return (0, _util.checkPermissions)(req, db, userId, listId, "owner");

                      case 10:
                        _context12.next = 12;
                        return db.query("DELETE FROM todo.lists WHERE id = ?", [listId]);

                      case 12:
                        _ref45 = _context12.sent;
                        _ref46 = (0, _slicedToArray2.default)(_ref45, 1);
                        results = _ref46[0];

                        if (!(results.affectedRows === 0)) {
                          _context12.next = 17;
                          break;
                        }

                        throw new Error("Unexpected missing list");

                      case 17:
                      case "end":
                        return _context12.stop();
                    }
                  }
                }, _callee12, this);
              }));

              return function (_x34, _x35, _x36) {
                return _ref43.apply(this, arguments);
              };
            }())); //region list users
            //gets the users which can access a list

            app.get("/lists/:listId/users", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref47 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee13(req, res, db) {
                var _ref48, userId, listId, _ref49, _ref50, results, users, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, user;

                return _regenerator.default.wrap(function _callee13$(_context13) {
                  while (1) {
                    switch (_context13.prev = _context13.next) {
                      case 0:
                        _context13.next = 2;
                        return (0, _util.authenticate)(req, db, false);

                      case 2:
                        _ref48 = _context13.sent;
                        userId = _ref48.userId;
                        listId = req.params.listId;
                        listId = (0, _validation.parseIntStrict)(listId);

                        if (!isNaN(listId)) {
                          _context13.next = 8;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "invalid-route-param",
                          message: "Invalid route parameter. A valid number is required."
                        });

                      case 8:
                        _context13.next = 10;
                        return (0, _util.checkPermissions)(req, db, userId, listId, "read");

                      case 10:
                        _context13.next = 12;
                        return db.query("SELECT userId, role FROM todo.permissions WHERE listId = ?", [listId]);

                      case 12:
                        _ref49 = _context13.sent;
                        _ref50 = (0, _slicedToArray2.default)(_ref49, 1);
                        results = _ref50[0];
                        users = {};
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context13.prev = 19;

                        for (_iterator = results[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                          user = _step.value;
                          users[user.userId] = {
                            role: user.role
                          };
                        }

                        _context13.next = 27;
                        break;

                      case 23:
                        _context13.prev = 23;
                        _context13.t0 = _context13["catch"](19);
                        _didIteratorError = true;
                        _iteratorError = _context13.t0;

                      case 27:
                        _context13.prev = 27;
                        _context13.prev = 28;

                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                          _iterator.return();
                        }

                      case 30:
                        _context13.prev = 30;

                        if (!_didIteratorError) {
                          _context13.next = 33;
                          break;
                        }

                        throw _iteratorError;

                      case 33:
                        return _context13.finish(30);

                      case 34:
                        return _context13.finish(27);

                      case 35:
                        return _context13.abrupt("return", {
                          users: users
                        });

                      case 36:
                      case "end":
                        return _context13.stop();
                    }
                  }
                }, _callee13, this, [[19, 23, 27, 35], [28,, 30, 34]]);
              }));

              return function (_x37, _x38, _x39) {
                return _ref47.apply(this, arguments);
              };
            }())); //gets the access level for a user on a list

            app.get("/lists/:listId/users/:userId", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref51 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee14(req, res, db) {
                var _ref52, userId, _req$params, listId, targetUserId, _ref53, _ref54, results, user;

                return _regenerator.default.wrap(function _callee14$(_context14) {
                  while (1) {
                    switch (_context14.prev = _context14.next) {
                      case 0:
                        _context14.next = 2;
                        return (0, _util.authenticate)(req, db, false);

                      case 2:
                        _ref52 = _context14.sent;
                        userId = _ref52.userId;
                        _req$params = req.params, listId = _req$params.listId, targetUserId = _req$params.userId;
                        listId = (0, _validation.parseIntStrict)(listId);
                        targetUserId = (0, _validation.parseIntStrict)(targetUserId);

                        if (!(isNaN(listId) || isNaN(targetUserId))) {
                          _context14.next = 9;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "invalid-route-param",
                          message: "Invalid route parameter. A valid number is required."
                        });

                      case 9:
                        _context14.next = 11;
                        return (0, _util.checkPermissions)(req, db, userId, listId, "read");

                      case 11:
                        _context14.next = 13;
                        return db.query("SELECT role FROM todo.permissions WHERE listId = ? AND userId = ?", [listId, targetUserId]);

                      case 13:
                        _ref53 = _context14.sent;
                        _ref54 = (0, _slicedToArray2.default)(_ref53, 1);
                        results = _ref54[0];
                        user = results[0] || {};
                        return _context14.abrupt("return", {
                          role: user.role
                        });

                      case 18:
                      case "end":
                        return _context14.stop();
                    }
                  }
                }, _callee14, this);
              }));

              return function (_x40, _x41, _x42) {
                return _ref51.apply(this, arguments);
              };
            }())); //sets the access level for a user on a list

            app.put("/lists/:listId/users/:userId", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref55 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee15(req, res, db) {
                var _ref56, userId, _req$params2, listId, targetUserId, body;

                return _regenerator.default.wrap(function _callee15$(_context15) {
                  while (1) {
                    switch (_context15.prev = _context15.next) {
                      case 0:
                        _context15.next = 2;
                        return (0, _util.authenticate)(req, db);

                      case 2:
                        _ref56 = _context15.sent;
                        userId = _ref56.userId;
                        _req$params2 = req.params, listId = _req$params2.listId, targetUserId = _req$params2.userId;
                        listId = (0, _validation.parseIntStrict)(listId);
                        targetUserId = (0, _validation.parseIntStrict)(targetUserId);

                        if (!(isNaN(listId) || isNaN(targetUserId))) {
                          _context15.next = 9;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "invalid-route-param",
                          message: "Invalid route parameter. A valid number is required."
                        });

                      case 9:
                        _context15.next = 11;
                        return (0, _util.checkPermissions)(req, db, userId, listId, "owner");

                      case 11:
                        body = req.body;
                        body = (0, _validation.jsonValidate)(body, {
                          role: "write"
                        });

                        if (["owner", "write", "read"].includes(body.role)) {
                          _context15.next = 15;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "invalid-role",
                          message: "Unknown role '".concat(body.role, "'.")
                        });

                      case 15:
                        _context15.next = 17;
                        return db.query("INSERT INTO todo.permissions(userId, listId, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role = VALUES(role)", [targetUserId, listId, body.role]);

                      case 17:
                      case "end":
                        return _context15.stop();
                    }
                  }
                }, _callee15, this);
              }));

              return function (_x43, _x44, _x45) {
                return _ref55.apply(this, arguments);
              };
            }())); //deletes a user's access to a list

            app.delete("/lists/:listId/users/:userId", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref57 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee16(req, res, db) {
                var _ref58, userId, _req$params3, listId, targetUserId;

                return _regenerator.default.wrap(function _callee16$(_context16) {
                  while (1) {
                    switch (_context16.prev = _context16.next) {
                      case 0:
                        _context16.next = 2;
                        return (0, _util.authenticate)(req, db, false);

                      case 2:
                        _ref58 = _context16.sent;
                        userId = _ref58.userId;
                        _req$params3 = req.params, listId = _req$params3.listId, targetUserId = _req$params3.userId;
                        listId = (0, _validation.parseIntStrict)(listId);
                        targetUserId = (0, _validation.parseIntStrict)(targetUserId);

                        if (!(isNaN(listId) || isNaN(targetUserId))) {
                          _context16.next = 9;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "invalid-route-param",
                          message: "Invalid route parameter. A valid number is required."
                        });

                      case 9:
                        _context16.next = 11;
                        return (0, _util.checkPermissions)(req, db, userId, listId, "owner");

                      case 11:
                        _context16.next = 13;
                        return db.query("DELETE FROM todo.permissions WHERE userId = ? AND listId = ?", [targetUserId, listId]);

                      case 13:
                      case "end":
                        return _context16.stop();
                    }
                  }
                }, _callee16, this);
              }));

              return function (_x46, _x47, _x48) {
                return _ref57.apply(this, arguments);
              };
            }())); //endregion
            //region list items
            //gets the items in a list

            app.get("/lists/:listId/items", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref59 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee17(req, res, db) {
                var _ref60, userId, listId, _ref61, _ref62, results;

                return _regenerator.default.wrap(function _callee17$(_context17) {
                  while (1) {
                    switch (_context17.prev = _context17.next) {
                      case 0:
                        _context17.next = 2;
                        return (0, _util.authenticate)(req, db, false);

                      case 2:
                        _ref60 = _context17.sent;
                        userId = _ref60.userId;
                        listId = req.params.listId;
                        listId = (0, _validation.parseIntStrict)(listId);

                        if (!isNaN(listId)) {
                          _context17.next = 8;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "invalid-route-param",
                          message: "Invalid route parameter. A valid number is required."
                        });

                      case 8:
                        _context17.next = 10;
                        return (0, _util.checkPermissions)(req, db, userId, listId, "read");

                      case 10:
                        _context17.next = 12;
                        return db.query("SELECT id, name, description, state FROM todo.items WHERE listId = ? ORDER BY id ASC", [listId]);

                      case 12:
                        _ref61 = _context17.sent;
                        _ref62 = (0, _slicedToArray2.default)(_ref61, 1);
                        results = _ref62[0];
                        return _context17.abrupt("return", {
                          items: results
                        });

                      case 16:
                      case "end":
                        return _context17.stop();
                    }
                  }
                }, _callee17, this);
              }));

              return function (_x49, _x50, _x51) {
                return _ref59.apply(this, arguments);
              };
            }())); //adds a new item to a list

            app.post("/lists/:listId/items", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref63 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee18(req, res, db) {
                var _ref64, userId, listId, body, _ref65, _ref66, results, itemId;

                return _regenerator.default.wrap(function _callee18$(_context18) {
                  while (1) {
                    switch (_context18.prev = _context18.next) {
                      case 0:
                        _context18.next = 2;
                        return (0, _util.authenticate)(req, db, false);

                      case 2:
                        _ref64 = _context18.sent;
                        userId = _ref64.userId;
                        listId = req.params.listId;
                        listId = (0, _validation.parseIntStrict)(listId);

                        if (!isNaN(listId)) {
                          _context18.next = 8;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "invalid-route-param",
                          message: "Invalid route parameter. A valid number is required."
                        });

                      case 8:
                        _context18.next = 10;
                        return (0, _util.checkPermissions)(req, db, userId, listId, "write");

                      case 10:
                        body = req.body;
                        body = (0, _validation.jsonValidate)(body, {
                          name: "Apples",
                          description: new _validation.Optional("For the apple pie."),
                          state: new _validation.Optional("in-progress")
                        });

                        if (!(body.state != null && !["in-progress", "complete", "canceled"].includes(body.state))) {
                          _context18.next = 14;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "invalid-state",
                          message: "Unknown state '".concat(body.state, "'.")
                        });

                      case 14:
                        body.listId = listId;
                        _context18.next = 17;
                        return db.query("INSERT INTO todo.items SET ?", [body]);

                      case 17:
                        _ref65 = _context18.sent;
                        _ref66 = (0, _slicedToArray2.default)(_ref65, 1);
                        results = _ref66[0];
                        itemId = "".concat(results.insertId);
                        return _context18.abrupt("return", {
                          status: 201,
                          itemId: itemId
                        });

                      case 22:
                      case "end":
                        return _context18.stop();
                    }
                  }
                }, _callee18, this);
              }));

              return function (_x52, _x53, _x54) {
                return _ref63.apply(this, arguments);
              };
            }())); //gets the info for an item in a list

            app.get("/lists/:listId/items/:itemId", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref67 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee19(req, res, db) {
                var _ref68, userId, _req$params4, listId, itemId, _ref69, _ref70, results, item;

                return _regenerator.default.wrap(function _callee19$(_context19) {
                  while (1) {
                    switch (_context19.prev = _context19.next) {
                      case 0:
                        _context19.next = 2;
                        return (0, _util.authenticate)(req, db, false);

                      case 2:
                        _ref68 = _context19.sent;
                        userId = _ref68.userId;
                        _req$params4 = req.params, listId = _req$params4.listId, itemId = _req$params4.itemId;
                        listId = (0, _validation.parseIntStrict)(listId);
                        itemId = (0, _validation.parseIntStrict)(itemId);

                        if (!(isNaN(listId) || isNaN(itemId))) {
                          _context19.next = 9;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "invalid-route-param",
                          message: "Invalid route parameter. A valid number is required."
                        });

                      case 9:
                        _context19.next = 11;
                        return (0, _util.checkPermissions)(req, db, userId, listId, "read");

                      case 11:
                        _context19.next = 13;
                        return db.query("SELECT id, name, description, state FROM todo.items WHERE listId = ? AND id = ?", [listId, itemId]);

                      case 13:
                        _ref69 = _context19.sent;
                        _ref70 = (0, _slicedToArray2.default)(_ref69, 1);
                        results = _ref70[0];

                        if (!(results.length === 0)) {
                          _context19.next = 18;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "missing-item",
                          message: "Item not found."
                        });

                      case 18:
                        item = results[0];
                        return _context19.abrupt("return", {
                          item: item
                        });

                      case 20:
                      case "end":
                        return _context19.stop();
                    }
                  }
                }, _callee19, this);
              }));

              return function (_x55, _x56, _x57) {
                return _ref67.apply(this, arguments);
              };
            }())); //updates the info for an item in a list

            app.put("/lists/:listId/items/:itemId", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref71 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee20(req, res, db) {
                var _ref72, userId, _req$params5, listId, itemId, body, id, _ref73, _ref74, results;

                return _regenerator.default.wrap(function _callee20$(_context20) {
                  while (1) {
                    switch (_context20.prev = _context20.next) {
                      case 0:
                        _context20.next = 2;
                        return (0, _util.authenticate)(req, db, false);

                      case 2:
                        _ref72 = _context20.sent;
                        userId = _ref72.userId;
                        _req$params5 = req.params, listId = _req$params5.listId, itemId = _req$params5.itemId;
                        listId = (0, _validation.parseIntStrict)(listId);
                        itemId = (0, _validation.parseIntStrict)(itemId);

                        if (!(isNaN(listId) || isNaN(itemId))) {
                          _context20.next = 9;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "invalid-route-param",
                          message: "Invalid route parameter. A valid number is required."
                        });

                      case 9:
                        _context20.next = 11;
                        return (0, _util.checkPermissions)(req, db, userId, listId, "write");

                      case 11:
                        body = req.body;
                        body = (0, _validation.jsonValidate)(body, {
                          id: new _validation.Optional("1"),
                          name: new _validation.Optional("Apple"),
                          description: new _validation.Optional("For the apple pie."),
                          state: new _validation.Optional("in-progress")
                        });

                        if (!("id" in body)) {
                          _context20.next = 18;
                          break;
                        }

                        id = (0, _validation.parseIntStrict)(body.id);

                        if (!(id !== itemId)) {
                          _context20.next = 17;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "immutable-id",
                          message: "Item ids are immutable."
                        });

                      case 17:
                        delete body.id;

                      case 18:
                        if (!(Object.keys(body).length === 0)) {
                          _context20.next = 20;
                          break;
                        }

                        return _context20.abrupt("return");

                      case 20:
                        if (!(body.state != null && !["in-progress", "complete", "canceled"].includes(body.state))) {
                          _context20.next = 22;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "invalid-state",
                          message: "Unknown state '".concat(body.state, "'.")
                        });

                      case 22:
                        _context20.next = 24;
                        return db.query("UPDATE todo.items SET ? WHERE listId = ? AND id = ?", [body, listId, itemId]);

                      case 24:
                        _ref73 = _context20.sent;
                        _ref74 = (0, _slicedToArray2.default)(_ref73, 1);
                        results = _ref74[0];

                        if (!(results.affectedRows === 0)) {
                          _context20.next = 29;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "missing-item",
                          message: "Item not found."
                        });

                      case 29:
                      case "end":
                        return _context20.stop();
                    }
                  }
                }, _callee20, this);
              }));

              return function (_x58, _x59, _x60) {
                return _ref71.apply(this, arguments);
              };
            }())); //deletes an item

            app.delete("/lists/:listId/items/:itemId", (0, _util.route)(
            /*#__PURE__*/
            function () {
              var _ref75 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee21(req, res, db) {
                var _ref76, userId, _req$params6, listId, itemId, _ref77, _ref78, results;

                return _regenerator.default.wrap(function _callee21$(_context21) {
                  while (1) {
                    switch (_context21.prev = _context21.next) {
                      case 0:
                        _context21.next = 2;
                        return (0, _util.authenticate)(req, db, false);

                      case 2:
                        _ref76 = _context21.sent;
                        userId = _ref76.userId;
                        _req$params6 = req.params, listId = _req$params6.listId, itemId = _req$params6.itemId;
                        listId = (0, _validation.parseIntStrict)(listId);
                        itemId = (0, _validation.parseIntStrict)(itemId);

                        if (!(isNaN(listId) || isNaN(itemId))) {
                          _context21.next = 9;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "invalid-route-param",
                          message: "Invalid route parameter. A valid number is required."
                        });

                      case 9:
                        _context21.next = 11;
                        return (0, _util.checkPermissions)(req, db, userId, listId, "write");

                      case 11:
                        _context21.next = 13;
                        return db.query("DELETE FROM todo.items WHERE listId = ? AND id = ?", [listId, itemId]);

                      case 13:
                        _ref77 = _context21.sent;
                        _ref78 = (0, _slicedToArray2.default)(_ref77, 1);
                        results = _ref78[0];

                        if (!(results.affectedRows === 0)) {
                          _context21.next = 18;
                          break;
                        }

                        throw new _errors.ClientError({
                          code: "missing-item",
                          message: "Item not found."
                        });

                      case 18:
                      case "end":
                        return _context21.stop();
                    }
                  }
                }, _callee21, this);
              }));

              return function (_x61, _x62, _x63) {
                return _ref75.apply(this, arguments);
              };
            }())); //endregion
            //endregion

            app.use(function (err, req, res, next) {
              //client errors are "expected" so don't print any debug info to the console
              if (err instanceof _errors.ClientError) {
                res.status(err.status).set(err.headers).send({
                  success: false,
                  code: err.code,
                  message: err.message,
                  data: err.data
                });
              } else {
                console.error(err);
                res.status(500).send({
                  success: false,
                  code: "internal-error",
                  message: "Internal error"
                });
              }
            }); //start listening

            app.listen(port, hostname, function () {
              console.log("The server is running at http://".concat(hostname, ":").concat(port));
            });

          case 35:
          case "end":
            return _context22.stop();
        }
      }
    }, _callee22, this);
  }));
  return _start.apply(this, arguments);
}

start().catch(console.error);