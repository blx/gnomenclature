/*
 * Gnomenclature Project
 *
 * gn.js
 *
 * Copyright 2013 Benjamin Cook <bc@benlxc.ca>
 */

(function(gn, undefined) {
    
    var sesh = {
        correct: 0,
        answered: 0,
        past: []
    };
    
    var conf = {
        qmode: 'mixed',
        acids: true,
        peroxides: true,
        hydrates: true,
        multivalents: 'mixed'
    };
    
    var confdisplay = {
        qmodes: ['ntf', 'ftn', 'mixed'],
        multivalents: ['mixed', 'latin', 'iupac', 'off'],
        booleans: ['acids', 'peroxides', 'hydrates']
    };
    
    var checkAnswers = function(evt) {
        if (( userans = $.trim($('#gn-userinput').val()).replace(/(\s)+/g, ' ') )) {
            
            if (userans === '\\r' || userans === 'report') {
                toggleReport();
                updateChrome();
            }
            else {
                var correct = (jQuery.inArray(userans, gn.q.answer) > -1);
            
                sesh.past.push({
                    question: gn.q.question,
                    answer: gn.q.answer,
                    userAnswer: userans,
                    correct: correct,
                    repeat: checkAnswers.repeat
                });
            
                if (!correct && !checkAnswers.repeat) {
                    $('#gn-feedback').html('try again?');
                    $('#gn-q').addClass('incorrect');
                    checkAnswers.repeat++;
                }
                else {
                    $('#gn-feedback').html('');
                    $('#gn-q').removeClass('incorrect');
                    gn.q.newQuestion();
                    checkAnswers.repeat = 0;
                }
                
                if (correct) sesh.correct++;
                
                sesh.answered++;
                updateChrome();
            }
        }
        evt.preventDefault();
        evt.stopPropagation();
        return false;
    };
    
    var toggleReport = function() {
        gn.focus();
        updateReport();
        $('#gn-report').slideToggle(200);
    };
    
    var updateReport = function() {
        var tablelen = $('#gn-report-table tr').length;
        for (var i = tablelen, j = sesh.past.length; i < j; i++) {
            var p = sesh.past[i];
            
            $('#gn-report-table').append($('<tr/>').append(
                $('<td/>').html(formatFormula(p.question)),
                $('<td/>').html(formatFormula(p.userAnswer)).addClass(p.correct ? 'correct' : 'incorrect')));
        }
        return i - tablelen;  // number of elements added
    };
    
    var formatFormula = function(f) {
        // TODO: combine these two regexes so they're less ugly.
        return f.replace(/([\d]+)/g, '<sub>$1</sub>').replace(/ <sub>([\d]+)<\/sub>H/, ' $1H');
    }
    
    var updateChrome = function() {
        if ($('#gn-report').css('display') != 'none')
            updateReport();
//        $('#gn-sesh-q').html('q ' + (sesh.answered + 1));
        $('#gn-sesh-q').html("");
        $('#gn-sesh-pts').html(sesh.correct + '/' + sesh.answered);
        $('#gn-userinput').val('').focus();
    };
    
    var init = function(evt) {
        $('#hide-header span').click(gn.confpanel.hideConf).hover(function() {
            $('#gn-header').toggleClass("linkhover");
        });
        $('#gn-userinput').keypress(function() {
            $('#gn-header').slideUp(100);
        });
        $('#gn-sesh-pts').click(toggleReport);
        $('#gn-form').submit(checkAnswers);
        $('#gn-submit').css('display', 'none');
        checkAnswers.repeat = 0;
        gn.q.init();
        gn.confpanel.init();
        updateChrome();
    };
    
    gn.focus = function() {
        $('#gn-userinput').focus();
    };
    
    
    /**********  gn.confpanel  ***************************************************/
    (function(self, conf, confdisplay) {
            
        var changeConfUI = function(dnew, dcurrent) {
            $(dcurrent).removeClass("on");
            $(dnew).addClass("on");
        };
        
        // set up button mappings
        self.init = function() {    
            $.each(confdisplay.qmodes, function(i, qm) {
                $('#conf-qmode-'+qm).click(function() {
                    changeConfUI(this, '#conf-qmode-'+conf.qmode);
                    conf.qmode = qm;
                    gn.q.init();
                });
            });
            $.each(confdisplay.multivalents, function(i, mv) {
                $('#conf-multivalents-'+mv).click(function() {
                    changeConfUI(this, '#conf-multivalents-'+conf.multivalents);
                    conf.multivalents = mv;
                    gn.q.init();
                });
            });
        
            $.each(confdisplay.booleans, function(i, f) {
                $('#conf-'+f+'-on').click(function() {
                    changeConfUI(this, '#conf-'+f+'-off');
                    conf[f] = true;
                    gn.q.init();
                });
                $('#conf-'+f+'-off').click(function() {
                    changeConfUI(this, '#conf-'+f+'-on');
                    conf[f] = false;
                    gn.q.init();
                });
            });
            
            // draw initial config
            $('#conf-qmode-'+conf.qmode).addClass("on");
            $('#conf-multivalents-'+conf.multivalents).addClass("on");
            $.each(confdisplay.booleans, function(i, c) {
                $('#conf-' + c + (conf[c] ? '-on' : '-off')).addClass("on");
            });
            
            $('#gn-title').click(self.toggleConf);
        };
        
        self.hideConf = function() {
            $('#gn-header').slideUp(250);
            gn.focus();
        };
        
        self.toggleConf = function() {
            $('#gn-header').slideToggle(300);
            gn.focus();
        };
    })(gn.confpanel = gn.confpanel || {}, conf, confdisplay);
    
    
    /**********  gn.q  ***********************************************************/
    
    (function(self, conf) {

        var queue = [],
            refresh = true;
        
        self.init = function() {
            refresh = true;
            queue = [];
            self.question = '';
            self.answer = '';
            asyncRequestQuestions();
            gn.focus();
        };
        
        self.newQuestion = function() {
            if (queue.length > 1 && !refresh) queue.splice(0, 1);  // remove previous question

            self.question = queue[0].question;
            self.answer = queue[0].answer;
            
            if (queue.length < 4) asyncRequestQuestions();

            $('#gn-q').html(formatFormula(self.question));
        };
        
        var asyncRequestQuestions = function() {
            $.get('q?n=8&conf=' + encodeURIComponent(JSON.stringify(conf)), function(jsn) {
                var ql = queue.length;
                queue = queue.concat(jsn);
//                queue.push.apply(queue, jsn);
                if (!self.question) self.newQuestion();
                if (ql == 0) refresh = false;
            }, 'json');
        };
    })(gn.q = gn.q || {}, conf);
    
    $(init);
    
})(window.gn = window.gn || {});
