const Post = require('../models/Post');

exports.createPost = async (req, res) => {
    try {
        const { 
            authorId, 
            authorName,
            studySession,
            photo,
            caption,
            location 
        } = req.body;

        // Validate required fields
        if (!authorId || !authorName || !studySession || !photo || !caption || !location) {
            return res.status(400).json({ 
                error: 'All fields are required' 
            });
        }

        if (!studySession.duration) {
            return res.status(400).json({ 
                error: 'Post can only be created after completing a study session' 
            });
        }

        const post = await Post.create({
            author: authorId,
            authorName,
            studySession: {
                settings: {
                    pomodoro: studySession.settings.pomodoro,
                    shortBreak: studySession.settings.shortBreak,
                    longBreak: studySession.settings.longBreak
                },
                duration: studySession.duration,
                completedAt: new Date()
            },
            content: {
                photo,
                caption,
                location
            },
            social: {
                likes: [],
                comments: [],
                shares: []
            }
        });

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('author', 'username');

        const total = await Post.countDocuments();

        res.json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Your existing likePost, sharePost, and addComment functions are correct

// Add these additional useful functions:

exports.getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10, page = 1 } = req.query;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ author: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Post.countDocuments({ author: userId });

        res.json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.author.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(postId);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId)
            .populate('author', 'username');

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        const post = await Post.findById(postId);
        const alreadyLiked = post.social.likes.some(like => 
            like.userId.toString() === userId
        );

        if (alreadyLiked) {
            await Post.findByIdAndUpdate(postId, {
                $pull: {
                    'social.likes': { userId }
                }
            });
        } else {
            await Post.findByIdAndUpdate(postId, {
                $push: {
                    'social.likes': { userId }
                }
            });
        }

        const updatedPost = await Post.findById(postId);
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.sharePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, caption } = req.body;

        const originalPost = await Post.findById(postId);
        if (!originalPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const sharedPost = await Post.create({
            author: userId,
            authorName: req.user.name,
            isShared: true,
            originalPost: postId,
            content: {
                caption: caption,
                location: originalPost.content.location,
                imageUrl: originalPost.content.imageUrl
            },
            studySession: originalPost.studySession
        });

        await Post.findByIdAndUpdate(postId, {
            $push: {
                'social.shares': {
                    userId,
                    sharedPostId: sharedPost._id
                }
            }
        });

        res.json(sharedPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, userName, text } = req.body;

        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $push: {
                    'social.comments': { userId, userName, text }
                }
            },
            { new: true }
        );
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

