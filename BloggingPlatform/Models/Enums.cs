using System;

namespace BloggingPlatform.Models
{
    public enum UserRole
    {
        User,
        Moderator,
        Admin
    }

    public enum UserStatus
    {
        Active,
        Suspended,
        Banned
    }

    public enum PostStatus
    {
        Draft,
        Published,
        Hidden,
        Deleted
    }

    public enum ContentType
    {
        Post,
        Comment,
        User,
        Image
    }

    public enum ModerationStatus
    {
        Pending,
        Approved,
        Rejected,
        Flagged
    }

    public enum ModerationAction
    {
        Review,
        Approve,
        Reject,
        Flag,
        Delete
    }

    public enum ReactionType
    {
        Like,
        Unlike
    }

    public enum ModerationPriority
    {
        Low,
        Medium,
        High,
        Urgent
    }

    public enum CommentStatus
    {
        Approved,
        Pending,
        Rejected
    }

    public enum TargetType
    {
        Post,
        Comment,
        User
    }
} 