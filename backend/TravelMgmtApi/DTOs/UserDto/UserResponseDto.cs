namespace TravelMgmtApi.DTOs
{
    public class UserResponseDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = "";
        public string Email { get; set; } = "";
        public string Role { get; set; } = "";
        public int RoleId { get; set; }
        public string Department { get; set; } = "";
        public int? DepartmentId { get; set; }
        public string Status { get; set; } = "";
    }
}