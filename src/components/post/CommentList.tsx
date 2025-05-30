import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Avatar,
    Alert,
    Card,
    CardContent,
} from '@mui/material';
import { useAuth } from 'hooks';
import { useGetCommentsQuery, useCreateCommentMutation } from 'services/api';
import { generateAvatarUrl, getUserDisplayName, getUserHandle } from 'utils/helpers';
import { Comment } from 'types';

interface CommentListProps {
    postId: string;
}

const CommentItem: React.FC<{ comment: Comment; postId: string }> = ({ comment, postId }) => {
    const { user } = useAuth();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [createComment, { isLoading: isCreatingReply }] = useCreateCommentMutation();

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!replyContent.trim() || !user) return;

        try {
            await createComment({
                postId: postId,
                content: replyContent.trim(),
                parentCommentId: comment.id,
            }).unwrap();

            setReplyContent('');
            setShowReplyForm(false);
        } catch (error) {
            console.error('Failed to create reply:', error);
        }
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar
                    src={comment.user.avatar || generateAvatarUrl(getUserDisplayName(comment.user))}
                    alt={getUserDisplayName(comment.user)}
                    sx={{ width: 32, height: 32 }}
                />

                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {getUserDisplayName(comment.user)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            @{getUserHandle(comment.user)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            ·
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {comment.timeAgo || 'just now'}
                        </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                        {comment.content}
                    </Typography>

                    {user && (
                        <Button
                            size="small"
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            sx={{ textTransform: 'none', color: 'text.secondary', p: 0, minWidth: 'auto' }}
                        >
                            Reply
                        </Button>
                    )}

                    {/* Reply Form */}
                    {showReplyForm && (
                        <Box component="form" onSubmit={handleReplySubmit} sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                multiline
                                rows={2}
                                sx={{ mb: 1 }}
                            />
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setShowReplyForm(false);
                                        setReplyContent('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    type="submit"
                                    disabled={!replyContent.trim() || isCreatingReply}
                                >
                                    Reply
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* Nested Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <Box sx={{ mt: 2, ml: 2, borderLeft: '2px solid #e0e0e0', pl: 2 }}>
                            {comment.replies.map((reply) => (
                                <CommentItem key={reply.id} comment={reply} postId={postId} />
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

const CommentList: React.FC<CommentListProps> = ({ postId }) => {
    const { user } = useAuth();
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState<string>('');

    const {
        data: commentsData,
        isLoading: isLoadingComments,
        error: commentsError,
    } = useGetCommentsQuery({ postId });

    const [createComment, { isLoading: isCreatingComment }] = useCreateCommentMutation();

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newComment.trim() || !user) return;

        try {
            await createComment({
                postId,
                content: newComment.trim(),
                parentCommentId: undefined,
            }).unwrap();

            setNewComment('');
            setError('');
        } catch (error: any) {
            console.error('Failed to create comment:', error);
            setError(error.data?.message || 'Failed to create comment. Please try again.');
        }
    };

    if (isLoadingComments) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
            </Box>
        );
    }

    const comments = commentsData || [];

    return (
        <Box>
            {/* Create Comment Form */}
            {user && (
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar
                            src={user.avatar || generateAvatarUrl(getUserDisplayName(user))}
                            alt={getUserDisplayName(user)}
                            sx={{ width: 32, height: 32 }}
                        />

                        <Box sx={{ flex: 1 }}>
                            <Box component="form" onSubmit={handleSubmitComment}>
                                <TextField
                                    fullWidth
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={(e) => {
                                        setNewComment(e.target.value);
                                        if (error) setError('');
                                    }}
                                    multiline
                                    rows={2}
                                    size="small"
                                    sx={{ mb: 1 }}
                                />

                                {error && (
                                    <Alert severity="error" sx={{ mb: 1 }}>
                                        {error}
                                    </Alert>
                                )}

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="small"
                                        disabled={!newComment.trim() || isCreatingComment}
                                        sx={{ borderRadius: 20 }}
                                    >
                                        {isCreatingComment ? 'Posting...' : 'Comment'}
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    No comments yet. Be the first to comment!
                </Typography>
            ) : (
                <>
                    {comments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} postId={postId} />
                    ))}
                </>
            )}

            {commentsError && (
                <Alert severity="error">
                    Failed to load comments
                </Alert>
            )}
        </Box>
    );
};

export default CommentList;