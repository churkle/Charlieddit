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

	        .state('login', {
	        	url: '/login',
	        	templateUrl: '/login.html',
	        	controller: 'AuthCtrl',
	        	onEnter: ['$state', 'auth', function($state, auth){
	        		if(auth.isLoggedIn())
	        		{
	        			$state.go('home');
	        		}
	        	}]
	        })

	        .state('register', {
	        	url: '/register', 
	        	templateUrl: '/register.html',
	        	controller: 'AuthCtrl',
	        	onEnter: ['$state', 'auth', function($state, auth){
	        		if(auth.isLoggedIn())
	        		{
	        			$state.go('home');
	        		}
	        	}]
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
		$scope.decrementUpvotes = function(post){
			posts.downvote(post);
		};
		$scope.getNumComments = function(post){
			return posts.getNumComments(post);
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
			$scope.body = '';
		};
		$scope.incrementUpvotes = function(comment){
			posts.upvoteComment(post, comment);
		};
		$scope.decrementUpvotes = function(comment){
			posts.downvoteComment(post, comment);
		};
		$scope.getNumComments = function(){
			return posts.getNumComments(post);
		}
		$scope.delete = function(comment, index){
			var r = confirm("Are you sure you want to delete this comment?");

			if(r == true)
			{
				posts.deleteComment(post, comment);
				var index = post.comments.indexOf(comment);
				post.comments.splice(index, 1);
			}
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

	o.downvote = function(post){
		return $http.put('/posts/' + post._id + '/downvote').success(function(data){
			post.upvotes -= 1;
		});
	};

	o.upvoteComment = function(post, comment){
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote').success(function(data){
			comment.upvotes += 1;
		});
	};

	o.downvoteComment = function(post, comment){
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/downvote').success(function(data){
			comment.upvotes -= 1;
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

	o.getNumComments = function(post){
		return post.comments.length;
	};

	return o;
}]);

.controller('AuthCtrl', [
	'$scope',
	'$state',
	'auth', 
	function($scope, $state, auth){
		$scope.user = {};

		$scope.register = function(){
			auth.register($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('home');
			});
		};

		$scope.logIn = function(){
			auth.logIn($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('home');
			});
		};
	}])

.factory('auth', ['$http', '$window', function($http, $window){
	var auth = {};

	auth.saveToken = function(token){
		$window.localStorage['charlieddit-token'] = token;
	};

	auth.getToken = function(){
		return $window.localStorage['charlieddit-token'];
	};

	auth.isLoggedIn = function(){
		var token = auth.getToken();

		if(token)
		{
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.exp > Date.now() / 1000;
		}
		else
		{
			return false;
		}
	};

	auth.currentUser = function(){
		if(auth.isLoggedIn())
		{
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	auth.register = function(user){
		return $http.post('/register', user).success(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.logOut = function(){
		$window.localStorage.removeItem('charlieddit-token');
	};

	return auth;
}]);