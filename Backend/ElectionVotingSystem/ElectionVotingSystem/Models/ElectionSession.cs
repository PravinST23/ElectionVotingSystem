using System.ComponentModel.DataAnnotations;

namespace ElectionVotingSystem.Models
{
    public class ElectionSession
    {
        [Key]
        public int SessionID { get; set; }
        public int ElectionID { get; set; }
        public string SessionStatus { get; set; } = "Pending"; // Default value
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
        public Election Election { get; set; }
    }
}