using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ElectionVotingSystem.Models;
using ElectionVotingSystem.Models.DTOs;
using ElectionVotingSystem.Hubs;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace ElectionVotingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VoterController : ControllerBase
    {
        private readonly ElectionContext _context;
        private readonly IHubContext<ElectionHub> _hubContext;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly ILogger<VoterController> _logger;

        public VoterController(
            ElectionContext context,
            IHubContext<ElectionHub> hubContext,
            UserManager<IdentityUser> userManager,
            ILogger<VoterController> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet]
        public async Task<IActionResult> GetVoters()
        {
            _logger.LogInformation("Fetching all voters for Admin/Official");
            var voters = await _context.Voters.ToListAsync();
            _logger.LogInformation("Fetched {Count} voters", voters.Count);
            return Ok(voters);
        }

        [HttpPost]
        public async Task<IActionResult> AddVoter([FromBody] Voter voter)
        {
            if (string.IsNullOrWhiteSpace(voter.NationalID))
            {
                _logger.LogWarning("Attempt to add voter with empty NationalID");
                return BadRequest(new { Error = "NationalID is required and cannot be empty." });
            }

            if (await _context.Voters.AnyAsync(v => v.NationalID == voter.NationalID))
            {
                _logger.LogWarning("Voter with NationalID {NationalID} already exists", voter.NationalID);
                return BadRequest(new { Error = $"A voter with NationalID {voter.NationalID} already exists." });
            }

            voter.ValidFrom = DateTime.Now;
            voter.ValidUntil = DateTime.MaxValue;
            voter.Age = CalculateAge(voter.DateOfBirth ?? DateTime.MinValue);
            voter.VoterStatus = "Pending";
            _context.Voters.Add(voter);
            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Voter added: {VoterID}, NationalID: {NationalID}, Status: {Status}", voter.VoterID, voter.NationalID, voter.VoterStatus);
            }
            catch (DbUpdateException ex)
            {
                var errorMessage = ex.InnerException?.Message ?? ex.Message;
                _logger.LogError(ex, "Failed to save voter: {Error}", errorMessage);
                return StatusCode(500, new { Error = $"Failed to save voter: {errorMessage}" });
            }

            var verification = new VoterVerification
            {
                VoterID = voter.VoterID,
                VerificationMethod = "Email",
                Status = "Pending",
                VerificationTimestamp = DateTime.Now,
                ValidFrom = DateTime.Now,
                ValidUntil = DateTime.MaxValue
            };
            _context.VoterVerifications.Add(verification);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveVerificationUpdate", voter.VoterID, verification.Status);
            _logger.LogInformation("Voter verification created for VoterID: {VoterID}, Status: {Status}", voter.VoterID, verification.Status);
            return Ok(voter);
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> RegisterVoter([FromBody] VoterRegistrationDTO dto)
        {
            if (!dto.Consent)
            {
                _logger.LogWarning("Voter registration failed: Consent not provided");
                return BadRequest("Consent is required.");
            }
            if (dto.Email != dto.EmailConfirmation)
            {
                _logger.LogWarning("Voter registration failed: Email {Email} does not match confirmation {EmailConfirmation}", dto.Email, dto.EmailConfirmation);
                return BadRequest("Email and confirmation email do not match.");
            }

            if (await _context.Voters.AnyAsync(v => v.NationalID == dto.NationalID || v.Email == dto.Email))
            {
                _logger.LogWarning("Voter registration failed: Voter with NationalID {NationalID} or Email {Email} already exists", dto.NationalID, dto.Email);
                return BadRequest("Voter with this NationalID or Email already exists.");
            }

            var voter = new Voter
            {
                FirstName = dto.FirstName,
                MiddleName = dto.MiddleName,
                LastName = dto.LastName,
                Gender = dto.Gender,
                DateOfBirth = dto.DateOfBirth,
                Age = CalculateAge(dto.DateOfBirth),
                ParentName = dto.ParentName,
                MaritalStatus = dto.MaritalStatus,
                Address = dto.Address,
                Street = dto.Street,
                City = dto.City,
                District = dto.District,
                State = dto.State,
                PinCode = dto.PinCode,
                Email = dto.Email,
                MobileNumber = dto.MobileNumber,
                NationalID = dto.NationalID,
                VoterIDNumber = dto.VoterIDNumber,
                Constituency = dto.Constituency,
                VotingDistrict = dto.VotingDistrict,
                IsFirstTimeVoter = dto.IsFirstTimeVoter,
                VoterStatus = "Pending",
                ValidFrom = DateTime.Now,
                ValidUntil = DateTime.MaxValue
            };

            _context.Voters.Add(voter);
            await _context.SaveChangesAsync();

            var user = new IdentityUser { UserName = dto.Email, Email = dto.Email };
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                _logger.LogError("Failed to create IdentityUser for voter {Email}: {Errors}", dto.Email, string.Join(", ", result.Errors));
                return BadRequest(result.Errors);
            }

            await _userManager.AddToRoleAsync(user, "Voter");
            _logger.LogInformation("IdentityUser created and assigned Voter role for {Email}", dto.Email);

            var verification = new VoterVerification
            {
                VoterID = voter.VoterID,
                VerificationMethod = "Mobile",
                Status = "Pending",
                VerificationTimestamp = DateTime.Now,
                ValidFrom = DateTime.Now,
                ValidUntil = DateTime.MaxValue
            };
            _context.VoterVerifications.Add(verification);

            var audit = new AuditLog
            {
                UserId = user.Id,
                Action = "Voter Registered",
                Timestamp = DateTime.Now,
                Details = $"VoterID: {voter.VoterID}, Email: {voter.Email}, Status: Pending"
            };
            _context.AuditLogs.Add(audit);

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveVerificationUpdate", voter.VoterID, verification.Status);
            await _hubContext.Clients.Group("Admins").SendAsync("ReceiveAuditLogUpdate", audit.AuditID, audit.Action, audit.Details);
            _logger.LogInformation("Voter registered: VoterID: {VoterID}, Email: {Email}, Status: {Status}", voter.VoterID, voter.Email, voter.VoterStatus);

            return Ok(new { VoterID = voter.VoterID, Message = "Voter registered successfully. Awaiting admin approval." });
        }

        [HttpPut("{id}/verify")]
        public async Task<IActionResult> VerifyVoter(int id, [FromBody] string status)
        {
            var verification = await _context.VoterVerifications
                .FirstOrDefaultAsync(v => v.VoterID == id && v.ValidUntil == DateTime.MaxValue);
            if (verification == null)
            {
                _logger.LogWarning("Verification not found for VoterID: {VoterID}", id);
                return NotFound();
            }

            verification.Status = status;
            verification.VerificationTimestamp = DateTime.Now;
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveVerificationUpdate", id, status);
            _logger.LogInformation("Voter verification updated for VoterID: {VoterID}, Status: {Status}", id, status);
            return Ok("Voter verification updated");
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveVoter(int id)
        {
            var voter = await _context.Voters.FindAsync(id);
            if (voter == null)
            {
                _logger.LogWarning("Voter not found for approval: VoterID: {VoterID}", id);
                return NotFound();
            }
            if (voter.VoterStatus != "Pending")
            {
                _logger.LogWarning("Voter approval failed: VoterID: {VoterID} is not in Pending status, Current Status: {Status}", id, voter.VoterStatus);
                return BadRequest("Voter is not in Pending status.");
            }

            voter.VoterStatus = "Active";
            await _context.SaveChangesAsync();

            var identityUser = await _userManager.FindByEmailAsync(voter.Email);
            if (identityUser != null)
            {
                identityUser.EmailConfirmed = true;
                var result = await _userManager.UpdateAsync(identityUser);
                if (!result.Succeeded)
                {
                    _logger.LogError("Failed to update EmailConfirmed for voter {Email}: {Errors}", voter.Email, string.Join(", ", result.Errors));
                    return StatusCode(500, new { Error = "Failed to confirm email" });
                }
                _logger.LogInformation("Email confirmed for voter {Email}", voter.Email);
            }

            var audit = new AuditLog
            {
                UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                Action = "Voter Approved",
                Timestamp = DateTime.Now,
                Details = $"VoterID: {voter.VoterID}, Email: {voter.Email}"
            };
            _context.AuditLogs.Add(audit);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveApprovalUpdate", voter.VoterID, voter.VoterStatus);
            await _hubContext.Clients.Group("Admins").SendAsync("ReceiveAuditLogUpdate", audit.AuditID, audit.Action, audit.Details);
            _logger.LogInformation("Voter approved: VoterID: {VoterID}, Email: {Email}, Status: {Status}", voter.VoterID, voter.Email, voter.VoterStatus);

            return Ok("Voter approved successfully");
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentVoter()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value ??
                        User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;
            _logger.LogInformation("Received email claim: {Email}", email ?? "null");
            if (string.IsNullOrEmpty(email))
            {
                _logger.LogWarning("No email found in token for voter profile request");
                return Unauthorized("Email not found in token");
            }

            var voter = await _context.Voters
                .FirstOrDefaultAsync(v => v.Email == email && v.ValidUntil == DateTime.MaxValue);
            if (voter == null)
            {
                _logger.LogWarning("Voter profile not found for email: {Email}", email);
                return NotFound("Voter profile not found");
            }

            _logger.LogInformation("Fetched voter profile for email: {Email}, VoterID: {VoterID}, Status: {Status}", email, voter.VoterID, voter.VoterStatus);
            return Ok(new
            {
                voter.VoterID,
                voter.FirstName,
                voter.LastName,
                voter.Email,
                voter.MobileNumber,
                voter.Address,
                voter.Street,
                voter.City,
                voter.State,
                voter.PinCode,
                voter.DateOfBirth,
                voter.Constituency,
                voter.VotingDistrict,
                voter.VoterStatus,
                voter.NationalID
            });
        }

        [HttpGet("statistics")]
        [Authorize(Roles = "Admin, Official")]
        public async Task<IActionResult> GetVoterStatistics()
        {
            try
            {
                var eligibleVoters = await _context.Voters
                    .CountAsync(v => v.VoterStatus == "Active");

                var stats = new
                {
                    EligibleVoters = eligibleVoters,
                    ParliamentaryConstituencies = 543,
                    AssemblyConstituencies = 4120,
                    PollingStations = 1100000
                };

                _logger.LogInformation("Fetched voter statistics: {@Stats}", stats);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching voter statistics");
                return StatusCode(500, new { Error = "Failed to retrieve voter statistics" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Voter")]
        public async Task<IActionResult> UpdateVoter(int id, [FromBody] Voter updatedVoter)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value ??
                        User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;
            if (string.IsNullOrEmpty(email))
            {
                _logger.LogWarning("No email found in token for voter update request");
                return Unauthorized("Email not found in token");
            }

            if (updatedVoter == null)
            {
                _logger.LogWarning("No voter data provided in request body for VoterID: {VoterID}", id);
                return BadRequest("Voter data is required");
            }

            var existingVoter = await _context.Voters
                .FirstOrDefaultAsync(v => v.VoterID == id && v.Email == email && v.ValidUntil == DateTime.MaxValue);
            if (existingVoter == null)
            {
                _logger.LogWarning("Voter not found for update: VoterID: {VoterID}, Email: {Email}", id, email);
                return NotFound("Voter not found or you are not authorized to update this profile");
            }

            // Validation
            if (string.IsNullOrEmpty(updatedVoter.FirstName))
                return BadRequest("FirstName is required");
            if (string.IsNullOrEmpty(updatedVoter.LastName))
                return BadRequest("LastName is required");
            if (string.IsNullOrEmpty(updatedVoter.Email))
                return BadRequest("Email is required");
            if (updatedVoter.DateOfBirth == default(DateTime))
                return BadRequest("DateOfBirth is required");

            existingVoter.FirstName = updatedVoter.FirstName;
            existingVoter.LastName = updatedVoter.LastName;
            existingVoter.Email = updatedVoter.Email;
            existingVoter.MobileNumber = updatedVoter.MobileNumber;
            existingVoter.Address = updatedVoter.Address;
            existingVoter.Street = updatedVoter.Street ?? "";
            existingVoter.City = updatedVoter.City;
            existingVoter.State = updatedVoter.State;
            existingVoter.PinCode = updatedVoter.PinCode;
            existingVoter.DateOfBirth = updatedVoter.DateOfBirth;
            existingVoter.Age = CalculateAge(existingVoter.DateOfBirth);

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Voter updated: VoterID: {VoterID}, Email: {Email}", id, existingVoter.Email);

                var identityUser = await _userManager.FindByEmailAsync(email);
                if (identityUser != null && email != updatedVoter.Email)
                {
                    identityUser.Email = updatedVoter.Email;
                    identityUser.UserName = updatedVoter.Email;
                    var result = await _userManager.UpdateAsync(identityUser);
                    if (!result.Succeeded)
                    {
                        _logger.LogError("Failed to update IdentityUser email for {Email}: {Errors}", email, string.Join(", ", result.Errors));
                    }
                }

                return Ok(existingVoter);
            }
            catch (DbUpdateException ex)
            {
                var errorMessage = ex.InnerException?.Message ?? ex.Message;
                _logger.LogError(ex, "Failed to update voter: {Error}", errorMessage);
                return StatusCode(500, new { Error = $"Failed to update voter: {errorMessage}" });
            }
        }

        [HttpPut("{id}/password")]
        [Authorize(Roles = "Voter")]
        public async Task<IActionResult> UpdateVoterPassword(int id, [FromBody] PasswordUpdateDTO passwordUpdate)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value ??
                        User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;
            if (string.IsNullOrEmpty(email))
            {
                _logger.LogWarning("No email found in token for password update request, VoterID: {VoterID}", id);
                return Unauthorized("Email not found in token");
            }

            var voter = await _context.Voters
                .FirstOrDefaultAsync(v => v.VoterID == id && v.Email == email && v.ValidUntil == DateTime.MaxValue);
            if (voter == null)
            {
                _logger.LogWarning("Voter not found for password update: VoterID: {VoterID}, Email: {Email}", id, email);
                return NotFound("Voter not found or you are not authorized to update this password");
            }

            if (string.IsNullOrEmpty(passwordUpdate.CurrentPassword) || string.IsNullOrEmpty(passwordUpdate.NewPassword))
            {
                _logger.LogWarning("Invalid password update request for VoterID: {VoterID}, missing current or new password", id);
                return BadRequest("Current password and new password are required");
            }

            var identityUser = await _userManager.FindByEmailAsync(email);
            if (identityUser == null)
            {
                _logger.LogWarning("IdentityUser not found for email: {Email}", email);
                return NotFound("User account not found");
            }

            var changePasswordResult = await _userManager.ChangePasswordAsync(identityUser, passwordUpdate.CurrentPassword, passwordUpdate.NewPassword);
            if (!changePasswordResult.Succeeded)
            {
                var errors = string.Join(", ", changePasswordResult.Errors.Select(e => e.Description));
                _logger.LogWarning("Failed to update password for VoterID: {VoterID}, Email: {Email}, Errors: {Errors}", id, email, errors);
                return BadRequest(new { Errors = changePasswordResult.Errors.Select(e => e.Description) });
            }

            try
            {
                var audit = new AuditLog
                {
                    UserId = identityUser.Id,
                    Action = "Password Updated",
                    Timestamp = DateTime.Now,
                    Details = $"VoterID: {voter.VoterID}, Email: {voter.Email}"
                };
                _context.AuditLogs.Add(audit);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Password updated successfully for VoterID: {VoterID}, Email: {Email}", id, email);
                await _hubContext.Clients.Group("Admins").SendAsync("ReceiveAuditLogUpdate", audit.AuditID, audit.Action, audit.Details);

                return Ok(new { Message = "Password updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log audit for password update for VoterID: {VoterID}", id);
                return StatusCode(500, new { Error = "Password updated but failed to log the action" });
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

    public class PasswordUpdateDTO
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
}