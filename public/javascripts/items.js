var globalSelection = {}
var globalElementId;
var trackinfos      = [];

function plotSelectionTabs(element, selections, activeSelection) {
    // clear target element
    d3.select(element).html("");

    if (selections.getSize() <= 0) {
        d3.select(element).append('div')
            .attr('class', 'info-message')
            .html('No queries. Click <i class="fa fw fa-plus"></i> button to add a new query.');

        d3.select('#filters-list').html("");
        d3.select('#filters-list').append("div").attr("class", "info-message").html('No active selection.');
        d3.select('#filters-controls').html("");
    }
    else {
        var table = d3.select(element)
            .append("table")
            .attr("class", "selection-tab-list");

        var tbody = table.append("tbody");

        var tabs = tbody.append("tr")
            .selectAll("td")
            .data(selections.list)
            .enter()
            .append("td")
            .attr("class", "selection-tab")
            .classed({
                'active': function (d, i) {
                    return ( selections.isActive(d) );
                }
            })
            .on("click", function (k) { // is attribute object
                // check if selection has been deleted or not
                if (selections.getSelectionFromUuid(k.id)) {
                    selections.setActive(k);
                }
            });

        tabs.append("i")
            .attr("class", "fa fa-square")
            .style("color", function (d, i) {
                return ( selections.getColor(d) );
            })
            .style("margin-right", "2px");
        tabs.append("span")
            .text(function (d) {
                return d3.format("5d")(d.items.length);
            });
        tabs.append("i")
            .attr("class", "fa fa-times-circle")
            .style("margin-left", "5px")
            .on("click", function (k) { // is attribute object
                //selections.removeSelection( k );
            });
    }


    d3.select('#selection-controls').html("");
    d3.select('#selection-controls')
        .append('div')
        .attr('class', 'selection-button level-1-button')
        .attr('title', 'Create element query')
        .html('<i class="fa fw fa-plus"></i>')
        .on("click", function (event) {
            createInitialSelection();
        });
}



$("#bodyVis").click(function(){
    numberOfRow++;
    console.log("Rows: "+numberOfRow)
    if(numberOfLike>9&&numberOfRow>4&&numberOfUserTag>2){
        $("#task-text").hide();
        $("#questionnaire").show();
    }

})


//
//$("#checkBoxes > ul > li:nth-child(3)").click(function(){
//    numberOfUser++;
//    console.log(numberOfUser)
//    if(numberOfLike>9&&numberOfRow>4&&numberOfTag>2&&numberOfUser>2){
//        $("#task-text").hide();
//        $("#questionnaire").show();
//    }
//})


//render query results...........
function plotSelectedItems(elementId, selection) {

    trackinfos      = [];
    globalElementId = elementId;
    var element     = d3.select(elementId);
    // clear target element
    element.html("");

    if (!selection || selections.getSize() === 0 || !selections.getColor(selection)) {
        element.append("div").attr("class", "info-message").html('No active selection.');
        return;
    }

    //d3.select(element).html('<p>' + selection.items.length + ' of ' + depth + ' selected</p>')

    /*
     for ( var i = 0; i < selection.filters.length; ++i ) {
     filter.renderViewer(element, selection, selection.filters[i].uuid );
     }
     */
    selection.filterCollection.renderController(d3.select("filters-controller"));

    var table   = element.append("table").attr("id", "result-table");
    var thead   = table.append("thead").attr("id", "result-thead");
    var tbody   = table.append("tbody").style("overflow-y", 'auto').style("height", "100%").style("display", "block");
    globalTbody = tbody;

    var selectionColor = parseInt(selections.getColor(selection).substring(1), 16);

    var headinfo = [];
    headinfo.push("Song");
    headinfo.push("Artist");
    headinfo.push("Liked");
    thead.append("tr").style("display", "flex").style("width", "100%")
        .selectAll("th")
        .data(headinfo)
        .enter()
        .append("th")
        .style("background-color", '#cacaca')
        .attr("class", "item-table-header")
        .attr("width", "33%")
        .text(function (d) {
            return d;
        })
    //.on("click", function (k) { // is attribute object
    //    d3.select(this).html(( k.sort > 0 ? "&#x25B2;" : "&#x25BC;" ) + " " + k.name);
    //rows.sort(function (a, b) {
    //    switch (k.type) {
    //        case 'integer':
    //        // fall-through
    //        case 'float':
    //            return k.sort * ( k.values[a] - k.values[b] );
    //        case 'authorString':
    //            var authorsA = k.values[a].split(',');
    //            //console.log(authorsA);
    //            var authorsB = k.values[b].split(',');
    //            //console.log(authorsB);
    //            if (authorsA.length > 0 && authorsB.length > 0) {
    //                authorsA = authorsA[0].split(' ');
    //                authorsB = authorsB[0].split(' ');
    //                if (authorsA[authorsA.length - 1] < authorsB[authorsB.length - 1]) {
    //                    return k.sort * -1;
    //                }
    //                if (authorsA[authorsA.length - 1] > authorsB[authorsB.length - 1]) {
    //                    return k.sort * 1;
    //                }
    //
    //                return 0;
    //            }
    //            return 0;
    //        case 'id':
    //        // fall-through
    //        case 'string':
    //        // fall-through
    //        default:
    //            if (k.values[a] < k.values[b]) {
    //                return k.sort * -1;
    //            }
    //            if (k.values[a] > k.values[b]) {
    //                return k.sort * 1;
    //            }
    //
    //            return 0;
    //    }
    //});
    //// switch sort order
    //k.sort = k.sort * -1;
    //});
    var trackinfo   = [];
    var count       = 0;
    globalSelection = selection;
    var total       = selection.items.length > 30 ? 30 : selection.items.length;
    if (selection.items.length <= 30)
        $('#loadmore').hide();

    //var total = selection.items.length;
    for (var i = 0; i < total; i++) {
        $.ajax({
            type: "POST",
            url: "https://ws.audioscrobbler.com/2.0/?api_key=6e7a76f6e379cb31ed5f4f0022a130d4&format=json&method=track.getinfo&mbid=" + attributes[0].values[selection.items[i]] + "&i=" + i,
            contentType: 'json',
            success: function (response) {
                try {
                    var s = this.url.split("=");
                    trackinfo.push({
                        mbid: response.track.mbid,
                        name: response.track.name,
                        artist: response.track.artist.name,
                        url: response.track.url,
                        i: s[s.length - 1]
                    });
                }
                catch (e) {
                    console.log("track info error");
                }
                count++;
                if (count == total) {
                    drawTableRows(tbody, trackinfo, selection);
                    trackinfos = trackinfo.slice();
                }
            },
            error: function (e) {
                console.log("get track info list failed." + e);
                $.ajax(this);
                //count++;
                //if (count == total)
                //    drawTableRows(tbody, trackinfo);
            },
            timeout: 5000
        });
    }
}


function drawTableRows(tbody, trackinfo, selection) {
    tbody.selectAll("tr")
        .data(trackinfo).enter()
        .append("tr").style("display", "flex").style("width", "100%")
        .each(function (d, i) {
            var info = [];
            info.push(d.name);
            info.push(d.artist);
            info.push(d.url);
            d3.select(this).selectAll("td")
                .data(info).enter()
                .append("td")
                .attr("width", "33%")
                .each(function (c, j) {
                    if (j == 0) //title
                    {
                        d3.select(this).append("a")
                            .style({
                                'cursor': 'pointer',
                                'text-decoration': 'underline'
                            })
                            .on("click", function () {
                                window.open(d.url, '_blank');
                                var date = new Date();
                                userBehavior.push({
                                    type: 5,
                                    item: d.name,
                                    time: (date.getDate() < 10 ? '0' : '') + date.getDate() + " @ " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
                                });
                                $(EventManager).trigger("user-behavior-added");
                            })
                            .text(function (a) {
                                return a; //link text content
                            });
                    }
                    else if (j == 2) { //bookmark
                        if (dataForVis.currentUserBookmarks.indexOf(d.mbid) > -1) {
                            d3.select(this)
                                .append("img")
                                .attr('x', "0")
                                .attr('y', "0")
                                .attr('width', "16px")
                                .attr('height', "15px")
                                .attr("src", "./javascripts/images/heart.png");
                        }
                        else {
                            var a = d3.select(this).append("img")
                                .attr('width', "16px")
                                .attr('height', "15px")
                                .attr("src", "./javascripts/images/heart-empty.png");
                            a.style("cursor", "pointer")
                                //.style("text-decoration", 'underline')
                                //.style("color", "rgb(31, 119, 180)")
                                .on("click", function () {
                                    d3.select(this).on('click', null);
                                    numberOfLike++;
                                    console.log("Liked Songs: "+numberOfLike)
                                    if(numberOfLike>9&&numberOfRow>4&&numberOfUserTag>2){
                                        $("#task-text").hide();
                                        $("#questionnaire").show();
                                    }
                                    //document.getElementById("tipbar").innerHTML = "You bookmarked \"" + attributes[2].values[selection.items[i]] + "\" successfully! The set view has been updated as well. ";
                                    a.attr("src", "./javascripts/images/heart.png")
                                        .on('click', null)
                                        .style('cursor', 'auto');
                                    dataForVis.currentUserBookmarks.push(d.mbid);
                                    var date = new Date();
                                    userBehavior.push({
                                        type: 7,
                                        item: d.name,
                                        time: (date.getDate() < 10 ? '0' : '') + date.getDate() + " @ " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
                                    });
                                    $(EventManager).trigger("user-behavior-added");
                                    $(EventManager).trigger("refresh", [selection.items[d.i]]);
                                })

                        }
                    }
                    else d3.select(this).text(function (a) {
                            return a
                        });
                })
        });
    if (selection.items.length > 30) {
        $('#loadmore').show();
    }
}

function loadmore(selection) {
    var count = 0;
    var total = selection.items.length;
    if (selection.items.length <= 30)
        $('#loadmore').hide();

    //var total = selection.items.length;
    for (var i = 0; i < total; i++) {
        $.ajax({
            type: "POST",
            url: "https://ws.audioscrobbler.com/2.0/?api_key=6e7a76f6e379cb31ed5f4f0022a130d4&format=json&method=track.getinfo&mbid=" + attributes[0].values[selection.items[i]] + "&i=" + i,
            contentType: 'json',
            success: function (response) {
                try {
                    var s = this.url.split("=");
                    trackinfos.push({
                        mbid: response.track.mbid,
                        name: response.track.name,
                        artist: response.track.artist.name,
                        url: response.track.url,
                        i: s[s.length - 1]
                    });
                }
                catch (e) {
                    console.log("track info error");
                }
                count++;
                if (count == total) {
                    function update() {
                        var selection = d3.select("#result-table").select('tbody')
                            .selectAll("tr").data(trackinfos);
                        // Enter selection: Create new DOM elements for added
                        // data items, resize and position them.
                        selection.enter()
                            .append("tr").style("display", "flex").style("width", "100%")
                            .each(function (d) {
                                var info = [];
                                info.push(d.name);
                                info.push(d.artist);
                                info.push(d.url);
                                d3.select(this).selectAll("td")
                                    .data(info).enter()
                                    .append("td")
                                    .attr("width", "33%")
                                    .each(function (c, j) {
                                        if (j == 0) //title
                                        {
                                            d3.select(this).append("a")
                                                .style({
                                                    'cursor': 'pointer',
                                                    'text-decoration': 'underline'
                                                })
                                                .on("click", function () {
                                                    window.open(d.url, '_blank');
                                                    var date = new Date();
                                                    userBehavior.push({
                                                        type: 5,
                                                        item: d.name,
                                                        time: (date.getDate() < 10 ? '0' : '') + date.getDate() + " @ " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
                                                    });
                                                    $(EventManager).trigger("user-behavior-added");
                                                })
                                                .text(function (a) {
                                                    return a; //link text content
                                                });
                                        }
                                        else if (j == 2) { //bookmark
                                            if (dataForVis.currentUserBookmarks.indexOf(d.mbid) > -1) {
                                                d3.select(this)
                                                    .append("img")
                                                    .attr('x', "0")
                                                    .attr('y', "0")
                                                    .attr('width', "16px")
                                                    .attr('height', "15px")
                                                    .attr("src", "./javascripts/images/heart.png");
                                            }
                                            else {
                                                var a = d3.select(this).append("img")
                                                    .attr('width', "16px")
                                                    .attr('height', "15px")
                                                    .attr("src", "./javascripts/images/heart-empty.png");
                                                a.style("cursor", "pointer")
                                                    //.style("text-decoration", 'underline')
                                                    //.style("color", "rgb(31, 119, 180)")
                                                    .on("click", function () {
                                                        d3.select(this).on('click', null);
                                                        //document.getElementById("tipbar").innerHTML = "You bookmarked \"" + attributes[2].values[selection.items[i]] + "\" successfully! The set view has been updated as well. ";
                                                        a.attr("src", "./javascripts/images/heart.png")
                                                            .on('click', null)
                                                            .style('cursor', 'auto');
                                                        dataForVis.currentUserBookmarks.push(d.mbid);
                                                        var date = new Date();
                                                        userBehavior.push({
                                                            type: 7,
                                                            item: d.name,
                                                            time: (date.getDate() < 10 ? '0' : '') + date.getDate() + " @ " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
                                                        });
                                                        $(EventManager).trigger("user-behavior-added");
                                                        $(EventManager).trigger("refresh", [selection.items[d.i]]);
                                                    })

                                            }
                                        }
                                        else d3.select(this).text(function (a) {
                                                return a
                                            });
                                    })
                            });

                    };
                    update();
                    if (selection.items.length > 30) {
                        $('#loadmore').show();
                    }
                }
            },
            error: function (e) {
                console.log("get track info list failed." + e);
                $.ajax(this);
                //count++;
                //if (count == total)
                //    drawTableRows(tbody, trackinfo);
            },
            timeout: 5000
        });
    }

}


$('#loadmore img').on('click', function () {
    globalSelection.items = globalSelection.items.slice(30, globalSelection.items.length - 1)
    loadmore(globalSelection);
})