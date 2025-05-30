import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Button,
    Card,
    CardContent,
    Container,
    Fab,
    Zoom,
    IconButton,
    Tooltip,
    Chip,
    Grow,
    Skeleton,
    LinearProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Refresh as RefreshIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useGetFeedQuery } from '../services/api';
import CreatePost from '../components/post/CreatePost';
import PostCard from '../components/post/PostCard';
import { Post } from '../types';

const Home: React.FC = () => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const [page, setPage] = useState(1);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const {
        data: feedData,
        isLoading,
        error,
        isFetching,
        refetch
    } = useGetFeedQuery(
        {
            page,
            pageSize: 20
        },
        {
            refetchOnMountOrArgChange: true
        }
    );

    // Accumulate posts when loading more
    useEffect(() => {
        if (feedData?.posts) {
            if (page === 1) {
                setAllPosts(feedData.posts);
            } else {
                // Prevent duplicates when loading more
                setAllPosts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newPosts = feedData.posts.filter(p => !existingIds.has(p.id));
                    return [...prev, ...newPosts];
                });
            }
        }
    }, [feedData, page]);

    // Handle scroll to show/hide scroll-to-top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.pageYOffset > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    };

    const handleScrollTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePostCreated = (newPost: Post) => {
        // Add the new post to the top of the feed
        setAllPosts(prev => [newPost, ...prev]);
        setShowCreatePost(false);
    };

    if (isLoading && page === 1) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width={200} height={60} />
                    <Skeleton variant="text" width={300} height={30} />
                </Box>
                {[1, 2, 3].map((item) => (
                    <Card key={item} sx={{ mb: 3, borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Skeleton variant="circular" width={48} height={48} />
                                <Box sx={{ ml: 2, flex: 1 }}>
                                    <Skeleton width="30%" />
                                    <Skeleton width="20%" />
                                </Box>
                            </Box>
                            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Skeleton width={80} height={32} sx={{ borderRadius: 2 }} />
                                <Skeleton width={80} height={32} sx={{ borderRadius: 2 }} />
                                <Skeleton width={80} height={32} sx={{ borderRadius: 2 }} />
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert
                    severity="error"
                    sx={{ borderRadius: 2 }}
                >
                    Failed to load feed. Please try again.
                </Alert>
            </Container>
        );
    }

    const hasMore = feedData?.hasMore || false;
    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pb: 4 }}>
            <Container maxWidth="md" sx={{ pt: { xs: 2, md: 4 } }}>
                {/* Progress bar for loading */}
                {isFetching && (
                    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200 }}>
                        <LinearProgress />
                    </Box>
                )}

                {/* Floating Action Button for Create Post */}
                {isAuthenticated && (
                    <Zoom in={!showCreatePost}>
                        <Fab
                            color="primary"
                            aria-label="create post"
                            sx={{
                                position: 'fixed',
                                bottom: { xs: 24, md: 32 },
                                right: { xs: 24, md: 32 },
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.35)',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                }
                            }}
                            onClick={() => setShowCreatePost(true)}
                        >
                            <AddIcon />
                        </Fab>
                    </Zoom>
                )}

                {/* Scroll to Top Button */}
                <Zoom in={showScrollTop}>
                    <Fab
                        size="small"
                        aria-label="scroll to top"
                        sx={{
                            position: 'fixed',
                            bottom: { xs: 96, md: 104 },
                            right: { xs: 24, md: 32 },
                            bgcolor: 'white',
                            color: 'primary.main',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            '&:hover': {
                                bgcolor: 'primary.main',
                                color: 'white',
                            }
                        }}
                        onClick={handleScrollTop}
                    >
                        <KeyboardArrowUpIcon />
                    </Fab>
                </Zoom>

                {/* Page Header */}
                <Grow in timeout={500}>
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Box>
                                <Typography
                                    variant="h3"
                                    component="h1"
                                    sx={{
                                        fontWeight: 800,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        mb: 1
                                    }}
                                >
                                    Your Feed
                                </Typography>
                                {isAuthenticated && (
                                    <Typography variant="h6" color="text.secondary" fontWeight={500}>
                                        {greeting()}, {user?.firstName || user?.username || 'User'}! 👋
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Grow>

                {/* Create Post Section */}
                {isAuthenticated && showCreatePost && (
                    <Grow in={showCreatePost}>
                        <Box sx={{ mb: 4 }}>
                            <CreatePost />
                        </Box>
                    </Grow>
                )}

                {/* Quick Create Post Card */}
                {isAuthenticated && !showCreatePost && (
                    <Grow in timeout={700}>
                        <Card
                            sx={{
                                mb: 4,
                                borderRadius: 3,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                background: 'white',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                }
                            }}
                            onClick={() => setShowCreatePost(true)}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                        }}
                                    >
                                        <AddIcon />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                            What's on your mind?
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Share your thoughts with the community
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            borderRadius: 3,
                                            px: 3,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                        }}
                                    >
                                        Create Post
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grow>
                )}

                {/* Empty State */}
                {allPosts.length === 0 && !isLoading ? (
                    <Grow in timeout={900}>
                        <Card
                            sx={{
                                textAlign: 'center',
                                py: 10,
                                background: 'white',
                                borderRadius: 3,
                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            }}
                        >
                            <CardContent>
                                <Box
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        margin: '0 auto 24px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                </Box>
                                <Typography variant="h4" gutterBottom fontWeight={700}>
                                    {isAuthenticated ? "Your feed is empty" : "Welcome to SkyPoint Social"}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                                    {isAuthenticated
                                        ? "Follow users and create posts to see content here!"
                                        : "Sign in to connect with friends and see what they're sharing"}
                                </Typography>
                                {!isAuthenticated && (
                                    <Button
                                        variant="contained"
                                        size="large"
                                        href="/login"
                                        sx={{
                                            borderRadius: 3,
                                            px: 6,
                                            py: 1.5,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                            textTransform: 'none',
                                        }}
                                    >
                                        Sign In to Get Started
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </Grow>
                ) : (
                    <>
                        {/* Posts Feed */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {allPosts.map((post, index) => (
                                <Grow in timeout={300 + Math.min(index * 50, 500)} key={post.id}>
                                    <Box>
                                        <PostCard post={post} />
                                    </Box>
                                </Grow>
                            ))}
                        </Box>

                        {/* Loading More Indicator */}
                        {isFetching && page > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        )}

                        {/* Load More Button */}
                        {hasMore && !isFetching && allPosts.length > 0 && (
                            <Grow in timeout={1000}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleLoadMore}
                                        disabled={isFetching}
                                        size="large"
                                        sx={{
                                            borderRadius: 3,
                                            px: 6,
                                            py: 1.5,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            textTransform: 'none',
                                            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.35)',
                                            }
                                        }}
                                    >
                                        Load More Posts
                                    </Button>
                                </Box>
                            </Grow>
                        )}

                        {/* End of Feed Message */}
                        {!hasMore && allPosts.length > 0 && (
                            <Grow in timeout={1000}>
                                <Card sx={{
                                    textAlign: 'center',
                                    mt: 6,
                                    p: 4,
                                    background: 'white',
                                    borderRadius: 3,
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                }}>
                                    <CardContent>
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                margin: '0 auto 16px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '2rem',
                                            }}
                                        >
                                            🎉
                                        </Box>
                                        <Typography variant="h5" fontWeight={700} gutterBottom>
                                            You're all caught up!
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Check back later for more updates from your network
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grow>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};

export default Home;