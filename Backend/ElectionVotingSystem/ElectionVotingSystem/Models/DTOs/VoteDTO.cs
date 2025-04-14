namespace ElectionVotingSystem.Models.DTOs
{
    public class VoteDTO
    {
        public int VoterID { get; set; }
        public int CandidateID { get; set; }
        public int ElectionID { get; set; }
    }
}