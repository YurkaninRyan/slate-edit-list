"use strict";

/**
 * Return the current list item, from current selection or from a node.
 *
 * @param {PluginOptions} opts
 * @param {Slate.State} state
 * @param {Slate.Block} block?
 * @return {Slate.Block || Void}
 */
function getCurrentItem(opts, state, block) {
    var document = state.document;


    if (!block) {
        if (!state.selection.startKey) return null;
        block = state.startBlock;
    }

    var parent = document.getParent(block.key);
    return parent && parent.type === opts.typeItem ? parent : null;
}

module.exports = getCurrentItem;