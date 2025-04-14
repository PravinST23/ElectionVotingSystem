using System.ComponentModel.DataAnnotations;

namespace ElectionVotingSystem.Models
{
    public class Candidate
    {
        [Key]
        public int CandidateID { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int PartyID { get; set; }
        public int ElectionID { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
        public string PhotoUrl { get; set; }
        public PoliticalParty Party { get; set; }
        public Election Election { get; set; }
    }
}