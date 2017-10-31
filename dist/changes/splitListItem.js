'use strict';

var getCurrentItem = require('../getCurrentItem');

/**
 * Split a list item.
 *
 * @param  {Object} opts
 * @param  {Slate.Change} change
 * @return {Slate.Change}
 */
function splitListItem(opts, change) {
  var state = change.state;

  var currentItem = getCurrentItem(opts, state);

  if (change.state.selection.isExpanded) change.delete();

  return change.splitDescendantsByKey(currentItem.key, state.focusText.key, change.state.selection.anchorOffset);
}

module.exports = splitListItem;