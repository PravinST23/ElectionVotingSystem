using System.ComponentModel.DataAnnotations;

namespace ElectionVotingSystem.Models
{
    public class VoterHistory
    {
        [Key]
        public int HistoryID { get; set; }
        public int VoterID { get; set; }
        public int ElectionID { get; set; }
        public DateTime VoteDate { get; set; }
        public Voter Voter { get; set; }
        public Election Election { get; set; }
    }
}