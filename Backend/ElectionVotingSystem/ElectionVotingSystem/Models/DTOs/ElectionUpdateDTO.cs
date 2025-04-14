namespace ElectionVotingSystem.Models.DTOs
{
    public class ElectionUpdateDTO
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime VotingStartTime { get; set; }
        public DateTime VotingEndTime { get; set; }
        public string Status { get; set; }
        public string ElectionType { get; set; }
        public string Constituency { get; set; }
    }
}