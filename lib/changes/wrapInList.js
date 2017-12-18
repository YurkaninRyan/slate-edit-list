// @flow
import { Data, type Value, type Change, Block } from 'slate';
import { List } from 'immutable';

import type Options from '../options';
import { isList } from '../utils';

/**
 * Wrap the blocks in the current selection in a new list. Selected
 * lists are merged together.
 */
function wrapInList(
    opts: Options,
    change: Change,
    type?: string,
    data?: Object | Data
): Change {
    const selectedBlocks = getHighestSelectedBlocks(change.value);
    type = type || opts.types[0];

    let wrapper = Block.create({
        type,
        data: Data.create(data)
    });

    const topLevelIndex = change.value.document.nodes.findIndex(
        node => node.key === selectedBlocks.get(0).key
    );
    change.insertNodeByKey(change.value.document.key, topLevelIndex, wrapper, {
        normalize: false
    });
    selectedBlocks.forEach(block => {
        if (!change.value.document.getDescendant(block.key)) return;
        change.removeNodeByKey(block.key, { normalize: false });
    });

    selectedBlocks.forEach((block, index) =>
        change.insertNodeByKey(wrapper.key, index, block, { normalize: false })
    );

    // Wrap in list items
    wrapper = change.value.document.getDescendant(wrapper.key);
    wrapper.nodes.forEach(node => {
        if (isList(opts, node)) {
            // Merge its items with the created list
            node.nodes.forEach(({ key }) =>
                change.unwrapNodeByKey(key, { normalize: false })
            );
        } else {
            if (node.kind === 'text') {
                if (!change.value.document.getDescendant(node.key)) {
                    return;
                }
                return change.removeTextByKey(node.key);
            }
            change.wrapBlockByKey(node.key, opts.typeItem);
        }
    });

    return change;
}

/**
 * Returns the highest list of blocks that cover the current selection
 */
function getHighestSelectedBlocks(state) {
    return List(
        new Set(
            state.blocks.map(block =>
                state.document.getFurthestAncestor(block.key)
            )
        )
    );
}

export default wrapInList;
