namespace ElectionVotingSystem.Models.DTOs
{
    public class RegisterOfficialDTO
    {
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? NationalID { get; set; }
        public string? Email { get; set; }
        public string? EmailConfirmation { get; set; }
        public string? MobileNumber { get; set; }
        public string? Password { get; set; }
        public bool? Consent { get; set; }
    }
}