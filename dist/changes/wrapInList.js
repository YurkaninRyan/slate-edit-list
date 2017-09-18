'use strict';

var Slate = require('slate');

var _require = require('immutable'),
    List = _require.List;

var isList = require('../isList');

/**
 * Wrap the blocks in the current selection in a new list. Selected
 * lists are merged together.
 *
 * @param  {PluginOptions} opts
 * @param  {Slate.Change}
 * @param  {String?} type
 * @param  {Object|Data?} [data]
 * @return {Change}
 */
function wrapInList(opts, change, ordered, data) {
    var selectedBlocks = getHighestSelectedBlocks(change.state);
    var type = ordered || opts.types[0];

    // Wrap in container
    change.wrapBlock({
        type: type,
        data: Slate.Data.create(data)
    });

    // Wrap in list items
    selectedBlocks.forEach(function (node) {
        if (isList(opts, node)) {
            // Merge its items with the created list
            node.nodes.forEach(function (_ref) {
                var key = _ref.key;
                return change.unwrapNodeByKey(key);
            });
        } else {
            change.wrapBlockByKey(node.key, opts.typeItem);
        }
    });

    return change;
}

/**
 * @param  {Slate.State} state
 * @return {List<Block>} The highest list of blocks that cover the
 * current selection
 */
function getHighestSelectedBlocks(state) {
    return List(new Set(state.blocks.map(function (block) {
        return state.document.getFurthestAncestor(block.key);
    })));
}

module.exports = wrapInList;