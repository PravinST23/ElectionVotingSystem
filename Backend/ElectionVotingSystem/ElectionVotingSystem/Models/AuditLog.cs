using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace ElectionVotingSystem.Models
{
    public class AuditLog
    {
        [Key]
        public int AuditID { get; set; }

        // Changed to nullable string to allow null until set
        public string? UserId { get; set; }

        public string Action { get; set; } = string.Empty; // Default to empty string
        public string Details { get; set; } = string.Empty; // Default to empty string
        public DateTime Timestamp { get; set; } = DateTime.Now; // Default to current time

        // Changed to nullable navigation property
        public IdentityUser? User { get; set; }
    }
}