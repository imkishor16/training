export interface User {
  id: string;
  username?: string;
  email: string;
  name?: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  postId: string;
  status: PostStatus;
  createdAt: Date;
  user?: {
    username: string;
    role?: string;
  };
  isEditing?: boolean;
  editContent?: string;
}

export interface Image {
  id: string;
  name: string;
  content: string;
  postId: string;
  createdAt: Date;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  isLiked: boolean;
  createdAt: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
  postStatus: PostStatus;
  createdAt: Date;
  updatedAt?: Date;
  user?: {
    username: string;
    name?: string;
    role?: string;
  };
  comments?: Comment[];
  images?: Image[];
  likesCount: number;
  isLikedByCurrentUser: boolean;
}

export type PostStatus = 'Published' | 'Draft' | 'Deleted' | 'Approved';

export interface UpdatePostDto {
  title?: string;
  content?: string;
  postStatus?: PostStatus;
  images?: File[];
}

export interface UpdateCommentDto {
  content?: string;
  status?: PostStatus;
}

export type PostListResponse = Post[];

export type PostResponse = Post;