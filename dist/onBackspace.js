'use strict';

var unwrapList = require('./changes/unwrapList');
var getCurrentItem = require('./getCurrentItem');

/**
 * User pressed Delete in an editor
 */
function onBackspace(event, data, change, opts) {
    var state = change.state;
    var startOffset = state.startOffset,
        selection = state.selection;

    // Only unwrap...
    // ... with a collapsed selection

    if (selection.isExpanded) return;

    // ... when at the beginning of nodes
    if (startOffset > 0) return;
    // ... in a list
    var currentItem = getCurrentItem(opts, state);
    if (!currentItem) return;
    // ... more precisely at the beginning of the current item
    if (!selection.isAtStartOf(currentItem)) return;

    event.preventDefault();
    return unwrapList(opts, change);
}

module.exports = onBackspace;