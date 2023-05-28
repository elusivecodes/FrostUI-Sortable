(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@fr0st/ui'), require('@fr0st/query')) :
    typeof define === 'function' && define.amd ? define(['exports', '@fr0st/ui', '@fr0st/query'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.UI = global.UI || {}, global.UI, global.fQuery));
})(this, (function (exports, ui, $) { 'use strict';

    /**
     * Sortable Class
     * @class
     */
    class Sortable extends ui.BaseComponent {
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

    /**
     * Attach events for the Sortable.
     */
    function _events() {
        const downEvent = (e) => {
            if (
                e.button ||
                !this._enabled ||
                $.is(e.currentTarget, this._options.cancel) ||
                $.getDataset(this._node, 'uiDragging')
            ) {
                return false;
            }

            if (e.type === 'mousedown') {
                e.preventDefault();
            }

            this._target = this._options.handle ?
                this.items().find((node) => $.hasDescendent(node, e.currentTarget)) :
                e.currentTarget;
        };

        const moveEvent = (e) => {
            this._pos = ui.getPosition(e);

            if (!$.getDataset(this._node, 'uiDragging')) {
                $.setDataset(this._node, { uiDragging: true });

                this._startIndex = $.index(this._target);
                this._currentIndex = this._startIndex;

                $.triggerEvent(this._node, 'sort.ui.sortable', {
                    detail: {
                        target: this._target,
                    },
                });

                if (this._options.helperClass) {
                    $.addClass(this._target, this._options.helperClass);
                }

                this._currentSortable = this._node;

                if (this._options.scroll) {
                    this._checkScroll();
                }
            }

            let nearestSortable = this._node;

            if (this._options.connectWith) {
                const connected = $.find(this._options.connectWith)
                    .filter((node) => {
                        const sortable = this.constructor.init(node);

                        return sortable._options.dropOnEmpty || sortable.items().length;
                    });

                if (connected.length) {
                    nearestSortable = $.nearestTo([this._node, ...connected], this._pos.x, this._pos.y, { offset: true });
                }
            }

            const nearestItems = $.isSame(this._node, nearestSortable) ?
                this.items() :
                this.constructor.init(nearestSortable).items();

            const nearestItem = $.nearestTo(nearestItems, this._pos.x, this._pos.y, { offset: true });

            if (!nearestItem) {
                return;
            }

            this._updateTarget(nearestItem, this._pos.x, this._pos.y);

            const newIndex = $.index(this._target);

            if (!$.isSame(nearestSortable, this._currentSortable)) {
                $.triggerEvent(this._currentSortable, 'send.ui.sortable', {
                    detail: {
                        target: this._target,
                    },
                });

                $.triggerEvent(nearestSortable, 'receive.ui.sortable', {
                    detail: {
                        target: this._target,
                    },
                });
            } else if (this._currentIndex !== newIndex) {
                $.triggerEvent(nearestSortable, 'sorting.ui.sortable', {
                    detail: {
                        target: this._target,
                    },
                });
            }

            this._currentIndex = newIndex;
            this._currentSortable = nearestSortable;
        };

        const upEvent = (e) => {
            if (!$.getDataset(this._node, 'uiDragging')) {
                this._target = null;
                return;
            }

            if (e.type === 'mouseup') {
                e.preventDefault();
            }

            $.triggerEvent(this._currentSortable, 'sorted.ui.sortable', {
                detail: {
                    target: this._target,
                },
            });

            if (this._options.helperClass) {
                $.removeClass(this._target, this._options.helperClass);
            }

            if (this._currentIndex !== this._startIndex || !$.isSame(this._currentSortable, this._node)) {
                $.triggerEvent(this._currentSortable, 'update.ui.sortable', {
                    detail: {
                        target: this._target,
                    },
                });
            }

            $.removeDataset(this._node, 'uiDragging');

            if (this._checkScrollTimer) {
                clearTimeout(this._checkScrollTimer);
                this._checkScrollTimer = null;
            }

            this._target = null;
            this._currentSortable = null;
            this._currentIndex = null;
            this._startIndex = null;
        };

        const dragEvent = $.mouseDragFactory(downEvent, moveEvent, upEvent);

        $.addEventDelegate(this._node, 'mousedown.ui.sortable touchstart.ui.sortable', this._selector, dragEvent);

        $.addEvent(this._node, 'receive.ui.sortable', (_) => {
            this._refreshCursors();
        });
    }

    /**
     * Check for window scroll.
     */
    function _checkScroll() {
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
    }
    /**
     * Refresh Sortable item cursors.
     */
    function _refreshCursors() {
        const elements = $.find(this._selector, this._node);

        $.setStyle(elements, { cursor: this._options.cursor });
    }
    /**
     * Update the target element.
     * @param {HTMLElement} nearestItem The current nearest item.
     * @param {number} x The mouse X position.
     * @param {number} y The mouse Y position.
     */
    function _updateTarget(nearestItem, x, y) {
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
    }

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
    ui.initComponent('sortable', Sortable);

    exports.Sortable = Sortable;

}));
//# sourceMappingURL=frost-ui-sortable.js.map
