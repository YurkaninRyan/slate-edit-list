export default function(plugin, change) {
    const { value } = change;
    const selectedBlock = value.document.getDescendant('_selection_key');
    change.collapseToStartOf(selectedBlock);

    plugin.onKeyDown(
        {
            key: 'Backspace',
            preventDefault: () => {},
            stopPropagation: () => {},
            key: 'Backspace'
        },
        change,
        {}
    );

    return change;
}
