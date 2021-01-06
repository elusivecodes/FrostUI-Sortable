/**
 * Sortable Class
 * @class
 */
class Sortable extends UI.BaseComponent {

    /**
     * New Sortable constructor.
     * @param {HTMLElement} node The input node.
     * @param {object} [settings] The options to create the Sortable with.
     * @returns {Sortable} A new Sortable object.
     */
    constructor(node, settings) {
        super(node, settings);

        this._selector = this._settings.items;
        if (this._settings.handle) {
            this._selector += ' ' + this._settings.handle;
        }

        this._enabled = !this._settings.disabled;

        this._refreshCursors();
        this._events();
    }

    /**
     * Dispose the Sortable.
     */
    dispose() {
        dom.removeEventDelegate(this._node, 'mousedown.ui.sortable');
        dom.removeEvent(this._node, 'receive.ui.sortable');
        dom.remove(this._placeholder);

        this._target = null;
        this._placeholder = null;
        this._currentSortable = null;

        super.dispose();
    }

    /**
     * Disable the Sortable.
     * @returns {Sortable} The Sortable.
     */
    disable() {
        this._enabled = false;

        return this;
    }

    /**
     * Enable the Sortable.
     * @returns {Sortable} The Sortable.
     */
    enable() {
        this._enabled = true;

        return this;
    }

    /**
     * Determine if the Sortable is a valid drop target.
     * @returns {Boolean} True if the Sortable is a valid drop target, otherwise FALSE.
     */
    isDropTarget() {
        return this._settings.dropOnEmpty || this.items().length;
    }

    /**
     * Get the Sortable item elements.
     * @returns {array} The Sortable item elements.
     */
    items() {
        return dom.find(this._settings.items, this._node);
    }

}
