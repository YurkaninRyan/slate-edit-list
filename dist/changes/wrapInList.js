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

    var wrapper = Slate.Block.create({
        type: type,
        data: Slate.Data.create(data)
    });

    var topLevelIndex = change.state.document.nodes.findIndex(function (node) {
        return node.key === selectedBlocks.get(0).key;
    });
    change.insertNodeByKey(change.state.document.key, topLevelIndex, wrapper, { normalize: false });
    selectedBlocks.forEach(function (block) {
        if (!change.state.document.getDescendant(block.key)) return;
        change.removeNodeByKey(block.key, { normalize: false });
    });

    selectedBlocks.forEach(function (block, index) {
        return change.insertNodeByKey(wrapper.key, index, block, { normalize: false });
    });

    // Wrap in list items
    wrapper = change.state.document.getDescendant(wrapper.key);
    wrapper.nodes.forEach(function (node) {
        if (isList(opts, node)) {
            // Merge its items with the created list
            node.nodes.forEach(function (_ref) {
                var key = _ref.key;
                return change.unwrapNodeByKey(key);
            });
        } else {
            if (node.kind === 'text') {
                if (!change.state.document.getDescendant(node.key)) {
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