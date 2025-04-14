using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ElectionVotingSystem.Models;
using ElectionVotingSystem.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace ElectionVotingSystem.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly ElectionContext _context;
        private readonly ILogger<AuthService> _logger;

        public AuthService(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager, IConfiguration configuration, ElectionContext context, ILogger<AuthService> logger)
        {
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _roleManager = roleManager ?? throw new ArgumentNullException(nameof(roleManager));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<string> Login(LoginDTO loginDTO)
        {
            if (string.IsNullOrWhiteSpace(loginDTO.Username) || string.IsNullOrWhiteSpace(loginDTO.Password))
                throw new ArgumentException("Email and password are required.");

            var user = await _userManager.FindByEmailAsync(loginDTO.Username);
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDTO.Password))
            {
                _logger.LogWarning("Invalid credentials for {Username}", loginDTO.Username);
                throw new UnauthorizedAccessException("Invalid credentials");
            }

            var roles = await _userManager.GetRolesAsync(user);
            var isVoter = roles.Contains("Voter");
            var isOfficial = roles.Contains("Official");

            if (isVoter)
            {
                var voter = await _context.Voters.FirstOrDefaultAsync(v => v.Email == user.Email);
                if (voter != null && voter.VoterStatus != "Active")
                {
                    _logger.LogWarning("Voter {Email} login attempt failed: Status is {Status}", user.Email, voter.VoterStatus);
                    throw new UnauthorizedAccessException("Voter account is pending admin approval.");
                }
            }
            else if (isOfficial)
            {
                var official = await _context.Officials.FirstOrDefaultAsync(o => o.Email == user.Email);
                if (official != null && official.OfficialStatus != "Active")
                {
                    _logger.LogWarning("Official {Email} login attempt failed: Status is {Status}", user.Email, official.OfficialStatus);
                    throw new UnauthorizedAccessException("Official account is pending admin approval.");
                }
            }

            var token = GenerateJwtToken(user, roles);
            _logger.LogInformation("User {Email} logged in with roles: {Roles}. Token: {Token}", user.Email, string.Join(", ", roles), token.Substring(0, 20) + "...");
            return token;
        }

        public async Task Register(RegisterDTO registerDTO, bool isPending = true)
        {
            if (string.IsNullOrWhiteSpace(registerDTO.Username) || string.IsNullOrWhiteSpace(registerDTO.Email) || string.IsNullOrWhiteSpace(registerDTO.Password))
                throw new ArgumentException("Username, email, and password are required.");

            var validRoles = new[] { "Admin", "Official", "Voter" };
            if (!validRoles.Contains(registerDTO.Role))
                throw new ArgumentException($"Role must be one of: {string.Join(", ", validRoles)}");

            if (await _userManager.FindByEmailAsync(registerDTO.Email) != null)
                throw new InvalidOperationException("Email already registered.");
            if (await _userManager.FindByNameAsync(registerDTO.Username) != null)
                throw new InvalidOperationException("Username already taken.");

            var user = new IdentityUser
            {
                UserName = registerDTO.Username,
                Email = registerDTO.Email,
                EmailConfirmed = false
            };

            var result = await _userManager.CreateAsync(user, registerDTO.Password);
            if (!result.Succeeded)
            {
                _logger.LogError("User creation failed for {Email}: {Errors}", registerDTO.Email, string.Join(", ", result.Errors));
                throw new InvalidOperationException($"Registration failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            if (!await _roleManager.RoleExistsAsync(registerDTO.Role))
                await _roleManager.CreateAsync(new IdentityRole(registerDTO.Role));

            await _userManager.AddToRoleAsync(user, registerDTO.Role);

            if (registerDTO.Role == "Voter" && isPending)
            {
                if (await _context.Voters.AnyAsync(v => v.Email == registerDTO.Email))
                    throw new InvalidOperationException("A voter with this email already exists.");

                var voter = new Voter
                {
                    FirstName = registerDTO.Username.Split('.')[0],
                    MiddleName = "",
                    LastName = registerDTO.Username.Contains('.') ? registerDTO.Username.Split('.')[1] : "",
                    Gender = "Unknown",
                    DateOfBirth = null,
                    Age = 0,
                    ParentName = "Unknown",
                    MaritalStatus = "Unknown",
                    Address = "Unknown",
                    Street = "Unknown",
                    City = "Unknown",
                    District = "Unknown",
                    State = "Unknown",
                    PinCode = "000000",
                    Email = registerDTO.Email,
                    MobileNumber = "0000000000",
                    NationalID = registerDTO.NationalID ?? "Unknown",
                    VoterIDNumber = "Pending",
                    Constituency = "Unknown",
                    VotingDistrict = "Unknown",
                    IsFirstTimeVoter = false,
                    VoterStatus = "Pending",
                    ValidFrom = DateTime.Now,
                    ValidUntil = DateTime.MaxValue
                };
                try
                {
                    _context.Voters.Add(voter);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Voter registered: {Email}, Status: {Status}", voter.Email, voter.VoterStatus);
                }
                catch (Exception ex)
                {
                    var errorMessage = ex.InnerException != null ? ex.Message + ": " + ex.InnerException.Message : ex.Message;
                    _logger.LogError(ex, "Failed to save Voter entity: {Message}", errorMessage);
                    throw new InvalidOperationException("Failed to save voter: " + errorMessage, ex);
                }
            }
            else if (registerDTO.Role == "Official" && isPending)
            {
                if (await _context.Officials.AnyAsync(o => o.Email == registerDTO.Email))
                    throw new InvalidOperationException("An official with this email already exists.");

                var official = new Official
                {
                    FirstName = registerDTO.Username.Split('.')[0],
                    MiddleName = "",
                    LastName = registerDTO.Username.Contains('.') ? registerDTO.Username.Split('.')[1] : "",
                    Gender = "Unknown",
                    DateOfBirth = null,
                    Age = 0,
                    NationalID = registerDTO.NationalID ?? "Unknown",
                    Email = registerDTO.Email,
                    MobileNumber = "0000000000",
                    OfficialStatus = "Pending",
                    ValidFrom = DateTime.Now,
                    ValidUntil = DateTime.MaxValue
                };
                try
                {
                    _context.Officials.Add(official);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Official registered: {Email}, Status: {Status}", official.Email, official.OfficialStatus);
                }
                catch (Exception ex)
                {
                    var errorMessage = ex.InnerException != null ? ex.Message + ": " + ex.InnerException.Message : ex.Message;
                    _logger.LogError(ex, "Failed to save Official entity: {Message}", errorMessage);
                    throw new InvalidOperationException("Failed to save official: " + errorMessage, ex);
                }
            }
            else if (registerDTO.Role == "Official" && !isPending)
            {
                var defaultParty = await _context.PoliticalParties.FirstOrDefaultAsync();
                var defaultElection = await _context.Elections.FirstOrDefaultAsync();

                if (defaultParty == null || defaultElection == null)
                    throw new InvalidOperationException("No political party or election exists. Please seed the database or create a party manually.");

                var candidate = new Candidate
                {
                    FirstName = registerDTO.Username.Split('.')[0],
                    LastName = registerDTO.Username.Contains('.') ? registerDTO.Username.Split('.')[1] : "",
                    PartyID = defaultParty.PartyID,
                    ElectionID = defaultElection.ElectionID,
                    ValidFrom = DateTime.Now,
                    ValidUntil = DateTime.MaxValue
                };
                try
                {
                    _context.Candidates.Add(candidate);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Candidate registered: {FirstName} {LastName}", candidate.FirstName, candidate.LastName);
                }
                catch (Exception ex)
                {
                    var errorMessage = ex.InnerException != null ? ex.Message + ": " + ex.InnerException.Message : ex.Message;
                    _logger.LogError(ex, "Failed to save Candidate entity: {Message}", errorMessage);
                    throw new InvalidOperationException("Failed to save candidate: " + errorMessage, ex);
                }
            }

            var confirmationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            _logger.LogInformation("User {Email} registered with role: {Role}", user.Email, registerDTO.Role);
        }

        public async Task RegisterCandidate(CandidateDTO candidateDTO)
        {
            var candidate = new Candidate
            {
                FirstName = candidateDTO.FirstName,
                LastName = candidateDTO.LastName,
                PartyID = candidateDTO.PartyID,
                ElectionID = candidateDTO.ElectionID,
                ValidFrom = DateTime.Now,
                ValidUntil = DateTime.MaxValue
            };
            try
            {
                _context.Candidates.Add(candidate);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Candidate registered: {FirstName} {LastName}", candidate.FirstName, candidate.LastName);
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException != null ? ex.Message + ": " + ex.InnerException.Message : ex.Message;
                _logger.LogError(ex, "Failed to save Candidate entity: {Message}", errorMessage);
                throw new InvalidOperationException("Failed to save candidate: " + errorMessage, ex);
            }
        }

        public async Task ApproveOfficial(int officialId)
        {
            var official = await _context.Officials.FindAsync(officialId);
            if (official == null)
                throw new InvalidOperationException("Official not found.");

            if (official.OfficialStatus != "Pending")
                throw new InvalidOperationException("Official is not in Pending status.");

            official.OfficialStatus = "Active";
            await _context.SaveChangesAsync();

            var identityUser = await _userManager.FindByEmailAsync(official.Email);
            if (identityUser != null)
            {
                identityUser.EmailConfirmed = true;
                await _userManager.UpdateAsync(identityUser);
                _logger.LogInformation("Official {Email} approved and email confirmed", official.Email);
            }
        }

        public async Task ApproveVoter(int voterId)
        {
            var voter = await _context.Voters.FindAsync(voterId);
            if (voter == null)
                throw new InvalidOperationException("Voter not found.");

            if (voter.VoterStatus != "Pending")
                throw new InvalidOperationException("Voter is not in Pending status.");

            voter.VoterStatus = "Active";
            await _context.SaveChangesAsync();

            var identityUser = await _userManager.FindByEmailAsync(voter.Email);
            if (identityUser != null)
            {
                identityUser.EmailConfirmed = true;
                await _userManager.UpdateAsync(identityUser);
                _logger.LogInformation("Voter {Email} approved and email confirmed", voter.Email);
            }
        }

        private string GenerateJwtToken(IdentityUser user, IList<string> roles)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email)
            };
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing from configuration")));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer is missing from configuration"),
                audience: _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience is missing from configuration"),
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            _logger.LogInformation("JWT Token generated for user {Email} with roles: {Roles}", user.Email, string.Join(", ", roles));
            return tokenString;
        }
    }
}