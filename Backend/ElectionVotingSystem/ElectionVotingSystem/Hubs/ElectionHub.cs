//using Microsoft.AspNetCore.SignalR;

//namespace ElectionVotingSystem.Hubs
//{
//    public class ElectionHub : Hub
//    {
//        public async Task SendVoteUpdate(int electionId, int candidateId, int voteCount)
//        {
//            await Clients.All.SendAsync("ReceiveVoteUpdate", electionId, candidateId, voteCount);
//        }

//        public async Task SendElectionStatusUpdate(int electionId, string status)
//        {
//            await Clients.All.SendAsync("ReceiveElectionStatusUpdate", electionId, status);
//        }

//        public async Task SendVerificationUpdate(int voterId, string status)
//        {
//            await Clients.All.SendAsync("ReceiveVerificationUpdate", voterId, status);
//        }

//        public async Task SendAuditLogUpdate(int auditId, string action, string details)
//        {
//            await Clients.Group("Admins").SendAsync("ReceiveAuditLogUpdate", auditId, action, details);
//        }

//        public async Task JoinAdminGroup()
//        {
//            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
//        }
//    }
//}
using ElectionVotingSystem.Hubs;
using ElectionVotingSystem.Models.DTOs;
using ElectionVotingSystem.Models;
using ElectionVotingSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace ElectionVotingSystem.Hubs
{
    public class ElectionHub : Hub
    {
        private readonly ILogger<ElectionHub> _logger;

        public ElectionHub(ILogger<ElectionHub> logger)
        {
            _logger = logger;
        }

        public async Task SendVoteUpdate(int electionId, int candidateId, int voteCount)
        {
            try
            {
                _logger.LogInformation("Sending vote update: Election {ElectionId}, Candidate {CandidateId}, Votes {VoteCount}",
                    electionId, candidateId, voteCount);
                await Clients.All.SendAsync("ReceiveVoteUpdate", electionId, candidateId, voteCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending vote update");
                throw;
            }
        }

        public async Task SendElectionStatusUpdate(int electionId, string status)
        {
            try
            {
                _logger.LogInformation("Sending election status update: Election {ElectionId}, Status {Status}",
                    electionId, status);
                await Clients.All.SendAsync("ReceiveElectionStatusUpdate", electionId, status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending election status update");
                throw;
            }
        }

        public async Task SendVerificationUpdate(int voterId, string status)
        {
            try
            {
                _logger.LogInformation("Sending verification update: Voter {VoterId}, Status {Status}",
                    voterId, status);
                await Clients.All.SendAsync("ReceiveVerificationUpdate", voterId, status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending verification update");
                throw;
            }
        }

        public async Task SendAuditLogUpdate(int auditId, string action, string details)
        {
            try
            {
                _logger.LogInformation("Sending audit log update: Audit {AuditId}, Action {Action}",
                    auditId, action);
                await Clients.Group("Admins").SendAsync("ReceiveAuditLogUpdate", auditId, action, details);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending audit log update");
                throw;
            }
        }

        public async Task JoinAdminGroup()
        {
            try
            {
                _logger.LogInformation("Adding connection {ConnectionId} to Admins group", Context.ConnectionId);
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding to admin group");
                throw;
            }
        }
    }
}