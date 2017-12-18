export default function(plugin, change) {
    return plugin.onKeyDown(
        {
            key: 'Enter',
            preventDefault: () => {},
            stopPropagation: () => {},
            key: 'Enter'
        },
        change,
        {}
    );
}
