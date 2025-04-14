using System.ComponentModel.DataAnnotations;

namespace ElectionVotingSystem.Models
{
    public class Official
    {
        [Key]
        public int OfficialID { get; set; }
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int Age { get; set; }
        public string? NationalID { get; set; }
        public string? Email { get; set; }
        public string? MobileNumber { get; set; }
        public string? OfficialStatus { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
    }
}