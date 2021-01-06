/**
 * Sortable Helpers
 */

Object.assign(Sortable.prototype, {

    /**
     * Check for window scroll.
     * @param {number} x The mouse X position.
     * @param {number} y The mouse Y position.
     */
    _checkScroll(x, y) {
        let offsetY = dom.getScrollY(window);
        let offsetX = dom.getScrollX(window);

        if (y < offsetY + this._settings.scrollSensitivity) {
            offsetY = Math.max(0, offsetY - this._settings.scrollSpeed);
        } else if (y > offsetY + dom.height(window) - this._settings.scrollSensitivity) {
            const docHeight = dom.height(document);
            offsetY = Math.min(docHeight, offsetY - this._settings.scrollSpeed);
        }

        if (x < offsetX + this._settings.scrollSensitivity) {
            offsetX = Math.max(0, offsetX - this._settings.scrollSpeed);
        } else if (x > offsetX + dom.width(window) - this._settings.scrollSensitivity) {
            const docWidth = dom.width(document);
            offsetX = Math.min(docWidth, offsetX - this._settings.scrollSpeed);
        }

        dom.setScroll(offsetX, offsetY);
    },

    /**
     * Find the nearest item to the mouse.
     * @param {array} items The current Sortable items.
     * @param {number} x The mouse X position.
     * @param {number} y The mouse Y position.
     * @returns {HTMLElement} The nearest item.
     */
    _findNearestItem(items, x, y) {
        items = items.filter(node => !dom.isSame(node, this._placeholder));

        return dom.nearestTo(items, x, y, true);
    },

    /**
     * Find the nearest Sortable to the mouse.
     * @param {number} x The mouse X position.
     * @param {number} y The mouse Y position.
     * @returns {HTMLElement} The nearest Sortable.
     */
    _findNearestSortable(x, y) {
        if (!this._settings.connectWith) {
            return this._node;
        }

        const connected = dom.find(this._settings.connectWith).filter(node => Sortable.init(node).isDropTarget());

        if (!connected.length) {
            return this._node;
        }

        return dom.nearestTo([this._node, ...connected], x, y, true);
    },

    /**
     * Find the Sortable target from an event target.
     * @param {HTMLElement} target The event target.
     * @returns {HTMLElement} The Sortable target.
     */
    _findTarget(target) {
        if (!this._settings.handle) {
            return target;
        }

        return this.items().find(node => dom.contains(node, target));
    },

    /**
     * Refresh Sortable item cursors.
     */
    _refreshCursors() {
        const elements = dom.find(this._selector, this._node);
        dom.setStyle(elements, 'cursor', this._settings.cursor);
    }

});
