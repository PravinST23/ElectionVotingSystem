using System.ComponentModel.DataAnnotations;

namespace ElectionVotingSystem.Models
{
    public class User
    {
        [Key]
        public int UserID { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public string Role { get; set; }
        public int? VoterID { get; set; }
        public string Email { get; set; }
        public DateTime CreatedAt { get; set; }
        public Voter Voter { get; set; }
    }
}