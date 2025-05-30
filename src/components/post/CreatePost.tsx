import React, { useState } from 'react';
import {
    Card,
    CardContent,
    TextField,
    Button,
    Box,
    Avatar,
    Typography,
    Alert,
} from '@mui/material';
import { useAuth } from 'hooks';
import { useCreatePostMutation } from 'services/api';
import { generateAvatarUrl, getUserDisplayName } from 'utils/helpers';

const CreatePost: React.FC = () => {
    const { user } = useAuth();
    const [createPost, { isLoading }] = useCreatePostMutation();
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            setError('Post content cannot be empty');
            return;
        }

        if (content.length > 280) {
            setError('Post content cannot exceed 280 characters');
            return;
        }

        try {
            const result = await createPost({ content: content.trim() }).unwrap();
            console.log('Post created:', result);
            setContent('');
            setError('');
            // The feed will automatically refresh due to invalidated tags
        } catch (error: any) {
            console.error('Failed to create post:', error);
            setError(error.data?.message || 'Failed to create post. Please try again.');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContent(e.target.value);
        if (error) {
            setError('');
        }
    };

    if (!user) return null;

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar
                        src={user.avatar || generateAvatarUrl(getUserDisplayName(user))}
                        alt={getUserDisplayName(user)}
                    />

                    <Box sx={{ flex: 1 }}>
                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="What's happening?"
                                value={content}
                                onChange={handleInputChange}
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            border: 'none',
                                        },
                                    },
                                }}
                            />

                            {error && (
                                <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mt: 2,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color={content.length > 280 ? 'error' : 'text.secondary'}
                                >
                                    {content.length}/280
                                </Typography>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={!content.trim() || content.length > 280 || isLoading}
                                    sx={{ borderRadius: 20, px: 3 }}
                                >
                                    {isLoading ? 'Posting...' : 'Post'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CreatePost;
