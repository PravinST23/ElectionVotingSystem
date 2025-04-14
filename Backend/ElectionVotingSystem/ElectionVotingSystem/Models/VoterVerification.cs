using System.ComponentModel.DataAnnotations;

namespace ElectionVotingSystem.Models
{
    public class VoterVerification
    {
        [Key]
        public int VerificationID { get; set; }
        public int VoterID { get; set; }
        public string VerificationMethod { get; set; } = "Email"; // Default value
        public string Status { get; set; } = "Pending"; // Default value
        public DateTime VerificationTimestamp { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
        public Voter Voter { get; set; }
    }
}