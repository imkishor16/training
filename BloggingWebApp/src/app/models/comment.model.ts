export interface CreateCommentDto {
  id?: string;
  content: string;
  postId: string;
  userId: string;
  parentCommentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  userId: string;
  parentCommentId?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    username: string;
    name: string;
  };
  replies?: Comment[];
} 