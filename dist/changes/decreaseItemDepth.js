'use strict';

var Slate = require('slate');
var getItemDepth = require('../getItemDepth');
var getCurrentItem = require('../getCurrentItem');

/**
 * Decreases the depth of the current item. The following items will
 * be moved as sublist of the decreased item.
 *
 * No-op for root items.
 *
 * @param  {PluginOptions} opts
 * @param  {Change} transform
 * @return {Change}
 */
function decreaseItemDepth(opts, change, ordered) {
    var state = change.state;
    var document = state.document;

    // Cannot decrease item depth of root items

    var depth = getItemDepth(opts, state);
    if (depth == 1) {
        return change;
    }

    var currentItem = getCurrentItem(opts, state);
    var currentList = document.getParent(currentItem.key);
    var parentItem = document.getParent(currentList.key);
    var parentList = document.getParent(parentItem.key);
    // The items following the item will be moved to a sublist of currentItem
    var followingItems = currentList.nodes.skipUntil(function (i) {
        return i === currentItem;
    }).rest();

    // True if the currentItem and the followingItems make the whole
    // currentList, and hence the currentList will be emptied
    var willEmptyCurrentList = currentList.nodes.size === followingItems.size + 1;

    if (!followingItems.isEmpty()) {
        (function () {
            // Add them as sublist of currentItem
            var sublist = Slate.Block.create({
                kind: 'block',
                type: currentList.type,
                data: currentList.data
            });
            // Add the sublist
            change.insertNodeByKey(currentItem.key, currentItem.nodes.size, sublist, { normalize: false });

            change.moveNodeByKey(currentItem.key, parentList.key, parentList.nodes.indexOf(parentItem) + 1);

            // Creating a block now adds a text node.  Lets get rid of it.
            var extraEmptyText = sublist.nodes.get(0);

            // Move the followingItems to the sublist
            followingItems.forEach(function (item, index) {
                return change.moveNodeByKey(item.key, sublist.key, sublist.nodes.size + index, { normalize: false });
            });

            change.removeNodeByKey(extraEmptyText.key);
        })();
    } else {
        change.moveNodeByKey(currentItem.key, parentList.key, parentList.nodes.indexOf(parentItem) + 1);
    }

    // Remove the currentList completely if needed
    if (willEmptyCurrentList) {
        change.removeNodeByKey(currentList.key);
    }

    return change;
}

module.exports = decreaseItemDepth;