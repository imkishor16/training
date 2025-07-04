    using Microsoft.AspNetCore.SignalR;

    using BloggingPlatform.Dto.Comment;
    using Microsoft.Extensions.Logging;
    using BloggingPlatform.Models.DTOs;

    namespace BloggingPlatform.Hubs
    {
        public class PostHub : Hub
        {
            private readonly ILogger<PostHub> _logger;

            public PostHub(ILogger<PostHub> logger)
            {
                _logger = logger;
            }

            public async Task BroadcastNewPost(CreatePostDto post)
            {
                try
                {
                    await Clients.All.SendAsync("ReceiveNewPost", post);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error broadcasting new post");
                    throw;
                }
            }

            public async Task BroadcastNewComment(CreateCommentDto comment)
            {
                try
                {
                    await Clients.All.SendAsync("ReceiveNewComment", comment);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error broadcasting new comment");
                    throw;
                }
            }

            public override async Task OnConnectedAsync()
            {
                _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
                await base.OnConnectedAsync();
            }

            public override async Task OnDisconnectedAsync(Exception? exception)
            {
                _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
                await base.OnDisconnectedAsync(exception);
            }
        }
    }
