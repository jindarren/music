/**
 * Created by chen on 4/27/16.
 */
$(document).ready(function () {
    ui = new Ui();

    $(window).resize(ui.resize);

    $(EventManager).bind("ui-resize", function (event, data) {
        ui.updateFixedHeightContainers();
    });

    $(EventManager).bind("ui-vertical-resize", function (event, data) {
        ui.updateFixedHeightContainers();
    });

    $(EventManager).bind("ui-horizontal-resize", function (event, data) {
// nothing so far
    });
});