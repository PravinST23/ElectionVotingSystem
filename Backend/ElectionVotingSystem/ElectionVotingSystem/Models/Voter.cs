using System.ComponentModel.DataAnnotations;

namespace ElectionVotingSystem.Models
{
    public class Voter
    {
        [Key]
        public int VoterID { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Gender { get; set; }
        public DateTime? DateOfBirth { get; set; } // Made nullable
        public int Age { get; set; }
        public string ParentName { get; set; }
        public string MaritalStatus { get; set; }
        public string Address { get; set; }
        public string Street { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public string State { get; set; }
        public string PinCode { get; set; }
        public string Email { get; set; }
        public string MobileNumber { get; set; }
        public string NationalID { get; set; }
        public string VoterIDNumber { get; set; }
        public string Constituency { get; set; }
        public string VotingDistrict { get; set; }
        public bool IsFirstTimeVoter { get; set; }
        public string VoterStatus { get; set; } = "Inactive"; // Default value
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
    }
}