"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

require("slate");

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a schema definition with rules to normalize lists
 */
function validateNode(opts) {
  return function (node) {
    return joinAdjacentLists(opts, node);
  };
}

/**
 * A rule that joins adjacent lists of the same type
 */
function joinAdjacentLists(opts, node) {
  if (node.object !== "document" && node.object !== "block") {
    return undefined;
  }

  var invalids = node.nodes.map(function (child, i) {
    if (!(0, _utils.isList)(opts, child)) return null;
    var next = node.nodes.get(i + 1);
    if (!next || !(0, _utils.isList)(opts, next) || !opts.canMerge(child, next)) {
      return null;
    }

    return [child, next];
  }).filter(Boolean);

  if (invalids.isEmpty()) {
    return undefined;
  }

  /**
   * Join the list pairs
   */
  // We join in reverse order, so that multiple lists folds onto the first one
  return function (change) {
    invalids.reverse().forEach(function (pair) {
      var _pair = (0, _slicedToArray3.default)(pair, 2),
          first = _pair[0],
          second = _pair[1];

      var updatedSecond = change.value.document.getDescendant(second.key);
      updatedSecond.nodes.forEach(function (secondNode, index) {
        change.moveNodeByKey(secondNode.key, first.key, first.nodes.size + index, { normalize: false });
      });

      change.removeNodeByKey(second.key, { normalize: false });
    });
  };
}

exports.default = validateNode;