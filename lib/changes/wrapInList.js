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

    let wrapper = Slate.Block.create({
        type,
        data: Slate.Data.create(data)
    });

    change.insertBlock(wrapper, { normalize: false });
    selectedBlocks.forEach((block) => {
        if (!change.state.document.getDescendant(block.key)) return;
        change.removeNodeByKey(block.key, { normalize: false });
    });

    selectedBlocks.forEach((block, index) => change.insertNodeByKey(wrapper.key, index, block, { normalize: false }));

    // Wrap in list items
    wrapper = change.state.document.getDescendant(wrapper.key);
    wrapper.nodes.forEach((node) => {
        if (isList(opts, node)) {
            // Merge its items with the created list
            node.nodes.forEach(({ key }) => change.unwrapNodeByKey(key));
        } else {
            if (node.kind === 'text') {
                if (!change.state.document.getDescendant(node.key)) { return; }
                return change.removeTextByKey(node.key);
            }
            change.wrapBlockByKey(node.key, opts.typeItem);
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
