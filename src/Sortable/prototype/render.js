/**
 * Sortable Render
 */

Object.assign(Sortable.prototype, {

    /**
     * Build the placeholder element.
     */
    _buildPlaceholder() {
        const tagName = dom.tagName(this._target);
        this._placeholder = dom.create(tagName, {
            class: dom.getAttribute(this._target, 'class')
        });

        if (this._settings.placeholderClass) {
            dom.addClass(this._placeholder, this._settings.placeholderClass);
        }

        if (this._settings.forcePlaceholderSize) {
            const targetBox = dom.rect(this._target, true);
            dom.setStyle(this._placeholder, {
                width: `${targetBox.width}px`,
                height: `${targetBox.height}px`
            });
        }
    },

    /**
     * Initialize the target element for sorting.
     * @param {number} x The mouse X position.
     * @param {number} y The mouse Y position.
     */
    _initTarget(x, y) {
        this._originalStyle = dom.getAttribute(this._target, 'style');

        const targetBox = dom.rect(this._target, true);

        if (this._settings.forceHelperSize) {
            dom.setStyle(this._target, {
                width: `${targetBox.width}px`,
                height: `${targetBox.height}px`
            });
        }

        let targetX = targetBox.x;
        let targetY = targetBox.y;
        this._offsetX = x - targetX;
        this._offsetY = y - targetY;

        const appendTo = dom.findOne(this._settings.appendTo);

        let offsetParent;
        if (!dom.isSame(appendTo, document.body) && dom.css(appendTo, 'position') === 'relative') {
            offsetParent = appendTo;
        } else {
            offsetParent = dom.closest(appendTo, node => dom.css(node, 'position') === 'relative', document.body).shift();
        }

        if (offsetParent) {
            const offset = dom.position(offsetParent, true);
            this._offsetX += offset.x;
            this._offsetY += offset.y;
            targetX -= offset.x;
            targetY -= offset.y;
        }

        dom.setStyle(this._target, 'position', 'absolute');

        if (this._settings.axis === 'y') {
            dom.setStyle(this._target, 'left', targetX);
        } else if (this._settings.axis === 'x') {
            dom.setStyle(this._target, 'top', targetY);
        }

        if (this._settings.opacity) {
            dom.setStyle(this._target, 'opacity', this._settings.opacity);
        }

        dom.setStyle(this._target, 'zIndex', this._settings.zIndex);

        if (this._settings.helperClass) {
            dom.addClass(this._target, this._settings.helperClass);
        }

        dom.append(appendTo, this._target);
    },

    /**
     * Update the placeholder element.
     * @param {HTMLElement} nearestItem The current nearest item.
     * @param {number} x The mouse X position.
     * @param {number} y The mouse Y position.
     */
    _updatePlaceholder(nearestItem, x, y) {
        const nearestCenter = dom.center(nearestItem, true);
        const placeholderCenter = dom.center(this._placeholder, true);

        let method;
        if (this._settings.axis === 'y' || nearestCenter.x === placeholderCenter.x) {
            method = y < nearestCenter.y ?
                'before' :
                'after';
        } else if (this._settings.axis === 'x' || nearestCenter.y === placeholderCenter.y) {
            method = x < nearestCenter.x ?
                'before' :
                'after';
        } else {
            method = x < nearestCenter.x && y < nearestCenter.y ?
                'before' :
                'after';
        }

        dom[method](nearestItem, this._placeholder);
    },

    /**
     * Update the target element.
     * @param {number} x The mouse X position.
     * @param {number} y The mouse Y position.
     */
    _updateTarget(x, y) {
        if (!this._settings.axis || this._settings.axis === 'y') {
            const top = y - this._offsetY;
            dom.setStyle(this._target, 'top', `${top}px`);
        }

        if (!this._settings.axis || this._settings.axis === 'x') {
            const left = x - this._offsetX;
            dom.setStyle(this._target, 'left', `${left}px`);
        }

        if (this._settings.containment) {
            dom.constrain(this._target, this._settings.containment);
        }
    }

});
