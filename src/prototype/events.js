import $ from '@fr0st/query';
import { getPosition } from '@fr0st/ui';

/**
 * Attach events for the Sortable.
 */
export function _events() {
    const downEvent = (e) => {
        if (
            e.button ||
            !this._enabled ||
            $.is(e.currentTarget, this._options.cancel) ||
            $.getDataset(this._node, 'uiDragging')
        ) {
            return false;
        }

        this._target = this._options.handle ?
            this.items().find((node) => $.hasDescendent(node, e.currentTarget)) :
            e.currentTarget;
    };

    const moveEvent = (e) => {
        this._pos = getPosition(e);

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
};
