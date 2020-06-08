import * as React from 'react';
import { Pane, PaneContent } from './Pane';
import { State } from '../Model';
import { isBrowserFirefox } from '../Functions';
import { CellRendererProps, } from './CellRenderer';
import {
    shouldRenderTopSticky, shouldRenderMiddleRange, shouldRenderLeftSticky, shouldRenderCenterRange
} from '../Functions/paneRendererPredicates';
import { Range } from './../Model'


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

    // console.log(state.visibleRange, cellMatrix.scrollableRange);

    let mergedHorizontal
    //  = cellMatrix.getRange(cellMatrix.scrollableRange.first || cellMatrix.ranges.stickyLeftRange.first, cellMatrix.scrollableRange.last || cellMatrix.ranges.stickyLeftRange.last);

    // console.log(cellMatrix.scrollableRange.first.column);
    if (!cellMatrix.scrollableRange.columns.length && state.visibleRange?.columns) {
        // console.log(state.visibleRange, cellMatrix.scrollableRange);
        mergedHorizontal = cellMatrix.getRange(cellMatrix.ranges.stickyLeftRange.first, cellMatrix.ranges.stickyLeftRange.last).slice(state.visibleRange!, 'rows')
        console.log(mergedHorizontal, 'kwik');

    } else {
        mergedHorizontal = renderMiddleRange && cellMatrix.scrollableRange.slice(state.visibleRange!, 'rows');
    }

    // console.log(mergedHorizontal);

    const visibleScrollableRange = renderMiddleRange && mergedHorizontal;

    // >>> CZY W CELL MATRIX WSZYSTKIE RANGE SA POPRAWNE
    // CZY METODY shouldRender... SĄ POPRAWNE
    // OKREŚNIENIE WYSOKOSCI I SZER DLA KAZDEGO PANE 

    const paneLeftWidth = cellMatrix.width === cellMatrix.scrollableRange.width
        ? cellMatrix.ranges.stickyLeftRange.columns.length === 0 ? 0 : cellMatrix.scrollableRange.width
        : cellMatrix.width - cellMatrix.scrollableRange.width;

    console.log((mergedHorizontal as Range));


    const paneTopHeight = cellMatrix.height === cellMatrix.scrollableRange.height
        ? (mergedHorizontal as Range).rows.length === 0 ? 0 : (mergedHorizontal as Range).height
        : cellMatrix.scrollableRange.height;

    return (
        <>
            <Pane
                renderChildren={renderMiddleRange && renderCenterRange}
                className={'rg-pane-center-middle'}
                style={{
                    position: 'relative',
                    width: cellMatrix.width !== cellMatrix.scrollableRange.width || cellMatrix.ranges.stickyLeftRange.columns.length === 0
                        ? cellMatrix.scrollableRange.width
                        : 0,
                    // height: cellMatrix.scrollableRange.height,
                    height: cellMatrix.height !== cellMatrix.scrollableRange.height || cellMatrix.ranges.stickyTopRange.rows.length === 0
                        ? cellMatrix.scrollableRange.height
                        : 0,
                    order: 3,
                }}
            >
                <PaneContent
                    state={state}
                    range={visibleScrollableRange}
                    rangeToSlice={state.visibleRange!}
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
                    width: cellMatrix.ranges.stickyLeftRange.columns.length > cellMatrix.columns.length ? 0 : cellMatrix.scrollableRange.width,
                    height: cellMatrix.ranges.stickyTopRange.rows.length > cellMatrix.rows.length ? 0 : cellMatrix.ranges.stickyTopRange.height,
                    order: 1,
                    ...(isBrowserFirefox() && { zIndex: 1 })
                }}
            >
                <PaneContent
                    state={state}
                    range={cellMatrix.ranges.stickyTopRange}
                    rangeToSlice={state.visibleRange!}
                    direction={'columns'}
                    borders={{ right: false, bottom: false }}
                    cellRenderer={cellRenderer}
                />
            </Pane>
            <Pane
                renderChildren={renderTopSticky && renderLeftSticky}
                className={'rg-pane-top rg-pane-left'}
                style={{
                    height: cellMatrix.height === cellMatrix.scrollableRange.height
                        ? cellMatrix.ranges.stickyTopRange.rows.length === 0 ? 0 : cellMatrix.scrollableRange.height
                        : cellMatrix.height - cellMatrix.scrollableRange.height,
                    width: paneLeftWidth,
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

