using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelMgmtApi.Models
{
    public class Department
    {
        [Key]
        public int DepartmentId { get; set; }
        [Required]
        [MaxLength(100)]
        public string DepartmentName { get; set; } = string.Empty;

        [ForeignKey("Manager")]
        public int? ManagerId { get; set;}
        public User? Manager {get; set;}
        
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}