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
        hydrates: true
    };
    
    var confdisplay = {
        qmodes: ['ntf', 'ftn', 'mixed'],
        booleans: ['acids', 'peroxides', 'hydrates']
    };
    
    var checkAnswers = function(evt) {
        if (( userans = $.trim($('#gn-userinput').val()).replace(/(\s)+/g, ' ') )) {
            
            if (userans === '\\r') {
                showReport();
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
    
    var showReport = function() {
        for (var i = $('#gn-report tr').length, j = sesh.past.length; i < j; i++) {
            var p = sesh.past[i];
            
            $('#gn-report').append($('<tr/>').append(
                $('<td/>').html(p.question),
                $('<td/>').html(p.userAnswer).addClass(p.correct ? 'correct' : 'incorrect')));
        }
    };
    
    var updateChrome = function() {
        $('#gn-sesh-q').html('q ' + (sesh.answered + 1));
        $('#gn-sesh-pts').html(sesh.correct + '/' + sesh.answered);
        $('#gn-userinput').val('').focus();
    };
    
    var init = function(evt) {
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
            confdisplay.qmodes.map(function(qm) {
                $('#conf-qmode-'+qm).click(function() {
                    changeConfUI(this, '#conf-qmode-'+conf.qmode);
                    conf.qmode = qm;
                    gn.q.init();
                });
            });
        
            confdisplay.booleans.map(function(f) {
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
            confdisplay.booleans.map(function(c) {
                $('#conf-' + c + (conf[c] ? '-on' : '-off')).addClass("on");
            });
            
            $('#gn-title').click(function() {
                $('#gn-header').slideToggle(300);
                $('#gn-userinput').focus();
            });
        };
    })(gn.confpanel = gn.confpanel || {}, conf, confdisplay);
    
    
    /**********  gn.q  ***********************************************************/
    
    (function(self, conf, undefined) {

        var queue = [];
        
        self.init = function() {
            queue = [];
            self.question = '';
            self.answer = '';
            asyncRequestQuestions();
            gn.focus();
        };
        
        self.newQuestion = function() {
            if (queue.length > 1) queue.splice(0, 1);  // remove previous question

            self.question = queue[0].question;
            self.answer = queue[0].answer;
            
            if (queue.length < 4) asyncRequestQuestions();
            
            $('#gn-q').html(self.question.replace(/(\d)/g, '<sub>$1</sub>'));
        };
        
        var asyncRequestQuestions = function() {
            $.get('q?n=8&conf=' + encodeURIComponent(JSON.stringify(conf)), function(jsn) {
                queue.push.apply(queue, jsn);
                if (!self.question) self.newQuestion();
            }, 'json');
        };
    })(gn.q = gn.q || {}, conf); 
    
    $(init);
    
})(window.gn = window.gn || {});
