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
        n: 9,
        acids: true,
        peroxides: true,
        hydrates: true
    };
    
    var checkAnswers = function(evt) {
        if (( userans = $.trim($('#gn-userinput').val()).replace(/(\s)+/g, ' ') )) {
            
            if (userans === '\\r') {
                showReport();
                updateChrome();
            } 
            else if (userans === '\\conf') {
                showConfig();
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
    
    var showConfig = function() {
        var modesdict = {
            'mixed': 'Mixed',
            'ntf': 'Name -> Formula',
            'ftn': 'Formula -> Name'
        };
        // edit: added conf structure to layout instead of having it recreated each time in js.
        $('#gn-config').css('display', 'block');
    };
    
    var updateChrome = function() {
        $('#gn-sesh-q').html('q ' + (sesh.answered + 1));
        $('#gn-sesh-pts').html('pts ' + sesh.correct + '/' + sesh.answered);
        $('#gn-userinput').val('').focus();
    };
    
    var init = function(evt) {
        $('#gn-form').submit(checkAnswers);
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
            asyncRequestQuestions();
        };
        
        self.newQuestion = function() {
            if (queue.length > 1) queue.splice(0, 1);

            self.question = queue[0].question;
            self.answer = queue[0].answer;
            
            if (queue.length < 4) asyncRequestQuestions();
            
            $('#gn-q').html(self.question.replace(/(\d)/g, '<sub>$1</sub>'));
        };
        
        var asyncRequestQuestions = function() {
            $.get('q?conf=' + encodeURIComponent(JSON.stringify(conf)), function(jsn) {
                queue.push.apply(queue, jsn);
                if (!self.question) self.newQuestion();
            }, 'json');
        };
    })(gn.q = gn.q || {}, conf); 
    
    $(init);
    
})(window.gn = window.gn || {});
