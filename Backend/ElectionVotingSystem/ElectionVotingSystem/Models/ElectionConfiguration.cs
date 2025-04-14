using System.ComponentModel.DataAnnotations;

namespace ElectionVotingSystem.Models
{
    public class ElectionConfiguration
    {
        [Key]
        public int ConfigID { get; set; }
        public int ElectionID { get; set; }
        public int MaxVotesPerVoter { get; set; }
        public bool AllowAnonymousVoting { get; set; }
        public DateTime VotingStartTime { get; set; }
        public DateTime VotingEndTime { get; set; }
        public Election Election { get; set; }
    }
}