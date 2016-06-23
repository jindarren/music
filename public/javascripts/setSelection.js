
numberOfLike    = 0
numberOfRow    = 0
numberOfUserTag = 0
/**
 * Created by romain & hen (hendrik.strobelt.com)
 */
//chen: draw upset
function plotSetOverview() {

    var initialize = false;
    var animate = false;

    if (arguments[0]){
        //console.log(arguments[0]);
        initialize = arguments[0].initialize || false;

        if (initialize){
            ctx.setSelection.mode = "none"
            ctx.setSelection.modeChange = false;
            ctx.setSelection.multiSelIn = d3.set();
            ctx.setSelection.multiSelOut = d3.set();
        }
//        animate = arguments[0].animate || false;
//        mode = arguments[0].mode || "none";
    }

    var majorPadding = 5;
    var minorPadding = 2;
    var cellDistance = ctx.cellDistance;
    var cellSize = ctx.cellDistance;// - minorPadding;
    var setCellDistance = 12;
    var setCellSize = 10;

    var differenceForMultiSel = 5;
    var textHeight = 67;
    var truncateAfter = 7;
    var distanceUsedMenu = 15;
    var paddingForPaginationRight = 115;
    var paddingForPaginationRightExtra = (ctx.setSelection.mode==="none")?0:100;
    const paginationLinespace = 14;

    var headerSVG = d3.select('#headerVis').select('svg');

    // calculate widths
    var svgWidth = headerSVG.attr("width");
    var menuOffset = usedSets.length*cellSize + distanceUsedMenu;
    var maxWidthUnused = svgWidth - menuOffset - paddingForPaginationRight - paddingForPaginationRightExtra-distanceUsedMenu-cellDistance;

    //var unusedSets = sets.filter(function(n) {
    //    return usedSets.indexOf(n) == -1
    //});

    // --- INIT the SVG structure (d3 version)

    var setSelectionGroup = headerSVG.selectAll(".setSelection").data([1]);
    setSelectionGroup.enter().append("g").attr({
        class: "setSelection",
        "transform": "translate(0,"  + (ctx.textHeight + ctx.guildHeaderHeight) + ")"
    })


    // scale for the size of the subSets, also used for the sets
    var setSizeScale = d3.scale.linear().domain([0, d3.max(sets, function (d) {
        return d.setSize;
    })]).nice().range([0, textHeight]);


    function updateUsedSets() {
        // ----------------------------
        ///-- Render the used Sets
        // ----------------------------
        //console.log("update used sets");
        var usedSetsVis = setSelectionGroup.selectAll(".usedSets").data([1]);
        usedSetsVis.enter().append("g").attr("class", "usedSets");

        var usedSetsLabels = usedSetsVis
            .selectAll('.setLabel')
            .data(usedSets, function (d) {
                return d.elementName;
            })
        usedSetsLabels.exit().remove();
        var usedSetsLabelsEnter = usedSetsLabels.enter().append("g").attr("class", "setLabel").attr({
            transform: function (d, i) {
                return 'translate(' + (cellDistance * (i)) + ', 0)'
            },
            opacity: .1
        });

        usedSetsLabelsEnter
            .append('rect')
            .attr({
                class: 'setSizeBackground setSizeRect',
                height: (textHeight + 1),
                width: cellSize,//setRowScale.rangeBand()
                transform: "translate(0, 5)"
            }).append("svg:title")
        // background bar
        var usedSetsRect = usedSetsLabelsEnter
            .append('rect')
            .attr({
                class: 'setSizeRect setSize',
                x: 1,
                width: cellSize - 2,//setRowScale.rangeBand()
                transform: "translate(0, 5)"
            })
            //  .attr("transform", "skewX(45)")

        usedSetsRect.each(function(d,i) {
                if (d.cluster == 1) {

                    d3.select(this.parentNode).append('rect')
                        .attr({
                            class: 'setSizeRect commonSize',
                            x: 1,
                            width: cellSize - 2,//setRowScale.rangeBand()
                            transform: "translate(0, 5)"
                        })
                        .style("fill", "#6fadfd")
                        .attr({
                            id: "rect"+ d.id
                        }).append("svg:title")
                }

                //console.log(d);
                //if(d.id == globalSetId){
                //    d3.select(this).style("fill", "#6fadfd");
                //}
                //else {
                //    d3.select(this).style("fill", "#636363");
                //}
            }).append("svg:title")

           d3.selectAll('.setSizeRect').on('click', function(d,i){

               //sort rows
               var date = new Date();
               //userBehavior.push({type: 2, sort: [{name: d.elementName, type: d.cluster}], time: (date.getDate()<10?'0':'') + date.getDate()  + " @ " + (date.getHours()<10?'0':'') + date.getHours()  + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes()  + ":" + (date.getSeconds()<10?'0':'') + date.getSeconds()});
               UpSetState.sorting = StateOpt.sortBySetItem;
               UpSetState.grouping = undefined;
               UpSetState.levelTwoGrouping = undefined;
               UpSetState.forceUpdate = true;
               updateState(d);
               ctx.plot();

               //uncheck checkbox
               $("#sortIntersectionSize").prop("checked", false);
               $("#sortIntersectionSizeAscend").prop("checked", false);
               $("#sortNrSetsInIntersectionAscend").prop("checked", false);
               $("#sortNrSetsInIntersectionDescend").prop("checked", false);
               ctx.sortCheck = "";

               var group;
               for(j = 0; j < levelOneGroups.length; j++){
                   if(levelOneGroups[j].elementName == d.elementName){
                       group = levelOneGroups[j];
                       break;
                   }
               }
                var selection = Selection.fromSubset(group);
                var id = d.id;
                var selectedItemsID = [];

                selection.items.forEach(function (di) {
                    selectedItemsID.push(attributes[0].values[di]);
                });
                ////console.log(selectedItemsID);
               
                userBehavior.push({
                    type: 4,
                    setsCombination: {name: setIdToSet[id].elementName, type: setIdToSet[id].cluster, state: 1},
                    group_type: d.type,
                    Items: selectedItemsID.length,
                    time: (date.getDate()<10?'0':'') + date.getDate()  + " @ " + (date.getHours()<10?'0':'') + date.getHours()  + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes()  + ":" + (date.getSeconds()<10?'0':'') + date.getSeconds()
                });

                $(EventManager).trigger("user-behavior-added");

                var addSelectionValue = selections.addSelection(selection, false);
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
            })
               .on('mouseover', function(d,i){
                   var names = d.elementName.split(/\(|\)/g);
                   var text = "";
                   switch (d.cluster){
                       case 0: text += "recommended by " + names[0].trim();
                           break;
                       case 1:
                           text += "loved by " + names[0].trim();
                           break;
                       case 2:
                           text += "tagged with " + names[0].trim();
                           break;
                   }
                   document.getElementById("tipbar").innerHTML = "Click to view all tracks " + text + ".";
                   mouseoverColumn(d,i);})
               .on('mouseout', mouseoutColumn)

        // *** update sizes (might happen when changing datasets)
        d3.selectAll(".usedSets .setSize").transition().duration(500).each(function(d){
            var size = d.setSize;
            d3.select(this).attr({
                y: textHeight - (setSizeScale(d.setSize)),
                height: setSizeScale(d.setSize)
            })
            d3.selectAll(".setSizeRect").selectAll('title').text(function (d, i) {
                var names = setIdToSet[d.id].elementName.split(/\(|\)|\//g);
                //console.log(names)
                    switch(d.cluster)
                    {
                        case 0:
                            return names[1].trim() + " tracks recommended by " + names[0].trim() + ".";
                        case 1:
                            //console.log(d.id);
                            if(d.id == globalSetId) return names[2].trim() + " tracks loved by you.";
                            var string = ""
                            if(parseInt(names[2].trim()) > 1) {
                                string = names[2].trim() + " tracks loved by " + names[0].trim();
                                switch(names[1].trim()){
                                    case '0': return string + " and none of them are in common with you.";
                                    case '1': return string + " and 1 of them is in common with you.";
                                    default: return string + " and " + names[1].trim() + " of them are in common with you.";
                                }
                            }
                            else {
                                string = names[2].trim() + " track bookmarked by " + names[0].trim();
                                switch(names[1].trim()){
                                    case '0': return string + " which is not in common with you.";
                                    case '1': return string + " which is in common with you.";
                                    default: return string + ".";
                                }
                            }

                        case 2:
                            if(parseInt(names[1].trim()) > 1)
                                 return names[1].trim() + " tracks tagged with " + names[0].trim() + ".";
                            else
                                return names[1].trim() + " track tagged with " + names[0].trim() + ".";

                    }
            }).style({
                'font-size': '16pt'
            });;
        });


        d3.selectAll(".commonSize").transition().duration(500).each(function(d){
            var names = d.elementName.split(/\(|\)|\//g);
            d3.select(this).attr({
                y: textHeight - (setSizeScale(names[1])),
                height: setSizeScale(names[1])
            })
        })

        usedSetsLabelsEnter.transition().duration(400).delay(400).attr({
            opacity: 1
        })
        // *** update group position
//        usedSetsLabels
//            .attr({
//                transform: function (d, i) {
//                        return 'translate(' + (cellDistance * i) + ', 0)'
//                }
//            })

        usedSetsLabels.attr({
            transform: function (d, i) {
                if (ctx.setSelection.mode==="multiSel"){
                    if (ctx.setSelection.multiSelOut.has(d.elementName)) {
                        return 'translate(' + (cellDistance * i ) + ', -'+differenceForMultiSel+')'
                    }else{
                        return 'translate(' + (cellDistance * i ) + ', 15)'
                    }

                }else{
                    return 'translate(' + (cellDistance * i)  + ', 15)'
                }

            }
        })

        //usedSetsLabels.selectAll(".setSizeRect")
        //    .attr({
        //        "class":function(d){
        //            if (ctx.setSelection.multiSelOut.has(d.elementName)) {
        //                return 'setSizeRect unusedSetSize'
        //            }else{
        //                return 'setSizeRect setSize'
        //            }
        //
        //
        //        }
        //
        //
        //    })


    }

    updateUsedSets();


    function checkSetSelection(index)
    {

        numberOfUserTag++;
        console.log("Entities "+numberOfUserTag)
        if(numberOfLike>9&&numberOfRow>4&&numberOfUserTag>2){
            $("#task-text").hide();
            $("#questionnaire").show();
        }

        updateSetContainment(sets[index], true);
        //console.log(sets[index].id);
    }

    function initialSetswithCheckbox() {
        if (initialize) {
            var divEle = document.getElementById("checkBoxes");
            var ulElement = document.createElement("ul");

            //add tooltips
            d3.select("#checkBoxes").on('mouseover', function(){
                document.getElementById("tipbar").innerHTML = "Select an interesting agent, user or tag to explore its related tracks in the view";
            })

            while (divEle.firstChild) {
                divEle.removeChild(divEle.firstChild);
            }
            divEle.appendChild(ulElement);
            var li;
            var ul = [];
            //console.log(ClusterNames.length);
            for(i = 0; i < ClusterNames.length; i++)
            {
                li = document.createElement("li");
                li.className = "parent";
                //var inputFirst = document.createElement("input");
                //inputFirst.id = "inputFirst" + i;
                //inputFirst.type = "checkbox";
                //inputFirst.value = i;

                var foldLabel = document.createElement("label");
                foldLabel.className = "labelInParent";
                var image = document.createElement("img");
                image.width = 12;
                image.height = 12;
                image.src = "./javascripts/images/after.jpg";
                foldLabel.appendChild(image);
                foldLabel.appendChild(document.createTextNode(ClusterNames[i]));
                li.appendChild(foldLabel);


                //var labelText = document.createElement("label");
                //labelText.htmlFor = inputFirst.id;
                //labelText.appendChild(document.createTextNode(ClusterNames[i]));

                //li.appendChild(inputFirst);
                //li.appendChild(labelText).appendChild(document.createElement("br"));
                ulElement.appendChild(li);
                var anotherUl = document.createElement("ul");
                anotherUl.id = i;
                ul.push(anotherUl);
                li.appendChild(ul[i]);
            }
            for (i = 0; i < sets.length; i++) {
                var liNext = document.createElement("li");
                ul[sets[i].cluster].appendChild(liNext);
                var inputElement = document.createElement("input");
                inputElement.id = "input" + sets[i].id;
                inputElement.type = "checkbox";
                inputElement.value = i;

                inputElement.addEventListener('click', function () {
                    //console.log(this.value);
                    checkSetSelection(this.value);
                });

                var labelText = document.createElement("label");
                labelText.htmlFor = inputElement.id;
                labelText.appendChild(document.createTextNode(" " + sets[i].elementName));
                liNext.appendChild(inputElement);
                liNext.appendChild(labelText).appendChild(document.createElement("br"));
                //divEle.appendChild(inputElement);
                //divEle.appendChild(labelText).appendChild(document.createElement("br"));
            }

            //collapse or expand
            $(document).ready(function(){
                //$('.parent >ul').each(function(){ //console.log("hide");
                //    $(this).hide();
                //});
                var isHidden = false;
                $('.labelInParent').click(function(){

                    $(this).parent().find('ul').each(function(){
                        $(this).toggle();
                        isHidden = $(this).is( ":hidden" );
                        //console.log(isHidden);
                    });

                    if(isHidden)
                    {
                        $(this).find("img").attr("src", "./javascripts/images/before.jpg");
                        document.getElementById("tipbar").innerHTML = "The sets of [ "+ $(this).text() + " ] are collapsed."
                    }
                    else
                    {
                        $(this).find("img").attr("src", "./javascripts/images/after.jpg");
                        document.getElementById("tipbar").innerHTML = "The sets of [ "+ $(this).text() + " ] are expanded."
                    }
                });

            });


            //parent checkbox and children
            //$('input[type="checkbox"]').change(function(e) {
            //
            //    var checked = $(this).prop("checked"),
            //        container = $(this).parent(),
            //        siblings = container.siblings();
            //
            //    container.find('input[type="checkbox"]').prop({
            //        indeterminate: false,
            //        checked: checked
            //    });
            //
            //    function checkSiblings(el) {
            //
            //        var parent = el.parent().parent(),
            //            all = true;
            //
            //        el.siblings().each(function() {
            //            return all = ($(this).children('input[type="checkbox"]').prop("checked") === checked);
            //        });
            //
            //        if (all && checked) {
            //            parent.children('input[type="checkbox"]').prop({
            //                indeterminate: false,
            //                checked: checked
            //            });
            //
            //            checkSiblings(parent);
            //
            //        } else if (all && !checked) {
            //
            //            parent.children('input[type="checkbox"]').prop("checked", checked);
            //            parent.children('input[type="checkbox"]').prop("indeterminate", (parent.find('input[type="checkbox"]:checked').length > 0));
            //            checkSiblings(parent);
            //
            //        } else {
            //
            //            el.parents("li").children('input[type="checkbox"]').prop({
            //                indeterminate: true,
            //                checked: false
            //            });
            //
            //        }
            //
            //    }

            //    checkSiblings(container);
            //
            //    console.log("check input" + $(this).prop("id"));
            //    if($(this).prop("id") == "inputFirst" + $(this).prop("value"))
            //    {
            //        console.log("check");
            //        var parent = $(this).parent();
            //        parent.find('input[type="checkbox"]').each(function()
            //        {
            //            if($(this).prop("id") == "input" + $(this).prop("value")){
            //                if($(this).prop("checked") && !sets[$(this).prop("value")].isSelected){
            //                    checkSetSelection($(this).prop("value"));
            //                    console.log("select" + $(this).prop("value"));
            //                }
            //                if(!$(this).prop("checked") && sets[$(this).prop("value")].isSelected){
            //                    checkSetSelection($(this).prop("value"));
            //                    console.log("deselect" + $(this).prop("value"));
            //                }
            //            }
            //
            //        })
            //
            //    }
            //
            //});

            for(i = 0; i < sets.length; i++)
            {
                if (sets[i].isSelected) {
                    document.getElementById("input"+ sets[i].id).checked = true;
                    //$("#input"+i).trigger("change");
                }
            }
        }
    }
    initialSetswithCheckbox();

    function bulkChange(){

        var list_update =
            sets.filter(function(d){
                return ctx.setSelection.multiSelIn.has(d.elementName) ||
                    ctx.setSelection.multiSelOut.has(d.elementName)
            })


        ctx.setSelection.multiSelIn = d3.set();
        ctx.setSelection.multiSelOut = d3.set();

        //close multiselect panel
        ctx.setSelection.mode ="none"
        ctx.setSelection.modeChange= true

        if (list_update.length>0){
            // updateSetCon will call plot again
            list_update.map(function(d, i) { updateSetContainment(d, i==list_update.length-1); });
        }else{
            plotSetOverview()
        }


    }

}

//chen: currently only deselect
function setClicked(d, i) {

    if (ctx.setSelection.mode === "multiSel"){

        //if (d.isSelected){
        //    // for usedSets:
        //    if (ctx.setSelection.multiSelOut.has(d.elementName)){
        //        ctx.setSelection.multiSelOut.remove(d.elementName);
        //    }else{
        //        ctx.setSelection.multiSelOut.add(d.elementName);
        //    }
        //}else{
        //    // for UNusedSets:
        //    if (ctx.setSelection.multiSelIn.has(d.elementName)){
        //        ctx.setSelection.multiSelIn.remove(d.elementName);
        //    }else{
        //        ctx.setSelection.multiSelIn.add(d.elementName);
        //    }
        //}
        //plotSetOverview();
    }
    else{
        updateSetContainment(d, true);
        if(document.getElementById("input" + d.id).checked)
            document.getElementById("input" + d.id).checked = false;
    }


//               d3.selectAll(".bulkCheck").transition().remove();
}

//    overview.on('mouseover', function(d, i) {
//
//      // Remove current transitions
//      d3.selectAll(".bulkCheck").transition();
//
//        var sortFn;
//
//        if (ctx.setOrder === "name") {
//          sortFn = sortName;
//        }  else {
//          sortFn = sortSize;
//        }
//
//      if(d3.selectAll(".bulkCheck")[0].length>5)
//        return;
//
//        usedSets.filter(function(d, ii) {
//
//          d3.select(".usedSets")
//            .append("foreignObject")
//            .datum([d])
//            .attr("width", 100)
//            .attr("height", 100)
//            .attr("class", "bulkCheck")
//            .attr("y", 40)
//            .attr("x", function(d, i) {
//              return cellDistance * (ii);
//            })
//            .html("<form><input type=checkbox value=setcheck id=setcheck_"+ii+" checked/></form>")
//
//        })
//
//        var unusedSetsCheck = unusedSets.sort(sortFn).filter(function(d, ii) {
//
//          d3.select(".unusedSets")
//            .append("foreignObject")
//            .datum([d])
//            .attr("width", 100)
//            .attr("height", 100)
//            .attr("class", "bulkCheck unusedSets")
//            .attr("y", 0)
//            .attr("x", function(d, i) {
//              return cellDistance * (ii);
//            })
//            .html("<form><input type=checkbox value=setcheck id="+ii+" /></form>")
//
//        })
//
//         d3.select("#headerVis").select("svg")
//            .append("foreignObject")
//            .attr("width", 100)
//            .attr("height", 100)
//            .attr("class", "bulkCheck")
//            .attr("y", 20)
//            .attr("x", function(d, i) {
//              return 0;//ctx.w- usedSets.length*cellDistance-100;
//            })
//            .html("<form><input type=button value=update /></form>")
//            .on("click", setClickedByBulk);
//
//         d3.select("#headerVis").select("svg")
//            .append("foreignObject")
//            .attr("width", 100)
//            .attr("height", 100)
//            .attr("class", "bulkCheck")
//            .attr("y", 20)
//            .attr("x", function(d, i) {
//              return 60;//ctx.w- usedSets.length*cellDistance-100;
//            })
//            .html("<form><input type=button value='all' /></form>")
//            .on("click", function() {
//              d3.selectAll("input[value=setcheck]").property("checked", true);
//            });
//
//         d3.select("#headerVis").select("svg")
//            .append("foreignObject")
//            .attr("width", 100)
//            .attr("height", 100)
//            .attr("class", "bulkCheck")
//            .attr("y", 20)
//            .attr("x", function(d, i) {
//              return 95;//ctx.w- usedSets.length*cellDistance-100;
//            })
//            .html("<form><input type=button value='none' /></form>")
//            .on("click", function() {
//              d3.selectAll("input[value=setcheck]").property("checked", false);
//            });
//
//         d3.select("#headerVis").select("svg")
//            .append("foreignObject")
//            .attr("width", 200)
//            .attr("height", 100)
//            .attr("class", "bulkCheck")
//            .attr("y", 20)
//            .attr("x", function(d, i) {
//              return 145;//ctx.w- usedSets.length*cellDistance-100;
//            })
//            .html("<form style='font-size:12px'>Order by: <input type=radio name='order' value='size' "+ (ctx.setOrder == 'size' ? 'checked' : '') +"/> Size <input type=radio name='order' value='name' "+ (ctx.setOrder == 'name' ? 'checked' : '') +"/> Name</form>")
//            .on("click", function() {
//              d3.select(this).selectAll("input").each(orderChange);
//            });
//
//           d3.selectAll(".bulkCheck").on("mouseenter", function() {
//            // Remove current transitions
//            d3.selectAll(".bulkCheck").transition();
//          })
//
//        })
//        .on('mouseout', function(d, i) {
//            mouseoutColumn(d, i);
//            d3.selectAll(".bulkCheck").transition().duration(1500).remove();
//        })




//function orderChange() {
//    if(!this.checked)
//        return;
//
//    var sortFn;
//
//    if (this.value === "name") {
//        sortFn = sortName;
//        ctx.setOrder = "name";
//    }  else {
//        sortFn = sortSize;
//        ctx.setOrder = "size";
//    }
//
//    d3.selectAll(".unusedSets .unusedSetSizeBackground")
//        .sort(sortFn)
//        .transition().duration(500).delay(function(d, i) {
//            return i * 500 / unusedSets.length;
//        })
//        .attr("transform", function (d, i) {
//            return 'translate(' + (cellDistance * (i )) + ', 20)'
//        })
//    d3.selectAll(".unusedSets .unusedSetSize")
//        .sort(sortFn)
//        .transition().duration(500).delay(function(d, i) {
//            return i * 500 / unusedSets.length;
//        })
//        .attr("transform", function (d, i) {
//            return 'translate(' + (cellDistance * i) + ', ' + ( textHeight - minorPadding - setSizeScale(d.setSize) + 20) + ')'
//        })
//
//    d3.selectAll(".unusedSets .setLabel")
//        .sort(sortFn)
//        .transition().duration(500).delay(function(d, i) {
//            return i * 500 / unusedSets.length;
//        })
//        .attr("transform", function (d, i) {
//            return 'translate(' + (cellDistance * (i + 1) + 5) + ', 20) rotate(90)'
//        })
//
//    d3.selectAll(".unusedSets .bulkCheck").remove();
//
//    unusedSets.sort(sortFn).filter(function(d, ii) {
//
//        d3.select(".unusedSets")
//            .append("foreignObject")
//            .datum([d])
//            .attr("width", 100)
//            .attr("height", 100)
//            .attr("class", "bulkCheck")
//            .attr("y", 0)
//            .attr("x", function(d, i) {
//                return cellDistance * (ii);
//            })
//            .html("<form><input type=checkbox value=setcheck id="+ii+" /></form>")
//
//    })
//
//}