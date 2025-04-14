using ElectionVotingSystem.Models.DTOs;
using System.Threading.Tasks;

namespace ElectionVotingSystem.Services
{
    public interface IAuthService
    {
        Task<string> Login(LoginDTO loginDTO);
        Task Register(RegisterDTO registerDTO, bool isPending = true);
        Task RegisterCandidate(CandidateDTO candidateDTO); // Added
        Task ApproveOfficial(int officialId);
    }
}