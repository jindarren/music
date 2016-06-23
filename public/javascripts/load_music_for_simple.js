this.JSONObject           = new Object();
this.csvContent           = "";
this.currentUserBookmarks = [];
this.UserAndBookmarks     = [];
this.commonCount          = {};
var similarTracks         = [];
var friendsTracks         = {};
var tagTracks             = {};

var self              = this;
jQuery.support.cors   = true;
var lastfmUrl         = "https://ws.audioscrobbler.com/2.0/?api_key=6e7a76f6e379cb31ed5f4f0022a130d4&format=json&method=";
var user              = '';
var tagTrackCount     = 0;
var tagTrackTotal     = -1;
var friendTrackCount  = 0;
var friendTrackTotal  = -1;
var similarTrackCount = 0;
var similarTrackTotal = -1;
var artistBasedCount  = 0;
var artistBasedTotal  = -1;
var artistBasedTracks = [];
var mostPopularTracks = [];
var topArtistsList    = [];
var numberOfLiked = 0;
var numberOfTab = 0;


//remove duplicates in an array
Array.prototype.unique = function () {
    var o = {}, i, l = this.length, r = [];
    for (i = 0; i < l; i += 1) o[this[i]] = this[i];
    for (i in o) r.push(o[i]);
    return r;
};

$(".nav-tabs").click(function(){
    numberOfTab++;
    console.log(numberOfTab)
    if(numberOfLiked>9&&numberOfTab>=4){
        $("#task-text").hide();
        $("#questionnaire").show();
    }
})

$('#friends-list')
    .change(function () {
        $("select option:selected").each(function () {
            getFriend($(this).text())
        });
    })

function getFriend(name) {
    $('#result-table-4 tbody').empty();

    $.ajax({
        type: "POST",
        url: lastfmUrl + "user.getlovedtracks&user=" + name,
        contentType: 'json',
        success: function (response) {
            try {
                var tracksList = response.lovedtracks.track;
                //if his loved tracks is fewer than 5 skip.
                if (tracksList.length > 5) {
                    for (var j = 0; j < tracksList.length; j++) {
                        if (tracksList[j].mbid.length > 0) {
                            $('#result-table-4 tbody').append('<tr style="display: flex; width: 100%;"> <td width="33%"><a style="cursor: pointer; text-decoration: underline;" href=' + tracksList[j].url + ' target="_blank">' + tracksList[j].name + '</a></td><td width="33%">' + tracksList[j].artist.name + '</td> <td width="33%"><img width="16px" height="15px" src="./javascripts/images/heart-empty.png" style="cursor: pointer;"></td></tr>')
                        }
                    }
                }else{
                    $('#result-table-4 tbody').append('<tr style="display: flex; width: 100%;"> <td width="100%"> Sorry there are no enough recommendations from the user, please try other users! </td></tr>')
                }
            }
            catch (e) {
                console.log("friend tracks error");
            }
        },
        error: function () {
            console.log("get friend tracks failed.");
        },
        timeout: 5000
    });
}


$('#tags-list')
    .change(function () {
        $("select option:selected").each(function () {
            getTag($(this).text())
        });
    })

function getTag(name) {
    $('#result-table-5 tbody').empty();

    $.ajax({
        type: "POST",
        url: lastfmUrl + "tag.getTopTracks&tag=" + name,
        contentType: 'json',
        success: function (response) {
            try {
                var list             = response.tracks.track;
                var names            = this.url.split("=");
                var tagString        = names[names.length - 1].toLowerCase();
                tagTracks[tagString] = new Array();
                for (var j = 0; j < list.length; j++) {
                    if (list[j].hasOwnProperty("mbid") && list[j].mbid.length > 0) {
                        tagTracks[tagString].push(list[j].mbid);
                        $('#result-table-5 tbody').append('<tr style="display: flex; width: 100%;"> <td width="33%"><a style="cursor: pointer; text-decoration: underline;" href=' + list[j].url + ' target="_blank">' + list[j].name + '</a></td><td width="33%">' + list[j].artist.name + '</td> <td width="33%"><img width="16px" height="15px" src="./javascripts/images/heart-empty.png" style="cursor: pointer;"></td></tr>')
                    }
                }
            }
            catch (e) {
                console.log("tag tracks error");
            }
            tagTrackCount++;
        },
        error: function () {
            var names = this.url.split("=");
            //console.log(names[names.length-1]);
            console.log("get tag tracks list failed.");
            $.ajax(this);
        },
        timeout: 5000
    });
}

$('.agent-link').click(function () {
    $('#friends-list').hide();
    $('#tags-list').hide();
})

$('#friend-link').click(function () {
    $('#tags-list').hide();
    $('#friends-list').show();
})

$('#tag-link').click(function () {
    $('#friends-list').hide();
    $('#tags-list').show();
})

$(document).ajaxStart(function () {
    $('.sk-fading-circle').show()
})

$(document).ajaxStop(function () {
    $('.sk-fading-circle').hide()
    $('img').click(function () {

        numberOfLiked++
        if(numberOfLiked>9&&numberOfTab>=4){
            $("#task-text").hide();
            $("#questionnaire").show();
        }
        if ($(this).attr('src') == './javascripts/images/heart-empty.png') {
            $(this).attr('src', './javascripts/images/heart.png')
            var date = new Date();
            userBehavior.push({
                type: 7,
                item: "liked music",
                time: (date.getDate() < 10 ? '0' : '') + date.getDate() + " @ " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
            });
        }
        else if ($(this).attr('src') == './javascripts/images/heart.png')
            $(this).attr('src', './javascripts/images/heart-empty.png')
    })
})

function myFunction() {
    var person = prompt("Please enter your username of lastfm");

    var date = new Date();

    userBehavior.push({
        type: 0,
        name: person,
        time: (date.getDate() < 10 ? '0' : '') + date.getDate() + " @ " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
    });

    if (person != null) {
        getTopTracksByCountry();
        getUserLovedTracks(person);
        getTopArtists(person);
        getFriends(person);
    }
}

myFunction();

function getFriends(user) {
    $.ajax({
        type: "POST",
        url: lastfmUrl + "user.getfriends&user=" + user,
        contentType: 'json',
        success: function (response) {
            try {
                getFriendsTracks(response);
                getFriend(response.friends.user[0].name)
            }
            catch (e) {
                console.log("friends error");
            }
            ;
        },
        error: function () {
            console.log("get friends list failed.");
        },
        timeout: 5000
    });
}

function getFriendsTracks(friendsJson) {
    var list         = friendsJson.friends.user;
    friendTrackTotal = list.length > 50 ? 50 : list.length;
    for (var i = 0; i < friendTrackTotal; i++) {

        $('#friends-list').append('<option value="' + list[i].name + '">' + list[i].name + '</option>')
        $.ajax({
            type: "POST",
            url: lastfmUrl + "user.getlovedtracks&user=" + list[i].name,
            contentType: 'json',
            success: function (response) {
                try {
                    var tracksList = response.lovedtracks.track;
                    //if his loved tracks is fewer than 5 skip.
                    if (tracksList.length > 5) {
                        var names                              = this.url.split("=");
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
            error: function () {
                console.log("get friend tracks failed.");
                $.ajax(this);
            },
            timeout: 5000
        });
    }
}

function getTagTracks(tagList) {
    tagList       = tagList.unique();
    tagTrackTotal = tagList.length;
    for (var i = 0; i < tagList.length; i++) {
        if(i==0)
            getTag(tagList[i]);
        $('#tags-list').append('<option value="' + tagList[i] + '">' + tagList[i] + '</option>')

        $.ajax({
            type: "POST",
            url: lastfmUrl + "tag.getTopTracks&tag=" + tagList[i],
            contentType: 'json',
            success: function (response) {
                try {
                    var list             = response.tracks.track;
                    var names            = this.url.split("=");
                    var tagString        = names[names.length - 1].toLowerCase();
                    tagTracks[tagString] = new Array();
                    for (var j = 0; j < list.length; j++) {
                        if (list[j].hasOwnProperty("mbid") && list[j].mbid.length > 0) {
                            tagTracks[tagString].push(list[j].mbid);
                        }
                    }
                }
                catch (e) {
                    console.log("tag tracks error");
                }
                tagTrackCount++;
            },
            error: function () {
                var names = this.url.split("=");
                //console.log(names[names.length-1]);
                console.log("get tag tracks list failed.");
                $.ajax(this);
            },
            timeout: 5000
        });
    }
}

function getTopArtists(user) {
    topArtistsList = [];
    $.ajax({
        type: "POST",
        url: lastfmUrl + "user.gettopartists&user=" + user,
        contentType: 'json',
        success: function (response) {
            try {
                var list = response.topartists.artist;
                for (var i = 0; i < list.length; i++) {
                    if (list[i].mbid.length > 0)
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

function getArtistTopTags(artists) {
    var tags  = [];
    var count = 0;
    var total = artists.length > 30 ? 30 : artists.length;
    for (var i = 0; i < total; i++) {
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

function getSimilarArtistsToTopOnes(artists) {
    var similarArtists = [];
    var total, count   = 0;
    if (artists.length > 10)
        total = 10;
    else total = artists.length;
    for (var i = 0; i < total; i++) {
        $.ajax({
            type: "POST",
            url: lastfmUrl + "artist.getsimilar&mbid=" + artists[i],
            contentType: 'json',
            success: function (response) {
                try {
                    var list = response.similarartists.artist;
                    for (var m = 0; m < list.length && m < 2; m++) {
                        if (list[m].hasOwnProperty("mbid") && list[m].mbid.length > 0)
                            similarArtists.push(list[m].mbid);
                    }
                }
                catch (e) {
                    console.log("similar artists error");
                }
                count++;
                if (count == total)
                    getArtistTopTracks(similarArtists)
            },
            error: function () {
                console.log("get similar artists list failed.");
                $.ajax(this);
                if (count == total)
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
                        if (list[j].hasOwnProperty("mbid") && list[j].mbid.length > 0) {
                            artistBasedTracks.push(list[j].mbid);
                            $('#result-table-3 tbody').append('<tr style="display: flex; width: 100%;"> <td width="33%"><a style="cursor: pointer; text-decoration: underline;" href=' + list[i].url + ' target="_blank">' + list[j].name + '</a></td><td width="33%">' + list[j].artist.name + '</td> <td width="33%"><img width="16px" height="15px" src="./javascripts/images/heart-empty.png" style="cursor: pointer;"></td></tr>')
                        }
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

function getUserTopAlbums() {
    $.ajax({
        type: "GET",
        url: lastfmUrl + "user.gettopalbums&user=" + user,
        contentType: 'json',
        success: function (response) {
            try {
                var list   = response.topalbums.album;
                var albums = [];
                for (var i = 0; i < list.length; i++) {
                    if (list[i].mbid.length > 0)
                        albums.push(list[i].mbid);
                    if (albums.length > 10) break;
                }
                getAlbumTopTags(albums);
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
    });
}

function getTopTracksByCountry() {
    $.ajax({
        type: "GET",
        url: lastfmUrl + "geo.gettoptracks&country=united states",
        contentType: 'json',
        success: function (response) {
            try {
                var list = response.tracks.track;
                $('#menu1-item').append('')
                for (var i = 0; i < list.length && i < 100; i++) {
                    if (list[i].mbid.length > 0) {
                        mostPopularTracks.push(list[i]);
                        $('#result-table-1 tbody').append('<tr style="display: flex; width: 100%;"> <td width="33%"><a style="cursor: pointer; text-decoration: underline;" href=' + list[i].url + ' target="_blank">' + list[i].name + '</a></td><td width="33%">' + list[i].artist.name + '</td> <td width="33%"><img width="16px" height="15px" src="./javascripts/images/heart-empty.png"style="cursor: pointer;"></td></tr>')
                    }
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
    });
}


function getUserLovedTracks(user) {
    $.ajax({
        type: "GET",
        url: lastfmUrl + "user.getlovedtracks&user=" + user,
        contentType: 'json',
        success: function (response) {
            try {
                var list   = response.lovedtracks.track;
                var tracks = [];
                for (var i = 0; i < list.length; i++) {
                    if (list[i].mbid.length > 0)
                        tracks.push(list[i].mbid);
                    if (tracks.length > 30)
                        break;
                }
                getSimilarTracks(tracks);
            }
            catch (e) {
                console.log("track error" + e);
            }
        },
        error: function () {
            console.log("get track list failed.");
        },
        timeout: 5000
    });
}

function getSimilarTracks(tracks) {
    similarTrackTotal = 0;
    for (var i = 0; i < tracks.length; i++) {
        //get the list of current-user-loved tracks
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
                            if (simiTracks[j].hasOwnProperty("mbid") && simiTracks[j].mbid.length > 0) {
                                similarTracks.push(simiTracks[j].mbid);
                                $('#result-table-2 tbody').append('<tr style="display: flex; width: 100%;"> <td width="33%"><a style="cursor: pointer; text-decoration: underline;" href=' + simiTracks[i].url + ' target="_blank">' + simiTracks[j].name + '</a></td><td width="33%">' + simiTracks[j].artist.name + '</td> <td width="33%"><img width="16px" height="15px" src="./javascripts/images/heart-empty.png"style="cursor: pointer;"></td></tr>')

                            }
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
                timeout: 5000
            })
        }
    }
}

$('#agent1').click(function(){
    var date = new Date();
    userBehavior.push({
        type: 4,
        item: "agent1",
        time: (date.getDate() < 10 ? '0' : '') + date.getDate() + " @ " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
    });
})

$('#agent2').click(function(){
    var date = new Date();
    userBehavior.push({
        type: 4,
        item: "agent2",
        time: (date.getDate() < 10 ? '0' : '') + date.getDate() + " @ " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
    });
})

$('#agent3').click(function(){
    var date = new Date();
    userBehavior.push({
        type: 4,
        item: "agent3",
        time: (date.getDate() < 10 ? '0' : '') + date.getDate() + " @ " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
    });
})

$('#friend-link').click(function(){
    var date = new Date();

    userBehavior.push({
        type: 4,
        item: "user",
        time: (date.getDate() < 10 ? '0' : '') + date.getDate() + " @ " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
    });
})

$('#tag-link').click(function(){
    var date = new Date();

    userBehavior.push({
        type: 4,
        item: "tag",
        time: (date.getDate() < 10 ? '0' : '') + date.getDate() + " @ " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
    });
})

