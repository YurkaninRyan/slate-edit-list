
module.exports = function(plugin, change) {
    const { state } = change;
    const selectedBlock = state.document.getDescendant('_selection_key');
    change.collapseToStartOf(selectedBlock);

    return plugin.onKeyDown(
        {
            key: 'Backspace',
            preventDefault: () => {},
            stopPropagation: () => {}
        },
        change
    );
};
