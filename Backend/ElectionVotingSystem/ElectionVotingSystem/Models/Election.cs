using System.ComponentModel.DataAnnotations;

namespace ElectionVotingSystem.Models
{
    public class Election
    {
        [Key]
        public int ElectionID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime VotingStartTime { get; set; }
        public DateTime VotingEndTime { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
        public string Status { get; set; } = "Pending"; // Default value
        public string ElectionType { get; set; } // Added for National/State/Local distinction
        public string Constituency { get; set; } // Added for voter-specific area
    }
}