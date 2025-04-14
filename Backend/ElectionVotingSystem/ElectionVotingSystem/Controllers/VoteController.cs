using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ElectionVotingSystem.Models;
using ElectionVotingSystem.Models.DTOs;
using ElectionVotingSystem.Hubs;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;

namespace ElectionVotingSystem.Controllers
{
    [Authorize(Roles = "Voter")]
    [Route("api/[controller]")]
    [ApiController]
    public class VoteController : ControllerBase
    {
        private readonly ElectionContext _context;
        private readonly IHubContext<ElectionHub> _hubContext;

        public VoteController(ElectionContext context, IHubContext<ElectionHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpPost]
        public async Task<IActionResult> CastVote([FromBody] VoteDTO voteDTO)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var voter = await _context.Voters.FindAsync(voteDTO.VoterID);
            if (voter == null || voter.VoterStatus != "Active")
                return BadRequest("Voter is not active or does not exist.");

            var activeSession = await _context.ElectionSessions
                .FirstOrDefaultAsync(s => s.ElectionID == voteDTO.ElectionID && s.SessionStatus == "Active" &&
                    s.StartTime <= DateTime.Now && s.EndTime >= DateTime.Now);
            if (activeSession == null)
                return BadRequest("No active election session available.");

            var vote = new Vote
            {
                VoterID = voteDTO.VoterID,
                CandidateID = voteDTO.CandidateID,
                ElectionID = voteDTO.ElectionID,
                VoteTime = DateTime.Now,
                ValidFrom = DateTime.Now,
                ValidUntil = DateTime.MaxValue
            };

            _context.Votes.Add(vote);

            var result = _context.ElectionResults
                .FirstOrDefault(r => r.ElectionID == voteDTO.ElectionID && r.CandidateID == voteDTO.CandidateID);
            if (result != null)
            {
                result.VoteCount++;
            }
            else
            {
                _context.ElectionResults.Add(new ElectionResult
                {
                    ElectionID = voteDTO.ElectionID,
                    CandidateID = voteDTO.CandidateID,
                    VoteCount = 1,
                    ValidFrom = DateTime.Now,
                    ValidUntil = DateTime.MaxValue
                });
            }

            await _context.SaveChangesAsync();

            var audit = new AuditLog
            {
                UserId = userId,
                Action = "Vote Cast",
                Timestamp = DateTime.Now,
                Details = $"VoterID: {vote.VoterID}, ElectionID: {vote.ElectionID}"
            };
            _context.AuditLogs.Add(audit);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveVoteUpdate", voteDTO.ElectionID, voteDTO.CandidateID, result?.VoteCount ?? 1);
            await _hubContext.Clients.Group("Admins").SendAsync("ReceiveAuditLogUpdate", audit.AuditID, audit.Action, audit.Details);

            return Ok("Vote cast successfully");
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetVotingHistory()
        {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                return StatusCode(403, new { message = "No email claim found in token." });
            }

            var voter = await _context.Voters
                .FirstOrDefaultAsync(v => v.Email == userEmail);
            if (voter == null)
            {
                return NotFound(new { message = $"Voter with email {userEmail} not found." });
            }

            var votingHistory = await _context.Votes
                .Where(v => v.VoterID == voter.VoterID)
                .Join(_context.ElectionSessions,
                    vote => vote.ElectionID,
                    session => session.ElectionID,
                    (vote, session) => new { vote, session })
                .Join(_context.Candidates,
                    vs => vs.vote.CandidateID,
                    candidate => candidate.CandidateID,
                    (vs, candidate) => new
                    {
                        VoteID = vs.vote.VoteID,
                        ElectionID = vs.session.ElectionID,
                        ElectionName = vs.session.Election.Name,
                        ElectionType = vs.session.Election.ElectionType ?? "Unknown",
                        CandidateVoted = $"{candidate.FirstName} {candidate.LastName}",
                        //PartyVoted = candidate.PartyName ?? "Independent",
                        VoteDate = vs.vote.VoteTime,
                        Constituency = vs.session.Election.Constituency ?? "N/A"
                    })
                .ToListAsync();

            if (!votingHistory.Any())
            {
                return Ok(new List<object>());
            }

            return Ok(votingHistory);
        }

        [HttpGet("voter/{voterId}/election/{electionId}")]
        public async Task<IActionResult> HasVoterVoted(int voterId, int electionId)
        {
            var vote = await _context.Votes
                .AnyAsync(v => v.VoterID == voterId && v.ElectionID == electionId);
            return Ok(new { hasVoted = vote });
        }
    }
}