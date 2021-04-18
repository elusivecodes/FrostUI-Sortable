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
