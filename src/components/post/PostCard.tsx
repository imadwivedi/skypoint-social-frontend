import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    Button,
    Avatar,
    Divider,
} from '@mui/material';
import {
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    Comment as CommentIcon,
    CheckCircle as CheckCircleIcon,
    PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'hooks';
import { useVoteMutation, useFollowMutation, useGetFollowStatusQuery } from 'services/api';
import { Post } from 'types';
import CommentList from './CommentList';
import { generateAvatarUrl, getUserDisplayName, getUserHandle } from 'utils/helpers';

interface PostCardProps {
    post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post: initialPost }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [voteApi] = useVoteMutation();
    const [followUser, { isLoading: isFollowingMutation }] = useFollowMutation();

    const [currentPost, setCurrentPost] = useState<Post>(initialPost);

    useEffect(() => {
        setCurrentPost(initialPost);
    }, [initialPost]);

    const { data: followStatusData } = useGetFollowStatusQuery(currentPost.user.id, {
        skip: !user || currentPost.user.id === user?.id,
    });

    const actualIsFollowing = followStatusData?.isFollowing === true;

    const handleVote = async (voteTypeClicked: 'upvote' | 'downvote') => {
        if (!user) {
            navigate('/login');
            return;
        }

        const originalPost = { ...currentPost };
        let newApiVoteType: 1 | -1;
        let optimisticUserVote: 0 | 1 | -1 = 0;
        let optimisticScoreChange = 0;

        if (voteTypeClicked === 'upvote') {
            if (currentPost.userVote === 1) {
                optimisticUserVote = 0;
                optimisticScoreChange = -1;
                newApiVoteType = 1;
            } else {
                optimisticUserVote = 1;
                optimisticScoreChange = 1;
                if (currentPost.userVote === -1) {
                    optimisticScoreChange += 1;
                }
                newApiVoteType = 1;
            }
        } else {
            if (currentPost.userVote === -1) {
                optimisticUserVote = 0;
                optimisticScoreChange = 1;
                newApiVoteType = -1;
            } else {
                optimisticUserVote = -1;
                optimisticScoreChange = -1;
                if (currentPost.userVote === 1) {
                    optimisticScoreChange -= 1;
                }
                newApiVoteType = -1;
            }
        }

        setCurrentPost(prev => ({
            ...prev,
            userVote: optimisticUserVote,
            score: prev.score + optimisticScoreChange,
        }));

        try {
            await voteApi({
                postId: currentPost.id,
                voteType: newApiVoteType,
            }).unwrap();
        } catch (error) {
            console.error('Vote failed, reverting optimistic update:', error);
            setCurrentPost(originalPost);
        }
    };

    const handleFollowToggle = async () => {
        if (!user || !currentPost.user) return;
        try {
            await followUser({ userId: currentPost.user.id }).unwrap();
        } catch (error) {
            console.error('Follow/unfollow failed:', error);
        }
    };

    const hasUpvoted = currentPost.userVote === 1;
    const hasDownvoted = currentPost.userVote === -1;

    return (
        <>
            <Card sx={{ mb: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    {/* User Info and Follow Button Section */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1.5 }}>
                        <Avatar
                            src={currentPost.user.avatar || generateAvatarUrl(getUserDisplayName(currentPost.user))}
                            alt={getUserDisplayName(currentPost.user)}
                            sx={{ cursor: 'pointer', width: 48, height: 48 }}
                            onClick={() => navigate(`/profile/${currentPost.user.id}`)}
                        />
                        <Box sx={{ flex: 1 }}> {/* Takes remaining space for user info and follow button */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box> {/* User Name, Handle, Time */}
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                        onClick={() => navigate(`/profile/${currentPost.user.id}`)}
                                    >
                                        {getUserDisplayName(currentPost.user)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" component="span">
                                        @{getUserHandle(currentPost.user)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" component="span" sx={{ mx: 0.5 }}>
                                        ·
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" component="span">
                                        {currentPost.timeAgo || 'just now'}
                                    </Typography>
                                </Box>

                                {/* Follow Button */}
                                {user && currentPost.user.id !== user.id && (
                                    <Button
                                        size="small"
                                        variant={actualIsFollowing ? 'contained' : 'outlined'}
                                        startIcon={actualIsFollowing ? <CheckCircleIcon /> : <PersonAddIcon />}
                                        onClick={handleFollowToggle}
                                        disabled={isFollowingMutation}
                                        sx={{
                                            borderRadius: 20,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            ml: 1, // Margin to separate from user info if they are close
                                            ...(actualIsFollowing && {
                                                bgcolor: 'success.main',
                                                color: 'white',
                                                '&:hover': { bgcolor: 'success.dark' },
                                            }),
                                            ...(!actualIsFollowing && {
                                                borderColor: 'primary.main',
                                                color: 'primary.main',
                                                '&:hover': { bgcolor: 'primary.main', color: 'white', borderColor: 'primary.main' },
                                            }),
                                        }}
                                    >
                                        {isFollowingMutation ? 'Loading...' : actualIsFollowing ? 'Following' : 'Follow'}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    {/* Post Content */}
                    <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap', color: 'text.primary', pl: { xs: 0, sm: '64px' } /* Align with text if avatar is 48 + 16 gap */ }}>
                        {currentPost.content}
                    </Typography>

                    {/* Action buttons: Votes (left) and Comments (right) */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, pl: { xs: 0, sm: '64px' } /* Align with text */ }}>
                        {/* Vote buttons */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton
                                size="small"
                                onClick={() => handleVote('upvote')}
                                color={hasUpvoted ? 'primary' : 'default'}
                                aria-label="upvote"
                            >
                                <ThumbUpIcon fontSize="small" />
                            </IconButton>
                            <Typography
                                variant="body2"
                                color={currentPost.score > 0 ? 'success.main' : currentPost.score < 0 ? 'error.main' : 'text.secondary'}
                                fontWeight="bold"
                                sx={{ minWidth: 20, textAlign: 'center' }}
                            >
                                {currentPost.score}
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => handleVote('downvote')}
                                color={hasDownvoted ? 'error' : 'default'}
                                aria-label="downvote"
                            >
                                <ThumbDownIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        {/* Comment button */}
                        <Button
                            size="small"
                            startIcon={<CommentIcon />}
                            onClick={() => setShowComments(!showComments)}
                            sx={{ color: 'text.secondary', textTransform: 'none' }}
                        >
                            {currentPost.commentCount || 0} {currentPost.commentCount === 1 ? 'Comment' : 'Comments'}
                        </Button>
                    </Box>
                </CardContent>

                {/* Comments section */}
                {showComments && (
                    <>
                        <Divider sx={{ mx: { xs: 2, md: 3 } }} />
                        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                            <CommentList postId={currentPost.id} />
                        </CardContent>
                    </>
                )}
            </Card>
        </>
    );
};

export default PostCard;