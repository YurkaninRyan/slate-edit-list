const expect = require('expect');

module.exports = function(plugin, change) {
    const ret = plugin.onKeyDown(
        {
            key: 'Enter',
            shiftKey: true,
            preventDefault: () => {},
            stopPropagation: () => {}
        },
        change
    );

    expect(ret === null).toBe(true);
};
