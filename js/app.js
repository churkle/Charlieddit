var app = angular.module('charlieddit', []);

app.controller('MainCtrl', ['$scope', function($scope){
		$scope.test = 'Hello world!';
		$scope.posts = [{title: 'post 1', upvotes: 5},
						{title: 'post 2', upvotes: 3},
						{title: 'post 3', upvotes: 2},
						{title: 'post 4', upvotes: 0},
						{title: 'post 5', upvotes: 23},
						{title: 'post 6', upvotes: 5}];
		$scope.addPost = function(myTitle){
			if($scope.title && $scope.title != '')
			{
				$scope.posts.push({title: $scope.title,
				link: $scope.link,
				upvotes: 0});
				
				$scope.title = '';
				$scope.link = '';
			}
		};
		$scope.incrementUpvotes = function(post){
			post.upvotes++;
		};
	}]);