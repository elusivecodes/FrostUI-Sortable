/**
 * FrostUI-Sortable v1.0.12
 * https://github.com/elusivecodes/FrostUI-Sortable
 */
(function(global, factory) {
    'use strict';

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory;
    } else {
        factory(global);
    }

})(window, function(window) {
    'use strict';

    if (!window) {
        throw new Error('FrostUI-Sortable requires a Window.');
    }

    if (!('UI' in window)) {
        throw new Error('FrostUI-Sortable requires FrostUI.');
    }

    const Core = window.Core;
    const DOM = window.DOM;
    const dom = window.dom;
    const UI = window.UI;
    const document = window.document;

    // {{code}}
});