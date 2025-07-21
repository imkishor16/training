namespace Models.DTO
{
    public class VideoDto
    {
        public int Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public DateTime UploadDate { get; set; }

        public string VideoUrl { get; set; } 
    }
}
