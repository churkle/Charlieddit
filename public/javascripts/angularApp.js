var app = angular.module('charlieddit', ['ui.router']);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

	    $stateProvider
	        .state('home', {
	            url: '/home',
	            templateUrl: '/home.html',
	            controller: 'MainCtrl'
	        })

	        .state('posts', {
	            url: '/posts/{id}',
	            templateUrl: '/posts.html',
	            controller: 'PostsCtrl'
	        })

	    $urlRouterProvider.otherwise('home');
	}])

app.controller('MainCtrl', [
	'$scope',
	'posts',
	function($scope, posts){
		$scope.test = 'Hello world!';
		$scope.posts = posts.posts;
		$scope.addPost = function(myTitle){
			if($scope.title && $scope.title !== '')
			{
				$scope.posts.push({
				title: $scope.title,
				link: $scope.link,
				upvotes: 0,
				comments: [
					{author: 'Joe', body: 'Cool Post!', upvotes:0},
					{author: 'Bob', body: 'I like it!!', upvotes:4},
					{author: 'Norm', body: 'Screw you', upvotes:23}
					]
				});

				$scope.title = '';
				$scope.link = '';
			}
		};
		$scope.incrementUpvotes = function(post){
			post.upvotes++;
		};
	}]);

app.controller('PostsCtrl', [
	'$scope',
	'$stateParams',
	'posts',
	function($scope, $stateParams, posts) {
		$scope.post = posts.posts[$stateParams.id];
		$scope.addComment = function() {
			if($scope.body === '')
			{
				return;
			}
			$scope.post.comments.push({
				body: $scope.body,
				author: 'user',
				upvotes: 0
			});
			scope.body = '';
		};
		$scope.incrementUpvotes = function(comment){
			comment.upvotes++;
		};
}]);

app.factory('posts', [function(){
	var o = {
		posts: []
	};
	return o;
}])