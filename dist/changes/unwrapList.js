'use strict';

var getItemsAtRange = require('../getItemsAtRange');

/**
 * Unwrap items at range from their list.
 *
 * @param  {PluginOptions} opts
 * @param  {Slate.Change} change
 * @return {Change}
 */
function unwrapList(opts, change) {
    var items = getItemsAtRange(opts, change.state);

    if (items.isEmpty()) {
        return change;
    }

    // Unwrap the items from their list
    items.forEach(function (item) {
        return change.unwrapNodeByKey(item.key);
    });

    // Parent of the list of the items
    var firstItem = items.first();
    var parent = change.state.document.getParent(firstItem.key);

    var index = parent.nodes.findIndex(function (node) {
        return node.key === firstItem.key;
    });

    // Unwrap the items' children
    items.forEach(function (item) {
        item.nodes.forEach(function (node) {
            change.moveNodeByKey(node.key, parent.key, index, node, { normalize: false });
            index++;
        });
    });

    // Finally, remove the now empty items
    items.forEach(function (item) {
        return change.removeNodeByKey(item.key);
    });

    return change;
}

module.exports = unwrapList;