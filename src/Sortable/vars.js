// Sortable default options
Sortable.defaults = {
    appendTo: 'body',
    axis: null,
    cancel: 'input, textarea, button, select, option',
    connectWith: null,
    containment: null,
    cursor: 'auto',
    disabled: false,
    dropOnEmpty: true,
    forceHelperSize: true,
    forcePlaceholderSize: true,
    handle: null,
    helperClass: null,
    items: ':scope > li',
    opacity: .9,
    placeholderClass: 'bg-light',
    zIndex: 1000,
    scroll: true,
    scrollSensitivity: 20,
    scrollSpeed: 20
};

UI.initComponent('sortable', Sortable);

UI.Sortable = Sortable;
