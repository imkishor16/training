using System;
using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Models.DTOs
{
    public class UpdateUserDto
    {
        public string Username { get; set; }
        public string Status { get; set; }
        public string Password { get; set; }

        // Admin-specific fields
        public string Role { get; set; }
        public bool? IsSuspended { get; set; }
        public string SuspensionReason { get; set; }
        public DateTime? SuspendedUntil { get; set; }
    }
}
