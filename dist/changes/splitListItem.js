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
  var focusTextParent = change.state.document.getParent(change.state.focusText.key);
  var splitOffset = focusTextParent.getOffsetAtRange(state.selection.collapseToStart());
  return change.splitDescendantsByKey(currentItem.key, state.focusText.key, splitOffset);
}

module.exports = splitListItem;