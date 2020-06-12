// TODO is necessary to export this file (export only definition)
export const config = {
    pinToBody: false,
    enableAdditionalContent: true,
    flexRow: false,

    rgViewportHeight: 1200,
    rgViewportWidth: 1150,
    margin: '0',
    enableRangeSelection: true,
    enableFillHandle: true,

    cellHeight: 25,
    cellWidth: 150,
    minCellWidth: 40,
    fillHandleWidth: 18,

    columns: 3,
    rows: 3,

    lineWidth: 1,

    stickyTop: 3,
    stickyLeft: 2,
    stickyBottom: 0,
    stickyRight: 0,

    firstRowType: 'text'
}

if (typeof exports === "object" && typeof module === "object") { // added for backwards compability without ES6 imports
    module.exports = config;
}