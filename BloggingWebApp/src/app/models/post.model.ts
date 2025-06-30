import { User } from './auth.model';

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
  content: string;
  status: string;
  isDeleted: boolean;
  post?: Post;
  user?: User;
}

export interface Image {
  id: string;
  postId: string;
  name: string;
  content: Blob;
  isDeleted: boolean;
  uploadedAt: Date;
  post?: Post;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  isLiked: boolean;
  user?: User;
  post?: Post;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  postStatus: string;
  isDeleted: boolean;
  createdAt: Date;
  user?: User;
  comments?: Comment[];
  images?: Image[];
  likes?: Like[];
}

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  userEmail: string;
  expires: Date;
  isRevoked: boolean;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  postStatus?: string;
  images?: File[] | FormData;
}

export interface CreatePostDto {
  title?: string;
  content?: string;
  postStatus?: string;
  images?: File[] | FormData;
}

export interface UpdateCommentDto {
  content?: string;
  status?: string;
}

export type PostListResponse = Post[];
export type PostResponse = Post;

// Add custom File interface to support imageName
export interface CustomFile extends File {
  imageName?: string;
}