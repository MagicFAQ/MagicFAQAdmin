$(function() { magicfaq = (function() {

    var magicfaqAnswersContainer = $('#magicfaq-answers-container');
    // var magicfaqAskForm = $('#magicfaq-ask');
    var baseAPIPath = 'http://localhost:8080/MagicFAQ/v2/';
    var defaultQuestionsSubtitle = $('h3.magicfaq-subtitle.default-questions');
    var resultsSubtitle = $('h3.magicfaq-subtitle.results');
    var notFoundSubtitle = $('h3.magicfaq-subtitle.not-found');
    var notHelpfulPrompt = $('p.magicfaq-recommend-prompt.not-helpful');
    var notFoundPrompt = $('p.magicfaq-recommend-prompt.not-found');

    var getQuestionAsked = function() {
        return magicfaqAnswersContainer.data('question-asked');
    };

    var answerClickFunction = function(e) {
        e.preventDefault();
        $(this).blur();

        var listItem = $(this).parents('li');
        var answer = listItem.find('div.magicfaq-answer');

        if (listItem.hasClass('feedback-submitted') === false) {
            giveFeedback(listItem.data('question-id'), getQuestionAsked(), null);
        }
        listItem.addClass('feedback-submitted');

        if (listItem.hasClass('closed')) {
            answer.css('max-height', '300px').
            delay(500).

            queue(function(next) {
                answer.css('max-height', '100%');
                listItem.removeClass('closed').addClass('open');
                next();
            });
        } else {
            answer.css('display', 'none').
            css('max-height', '0').
            delay(600).
            queue(function(next) {
                answer.css('display', 'block');
                next();
            });
            listItem.removeClass('open').addClass('closed');
        }
    };

    var addQuestion = function(questionText, answer, id) {
        var questionItem = $('<li class="magicfaq closed" data-question-id="' + id + '">' +
            '<strong class="magicfaq-question" >' + questionText + '</strong>' +
            '<div class="magicfaq-answer"><p>' + answer + '</p>' +
            // '<div class="magicfaq-question-feedback"><p class="helpful-q">Helpful?</p>' +
            // '<p class="helpful-a"><a href="#" data-magnitude="5">Yes</a> - <a href="#" data-magnitude="1">Sort of</a> - <a href="#" data-magnitude="-2">No</a></p></div>' +
            '<hr></div></li>');

        questionItem.find('a.magicfaq-question').click(answerClickFunction);
        questionItem.appendTo('ul.magicfaq');

        questionItem.find('p.helpful-a a').click(function() {
            var a = $(this);
            // var magnitude = a.data('magnitude');
            // var questionId = a.closest('li').data('question-id');

            // a.closest('div.magicfaq-question-feedback').html('Thank you for your feedback!');
            // giveFeedback(questionId, getQuestionAsked(), magnitude);
            return false;
        });
    };

    var askQuestion = function(question) {

        var isBlankQuestion = (typeof question === 'undefined' || question === '');

        magicfaqAnswersContainer.data('question-asked', question.replace(/[^-\w\s]+$/, ''));

        defaultQuestionsSubtitle.hide();
        resultsSubtitle.hide();
        notFoundSubtitle.hide();
        // notHelpfulPrompt.hide();
        notFoundPrompt.hide();

        // if (!isBlankQuestion) {
        //     $('#magicfaq-recommend').show();
        //     $('#magicfaq-recommend-feedback').hide();
        //     $('#magicfaq-recommend input').val(question);
        // }

        magicfaqAnswersContainer.css('opacity', 0);

        $.ajax({
            url: MagicFAQ.baseURL + 'questions/',
            method: "GET",
            data: { question: question, url: window.location.href }
        }).success(function(msg) {
            msg = JSON.parse(msg);
            var questions = msg['questions'];

            if (questions.length ===0 ) {
                notFoundSubtitle.show();
                notFoundPrompt.show();
            }
            else if (isBlankQuestion) {
                defaultQuestionsSubtitle.show();
            } else {
                resultsSubtitle.show();
                // notHelpfulPrompt.show();
            }

            $('li.magicfaq').remove();

            for (var i = 0; i < questions.length; i++) {
                addQuestion(questions[i].question, questions[i].answer, questions[i].id);
            }

            magicfaqAnswersContainer.css('opacity', 1);
        });
    };
    //
    // var giveFeedback = function(questionId, question, magnitude) {
    //     $.ajax({
    //         url: baseAPIPath + 'feedback/',
    //         method: "POST",
    //         data: {
    //             'question_id': questionId,
    //             question: question,
    //             magnitude: magnitude,
    //             url: window.location.href
    //         }
    //     });
    //
    // };

    // $('#magicfaq-recommend button').click(function() {
    //     $('#magicfaq-recommend input').val('');
    //     $('#magicfaq-recommend').css('display', 'none');
    //     $('#magicfaq-recommend-feedback').css('display', 'block');
    // });

    askQuestion('');

    return {
        askQuestion: askQuestion,
    }
})()});
