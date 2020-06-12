import { Behavior, Range, Location, CellMatrix } from '.';
import { CellTemplates, Cell, ReactGridProps, Compatible, Highlight, CellChange } from './PublicModel';
import { isBrowserIE, isBrowserEdge } from '../Functions';
import { DefaultBehavior } from '../Behaviors/DefaultBehavior';

export type StateModifier<TState extends State = State> = (state: TState) => TState;
export type StateUpdater = (modifier: StateModifier) => void;


export interface State<TCellMatrix extends CellMatrix = CellMatrix, TBehavior extends Behavior = Behavior> {
    update: StateUpdater;
    readonly props?: ReactGridProps;
    readonly legacyBrowserMode: boolean;
    readonly cellMatrix: TCellMatrix;
    readonly currentBehavior: TBehavior;
    readonly focusedLocation?: Location;

    readonly cellTemplates?: CellTemplates;
    hiddenFocusElement?: HTMLDivElement; // updated without setState
    readonly reactGridElement?: HTMLDivElement;
    readonly scrollableElement?: HTMLElement | (Window & typeof globalThis);

    readonly queuedCellChanges: CellChange[];
    currentlyEditedCell?: Compatible<Cell>;

    readonly highlightLocations: Highlight[];

    // VISIBLE RANGE
    readonly visibleRange?: Range;

    // SCROLLS
    readonly topScrollBoudary: number;
    readonly bottomScrollBoudary: number;
    readonly leftScrollBoudary: number;
    readonly rightScrollBoudary: number;

}

export const defaultStateFields = {
    legacyBrowserMode: isBrowserIE() || isBrowserEdge(),
    focusedLocation: undefined,
    currentBehavior: new DefaultBehavior(),
    cellTemplates: undefined,
    hiddenFocusElement: undefined,
    reactGridElement: undefined,
    scrollableElement: undefined,
    queuedCellChanges: [],
    currentlyEditedCell: undefined,
    highlightLocations: [],
    visibleRange: undefined,
    topScrollBoudary: -1,
    bottomScrollBoudary: -1,
    leftScrollBoudary: -1,
    rightScrollBoudary: -1,
}