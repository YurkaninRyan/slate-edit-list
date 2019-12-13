"use strict";

var isList = require("./isList");

/**
 * Create a schema for lists
 * @param {PluginOptions} The plugin options
 * @return {Object} A schema definition with rules to normalize lists
 */
function makeSchema(opts) {
  return {
    rules: [
      listsContainOnlyItems(opts),
      itemsDescendList(opts),
      // Must be after itemsDescendList
      itemsContainBlocks(opts)
    ]
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
      var notItems = list.nodes.filter(function(n) {
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
      value.toWrap.forEach(function(child) {
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
      return (
        (node.object === "block" || node.object === "document") &&
        !isList(opts, node)
      );
    },
    validate: function validate(block) {
      var listItems = block.nodes.filter(function(n) {
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
      value.toUnwrap.forEach(function(child) {
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
      var shouldWrap = item.nodes.some(function(node) {
        return node.object !== "block";
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
      node.nodes.rest().forEach(function(child, index) {
        return change.moveNodeByKey(child.key, wrapper.key, index + 1, noNorm);
      });

      return change;
    }
  };
}

module.exports = makeSchema;
