using System.ComponentModel.DataAnnotations;
namespace TravelMgmtApi.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string UserName { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        public int RoleId { get; set; }

        public int? DepartmentId { get; set; }

        public int? ManagerId { get; set; }
    }
}