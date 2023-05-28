import $ from '@fr0st/query';

/**
 * Check for window scroll.
 */
export function _checkScroll() {
    $.hide(this._target);

    const originalX = $.getScrollX(window);
    const originalY = $.getScrollY(window);

    let offsetX = originalX;
    let offsetY = originalY;

    if (this._pos.y < originalY + this._options.scrollSensitivity) {
        offsetY = Math.max(0, originalY - this._options.scrollSpeed);
    } else if (this._pos.y > originalY + $.height(window) - this._options.scrollSensitivity) {
        const docHeight = $.height(document, { boxSize: $.SCROLL_BOX });
        offsetY = Math.min(docHeight, originalY + this._options.scrollSpeed);
    }

    if (this._pos.x < originalX + this._options.scrollSensitivity) {
        offsetX = Math.max(0, originalX - this._options.scrollSpeed);
    } else if (this._pos.x > originalX + $.width(window) - this._options.scrollSensitivity) {
        const docWidth = $.width(document, { boxSize: $.SCROLL_BOX });
        offsetX = Math.min(docWidth, originalX + this._options.scrollSpeed);
    }

    if (offsetX !== originalX || offsetY !== originalY) {
        $.setStyle(':root', { scrollBehavior: 'initial' });
        $.setScroll(document, offsetX, offsetY);
        $.setStyle(':root', { scrollBehavior: '' });

        this._pos.x += offsetX - originalX;
        this._pos.y += offsetY - originalY;
    }

    $.show(this._target);

    this._checkScrollTimer = setTimeout((_) => {
        this._checkScroll();
    }, 0);
};

/**
 * Refresh Sortable item cursors.
 */
export function _refreshCursors() {
    const elements = $.find(this._selector, this._node);

    $.setStyle(elements, { cursor: this._options.cursor });
};

/**
 * Update the target element.
 * @param {HTMLElement} nearestItem The current nearest item.
 * @param {number} x The mouse X position.
 * @param {number} y The mouse Y position.
 */
export function _updateTarget(nearestItem, x, y) {
    const nearestCenter = $.center(nearestItem, { offset: true });
    const targetCenter = $.center(this._target, { offset: true });

    let method;
    if (this._options.axis === 'y' || nearestCenter.x === targetCenter.x) {
        method = y < nearestCenter.y ?
            'before' :
            'after';
    } else if (this._options.axis === 'x' || nearestCenter.y === targetCenter.y) {
        method = x < nearestCenter.x ?
            'before' :
            'after';
    } else {
        method = x < nearestCenter.x && y < nearestCenter.y ?
            'before' :
            'after';
    }

    $[method](nearestItem, this._target);
};
