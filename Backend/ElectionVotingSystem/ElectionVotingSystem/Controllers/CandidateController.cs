using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ElectionVotingSystem.Models;
using ElectionVotingSystem.Hubs;
using ElectionVotingSystem.Services;
using ElectionVotingSystem.Models.DTOs;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace ElectionVotingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateController : ControllerBase
    {
        private readonly ElectionContext _context;
        private readonly IHubContext<ElectionHub> _hubContext;
        private readonly IAuthService _authService;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly ILogger<CandidateController> _logger;

        public CandidateController(
            ElectionContext context,
            IHubContext<ElectionHub> hubContext,
            IAuthService authService,
            UserManager<IdentityUser> userManager,
            ILogger<CandidateController> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
            _authService = authService ?? throw new ArgumentNullException(nameof(authService));
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Retrieves all candidates with their associated parties (Admin/Official only)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin, Official")]
        public async Task<IActionResult> GetCandidates()
        {
            try
            {
                _logger.LogInformation("Fetching all candidates for Admin/Official");
                var candidates = await _context.Candidates
                    .Include(c => c.Party)
                    .Include(c => c.Election)
                    .ToListAsync();
                _logger.LogInformation("Fetched {Count} candidates", candidates.Count);
                return Ok(candidates.Any() ? candidates : new List<Candidate>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching candidates");
                return StatusCode(500, new { Error = "Failed to retrieve candidates" });
            }
        }

        /// <summary>
        /// Retrieves candidates for active elections (Voter, Admin, Official)
        /// </summary>
        [HttpGet("voter")]
        [Authorize(Roles = "Admin, Official, Voter")]
        public async Task<IActionResult> GetVoterCandidates()
        {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            try
            {
                var userRoles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();
                _logger.LogInformation("Fetching candidates for user {Email} with roles: {Roles}", userEmail, string.Join(", ", userRoles));

                List<Candidate> candidates;

                if (userRoles.Contains("Admin") || userRoles.Contains("Official"))
                {
                    candidates = await _context.Candidates
                        .Include(c => c.Party)
                        .Include(c => c.Election)
                        .ToListAsync();
                    _logger.LogInformation("Admin/Official fetched {Count} candidates", candidates.Count);
                }
                else if (userRoles.Contains("Voter"))
                {
                    var voter = await _context.Voters.FirstOrDefaultAsync(v => v.Email == userEmail);
                    if (voter == null || voter.VoterStatus != "Active")
                    {
                        _logger.LogWarning("Voter {Email} access denied: Not found or status is {Status}", userEmail, voter?.VoterStatus);
                        return Forbid("Voter account is not active or not found.");
                    }

                    var now = DateTime.Now;
                    _logger.LogInformation("Current server time: {Time}", now);

                    // Fetch all elections for debugging
                    var allElections = await _context.Elections.ToListAsync();
                    _logger.LogInformation("Total elections in database: {Count}", allElections.Count);
                    foreach (var election in allElections)
                    {
                        _logger.LogInformation("Election {Id}: Name={Name}, Start={Start}, End={End}, Status={Status}",
                            election.ElectionID, election.Name, election.VotingStartTime, election.VotingEndTime, election.Status);
                    }

                    // Fetch active elections
                    var activeElections = await _context.Elections
                        .Where(e => e.Status == "Active" && e.VotingStartTime <= now && e.VotingEndTime >= now)
                        .ToListAsync();
                    var activeElectionIds = activeElections.Select(e => e.ElectionID).ToList();

                    _logger.LogInformation("Found {Count} active elections. Election IDs: {Ids}", activeElections.Count, string.Join(", ", activeElectionIds));
                    foreach (var election in activeElections)
                    {
                        _logger.LogInformation("Active Election {Id}: Name={Name}, Start={Start}, End={End}, Status={Status}",
                            election.ElectionID, election.Name, election.VotingStartTime, election.VotingEndTime, election.Status);
                    }

                    // Fetch candidates for active elections
                    candidates = await _context.Candidates
                        .Where(c => activeElectionIds.Contains(c.ElectionID))
                        .Include(c => c.Party)
                        .Include(c => c.Election)
                        .ToListAsync();

                    _logger.LogInformation("Voter {Email} fetched {Count} candidates for active elections", userEmail, candidates.Count);
                    if (candidates.Any())
                    {
                        foreach (var candidate in candidates)
                        {
                            _logger.LogInformation("Candidate {Id}: Name={Name}, ElectionID={ElectionId}, Party={Party}",
                                candidate.CandidateID, $"{candidate.FirstName} {candidate.LastName}", candidate.ElectionID, candidate.Party?.PartyName);
                        }
                    }
                    else
                    {
                        // Log all candidates for debugging
                        var allCandidates = await _context.Candidates.ToListAsync();
                        _logger.LogInformation("Total candidates in database: {Count}", allCandidates.Count);
                        foreach (var candidate in allCandidates)
                        {
                            _logger.LogInformation("Candidate {Id}: Name={Name}, ElectionID={ElectionId}",
                                candidate.CandidateID, $"{candidate.FirstName} {candidate.LastName}", candidate.ElectionID);
                        }
                        _logger.LogWarning("No candidates found for active elections. Active Election IDs: {Ids}", string.Join(", ", activeElectionIds));
                    }

                    if (!candidates.Any())
                    {
                        return Ok(new
                        {
                            Candidates = new List<Candidate>(),
                            Message = "No candidates found for active elections.",
                            ActiveElectionCount = activeElections.Count,
                            ActiveElectionIds = activeElectionIds,
                            CurrentTime = now,
                            TotalElectionsInDb = allElections.Count,
                            TotalCandidatesInDb = (await _context.Candidates.CountAsync())
                        });
                    }
                }
                else
                {
                    _logger.LogWarning("User {Email} has no valid role for accessing candidates", userEmail);
                    return Forbid("No valid role assigned.");
                }

                return Ok(candidates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching candidates for user {Email}", userEmail);
                return StatusCode(500, new { Error = "Failed to retrieve candidates", Details = ex.Message });
            }
        }

        /// <summary>
        /// Adds a new candidate to the system (Admin/Official only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin, Official")]
        public async Task<IActionResult> AddCandidate([FromBody] Candidate candidate)
        {
            try
            {
                if (candidate == null)
                {
                    _logger.LogWarning("Candidate data is null");
                    return BadRequest("Candidate data is required");
                }

                if (string.IsNullOrEmpty(candidate.FirstName) || string.IsNullOrEmpty(candidate.LastName))
                {
                    _logger.LogWarning("FirstName or LastName is missing");
                    return BadRequest("First name and last name are required");
                }

                if (candidate.PartyID <= 0 || candidate.ElectionID <= 0)
                {
                    _logger.LogWarning("Invalid PartyID or ElectionID: PartyID={PartyID}, ElectionID={ElectionID}", candidate.PartyID, candidate.ElectionID);
                    return BadRequest("Valid PartyID and ElectionID are required");
                }

                if (!await _context.PoliticalParties.AnyAsync(p => p.PartyID == candidate.PartyID))
                {
                    _logger.LogWarning("PartyID {PartyID} does not exist", candidate.PartyID);
                    return BadRequest("The specified PartyID does not exist.");
                }

                if (!await _context.Elections.AnyAsync(e => e.ElectionID == candidate.ElectionID))
                {
                    _logger.LogWarning("ElectionID {ElectionID} does not exist", candidate.ElectionID);
                    return BadRequest("The specified ElectionID does not exist.");
                }

                candidate.ValidFrom = candidate.ValidFrom == default ? DateTime.Now : candidate.ValidFrom;
                candidate.ValidUntil = candidate.ValidUntil == default ? DateTime.MaxValue : candidate.ValidUntil;

                candidate.Party = null;
                candidate.Election = null;

                _context.Candidates.Add(candidate);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Candidate added: {CandidateId}", candidate.CandidateID);
                await _hubContext.Clients.Group("Admins").SendAsync(
                    "ReceiveAuditLogUpdate",
                    0,
                    "Candidate Added",
                    $"CandidateID: {candidate.CandidateID}"
                );

                var createdCandidate = await _context.Candidates
                    .Include(c => c.Party)
                    .Include(c => c.Election)
                    .FirstOrDefaultAsync(c => c.CandidateID == candidate.CandidateID);

                return Ok(createdCandidate ?? candidate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding candidate");
                return StatusCode(500, new { Error = "Failed to add candidate" });
            }
        }

        /// <summary>
        /// Registers a new candidate using DTO (Admin/Official only)
        /// </summary>
        [HttpPost("register")]
        [Authorize(Roles = "Admin, Official")]
        public async Task<IActionResult> RegisterCandidate([FromBody] CandidateDTO candidateDTO)
        {
            try
            {
                if (candidateDTO == null)
                    return BadRequest("Candidate data is required");

                if (string.IsNullOrEmpty(candidateDTO.FirstName) || string.IsNullOrEmpty(candidateDTO.LastName))
                    return BadRequest("First name and last name are required");

                var candidate = new Candidate
                {
                    FirstName = candidateDTO.FirstName,
                    LastName = candidateDTO.LastName,
                    PartyID = candidateDTO.PartyID,
                    ElectionID = candidateDTO.ElectionID,
                    PhotoUrl = candidateDTO.PhotoUrl,
                    ValidFrom = DateTime.Now,
                    ValidUntil = DateTime.MaxValue
                };

                _context.Candidates.Add(candidate);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Candidate registered: {CandidateId}", candidate.CandidateID);
                await _hubContext.Clients.Group("Admins").SendAsync(
                    "ReceiveAuditLogUpdate",
                    0,
                    "Candidate Registered",
                    $"Name: {candidateDTO.FirstName} {candidateDTO.LastName}"
                );

                return Ok(new
                {
                    Message = "Candidate registered successfully.",
                    CandidateId = candidate.CandidateID
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering candidate");
                var errorMessage = ex.InnerException != null ? $"{ex.Message}: {ex.InnerException.Message}" : ex.Message;
                return BadRequest(new { Error = errorMessage });
            }
        }

        /// <summary>
        /// Registers a new election official (AllowAnonymous)
        /// </summary>
        [AllowAnonymous]
        [HttpPost("registerOfficial")]
        public async Task<IActionResult> RegisterOfficial([FromBody] RegisterOfficialDTO dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest("Official data is required");

                if (!(dto.Consent ?? false))
                    return BadRequest("Consent is required");

                if (dto.Email != dto.EmailConfirmation)
                    return BadRequest("Email and confirmation email do not match");

                if (await _context.Officials.AnyAsync(o => o.NationalID == dto.NationalID || o.Email == dto.Email))
                    return BadRequest("Official with this NationalID or Email already exists");

                var registerDTO = new RegisterDTO
                {
                    Username = dto.Email,
                    Email = dto.Email,
                    Password = dto.Password,
                    Role = "Official",
                    NationalID = dto.NationalID
                };

                await _authService.Register(registerDTO, true);

                var official = await _context.Officials.FirstOrDefaultAsync(o => o.Email == dto.Email);
                if (official == null)
                    return StatusCode(500, new { Error = "Failed to create official record" });

                var user = await _userManager.FindByEmailAsync(dto.Email);
                if (user == null)
                    return StatusCode(500, new { Error = "Failed to create user record" });

                var verification = new OfficialVerification
                {
                    OfficialID = official.OfficialID,
                    VerificationMethod = "Mobile",
                    Status = "Pending",
                    VerificationTimestamp = DateTime.Now,
                    ValidFrom = DateTime.Now,
                    ValidUntil = DateTime.MaxValue
                };
                _context.OfficialVerifications.Add(verification); // Corrected to use OfficialVerifications

                var audit = new AuditLog
                {
                    UserId = user.Id,
                    Action = "Official Registered",
                    Timestamp = DateTime.Now,
                    Details = $"OfficialID: {official.OfficialID}, Email: {official.Email}, Status: Pending"
                };
                _context.AuditLogs.Add(audit);

                await _context.SaveChangesAsync();

                await _hubContext.Clients.All.SendAsync("ReceiveVerificationUpdate", official.OfficialID, verification.Status);
                await _hubContext.Clients.Group("Admins").SendAsync("ReceiveAuditLogUpdate", audit.AuditID, audit.Action, audit.Details);

                _logger.LogInformation("Official registered: {OfficialId}", official.OfficialID);
                return Ok(new
                {
                    OfficialID = official.OfficialID,
                    Message = "Official registered successfully. Awaiting admin approval"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering official");
                return StatusCode(500, new { Error = "Failed to register official" });
            }
        }

        /// <summary>
        /// Approves an election official (Admin only)
        /// </summary>
        [HttpPut("{id}/approveOfficial")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveOfficial(int id)
        {
            try
            {
                await _authService.ApproveOfficial(id);

                var official = await _context.Officials.FindAsync(id);
                if (official == null)
                    return NotFound();

                var user = await _userManager.FindByEmailAsync(official.Email);
                if (user == null)
                    return StatusCode(500, new { Error = "User not found in AspNetUsers table" });

                if (!user.EmailConfirmed)
                {
                    user.EmailConfirmed = true;
                    var result = await _userManager.UpdateAsync(user);
                    if (!result.Succeeded)
                    {
                        _logger.LogError("Failed to update EmailConfirmed for user {Email}: {Errors}",
                            user.Email, string.Join(", ", result.Errors.Select(e => e.Description)));
                        return StatusCode(500, new { Error = "Failed to confirm email" });
                    }
                }

                var audit = new AuditLog
                {
                    UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                    Action = "Official Approved",
                    Timestamp = DateTime.Now,
                    Details = $"OfficialID: {official.OfficialID}, Email: {official.Email}, EmailConfirmed: true"
                };
                _context.AuditLogs.Add(audit);
                await _context.SaveChangesAsync();

                await _hubContext.Clients.All.SendAsync("ReceiveApprovalUpdate", official.OfficialID, official.OfficialStatus);
                await _hubContext.Clients.Group("Admins").SendAsync("ReceiveAuditLogUpdate", audit.AuditID, audit.Action, audit.Details);

                _logger.LogInformation("Official approved: {OfficialId}, EmailConfirmed set to true", official.OfficialID);
                return Ok("Official approved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving official");
                var errorMessage = ex.InnerException != null ? $"{ex.Message}: {ex.InnerException.Message}" : ex.Message;
                return BadRequest(new { Error = errorMessage });
            }
        }

        private int CalculateAge(DateTime? dob)
        {
            if (!dob.HasValue) return 0;
            var today = DateTime.Today;
            var age = today.Year - dob.Value.Year;
            if (dob.Value.Date > today.AddYears(-age)) age--;
            return age;
        }
    }
}