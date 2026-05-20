using Microsoft.EntityFrameworkCore;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Data
{
    public class AppDbContext : DbContext
    {
        //Constructor
        public AppDbContext(DbContextOptions<AppDbContext> options) : base (options){}

        //Tables
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Department> Departments { get; set; }

        public DbSet<TravelRequest> TravelRequests{ get; set; }
        public DbSet<TravelRequestApproval> TravelRequestApprovals { get; set; }

        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Reimbursement> Reimbursements { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
        base.OnModelCreating(modelBuilder);
            // User -> Role
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // User -> Department
            modelBuilder.Entity<User>()
                .HasOne(u => u.Department)
                .WithMany(d => d.Users)
                .HasForeignKey(u => u.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Self Referencing Relationship
            // Manager -> Employees
            modelBuilder.Entity<User>()
                .HasOne(u => u.Manager)
                .WithMany(m => m.Employees)
                .HasForeignKey(u => u.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Department -> Manager
            modelBuilder.Entity<Department>()
                .HasOne(d => d.Manager)
                .WithMany()
                .HasForeignKey(d => d.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Role>().HasData(

                new Role
                {
                    RoleId = 1,
                    Name = "Admin"
                },

                new Role
                {
                    RoleId = 2,
                    Name = "Employee"
                },

                new Role
                {
                    RoleId = 3,
                    Name = "Manager"
                },

                new Role
                {
                    RoleId = 4,
                    Name = "Finance"
                },

                new Role
                {
                    RoleId = 5,
                    Name = "ProjectManager"
                }
            );
            modelBuilder.Entity<Department>().HasData(
                new Department
                {
                    DepartmentId = 1,
                    DepartmentName = ".NET"
                },

                new Department
                {
                    DepartmentId = 2,
                    DepartmentName = "Java"
                },

                new Department
                {
                    DepartmentId = 3,
                    DepartmentName = "QA"
                },

                new Department
                {
                    DepartmentId = 4,
                    DepartmentName = "AI"
                }
            );

            //Travel Request Relationships
            modelBuilder.Entity<TravelRequest>()
                .HasOne(tr => tr.Employee)
                .WithMany()
                .HasForeignKey(tr => tr.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<TravelRequest>()
                .HasOne(tr => tr.ProjectManager)
                .WithMany()
                .HasForeignKey(tr => tr.ProjectManagerId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<TravelRequest>()
                .HasOne(tr => tr.Manager)
                .WithMany()
                .HasForeignKey(tr => tr.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<TravelRequest>()
                .HasOne(tr => tr.Finance)
                .WithMany()
                .HasForeignKey(tr => tr.FinanceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure TravelRequestApproval relationships
            modelBuilder.Entity<TravelRequestApproval>()
                .HasOne(tra => tra.TravelRequest)
                .WithMany(tr => tr.Approvals)
                .HasForeignKey(tra => tra.TravelRequestId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<TravelRequestApproval>()
                .HasOne(tra => tra.Approver)
                .WithMany()
                .HasForeignKey(tra => tra.ApproverId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}