namespace ElectionVotingSystem.Models.DTOs
{
    public class RegisterDTO
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
        public string? Role { get; set; }
        public string? NationalID { get; set; }
        public string? Email { get; set; }
    }
}