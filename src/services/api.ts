import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from 'store';
import {
    User,
    Post,
    Comment,
    LoginRequest,
    RegisterRequest,
    OAuthLoginRequest,
    CreatePostRequest,
    CreateCommentRequest,
    VoteRequest,
    FollowRequest,
    PaginationParams,
    ApiResponse,
    PaginatedResponse,
    FeedResponse,
} from 'types';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5159/api';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: ['User', 'Post', 'Comment', 'Auth', 'Follow'],
  endpoints: (builder) => ({
    // Update login to return the direct response structure
    login: builder.mutation<{ user: User; token: string; sessionId: string }, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Update register to return the direct response structure
    register: builder.mutation<{ user: User; token: string; sessionId: string }, RegisterRequest>({
      query: (userData) => ({
        url: '/signup',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),

    oauthLogin: builder.mutation<{ user: User; token: string; sessionId: string }, OAuthLoginRequest>({
      query: (oauthData) => ({
        url: '/oauth/login',
        method: 'POST',
        body: oauthData,
      }),
      invalidatesTags: ['Auth'],
    }),

    getFeed: builder.query<FeedResponse, { page?: number; pageSize?: number }>({
      query: (params = {}) => ({
        url: '/feed',
        params: {
          page: params.page || 1,
          pageSize: params.pageSize || 20,
        },
      }),
      providesTags: ['Post'],
    }),

    createPost: builder.mutation<Post, CreatePostRequest>({
      query: (postData) => ({
        url: '/post',
        method: 'POST',
        body: postData,
      }),
      invalidatesTags: ['Post'],
    }),

    // Updated to use the new GET endpoint
    getComments: builder.query<Comment[], { postId: string }>({
      query: ({ postId }) => `/comment/${postId}`,
      providesTags: (result, error, { postId }) => [
        { type: 'Comment', id: postId },
        'Comment',
      ],
    }),

    createComment: builder.mutation<Comment, CreateCommentRequest>({
      query: ({ postId, content, parentCommentId }) => ({
        url: `/comment/${postId}`,
        method: 'POST',
        body: {
          content,
          postId,
          parentCommentId,
        },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Comment', id: postId },
        'Post', // Invalidate post to update comment count
      ],
    }),

    vote: builder.mutation<void, VoteRequest>({
      query: (voteData) => ({
        url: '/vote',
        method: 'POST',
        body: voteData,
      }),
      invalidatesTags: ['Post', 'Comment'],
    }),

    follow: builder.mutation<void, FollowRequest>({
      query: (followData) => ({
        url: '/follow',
        method: 'POST',
        body: followData,
      }),
      invalidatesTags: ['User', 'Follow'],
    }),

    logout: builder.mutation<{ sessionDuration: string }, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    getUser: builder.query<User, string>({
      query: (userId) => `/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    getUserPosts: builder.query<Post[], { userId: string; page?: number; pageSize?: number }>({
      query: ({ userId, page = 1, pageSize = 20 }) => ({
        url: `/posts/user/${userId}`,
        params: { page, pageSize },
      }),
      providesTags: (result, error, { userId }) => [
        { type: 'Post', id: `user-${userId}` },
        'Post',
      ],
    }),

    // New endpoint: Check follow status
    getFollowStatus: builder.query<{ isFollowing: boolean }, string>({
      query: (userId) => `/follow/status/${userId}`,
      providesTags: (result, error, userId) => [
        { type: 'Follow', id: userId },
      ],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useOauthLoginMutation,
  useLogoutMutation,
  useGetFeedQuery,
  useCreatePostMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useVoteMutation,
  useFollowMutation,
  useGetUserQuery,
  useGetUserPostsQuery,
  useGetFollowStatusQuery,
} = api;