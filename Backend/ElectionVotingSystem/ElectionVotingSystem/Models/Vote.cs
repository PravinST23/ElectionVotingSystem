using System.ComponentModel.DataAnnotations;

namespace ElectionVotingSystem.Models
{
    public class Vote
    {
        [Key]
        public int VoteID { get; set; }
        public int VoterID { get; set; }
        public int CandidateID { get; set; }
        public int ElectionID { get; set; }
        public DateTime VoteTime { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
        public Voter Voter { get; set; }
        public Candidate Candidate { get; set; }
        public Election Election { get; set; }
    }
}