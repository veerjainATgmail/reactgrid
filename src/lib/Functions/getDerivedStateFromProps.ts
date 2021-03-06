import { ReactGridProps, State } from '../Model';
import { recalcVisibleRange, focusLocation } from '.';
import { defaultCellTemplates } from './defaultCellTemplates';
import { CellMatrixBuilder } from '../Model/CellMatrixBuilder';


export function getDerivedStateFromProps(props: ReactGridProps, state: State): State {

    const stateDeriverWithProps = stateDeriver(props);

    const hasHighlightsChanged = highlightsHasChanged(props, state);

    if (hasHighlightsChanged) {
        state = stateDeriverWithProps(state)(appendHighlights);
    }

    state = stateDeriverWithProps(state)(updateStateProps);

    state = stateDeriverWithProps(state)(appendCellTemplates);

    const hasChanged = dataHasChanged(props, state);

    if (hasChanged) {
        state = stateDeriverWithProps(state)(updateCellMatrix);
    }

    state = stateDeriverWithProps(state)(updateFocusedLocation);

    if (hasChanged) {
        state = stateDeriverWithProps(state)(updateVisibleRange);
    }
    state = stateDeriverWithProps(state)(setInitialFocusLocation);

    if (areFocusesDiff(props, state)) {
        state = stateDeriverWithProps(state)(setFocusLocation);
    }

    return state;
}

export const areFocusesDiff = (props: ReactGridProps, state: State): boolean => {
    return props.focusLocation?.columnId !== state.focusedLocation?.column.columnId
        || props.focusLocation?.rowId !== state.focusedLocation?.row.rowId;
}

export const stateDeriver = (props: ReactGridProps) => (state: State) => (fn: (props: ReactGridProps, state: State) => State) => fn(props, state);

export const dataHasChanged = (props: ReactGridProps, state: State) => !state.cellMatrix || props !== state.cellMatrix.props;

export const highlightsHasChanged = (props: ReactGridProps, state: State) => props.highlights !== state.props?.highlights;

export function updateStateProps(props: ReactGridProps, state: State): State {
    if (state.props !== props) {
        state = { ...state, props };
    }
    return state;
}

function updateCellMatrix(props: ReactGridProps, state: State): State {
    const builder = new CellMatrixBuilder();
    return {
        ...state,
        cellMatrix: builder.setProps(props).fillRowsAndCols().fillSticky().fillScrollableRange()
            .setEdgeLocations().getCellMatrix()
    };
}

export function updateFocusedLocation(props: ReactGridProps, state: State): State {
    if (state.cellMatrix.columns.length > 0 && state.focusedLocation && !state.currentlyEditedCell) {
        state = { ...state, focusedLocation: state.cellMatrix.validateLocation(state.focusedLocation) };
    }
    return state;
}

function updateVisibleRange(props: ReactGridProps, state: State): State {
    if (state.visibleRange) {
        state = recalcVisibleRange(state);
    }
    return state;
}

export function appendCellTemplates(props: ReactGridProps, state: State) {
    return {
        ...state,
        cellTemplates: { ...defaultCellTemplates, ...props.customCellTemplates }
    }
}

export function appendHighlights(props: ReactGridProps, state: State) {
    const highlights = props.highlights?.filter(highlight => state.cellMatrix.rowIndexLookup[highlight.rowId] && state.cellMatrix.columnIndexLookup[highlight.columnId]);
    if (highlights?.length !== props.highlights?.length) {
        console.error('Data inconsistency in ReactGrid "highlights" prop');
    }
    return {
        ...state,
        highlightLocations: highlights || [],
    }
}

export function setInitialFocusLocation(props: ReactGridProps, state: State): State {
    const locationToFocus = props.initialFocusLocation;
    if (locationToFocus && !state.focusedLocation) {
        if (!state.cellMatrix.columnIndexLookup[locationToFocus.columnId] || !state.cellMatrix.rowIndexLookup[locationToFocus.rowId]) {
            console.error('Data inconsistency in ReactGrid "initialFocusLocation" prop');
            return state;
        }
        return focusLocation(state, state.cellMatrix.getLocationById(locationToFocus.rowId, locationToFocus.columnId));
    }
    return state;
}

export function setFocusLocation(props: ReactGridProps, state: State): State {
    const locationToFocus = props.focusLocation;
    if (locationToFocus) {
        if (!state.cellMatrix.columnIndexLookup[locationToFocus.columnId] || !state.cellMatrix.rowIndexLookup[locationToFocus.rowId]) {
            console.error('Data inconsistency in ReactGrid "focusLocation" prop');
            return state;
        }
        const location = state.cellMatrix.getLocationById(locationToFocus.rowId, locationToFocus.columnId);
        return focusLocation(state, location)
    }
    return state;
}