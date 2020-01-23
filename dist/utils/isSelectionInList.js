"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

require("slate");

var _getItemsAtRange = require("./getItemsAtRange");

var _getItemsAtRange2 = _interopRequireDefault(_getItemsAtRange);

var _getListForItem = require("./getListForItem");

var _getListForItem2 = _interopRequireDefault(_getListForItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * True if selection is inside a list (and can be unwrapped)
 */
function isSelectionInList(opts, value, type) {
  var items = (0, _getItemsAtRange2.default)(opts, value);
  return !items.isEmpty() && (
  // Check the type of the list if needed
  !type || (0, _getListForItem2.default)(opts, value, items.first()).get("type") === type);
}
exports.default = isSelectionInList;