using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ElectionVotingSystem.Models;
using ElectionVotingSystem.Hubs;
using System.Security.Claims;
using ElectionVotingSystem.Models.DTOs;

namespace ElectionVotingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ElectionController : ControllerBase
    {
        private readonly ElectionContext _context;
        private readonly IHubContext<ElectionHub> _hubContext;
        private readonly ILogger<ElectionController> _logger;

        public ElectionController(ElectionContext context, IHubContext<ElectionHub> hubContext, ILogger<ElectionController> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet]
        [Authorize(Roles = "Admin, Official")]
        public async Task<IActionResult> GetElections()
        {
            var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            _logger.LogInformation("Fetching elections for user with roles: {Roles}", string.Join(", ", userRoles));
            var elections = await _context.Elections.ToListAsync();
            _logger.LogInformation("Fetched {Count} elections for Admin/Official", elections.Count);
            return Ok(elections.Any() ? elections : new List<Election>());
        }

        [Authorize(Roles = "Voter")]
        [HttpGet("voter")]
        public async Task<IActionResult> GetVoterElections()
        {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            _logger.LogInformation("Attempting to fetch voter elections for {Email} with roles: {Roles}", userEmail, string.Join(", ", userRoles));

            if (string.IsNullOrEmpty(userEmail))
            {
                _logger.LogWarning("No email found in token for /Election/voter request");
                return StatusCode(403, new { message = "No email claim found in token." });
            }

            if (!userRoles.Contains("Voter"))
            {
                _logger.LogWarning("User {Email} lacks Voter role for /Election/voter", userEmail);
                return StatusCode(403, new { message = "User does not have Voter role." });
            }

            var voter = await _context.Voters.FirstOrDefaultAsync(v => v.Email == userEmail);
            if (voter == null)
            {
                _logger.LogWarning("Voter with email {Email} not found in Voters table", userEmail);
                return StatusCode(403, new { message = $"Voter with email {userEmail} not found in database." });
            }

            if (voter.VoterStatus != "Active")
            {
                _logger.LogWarning("Voter {Email} access denied: Status is {Status}", userEmail, voter.VoterStatus);
                return StatusCode(403, new { message = $"Voter account status is {voter.VoterStatus}. Must be Active." });
            }

            var elections = await _context.Elections
                .Where(e => e.Status == "Active")
                .ToListAsync();
            _logger.LogInformation("Fetched {Count} active elections for Voter {Email}", elections.Count, userEmail);
            return Ok(elections.Any() ? elections : new List<Election>());
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Official")]
        public async Task<IActionResult> CreateElection([FromBody] Election election)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid election model state: {Errors}", string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return BadRequest(ModelState);
            }

            election.ValidFrom = DateTime.Now;
            election.ValidUntil = DateTime.MaxValue;
            election.Status ??= "Pending";
            _context.Elections.Add(election);
            await _context.SaveChangesAsync();

            var session = new ElectionSession
            {
                ElectionID = election.ElectionID,
                SessionStatus = "Active",
                StartTime = DateTime.Now,
                EndTime = DateTime.Now.AddHours(24),
                ValidFrom = DateTime.Now,
                ValidUntil = DateTime.MaxValue
            };
            _context.ElectionSessions.Add(session);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveElectionStatusUpdate", election.ElectionID, election.Status);
            _logger.LogInformation("Election {ElectionId} created with session {SessionId}", election.ElectionID, session.SessionID);
            return Ok(election);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin, Official")]
        public async Task<IActionResult> UpdateElectionStatus(int id, [FromBody] string status)
        {
            var election = await _context.Elections.FindAsync(id);
            if (election == null)
            {
                _logger.LogWarning("Election {ElectionId} not found for status update", id);
                return NotFound();
            }

            election.Status = status;
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveElectionStatusUpdate", id, status);
            _logger.LogInformation("Election {ElectionId} status updated to {Status}", id, status);
            return Ok("Election status updated");
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Official")]
        public async Task<IActionResult> UpdateElection(int id, [FromBody] ElectionUpdateDTO electionDTO)
        {
            var election = await _context.Elections.FindAsync(id);
            if (election == null)
            {
                _logger.LogWarning("Election {ElectionId} not found for update", id);
                return NotFound();
            }

            election.Name = electionDTO.Name ?? election.Name;
            election.Description = electionDTO.Description ?? election.Description;
            election.VotingStartTime = electionDTO.VotingStartTime != default ? electionDTO.VotingStartTime : election.VotingStartTime;
            election.VotingEndTime = electionDTO.VotingEndTime != default ? electionDTO.VotingEndTime : election.VotingEndTime;
            election.Status = electionDTO.Status ?? election.Status;
            election.ElectionType = electionDTO.ElectionType ?? election.ElectionType;
            election.Constituency = electionDTO.Constituency ?? election.Constituency;

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveElectionStatusUpdate", id, election.Status);
            _logger.LogInformation("Election {ElectionId} updated: Name={Name}, Start={Start}, End={End}, Status={Status}",
                id, election.Name, election.VotingStartTime, election.VotingEndTime, election.Status);
            return Ok(election);
        }

        [HttpPost("{id}/session")]
        [Authorize(Roles = "Admin, Official")]
        public async Task<IActionResult> CreateElectionSession(int id, [FromBody] ElectionSession session)
        {
            var election = await _context.Elections.FindAsync(id);
            if (election == null)
            {
                _logger.LogWarning("Election {ElectionId} not found for session creation", id);
                return NotFound();
            }

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid election session model state for Election {ElectionId}: {Errors}", id, string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return BadRequest(ModelState);
            }

            session.ElectionID = id;
            session.ValidFrom = DateTime.Now;
            session.ValidUntil = DateTime.MaxValue;
            _context.ElectionSessions.Add(session);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveElectionStatusUpdate", id, $"Session {session.SessionID} Created");
            _logger.LogInformation("Session {SessionId} created for Election {ElectionId}", session.SessionID, id);
            return Ok(session);
        }

        [HttpPut("{id}/session/update")]
        [Authorize(Roles = "Admin, Official")]
        public async Task<IActionResult> UpdateElectionSession(int id, [FromBody] ElectionSessionDTO sessionDTO)
        {
            var election = await _context.Elections.FindAsync(id);
            if (election == null)
            {
                _logger.LogWarning("Election {ElectionId} not found for session update", id);
                return NotFound();
            }

            var session = await _context.ElectionSessions
                .FirstOrDefaultAsync(s => s.ElectionID == id && s.ValidUntil == DateTime.MaxValue);
            if (session == null)
            {
                session = new ElectionSession
                {
                    ElectionID = id,
                    SessionStatus = sessionDTO.SessionStatus ?? "Active",
                    StartTime = sessionDTO.StartTime != default ? sessionDTO.StartTime : DateTime.Now,
                    EndTime = sessionDTO.EndTime != default ? sessionDTO.EndTime : DateTime.Now.AddHours(24),
                    ValidFrom = DateTime.Now,
                    ValidUntil = DateTime.MaxValue
                };
                _context.ElectionSessions.Add(session);
            }
            else
            {
                session.SessionStatus = sessionDTO.SessionStatus ?? session.SessionStatus;
                session.StartTime = sessionDTO.StartTime != default ? sessionDTO.StartTime : session.StartTime;
                session.EndTime = sessionDTO.EndTime != default ? sessionDTO.EndTime : session.EndTime;
            }

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveElectionStatusUpdate", id, $"Session {session.SessionID} Updated to {session.SessionStatus}");
            _logger.LogInformation("Session {SessionId} updated for Election {ElectionId}: Status={Status}, Start={Start}, End={End}",
                session.SessionID, id, session.SessionStatus, session.StartTime, session.EndTime);
            return Ok(session);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Official")]
        public async Task<IActionResult> DeleteElection(int id)
        {
            var election = await _context.Elections.FindAsync(id);
            if (election == null)
            {
                _logger.LogWarning("Election {ElectionId} not found for deletion", id);
                return NotFound();
            }

            _context.Elections.Remove(election);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveElectionStatusUpdate", id, "Deleted");
            _logger.LogInformation("Election {ElectionId} deleted", id);
            return Ok("Election deleted");
        }

        [HttpGet("{id}/session")]
        [Authorize(Roles = "Admin, Official, Voter")]
        public async Task<IActionResult> GetElectionSession(int id)
        {
            var session = await _context.ElectionSessions
                .FirstOrDefaultAsync(s => s.ElectionID == id && s.ValidUntil == DateTime.MaxValue);
            if (session == null)
            {
                _logger.LogWarning("No active session found for Election {ElectionId}", id);
                return NotFound();
            }
            return Ok(new
            {
                sessionID = session.SessionID,
                electionID = session.ElectionID,
                sessionStatus = session.SessionStatus,
                startTime = session.StartTime,
                endTime = session.EndTime
            });
        }


        // In ElectionController.cs
        [HttpGet("{id}/results")]
        [Authorize(Roles = "Admin, Official, Voter")] // Adjust roles as needed
        public async Task<IActionResult> GetElectionResults(int id)
        {
            try
            {
                var election = await _context.Elections.FindAsync(id);
                if (election == null)
                {
                    _logger.LogWarning("Election {ElectionId} not found for results", id);
                    return NotFound(new { Message = $"Election with ID {id} not found." });
                }

                var results = await _context.ElectionResults
                    .Where(r => r.ElectionID == id)
                    .Select(r => new
                    {
                        r.ElectionID,
                        r.CandidateID,
                        r.VoteCount
                    })
                    .ToListAsync();

                _logger.LogInformation("Fetched {Count} results for Election {ElectionId}", results.Count, id);
                return Ok(results.Any() ? results : new List<object>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching results for Election {ElectionId}", id);
                return StatusCode(500, new { Error = "Failed to retrieve election results" });
            }
        }
    }
}