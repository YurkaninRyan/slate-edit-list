"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

require("slate");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a schema definition with rules to normalize lists
 */
function schema(opts) {
  var constructedSchema = {
    blocks: (0, _defineProperty3.default)({}, opts.typeItem, {
      parent: { types: opts.types },
      nodes: [{ objects: ["block"] }],

      normalize: normalize({
        parent_type_invalid: function parent_type_invalid(change, context) {
          return change.unwrapBlockByKey(context.node.key, {
            normalize: false
          });
        },
        child_object_invalid: function child_object_invalid(change, context) {
          return wrapChildrenInDefaultBlock(opts, change, context.node);
        }
      })
    })
  };

  // validate all list types, ensure they only have list item children
  opts.types.forEach(function (type) {
    constructedSchema.blocks[type] = {
      nodes: [{ types: [opts.typeItem] }],
      normalize: normalize({
        child_type_invalid: function child_type_invalid(change, context) {
          return change.wrapBlockByKey(context.child.key, opts.typeItem, {
            normalize: false
          });
        }
      })
    };
  });

  return constructedSchema;
}

/*
 * Allows to define a normalize function through a keyed collection of functions
 */

function normalize(reasons) {
  return function (change, reason, context) {
    var reasonFn = reasons[reason];
    if (reasonFn) {
      reasonFn(change, context);
    }
  };
}

/**
 * Wraps all child of a node in the default block type.
 * Returns a change, for chaining purposes
 */
function wrapChildrenInDefaultBlock(opts, change, node) {
  change.wrapBlockByKey(node.nodes.first().key, opts.typeDefault, {
    normalize: false
  });

  var wrapper = change.value.document.getDescendant(node.key).nodes.first();

  // Add in the remaining items
  node.nodes.rest().forEach(function (child, index) {
    return change.moveNodeByKey(child.key, wrapper.key, index + 1, {
      normalize: false
    });
  });

  return change;
}

exports.default = schema;