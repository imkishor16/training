export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: Date;
  user?: User;
}

export interface Image {
  id: string;
  url: string;
  altText?: string;
  postId: string;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  postStatus: string;
  isDeleted: boolean;
  user?: User;
  comments?: Comment[];
  images?: Image[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PostListResponse {
  posts: Post[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface PostResponse {
  post: Post;
} 