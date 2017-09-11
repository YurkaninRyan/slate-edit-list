'use strict';

var getCurrentItem = require('./getCurrentItem');

/**
 * Return the previous item, from current selection or from a node.
 *
 * @param {PluginOptions} opts
 * @param {Slate.State} state
 * @param {Slate.Block} block?
 * @return {Slate.Block || Void}
 */
function getPreviousItem(opts, state, block) {
    var document = state.document,
        startBlock = state.startBlock;

    block = block || startBlock;

    var currentItem = getCurrentItem(opts, state, block);

    var previousSibling = document.getPreviousSibling(currentItem.key);

    if (!previousSibling) {
        return null;
    } else if (previousSibling.type === opts.typeItem) {
        return previousSibling;
    } else {
        return null;
    }
}

module.exports = getPreviousItem;