export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  followerCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  postCount?: number;
}

export interface Post {
  id: string;
  content: string;
  score: number;
  commentCount: number;
  createdAt: string;
  timeAgo: string;
  user: User;
  userVote?: number | null;  // null means no vote, 1 for upvote, -1 for downvote
}

export interface FeedResponse {
  posts: Post[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  timeAgo: string;
  user: User;
  postId: string;
  parentCommentId?: string | null;
  replies?: Comment[] | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface OAuthLoginRequest {
  provider: string;
  accessToken: string;
}

export interface CreatePostRequest {
  content: string;
}

export interface CreateCommentRequest {
  content: string;
  postId: string;
  parentCommentId?: string;
}

export interface VoteRequest {
  postId: string;
  voteType: number; // 1 for upvote, -1 for downvote
}

export interface FollowRequest {
  userId: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
