using System.ComponentModel.DataAnnotations;

namespace ElectionVotingSystem.Models
{
    public class ElectionResult
    {
        [Key]
        public int ResultID { get; set; }
        public int ElectionID { get; set; }
        public int CandidateID { get; set; }
        public int VoteCount { get; set; } = 0; // Default value
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
        public Election Election { get; set; }
        public Candidate Candidate { get; set; }
    }
}
