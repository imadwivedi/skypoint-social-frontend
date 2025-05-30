import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Avatar,
    Button,
    CircularProgress,
    Alert,
    Grow,
    Container,
    Chip,
} from '@mui/material';
import {
    Person as PersonIcon,
    // Group as GroupIcon, // GroupIcon was not used
    CheckCircle as CheckCircleIcon,
    PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useAuth } from 'hooks';
import {
    useGetUserQuery,
    useFollowMutation,
    useGetUserPostsQuery,
    useGetFollowStatusQuery,
} from 'services/api';
import { generateAvatarUrl, getUserDisplayName, getUserHandle } from 'utils/helpers';
import PostCard from 'components/post/PostCard';
import { Post } from 'types';

const Profile: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user: currentUser } = useAuth();
    const [page, setPage] = useState(1);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [hasMorePosts, setHasMorePosts] = useState(true);

    const targetUserId = userId || currentUser?.id;
    const isOwnProfile = targetUserId === currentUser?.id;

    const {
        data: userData,
        isLoading,
        error,
    } = useGetUserQuery(targetUserId!, {
        skip: !targetUserId,
    });

    const {
        data: postsData,
        isLoading: isLoadingPosts,
        isFetching: isFetchingPosts,
    } = useGetUserPostsQuery(
        { userId: targetUserId!, page, pageSize: 10 },
        { skip: !targetUserId }
    );

    // Check follow status
    const { data: followStatusData } = useGetFollowStatusQuery(targetUserId!, {
        skip: !targetUserId || isOwnProfile || !currentUser,
    });

    // Correctly extract the boolean value
    const actualIsFollowing = followStatusData?.isFollowing === true;

    const [followUser, { isLoading: isFollowingMutation }] = useFollowMutation();

    const user = userData;

    useEffect(() => {
        if (postsData && postsData.length > 0) {
            if (page === 1) {
                setAllPosts(postsData);
            } else {
                // Prevent duplicate posts when loading more
                setAllPosts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newPosts = postsData.filter(p => !existingIds.has(p.id));
                    return [...prev, ...newPosts];
                });
            }
            if (postsData.length < 10) {
                setHasMorePosts(false);
            }
        } else if (postsData && postsData.length === 0 && page > 1) { // Only set to false if not the first page and no posts
            setHasMorePosts(false);
        } else if (page === 1 && postsData?.length === 0) { // If first page and no posts, also no more posts
            setHasMorePosts(false);
        }
    }, [postsData, page]);

    useEffect(() => {
        setPage(1);
        setAllPosts([]);
        setHasMorePosts(true);
    }, [targetUserId]);

    const handleFollowToggle = async () => {
        if (!user || !currentUser) return;
        try {
            await followUser({ userId: user.id }).unwrap();
        } catch (error) {
            console.error('Failed to follow/unfollow user:', error);
        }
    };

    const handleLoadMore = () => {
        if (!isFetchingPosts) {
            setPage(prev => prev + 1);
        }
    };

    if (isLoading && !user) { // Show loading only if user data is not yet available
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !user) {
        return (
            <Container maxWidth="md" sx={{ mt: 3 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    Failed to load user profile. Please try again later.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 3, pb: 4 }}>
            <Grow in={true} timeout={500}>
                <Card
                    sx={{
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        overflow: 'hidden',
                        mb: 4,
                        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.3)',
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
                            <Avatar
                                src={user.avatar || generateAvatarUrl(getUserDisplayName(user))}
                                alt={getUserDisplayName(user)}
                                sx={{
                                    width: { xs: 80, sm: 100, md: 120 },
                                    height: { xs: 80, sm: 100, md: 120 },
                                    border: '4px solid rgba(255,255,255,0.3)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                }}
                            />
                            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                                <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                                    {getUserDisplayName(user)}
                                </Typography>
                                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                                    @{getUserHandle(user)}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3, md: 4 }, mb: 3, justifyContent: { xs: 'center', sm: 'flex-start' }, flexWrap: 'wrap' }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h5" fontWeight={700}>
                                            {user.postCount !== undefined ? user.postCount : (isLoadingPosts && page === 1 ? '...' : allPosts.length)}
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                            Posts
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h5" fontWeight={700}>
                                            {user.followersCount || 0}
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                            Followers
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h5" fontWeight={700}>
                                            {user.followingCount || 0}
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                            Following
                                        </Typography>
                                    </Box>
                                </Box>
                                {!isOwnProfile && currentUser && (
                                    <Button
                                        variant="contained"
                                        startIcon={actualIsFollowing ? <CheckCircleIcon /> : <PersonAddIcon />}
                                        onClick={handleFollowToggle}
                                        disabled={isFollowingMutation}
                                        sx={{
                                            bgcolor: actualIsFollowing ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
                                            color: actualIsFollowing ? 'primary.main' : 'white',
                                            borderRadius: 20,
                                            px: 3,
                                            py: 1,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            '&:hover': {
                                                bgcolor: actualIsFollowing ? 'white' : 'rgba(255,255,255,0.3)',
                                            },
                                        }}
                                    >
                                        {isFollowingMutation
                                            ? 'Loading...'
                                            : actualIsFollowing
                                                ? 'Following'
                                                : 'Follow'}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                        <Chip
                            icon={<PersonIcon />}
                            label={`Member since ${new Date(user.createdAt).toLocaleDateString()}`}
                            sx={{
                                mt: 3,
                                bgcolor: 'rgba(255,255,255,0.15)',
                                color: 'white',
                                p: 0.5,
                            }}
                        />
                    </CardContent>
                </Card>
            </Grow>

            <Box>
                <Typography variant="h5" gutterBottom fontWeight={700} sx={{ mb: 3, color: 'text.primary' }}>
                    {isOwnProfile ? 'Your Posts' : `${getUserDisplayName(user)}'s Posts`}
                </Typography>
                {isLoadingPosts && page === 1 && allPosts.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : allPosts.length === 0 && !isFetchingPosts ? (
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                        <CardContent sx={{ textAlign: 'center', py: { xs: 4, sm: 6 } }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {isOwnProfile ? "You haven't posted anything yet." : `${getUserDisplayName(user)} hasn't posted anything yet.`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isOwnProfile && "Start sharing your thoughts with the community!"}
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {allPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </Box>
                )}
                {isFetchingPosts && page > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
                        <CircularProgress />
                    </Box>
                )}
                {hasMorePosts && allPosts.length > 0 && !isFetchingPosts && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={handleLoadMore}
                            disabled={isFetchingPosts}
                            sx={{
                                borderRadius: 20,
                                px: 4,
                                py: 1,
                                fontWeight: 600,
                                textTransform: 'none',
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                '&:hover': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    borderColor: 'primary.main',
                                }
                            }}
                        >
                            Load More Posts
                        </Button>
                    </Box>
                )}
                {!hasMorePosts && allPosts.length > 0 && !isFetchingPosts && (
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4, mb: 2 }}>
                        You've reached the end of the posts.
                    </Typography>
                )}
            </Box>
        </Container>
    );
};

export default Profile;