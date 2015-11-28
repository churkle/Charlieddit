var app = angular.module('charlieddit', ['ui.router']);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

	    $stateProvider
	        .state('home', {
	            url: '/home',
	            templateUrl: '/home.html',
	            controller: 'MainCtrl',
	            resolve: {
	            	postPromise: ['posts', function(posts){
	            		return posts.getAll();
	            	}]
	            }
	        })

	        .state('posts', {
	            url: '/posts/{id}',
	            templateUrl: '/posts.html',
	            controller: 'PostsCtrl',
	            resolve: {
	            	post: ['$stateParams', 'posts', function($stateParams, posts){
	            		return posts.get($stateParams.id);
	            	}]
	            }
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
				posts.create({
					title: $scope.title,
					link: $scope.link,
				});

				$scope.title = '';
				$scope.link = '';
			}
		};
		$scope.incrementUpvotes = function(post){
			posts.upvote(post);
		};
	}]);

app.controller('PostsCtrl', [
	'$scope',
	'posts',
	'post',
	function($scope, posts, post) {
		$scope.post = post;
		$scope.addComment = function() {
			if($scope.body === '')
			{
				return;
			}
			posts.addComment(post._id,
			{
				body: $scope.body,
				author: 'user',
				upvotes: 0
			}).success(function(data){
				post.comments.push(data);
			});
			scope.body = '';
		};
		$scope.incrementUpvotes = function(comment){
			posts.upvoteComment(post, comment);
		};
		$scope.delete = function(comment, index){
			posts.deleteComment(post, comment);
			post.comments.splice(index, 1);
		};
}]);

app.factory('posts', ['$http', function($http){
	var o = {
		posts: []
	};

	o.getAll = function(){
		return $http.get('/posts').success(function(data){
			angular.copy(data, o.posts);
		});
	};

	o.create = function(post){
		return $http.post('/posts', post).success(function(data){
			o.posts.push(data);
		});
	};

	o.addComment = function(id, comment){
		return $http.post('/posts/' + id +'/comments', comment);
	};

	o.upvote = function(post){
		return $http.put('/posts/' + post._id + '/upvote').success(function(data){
			post.upvotes += 1;
		});
	};

	o.upvoteComment = function(post, comment){
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote').success(function(data){
			comment.upvotes += 1;
		});
	};

	o.get = function(id){
		return $http.get('/posts/' + id).then(function(res){
			return res.data;
		});
	};

	o.deleteComment = function(post, comment){
		return $http.delete('/posts/' + post._id + '/comments/' + comment._id);
	};

	return o;
}])