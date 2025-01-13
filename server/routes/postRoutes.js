const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Existing routes
router.post('/', postController.createPost);
router.get('/', postController.getPosts);
router.post('/:postId/like', postController.likePost);
router.post('/:postId/share', postController.sharePost);
router.post('/:postId/comment', postController.addComment);

// Additional necessary routes
router.get('/user/:userId', postController.getUserPosts);
router.get('/:postId', postController.getPostById);
router.delete('/:postId', postController.deletePost);

module.exports = router;
