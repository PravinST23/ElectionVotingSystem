using System.ComponentModel.DataAnnotations;

namespace ElectionVotingSystem.Models
{
    public class OfficialVerification
    {
        [Key]
        public int VerificationID { get; set; }
        public int OfficialID { get; set; }
        public string? VerificationMethod { get; set; }
        public string? Status { get; set; }
        public DateTime VerificationTimestamp { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
        public Official? Official { get; set; }
    }
}