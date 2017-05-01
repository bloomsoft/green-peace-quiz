var quizCtrl = function ($scope, $http, helper) {
    //Here you will define the name of the <questions.js> for your custom quiz and that file should be saved under data/ folder
    $scope.quizName = 'data/gpyourinterest1.js';
    $scope.catgratio = [];
    $scope.defaultConfig = {
        'allowBack': true,
        'allowReview': true,
        'autoMove': false,  
        'duration': 0,  
        'pageSize': 1,
        'requiredAll': false,  
        'richText': false,
        'shuffleQuestions': false,
        'shuffleOptions': false,
        'showClock': false,
        'showPager': true,
        'theme': 'none'
    }

    $scope.goTo = function (index) {
        if (index > 0 && index <= $scope.totalItems) {
            $scope.currentPage = index;
            $scope.mode = 'quiz';
        }
    }

    $scope.onSelect = function (question, option) {
        if (question.QuestionTypeId == 1) {
            question.Options.forEach(function (element, index, array) {
                if (element.Id != option.Id) {
                    element.Selected = false;
                    
                }
            });
        }

        if ($scope.config.autoMove == true && $scope.currentPage < $scope.totalItems)
            $scope.currentPage++;
    }

    $scope.onSubmit = function () {
        var answers = [];
        
        var prevcatgid = -1;
        $scope.questions.forEach(function (q, index) {
            q.Options.forEach(function (option, index, array) {
                var catgadded = false;
                $scope.catgratio.forEach(function (c, index) {
                    if (c.CategoryId == option.Category) {
                        $scope.catgratio.push({ 'CategoryId': option.Category, 'Answered': 0 });
                        catgadded = true;
                    }
                });

                if (catgadded == false) {
                    $scope.catgratio.push({ 'CategoryId': option.Category, 'Answered': 0 });
                }
                
            });
            
        });

        $scope.questions.forEach(function (q, index) {
            answers.push({ 'QuizId': $scope.quiz.Id, 'QuestionId': q.Id, 'Answered': q.Answered });

            q.Options.forEach(function (option, index, array) {
                if (helper.toBool(option.Selected)==true) {
                    $scope.catgratio.forEach(function (c, index) {
                        if (c.CategoryId == option.Category) {
                            c.Answered += 1;
                            
                        }
                    });
                }
            });

            
        });

        var catgwithmost = '';
        var catgcount = 0;
        $scope.catgratio.forEach(function (c, index) {
            if (c.Answered > catgcount) {
                catgcount = c.Answered;
                catgwithmost = c.CategoryId;
            }
            
        });

        console.log("Category with Most Answers: " + catgwithmost);
        console.log("Category with Most Answers Count: " + catgcount);

        $scope.mostansweredcatg = catgwithmost;
        $scope.mostansweredcatgcount = catgcount;

        console.log($scope.questions);
        $scope.mode = 'result';
    }

    $scope.pageCount = function () {
        return Math.ceil($scope.questions.length / $scope.itemsPerPage);
    };

    
    $scope.loadQuiz = function (file) {
        $http.get(file)
         .then(function (res) {
             $scope.quiz = res.data.quiz;
             $scope.config = helper.extend({}, $scope.defaultConfig, res.data.config);
             $scope.questions = $scope.config.shuffleQuestions ? helper.shuffle(res.data.questions) : res.data.questions;
             $scope.totalItems = $scope.questions.length;
             $scope.itemsPerPage = $scope.config.pageSize;
             $scope.currentPage = 1;
             $scope.mode = 'quiz';
             if($scope.config.shuffleOptions)
                $scope.shuffleOptions();

             $scope.$watch('currentPage + itemsPerPage', function () {
                 var begin = (($scope.currentPage - 1) * $scope.itemsPerPage),
                   end = begin + $scope.itemsPerPage;

                 $scope.filteredQuestions = $scope.questions.slice(begin, end);
             });
         });
    }
    
    $scope.shuffleOptions = function(){
        $scope.questions.forEach(function (question) {
           question.Options = helper.shuffle(question.Options);
        });
    }
    
    $scope.loadQuiz($scope.quizName);

    $scope.isAnswered = function (index) {
        var answered = 'Not Answered';
        $scope.questions[index].Options.forEach(function (element, index, array) {
            if (element.Selected == true) {
                answered = 'Answered';
                return false;
            }
        });
        return answered;
    };

    $scope.isCorrect = function (question) {
        var result = 'correct';
        question.Options.forEach(function (option, index, array) {
            if (helper.toBool(option.Selected) != option.IsAnswer) {
                result = 'wrong';
                return false;
            }
        });
        return result;
    };
}

quizCtrl.$inject = ['$scope', '$http', 'helperService'];
app.controller('quizCtrl', quizCtrl);
