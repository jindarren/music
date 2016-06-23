
function mouseoverColumn(d,i){
    mouseoutColumn();
    var combinedSets = usedSets.map(function(dd,ii){
        return (dd.id== d.id)?1:0
    })
    if(arguments[2])
        mouseoverColumnImpl(combinedSets, true);
    else
        mouseoverColumnImpl(combinedSets);
    //console.log("over column");
}

function mouseoverColumnImpl(combinedSets) {

    d3.selectAll(".connection, .combination rect, .setSize")
    //    .style("opacity", .3)
    .style("stroke", "white")

    d3.selectAll(".connection.diagonal").filter(function (dd, ii) {
        return combinedSets[ii];
//        return dd.id== d.id;
    })
        .style("opacity", 1)
        .style("stroke", "black")


//    d3.selectAll(".combination").selectAll("rect").filter(function (dd, ii) {
//        return combinedSets[ii];
////        return dd.id== d.id;
//    })
//        .style("opacity", 1)
//        .style("stroke", ctx.backHighlightColor)

//    d3.selectAll(".setSize").filter(function (dd, ii) {
//        return combinedSets[ii];
////        return dd.id== d.id;
//    })
//        .style("opacity", 1)
//        .style("stroke", "black")

    d3.selectAll(".setSizeBackground").filter(function (dd, ii) {
        return combinedSets[ii];
//        return dd.id== d.id;
    })
        .style("opacity", 1)
        .style("fill", ctx.backHighlightColor)

    d3.selectAll(".connection.vertical").filter(function (dd, ii) {
        return combinedSets[ii];
//        return dd.id== d.id;
    })
        .style("opacity", 1)
//        .style("stroke", "black")
        .style("fill",ctx.backHighlightColor)


    ctx.columnBackgroundNode.selectAll(".columnBackground").style({
        opacity:function(dd,i){
            var value = combinedSets[i];
            switch (value){
                case 2:
                    return 0; break;
                default:
                    return value;

            }
        }
    })

}

function mouseoutColumn() {
    //console.log("out column");
    d3.selectAll(".connection, .combination rect")
        .style("opacity", 1)
        .style("stroke", "none")

    d3.selectAll((".setSizeBackground")).style({
        "stroke": "none",
        "fill":ctx.grays[0]
    })

    ctx.tableHeaderNode.selectAll(".connection")
        .style("fill", ctx.grays[0])

    ctx.columnBackgroundNode.selectAll(".columnBackground").style({
        opacity:0,
        stroke:"none"
    })

}

var time = Date.now();
var overEvent = {};
var timeOut = Date.now();
function mouseoverRow(d,i){
    mouseoutColumn();
    if (d.data.type === ROW_TYPE.SUBSET || d.data.type === ROW_TYPE.GROUP) {
        time = Date.now();
        var date = new Date();
        var setIdCom = d.data.elementName.split(",");
        var setsCombination = [];
        if (setIdCom.length == 1 && setIdCom[0] == "Query") {
            //console.log(d);
            d.data.elements().forEach(function (ed, i) {
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
            setIdCom.forEach(function (id) {
                if (id == 0)
                    oneSection.push({name: null, type: null});
                else
                    oneSection.push({name: setIdToSet[id].elementName, type: setIdToSet[id].cluster, state: 1});
            });
            setsCombination.push(oneSection);
        }

        overEvent = {
            type: 3,
            setsCombination: setsCombination,
            itemNumber: d.data.items.length,
            group_type: d.type,
            time: (date.getDate() < 10 ? '0' : '') + date.getDate() + " @ " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
        };
        mouseoverRowImpl(d, d.data.combinedSets);
    }

}

function mouseoverRowImpl(d, combinedSets) {

    // plot Venn diagram with highlighting of selected subset
    //if ( d.data.type === 'SUBSET_TYPE') {
    //    if ( usedSets.length === 2 || usedSets.length === 3 ) {
    //        venn.plot( [ d.data ], usedSets.length );
    //    }
    //}
    //
    //if ( d.data.type === 'GROUP_TYPE') {
    //    if ( usedSets.length === 2 || usedSets.length === 3 ) {
    //        venn.plot( d.data.subSets, usedSets.length );
    //    }
    //}

    d3.selectAll(".row .backgroundRect")
        .style({
        //"stroke":function(dd){
        //            if (d.id == dd.id) return "black";
        //            else null;
        //         },
        "fill-opacity":function(dd){
                   if (d.id == dd.id) return .7;
                    else return 0.001;
                }

        })

//    mouseoverColumn(d.data.combinedSets)
    mouseoverColumnImpl(combinedSets)

}

function mouseoutRow(d) {
    //console.log("out row");

    // plot Venn diagram without highlighting
    //venn.plot(null, usedSets.length );
    if (d.data.type === ROW_TYPE.SUBSET || d.data.type === ROW_TYPE.GROUP) {

        timeOut = Date.now();
        //console.log(timeOut - time);
        //console.log(overEvent);
        if (timeOut - time > 2000) {
            console.log("over 2s");
            //userBehavior.push(overEvent);
            $(EventManager).trigger("user-behavior-added");
        }

        d3.selectAll(".row .backgroundRect")
            .style({
                "stroke": null,
                "fill-opacity": 0
            })
        mouseoutColumn();
    }
}

function mouseoverCell(rowData, columnIndex) {

    var combinedSets = rowData.data.combinedSets.map(function(d,i){
        if (i==columnIndex) return 1;
        else return d;
    })
    //console.log("over cell");

    mouseoverRowImpl(rowData, combinedSets)

    var columnBackgrounds = ctx.columnBackgroundNode.selectAll(".columnBackground").style({
        stroke:function(dd,i){if (i==columnIndex) return 1; else return "none"}
    })

    d3.selectAll(".setSize").style({
        stroke:function(dd,i){if (i==columnIndex) return "black"; else return "white"}
    })
//        .style("opacity", 1)
//        .style("fill", ctx.backHighlightColor)
//

    d3.selectAll(".connection.vertical")
        .style("stroke",function(d,i){
            return (i==columnIndex)?"black":"none";
        })



//    columnBackgrounds.filter(function(d,i){return i==columnIndex})
//        .style({
//            opacity:1
//        })

}

function mouseoutCell() {
    //console.log("out cell");
    mouseoutColumn();
    //mouseoutRow(false);
}