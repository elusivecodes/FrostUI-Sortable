import { initComponent } from '@fr0st/ui';
import Sortable from './sortable.js';
import { _events } from './prototype/events.js';
import { _checkScroll, _refreshCursors, _updateTarget } from './prototype/helpers.js';

// Sortable default options
Sortable.defaults = {
    appendTo: 'body',
    axis: null,
    cancel: 'input, textarea, button, select, option',
    connectWith: null,
    cursor: 'auto',
    disabled: false,
    dropOnEmpty: true,
    handle: null,
    helperClass: 'bg-body-tertiary',
    items: ':scope > li',
    scroll: true,
    scrollSensitivity: 20,
    scrollSpeed: 5,
};

// Sortable prototype
const proto = Sortable.prototype;

proto._checkScroll = _checkScroll;
proto._events = _events;
proto._refreshCursors = _refreshCursors;
proto._updateTarget = _updateTarget;

// Sortable init
initComponent('sortable', Sortable);

export default Sortable;
