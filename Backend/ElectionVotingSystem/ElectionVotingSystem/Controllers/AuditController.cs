using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ElectionVotingSystem.Models;

namespace ElectionVotingSystem.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class AuditController : ControllerBase
    {
        private readonly ElectionContext _context;

        public AuditController(ElectionContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAuditLogs()
        {
            var logs = await _context.AuditLogs
                .Include(a => a.User)
                .Select(a => new
                {
                    a.AuditID,
                    a.UserId,
                    a.Action,
                    a.Details,
                    a.Timestamp,
                    UserName = a.User != null ? a.User.UserName : null // Handle null explicitly
                })
                .ToListAsync();
            return Ok(logs);
        }
    }
}