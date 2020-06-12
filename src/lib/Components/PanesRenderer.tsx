import * as React from 'react';
import { Pane, PaneContent } from './Pane';
import { State, Range } from '../Model';
import { isBrowserFirefox } from '../Functions';
import { CellRendererProps, } from './CellRenderer';
import {
    shouldRenderTopSticky, shouldRenderMiddleRange, shouldRenderLeftSticky, shouldRenderCenterRange
} from '../Functions/paneRendererPredicates';


export interface PanesProps<TState extends State = State> {
    state: TState;
    cellRenderer: React.FunctionComponent<CellRendererProps>;
}

export const PanesRenderer: React.FunctionComponent<PanesProps> = props => {
    const { state, cellRenderer } = props;
    const cellMatrix = state.cellMatrix;
    const renderTopSticky = shouldRenderTopSticky(state),
        renderMiddleRange = shouldRenderMiddleRange(state),
        renderLeftSticky = shouldRenderLeftSticky(state),
        renderCenterRange = shouldRenderCenterRange(state);

    if (!renderTopSticky && !renderMiddleRange && !renderLeftSticky && !renderCenterRange) {
        return null;
    }

    let visibleScrollableRange;

    let visibleRange = state.visibleRange;
    let scrollableRange = cellMatrix.scrollableRange;

    if (visibleRange?.columns.length === 0) {
        visibleRange = new Range(visibleRange.rows, cellMatrix.ranges.stickyLeftRange.columns);
    }

    if (scrollableRange.columns.length === 0) {
        scrollableRange = new Range(scrollableRange.rows, cellMatrix.ranges.stickyLeftRange.columns);
    }

    visibleScrollableRange = renderMiddleRange && scrollableRange.slice(visibleRange!, 'rows');
    console.log(cellMatrix.ranges.stickyLeftRange, cellMatrix.ranges.stickyTopRange, renderMiddleRange, renderLeftSticky);

    const paneLeftWidth = cellMatrix.width === scrollableRange.width
        ? cellMatrix.ranges.stickyLeftRange.columns.length === 0 ? 0 : scrollableRange.width
        : cellMatrix.width - scrollableRange.width;

    const paneTopHeight = cellMatrix.height === cellMatrix.ranges.stickyLeftRange.height
        ? cellMatrix.ranges.stickyTopRange.rows.length === 0 ? 0 : scrollableRange.height
        : scrollableRange.height;


    return (
        <>
            <Pane
                renderChildren={renderMiddleRange && renderCenterRange}
                className={'rg-pane-center-middle'}
                style={{
                    position: 'relative',
                    width: cellMatrix.width !== scrollableRange.width || cellMatrix.ranges.stickyLeftRange.columns.length === 0
                        ? scrollableRange.width
                        : 0,
                    height: cellMatrix.height !== scrollableRange.height || cellMatrix.ranges.stickyTopRange.rows.length === 0
                        ? scrollableRange.height
                        : 0,
                    order: 3,
                }}
            >
                <PaneContent
                    state={state}
                    range={visibleScrollableRange}
                    rangeToSlice={visibleRange!}
                    direction={'columns'}
                    borders={{ right: false, bottom: false }}
                    cellRenderer={cellRenderer}
                />
            </Pane>
            <Pane
                renderChildren={renderMiddleRange && renderLeftSticky}
                className={'rg-pane-left'}
                style={{
                    height: paneTopHeight,
                    width: paneLeftWidth,
                    order: 2,
                    ...(isBrowserFirefox() && { zIndex: 1 })
                }}
            >
                <PaneContent
                    state={state}
                    range={cellMatrix.ranges.stickyLeftRange}
                    rangeToSlice={visibleScrollableRange}
                    direction={'rows'}
                    borders={{ bottom: true, right: true }}
                    cellRenderer={cellRenderer}
                />
            </Pane>
            <Pane
                renderChildren={renderTopSticky && renderCenterRange}
                className={'rg-pane-top'}
                style={{
                    width: cellMatrix.ranges.stickyLeftRange.columns.length >= cellMatrix.columns.length ? 0 : scrollableRange.width,
                    height: cellMatrix.ranges.stickyTopRange.rows.length > cellMatrix.rows.length ? 0 : cellMatrix.ranges.stickyTopRange.height,
                    order: 1,
                    ...(isBrowserFirefox() && { zIndex: 1 })
                }}
            >
                <PaneContent
                    state={state}
                    range={cellMatrix.ranges.stickyTopRange}
                    rangeToSlice={visibleRange!}
                    direction={'columns'}
                    borders={{ right: false, bottom: false }}
                    cellRenderer={cellRenderer}
                />
            </Pane>
            <Pane
                renderChildren={renderTopSticky && renderLeftSticky}
                className={'rg-pane-top rg-pane-left'}
                style={{
                    height: renderTopSticky && renderLeftSticky ? scrollableRange.height - cellMatrix.ranges.stickyTopRange.height : visibleRange?.height,
                    width: renderTopSticky && renderLeftSticky ? cellMatrix.ranges.stickyLeftRange.width : 0,
                    order: 0,
                    ...(isBrowserFirefox() && { zIndex: 2 })
                }}
            >
                <PaneContent
                    state={state}
                    range={cellMatrix.ranges.stickyLeftRange}
                    rangeToSlice={cellMatrix.ranges.stickyTopRange}
                    direction={'rows'}
                    borders={{ bottom: true, right: true }}
                    cellRenderer={cellRenderer}
                />
            </Pane>
        </>
    )
}

