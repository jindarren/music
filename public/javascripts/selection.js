/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
 */


Selection = function (items, filterCollection) {
    this.items = items || [];
    //this.filters = filters || [];
    this.filterCollection = filterCollection;
    this.id = undefined;
};

Selection.createSubsetDefinition = function (subsets) {
    //console.log(subsets);
    if (!(subsets[0] instanceof Object)) {
        var newSubsets = [];
        newSubsets.push(subsets);
        subsets = newSubsets;
    }
    else {
        //subsets = subsets[0];
    }

    //console.log( "subsets" );
    //console.log( subsets );

    var subsetDefinition = [];
    //console.log(subsets.length);
    for (var s = 0; s < subsets.length; ++s) {
        if(subsets[s].hasOwnProperty('combinedSets')) {
            var subset = subsets[s].combinedSets;
            var oneDefinition = {};
            //console.log( "combinedSetsssssssssssssssssssss" );
            //console.log( subset );

            for (var x = 0; x < subset.length; ++x) {
                if (oneDefinition.hasOwnProperty(usedSets[x].id)) {
                    if (oneDefinition[usedSets[x].id] !== subset[x]) {
                        oneDefinition[usedSets[x].id] = 2;
                    }
                }
                else {
                    oneDefinition[usedSets[x].id] = subset[x];
                }
            }
            //console.log("cccccccccccc");
            //console.log(oneDefinition);
            subsetDefinition.push(oneDefinition);
        }
        else if(subsets[s].hasOwnProperty('orClauses')){
            //console.log('ooooooooooorClauses');
            subsets[s].orClauses.forEach(function(d){
                //console.log(d);
                var oneDefinition = {};
                for(var key in d){
                    oneDefinition[key] = d[key].state;
                }
                subsetDefinition.push(oneDefinition);
                //console.log("ooooooooooooo");
                //console.log(oneDefinition);
            })
            //subsets[s].subSets.forEach(function(set, i){
            //    var oneDefinition = {};
            //    if(set.items.length > 0) {
            //        var combined = set.combinedSets;
            //        console.log(combined);
            //        for (var key in set.combinedSets) {
            //            oneDefinition[usedSets[key].id] = combined[key];
            //        }
            //        subsetDefinition.push(oneDefinition);
            //    }
            //
            //});
        }
    }

    //console.log( "subsetDefinition" );
    //console.log( subsetDefinition );

    return subsetDefinition;
};

/** Create a selection from a subset *///chen: filter?
Selection.fromSubset = function (subsets) {
    var self = this;
    //console.log("ssssssssssssssssss");
    // extract a subset definition for use with the subset filter
    var subsetDefinition = Selection.createSubsetDefinition(subsets);

    /*
     var subsetDefinition = {};
     for (var x = 0; x < subset.length; ++x) {
     subsetDefinition[usedSets[x].id] = subset[x];
     }
     */
    var selections = new Selection(allItems, new FilterCollection("#filters-controls", "#filters-list"));
    selections.filterCollection.add(new Filter(attributes[attributes.length - 1], FilterConfigurations.subset, { subset: subsetDefinition[0] }));
    selections.applyFilters();
    for(var i = 1; i < subsetDefinition.length; i++){
        //console.log(subsetDefinition[i]);
    // create subset filter and create new selection based on all items
        var selection = new Selection(allItems, new FilterCollection("#filters-controls", "#filters-list"));
        selection.filterCollection.add(new Filter(attributes[attributes.length - 1], FilterConfigurations.subset, { subset: subsetDefinition[i] }));
        selection.applyFilters();
        selections.items = selections.items.concat(selection.items.filter(function (item) {
            return selections.items.indexOf(item) < 0;
        }));
    }
    //console.log(selections);

    return selections;
};

Selection.prototype.createSelection = function (attributeId, filterId, parameters) {
    var newItems = [];
    var filterInstance = filter.get(filterId);
    for (var i = 0; i < this.items.length; ++i) {
        if (filterInstance.test(this.items[i], attributes[attributeId], parameters)) {
            newItems.push(this.items[i]);
        }
    }
    //console.log(filter);
    return ( new Selection(newItems, this.filters.concat([
        { id: filterId, parameters: parameters, attributeId: attributeId, uuid: Utilities.generateUuid() }
    ])) );
};

Selection.prototype.applyFilters = function () {
    var self = this;

    // start over with all items in the data set
    self.items = allItems;

    for (var f = 0; f < self.filterCollection.list.length; ++f) {
        var filterInstance = self.filterCollection.list[f];
        var newItems = [];

        for (var i = 0; i < self.items.length; ++i) {
            if (filterInstance.configuration.test(self.items[i], filterInstance.attribute, filterInstance.parameterMap)) {
                newItems.push(self.items[i]);
            }
        }

        self.items = newItems;
    }

    $(EventManager).trigger("item-selection-updated", { selection: self });
}

Selection.prototype.mapToSubsets = function (subsetList) {
    for (var i = 0; i < subsetList.length; ++i) {
        var subset = subsetList[i];

        // ignore empty subsets
        if (subset.setSize == 0) {
            continue;
        }

        var subsetDefinition = {};
        for (var x = 0; x < subset.combinedSets.length; ++x) {
            subsetDefinition[usedSets[x].id] = subset.combinedSets[x];
        }

        var subsetFilter = FilterConfigurations.subset;
        var mappedItems = [];

        for (var j = 0; j < this.items.length; ++j) {
            if (subsetFilter.test(this.items[j], attributes[attributes.length - 1], { 'subset': subsetDefinition })) {
                mappedItems.push(this.items[j]);
            }
            else {

            }
        }

        subset.selections[this.id] = mappedItems;
    }
}

Selection.prototype.unmapFromSubsets = function (subsetList) {
    for (var i = 0; i < subsetList.length; ++i) {
        var subset = subsetList[i];

        delete subset.selections[this.id];
    }
}

Selection.prototype.getFilter = function (uuid) {
    var self = this;

    return self.filterCollection.get(uuid);
}

// should be a singleton
SelectionList = function (palette) {
    var self = this;

    self.list = [];
    self.colors = {};
    self.active = {};
    self.palette = palette || d3.scale.category10().range().slice();

    //  console.log("Palette Length " + self.palette);
};

SelectionList.prototype.getSelections = function () {
    var self = this;
    return selections.list;
}

SelectionList.prototype.addSelection = function (selection) {
    var self = this;

    selection.id = self._nextId();
    self.list = [];
    self.list.push(selection);

    self.colors[selection.id] = self._nextColor();

    $(EventManager).trigger("item-selection-added", { selection: selection });

    return self;
};

SelectionList.prototype.removeSelection = function (selection) {
    var self = this;

    for (var i = 0; i < this.list.length; ++i) {
        if (self.list[i] === selection) {
//            console.log('Deleting selection ' + i + '.');

            // remove selection from list
            self.list.splice(i, 1);

            // return color to palette
            self.palette.push(self.colors[selection.id]);

            // remove selection from color map
            delete self.colors[selection.id];

            $(EventManager).trigger("item-selection-removed", { selection: selection, index: i });

            if (self.isActive(selection)) {
                if (self.list.length > 0) {
                    self.setActive(( i > 0 ? self.list[i - 1] : self.list[0] ));
                }
                else {
                    self.setActive(undefined);
                }
            }

            return;
        }
    }

    // console.log('Unable to delete selection.');
};

SelectionList.prototype.getSelectionIndex = function (selection) {
    var self = this;

    for (var i = 0; i < self.list.length; ++i) {
        if (self.list[i] === selection) {
            return i;
        }
    }

    return undefined;
};

SelectionList.prototype.getSelectionIndexFromUuid = function (uuid) {
    var self = this;

    for (var i = 0; i < self.list.length; ++i) {
        if (self.list[i].id === uuid) {
            return i;
        }
    }

    return undefined;
};

SelectionList.prototype.getSelectionFromUuid = function (uuid) {
    var self = this;

    try {
        return ( self.list[self.getSelectionIndexFromUuid(uuid)] );
    }
    catch (error) {
        // ignore
    }

    return undefined;
};

SelectionList.prototype.getSelection = function (index) {
    var self = this;

    try {
        return ( self.list[index] );
    }
    catch (error) {
        // ignore
    }

    return undefined;
};

SelectionList.prototype.getColorFromUuid = function (uuid) {
    var self = this;

    try {
        return ( self.colors[uuid] );
    }
    catch (error) {
        // ignore
    }

    return undefined;
};

SelectionList.prototype.getColor = function (selection) {
    var self = this;

    try {
        return ( self.colors[selection.id] );
    }
    catch (error) {
        // ignore
    }

    return undefined;
};

SelectionList.prototype.getSize = function () {
    var self = this;

    return self.list.length;
};

SelectionList.prototype.isActive = function (selection) {
    var self = this;

    return ( self.active === selection );
};

SelectionList.prototype.isActiveByUuid = function (uuid) {
    var self = this;
    if (!self.active) {
        return false;
    }
    return ( self.active.id === uuid );
};

SelectionList.prototype.getActive = function () {
    var self = this;

    return ( self.active );
};

SelectionList.prototype.setActive = function (selection) {
    var self = this;

    self.active = selection;
    //chen: selection have been customized, not original
    $(EventManager).trigger("item-selection-activated", { selection: selection });

    return ( self );
};

SelectionList.prototype.setActiveByUuid = function (uuid) {
    var self = this;

    self.active = self.getSelectionFromUuid(uuid);

    $(EventManager).trigger("item-selection-activated", { selection: self.active });

    return ( self );
};

SelectionList.prototype._nextColor = function () {
    var self = this;

    // use color pool and return black once pool is empty
    //if (self.palette.length > 0) {
    //    // first available color
    //    return self.palette.splice(0, 1)[0];
    //}
    //self.palette = d3.scale.category10().range().slice();
    //if (self.palette.length > 0) {
    //    // first available color
    //    return self.palette.splice(0, 1)[0];
    //}
    return "#636363";
};

SelectionList.prototype._nextId = function () {
    return Utilities.generateUuid();
};
