"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

require("slate");

var _immutable = require("immutable");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The plugin options
 */
var Options = function (_Record) {
  (0, _inherits3.default)(Options, _Record);

  function Options() {
    (0, _classCallCheck3.default)(this, Options);
    return (0, _possibleConstructorReturn3.default)(this, (Options.__proto__ || (0, _getPrototypeOf2.default)(Options)).apply(this, arguments));
  }

  return Options;
}((0, _immutable.Record)({
  types: ["ul_list", "ol_list"],
  typeItem: "list_item",
  typeDefault: "paragraph",
  canMerge: function canMerge(a, b) {
    return a.type === b.type;
  }
}));

exports.default = Options;