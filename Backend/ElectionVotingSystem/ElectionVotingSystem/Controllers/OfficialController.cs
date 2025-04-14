using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ElectionVotingSystem.Models;

namespace ElectionVotingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OfficialController : ControllerBase
    {
        private readonly ElectionContext _context;

        public OfficialController(ElectionContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetOfficials()
        {
            var officials = await _context.Officials.ToListAsync();
            return Ok(officials);
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveOfficial(int id)
        {
            var official = await _context.Officials.FindAsync(id);
            if (official == null)
                return NotFound();

            if (official.OfficialStatus != "Pending")
                return BadRequest("Official is not in Pending status.");

            official.OfficialStatus = "Active";
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Official approved successfully.", OfficialId = id });
        }
    }
}