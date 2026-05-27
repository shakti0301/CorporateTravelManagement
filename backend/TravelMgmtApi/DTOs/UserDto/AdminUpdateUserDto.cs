namespace TravelMgmtApi.DTOs
{
    public class AdminUpdateUserDto
    {
        public string UserName { get; set; } = "";
        public string Email { get; set; } = "";
        public string? Password { get; set; }
        public int RoleId { get; set; }
        public int? DepartmentId { get; set; }
        public bool IsActive { get; set; }
    }
}