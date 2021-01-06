/**
 * Sortable Events
 */

Object.assign(Sortable.prototype, {

    /**
     * Attach events for the Sortable.
     */
    _events() {
        let dragging, currentIndex, startIndex;
        dom.addEventDelegate(this._node, 'mousedown.ui.sortable', this._selector, dom.mouseDragFactory(
            e => {
                if (e.button || !this._enabled || dom.is(e.currentTarget, this._settings.cancel)) {
                    return false;
                }

                e.preventDefault();

                this._target = this._findTarget(e.currentTarget);
            },
            e => {
                if (!dragging) {
                    dragging = true;
                    startIndex = dom.index(this._target);
                    currentIndex = startIndex;

                    dom.triggerEvent(this._node, 'start.ui.sortable', {
                        detail: {
                            target: this._target
                        }
                    });

                    this._buildPlaceholder();
                    this._initTarget(e.pageX, e.pageY);

                    this._currentSortable = this._node;
                }

                this._updateTarget(e.pageX, e.pageY);

                const nearestSortable = this._findNearestSortable(e.pageX, e.pageY);
                const nearestItems = dom.isSame(this._node, nearestSortable) ?
                    this.items() :
                    this.constructor.init(nearestSortable).items();
                const nearestItem = this._findNearestItem(nearestItems, e.pageX, e.pageY);

                this._updatePlaceholder(nearestItem, e.pageX, e.pageY);

                const newIndex = dom.index(this._placeholder);

                if (!dom.isSame(nearestSortable, this._currentSortable)) {
                    dom.triggerEvent(this._currentSortable, 'remove.ui.sortable', {
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
                    dom.triggerEvent(nearestSortable, 'change.ui.sortable', {
                        detail: {
                            target: this._target,
                            placeholder: this._placeholder
                        }
                    });
                }

                currentIndex = newIndex;

                this._currentSortable = nearestSortable;

                if (this._settings.scroll) {
                    this._checkScroll(e.pageX, e.pageY);
                }
            },
            e => {
                if (!dragging) {
                    this._target = null;
                    return;
                }

                e.preventDefault();

                dom.triggerEvent(this._currentSortable, 'stop.ui.sortable', {
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
