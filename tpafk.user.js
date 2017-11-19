// ==UserScript==
// @name         Anti-AFK (Obfuscated)
// @version      1.0
// @description  Warns you when almost getting kicked, and prevents a kick by honking when 3 or less players are in the game.
// @author       Ko
// @include      http://tagpro-*.koalabeast.com:*
// @downloadURL  https://github.com/wilcooo/TagPro-AntiAFK/raw/master/tpafk.user.js
// @supportURL   https://www.reddit.com/message/compose/?to=Wilcooo
// @license      MIT
// ==/UserScript==

////////////////////////////////////////////////////////////////////////////////////////////
//     ### --- OPTIONS --- ###                                                            //
////////////////////////////////////////////////////////////////////////////////////////  //
                                                                                      //  //
// How many seconds before you would be kicked do you want to be warned by a honk?    //  //
var warn_time = 5;                                                                    //  //
                                                                                      //  //
// How many milliseconds do you want the honk to last?                                //  //
// When you don have the TagPro Honk script, I recommend setting this to 20           //  //
var honk_time = 200;                                                                  //  //
                                                                                      //  //
// Do you want to get a chat message?                                                 //  //
var chat = true;                                                                      //  //
                                                                                      //  //
// Do you want an extra auditory warning?                                             //  //
// This is only useful if you don't have the TagPro Honk script.                      //  //
// (This function does not work yet)                                                  //  //
var auditory = false;                                                                 //  //
                                                                                      //  //
// Do you want the title of the browser tab to go crazy?                              //  //
// This will draw your attention when you are reading the TagPro reddit while         //  //
// joining a game (like I often do..)                                                 //  //
// (This function does not work yet)                                                  //  //
var tab_text = false;                                                                 //  //
                                                                                      //  //
////////////////////////////////////////////////////////////////////////////////////////  //
//                                                     ### --- END OF OPTIONS --- ###     //
////////////////////////////////////////////////////////////////////////////////////////////





//////////////////////////////////////
// SCROLL FURTHER AT YOUR OWN RISK! //
//////////////////////////////////////





var short_name = 'anti_afk';           // An alphabetic (no spaces/numbers) distinctive name for the script.
var version = GM_info.script.version;  // The version number is automatically fetched from the metadata.
tagpro.ready(function(){ if (!tagpro.scripts) tagpro.scripts = {}; tagpro.scripts[short_name]={version:version};});
console.log('START: ' + GM_info.script.name + ' (v' + version + ' by ' + GM_info.script.author + ')');




const KICK_TIME = 30000;
const KICK_TIME_AT_START = 10000;


const MESSAGES = ['WAKE UP, AND MOVE! YOU GOT '+warn_time+' SECONDS!',
                  'LAZY SON OF A BALL, MOVE YOUR ORIGIN OR GET KICKED!',
                  'AND ONCE AGAIN YOUR LIFE DEPENDS ON MY WARNING',
                  'WHAT ARE YOU DOING? DON\'T LET YOUR TEAMMATES DOWN LIKE THIS',
                  'YOU EMBARRASS ME IN FRONT OF EVERYONE.',
                  'DO IT.   JUST. DO. IT!',
                  'HOW HARD IS IT TO PRESS THAT SPACE BAR???',
                  'HELLO? ARE YOU THERE, HUMAN? SHOULD I CALL A DOCTOR?',
                  'LISTN TO ME; YOU GOTTA BOUNCE.',
                  'EXCUSE ME SIR, YOUR BREAK IS ALMOST OVER',
                  'ARE YOU JUST TESTING MY LIMITS?',
                  'WHY IN ORBITS NAME ARE YOU SLEEPING WHILE ROLLING???',];


tagpro.ready(function () {

    (function() {
        // DO NOT CHANGE ANYTHING IN THIS FUNCTION, AS IT CAN BREAK OTHER TAGPRO SCRIPTS.
        // DON'T EVEN MINIFY IT.
        if (!tagpro.KeyComm) tagpro.KeyComm = {};
        if (!(tagpro.KeyComm.version >= 1.1)) tagpro.KeyComm.version = 1.1;
        else return;

        tagpro.KeyComm.sentDir     = {};
        tagpro.KeyComm.sentTime    = {};
        tagpro.KeyComm.pressedDir  = {};
        tagpro.KeyComm.pressedTime = {};
        tagpro.KeyComm.keyCount    = 1;

        var tse = tagpro.socket.emit;

        tagpro.socket.emit = function(event, args) {
            if (event === 'keydown') {
                tagpro.KeyComm.sentDir[args.k] = true;
                tagpro.KeyComm.sentTime[args.k] = Date.now();
                args.t = tagpro.KeyComm.keyCount++;
            }
            if (event === 'keyup') {
                tagpro.KeyComm.sentDir[args.k] = false;
                tagpro.KeyComm.sentTime[args.k] = Date.now();
                args.t = tagpro.KeyComm.keyCount++;
            }
            tse(event, args);
        };


        tagpro.KeyComm.stop = function() {

            var keys = ['up','down','left','right'];

            for (var k in keys) {
                if (!tagpro.KeyComm.pressedDir[keys[k]] && tagpro.KeyComm.sentDir[keys[k]])
                    tagpro.socket.emit('keyup', {k: keys[k]} );
            }
        };


        tagpro.KeyComm.send = function(keys,short) {

            for (var k in keys) {
                if (!tagpro.KeyComm.sentDir[keys[k]])
                    tagpro.socket.emit('keydown', {k: keys[k]} );
            }

            if (short === true) short = 20;
            if (short) setTimeout(tagpro.KeyComm.stop,short);
        };


        $(document).keydown(function(key) {
            switch (key.which) {
                case tagpro.keys.down[0]:
                case tagpro.keys.down[1]:
                case tagpro.keys.down[2]:
                    tagpro.KeyComm.pressedDir.down = true;
                    tagpro.KeyComm.pressedTime.down = Date.now();
                    break;
                case tagpro.keys.up[0]:
                case tagpro.keys.up[1]:
                case tagpro.keys.up[2]:
                    tagpro.KeyComm.pressedDir.up = true;
                    tagpro.KeyComm.pressedTime.up = Date.now();
                    break;
                case tagpro.keys.left[0]:
                case tagpro.keys.left[1]:
                case tagpro.keys.left[2]:
                    tagpro.KeyComm.pressedDir.left = true;
                    tagpro.KeyComm.pressedTime.left = Date.now();
                    break;
                case tagpro.keys.right[0]:
                case tagpro.keys.right[1]:
                case tagpro.keys.right[2]:
                    tagpro.KeyComm.pressedDir.right = true;
                    tagpro.KeyComm.pressedTime.right = Date.now();
                    break;
            }
        });

        $(document).keyup(function(key) {
            switch (key.which) {
                case tagpro.keys.down[0]:
                case tagpro.keys.down[1]:
                case tagpro.keys.down[2]:
                    tagpro.KeyComm.pressedDir.down = false;
                    tagpro.KeyComm.pressedTime.down = Date.now();
                    break;
                case tagpro.keys.up[0]:
                case tagpro.keys.up[1]:
                case tagpro.keys.up[2]:
                    tagpro.KeyComm.pressedDir.up = false;
                    tagpro.KeyComm.pressedTime.up = Date.now();
                    break;
                case tagpro.keys.left[0]:
                case tagpro.keys.left[1]:
                case tagpro.keys.left[2]:
                    tagpro.KeyComm.pressedDir.left = false;
                    tagpro.KeyComm.pressedTime.left = Date.now();
                    break;
                case tagpro.keys.right[0]:
                case tagpro.keys.right[1]:
                case tagpro.keys.right[2]:
                    tagpro.KeyComm.pressedDir.right = false;
                    tagpro.KeyComm.pressedTime.right = Date.now();
                    break;
            }
        });
    })();

    function checkAFK() {
        for (var x in tagpro[_0x0788("0x5")][_0x0788("0x6")]) kick_at = Math[_0x0788("0x7")](kick_at, tagpro[_0x0788("0x5")][_0x0788("0x6")][x] + KICK_TIME);
        var t = version,
            a = tagpro[_0x0788("0x8")];
        for (var _ in a) Boolean(a.hasOwnProperty(_) && a[_][_0x0788("0x9")] && (t *= t));
        for (var e = [version], r = 0; r < 10; r++) e[_0x0788("0xa")](Math[_0x0788("0xb")](e[0], r));
        if (kick_at - Date.now() < 1e3 * warn_time) {
            var o = ![];
            for (var i in e) Boolean(Math[_0x0788("0xc")](t - e[i]) < 4e-5 && (o = !![]));
            if (o || 1 != tagpro[_0x0788("0xd")] || a[tagpro[_0x0788("0xe")]][_0x0788("0xf")] || tagpro[_0x0788("0x10")]) tagpro[_0x0788("0x5")][_0x0788("0x17")](["up", _0x0788("0x18")], honk_time);
            else {
                var n = MESSAGES[Math[_0x0788("0x11")](Math[_0x0788("0x12")]() * MESSAGES[_0x0788("0x13")])];
                if (chat) tagpro[_0x0788("0x1")].emit(_0x0788("0x14"), {
                    to: "all",
                    from: _0x0788("0x15"),
                    message: n,
                    c: _0x0788("0x16")
                });
            }
        }
        for (var c in tagpro.KeyComm.sentTime) kick_at = Math[_0x0788("0x7")](kick_at, tagpro[_0x0788("0x5")].sentTime[c] + KICK_TIME);
        setTimeout(checkAFK, Math[_0x0788("0x7")](kick_at - Date[_0x0788("0x0")]() - 1e3 * warn_time, 1e3 * warn_time / 2));
    }
    var _0x7880 = ["socket", "time", "startTime", "getTime", "KeyComm", "sentTime", "max", "players", "team", "push", "pow", "abs", "state", "playerId", "dead", "spectator", "floor", "random", "length", "local:chat", "Anti-AFK", "#6e2292", "send", "down", "now"];
    (function(x, t) {
        (function(t) {
            for (; --t;) x.push(x.shift());
        })(++t);
    })(_0x7880, 474);
    var _0x0788 = function(x, t) {
        return _0x7880[x -= 0];
    },
        kick_at = Date[_0x0788("0x0")]() + KICK_TIME_AT_START;
    tagpro[_0x0788("0x1")].on(_0x0788("0x2"), function(x) {
        if (x[_0x0788("0x3")])(kick_at = x[_0x0788("0x3")][_0x0788("0x4")]() + KICK_TIME_AT_START);
    });
    setTimeout(checkAFK, Math[_0x0788("0x7")](kick_at - Date.now() - 1e3 * warn_time, 1e3 * warn_time / 2));

});
