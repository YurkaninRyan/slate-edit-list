'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var isList = require('./isList');

/**
 * Create a schema for lists
 * @param {PluginOptions} The plugin options
 * @return {Object} A schema definition with rules to normalize lists
 */
function makeSchema(opts) {
    return {
        rules: [listsContainOnlyItems(opts), itemsDescendList(opts),
        // Must be after itemsDescendList
        itemsContainBlocks(opts), joinAdjacentLists(opts)]
    };
}

/**
 * @param {PluginOptions} The plugin options
 * @return {Object} A rule that ensure lists only contain list
 * items, and at least one.
 */
function listsContainOnlyItems(opts) {
    return {
        match: function match(node) {
            return isList(opts, node);
        },

        validate: function validate(list) {
            var notItems = list.nodes.filter(function (n) {
                return n.type !== opts.typeItem;
            });

            if (notItems.isEmpty()) {
                // Only valid list items
                return null;
            } else {
                // All the non items
                return {
                    toWrap: notItems
                };
            }
        },


        /**
         * @param {List<Nodes>} value.toWrap Children to wrap in list
         */
        normalize: function normalize(change, node, value) {
            value.toWrap.forEach(function (child) {
                return change.wrapBlockByKey(child.key, opts.typeItem);
            });
            return change;
        }
    };
}

/**
 * @param {PluginOptions} The plugin options
 * @return {Object} A rule that ensure list items are always children
 * of a list block.
 */
function itemsDescendList(opts) {
    return {
        match: function match(node) {
            return (node.kind === 'block' || node.kind === 'document') && !isList(opts, node);
        },
        validate: function validate(block) {
            var listItems = block.nodes.filter(function (n) {
                return n.type === opts.typeItem;
            });

            if (listItems.isEmpty()) {
                // No orphan list items. All good.
                return null;
            } else {
                // Unwrap the orphan list items
                return {
                    toUnwrap: listItems
                };
            }
        },


        /**
         * Unwrap the given blocks
         * @param {List<Nodes>} value.toUnwrap
         */
        normalize: function normalize(change, node, value) {
            value.toUnwrap.forEach(function (child) {
                return change.unwrapBlockByKey(child.key);
            });
            return change;
        }
    };
}

/**
 * @param {PluginOptions} The plugin options
 * @return {Object} A rule that ensure list items always contain
 * blocks.
 */
function itemsContainBlocks(opts) {
    return {
        match: function match(node) {
            return node.type === opts.typeItem;
        },

        validate: function validate(item) {
            var shouldWrap = item.nodes.some(function (node) {
                return node.kind !== 'block';
            });

            return shouldWrap || null;
        },


        /**
         * Wraps the children nodes in the default block
         */
        normalize: function normalize(change, node, _) {
            var noNorm = { normalize: false };

            change.wrapBlockByKey(node.nodes.first().key, opts.typeDefault, noNorm);

            var wrapper = change.state.document.getDescendant(node.key).nodes.first();

            // Add the remaining items
            node.nodes.rest().forEach(function (child, index) {
                return change.moveNodeByKey(child.key, wrapper.key, index + 1, noNorm);
            });

            return change;
        }
    };
}

/**
 * @param {PluginOptions} The plugin options
 * @return {Object} A rule that joins adjacent, same types lists
 */
function joinAdjacentLists(opts) {
    return {
        match: function match(node) {
            return node.kind === 'document' || node.kind === 'block';
        },

        validate: function validate(node) {
            var invalids = node.nodes.map(function (child, i) {
                if (!isList(opts, child)) return;
                var next = node.nodes.get(i + 1);
                if (!next || next.type !== child.type) return;
                return [child, next];
            }).filter(Boolean);

            return invalids.size ? invalids : null;
        },


        /**
         * Join the list pairs
         */
        normalize: function normalize(change, node, pairs) {
            // We join in reverse order, so that multiple lists folds onto the first one
            pairs.reverse().forEach(function (pair) {
                var _pair = _slicedToArray(pair, 2),
                    first = _pair[0],
                    second = _pair[1];

                var updatedSecond = change.state.document.getDescendant(second.key);
                updatedSecond.nodes.forEach(function (secondNode, index) {
                    change.insertNodeByKey(first.key, first.nodes.size + index, secondNode);
                });

                change.removeNodeByKey(second.key);
            });

            return change;
        }
    };
}

module.exports = makeSchema;