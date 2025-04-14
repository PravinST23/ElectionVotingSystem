using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ElectionVotingSystem.Models;
using ElectionVotingSystem.Hubs;

namespace ElectionVotingSystem.Controllers
{
    [Authorize(Roles = "Admin, Official")] // Applies to all methods unless overridden
    [Route("api/[controller]")]
    [ApiController]
    public class PoliticalPartyController : ControllerBase
    {
        private readonly ElectionContext _context;
        private readonly IHubContext<ElectionHub> _hubContext;

        public PoliticalPartyController(ElectionContext context, IHubContext<ElectionHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetParties()
        {
            var parties = await _context.PoliticalParties.ToListAsync();
            return Ok(parties);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Official")] // Allow both Admin and Official roles
        public async Task<IActionResult> AddParty([FromBody] PoliticalParty party)
        {
            if (await _context.PoliticalParties.AnyAsync(p => p.PartyName == party.PartyName))
                return BadRequest(new { Error = "Party name already exists." });

            party.ValidFrom = DateTime.Now;
            party.ValidUntil = DateTime.MaxValue;
            _context.PoliticalParties.Add(party);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.Group("Admins").SendAsync("ReceiveAuditLogUpdate", 0, "Party Added", $"PartyID: {party.PartyID}, Name: {party.PartyName}");
            return Ok(party);
        }
    }
}