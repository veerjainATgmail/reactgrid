import * as React from 'react';
import { Pane, PaneContent } from './Pane';
import { State } from '../Model';
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

    if (renderMiddleRange && !cellMatrix.scrollableRange.columns.length) {
        // console.log(cellMatrix.scrollableRange.columns);
        let vR = state.visibleRange;
        if (vR && !vR?.columns.length) {
            vR = cellMatrix.getRange(
                cellMatrix.getLocationById(vR.first.row.idx || 0, cellMatrix.ranges.stickyLeftRange.first.column.idx || 0),
                cellMatrix.getLocationById(vR.last.row.idx || 0, cellMatrix.ranges.stickyLeftRange.last.column.idx || 0)
            );
        }
        visibleScrollableRange = cellMatrix.getRange(cellMatrix.ranges.stickyLeftRange.first, cellMatrix.ranges.stickyLeftRange.last).slice(vR!, 'rows');
        console.log('ds', visibleScrollableRange, state.visibleRange, vR);

        //     console.log(cellMatrix.scrollableRange);

    } else {
        visibleScrollableRange = renderMiddleRange && cellMatrix.scrollableRange.slice(state.visibleRange!, 'rows');
    }

    // console.log(cellMatrix.scrollableRange);

    // >> CZY W CELL MATRIX WSZYSTKIE RANGE SA POPRAWNE
    // CZY METODY shouldRender... SĄ POPRAWNE
    // OKREŚNIENIE WYSOKOSCI I SZER DLA KAZDEGO PANE 
    console.log(cellMatrix.ranges.stickyTopRange);

    const paneLeftWidth = cellMatrix.width === cellMatrix.scrollableRange.width
        ? cellMatrix.ranges.stickyLeftRange.columns.length === 0 ? 0 : cellMatrix.scrollableRange.width
        : cellMatrix.width - cellMatrix.scrollableRange.width;

    const paneTopHeight = cellMatrix.height === cellMatrix.scrollableRange.height
        ? cellMatrix.scrollableRange.height
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
                    width: cellMatrix.ranges.stickyLeftRange.columns.length >= cellMatrix.columns.length ? 0 : cellMatrix.scrollableRange.width,
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

