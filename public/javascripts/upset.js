/**
 * Created by alex,nils,romain,hen
 */


var ctx = {
    majorPadding: 25,
    minorPadding: 2,
    cellDistance: 27,
    textHeight: 130,
    textSpacing: 25,

    setSizeWidth: 700,
    subSetSizeWidth: 450,
    subSetSizeWidthMax: 450,

    leftOffset: 130,
    leftIndent: 10,
    topOffset: 200,

    /** The width from the start of the set vis to the right edge */

    cellSizeShrink: 3,
    maxLevels: 1,

    expectedValueWidth: 0,
    expectedValueWidthMax: 0,

    labelTopPadding: 20+22,

    paddingTop: 30,
    paddingSide: 20,

    truncateAfter: 25,
    truncateGroupAfter: 25,

    setCellDistance: 12,
    setCellSize: 10,
    cellWidth: 27,

//         tableBodyHeight;
//         h;
//         rowScale;

    svgHeight: 1200, //height || 600;
    guildHeaderHeight: 60,

    grays: [ '#f0f0f0', '#636363'],

    backHighlightColor: '#fed9a6',//'#fdbf6f'
    specialHighlightColor: '#f4fd6f',
    rowTransitions: true,
    barTransitions: true,

    globalStatistics: [
        {name: "largest intersection", id: "I", value: 100 },
        {name: "largest aggregate", id: "A", value: 120 },
        {name: "largest set", id: "S", value: 150 },
        {name: "universal set", id: "U", value: 400 }
    ],

    nameForRelevance:"Disproportionality",

    summaryStatisticVis : [{
        attribute:"",
        visObject:{}
    }],// list of all statistic graphs TODO: make dynamic !!!
    summaryStatisticsWidth:100,


    // GROUPING OPTIONS
    groupingOptions : {},

    setSelection: {
        paginationStart:0,
        paginationEnd:10,
        mode:"none", // special modes are: "multiSel", "sortFilter"
        modeChange: false,// only true if mode changed and re-rendering
        multiSelIn:d3.set(),
        multiSelOut:d3.set(),
        setOrder: 'size' // options: size or name
    },

    logicStates: {
        NOT:0,
        DONTCARE:2,
        MUST:1
    },

    w: 0,
    tableBodyHeight: 0,
    rowScale: 0,
    cellSize: 0,
    xStartSetSizes: 0,
    setVisWidth: 0,
    xStartStatisticColumns: 0,

    newlyAddedSet: "",

    scaleBarEndRange: 100,

    sortCheck: "sortIntersectionSizeAscend"

};

//bindEvents();

function plot() {
    ctx.plot();
}

function UpSet() {

    // FAKE:
//    var usedSets = ["xx","zzz"];

    //bindEvents();

    function setDynamicVisVariables() {

        //console.log("set dynamic");

        ctx.tableBodyHeight = renderRows.length * (ctx.cellDistance + 4);
//        ctx.h = ctx.tableBodyHeight + ctx.textHeight;

        ctx.rowScale = d3.scale.ordinal().rangeRoundBands([0, ctx.tableBodyHeight], 0, 0);
        ctx.rowScale.domain(renderRows.map(function (d) {
            return d.id;
        }));


        // dynamic context variables
        ctx.cellSize = ctx.cellDistance; // - minorPadding,

        ctx.xStartSetSizes = ctx.cellWidth * usedSets.length + ctx.majorPadding;

        //ctx.xStartExpectedValues = ctx.xStartSetSizes + ctx.subSetSizeWidth + ctx.majorPadding;

        ctx.setVisWidth = ctx.expectedValueWidth + ctx.subSetSizeWidth
            + ctx.majorPadding + ctx.xStartSetSizes; //+ ctx.summaryStatisticVis.length * (ctx.summaryStatisticsWidth + ctx.majorPadding);// TODO HACK !!!

        ctx.w = ctx.xStartSetSizes + //ctx.leftOffset +
            ctx.subSetSizeWidth + ctx.expectedValueWidth + ctx.majorPadding + 50; //+ctx.summaryStatisticVis.length*(ctx.summaryStatisticsWidth+ctx.majorPadding);
        //ctx.setMatrixHeight = ctx.setCellDistance + ctx.majorPadding;

        //console.log("ctx.w: " + ctx.w);
        //ctx.svgHeight = ctx.svgHeight;///*renderRows.length * ctx.cellSize*/ctx.rowScale.rangeExtent()[1];// TODO: Duplicate to ctx.tableBodyHeight

        //console.log(ctx.w);
        ctx.intersectionClicked = function (d) {

            $(document).ajaxStart(function(){
                $('.sk-fading-circle').show();
            });

            $(document).ajaxStop(function(){
                $('.sk-fading-circle').hide();
            });

            //console.log(d);
            //console.log(d.data);
            var selection = Selection.fromSubset(d.data);
            //console.log("from intersection clicked");
            var selectedItemsID = [];
            var setsCombination = [];
            var descriptionText = "";
            var agentName = "", userName = "", tagName = "";
            var count = 0;
            var ids = d.data.elementName.split(",");
            var headOrNot = "normal";
            if(ids.length == 1 && ids[0] == "Query"){
                headOrNot = "queryHeader";
                d.data.elements().forEach(function(ed, i){
                    var oneSection = [];
                    //console.log(ed);
                    ed.forEach(function(one){
                        //console.log(one);
                        oneSection.push({
                            name: setIdToSet[one.key].elementName,
                            type: setIdToSet[one.key].cluster,
                            state: one.state
                        });
                    });
                    setsCombination.push(oneSection);
                    });
            }
            else {
                var oneSection = [];
                ids.forEach(function (id) {
                    if (id == 0) {
                        descriptionText = "Tracks related to none of the selected sets.";
                        oneSection.push({name: null, type: null});
                    }
                    else {
                        var names = setIdToSet[id].elementName.split(/\(|\)/g);
                        if(count == 0) {
                            switch(setIdToSet[id].cluster)
                            {
                                case 0:
                                    agentName = names[0].trim() + ", ";
                                    descriptionText = "Tracks recommended by " + agentName;
                                    break;
                                case 1:
                                    userName = names[0].trim() + ", ";
                                    descriptionText = "Tracks loved by " + userName;
                                    break;
                                case 2:
                                    tagName = names[0].trim() + ", ";
                                    descriptionText = "Tracks tagged with " + tagName;
                                    break;
                            }
                            if(usedSets.length == 1) {
                                descriptionText = descriptionText.slice(0, -2);
                                descriptionText += "."
                            }
                            else descriptionText += "but not related to the rest of the selected sets."
                            count++;
                        }
                        else {
                            switch(setIdToSet[id].cluster)
                            {
                                case 0:
                                    agentName += names[0].trim() + ", ";
                                    break;
                                case 1:
                                    userName += names[0].trim() + ", ";
                                    break;
                                case 2:
                                    tagName += names[0].trim() + ", ";
                                    break;
                            }
                            count++;
                        }
                        oneSection.push({name: setIdToSet[id].elementName, type: setIdToSet[id].cluster, state: 1});
                    }
                });
                if(ids.length > 1) {
                    descriptionText = "Tracks ";
                    if (agentName != "")
                        descriptionText += "recommended by " + agentName;
                    if (userName != "")
                        descriptionText += "loved by " + userName;
                    if (tagName != "")
                        descriptionText += "tagged with " + tagName;
                    if (usedSets.length > ids.length) {
                        descriptionText += "but not related to the rest of the column(s).";
                    }
                    else {
                        descriptionText = descriptionText.slice(0, -2);
                        descriptionText += ".";
                    }
                }
                setsCombination.push(oneSection);
            }

            selection.items.forEach(function (di) {
                selectedItemsID.push(attributes[0].values[di]);
            });
            //console.log(selectedItemsID);
            var date = new Date();
            userBehavior.push({
                type: 4,
                setsCombination: setsCombination,
                group_type: d.type,
                query_header: headOrNot,
                Items: selectedItemsID.length,
                time: (date.getDate()<10?'0':'') + date.getDate()  + " @ " + (date.getHours()<10?'0':'') + date.getHours()  + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes()  + ":" + (date.getSeconds()<10?'0':'') + date.getSeconds()
            });

            $(EventManager).trigger("user-behavior-added");

            selections.addSelection(selection, false);
            selections.setActive(selection);
            $("#element-view-description").text(descriptionText).css("color", selections.getColor(selection));
        }

        //console.log(ctx.setVisWidth + "     " + ctx.w);

        //ctx.xStartStatisticColumns = ctx.xStartExpectedValues + ctx.expectedValueWidth + ctx.majorPadding // TODO: HACK!!!

        //if (ctx.logicPanel instanceof LogicPanel)
        //{
        //    //console.log("instance: ");
        //    //console.log("is shown: " + ctx.logicPanel.isShown + " " + ctx.logicPanel.panelHeight);
        //    if(ctx.logicPanel.isShown){
        //        ctx.svgHeight = renderRows.length * (ctx.cellDistance + 4) + ctx.logicPanel.panelHeight;
        //    }
        //    else ctx.svgHeight = renderRows.length * (ctx.cellDistance + 4);
        //    ctx.svgBody.attr('height', ctx.svgHeight);
        //    ctx.svgBody.attr('width', ctx.w);
        //}

        if (typeof ctx.svgBody !== 'undefined') {
            ctx.svgBody.attr('height', ctx.tableBodyHeight);
            ctx.svgBody.attr('width', ctx.w);
        }

        ctx.horizonBarGrays = d3.scale.linear().domain([0,1,2]).range(["#bdbdbd","#888888","#252525" ])

    }

    function calculateGlobalStatistics() {
        var collector = {allItems: 1};
        dataRows.forEach(function (d) {

            var setSize = d.setSize;
            var type = d.type;

            var maxValue = collector[ type];
            if (maxValue == null) {
                collector[type] = setSize;
            }
            else if (maxValue < setSize) {
                collector[type] = setSize;
            }
//            console.log(d.type);
//            if (d.type === ROW_TYPE.SUBSET) {
//                console.log("iS Before", collector.allItems);
//                collector.allItems += setSize;
//                console.log("iS", collector.allItems);
//            }

        })

//        d3.max(usedSets, function(d){})

//    console.log(usedSets);

//        {name: "largest intersection",id:"I", value:100 },
//        {name: "largest group",id:"G", value:200 },
//        {name: "largest set",id:"S", value:300 },
//        {name: "all items",id:"A", value:400 }

        ctx.globalStatistics.forEach(function (d) {
            switch (d.id) {
                case "I":
                    d.value = collector[ROW_TYPE.SUBSET];
                    break;
                case "A":
                    d.value = collector[ROW_TYPE.GROUP];
                    break;
                case "U":
                    d.value = allItems.length;
                    break;
                case "S":
                    d.value = d3.max(usedSets, function (d) {
                        return d.items.length
                    })
                    break;
                default:
                    break;
            }

        })

    }

    // All global variables and SVG elements
    function init() {
        //console.log("initial");
        var setScale = d3.scale.ordinal().domain([0, 1]).range(ctx.grays);
        setDynamicVisVariables();
        // create SVG and VIS Element
        d3.select('#bodyVis').select('svg')
            .remove();
        ctx.svgBody = d3.select('#bodyVis')
//            .style('width', ctx.w + "px")
            .append('svg')
            .attr('width', ctx.w)

//        ctx.vis = ctx.svgBody.append("g").attr({
//            class: "svgRows",
//            "transform": "translate(" + ctx.leftOffset + "," + ctx.topOffset + ")"
//        });

        // -- the background highlights

        ctx.columnBackgroundNode = ctx.svgBody.append("g").attr({
            class: "columnBackgroundsGroup"

        }).attr({
            //"transform":"translate("+ctx.leftOffset+","+0+")"
        });

        //ctx.scrollRange = ctx.svgBody.append("g").attr({
        //    class: "scrollRange"
        //});//.attr({
        //    "transform":"translate("+ctx.leftOffset+","+0+")"
        //})
        // Rows container for vertical panning
        ctx.gRows = ctx.svgBody
            .append('g')
            .attr({
                'class': 'gRows',
                //"transform":"translate("+ctx.leftOffset+","+0+")"
            })

        // tooltips on top !
        ctx.toolTipLayer = ctx.svgBody.append("g").attr({class:"toolTipLayer"});



        d3.select("#headerVis").select("svg").remove();
        ctx.svgHeader = d3.select("#headerVis").append('svg')
            .attr('width', ctx.w)
            .attr('height', 100 + ctx.textHeight + ctx.guildHeaderHeight)
            .attr("id", "mysvg");
//            .style({
//                "top":"",
//                "position":"relative"
//            });

//chen: logicPanel: the query setting panel
        //####################### LogicPanel ##################################################

        //ctx.logicPanelNode = ctx.svgBody.append("g").attr({
        //    class: "logicPanel",
        //    "transform": "translate(" + 0 + "," + 0 + ")"
        //})
        //
        //// TODO: give only context
        //ctx.logicPanel = new LogicPanel(
        //    {
        //        width: ctx.setVisWidth + ctx.leftOffset,
        //        visElement: ctx.svgHeader,
        //        panelElement: ctx.logicPanelNode,
        //        cellSize: ctx.cellSize,
        //        usedSets: usedSets,
        //        grays: ctx.grays,
        //        belowVis: ctx.gRows,
        //        belowCol: ctx.columnBackgroundNode,
        //        buttonX: 0,
        //        buttonY: ctx.svgHeader.attr("height")-20,
        //        stateObject: UpSetState,
        //        subsets: subSets,
        //        callAfterSubmit: [updateState, updateStatistics, rowTransition],
        //        leftAlignment:ctx.leftOffset,
        //        ctx: ctx,
        //        cellWidth: ctx.cellWidth
        //
        //    });
        ctx.guildHeader = ctx.svgHeader.append("g").attr({
            class: "guildHeader"
        })
        ctx.guildHeader.append("circle")
            //    .attr('cx', function (d, i) {
            //    return (ctx.cellWidth) * i + ctx.cellWidth / 2;
            //})
            .attr({
                r: ctx.cellSize / 4 - 2,
                cy: ctx.cellSize / 4,
                class: 'cell',
                "transform":"translate(20"+",0"+")"
            })
            .style('fill', setScale(1))
            .style('stroke', "#636363")
            .attr({
                'stroke-width': '2pt'
            });
        ctx.guildHeader.append("text").attr({
            class: 'cellGuild',
            "transform":"translate(30"+",12"+")"
        }).text("Tracks recommended by the agent, loved by the user, or tagged with the tag.")
        ctx.guildHeader.append("circle")
            .attr({
                r: ctx.cellSize / 4 - 2,
                cy: ctx.cellSize / 4,
                class: 'cell',
                "transform":"translate(20"+",20"+")"
            })
            .style('fill', setScale(0))
            .style('stroke', "#636363")
            .attr({
                'stroke-width': '2pt'
            });
        ctx.guildHeader.append("text").attr({
            class: 'cellGuild',
            "transform":"translate(30"+",32"+")"
        }).text("Tracks not recommended by the agent, loved by the user, or tagged with the tag.")
        ctx.guildHeader.append("circle")
            .attr({
                r: ctx.cellSize / 4 - 2,
                cy: ctx.cellSize / 4,
                class: 'cell',
                "transform":"translate(20"+",40"+")"
            })
            .style('fill', "#6fadfd")
            .style('stroke', "#6fadfd")
            .attr({
                'stroke-width': '2pt'
            });
        ctx.guildHeader.append("text").attr({
            class: 'cellGuild',
            "transform":"translate(30"+",52"+")"
        }).text("Tracks loved by the current user.")


        ctx.tableHeaderNode = ctx.svgHeader.append("g").attr({
            class: "tableHeader",
            "transform":"translate("+ctx.leftOffset+","+ ctx.guildHeaderHeight +")"
        });

        updateHeaders();

        plotSubSets();

        initCallback = [dataSetChanged] //TODO: bad hack !!!

        updateFrames($(window).height(), null);

        updateFrames(null,$(".ui-layout-center").width());

    }

//    // update svg size
//    var updateSVG = function (width, height) {
//        ctx.w = width;
//        ctx.svgHeight = height;
//
//        ctx.svg
//            .attr('width', ctx.w)
//            .attr('height', ctx.svgHeight)
//
//    }


    function dataSetChanged(){
//        ctx.summaryStatisticVis[0].attribute = attributes.filter(function(d){
//            return d.type=="integer" || d.type=="float"
//        })[0].name

//        ctx.summaryStatisticVis=[];
//        attributes.filter(function(d){
//            return (d.type=="integer" || d.type=="float") && (d.name!="Set Count")
//        }).forEach(function(attribute,i){
//
//                ctx.summaryStatisticVis.push({
//                    attribute: attribute.name,
//                    visObject:new StatisticGraphs()
//                })
////                ctx.summaryStatisticVis[i].attribute = name;
//            })




        //updateStatistics()
        //setDynamicVisVariables()

        ctx.svgBody.attr({
            width: (Math.max(ctx.w, 400))
        })

        updateHeaders();
        plotSubSets();

    }

    function updateSortBy(svgHeaderNode) {
        svgHeaderNode.selectAll("foreignObject").remove();

        var div = svgHeaderNode.append("foreignObject")
            .attr({
                transform: "translate(" + (ctx.leftOffset + ctx.xStartSetSizes) + "," + ctx.guildHeaderHeight + ")",
                width: 200,
                height: 150
            })
            .append("xhtml:body").append("div")
            .attr({
                id: "sortConfig",
                class: "configTable"
            });
        div.append("div").style('font-weight','bold').text("Sort rows by");
        div.append("div").text("number of tracks");
        var check1 = div.append("div");
        check1.append("input")
            .attr({
                type: "radio",
                id: "sortIntersectionSizeAscend",
                name: "sort"
            })
        var label1 = check1.append("label")
            .attr({
                for: "sortIntersectionSizeAscend"
            })
            //.text('Ascending');
            label1.append("img")
            .attr({
                src: "./javascripts/images/ascend.png",
                width: 15,
                height: 15
            });
        label1.append('text').text("Ascending");

        var check2 = div.append("div");
        check2.append("input")
            .attr({
                type: "radio",
                id: "sortIntersectionSize",
                name: "sort"
            })
        var label2 = check2.append("label")
            .attr({
                for: "sortIntersectionSize"
            })
        //.text('Ascending');
        label2.append("img")
            .attr({
                src: "./javascripts/images/descend.png",
                width: 15,
                height: 15
            });
        label2.append('text').text("Descending");
        div.append('div').text("number of filled circles");
        var check3 = div.append("div");
        check3.append("input")
            .attr({
                type: "radio",
                id: "sortNrSetsInIntersectionAscend",
                name: "sort"
            })
        var label3 = check3.append("label")
            .attr({
                for: "sortNrSetsInIntersectionAscend"
            })
        //.text('Ascending');
        label3.append("img")
            .attr({
                src: "./javascripts/images/ascend.png",
                width: 15,
                height: 15
            });
        label3.append('text').text("Ascending");

        var check4 = div.append("div");
        check4.append("input")
            .attr({
                type: "radio",
                id: "sortNrSetsInIntersectionDescend",
                name: "sort"
            })
        var label4 = check4.append("label")
            .attr({
                for: "sortNrSetsInIntersectionDescend"
            })
        //.text('Ascending');
        label4.append("img")
            .attr({
                src: "./javascripts/images/descend.png",
                width: 15,
                height: 15
            });
        label4.append('text').text("Descending");

        if(ctx.sortCheck != "")
            d3.select("#"+ctx.sortCheck).attr('checked', 'true')
        setUpSortSelections();
        //<div id="sortConfig" class="configTable">
    //        <div class="configHeader">Sort by</div>
    //    <div>number of papers</div>
    //    <div>
    //    <input type='radio' id='sortIntersectionSizeAscend' name='sort' checked="true">
    //        <label for="sortIntersectionSizeAscend"><img src="./javascripts/images/ascend.png" width="15" height="15"/> Ascending</label>
    //        </div>
    //        <div>
    //        <input type='radio' id='sortIntersectionSize' name='sort'>
    //        <label for="sortIntersectionSize"><img src="./javascripts/images/descend.png" width="15" height="15"/> Descending</label>
    //        </div>
    //        <div>number of related sets</div>
    //    <div>
    //    <input type='radio' id='sortNrSetsInIntersectionAscend' name='sort'>
    //        <label for="sortNrSetsInIntersectionAscend"><img src="./javascripts/images/ascend.png" width="15" height="15"/> Ascending</label>
    //        </div>
    //        <div>
    //        <input type='radio' id='sortNrSetsInIntersectionDescend' name='sort'>
    //        <label for="sortNrSetsInIntersectionDescend"><img src="./javascripts/images/descend.png" width="15" height="15"/> Descending</label>
    //        </div>
    //        </div>
    }

    //draw sets header, the diagonal ones, chen: set label up left part
    //####################### SETS ##################################################
    function updateSetsLabels(tableHeaderNode) {

        var setRowScale = d3.scale.ordinal().rangeRoundBands([0, usedSets.length * (ctx.cellWidth)], 0);
        setRowScale.domain(usedSets.map(function (d) {
            return d.id
        }))

        var setRows = tableHeaderNode.selectAll('.setRow')
            .data(usedSets, function (d) {
                return d.elementName
            })

        var setRowsEnter = setRows.enter()
            .append('g').attr({
                class: "setRow"
            })

        setRows.exit().remove();

        var setRects = setRows.selectAll(".sortHeaderGroup").data(function (d, i) {
            return [d]
        })

        var setRectsEnter = setRects.enter().append("g").attr({
            class: "sortHeaderGroup"
        })

        setRectsEnter
            .append('text')
            .text("\uf057")
            .attr({
                class: "groupDeleteIcon",
                transform: "translate(10, 15)"
            })
            .style('fill', "#f46d43")
            .on('click', setClicked)
            .on("mouseover", function(d){
                document.getElementById("tipbar").innerHTML = "Click to remove [ " + d.elementName +" ] from the view."
            }).on("mouseout", function(d){
                document.getElementById("tipbar").innerHTML = ""
            })
        setRectsEnter
            .append("rect")
            .attr({
                transform: function (d, i) {
                    return 'translate(0,15) skewX(-45)';
                    //return 'skewX(-45) translate(' + (- ctx.leftOffset) + ',0)';
                },
                class: "sortBySet connection vertical",

                width: ctx.cellWidth,
                height: ctx.textHeight - 2
            })
        .on('mouseover', function(d,i){
                var names = d.elementName.split(/\(|\)/g);
                var text = "";
                switch (d.cluster){
                    case 0: text += "recommended by " + names[0].trim();
                        break;
                    case 1:
                        text += "bookmarked by " + names[0].trim();
                        break;
                    case 2:
                        text += "tagged with " + names[0].trim();
                        break;
                }
                document.getElementById("tipbar").innerHTML = "Click to view all tracks " + text + ".";
                mouseoverColumn(d,i);
        })
        .on('mouseout', function(d,i){
                document.getElementById("tipbar").innerHTML = "";
                mouseoutColumn();
            })
            .append("svg:title")
            .text(function (d, i) {
                if(d.id == globalSetId)
                    return "Tracks loved by you.";
                var names = d.elementName.split(/\(|\)|\//g);

                switch (d.cluster){
                    case 0:
                        return names[1].trim() + " tracks recommended by " + names[0].trim() + ".";
                    case 1:
                        if(parseInt(names[2].trim()) > 1)
                            return names[2].trim() + " tracks loved by " + names[0].trim() + ".";
                        else
                            return names[2].trim() + " track loved by " + names[0].trim() + ".";
                    case 2:
                        if(parseInt(names[1].trim()) > 1)
                            return names[1].trim() + " tracks tagged with " + names[0].trim() + ".";
                        else
                            return names[1].trim() + " track tagged with " + names[0].trim() + ".";
                }
                return "";
            })
            .style({
                'font-size': '16pt'
            });


        var setRowsText = setRowsEnter.selectAll("text").data(function (d) {
            return [d]
        })
        var headerText = setRowsEnter
        //setRectsEnter
            .append("text")
            headerText.text(
            function (d) {

              var str = d.elementName.substring(0, ctx.truncateAfter);
              if(str.length < d.elementName.length)
                str = str.trim() + "...";

              return str;
            }).attr({
                class: 'setLabel sortBySet noselect',
                //  "pointer-events": "none",
                id: function (d) {
                    return d.id;//d.elementName.substring(0, ctx.truncateAfter);
                },
                transform: 'translate(' + (-ctx.topOffset + 90) + ',' + (ctx.leftOffset + 10) + ')rotate(-45)',
                    //return "rotate(-45)"//
                    //return 'translate(0,' + (ctx.textHeight - ctx.textSpacing) + ')rotate(-60)';

                'text-anchor': 'start'
            })
            .style({
                'cursor':'s-resize'
            })
            .on('mouseover', function(d,i) {
                var names = d.elementName.split(/\(|\)/g);
                var text = "";
                switch (d.cluster){
                    case 0: text += "recommended by " + names[0].trim();
                        break;
                    case 1:
                        text += "bookmarked by " + names[0].trim();
                        break;
                    case 2:
                        text += "tagged with " + names[0].trim();
                        break;
                }
                document.getElementById("tipbar").innerHTML = "Click to view all tracks " + text + ".";
                mouseoverColumn(d,i);
            })
            .on('mouseout', function(){
                document.getElementById("tipbar").innerHTML = "";
                    mouseoutColumn()
            })
            headerText.append("svg:title")
            .text(function (d, i) {
                var names = setIdToSet[d.id].elementName.split(/\(|\)|\//g);
                switch(d.cluster)
                {
                    case 0:
                        return names[1].trim() + " tracks recommended by " + names[0].trim() + ".";
                    case 1:
                        if(parseInt(names[2].trim()) > 1)
                            return names[2].trim() + " tracks loved by " + names[0].trim() + ".";
                        else
                            return names[2].trim() + " track loved by " + names[0].trim() + ".";
                    case 2:
                        if(parseInt(names[1].trim()) > 1)
                            return names[1].trim() + " tracks tagged with " + names[0].trim() + ".";
                        else
                            return names[1].trim() + " track tagged with " + names[0].trim() + ".";

                }
            }).style({
                'font-size': '16pt'
            });

        setRects.exit().remove();

        //setRowsText.attr({
        //    class: function () {
        //        if (ctx.cellWidth > 16) return 'setLabel'; else return 'setLabel small'
        //    }
        //
        //})

        setRows.attr({transform: function (d, i) {

            return 'translate(' + setRowScale(d.id) + ', 0)';
            //  return 'translate(0, ' + ( cellDistance * (i)) + ')';
        },
            class: 'setRow'});

        //chen: sort by click set icon
        d3.selectAll('.sortBySet, .setRow .setLabel').on(
            'click',
            function (d, i) {
                //console.log(d);
                var date = new Date();
                //userBehavior.push({type: 2, sort: [{name: d.elementName, type: d.cluster}], time: (date.getDate()<10?'0':'') + date.getDate()  + " @ " + (date.getHours()<10?'0':'') + date.getHours()  + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes()  + ":" + (date.getSeconds()<10?'0':'') + date.getSeconds()});
                UpSetState.sorting = StateOpt.sortBySetItem;
                //UpSetState.grouping = undefined;
                //UpSetState.levelTwoGrouping = undefined;
                UpSetState.forceUpdate = true;
                updateState(d);
                rowTransition();

                //uncheck checkbox
                $("#sortIntersectionSize").prop("checked", false);
                $("#sortIntersectionSizeAscend").prop("checked", false);
                $("#sortNrSetsInIntersectionAscend").prop("checked", false);
                $("#sortNrSetsInIntersectionDescend").prop("checked", false);
                ctx.sortCheck = "";

                //document.getElementById("tipbar").innerHTML = "Gather rows related to [ "+ d.elementName +" ] in front."

                //show papers inside the row
                var selection = Selection.fromSubset(levelOneGroups[parseInt(i/2) + 1]);
                var id = d.id;
                var selectedItemsID = [];

                selection.items.forEach(function (di) {
                    selectedItemsID.push(attributes[0].values[di]);
                });
                ////console.log(selectedItemsID);
                //var date = new Date();
                //userBehavior.push({
                //    type: 4,
                //    setsCombination: [{name: setIdToSet[id].elementName, type: setIdToSet[id].cluster, state: 1}],
                //    group_type: d.type,
                //    Items: selectedItemsID.length,
                //    time: (date.getDate()<10?'0':'') + date.getDate()  + " @ " + (date.getHours()<10?'0':'') + date.getHours()  + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes()  + ":" + (date.getSeconds()<10?'0':'') + date.getSeconds()
                //});
                //
                //$(EventManager).trigger("user-behavior-added");

                selections.addSelection(selection, false);
                selections.setActive(selection);

                var names = setIdToSet[id].elementName.split(/\(|\)/g);
                var text = "";
                switch (setIdToSet[id].cluster){
                    case 0: text += "recommended by " + names[0].trim();
                        break;
                    case 1:
                        text += "bookmarked by " + names[0].trim();
                        break;
                    case 2:
                        text += "tagged with " + names[0].trim();
                        break;
                }

                $("#element-view-description").text("All tracks " + text + ".").css("color", selections.getColor(selection));
                document.getElementById("tipbar").innerHTML = "Showing all tracks " + text + " on the right side.";

            }).style({
                'cursor':'s-resize'
            });

    }


    function updateStatistics(){
        //ctx.summaryStatisticVis.forEach(function(sumStat,i){
        //    sumStat.visObject.updateStatistics(renderRows, "id", "data.items", attributes,"name","values", sumStat.attribute)
        //});
//        ctx.summaryStatisticVis[0].visObject.updateStatistics(subSets, "id", "items", attributes,"name","values", ctx.summaryStatisticVis[0].attribute)
    }



    function addStatisticColumn(){
        var allAttributes = attributes.filter(function(d){
            return d.type=="integer" || d.type=="float"
        })

        allAttributes.unshift(ctx.nameForRelevance);
        // find first not-used


        var delList = allAttributes.map(function(d){return d})

        ctx.summaryStatisticVis.forEach(function(stat){
            delList.remove(stat.attribute);
        })
    }


    function updateHeaders() {
        setDynamicVisVariables()
        //calculateGlobalStatistics();
        //console.log("update header");

        //if($("#set-vis-container")[0].getBoundingClientRect().width - ctx.xStartSetSizes - ctx.leftOffset - 45 < 500)
        //    ctx.subSetSizeWidth = $("#set-vis-container")[0].getBoundingClientRect().width - ctx.xStartSetSizes - ctx.leftOffset - 45;

        if($("#set-vis-container")[0].getBoundingClientRect().width - ctx.xStartSetSizes - 45 < 450)
            ctx.subSetSizeWidth = $("#set-vis-container")[0].getBoundingClientRect().width - ctx.xStartSetSizes - 45;

        var redraw = false;
        // -- Create Table Header:
        //var tableHeaderGroup = ctx.tableHeaderNode.selectAll(".tableHeaderGroup").data([1]);
        var tableHeaderGroup = ctx.svgHeader.selectAll(".tableHeaderGroup").data([1]);
        var tableHeaderGroupEnter = tableHeaderGroup.enter().append("g").attr({class: "tableHeaderGroup noselect"});
        //console.log(tableHeaderGroupEnter[0][0] == null);
        if(ctx.subSetSizeWidth < 450 && tableHeaderGroupEnter[0][0] == null){
            ctx.svgHeader.selectAll(".tableHeaderGroup").remove();
            //tableHeaderGroup = ctx.tableHeaderNode.selectAll(".tableHeaderGroup").data([1]);
            tableHeaderGroup = ctx.svgHeader.selectAll(".tableHeaderGroup").data([1]);
            tableHeaderGroupEnter = tableHeaderGroup.enter().append("g").attr({class: "tableHeaderGroup noselect"});
            redraw = true;
        }

        updateSortBy(ctx.svgHeader);

        //------------ subSet value header -----------------------

        var subsetSizeAxis = tableHeaderGroupEnter.append('g')
            .attr({
                id: "subSetSizeAxis",
                class: 'axis'
            });
        //console.log(tableHeaderGroupEnter);
            subsetSizeAxis.each(function () {
                ctx.brushableScaleSubsetUpdate = function () {
                };
                //console.log("call brushable");
                ctx.brushableScaleSubset = new BrushableScale(
                    ctx,
                    d3.select(this),
                    ctx.subSetSizeWidth,
                    "brushableScaleSubsetUpdate", "plotTable", "subSetSizeScale", {
                        columnLabel:"Number of tracks"
                        //actionsTrioggeredByLabelClick:[function(){
                        //    var date = new Date();
                        //    userBehavior.push({type: 2, sort: [{name: "sort by set sizes", type: 6}], time: (date.getDate()<10?'0':'') + date.getDate()  + " @ " + (date.getHours()<10?'0':'') + date.getHours()  + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes()  + ":" + (date.getSeconds()<10?'0':'') + date.getSeconds()});
                        //    $(EventManager).trigger("user-behavior-added");
                        //
                        //    UpSetState.sorting = StateOpt.sortBySubSetSize;
                        //    UpSetState.grouping = undefined;
                        //    UpSetState.levelTwoGrouping = undefined;
                        //    UpSetState.forceUpdate = true;
                        //    $('#noGrouping').prop('checked', true);
                        //    //$('#sortRelevanceMeasure').prop('checked', true);
                        //    //toggleGroupingL2(true);
                        //    updateState();
                        //    rowTransition();
                        //    //$("#sortIntersectionSize").prop('checked', true);
                        //
                        //    $("#sortNrSetsInIntersectionAscend").prop("checked", false);
                        //    $("#sortNrSetsInIntersectionDescend").prop("checked", false);
                        //    document.getElementById("tipbar").innerHTML = "Sort rows by their related number of papers (descending)."
                        //
                        //}]
                    })
            });

        // *** update Part

//        tableHeaderGroup.selectAll("#subSetSizeLabelRect").attr({
//            transform: 'translate(' + ctx.xStartSetSizes + ',' + (ctx.labelTopPadding) + ')',
//            height: '20',
//            width: ctx.subSetSizeWidth
//        });
//
//        tableHeaderGroup.selectAll("#subSetSizeLabelText").attr({
//            transform: 'translate(' + (ctx.xStartSetSizes + ctx.subSetSizeWidth / 2) + ','
//                + (ctx.labelTopPadding + 10) + ')'
//        });

        var maxValue = d3.max(ctx.globalStatistics, function (d) {
            return d.value
        });

        //if(redraw == false) {
            tableHeaderGroup.selectAll("#subSetSizeAxis").attr({
                //transform: 'translate(' + ctx.xStartSetSizes + ',' + (ctx.textHeight - 92) + ')' // TODO magic number
                transform: 'translate(' + (ctx.xStartSetSizes) + ',' + (ctx.textHeight + 5 + ctx.guildHeaderHeight) + ')'
            })
                .call(ctx.brushableScaleSubsetUpdate,
                {
                    maxValue: maxValue,
                    labels: ctx.globalStatistics,
                });
        //}

        updateSetsLabels(ctx.tableHeaderNode);


        //get width of an element $("#subSetSizeAxis")[0].getBoundingClientRect().width
        ctx.subSetSizeWidth = $("#subSetSizeAxis")[0].getBoundingClientRect().width;
        ctx.svgHeader.attr("width", ctx.w);

    }

    //chen: draw rows, the whole row as a group
    function updateSubSetGroups() {

      // ------------------- the rows -----------------------
      var subSets = ctx.gRows.selectAll('.row')
          .data(renderRows, function (d, i) {
              return d.id;
          });
        //console.log("update set groups");
//        console.log("rr:",renderRows);
//        console.log("rr2:",ctx.rowScale.domain());


      var rowSubSets = subSets
          .enter()
          .append('g')
          .attr({transform: function (d) {

              if (d.data.type === ROW_TYPE.SUBSET || d.data.type === ROW_TYPE.GROUP) {
                  return 'translate(0, ' + ctx.rowScale(d.id) + ')';
              }else {
                  var offset_y = ctx.textHeight;
                  if (d.data.level == 2)
                      offset_y += 10
                  return 'translate(0, ' + offset_y + ')';
              }
          }, class: function (d) {
              return 'row ' + d.data.type;
          }
          }).style("opacity", function (d) {
              if (d.data.type === ROW_TYPE.SUBSET || d.data.type === ROW_TYPE.GROUP)
                  return ctx.gRows.selectAll('.row')[0].length == 0 ? 1 : 0;
              else
                  return ctx.gRows.selectAll('.row')[0].length ? 0 : 1;
          })
        .on({
            'mouseenter': function(d, i) {
                var sets = d.data.elementName.split(",");
                //console.log(sets);
                if(sets.length == 1){
                    if(sets[0] == "") {
                        document.getElementById("tipbar").innerHTML = "Click to view tracks related to none of the selected sets on the right side.";
                    }
                    else {
                        var names = setIdToSet[sets[0]].elementName.split(/\(|\)/g);
                        document.getElementById("tipbar").innerHTML = "Click to view tracks only related to " + names[0].trim() + " on the right side.";
                    }
                }
                else{
                    var ids = d.data.elementName.split(",");
                    var agentName = "", userName = "", tagName = "";

                    ids.forEach(function(id) {
                        var names = setIdToSet[id].elementName.split(/\(|\)/g);

                        switch (setIdToSet[id].cluster) {
                            case 0:
                                agentName += names[0].trim() + ", ";
                                break;
                            case 1:
                                userName += names[0].trim() + ", ";
                                break;
                            case 2:
                                tagName += names[0].trim() + ", ";
                                break;
                        }
                    })

                    descriptionText = "Click to view tracks ";
                    if (agentName != "")
                        descriptionText += "recommended by " + agentName;
                    if (userName != "")
                        descriptionText += "loved by " + userName;
                    if (tagName != "")
                        descriptionText += "tagged with " + tagName;
                    if (usedSets.length > ids.length) {
                        descriptionText += "but not related to the rest of the column(s).";
                    }
                    else {
                        descriptionText = descriptionText.slice(0, -2);
                        descriptionText += ".";
                    }

                    //var start = "Click to view papers in the intersections of " + sets.length + " sets on the right side. ( ";
                    //var setNames = "[ " + setIdToSet[sets[0]].elementName +" ]";
                    //for(i = 1; i < sets.length; i++) {
                    //    setNames += ", [ "+ setIdToSet[sets[i]].elementName + " ]";
                    //}
                    document.getElementById("tipbar").innerHTML = descriptionText;
                }
                mouseoverRow(d,i)
            },
            'mouseleave': function(d,i){
                document.getElementById("tipbar").innerHTML = "";
                mouseoutRow(d);
            },
              'click': function (d) {
                  //console.log(ctx.leftOffset + "  " + d3.mouse(this)[0]);
                  if ((d.data.type === ROW_TYPE.SUBSET || d.data.type === ROW_TYPE.GROUP) && d3.mouse(this)[0] > 0 && d3.mouse(this)[0] < ctx.xStartSetSizes + ctx.subSetSizeWidth) {
                      //console.log(d3.mouse(this)[0] + " " + ctx.xStartSetSizes);
                      ctx.intersectionClicked(d);
                  }
              }
        })

      // Anticipating future overlays
      rowSubSets.append("g").attr("class", "gBackgroundRect")
      rowSubSets.append("g").attr("class", "gHorizon")
      rowSubSets.append("g").attr("class", "gOverlays")
      rowSubSets.append("g").attr("class", "gIndicators")
      
      subSets.exit().remove();

      var subSetTransition = subSets
      if (ctx.rowTransitions && usedSets.length<10)
          subSetTransition = subSets
              .transition().duration(function (d, i) {
                  if (d.data.type === ROW_TYPE.SUBSET)
                      return queryParameters['duration'];
                  else
                      return queryParameters['duration'];
              })
      subSetTransition.attr({transform: function (d) {
        return 'translate(0, ' + ctx.rowScale(d.id) + ')';
          
      }, class: function (d) {
          return 'row ' + d.data.type;
      }}).transition().duration(100).style("opacity", 1);

      return subSets;
    }

    function updateSubsetRows(subsetRows, setScale) {

        //console.log("update set rows");
        var backgrounds = subsetRows.select(".gBackgroundRect").selectAll(".backgroundRect").data(function (d) {
            return [d]
        })
        backgrounds.enter()
            .append("rect").attr({
                class: "backgroundRect",
                x: 0,
                y: 0,
                width: ctx.setVisWidth,
                height: ctx.cellSize
            })
            .style({
                "fill-opacity": 0.0001,
                fill: ctx.backHighlightColor // for debugging
            })
        //    .on({
        //    'mouseover': mouseoverRow,
        //    'mouseout': mouseoutRow
        //});

        backgrounds.exit().remove();
        backgrounds.attr({
            width: ctx.setVisWidth,
            height: ctx.cellSize
        })

        var combinationGroups = subsetRows.selectAll('g.combination').data(function (d) {
                // binding in an array of size one
                return [d.data.combinedSets];
            }
        )

        combinationGroups.enter()
            .append('g')
            .attr({class: 'combination'
            })
        combinationGroups.exit().remove();

        var cells = combinationGroups.selectAll('.cell').data(function (d) {
            return d.map(function (dd, i) {
                return {data: usedSets[i], value: dd}
            });
        })
        // ** init
        cells.enter()
            .append('circle')
            .on({
                'click': function (d) {
                    //console.log(d);
                    /* click event for cells*/
                }
                //,
                //'mouseover': function (d, i) {
                //    mouseoverCell(d3.select(this).node().parentNode.parentNode.__data__, i)
                //},
                //'mouseout': mouseoutCell
            })
        cells.exit().remove()

        //** update
        cells.attr('cx', function (d, i) {
            return (ctx.cellWidth) * i + ctx.cellWidth / 2;
        })
            .attr({
                r: ctx.cellSize / 2 - 2,
                cy: ctx.cellSize / 2,
                class: 'cell'
            })
            .style('fill', function (d) {
                if(d.value == 1 && d.data.id == globalSetId)
                {
                    return "#6fadfd";
                }
                //else if(d.value == 0){
                //    return './images/remove.png';
                //}
                else return setScale(d.value);
            })
            .style('stroke', function(d){
                if(d.data.id == globalSetId)
                {
                    return "#6fadfd";
                }
                else return "#636363";
            })
            .attr({
                'stroke-width': '2pt'
            });

        // add the connecting line for cells
        var cellConnectors = combinationGroups.selectAll('.cellConnector').data(
            function (d) {
                // get maximum and minimum index of cells with value 1
                var extent = d3.extent(
                    d.map(function (dd, i) {
                        if (dd == 1) return i; else return -1;
                    })
                        .filter(function (dd, i) {
                            return dd >= 0;
                        })
                )

                // dont do anything if there is only one (or none) cell
                if (extent[0] == extent[1]) return [];
                else return [extent];
            }
        );
        //**init
        //cellConnectors.enter().append("line").attr({
        //    class: "cellConnector",
        //    "pointer-events": "none"
        //})
        //    .style({
        //        "stroke": setScale(1),
        //        "stroke-width": 3
        //    });
        //cellConnectors.exit().remove();
        //
        ////**update
        //cellConnectors.attr({
        //    x1: function (d) {
        //        return (ctx.cellWidth) * d[0] + ctx.cellWidth / 2;
        //    },
        //    x2: function (d) {
        //        return (ctx.cellWidth) * d[1] + ctx.cellWidth / 2;
        //    },
        //    y1: ctx.cellSize / 2,
        //    y2: ctx.cellSize / 2
        //});

        //ctx.logicPanelNode.selectAll(".logicPanelHeaderBar").attr({
        //        width:(function(d){//console.log(ctx.subSetSizeScale(d.count));
        //            return ctx.subSetSizeScale(d.count)})
        //    });
        //
        //ctx.logicPanelNode.selectAll(".logicPanelHeaderBarLabel").attr({
        //    x:function(d){return (ctx.xStartSetSizes) + ctx.subSetSizeScale(d.count)+5;}
        //})

        subsetRows.each(function (e, j) {

            var g = d3.select(this);
            var max_scale = ctx.subSetSizeScale.domain()[1];

            var i = 0, is_overflowing = false;
            var nbLevels = 1; //Math.min(ctx.maxLevels, Math.ceil(e.data.setSize / max_scale));

            var data = d3.range(nbLevels).map(function () {

                var f = {};
                f.data = {};
                f.data.type = e.data.type;

               // Prevent empty bar when right on 1-level value
                if(nbLevels==1 && e.data.setSize > 0 && (e.data.setSize % max_scale == 0)) {
                  f.data.setSize = e.data.setSize;
                  return f;
                }

                if (i == nbLevels - 1 && Math.ceil(e.data.setSize / max_scale) < nbLevels + 1)
                    f.data.setSize = (e.data.setSize % max_scale);
                else
                    f.data.setSize = max_scale;
                i++;
                return f;
            })

            g.selectAll(".cutlines").remove();

            if (Math.ceil(e.data.setSize / max_scale) > ctx.maxLevels) {
                //console.log("cutlines");
                var g_lines = g.selectAll(".cutlines").data([e.id]).enter().append("g").attr("class", "cutlines")

                g_lines.append("line")
                    .attr({x1: ctx.xStartSetSizes + ctx.subSetSizeWidth-30, x2: ctx.xStartSetSizes + ctx.subSetSizeWidth-20, y1: 0, y2: 30})
                    .style({'stroke': 'white', 'stroke-width': 1})

                g_lines.append("line")
                    .attr({x1: ctx.xStartSetSizes + ctx.subSetSizeWidth-35, x2: ctx.xStartSetSizes + ctx.subSetSizeWidth-25, y1: 0, y2: 30})
                    .style({'stroke': 'white', 'stroke-width': 1})
            }

            // Add new layers
            var layers_enter = g.selectAll(".gHorizon").selectAll(".row-type-subset").data(data).enter()

            layers_enter.append('rect')
                .attr("class", function (d) {
                    return ( 'subSetSize row-type-subset' );
                })

            // Remove useless layers
            g.selectAll(".row-type-subset").data(data).exit().remove()

            // Update current layers
            g.selectAll(".row-type-subset")
                .attr({
                    transform: function (d, i) {
                        var y = 0;
                        if (d.data.type !== ROW_TYPE.SUBSET)
                            y = 0;//cellSize / 3 * .4;
                        return   'translate(' + (ctx.xStartSetSizes) + ', ' + (y + ctx.cellSizeShrink * i + 1) + ')';
                        // ' + (textHeight - 5) + ')'
                    },

                    width: function (d, i) {
                        return ctx.subSetSizeScale(d.data.setSize);
                    },
                    height: function (d, i) {
                        return ctx.cellSize - ctx.cellSizeShrink * 2 * i - 2;
                    }
                })
                .style({
                    fill:function(d,i){ return ctx.horizonBarGrays(i);}
                })
//                .style("opacity", function (d, i) {
//                    if (nbLevels == 1)
//                        return .8;
//                    else if (nbLevels == 2)
//                        return .8 + i * .2;
//                    else
//                        return .4 + i * .4;
//                })
//                .on('click', function(){
//                  //console.log("e", e, d3.select(this).node().parentNode.__data__)
//                  ctx.intersectionClicked(e);
//                })
//                .on('mouseover', function () {
//                    mouseoverRow(e);
//                })
//                .on('mouseout', function () {
//                    mouseoutRow(e);
//                })

        })
    }

    function updateGroupRows(groupRows) {

        //console.log("update group rows");

        var groupsRect = groupRows.select(".gBackgroundRect").selectAll(".groupBackGround").data(function (d) {
            return [d];
        });
        //**init
        groupsRect.enter().append('rect').attr({
            class: function (d) {
                if (d.data instanceof QueryGroup) {
                    return 'groupBackGround filterGroup';
                } else {
                    if (d.data.level>1) return 'groupBackGround secondLevel';
                    else return 'groupBackGround'
                }
            },
            rx:5,
            ry:10,
            width: ctx.setVisWidth + ctx.leftOffset,
            height: ctx.cellSize,
            x: -ctx.leftOffset,
            y: 0
        })
//            .on('click', function (d) {
//                collapseGroup(d.data);
//                updateStatistics();
//
//                rowTransition(false);
//            });

        groupsRect.exit().remove();
        //**update
        groupsRect.attr({
            width: function (d) {
                return ctx.setVisWidth + ctx.leftOffset - (d.data.level - 1) * ctx.leftIndent;
            },
            height: ctx.cellSize,
            x: function (d) {
                return (d.data.level - 1) * ctx.leftIndent - ctx.leftOffset
            }
        });

        //  console.log('g2: ' + groups);
        var groupsText = groupRows.selectAll(".groupLabel.groupLabelText").data(function (d) {
            return [d];
        });
        groupsText.enter().append('text')
            .attr({class: 'groupLabel groupLabelText',
                y: ctx.cellSize - 3,
                x: function (d) {
                    return (-ctx.leftOffset + 12) + (d.data.level - 1) * ctx.leftIndent;
                },
                'font-size': ctx.cellSize - 6

            });
        groupsText.exit().remove();

        var queryGroupDecoItems = [
//            {id:"I", action:1, color:"#a1d99b"},
            {id: "X", action: 2, color: "#f46d43"}
        ];

        //** update
        groupsText.text(function (d) {

//            if (d.data instanceof QueryGroup){
//                return "@ "+d.data.elementName;
//            }
//            if (d.data.type === ROW_TYPE.GROUP)
//                return d.data.elementName;

            if (d.data.type === ROW_TYPE.AGGREGATE)
                return String.fromCharCode(8709) + '-subsets (' + d.data.subSets.length + ') ';
            else {
                var truncateLength = 0;
              if (d.data.type === ROW_TYPE.GROUP && typeof(d.data.combinedSets) != "undefined") {
                truncateLength = 10;
              } else {
                truncateLength = ctx.truncateGroupAfter;
              }
              var str = d.data.elementName.substring(0, truncateLength);
              if(str.length<d.data.elementName.length)
                str = str.trim() + "...";
              return str;
            }
        }).attr({
                class: function () {
                    if (ctx.cellDistance < 14) return 'groupLabel groupLabelText small'; else return 'groupLabel groupLabelText'
                },
                y: ctx.cellSize - 3,
                x: function (d) {
                    return (-ctx.leftOffset + 15) + (d.data.level - 1) * ctx.leftIndent;
                }

            })
        .on('click', function (d) {
                UpSetState.forceUpdate = true;
                collapseGroup(d.data);
                updateStatistics();
                rowTransition(false);
            })
        .append("svg:title")
            .text(function (d, i) {
                return d.data.elementName;
            }).style({
                'font-size': '16pt'
            });

        var collapseIcon = groupRows.selectAll(".collapseIcon").data(function (d) {
            return [d];
        })
        collapseIcon.enter()
            .append("text")
            .attr({
                class: "collapseIcon"
            }).on('click', function (d) {
                UpSetState.forceUpdate = true;
                collapseGroup(d.data);
                updateStatistics();
                rowTransition(false);
            });

        collapseIcon
            .text(function (d) {
                if (d.data.isCollapsed == 0) return "\uf0dd";//return "\uf147";
                else return "\uf0da";//return "\uf196"
            })
            .attr({"transform": function (d) {
                return "translate(" + (-ctx.leftOffset + 2 + 5 + (d.data.level - 1) * ctx.leftIndent) + "," + (ctx.cellSize / 2 + 5) + ")"
            }
            }).style({
                "font-size": "16pt"
            })

        // -- Decoration for Filter Groups
        var allQueryGroups = groupRows.filter(function (d) {
            return (d.data instanceof QueryGroup)
        })
        var groupDeleteIcon = allQueryGroups.selectAll(".groupDeleteIcon").data(function (d) {
            return [d]
        })
        var groupDeleteIconEnter = groupDeleteIcon.enter().append("g").attr({
            class: "groupDeleteIcon"
        })
//        groupDeleteIconEnter.append("rect").attr({
//            x:-5,
//            y:-10,
//            width:10,
//            height:10,
//            fill:"#f46d43"
//        })
        groupDeleteIconEnter.append("text")
            .text("\uf057") // uf057 uf05e
            .on({
                "click": function (d) {

                    var index = -1;
                    UpSetState.logicGroups.forEach(function (dd, i) {

                        if (dd.id == d.id) index = i;
                    })

                    UpSetState.logicGroups.splice(index, 1);

                    UpSetState.logicGroupChanged = true;
                    UpSetState.forceUpdate = true;

                    updateState();
                    rowTransition();
                }
            }).style({ "fill": "#f46d43"})


        groupDeleteIcon.attr({
            "transform": "translate(" + (ctx.xStartSetSizes - 12) + "," + (ctx.cellSize / 2 + 4) + ")"
        })


        // --- circles for Groups with combinedSets element set --- ///

        function decorateGroupsWithCells(){
            var nonLogicGroups =  groupRows.filter(function (d) {
                return  ("combinedSets" in d.data); //!(d.data instanceof QueryGroup) &&
            })
            var combinationGroups = nonLogicGroups.selectAll('g.combination').data(function (d) {
                    // binding in an array of size one
                    return [d.data.combinedSets];
                }
            )

            combinationGroups.enter()
                .append('g')
                .attr({class: 'combination'
                })
            combinationGroups.exit().remove();


            var cells = combinationGroups.selectAll('.cell').data(function (d) {

                return d.map(function (dd, i) {
                    return {data: usedSets[i], value: dd}
                });
            })
            // ** init
            cells.enter()
                .append('circle')
            //.on({
            //    'mouseover': function (d, i) {
            //        mouseoverCell(d3.select(this).node().parentNode.parentNode.__data__, i)
            //    },
            //    'mouseout': mouseoutCell
            //})
            cells.exit().remove()

            //** update
            cells.attr('cx', function (d, i) {
                return (ctx.cellWidth) * i + ctx.cellWidth / 2;
            })
                .attr({
                    r: ctx.cellSize / 2 - 3,
                    cy: ctx.cellSize / 2,
                    class: 'cell'
                })
                .style('fill', function (d) {
                    switch(d.value)
                    {case 0: //logicState.NOT
                        return ctx.grays[0]
                        break;
                        case 1: //logicState.MUST
                            return ctx.grays[1]
                            break;
                        default: // logicState.DONTCARE
                            return "url(#DontCarePattern)"}
                }
            )
                .style({
                    "stroke":function(d){if (d.value ==0) return ctx.grays[1]; else return "none"}//ctx.grays[1]
                })



        }

        decorateGroupsWithCells();


        function decorateComplexQueries() {
            var complexLogicGroups =  groupRows.filter(function (d) {
                return  ("orClauses" in d.data && d.data.orClauses.length>1); //!(d.data instanceof QueryGroup) &&
            })
            var combinationGroups = complexLogicGroups.selectAll('g.complexCombination').data(function (d) {
                    // binding in an array of size one
                    return [d.data.orClauses];
                }
            )
            combinationGroups.enter()
                .append('g')
                .attr({class: 'complexCombination'
                })
            combinationGroups.exit().remove();


            combinationGroups.selectAll("text").data(function(d){return [d]}).enter().append("text")
                .attr({
                    class: function () {
                        if (ctx.cellDistance < 14) return 'groupLabel small'; else return 'groupLabel'
                    },
                    x:(usedSets.length*ctx.cellWidth *.5),
                    y: ctx.cellWidth-3
                })
                .style({
                    cursor:"pointer",
                    "text-anchor":"middle"
                })
                .text(function(d){return "combination";})
                .on({
                    "mouseover":function(d){
                        var xy = d3.select(this.parentNode.parentNode).attr("transform").split(/[,()]/);
                   //     console.log(d3.select(this.parentNode.parentNode).attr("transform"),d);
//                        console.log(xy.split(/[,()]/));
                        if (xy.length==4){
                            var infoGroup = ctx.toolTipLayer.append("g").attr({
                                class:"toolTipQuery",
                                "transform":"translate("+
                                    (+xy[1]+ctx.leftOffset-5)+","+
                                    (+xy[2]+ctx.cellSize+5)+")"})
                            infoGroup.style({
                                "opacity":.00001
                            }).transition().style({
                                "opacity":1
                            });

//                            b.append("circle").attr({
//                                cx:5,
//                                cy:5,
//                                r:3
//                            })

//                            console.log(b);

//                            var infoGroup = ctx.toolTipLayer.select("#toolTipQuery");
                            infoGroup.append("rect").attr({
//                                class:"groupBackGround",
                                width:(usedSets.length*ctx.cellWidth+10),
                                height: d.length*ctx.cellSize+10,
                                rx:10,
                                ry:10
                            }).style({
                                    "stroke-width":2,
                                    "stroke":ctx.grays[1],
                                    "fill":ctx.grays[0]
                                })



                       //     console.log(infoGroup);

                            d.forEach(function(row,index){
                                var y = index*ctx.cellSize;

                                var actualRow = infoGroup.append("g").attr({
                                    class:"combination",
                                    "transform":"translate("+0+","+y+")"
                                })

                                actualRow.selectAll('.cell').data(function (d) { return Object.keys(row).map(function(key){return row[key];})})
                                .enter()
                                    .append('circle')
                                    .attr('cx', function (d, i) {
                                        return (ctx.cellWidth) * i + ctx.cellWidth / 2+5;
                                    })
                                    .attr({
                                        r: ctx.cellSize / 2 - 3,
                                        cy: ctx.cellSize / 2+5,
                                        class: 'cell'
                                    })
                                    .style('fill', function (d) {

                                        switch(d.state)
                                        {case 0: //logicState.NOT
                                            return ctx.grays[0]
                                            break;
                                            case 1: //logicState.MUST
                                                return ctx.grays[1]
                                                break;
                                            default: // logicState.DONTCARE
                                                return "url(#DontCarePattern)"}
                                    }
                                )
                                    .style({
                                        "stroke":function(d){if (d.value ==0) return ctx.grays[1]; else return "none"}//ctx.grays[1]
                                    })


                            })



                        }


                    },
                    "mouseout":function(){
                        ctx.toolTipLayer.selectAll(".toolTipQuery").transition().attr({opacity:.0001}).remove();
                    }

                })
            ;

//            var cells = combinationGroups.selectAll('.cell').data(function (d) {
//
//                return d.map(function (dd, i) {
//                    return {data: usedSets[i], value: dd}
//                });
//            })
//            // ** init
//            cells.enter()
//                .append('circle')
//                .on({
//                    'mouseover': function (d, i) {
//                        mouseoverCell(d3.select(this).node().parentNode.parentNode.__data__, i)
//                    },
//                    'mouseout': mouseoutCell
//                })
//            cells.exit().remove()
//
//            //** update
//            cells.attr('cx', function (d, i) {
//                return (ctx.cellWidth) * i + ctx.cellWidth / 2;
//            })
//                .attr({
//                    r: ctx.cellSize / 2 - 3,
//                    cy: ctx.cellSize / 2,
//                    class: 'cell'
//                })
//                .style('fill', function (d) {
//                    switch(d.value)
//                    {case 0: //logicState.NOT
//                        return ctx.grays[0]
//                        break;
//                        case 1: //logicState.MUST
//                            return ctx.grays[1]
//                            break;
//                        default: // logicState.DONTCARE
//                            return "url(#DontCarePattern)"}
//                }
//            )
//                .style({
//                    "stroke":function(d){if (d.value ==0) return ctx.grays[1]; else return "none"}//ctx.grays[1]
//                })

        }

        decorateComplexQueries();



//        var circles = tableRows.selectAll("circle").data(function(d){return d.selectors})
//        circles.enter()
//            .append("circle").attr({
//                class:"logicPanelCircle",
//                cx:function(d,i){return (i+.5)*cellWidth}, // TODO: add 90 as params!!
//                cy: .5*cellSize,
////                if (animated) return 0.5*cellSize;
////                else return (i+1.5)*cellSize +5},
//                r: cellSize/2-2
//            })
//
//        circles.style({
//            fill:function(d){
//                switch(d.state)
//                {
//                    case logicState.NOT:
//                        return grays[0]
//                        break;
//                    case logicState.MUST:
//                        return grays[1]
//                        break;
//                    default: // logicState.DONTCARE
//                        return "url(#DontCarePattern)"
//                }},
//            stroke:function(d){
//                if (d.isSelected()) return logicColor;
//                else return null;
//            }
//
//        })



  
        // --- Horizon Bars for size.

        groupRows.each(function (e, j) {

            var g = d3.select(this);
            var max_scale = ctx.subSetSizeScale.domain()[1];

            var i = 0, is_overflowing = false;
            var nbLevels = 1;//Math.min(ctx.maxLevels, Math.ceil(e.data.setSize / max_scale));

            var data = d3.range(nbLevels).map(function () {

                var f = {};
                f.data = {};
                f.data.type = e.data.type;

                // Prevent empty bar when right on 1-level value
                if(nbLevels==1 && e.data.setSize > 0 && (e.data.setSize % max_scale == 0)) {
                  f.data.setSize = e.data.setSize;
                  return f;
                }

                if (i == nbLevels - 1 && Math.ceil(e.data.setSize / max_scale) < nbLevels + 1)
                    f.data.setSize = (e.data.setSize % max_scale);
                else
                    f.data.setSize = max_scale;
                i++;
                return f;
            })

            g.selectAll(".cutlines").remove();

            if (Math.ceil(e.data.setSize / max_scale) > ctx.maxLevels) {
                var g_lines = g.selectAll(".cutlines").data([e.id]).enter().append("g").attr("class", "cutlines")

                g_lines.append("line")
                    .attr({x1: ctx.xStartSetSizes + ctx.subSetSizeWidth-30, x2: ctx.xStartSetSizes + ctx.subSetSizeWidth-20, y1: 0, y2: 30})
                    .style({'stroke': 'white', 'stroke-width': 1})

                g_lines.append("line")
                    .attr({x1: ctx.xStartSetSizes + ctx.subSetSizeWidth-35, x2: ctx.xStartSetSizes + ctx.subSetSizeWidth-25, y1: 0, y2: 30})
                    .style({'stroke': 'white', 'stroke-width': 1})
            }

            // Add new layers
            var layers_enter = g.select(".gHorizon").selectAll(".row-type-group").data(data).enter()

            layers_enter.append('rect')
                .attr("class", function (d) {
                    return ( 'subSetSize row-type-group' );

                })

            // Remove useless layers
            g.selectAll(".row-type-group").data(data).exit().remove()

            // Update current layers
            g.selectAll(".row-type-group")
                .attr({
                    transform: function (d, i) {
  
                        return   'translate(' + (ctx.xStartSetSizes) + ', ' + (ctx.cellSizeShrink * i+2) + ')'; // ' + (textHeight - 5) + ')'

                    },

                    width: function (d, i) {
                        return ctx.subSetSizeScale(d.data.setSize);
                    },
                    height: function (d, i) {

                        return ctx.cellSize-4 - ctx.cellSizeShrink * 2 * i;

                    }
                })       .style({
                    fill:function(d,i){ return ctx.horizonBarGrays(i);}
                })
//                .style("opacity",function (d, i) {
//                    if (nbLevels == 1)
//                        return 1;
//                    else if (nbLevels == 2)
//                        return .8 + i * .2;
//                    else
//                        return .4 + i * .4;
//                })
            .on('click', function (d) {
                    //console.log("from else where");
                    //var selection = Selection.fromSubset(d3.select(this).node().parentNode.__data__.data.subSets);
                    //selections.addSelection(selection, true);
                    //selections.setActive(selection);
                })

        })

    }

    function updateRelevanceBars(allRows) {
        var expectedValueBars = allRows.selectAll(".disproportionality").data(function (d) {
            return [d]
        })

        expectedValueBars.enter()
            .append('rect')
            .attr({
                transform: function (d) {
                    var start = ctx.expectedValueScale(d3.min([0, d.data.disproportionality]));
                    start += ctx.xStartExpectedValues;
                    var y = 2;
                    if (d.data.type === ROW_TYPE.SUBSET)
                        y = 1;//cellSize / 3 * 1.7;
                    return 'translate(' + start + ', ' + y + ')';
                },
                width: 1,
                height: function (d) {
                    if (d.data.type === ROW_TYPE.SUBSET)
                        return ctx.cellSize - 2;
                    else
                        return ctx.cellSize-4;// / 3;
                }
            })
            //.on('mouseover', mouseoverRow)
            //.on('mouseout', mouseoutRow)

        expectedValueBars.exit().remove()

        // transition for subsets
        changeTheValues(expectedValueBars.filter(function (d) {
            return (d.data.type === ROW_TYPE.SUBSET)
        }).transition())

        // no transition for groups
        changeTheValues(expectedValueBars.filter(function (d) {
            return (d.data.type !== ROW_TYPE.SUBSET)
        }))
//        expectedValueBars.transition()

        function changeTheValues(node) {
            node.attr({
                class: function (d) {
                    return d.data.disproportionality < 0 ? 'disproportionality negative' : 'disproportionality positive';
                },
                transform: function (d) {
                    if (isNaN(d.data.disproportionality)) {
                        return 'translate(' + 0 + ', ' + 0 + ')';
                    }
                    var start = ctx.expectedValueScale(d3.min([0, d.data.disproportionality]));
                    start += ctx.xStartExpectedValues;
                    var y = 2;
                    if (d.data.type == ROW_TYPE.SUBSET)
                        y = 1;//cellSize / 3 * 1.7;
                    return 'translate(' + start + ', ' + y + ')';
                },
                width: function (d) {
                    if (isNaN(d.data.disproportionality)) {
                        return 0;
                    }
                    //  console.log(d.data.disproportionality)
                    return Math.abs(ctx.expectedValueScale(d.data.disproportionality) - ctx.expectedValueScale(0));
                },
                height: function (d) {
                    if (d.data.type === ROW_TYPE.SUBSET)
                        return ctx.cellSize - 2;
                    else
                        return ctx.cellSize-4;// / 3;
                }
            })
        }
    }

    function updateAttributeStatistic(allRows){
        allRows.each(function(row,j){
            if (row.data.type == ROW_TYPE.SEPARATOR) return;

            var rowElement = d3.select(this);

            var detailStatisticElements = rowElement.selectAll(".detailStatistic").data(ctx.summaryStatisticVis,function(d,i){return d.attribute+i});
            detailStatisticElements.exit().remove();
            detailStatisticElements.enter().append("g").attr({
                class:function(d){return "detailStatistic"}
            })

            detailStatisticElements.each(function(d,i){

                d.visObject.renderBoxPlot(row.id,d3.select(this),ctx.xStartStatisticColumns+i*(ctx.summaryStatisticsWidth+ctx.majorPadding),2,null,ctx.cellSize-4,"detail"+i); //  function(id, g, x,y,w,h)

            })
        })
    }


    function updateOverlays(allRows) {
        if (selections.getSize() == 0) {
            //console.log("remove all");
            allRows.selectAll(".what").remove();
            allRows.selectAll(".newOverlay").remove();
            allRows.selectAll('.selectionIndicators').remove();
            return;
        }

        var currentRowSize = 0

        allRows.selectAll(".what").remove();
        allRows.selectAll(".newOverlay").remove();
        allRows.selectAll('.selectionIndicators').remove();

        allRows.each(function (e, j) {
          
            var g = d3.select(this);
            var max_scale = ctx.subSetSizeScale.domain()[1];


          if(e.data.type==ROW_TYPE.GROUP) {

            e.data.selections = {};
            e.data.selections.setSize = e.data.setSize;
            currentRowSize = e.data.setSize;

            e.data.subSets.map(function(s, k) {

              if(typeof(e.data.selections) == "undefined")
                e.data.selections = {};

                for (var p in s.selections) {
                  if(typeof(e.data.selections[p]) == "undefined")
                    e.data.selections[p] = [];

                  e.data.selections[p] = e.data.selections[p].concat(s.selections[p]);
                
              }
            });

          }
            // FIND UUID
             var usedID = false;
            //   var alternativeID;
            var sIDs = Object.getOwnPropertyNames(e.data.selections);
            var s = e.data.selections;
            sIDs.forEach(function (prop) {
                var length = s[prop].length;
                if (selections.isActiveByUuid(prop)) {
                    usedID = prop;
                }
            });
            if (!usedID) {
                return 0;
            }

            currentRowSize =  s[usedID].length;
            if(e.data.type==ROW_TYPE.GROUP) 
              e.data.selections.setSize =currentRowSize;


            var i = 0, is_overflowing = false;
            var nbLevels = 1;//Math.min(ctx.maxLevels, Math.ceil(currentRowSize / max_scale));
            var data = d3.range(nbLevels).map(function () {
                var f = {};
                f.data = {};
                f.data.setSize = currentRowSize
                f.data.type = e.data.type;
               // Prevent empty bar when right on 1-level value
                if(nbLevels==1 && currentRowSize > 0 && (currentRowSize % max_scale == 0)) {
                  f.data.setSize = currentRowSize;
                  return f;
                }

                if (i == nbLevels - 1 && Math.ceil(currentRowSize / max_scale) < nbLevels + 1)
                    f.data.setSize = (currentRowSize % max_scale);
                else
                    f.data.setSize = max_scale;
                i++;

                return f;
            })

            //console.log(data);

            // Add new layers
            var layers_enter = g.selectAll(".gOverlays").selectAll(".newOverlay").data(data).enter()

            layers_enter.append('rect')
                .attr("class", "newOverlay")

            // Remove useless layers
            g.selectAll(".newOverlay").data(data).exit().remove()

            // Update current layers
            //console.log("update overlay");
            g.selectAll(".newOverlay")
                .attr({
                    transform: function (d, i) {
                     //   var y = 0;
                     //   if (d.data.type !== ROW_TYPE.SUBSET)
                     //       y = 0;//cellSize / 3 * .4;
                        return   'translate(' + (ctx.xStartSetSizes) + ', ' + (ctx.cellSizeShrink * i + 1) + ')'; // ' + (textHeight - 5) + ')'
                    },

                    width: function (d, i) {

                     return ctx.subSetSizeScale(d.data.setSize);
                    
                  },
                    height: function (d, i) {
                        return ctx.cellSize - ctx.cellSizeShrink * 2 * i - 2;
                    },
                   fill: function(d) {
                     var usedID = false;
                    //   var alternativeID;
                    var sIDs = Object.getOwnPropertyNames(e.data.selections);
                    var s = e.data.selections;
                    sIDs.forEach(function (prop) {
                        var length = s[prop].length;
                        if (selections.isActiveByUuid(prop)) {
                            usedID = prop;
                        }
                    });
                    if (!usedID) {
                        return 0;
                    }

                    return selections.getColorFromUuid(usedID)//"url(#diagonalHatch_0)"      
                   }           
                                       
                })
                .style("opacity", function (d, i) {

                    if (nbLevels == 1)
                        return 1;
                    else if (nbLevels == 2)
                        return .5 + i * .2;
                    else
                        return .2 + i * .3;
                })

        })


/*
        var selectionOverlay = allRows.selectAll(".what").data(function (d) {
            return [d]
        })
        selectionOverlay.enter().append('rect')
            .on('click', function (d) {
                if (d.data.type === ROW_TYPE.SUBSET) {
                    var selection = Selection.fromSubset(d.data);
                    selections.addSelection(selection, true);
                    selections.setActive(selection);
                }
            })
            .on('mouseover', mouseoverRow)
            .on('mouseout', mouseoutRow)
            .attr("class", "what");

        selectionOverlay
            .attr({
                transform: function (d) {
                    var y = 0;
                    if (d.data.type == ROW_TYPE.SUBSET)
                        y = 1; //cellSize / 3 * .4;
                    return   'translate(' + ctx.xStartSetSizes + ', ' + y + ')'; // ' + (textHeight - 5) + ')'
                },

                width: function (d) {
                    var s = d.data.selections;
                    if (typeof s !== 'object') {
                        return 0;
                    }

                    var usedID = false;
                    //   var alternativeID;
                    var sIDs = Object.getOwnPropertyNames(s);
                    sIDs.forEach(function (prop) {
                        var length = s[prop].length;
                        if (selections.isActiveByUuid(prop)) {
                            usedID = prop;
                        }
                    });
                    if (!usedID) {
                        return 0;
                    }
                   // d3.select(this).style("fill", selections.getColorFromUuid(usedID));
                    return   ctx.subSetSizeScale(s[usedID].length);
                },
                height: function (d) {
                    return ctx.cellSize - 2// / 3;

                }
            })
*/
        // the triangles for the multiple selections

        //allRows.data(["indicators"]).enter().append("g").attr("class", "gIndicators")


        //var selectIndicators = allRows.select('.gIndicators').selectAll('.selectionIndicators').data(function (d, i) {
        //    if (!d.data.selections)
        //        return [];
        //    console.log(d.data);
        //    var selectionIDs = Object.getOwnPropertyNames(d.data.selections);
        //    var selArray = selectionIDs.map(function (k) {
        //        return {uuid: k, items: d.data.selections[k]};
        //    });
        //    selArray = selArray.filter(function (d) {
        //        return d.items.length !== 0 && d.uuid != "undefined" && d.uuid != "setSize"; // prevents useless black indicators.. + Bug
        //    })
        //    var max_scale = ctx.subSetSizeScale.domain()[1];
        //    return selArray;
        //})
        //selectIndicators.enter()
        //    .append('path').attr({
        //        class: 'selectionIndicators'
        //    }).on('click', function (d) {
        //        //clearSelections();
        //        ////console.log(selections);
        //        //selections.setActiveByUuid(d.uuid);
        //        //updateOverlays(allRows);
        //    }).on('mouseenter', function() {
        //      d3.select(this).attr("transform", function (d, i) {
        //        //UPDATE
        //        return 'translate(' + d3.transform(d3.select(this).attr("transform")).translate + ') scale(1.5) rotate('+d3.transform(d3.select(this).attr("transform")).rotate+')';
        //      })
        //    }).on('mouseout', function() {
        //      //UPDATE
        //      d3.select(this).attr("transform", function (d, i) {
        //        return 'translate(' + d3.transform(d3.select(this).attr("transform")).translate + ') scale(1) rotate('+d3.transform(d3.select(this).attr("transform")).rotate+')';
        //    })})
        //selectIndicators.exit().remove();
        //selectIndicators.attr({
        //    transform: function (d, i) {
        //
        //      var nbLevels = 1;//Math.floor(d.items.length / ctx.subSetSizeScale.domain()[1]);
        //      var subSetSize = d.items.length % ctx.subSetSizeScale.domain()[1];
        //      var rotate = 0;
        //      if(nbLevels>=ctx.maxLevels) {
        //        subSetSize = ctx.subSetSizeScale.domain()[1]
        //        nbLevels = ctx.maxLevels-1;
        //        rotate = -90;
        //      }
        //        return 'translate(' + (ctx.xStartSetSizes + ctx.subSetSizeScale(subSetSize)) + ' , ' + (nbLevels*ctx.cellSizeShrink) +
        //            ') rotate(' + rotate + ')';
        //    },
        //    d: function (d) {
        //        return  " M -5 0  L  5 0  L 0 6 z M 0 6 L 0 " + ctx.cellSize;
        //    },
        //
        //    stroke: 'white',
        //    "stroke-width": 1,
        //    fill: function (d, i) {
        //        return selections.getColorFromUuid(d.uuid);
        //    }
        //})
    }

    function updateBarLabels(allRows) {
        var barLabels = allRows.selectAll(".intersectionSizeLabel").data(function (d) {
            return[d]
        });
        barLabels.enter().append('text')
            .attr({class: 'intersectionSizeText intersectionSizeLabel noselect'})
            //.on('click', function (d) {
            //    ctx.intersectionClicked(d)
            //});
        barLabels.exit().remove();

        var barLabelChanges = barLabels.text(function (d) {
            return d.data.setSize;
        })
        if (ctx.barTransitions) barLabelChanges.transition()
        barLabelChanges.attr({class: 'intersectionSizeText intersectionSizeLabel noselect',
            y: ctx.cellSize / 2,
            x: function (d) {
                return ctx.xStartSetSizes + ctx.subSetSizeScale(d.data.setSize) + 2;
            }

        });
    }

    function updateColumnBackgrounds() {
        var columnBackgrounds = ctx.columnBackgroundNode.selectAll(".columnBackground").data(usedSets);
        columnBackgrounds.enter().append("rect").attr({
                class: "columnBackground"
            })
                .style({
                "stroke": "none",
                fill: ctx.backHighlightColor,
                opacity: 0
            })
            columnBackgrounds.exit().remove();
            columnBackgrounds.attr({
                'x': function (d, i) {
                    return (ctx.cellWidth) * i;
                },
//            y: ctx.textHeight,
                height: ctx.svgHeight,
                width: ctx.cellWidth
            })
    }

    //chen: render selected sets-combination rows
    function plotSubSets() {

        //ctx.svgBody.attr({
        //    height: ctx.svgHeight//ctx.rowScale.rangeExtent()[1] + ctx.logicPanelNode.
        //})

//        // to limit the foraignobject again
//        updateFrames($(window).height(), null);

        //console.log("plot sets");
        updateColumnBackgrounds();

        var separatorRow = null;
        // generate <g> elements for all rows
        var allRows = updateSubSetGroups().filter(function(r){
            if (r.data.type==ROW_TYPE.SEPARATOR){
                //console.log(r.id);
                separatorRow = d3.select(this);
                return false;
            }
            else
            {
                //console.log(r.id);
                return true;
            }
        })

        var setScale = d3.scale.ordinal().domain([0, 1]).range(ctx.grays);

        var subSetRows = allRows.filter(function (d) {
            return d.data.type === ROW_TYPE.SUBSET;
        })

        // decorate subset rows
        updateSubsetRows(subSetRows, setScale);

        var groupRows = allRows.filter(function (d, i) {
            if (d.data.type === ROW_TYPE.GROUP || d.data.type === ROW_TYPE.AGGREGATE)
                return true;
            return false;
        })

        // decorate GroupRows
        updateGroupRows(groupRows);

        // add BarLabels to all bars
        updateBarLabels(allRows);
        //console.log("call overlay from ");
//
        // Rendering the highlights and ticks for selections on top of the selected subsets
        updateOverlays(allRows);

        // ----------------------- expected value bars -------------------

        //updateRelevanceBars(allRows);

        // ----------------------- all Rows -------------------
        //updateAttributeStatistic(allRows);


//        var separatorColumns = renderRows.filter(function(d){return (d.data instanceof Separator)});
//        separatorColumns.append("")

        if (separatorRow!=null){
            var sepRowLine = separatorRow.selectAll(".gSeparatorLine").data([1])
            sepRowLine.enter().append("line").attr({
                    class:"gSeparatorLine"
                })

            sepRowLine.attr({
                x1:-ctx.leftOffset,
                x2:ctx.w,
                y1:ctx.cellSize/2,
                y2:ctx.cellSize/2
            })

        }

        //highlight newly added col
        d3.selectAll(".setSizeBackground").each(function(d,i){
                if(d.elementName == ctx.newlyAddedSet){
                    //mouseoutColumn();
                    mouseoverColumn(d,i);
                    //setTimeout(mouseoutColumn, 3000);
                    ctx.newlyAddedSet = "";
                }
            })

        // Adjust the row height
        d3.select(".divForeign").select("svg").attr("height", renderRows.length * ctx.cellDistance);
    }

    //chen: item selection is related to the right part 'query results'
    function bindEvents() {
        $(EventManager).bind("item-selection-added", function (event, data) {
            //console.log("Selection was added to selection list with color " + selections.getColor(data.selection) + ' and ' + data.selection.items.length + ' items.');

            data.selection.mapToSubsets(subSets);

            plotSelectionTabs("#selection-tabs", selections, data.selection);
            //console.log("uuuuuuuuuuuu");
            //console.log(selections);
            //console.log(data.selection);
            plotSelectedItems("#item-table", data.selection);
            //console.log(data);
            elementViewers.renderViewer();
        });

        $(EventManager).bind("item-selection-updated", function (event, data) {
            //console.log('Selection was updated! New length is ' + data.selection.items.length + ' items.');

            data.selection.mapToSubsets(subSets);
            plot();
            plotSelectionTabs("#selection-tabs", selections, data.selection);
            plotSelectedItems("#item-table", data.selection);
            elementViewers.renderViewer();

            plotSetOverview();
            //console.log("item update");
        });
        //
        //$(EventManager).bind("item-selection-removed", function (event, data) {
        //    //console.log("Selection was removed from selection list.");
        //    data.selection.unmapFromSubsets(subSets);
        //
        //    if ( selections.list.length === 0 ) {
        //        $( '#filters-list' ).html("");
        //        $( '#filters-controls' ).html("");
        //    }
        //
        //    plot();
        //    plotSelectionTabs("#selection-tabs", selections, selections.getActive());
        //    plotSelectedItems("#item-table", selections.getActive());
        //    elementViewers.renderViewer();
        //    plotSetOverview();
        //});

        $(EventManager).bind("item-selection-activated", function (event, data) {
            if (data.selection) {
                //console.log('Selection ' + data.selection.id + ' was activated.');

                plot();
                plotSelectionTabs("#selection-tabs", selections, data.selection);
                data.selection.filterCollection.renderFilters();
                plotSelectedItems("#item-table", data.selection);
                plotSetOverview();
            }
            else {
                plot();
                plotSelectionTabs("#selection-tabs", selections, data.selection);
                plotSelectedItems("#item-table", data.selection);
                //plotSetOverview();
                //console.log("item activate");
            }
            elementViewers.renderViewer();
        });

//        $(EventManager).bind("ui-resize", function (event, data) {
//            ctx.resizeSetView(data.newHeight, null)
////            plot(Math.floor(data.newWidth * .66), Math.floor(data.newHeight));
//            plotSetOverview();
//        });

//        $(EventManager).bind("ui-vertical-resize", function (event, data) {
//
//            ctx.resizeSetView(data.newHeight, null)
////            plot(undefined, Math.floor(data.newHeight));
//            plotSetOverview();
//        });

//        $(EventManager).bind("ui-horizontal-resize", function (event, data) {
//            plot(Math.floor(data.newWidth * .66), undefined);
//            plotSetOverview();
//        });

        $(EventManager).bind("loading-dataset-started", function (event, data) {
            $(".ui-fader").show();
            $("#data-loading-indicator").show();
        });

        $(EventManager).bind("loading-dataset-finished", function (event, data) {
            $(".ui-fader").fadeOut(1000);
            $("#data-loading-indicator").fadeOut(1000);

            elementViewers.renderController();
            elementViewers.renderViewer();
        });

        $(EventManager).bind("set-added", function (event, data) {
            //console.log(data.set);
            ctx.newlyAddedSet = data.set.elementName;
            //console.log(ctx.newlyAddedSet);
            //if (usedSets.length === 2 || usedSets.length === 3) {
            //    $("#venn-diagram-viewer").fadeIn(500);
            //    venn.plot(undefined, usedSets.length);
            //}
            //
            //if (usedSets.length !== 2 && usedSets.length !== 3) {
            //    $("#venn-diagram-viewer").fadeOut(500);
            //}
        });

        $(EventManager).bind("set-removed", function (event, data) {
            //if (usedSets.length === 2 || usedSets.length === 3) {
            //    $("#venn-diagram-viewer").fadeIn(500);
            //    venn.plot(undefined, usedSets.length);
            //}
            //
            //if (usedSets.length !== 2 && usedSets.length !== 3) {
            //    $("#venn-diagram-viewer").fadeOut(500);
            //}
        });

        $(EventManager).bind("refresh", function(event, data){
            //data: track mbid
            var mbid = attributes[0].values[data];
            for(i = 0; i < dataForVis.UserAndBookmarks.length; i++)
            {
                if(dataForVis.UserAndBookmarks[i]['bookmarks'].indexOf(mbid) > -1)
                {
                    //add common bookmarks count
                    var tempID = dataForVis.UserAndBookmarks[i]['setID'];
                    var parts = setIdToSet[tempID].elementName.split(/\(|\)|\//g);
                    parts[1] = (++dataForVis.commonCount[dataForVis.UserAndBookmarks[i]['userName']]);
                    var newName = " " + parts[0].trim() + " (" + parts[1] + "/" + parts[2] + ")";
                    //update checkbox label, matrix header and bar
                    $('label[for="input' + tempID +'"]').text(newName);
                    if($('text[id="' + tempID + '"]').length != 0) {
                        d3.select('#' + tempID).text(newName)
                            .append("svg:title")
                            .text(function (d, i) {
                                if(d.id == globalSetId)
                                    return "Tracks loved by you.";

                                switch (d.cluster){
                                    case 1:
                                        if(parseInt(parts[2].trim()) > 1)
                                            return parts[2].trim() + " tracks loved by " + parts[0].trim() + ".";
                                        else
                                            return parts[2].trim() + " track loved by " + parts[0].trim() + ".";
                                }
                                return "";
                            })
                    }
                    setIdToSet[tempID].elementName = newName;
                }
            }

            var names = setIdToSet[globalSetId].elementName.split(/\(|\)|\//g);
            var newStr = " " + names[0] + "(" + (parseInt(names[1], 10)) + "/" + (parseInt(names[2], 10)+ 1) + ")";

            //$('text[id="' + setIdToSet[globalSetId].elementName + '"]').text(newStr)
            //    .attr("id", newStr);
            d3.select('#' + globalSetId).text(newStr).append("svg:title")
                .text("Tracks loved by you.")
                //.attr("id", newStr);
            setIdToSet[globalSetId].itemList[data] = 1;
            setIdToSet[globalSetId].elementName = newStr;
            setIdToSet[globalSetId].items.push(data);
            setIdToSet[globalSetId].setSize++;
            //console.log(data);

            //refresh upset
            $('label[for="input' + globalSetId +'"]').text(newStr);
            sortBox();
            //refresh the whole checkbox

            //var ids = globalSetId.split("_");
            //console.log(attributes[attributes.length - 1].values[data]);
            attributes[attributes.length - 1].values[data].push(globalSetId);

            subSets.length = 0;
            dataRows.length = 0;
            setUpSubSets();
            previousState = undefined;
            //UpSetState.logicGroupChanged = true;
            updateState();
            plotSetOverview();

            initCallback.forEach(function (callback) {
                callback();
            })
        })
        $(EventManager).bind("vis-svg-resize", function (event, data) {
            //vis-svg-resize", { newWidth:+(leftWidth + (endX - startX)) });
            updateFrames(null, data.newWidth);
            updateHeaders()
            plotSubSets()
            plotSetOverview()

        });
    }

    function sortBox() {
        var lis = $('ul#1>li');

        lis.sort(function(a, b) {
            var aNames = $('label', a).text().split(/\(|\)|\//g);
            //get the same set of elements again in their current state,
            //so we can figure out where to put this one
            var bNames = $('label', b).text().split(/\(|\)|\//g);
            if(parseInt(aNames[1]) > parseInt(bNames[1])) {
                return -1;
            }
            else if(aNames[1] == bNames[1] && parseInt(aNames[2]) > parseInt(bNames[2])){
                return -1;
            }
            return 1;
        });
        $('ul#1').empty().html(lis);

    }

    /** Passing true will disable the group */
    function toggleGroupingL2(disable) {
        var noGroupingL2 = $('#noGroupingL2');

        if (disable) {
            noGroupingL2.prop('checked', true);
        }
        noGroupingL2.prop('disabled', disable);

        $('#groupByIntersectionSizeL2').prop('disabled', disable);
        $('#groupBySetL2').prop('disabled', disable);
        $('#groupByRelevanceMeasureL2').prop('disabled', disable);
        $('#groupByOverlapDegreeL2').prop('disabled', disable);
    }

    function disableL2Equivalent(id) {
        var l2 = $(id);
        if (l2.prop('checked')) {
            $('#noGroupingL2').prop('checked', true);
        }
        l2.prop('disabled', true);
    }

    function updateL2Grouping(){

        if (UpSetState.grouping==undefined){
            d3.select("#secondLevelGroupingSelect").attr({disabled:true})
        }else{
            d3.select("#secondLevelGroupingSelect").attr({disabled:null})
            var selectableOptions = {};
            Object.keys(ctx.groupingOptions).forEach(function(key){
                if (key!=UpSetState.grouping) selectableOptions[key] = ctx.groupingOptions[key];
            })

         //   console.log("updateL2:",selectableOptions);

    //        UpSetState.grouping = StateOpt.groupByRelevanceMeasure;
    //        UpSetState.levelTwoGrouping = undefined;

            //var l2GroupingSelect = d3.select("#secondLevelGrouping").selectAll("select").data([selectableOptions]);
            //l2GroupingSelect.exit().remove();
            //l2GroupingSelect.enter().append("select").attr({
            //    id: "secondLevelGroupingSelect",
            //    class:"groupingSelect"
            //}).on({
            //        "change": function () {
            //            var value = this.options[this.selectedIndex].value;
            //            ctx.groupingOptions[value].l2action();
            //            //updateCardinalitySpinners();
            //            updateState();
            //            updateStatistics();
            //            rowTransition();
            //        }
            //    });

            // has to be deleted to keep order in list :((
            d3.select("#secondLevelGroupingSelect").selectAll("option").remove();
            var l2GroupingOptions = d3.select("#secondLevelGroupingSelect").selectAll("option")
                .data(
                    function (d) { return Object.keys(d).map(function (key) { return {key: key, data: d[key]} }) },
                    function(d){ return d.key})
                .enter().append("option").attr({
                    value:function(d){return d.key;},
                    selected:function(d){return (d.key==UpSetState.levelTwoGrouping || (d.key=="dont" && UpSetState.levelTwoGrouping==undefined))?"selected":null}
                }).text(function(d){return d.data.name});

        }
    }

    function updateCardinalitySpinners(){
        //  <div id='firstLevelMinCardinality' hidden>min: <input id='firstLevelMinCardinalityInput' type='number' min='0' max='12' value='0'>
        d3.select("#firstLevelMinCardinality").attr({
            hidden:((UpSetState.grouping == StateOpt.groupByOverlapDegree)?null:"true")
        }).select("input").attr({
                value:UpSetState.levelOneDegree,
                min: 1,
                max: usedSets.length
            }).on({
                "change":function(d){
                    UpSetState.levelOneDegree = +(d3.select(this).node().value);
                    UpSetState.forceUpdate=true;
                    updateState();
                    updateStatistics();
                    rowTransition();
                }
            })

        //<div id='secondLevelMinCardinality' hidden>min: <input id='secondLevelMinCardinalityInput' type='number' min='0' max='12' value='0'>
        //d3.select("#secondLevelMinCardinality").attr({
        //    hidden:((UpSetState.levelTwoGrouping== StateOpt.groupByOverlapDegree)?null:"true")
        //}).select("input").attr({
        //        value:UpSetState.levelTwoDegree,
        //        min: 1,
        //        max: usedSets.length
        //    }).on({
        //        "change":function(d){
        //            UpSetState.levelTwoDegree = +(d3.select(this).node().value);
        //            UpSetState.forceUpdate=true;
        //            updateState();
        //            updateStatistics();
        //            rowTransition();
        //        }
        //
        //
        //    })

    }


    function setUpSortSelections() {

       // // groupingDefinitions
       // ctx.groupingOptions[StateOpt.groupByIntersectionSize] = { name: "Degree", l1action:function(){},l2action:function(){} };
       // ctx.groupingOptions[StateOpt.groupBySet]={ name: "Sets", l1action:function(){},l2action:function(){} };
       // //ctx.groupingOptions[StateOpt.groupByRelevanceMeasure] ={ name: "Deviation", l1action:function(){}, l2action:function(){} };
       // ctx.groupingOptions[StateOpt.groupByOverlapDegree] = { name: "Overlaps", l1action:function(){}, l2action:function(){} };
       // ctx.groupingOptions["dont"] ={ name: "Don't Aggregate", l1action:function(){}, l2action:function(){} };
       //
       //
       //// ---- define L1 actions
       //
       //ctx.groupingOptions[StateOpt.groupByIntersectionSize]
       //    .l1action = function(){
       //        UpSetState.grouping = StateOpt.groupByIntersectionSize;
       //        UpSetState.levelTwoGrouping = undefined;
       //    }
       //
       //ctx.groupingOptions[StateOpt.groupBySet]
       //    .l1action= function () {
       //        UpSetState.grouping = StateOpt.groupBySet;
       //        UpSetState.levelTwoGrouping = undefined;
       //    };
       //
       //
       // //ctx.groupingOptions[StateOpt.groupByRelevanceMeasure]
       // //    .l1action=function () {
       // //        UpSetState.grouping = StateOpt.groupByRelevanceMeasure;
       // //        UpSetState.levelTwoGrouping = undefined;
       // //    };
       //
       // ctx.groupingOptions[StateOpt.groupByOverlapDegree]
       //     .l1action=function () {
       //         UpSetState.grouping = StateOpt.groupByOverlapDegree;
       //         UpSetState.levelTwoGrouping = undefined;
       //     };
       //
       // ctx.groupingOptions["dont"]
       //     .l1action=function () {
       //         UpSetState.grouping = undefined;
       //         UpSetState.levelTwoGrouping = undefined;
       //         UpSetState.forceUpdate = true;
       //     };
       //
       //
       //// --- define L2 actions
       //
       //
       // // ---------------- Grouping L2 -----------
       //
       // ctx.groupingOptions[StateOpt.groupByIntersectionSize]
       //     .l2action=function () {
       //         UpSetState.levelTwoGrouping = StateOpt.groupByIntersectionSize;
       //     };
       //
       // ctx.groupingOptions[StateOpt.groupBySet]
       //     .l2action=function () {
       //         UpSetState.levelTwoGrouping = StateOpt.groupBySet;
       //     };
       //
       // ctx.groupingOptions[StateOpt.groupByOverlapDegree]
       //     .l2action=function () {
       //         UpSetState.levelTwoGrouping = StateOpt.groupByOverlapDegree;
       //     };
       //
       // //ctx.groupingOptions[StateOpt.groupByRelevanceMeasure]
       // //    .l2action=function () {
       // //        UpSetState.levelTwoGrouping = StateOpt.groupByRelevanceMeasure;
       // //    };
       //
       // ctx.groupingOptions["dont"]
       //     .l2action=function () {
       //         UpSetState.levelTwoGrouping = undefined;
       //     };
       //


        // ----------- grouping L1 -------------------------

        //var l1GroupingSelect = d3.select("#firstLevelGrouping").selectAll("select").data([ctx.groupingOptions]);
        //l1GroupingSelect.exit().remove(); // will not be called
        //l1GroupingSelect.enter().append("select").attr({
        //    id: "firstLevelGroupingSelect",
        //    class:"groupingSelect"
        //}).on({
        //        "change": function () {
        //            var value = this.options[this.selectedIndex].value;
        //            ctx.groupingOptions[value].l1action();
        //            //updateL2Grouping();
        //            //updateCardinalitySpinners();
        //            updateState();
        //            updateStatistics();
        //            rowTransition();
        //
        //        }
        //    });

        //var l1GroupingOptions = l1GroupingSelect.selectAll("option")
        //    .data(function (d) {return Object.keys(d).map(function (key) { return {key: key, data: d[key]} }) });
        //l1GroupingOptions.exit().remove();
        //l1GroupingOptions.enter().append("option").attr({
        //    value:function(d){return d.key;}
        //}).text(function(d){return d.data.name});

        // ----------- grouping L2 as update as it depends on L1 -------------------------
        //updateL2Grouping();
        //updateCardinalitySpinners();





        // ------- options ----

        //d3.selectAll('#collapseAll').on(
        //    'click',
        //    function (d) {
        //        UpSetState.collapseAll = true;
        //        UpSetState.collapseChanged = true;
        //        updateState();
        //        updateStatistics();
        //        rowTransition();
        //    });
        //
        //d3.selectAll('#expandAll').on(
        //    'click',
        //    function (d) {
        //        UpSetState.expandAll = true;
        //        UpSetState.collapseChanged = true;
        //        updateState();
        //        updateStatistics();
        //        rowTransition();
        //    });

        // --------- sortings ------

        // sort based on occurrence of one specific data item
        //d3.selectAll('.sortBySet, .setLabel').on(
        //   'click',
        //    function (d) {
        //        UpSetState.sorting = StateOpt.sortBySetItem;
        //        UpSetState.grouping = undefined;
        //        UpSetState.levelTwoGrouping = undefined;
        //        updateState(d);
        //        rowTransition();
        //    });

        d3.selectAll('#sortNrSetsInIntersectionAscend').on(
            'click',
            function (d) {
                console.log("sssssssort");
                ctx.sortCheck = 'sortNrSetsInIntersectionAscend'
                UpSetState.sorting = StateOpt.sortByCombinationSizeAscend;
//                UpSetState.grouping = undefined;
//                UpSetState.levelTwoGrouping = undefined;
                var date = new Date();
                //userBehavior.push({type: 2, sort: [{name: "sort by overlapping sizes Ascending", type: 6}], time: (date.getDate()<10?'0':'') + date.getDate()  + " @ " + (date.getHours()<10?'0':'') + date.getHours()  + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes()  + ":" + (date.getSeconds()<10?'0':'') + date.getSeconds()});
                UpSetState.forceUpdate = true;
                updateState();
                rowTransition();
                document.getElementById("tipbar").innerHTML = "Sort rows by the number of filled circles (ascending)."
            });
        d3.selectAll('#sortNrSetsInIntersectionDescend').on(
            'click',
            function (d) {
                ctx.sortCheck = 'sortNrSetsInIntersectionDescend'
                UpSetState.sorting = StateOpt.sortByCombinationSizeDescend;
//                UpSetState.grouping = undefined;
//                UpSetState.levelTwoGrouping = undefined;
                var date = new Date();
                //userBehavior.push({type: 2, sort: [{name: "sort by overlapping sizes Descending", type: 7}], time: (date.getDate()<10?'0':'') + date.getDate()  + " @ " + (date.getHours()<10?'0':'') + date.getHours()  + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes()  + ":" + (date.getSeconds()<10?'0':'') + date.getSeconds()});
                UpSetState.forceUpdate = true;
                updateState();
                rowTransition();
                document.getElementById("tipbar").innerHTML = "Sort rows by the number of filled circles (descending)."
            });

        //d3.selectAll('.sortIntersectionSizeGlobal').on(
        //    'click',
        //    function (d) {
        //        UpSetState.sorting = StateOpt.sortBySubSetSize;
        //        UpSetState.grouping = undefined;
        //        UpSetState.levelTwoGrouping = undefined;
        //        UpSetState.forceUpdate = true;
        //        $('#noGrouping').prop('checked', true);
        //        toggleGroupingL2(true);
        //        $('#sortIntersectionSize').prop('checked', true);
        //
        //        updateState();
        //        rowTransition();
        //    });

        d3.selectAll('#sortIntersectionSize').on(
            'click',
            function (d) {
                ctx.sortCheck = 'sortIntersectionSize'
                UpSetState.sorting = StateOpt.sortBySubSetSize;
                var date = new Date();
                //userBehavior.push({type: 2, sort: [{name: "sort by set sizes Descending", type: 9}], time: (date.getDate()<10?'0':'') + date.getDate()  + " @ " + (date.getHours()<10?'0':'') + date.getHours()  + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes()  + ":" + (date.getSeconds()<10?'0':'') + date.getSeconds()});
                UpSetState.forceUpdate = true;
                updateState();
                rowTransition();
                document.getElementById("tipbar").innerHTML = "Sort rows by their related number of tracks (largest to smallest)."
            });

        d3.selectAll('#sortIntersectionSizeAscend').on(
            'click',
            function (d) {
                ctx.sortCheck = 'sortIntersectionSizeAscend'
                UpSetState.sorting = StateOpt.sortBySubSetSizeAscend;
                var date = new Date();
                //userBehavior.push({type: 2, sort: [{name: "sort by set sizes Ascending", type: 8}], time: (date.getDate()<10?'0':'') + date.getDate()  + " @ " + (date.getHours()<10?'0':'') + date.getHours()  + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes()  + ":" + (date.getSeconds()<10?'0':'') + date.getSeconds()});
                UpSetState.forceUpdate = true;
                updateState();
                rowTransition();
                document.getElementById("tipbar").innerHTML = "Sort rows by their related number of tracks (smallest to largest)."
            });

        // Not preserving the grouping
        //d3.selectAll('.sortRelevanceMeasureGlobal').on(
        //    'click',
        //    function () {
        //        UpSetState.sorting = StateOpt.sortByExpectedValue;
        //        UpSetState.grouping = undefined;
        //        UpSetState.levelTwoGrouping = undefined;
        //        UpSetState.forceUpdate = true;
        //        $('#noGrouping').prop('checked', true);
        //        $('#sortRelevanceMeasure').prop('checked', true);
        //        toggleGroupingL2(true);
        //        updateState();
        //        rowTransition();
        //    });

        // Preserving the grouping
        //d3.selectAll('#sortRelevanceMeasure').on(
        //    'click',
        //    function () {
        //        UpSetState.sorting = StateOpt.sortByExpectedValue;
        //        UpSetState.forceUpdate = true;
        //        updateState();
        //        rowTransition();
        //    });

    }

    //document.getElementById('rowSizeValue').addEventListener('changeDataset', function () {
        //ctx.cellDistance = +(document.getElementById('rowSizeValue').value);
        //rowTransition();
    //});

//    document.getElementById('rowPaddingValue').addEventListener('input', function () {
//        ctx.cellDistance = +(document.getElementById('rowPaddingValue').value);
//        //console.log(ctx.cellSize);
//        rowTransition();
//    });

    var rowTransition = function (animateRows) {
        //console.log("row transition");
        if (animateRows != null) ctx.rowTransitions = animateRows;
        else ctx.rowTransitions = true;
        updateHeaders();
        plotSubSets();
        ctx.rowTransitions = true
    }

    //ctx.updateHeaders = updateHeaders;
    ctx.updateColumnBackgrounds = updateColumnBackgrounds;
    ctx.plot = rowTransition
    ctx.plotTable = function () {
        ctx.barTransitions = false;
        //console.log("plot table");
        plotSubSets();
        ctx.barTransitions = true;
    }

    //ctx.resizeSetView = updateFrames
//    function(windowHeight, windowWidth){
//        updateFrames(windowHeight, windowWidth);
//        rowTransition(false);
//    }

    function updateFrames(windowHeight, windowWidth) {
        //console.log("update frame");
        if (windowWidth == null) {
//            d3.select(".matrixTableContainer")
//                .style({
//                    height: windowHeight+"px"
//                })
//
//            d3.select('#bodyVis')
//                .style({
////                    height: (windowHeight-2*ctx.textHeight-40)+"px" // TODO: HACK
//                    height: (windowHeight-300)+"px" // TODO: HACK
//                })
//
////            ctx.svgBody.attr({
////                height: (windowHeight - 70)
////            })
//            tmc = d3.select(".matrixTableContainer")
//
//            var visHeight = windowHeight - ctx.textHeight - 70;
//
////            ctx.foreignObject.attr({
////                height: visHeight
////            })
//
//            ctx.foreignDiv.style("height", +(visHeight - ctx.textHeight) + "px")
        } else if (windowHeight == null) {
            ctx.svgBody.attr({
                width: (Math.max(ctx.w, 500))
            })
            ctx.svgHeader.attr({
                //width: (Math.max(windowWidth, 500))
            })

            var totalWidthMax = ctx.cellWidth * usedSets.length + ctx.majorPadding //+ ctx.leftOffset
                + ctx.subSetSizeWidthMax + 50;

            ctx.subSetSizeWidth = d3.scale.linear()
                .domain([totalWidthMax, totalWidthMax-(ctx.subSetSizeWidthMax-100)]).range([ctx.subSetSizeWidthMax, 100]).clamp(true)(windowWidth);

            //var totalWidthMax = ctx.cellWidth * usedSets.length + ctx.majorPadding + ctx.leftOffset
            //    + ctx.subSetSizeWidthMax + ctx.expectedValueWidthMax + 50+ctx.summaryStatisticVis.length*(ctx.summaryStatisticsWidth+ctx.majorPadding);
            //
            //ctx.subSetSizeWidth = d3.scale.linear()
            //    .domain([totalWidthMax-(ctx.expectedValueWidthMax-100), totalWidthMax-(ctx.expectedValueWidthMax-100)-(ctx.subSetSizeWidthMax-100)]).range([ctx.subSetSizeWidthMax, 100]).clamp(true)(windowWidth);

            //ctx.expectedValueWidth = d3.scale.linear()
              //  .domain([totalWidthMax, totalWidthMax-(ctx.expectedValueWidthMax-100)]).range([ctx.expectedValueWidthMax, 100]).clamp(true)(windowWidth);

            ctx["brushableScaleSubsetUpdate"](null, {
                width: ctx.subSetSizeWidth
            });
        }
    }

    initData(ctx, [init, bindEvents]);
    setUpSortSelections()
//    init();

}

//UpSet();


