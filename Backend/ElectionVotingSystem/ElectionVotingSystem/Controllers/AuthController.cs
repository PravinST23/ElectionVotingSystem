using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ElectionVotingSystem.Models.DTOs;
using ElectionVotingSystem.Services;

namespace ElectionVotingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService ?? throw new ArgumentNullException(nameof(authService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDTO)
        {
            try
            {
                _logger.LogInformation("Login attempt for {Username}", loginDTO.Username);
                var token = await _authService.Login(loginDTO);
                _logger.LogInformation("User {Username} logged in successfully. Token generated.", loginDTO.Username);
                return Ok(new { token });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Login failed for {Username}: {Message}", loginDTO.Username, ex.Message);
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login error for {Username}", loginDTO.Username);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDTO)
        {
            try
            {
                _logger.LogInformation("Registration attempt for {Username}", registerDTO.Username);
                await _authService.Register(registerDTO);
                _logger.LogInformation("User {Username} registered successfully.", registerDTO.Username);
                return Ok("User registered successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Registration error for {Username}", registerDTO.Username);
                return BadRequest(ex.Message);
            }
        }
    }
}