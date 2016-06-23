/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
 */

Ui = function() {
    var self = this;

    self.lastWindowWidth = 0;
    self.lastWindowHeight = 0;

    // needs to be called
    self.initialize();
    self.initWidthHandler();

    this.dialog = $( "#dialog" ).dialog({
        //autoOpen: false,
        height: 250,
        width: 300,
        modal: true,
        dialogClass: 'ui-dialog',
        buttons: {
            "Start": self.signin,
            Cancel: function() {
                $(this).dialog( "close" );
            }
        },
        open: function(){
            $("#dialog").keypress(function(e) {
                if (e.keyCode == 13) {
                    $(this).parent().find("button:eq(1)").trigger("click");
                }
            });
        },
        close: function() {
            $("#errorMessage").text("");
            //$("#login-form")[0].reset();
            //form[ 0 ].reset();
            //allFields.removeClass( "ui-state-error" );
        }
    });

    //globalname = "svenc";
    //globalUserId = 16;

    //var date = new Date();
    //userBehavior.push({
    //    userID: globalUserId,
    //    name: globalname,
    //    time: (date.getDate() < 10 ? '0' : '') + date.getDate() + " @ " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
    //});

    self.searchResultArray = {};
    self.searchResultIndex = 0;
    $("#searchInput").on('search', function(){
        self.searchSets($(this).val());
    });
    $("#searchInput").keyup(function(){
        self.searchSets($(this).val());
    });
    $("#upButton").hide();
    $("#downButton").hide();
    $("#upButton").on('click', function(){
        //console.log("----------");
        $(self.searchResultArray[self.searchResultIndex]).find("em").each(function(){
            $(this).css("background", "#ff6");
        })
        self.searchResultIndex--;
        if(self.searchResultIndex < 0)
            self.searchResultIndex = self.searchResultArray.length - 1;
        if($(self.searchResultArray[self.searchResultIndex]).parent().parent().is(":hidden")){
            $(self.searchResultArray[self.searchResultIndex]).parent().parent().parent().find(".labelInParent").trigger('click');
        }
        var distance = $(self.searchResultArray[self.searchResultIndex]).offset().top - $('#checkBoxes').offset().top;
        if (distance < 0 || distance > $('#checkBoxes').height()) {
            //console.log($('#checkBoxes').height() + " " + $('#checkBoxes').scrollTop() + "  " + distance)
            $('#checkBoxes').animate({
                scrollTop: distance + $('#checkBoxes').scrollTop() - 30
            }, 'fast');
        }
        $("#searchResult").text((self.searchResultIndex + 1) + "/" + self.searchResultArray.length + " result(s)");
        $(self.searchResultArray[self.searchResultIndex]).find("em").each(function(){
            $(this).css("background", "#fb954b");
        })
    });

    $("#downButton").on('click', function() {
        //console.log("++++++++++++++");
        $(self.searchResultArray[self.searchResultIndex]).find("em").each(function () {
            $(this).css("background", "#ff6");
        })
        self.searchResultIndex++;
        if (self.searchResultIndex > self.searchResultArray.length - 1)
            self.searchResultIndex = 0;
        if ($(self.searchResultArray[self.searchResultIndex]).parent().parent().is(":hidden")) {
            $(self.searchResultArray[self.searchResultIndex]).parent().parent().parent().find(".labelInParent").trigger('click');
        }
        //scroll into view
        var distance = $(self.searchResultArray[self.searchResultIndex]).offset().top - $('#checkBoxes').offset().top;
        if (distance < 0 || distance > $('#checkBoxes').height()) {
            //console.log($('#checkBoxes').height() + " " + $('#checkBoxes').scrollTop() + "  " + distance)
            $('#checkBoxes').animate({
                scrollTop: distance + $('#checkBoxes').scrollTop() - 30
            }, 'fast');
        }
        $("#searchResult").text((self.searchResultIndex + 1) + "/" + self.searchResultArray.length + " result(s)");
        $(self.searchResultArray[self.searchResultIndex]).find("em").each(function(){
            $(this).css("background", "#fb954b");
        })
    })
    //UpSet();
};

Ui.prototype.searchSets = function(text){
    var self = this;
    if(self.searchResultArray.length > 0)
    self.searchResultArray.each(function(){
        $(this).html($(this).text());
    });
    var curText = text.trim();
    if(curText.length > 0)
    {
        self.searchResultArray = $(".parent ul li")
            .find("label")
            .filter(function () {
                var matchStart = $(this).text().toLowerCase().indexOf(curText.toLowerCase());
                if(matchStart > -1){
                    var matchEnd = matchStart + curText.length - 1;
                    var beforeMatch = $(this).text().slice(0, matchStart);
                    var matchText = $(this).text().slice(matchStart, matchEnd + 1);
                    var afterMatch = $(this).text().slice(matchEnd + 1);
                    $(this).html(beforeMatch + "<em>" + matchText + "</em>" + afterMatch);
                    return true;
                }
                return false;
            });
        $("#searchResult").text(self.searchResultArray.length + " result(s)");
    }
    else {
        $("#searchResult").text("");
        self.searchResultArray.length = 0;
    }
    if(self.searchResultArray.length > 2)
    {
        $("#upButton").show();
        $("#downButton").show();
    }
    else{
        $("#upButton").hide();
        $("#downButton").hide();
    }
    if(self.searchResultArray.length > 0){
        if($(self.searchResultArray[0]).parent().parent().is(":hidden")){
            $(self.searchResultArray[0]).parent().parent().parent().find(".labelInParent").trigger('click');
        }
        //scroll into view
        var distance = $(self.searchResultArray[self.searchResultIndex]).offset().top - $('#checkBoxes').offset().top;
        if (distance < 0 || distance > $('#checkBoxes').height()) {
            //console.log($('#checkBoxes').height() + " " + $('#checkBoxes').scrollTop() + "  " + distance)
            $('#checkBoxes').animate({
                scrollTop: distance + $('#checkBoxes').scrollTop() - 30
            }, 'fast');
        }
        self.searchResultIndex = 0;
        $("#searchResult").text((self.searchResultIndex + 1) + "/" + self.searchResultArray.length + " result(s)");
    }
    //draw matched text background
    $(self.searchResultArray[0]).find("em").each(function(){
        $(this).css("background", "#fb954b");
    })
}

/**
 * update container sizes
 */
Ui.prototype.resize = function( event ) {
    if ( ( self.lastWindowWidth != $(window).width() ) && ( self.lastWindowHeight != $(window).height() ) ) {
        $(EventManager).trigger( "ui-resize", { newWidth: $(window).width(), oldWidth: self.lastWindowWidth, newHeight: $(window).height(), oldHeight: self.lastWindowHeight } );

        self.lastWindowHeight = $(window).height();
        self.lastWindowWidth = $(window).width();

        return;
    }

    if ( self.lastWindowWidth != $(window).width() ) {
        $(EventManager).trigger( "ui-horizontal-resize", { newWidth: $(window).width(), oldWidth: self.lastWindowWidth } );

        self.lastWindowWidth = $(window).width();
        return;
    }

    if ( self.lastWindowHeight != $(window).height() ) {
        $(EventManager).trigger( "ui-vertical-resize", { newHeight: $(window).height(), oldHeight: self.lastWindowHeight } );

        self.lastWindowHeight = $(window).height();

        return;
    }
}

Ui.prototype.updateFixedHeightContainers = function() {
    var fixedYContainers = $('.fixed-y-container');
    fixedYContainers.map( function(index) {
        var paddingBottom = parseInt( $(fixedYContainers[index]).css( 'padding-bottom' ) ) || 0;
       // console.log( paddingBottom );
        var targetHeight = ( $(window).height() - $(this).offset().top - paddingBottom ) * parseFloat( $(fixedYContainers[index]).attr("data-height-ratio") );
        var minHeight = parseInt( $('.fixed-y-container').css( "min-height" ) );
        var maxHeight = parseInt( $('.fixed-y-container').css( "max-height" ) ) || targetHeight;

        var newHeight = Math.min( Math.max( targetHeight, minHeight ), maxHeight );
        $(this).css('height', newHeight + 'px');
    });
}

Ui.prototype.initialize = function() {
    var self = this;

    self.lastWindowHeight = $(window).height();
    self.lastWindowWidth = $(window).width();

    self.createHeader();
    self.hideMenu();
    self.updateFixedHeightContainers();
}

Ui.prototype.createHeader = function() {
    var self = this;
    $( "#login-header").on( "click", function( event ){
        self.loginUI();
        //self.toggleMenu();
    });
}

Ui.prototype.loginUI = function() {
    $("#dialog").dialog('open');
}

Ui.prototype.signMark = 1;
Ui.prototype.signin = function() {
    var email = $("#email").val(),
        password = $("#password").val(),
        self = this;

    if(Ui.prototype.signMark) {
        Ui.prototype.signMark = 0;
        Ui.prototype.loginRequest(email, password);
    }
    //$("#dialog").dialog('close');
}

Ui.prototype.loginRequest = function(email, password){
    var self = this;

    $("#errorMessage").text("In processing...");
    $.ajax({
        type: "POST",
        url: "https://ws.audioscrobbler.com/2.0/?api_key=6e7a76f6e379cb31ed5f4f0022a130d4&format=json&method=user.getinfo&user=" + email,
        contentType: 'json',
        success: function (response) {
            try {
                if(response.hasOwnProperty("error")) {
                    Ui.prototype.signMark = 1;
                    $("#errorMessage").text("Wrong username.");
                }
                else {
                    globalname = email;
                    UpSet();
                }
            }
            catch (e) {
                console.log("top tag error");
            };
        },
        error: function () {
            console.log("get top tag list failed.");
        },
        timeout: 5000
    });
    //var date = new Date();
    //userBehavior.push({
    //    userID: globalUserId,
    //    email: globalEmail,
    //    name: globalname,
    //    time: (date.getDate() < 10 ? '0' : '') + date.getDate() + " @ " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
    //});
    //$("#dialog").dialog('close');
    //$("#login-header").text("Login as " + email);
    //$("#login-header").off("click");
    //
    //var imgElement = document.createElement("img");
    //imgElement.src = "./javascripts/images/31.gif";
    //document.getElementById("fader").appendChild(imgElement);

}

Ui.prototype.showMenu = function() {
    var self = this;
    $(".ui-menu").show();
}

Ui.prototype.hideMenu = function() {
    var self = this;
    $(".ui-menu").hide();
}

Ui.prototype.toggleMenu = function() {
    var self = this;
    $(".ui-menu").slideToggle({ step: self.updateFixedHeightContainers });
    //$( "#show-menu-button").toggleClass( "fa-spin");
}

Ui.prototype.initWidthHandler = function(){
    $("#moveLeftHandle").on("drag")

    $(function() {
        var isDragging = false;
        var startX = undefined;
        var endX = undefined;
        var leftWidth = undefined;
        var rightLeft = undefined;

        $("#moveLeftHandle")
            .mousedown(function(event) {
                event.stopPropagation()
                //  console.log("MD");
                if ( !isDragging ) {
                    startX = event.clientX; //#set-vis-container
                    leftWidth = $(".ui-layout-west").width();
                    rightLeft = $(".ui-layout-center").offset().left;
                    isDragging = true;
                }
            });

        $(window).mouseup(function() {
            if ( isDragging ) {
//                endX = event.clientX;
//                $(".ui-layout-center").width( leftWidth + (endX - startX) );
//                   $("#right").offset( { left: rightLeft + (endX - startX) } );
//                   $("#right").width( rightLeft - (endX - startX) );
                isDragging = false;
            }


        });

        $(window).mousemove(function(event) {

            if ( isDragging ) {
                endX = event.clientX;

                event.stopPropagation()

                $(".ui-layout-west").width( leftWidth + (endX - startX) );
                $("#vis").width( leftWidth + (endX - startX) );
//                $("#vis svg").width( leftWidth + (endX - startX) );
//                $("#right").offset( { left: rightLeft + (endX - startX) } );
//                $("#right").width( rightLeft - (endX - startX) );

                $(EventManager).trigger( "vis-svg-resize", { newWidth:+(leftWidth + (endX - startX)) });

            }
        });

    });

}

Ui.prototype.initWidthHandler = function(){
    $("#moveHandle").on("drag")

    $(function() {
        var isDragging = false;
        var startX = undefined;
        var endX = undefined;
        var leftWidth = undefined;
        var rightLeft = undefined;
        var rightWidth = undefined;

        $("#moveHandle")
            .mousedown(function(event) {
                event.stopPropagation()
                console.log("MD");
                if ( !isDragging ) {
                    startX = event.clientX; //#set-vis-container
                    leftWidth = $("#set-vis-container").width();
                    rightLeft = $("#element-view-part").offset().left;
                    rightWidth = $("#element-view-part").width();
                    isDragging = true;
                }

            });

        $(window).mouseup(function() {
            if ( isDragging ) {
//                endX = event.clientX;
//                $(".ui-layout-center").width( leftWidth + (endX - startX) );
//                   $("#right").offset( { left: rightLeft + (endX - startX) } );
//                   $("#right").width( rightLeft - (endX - startX) );
                isDragging = false;
            }
        });

        $(window).mousemove(function(event) {

            if ( isDragging ) {
                endX = event.clientX;

                event.stopPropagation()

                $("#set-vis-container").width( leftWidth + (endX - startX) );
                $("#element-view-part").width( rightWidth + (startX - endX) );
                //$("#vis").width( leftWidth + (endX - startX) );
//                $("#vis svg").width( leftWidth + (endX - startX) );
//                $("#right").offset( { left: rightLeft + (endX - startX) } );
//                $("#right").width( rightLeft - (endX - startX) );

                $(EventManager).trigger( "vis-svg-resize", { newWidth:+(leftWidth + (endX - startX)) });
            }
        });
    });

}