"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slate = require("slate");

var _immutable = require("immutable");

var _utils = require("../utils");

/**
 * Wrap the blocks in the current selection in a new list. Selected
 * lists are merged together.
 */
function wrapInList(opts, change, type, data) {
  var selectedBlocks = getHighestSelectedBlocks(change.value);
  type = type || opts.types[0];

  var wrapper = _slate.Block.create({
    type: type,
    data: _slate.Data.create(data)
  });

  var topLevelIndex = change.value.document.nodes.findIndex(function (node) {
    return node.key === selectedBlocks.get(0).key;
  });
  change.insertNodeByKey(change.value.document.key, topLevelIndex, wrapper, {
    normalize: false
  });
  selectedBlocks.forEach(function (block) {
    if (!change.value.document.getDescendant(block.key)) return;
    change.removeNodeByKey(block.key, { normalize: false });
  });

  selectedBlocks.forEach(function (block, index) {
    return change.insertNodeByKey(wrapper.key, index, block, { normalize: false });
  });

  // Wrap in list items
  wrapper = change.value.document.getDescendant(wrapper.key);
  wrapper.nodes.forEach(function (node) {
    if ((0, _utils.isList)(opts, node)) {
      // Merge its items with the created list
      node.nodes.forEach(function (_ref) {
        var key = _ref.key;
        return change.unwrapNodeByKey(key, { normalize: false });
      });
    } else {
      if (node.object === "text") {
        if (!change.value.document.getDescendant(node.key)) {
          return;
        }
        return change.removeTextByKey(node.key);
      }
      change.wrapBlockByKey(node.key, opts.typeItem);
    }
  });

  return change;
}

/**
 * Returns the highest list of blocks that cover the current selection
 */

function getHighestSelectedBlocks(state) {
  return (0, _immutable.List)(new Set(state.blocks.map(function (block) {
    return state.document.getFurthestAncestor(block.key);
  })));
}

exports.default = wrapInList;