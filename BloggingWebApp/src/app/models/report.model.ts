import { Post } from "./post.model";

export interface CreateReportDto {
  postId: string;
  userId: string;
  createdAt?: Date;
  category:string;
  content: string;
}

export interface Report {
  id: string;
  postId?: string;
  createdAt: Date;
  category:string;
  content: string;
  user?: {
    id: string;
    username: string;
    name: string;
  };
}
