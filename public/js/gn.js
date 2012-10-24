/*
 * Gnomenclature Project
 *
 * gn.js
 *
 * Copyright 2012 Benjamin Cook <bc@benlxc.ca>
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
        peroxides: true
    };
    
    var checkAnswers = function(evt) {
        if ((userans = $('#gn-userinput').val().trim().replace(/(\s)+/g, ' '))) {
            
//            conf.qmode = ( userans.match(/^\\c mode ([(on)|(off)])$/)[0]
            
            if (userans === '\\r') {
                showReport();
                updateChrome();
            }/*
            else if (userans === '\\conf') {
                showConfig();
                updateChrome();
            }
            else if (userans.match(/^\\c mode ([(on)|(off)])$/) {
                conf.qmode
            }
            else if (userans === '\\c peroxides on') {
                conf.peroxides = true;
                updateChrome();
            }
            else if (userans === '\\c peroxides off') {
                conf.peroxides = false;
                updateChrome();
            }
            else if (userans === '\\c acids on') {
                conf.acids = true;
                updateChrome();
            }
            else if (userans === '\\c acids off') {
                conf.acids = false;
                updateChrome();
            }*/
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
    
    var showConfig = function() {
/*        $('#gn-config').append($('<ul/>').append(
            $('<li/>').html(*/
    };
    
    var updateChrome = function() {
        $('#gn-sesh-q').html('q ' + (sesh.answered + 1));
        $('#gn-sesh-pts').html('pts ' + sesh.correct + '/' + sesh.answered);
        $('#gn-userinput').val('').focus();
    };
    
    var init = function(evt) {
        $('#gn-form').on('submit', checkAnswers);
        $('#gn-submit').css('display', 'none');
        checkAnswers.repeat = 0;
        gn.q.init();
        updateChrome();
    };
    
    
    /**********  gn.q  ***********************************************************/
    
    (function(self, conf, undefined) {
        self.question = '';
        self.answer = '';
        
        var queue = [];
        
        self.init = function() {
            asyncRequestQuestions(false, 9);  // synchronous request for init
        };
        
        self.newQuestion = function() {
            if (queue.length > 1) queue.splice(0, 1);

            self.question = queue[0].question;
            self.answer = queue[0].answer;
            
            if (queue.length < 4) asyncRequestQuestions();
            
            $('#gn-q').html(self.question.replace(/(\d)/g, '<sub>$1</sub>'));
        };
        
        var asyncRequestQuestions = function(async, num) {
            $.getJSON('q?n=' + ((typeof num === 'number') ? num : 7) + '&mode=' + conf.qmode,
                function(jsn) {
                    queue.push.apply(queue, jsn);
                    if (!self.question) self.newQuestion();
                }
            );
        };
    })(gn.q = gn.q || {}, conf); 
    
    $(init);
    
})(window.gn = window.gn || {});
