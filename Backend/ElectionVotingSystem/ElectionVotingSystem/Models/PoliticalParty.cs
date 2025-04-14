using System.ComponentModel.DataAnnotations;

namespace ElectionVotingSystem.Models
{
    public class PoliticalParty
    {
        [Key]
        public int PartyID { get; set; }
        public string PartyName { get; set; }
        public string PartyLogo { get; set; }
        public string Description { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
    }
}