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
    }, { normalize: false });

    var updatedList = change.state.document.getFurthestAncestor(selectedBlocks[0].key);
    if (opts.types.includes(updatedList.type) && updatedList.nodes.size === 1 && opts.types.includes(updatedList.nodes.get(0).type)) {
        change.unwrapBlock(updatedList.type, { normalize: false });
    }

    // Wrap in list items
    selectedBlocks.forEach(function (node) {
        if (isList(opts, node)) {
            // Merge its items with the created list
            node.nodes.forEach(function (_ref) {
                var key = _ref.key;
                return change.unwrapNodeByKey(key, { normalize: false });
            });
        } else {
            change.wrapBlockByKey(node.key, opts.typeItem, { normalize: false });
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