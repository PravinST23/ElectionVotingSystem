namespace ElectionVotingSystem.Models.DTOs
{
    public class CandidateDTO
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int PartyID { get; set; }
        public int ElectionID { get; set; }

        public string PhotoUrl { get; set; }
    }
}