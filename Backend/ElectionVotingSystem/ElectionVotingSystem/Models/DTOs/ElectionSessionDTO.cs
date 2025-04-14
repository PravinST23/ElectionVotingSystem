namespace ElectionVotingSystem.Models.DTOs
{
    public class ElectionSessionDTO
    {
        public string SessionStatus { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }   
}
