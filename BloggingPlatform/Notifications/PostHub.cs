using Microsoft.AspNetCore.SignalR;
using BloggingPlatform.Dto.Comment;

namespace BloggingPlatform.Hubs
{
public class PostHub : Hub
{
    public async Task BroadcastPost(CreateCommentDto post)
    {
        try
        {
            await Clients.All.SendAsync("ReceivePost", post);
        }
        catch (Exception ex)
        {
            Console.WriteLine("SignalR Hub Error: " + ex.Message);
        }
    }
}
}
