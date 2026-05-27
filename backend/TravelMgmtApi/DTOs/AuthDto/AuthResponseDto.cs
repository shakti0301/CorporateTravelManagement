using System.ComponentModel.DataAnnotations;
namespace TravelMgmtApi.DTOs
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public int? departmentId { get; set; }
    }
}