function dataParser(callback) {

    this.JSONObject = new Object();
    this.csvContent = "";
    this.currentUserBookmarks = [];
    this.UserAndBookmarks = [];
    this.commonCount = {};
    var allRelevantTracks = [];
    var similarTracks = [];
    var friendsTracks = {};
    var tagTracks = {};

    var self = this;
    jQuery.support.cors = true;
    var lastfmUrl = "https://ws.audioscrobbler.com/2.0/?api_key=6e7a76f6e379cb31ed5f4f0022a130d4&format=json&method=";
    var user = globalname;
    var topArtistsJson;
    var tagTrackCount = 0;
    var tagTrackTotal = -1;
    var friendTrackCount = 0;
    var friendTrackTotal = -1;
    var similarTrackCount = 0;
    var similarTrackTotal = -1;
    var artistBasedCount = 0;
    var artistBasedTotal = -1;
    var artistBasedTracks = [];
    var mostPopularTracks = [];
    var topArtistsList = [];

    //remove duplicates in an array
    Array.prototype.unique = function () {
        var o = {}, i, l = this.length, r = [];
        for (i = 0; i < l; i += 1) o[this[i]] = this[i];
        for (i in o) r.push(o[i]);
        return r;
    };

    getUserLovedTracks();
    getTopArtists();
    getFriends();
    getTopTracksByCountry();
    wait();

    var date = new Date();
    userBehavior.push({
        name: globalname,
        time: (date.getDate() < 10 ? '0' : '') + date.getDate() + " @ " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
    });

    var time = new Date();

    function wait(){
        //console.log(artistBasedCount + "   " + artistBasedTotal + '   ' +
        //friendTrackCount + ' ' + friendTrackTotal);
        //if got all the requests.
        if(similarTrackTotal == similarTrackCount && tagTrackCount == tagTrackTotal && friendTrackCount == friendTrackTotal && artistBasedCount == artistBasedTotal) {
            var goon = true, end = false;
            //3 agents, friends, or tags, if anything goes wrong
            if(topArtistsList.length == 0){
                goon = false;
                getTopArtists();
                console.log("no top artists found");
            }
            else if(artistBasedTracks.length == 0 || Object.keys(tagTracks).length == 0){
                goon = false;
                if(artistBasedTracks.length == 0) {
                    console.log("no artist-based recommendations");
                    getSimilarArtistsToTopOnes(topArtistsList);
                }
                if(Object.keys(tagTracks).length == 0) {
                    console.log("no tags!!");
                    getArtistTopTags(topArtistsList);
                }
            }
            if(similarTracks.length == 0){
                goon = false;
                console.log("no loved tracks recommendations.");
                getUserLovedTracks();
            }

            var keys = Object.keys(friendsTracks);
            if(keys.length == 0){
                goon = false;
                getFriends();
            }
            else if(keys.length < 5){
                goon = false;
                end = true;
                $("#errorMessage").text("Sorry, you need at least 5 followings each of which needs at least 5 loved tracks at Last.fm to start this evaluation.");
            }
            if(goon) {
                //close dialog

                $("#dialog").dialog('close');
                $("#login-header").text("Login as " + globalname);
                $("#login-header").off("click");

                var imgElement = document.createElement("img");
                imgElement.src = "./javascripts/images/31.gif";
                document.getElementById("fader").appendChild(imgElement);

                success();
            }
            else if(end){
                console.log("end");
                Ui.prototype.signMark = 1;
            }
            else{
                var curTime = new Date();
                //console.log("dav    " + (curTime - time));
                //over 10s
                if(curTime - time > 30000)
                {
                    //error message
                    var obj = $("#errorMessage").text("Sorry, you don't have enough data to start this evaluation. You can\n* love more tracks at Last.fm.\n* add more friends at Last.fm (at least 5 followings).\n");
                    obj.html(obj.html().replace(/\n/g,'<br/>'));
                    Ui.prototype.signMark = 1;
                }
                else
                    setTimeout(wait, 500);
            }
        }
        else {
            var curTime = new Date();
            //console.log(curTime - time);
            //over 10s
            if(curTime - time > 30000)
            {
                //error message
                var obj = $("#errorMessage").text("Sorry, you don't have enough data to start this evaluation. You can\n* love more tracks at Last.fm.\n* add more friends at Last.fm (at least 5 followings).");
                //change line
                obj.html(obj.html().replace(/\n/g,'<br/>'));
                Ui.prototype.signMark = 1;
            }
            else
                setTimeout(wait, 500);
        }
    }

    function success() {

        var tagKeys = Object.keys(tagTracks);
        tagKeys.sort();

        similarTracks = similarTracks.unique();
        allRelevantTracks = allRelevantTracks.concat(similarTracks);
        allRelevantTracks = allRelevantTracks.concat(artistBasedTracks);
        allRelevantTracks = allRelevantTracks.concat(mostPopularTracks);
        var start = 0;

        for(var key in tagTracks){
            allRelevantTracks = allRelevantTracks.concat(tagTracks[key]);
        }

        //add the current user;
        friendsTracks[user] = self.currentUserBookmarks;

        for(var key in friendsTracks){
            allRelevantTracks = allRelevantTracks.concat(friendsTracks[key]);
        }

        allRelevantTracks = allRelevantTracks.unique();

        //write to csv file
        self.csvContent += "id;";
        if(mostPopularTracks.length > 0) {
            self.csvContent += "most popular tracks (" + mostPopularTracks.length + ");"
            start++;
        }

        if(similarTracks.length > 0) {
            self.csvContent += "lovedTrack-based agent (" + similarTracks.length + ");"
            start++;
        }
        if(artistBasedTracks.length > 0) {
            self.csvContent += "yourArtists-based agent (" + artistBasedTracks.length + ");"
            start++;
        }

        //store user id list
        var userIDArray = [];
        var index = start;

        //myObject.file = "";
        self.JSONObject.name = "Music Exploration";
        self.JSONObject.header = 0;
        self.JSONObject.separator = ";";
        self.JSONObject.skip = 0;
        self.JSONObject.meta = [];
        self.JSONObject.meta.push({
            "type": "id",
            "index": 0,
            "name": "id"
        });

        self.JSONObject.sets = [];
        self.JSONObject.sets.push({
            "name": "Agents (number of tracks)",
            "format": "binary",
            "start": 1,
            "end": index
        });

        start = index + 1;
        for(var key in friendsTracks){
            self.UserAndBookmarks.push({
                userName: key,
                setID: "",
                bookmarks: friendsTracks[key]
            })
            self.commonCount[key] = 0;
            for(var j = 0; j < friendsTracks[key].length; j++){
                if(self.currentUserBookmarks.indexOf(friendsTracks[key][j]) > -1)
                    self.commonCount[key]++;
            }
        }

        //include the current user
        var sorted = Object.keys(friendsTracks).sort(function(a, b) {
            if(self.commonCount[b] == self.commonCount[a])
                return friendsTracks[b].length - friendsTracks[a].length;
            return self.commonCount[b] - self.commonCount[a];
        });

        for (var i = 0, len = sorted.length; i < len; ++i) {
            self.csvContent += sorted[i] + " (" + self.commonCount[sorted[i]] + "/" + friendsTracks[sorted[i]].length + ");"
            index++;
        }

        self.JSONObject.sets.push({
            "name": "Friends (number of common tracks/number of total tracks)",
            "format": "binary",
            "start": start,
            "end": index
        });

        start = index + 1;

        for (var i = 0; i < tagKeys.length; i++) {
            var key = tagKeys[i]
            self.csvContent += key + " (" + tagTracks[key].length + ");";
            index++;
        }

        self.JSONObject.sets.push({
            "name": "Tags (number of tracks)",
            "format": "binary",
            "start": start,
            "end": index
        });

        self.csvContent += "\n";
        //console.log("lengthlengthlength:" + userIDArray.length);
        for (var i = 0; i < allRelevantTracks.length; i++) {
            var mbid = allRelevantTracks[i];
            self.csvContent += allRelevantTracks[i] + ";";

            if(mostPopularTracks.length > 0)
                if (mostPopularTracks.indexOf(mbid) > -1)
                    self.csvContent += "1;";
                else self.csvContent += "0;";

            if(similarTracks.length > 0)
                if (similarTracks.indexOf(mbid) > -1)
                    self.csvContent += "1;";
                else self.csvContent += "0;";

            if(artistBasedTracks.length > 0)
                if (artistBasedTracks.indexOf(mbid) > -1)
                    self.csvContent += "1;";
                else self.csvContent += "0;";

            for (var h = 0; h < sorted.length; h++) {
                if (friendsTracks[sorted[h]].indexOf(mbid) > -1)
                    self.csvContent += "1;";
                else self.csvContent += "0;";
            }
            for (var j = 0; j < tagKeys.length; j++) {
                var key = tagKeys[j];
                if (tagTracks[key].indexOf(mbid) > -1)
                    self.csvContent += "1;";
                else self.csvContent += "0;";
            }
            //var result = $.grep(userBookmarks, function (e) {
            //    return e.contentID == contentID;
            //});
            //
            //if (result.length == 0) {
            //    console.log(contentID + "has no bookmarks");
            //    for (j = 0; j < userIDArray.length; j++) {
            //        self.csvContent += "0;";
            //    }
            //}
            //else {
            //    var currentBookmarks = result[0].userIDList;
            //    //console.log(currentBookmarks);
            //    for (j = 0; j < userIDArray.length; j++) {
            //        //console.log(j +  userIDArray[j]);
            //        if (currentBookmarks.indexOf(userIDArray[j]) > -1) {
            //            self.csvContent += "1;";
            //            //console.log("bookmarked by " + userIDArray[j]);
            //        }
            //        else self.csvContent += "0;";
            //    }
            //}
            //
            //result = $.grep(paperIDTags, function (e) {
            //    return e.contentID == contentID;
            //});
            //
            //if (result.length == 0) {
            //    console.log(contentID + "has no tag");
            //    for (j = 0; j < tagsArray.length; j++) {
            //        self.csvContent += "0;";
            //    }
            //}
            //else {
            //    var oneTagList = result[0].tags;
            //    for (j = 0; j < tagsArray.length; j++) {
            //        if (oneTagList.indexOf(tagsArray[j]) > -1) {
            //            //console.log(tagsArray[j]);
            //            self.csvContent += "1;";
            //        }
            //        else self.csvContent += "0;";
            //    }
            //}
            self.csvContent += "\n";
        }

        //self.csvContent = "data:text/csv;charset=utf-8," + self.csvContent;
        //
        //var encodedUri = encodeURI(self.csvContent);
        //window.open(encodedUri);
        //var data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(self.JSONObject));
        //window.open(data);
        callback();
    }

    function fail() {
        console.log('fail');
    }

    function getFriends()
    {
        $.ajax({
            type: "POST",
            url: lastfmUrl + "user.getfriends&user=" + user,
            contentType: 'json',
            success: function (response) {
                try {
                    getFriendsTracks(response);
                }
                catch (e) {
                    console.log("friends error");
                };
            },
            error: function () {
                console.log("get friends list failed.");
            },
            timeout: 5000
        });
    }

    function getFriendsTracks(friendsJson){
        var list = friendsJson.friends.user;
        friendTrackTotal = list.length > 50? 50: list.length;
        for(var i = 0; i < friendTrackTotal; i++) {
            $.ajax({
                type: "POST",
                url: lastfmUrl + "user.getlovedtracks&user=" + list[i].name,
                contentType: 'json',
                success: function (response) {
                    try {
                        var tracksList = response.lovedtracks.track;
                        //if his loved tracks is fewer than 5 skip.
                        if(tracksList.length > 5) {
                            var names = this.url.split("=");
                            friendsTracks[names[names.length - 1]] = new Array();
                            for (var j = 0; j < tracksList.length; j++) {
                                if (tracksList[j].mbid.length > 0) {
                                    friendsTracks[names[names.length - 1]].push(tracksList[j].mbid);
                                }
                            }
                        }
                    }
                    catch (e) {
                        console.log("friend tracks error");
                    }
                    friendTrackCount++;
                },
                error: function(){
                    console.log("get friend tracks failed.");
                    $.ajax(this);
                },
                timeout: 5000
            });
        }
    }

    function getUserTopTags()
    {
        $.ajax({
            type: "GET",
            url: lastfmUrl + "user.getTopTags&user=" + user,
            contentType: 'json',
            success: function (response) {
                try {
                    //getTagTracks(response);
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
    }

    function getTagTracks(tagList)
    {
        tagList = tagList.unique();
        tagTrackTotal = tagList.length;
        for(var i = 0; i < tagList.length; i++) {
            $.ajax({
                type: "POST",
                url: lastfmUrl + "tag.getTopTracks&tag=" + tagList[i],
                contentType: 'json',
                success: function (response) {
                    try {
                        var list = response.tracks.track;
                        var names = this.url.split("=");
                        var tagString = names[names.length-1].toLowerCase();
                        tagTracks[tagString] = new Array();
                        for(var j = 0; j < list.length; j++){
                            if(list[j].hasOwnProperty("mbid") && list[j].mbid.length > 0)
                                tagTracks[tagString].push(list[j].mbid);
                        }
                    }
                    catch (e) {
                        console.log("tag tracks error");
                    }
                    tagTrackCount++;
                },
                error: function () {
                    var names = this.url.split("=");
                    console.log("get tag tracks list failed.");
                    $.ajax(this);
                },
                timeout: 5000
            });
        }
    }

    function getTopArtists(){
        topArtistsList = [];
        $.ajax({
            type: "POST",
            url: lastfmUrl + "user.gettopartists&user=" + user,
            contentType: 'json',
            success: function (response) {
                try {
                    var list = response.topartists.artist;
                    for(var i = 0; i < list.length; i++){
                        if(list[i].mbid.length > 0)
                            topArtistsList.push(list[i].mbid);
                    }
                    getSimilarArtistsToTopOnes(topArtistsList);
                    getArtistTopTags(topArtistsList);
                }
                catch (e) {
                    console.log("top artists error");
                }
            },
            error: function () {
                console.log("get top artists list failed.");
            },
            timeout: 5000
        })
    }

    function getArtistTopTags(artists){
        var tags = [];
        var count = 0;
        var total = artists.length > 30? 30 : artists.length;
        for(var i = 0; i < total; i++) {
            $.ajax({
                type: "POST",
                url: lastfmUrl + "artist.gettoptags&mbid=" + artists[i],
                contentType: 'json',
                success: function (response) {
                    try {
                        var tagsList = response.toptags.tag;
                        for (var j = 0; j < tagsList.length && j < 3; j++) {
                            tags.push(tagsList[j].name);
                        }
                    }
                    catch (e) {
                        console.log("artist tags error");
                    }
                    count++;
                    if (count == total) getTagTracks(tags);
                },
                error: function () {
                    console.log("get artist tags list failed.");
                    $.ajax(this);
                    if (count == total) getTagTracks(tags);
                },
                timeout: 5000
            })
        }
    }

    function getSimilarArtistsToTopOnes(artists)
    {
        var similarArtists = [];
        var total, count = 0;
        if(artists.length > 10)
            total = 10;
        else total = artists.length;
        for(var i = 0; i < total; i++) {
            $.ajax({
                type: "POST",
                url: lastfmUrl + "artist.getsimilar&mbid=" + artists[i],
                contentType: 'json',
                success: function (response) {
                    try {
                        var list = response.similarartists.artist;
                        for(var m = 0; m < list.length && m < 2; m++) {
                            if (list[m].hasOwnProperty("mbid") && list[m].mbid.length > 0)
                                similarArtists.push(list[m].mbid);
                        }
                    }
                    catch (e) {
                        console.log("similar artists error");
                    }
                    count++;
                    if(count == total)
                        getArtistTopTracks(similarArtists)
                },
                error: function () {
                    console.log("get similar artists list failed.");
                    $.ajax(this);
                    if(count == total)
                        getArtistTopTracks(similarArtists)
                },
                timeout: 5000
            })
        }
    }

    function getArtistTopTracks(artists) {

        artistBasedTotal = artists.length;
        for (var i = 0; i < artists.length; i++) {
            $.ajax({
                type: "GET",
                url: lastfmUrl + "artist.gettoptracks&mbid=" + artists[i],
                contentType: 'json',
                success: function (response) {
                    try {
                        var list = response.toptracks.track;
                        for (var j = 0; j < list.length && j < 5; j++)
                            if (list[j].hasOwnProperty("mbid") && list[j].mbid.length > 0)
                                artistBasedTracks.push(list[j].mbid);
                    }
                    catch (e) {
                        console.log("artist top tracks error" + e);
                    }
                    artistBasedCount++;
                },
                error: function () {
                    console.log("get artist top tracks list failed.");
                    $.ajax(this);
                },
                timeout: 5000
            })
        }
    }

    function getUserTopAlbums()
    {
        $.ajax({
            type: "GET",
            url: lastfmUrl + "user.gettopalbums&user=" + user,
            contentType: 'json',
            success: function (response) {
                try {
                    var list = response.topalbums.album;
                    var albums = [];
                    for(var i = 0; i < list.length; i++){
                        if(list[i].mbid.length > 0)
                            albums.push(list[i].mbid);
                        if(albums.length > 10) break;
                    }
                    getAlbumTopTags(albums);
                }
                catch (e) {
                    console.log("track error");
                }
            },
            error: function () {
                console.log("get track list failed.");
                getUserTopAlbums();
            },
            timeout: 5000
        });
    }

    function getTopTracksByCountry()
    {
        $.ajax({
            type: "GET",
            url: lastfmUrl + "geo.gettoptracks&country=united states",
            contentType: 'json',
            success: function (response) {
                try {
                    var list = response.tracks.track;
                    for(var i = 0; i < list.length && i < 100; i++){
                        if(list[i].mbid.length > 0)
                            mostPopularTracks.push(list[i].mbid);
                    }
                }
                catch (e) {
                    console.log("track error");
                }
            },
            error: function () {
                console.log("get track list failed.");
                $.ajax(this);
            },
            timeout: 5000
        })
    }
    //function getAlbumTopTags(albums){
    //    var total = albums.length;
    //    var count = 0;
    //    for(var i = 0; i < total; i++){
    //        $.ajax({
    //            type: "GET",
    //            url: lastfmUrl + "album.gettoptags" + albums[i],
    //            contentType: 'json',
    //            success: function (response) {
    //                try {
    //                    getAlbumTopTags(response.toptags.tag);
    //                }
    //                catch (e) {
    //                    console.log("track error");
    //                }
    //            },
    //            error: function () {
    //                console.log("get track list failed.");
    //            },
    //            timeout: 5000
    //        });
    //    }
    //}

    function getUserLovedTracks()
    {
        //var dtd = $.Deferred();

        $.ajax({
            type: "GET",
            url: lastfmUrl + "user.getlovedtracks&user=" + user,
            contentType: 'json',
            success: function (response) {
                try {
                    var list = response.lovedtracks.track;
                    var tracks = [];
                    for(var i = 0; i < list.length; i++){
                        if(list[i].mbid.length > 0)
                            tracks.push(list[i].mbid);
                        if(tracks.length > 30)
                            break;
                    }
                    getSimilarTracks(tracks);
                }
                catch (e) {
                    console.log("track error" + e);
                }
                //dtd.resolve();
            },
            error: function () {
                console.log("get track list failed.");
            },
            timeout: 5000
        });
        //return dtd.promise();

    }

    function getSimilarTracks(tracks) {
        //var dtd = $.Deferred();

        similarTrackTotal = 0;
        for (var i = 0; i < tracks.length; i++) {
            self.currentUserBookmarks.push(tracks[i]);
            if (i < 30) {
                similarTrackTotal++;
                $.ajax({
                    type: "POST",
                    url: lastfmUrl + "track.getsimilar&mbid=" + tracks[i],
                    contentType: 'json',
                    success: function (response) {
                        try {
                            var simiTracks = response.similartracks.track;
                            for (var j = 0; j < simiTracks.length && j < 5; j++) {
                                if (simiTracks[j].hasOwnProperty("mbid") && simiTracks[j].mbid.length > 0)
                                    similarTracks.push(simiTracks[j].mbid);
                            }
                        }
                        catch (e) {
                            console.log(e);
                        }
                        similarTrackCount++;
                    },
                    error: function () {
                        console.log("get similar tracks failed.");
                        $.ajax(this);
                    },
                    timeout: 3000
                })
            }
        }
    }
}


