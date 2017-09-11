'use strict';

var Slate = require('slate');

var getPreviousItem = require('../getPreviousItem');
var getCurrentItem = require('../getCurrentItem');
var getListForItem = require('../getListForItem');
var isList = require('../isList');

/**
 * Increase the depth of the current item by putting it in a sub-list
 * of previous item.
 * For first items in a list, does nothing.
 *
 * @param  {PluginOptions} opts
 * @param  {Slate.Change} change
 * @return {Slate.Change}
 */
function increaseItemDepth(opts, change) {
    var previousItem = getPreviousItem(opts, change.state);

    if (!previousItem) {
        return change;
    }

    var currentItem = getCurrentItem(opts, change.state);

    // Move the item in the sublist of previous item
    return moveAsSubItem(opts, change, currentItem, previousItem.key);
}

/**
 * Move the given item to the list at the end of destination node,
 * creating one if needed.
 *
 * @param {PluginOptions} opts
 * @param {Slate.Change} change
 * @param {Slate.Block} item The list item to add
 * @param {String} destKey The key of the destination node
 * @return {Slate.Change}
 */
function moveAsSubItem(opts, change, item, destKey) {
    var destination = change.state.document.getDescendant(destKey);
    var lastIndex = destination.nodes.size;
    var lastChild = destination.nodes.last();

    // The potential existing last child list
    var existingList = isList(opts, lastChild) ? lastChild : null;

    if (existingList) {
        return change.moveNodeByKey(item.key, existingList.key, existingList.nodes.size // as last item
        );
    } else {
        var currentList = getListForItem(opts, change.state, destination);

        var newSublist = Slate.Block.create({
            kind: 'block',
            type: currentList.type,
            data: currentList.data
        });

        change.insertNodeByKey(destKey, lastIndex, newSublist);

        return change.moveNodeByKey(item.key, newSublist.key, 0);
    }
}

module.exports = increaseItemDepth;