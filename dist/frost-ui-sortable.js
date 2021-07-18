/**
 * FrostUI-Sortable v1.0.5
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
         * Disable the Sortable.
         * @returns {Sortable} The Sortable.
         */
        disable() {
            this._enabled = false;

            return this;
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


    /**
     * Sortable Events
     */

    Object.assign(Sortable.prototype, {

        /**
         * Attach events for the Sortable.
         */
        _events() {
            const checkScroll = Core.animation(pos => {
                dom.hide(this._target);
                this._checkScroll(pos.x, pos.y);
                dom.show(this._target);
            });

            const getPosition = e => {
                if ('touches' in e && e.touches.length) {
                    return {
                        x: e.touches[0].pageX,
                        y: e.touches[0].pageY
                    };
                }

                return {
                    x: e.pageX,
                    y: e.pageY
                };
            };

            let dragging, currentIndex, startIndex;
            dom.addEventDelegate(this._node, 'mousedown.ui.sortable touchstart.ui.sortable', this._selector, dom.mouseDragFactory(
                e => {
                    if (e.button || !this._enabled || dom.is(e.currentTarget, this._settings.cancel)) {
                        return false;
                    }

                    e.preventDefault();

                    this._target = this._findTarget(e.currentTarget);
                },
                e => {
                    const pos = getPosition(e);

                    if (!dragging) {
                        dragging = true;
                        startIndex = dom.index(this._target);
                        currentIndex = startIndex;

                        dom.triggerEvent(this._node, 'sort.ui.sortable', {
                            detail: {
                                target: this._target
                            }
                        });

                        this._buildPlaceholder();

                        this._initTarget(pos.x, pos.y);

                        this._currentSortable = this._node;
                    }

                    this._updateTarget(pos.x, pos.y);

                    const nearestSortable = this._findNearestSortable(pos.x, pos.y);
                    const nearestItems = dom.isSame(this._node, nearestSortable) ?
                        this.items() :
                        this.constructor.init(nearestSortable).items();
                    const nearestItem = this._findNearestItem(nearestItems, pos.x, pos.y);

                    if (!nearestItem) {
                        return;
                    }

                    this._updatePlaceholder(nearestItem, pos.x, pos.y);

                    const newIndex = dom.index(this._placeholder);

                    if (!dom.isSame(nearestSortable, this._currentSortable)) {
                        dom.triggerEvent(this._currentSortable, 'send.ui.sortable', {
                            detail: {
                                target: this._target,
                                placeholder: this._placeholder
                            }
                        });

                        dom.triggerEvent(nearestSortable, 'receive.ui.sortable', {
                            detail: {
                                target: this._target,
                                placeholder: this._placeholder
                            }
                        });
                    } else if (currentIndex !== newIndex) {
                        dom.triggerEvent(nearestSortable, 'sorting.ui.sortable', {
                            detail: {
                                target: this._target,
                                placeholder: this._placeholder
                            }
                        });
                    }

                    currentIndex = newIndex;

                    this._currentSortable = nearestSortable;

                    if (this._settings.scroll) {
                        checkScroll(pos);
                    }
                },
                e => {
                    if (!dragging) {
                        this._target = null;
                        return;
                    }

                    e.preventDefault();

                    dom.triggerEvent(this._currentSortable, 'sorted.ui.sortable', {
                        detail: {
                            target: this._target,
                            placeholder: this._placeholder
                        }
                    });

                    dom.setAttribute(this._target, 'style', this._originalStyle);

                    if (this._settings.helperClass) {
                        dom.removeClass(this._target, this._settings.helperClass);
                    }

                    dom.before(this._placeholder, this._target);
                    dom.remove(this._placeholder);

                    if (currentIndex !== startIndex || !dom.isSame(this._currentSortable, this._node)) {
                        dom.triggerEvent(this._currentSortable, 'update.ui.sortable', {
                            detail: {
                                target: this._target
                            }
                        });
                    }

                    this._target = null;
                    this._placeholder = null;
                    this._currentSortable = null;
                    dragging = false;
                    startIndex = null;
                    currentIndex = null;
                }
            ));

            dom.addEvent(this._node, 'receive.ui.sortable', _ => {
                this._refreshCursors();
            });
        }

    });


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
                const docHeight = dom.height(document, DOM.SCROLL_BOX);
                offsetY = Math.min(docHeight, offsetY + this._settings.scrollSpeed);
            }

            if (x < offsetX + this._settings.scrollSensitivity) {
                offsetX = Math.max(0, offsetX - this._settings.scrollSpeed);
            } else if (x > offsetX + dom.width(window) - this._settings.scrollSensitivity) {
                const docWidth = dom.width(document, DOM.SCROLL_BOX);
                offsetX = Math.min(docWidth, offsetX + this._settings.scrollSpeed);
            }

            dom.setScroll(document, offsetX, offsetY);
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

            return this.items().find(node => dom.hasDescendent(node, target));
        },

        /**
         * Refresh Sortable item cursors.
         */
        _refreshCursors() {
            const elements = dom.find(this._selector, this._node);
            dom.setStyle(elements, 'cursor', this._settings.cursor);
        }

    });


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

            dom.before(this._target, this._placeholder);
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
            this._offsetX = Math.abs(targetX - x);
            this._offsetY = Math.abs(targetY - y);

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

});