const Slate = require('slate');
const { List } = require('immutable');
const isList = require('../isList');

/**
 * Wrap the blocks in the current selection in a new list. Selected
 * lists are merged together.
 *
 * @param  {PluginOptions} opts
 * @param  {Slate.Change}
 * @param  {String?} type
 * @param  {Object|Data?} [data]
 * @return {Change}
 */
function wrapInList(opts, change, ordered, data) {
    const selectedBlocks = getHighestSelectedBlocks(change.state);
    const type = ordered || opts.types[0];

    const wrapper = Slate.Block.create({
        type,
        data: Slate.Data.create(data)
    });

    change.insertBlock(wrapper);
    selectedBlocks.forEach((block, index) => change.moveNodeByKey(block.key, wrapper.key, index));

    // Wrap in list items
    wrapper.nodes.forEach((node) => {
        if (isList(opts, node)) {
            // Merge its items with the created list
            node.nodes.forEach(({ key }) => change.unwrapNodeByKey(key, { normalize: false }));
        } else {
            change.wrapBlockByKey(node.key, opts.typeItem, { normalize: false });
        }
    });

    return change;
}

/**
 * @param  {Slate.State} state
 * @return {List<Block>} The highest list of blocks that cover the
 * current selection
 */
function getHighestSelectedBlocks(state) {
    return List(
      new Set(
        state.blocks.map(block => state.document.getFurthestAncestor(block.key))
      )
    );
}

module.exports = wrapInList;
