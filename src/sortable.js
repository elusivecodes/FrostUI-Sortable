import $ from '@fr0st/query';
import { BaseComponent } from '@fr0st/ui';

/**
 * Sortable Class
 * @class
 */
export default class Sortable extends BaseComponent {
    /**
     * New Sortable constructor.
     * @param {HTMLElement} node The input node.
     * @param {object} [options] The options to create the Sortable with.
     */
    constructor(node, options) {
        super(node, options);

        this._selector = this._options.items;
        if (this._options.handle) {
            this._selector += ' ' + this._options.handle;
        }

        this._enabled = !this._options.disabled;

        this._refreshCursors();
        this._events();
    }

    /**
     * Disable the Sortable.
     */
    disable() {
        this._enabled = false;
    }

    /**
     * Dispose the Sortable.
     */
    dispose() {
        $.removeEventDelegate(this._node, 'mousedown.ui.sortable touchstart.ui.sortable');
        $.removeEvent(this._node, 'receive.ui.sortable');

        this._target = null;
        this._currentSortable = null;

        super.dispose();
    }

    /**
     * Enable the Sortable.
     */
    enable() {
        this._enabled = true;
    }

    /**
     * Get the Sortable item elements.
     * @return {array} The Sortable item elements.
     */
    items() {
        return $.find(this._options.items, this._node);
    }
}
