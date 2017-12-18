'use strict';

var getCurrentItem = require('./getCurrentItem');

/**
 * Get depth of current block in a document list
 *
 * @param {PluginOptions} opts
 * @param {Slate.State} state
 * @param {Slate.Block} block?
 * @return {Number}
 */
function getItemDepth(opts, state, block) {
    var document = state.document,
        startBlock = state.startBlock;

    block = block || startBlock;

    var currentItem = getCurrentItem(opts, state, block);
    if (!currentItem) {
        return 0;
    }

    var list = document.getParent(currentItem.key);

    return 1 + getItemDepth(opts, state, list);
}

module.exports = getItemDepth;