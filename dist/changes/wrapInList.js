'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slate = require('slate');

var _immutable = require('immutable');

var _utils = require('../utils');

/**
 * Wrap the blocks in the current selection in a new list. Selected
 * lists are merged together.
 */
function wrapInList(opts, change, type, data) {
    var selectedBlocks = getHighestSelectedBlocks(change.value);
    type = type || opts.types[0];

    // Wrap in container
    change.wrapBlock({
        type: type,
        data: _slate.Data.create(data)
    }, { normalize: false });

    // Wrap in list items
    selectedBlocks.forEach(function (node) {
        if ((0, _utils.isList)(opts, node)) {
            // Merge its items with the created list
            node.nodes.forEach(function (_ref) {
                var key = _ref.key;
                return change.unwrapNodeByKey(key, { normalize: false });
            });
        } else {
            change.wrapBlockByKey(node.key, opts.typeItem, {
                normalize: false
            });
        }
    });

    return change;
}

/**
 * Returns the highest list of blocks that cover the current selection
 */

function getHighestSelectedBlocks(value) {
    return (0, _immutable.List)(new Set(value.blocks.map(function (block) {
        return value.document.getFurthestAncestor(block.key);
    })));
}

exports.default = wrapInList;