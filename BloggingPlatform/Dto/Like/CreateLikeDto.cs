using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Dto.Like;

public class CreateLikeDto
{
        [Required]
        public Guid PostId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public bool IsLiked { get; set; } = false;



}