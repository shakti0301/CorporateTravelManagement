using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelMgmtApi.Migrations
{
    /// <inheritdoc />
    public partial class AddTravelRequestTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TravelRequests",
                columns: table => new
                {
                    TravelRequestId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    ProjectManagerId = table.Column<int>(type: "int", nullable: true),
                    ManagerId = table.Column<int>(type: "int", nullable: false),
                    FinanceId = table.Column<int>(type: "int", nullable: false),
                    Source = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Destination = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Purpose = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    EstimatedCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CurrentStage = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TravelRequests", x => x.TravelRequestId);
                    table.ForeignKey(
                        name: "FK_TravelRequests_Users_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TravelRequests_Users_FinanceId",
                        column: x => x.FinanceId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TravelRequests_Users_ManagerId",
                        column: x => x.ManagerId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TravelRequests_Users_ProjectManagerId",
                        column: x => x.ProjectManagerId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TravelRequestApprovals",
                columns: table => new
                {
                    ApprovalId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TravelRequestId = table.Column<int>(type: "int", nullable: false),
                    ApproverId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ApprovalStage = table.Column<int>(type: "int", nullable: false),
                    ActionDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TravelRequestApprovals", x => x.ApprovalId);
                    table.ForeignKey(
                        name: "FK_TravelRequestApprovals_TravelRequests_TravelRequestId",
                        column: x => x.TravelRequestId,
                        principalTable: "TravelRequests",
                        principalColumn: "TravelRequestId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TravelRequestApprovals_Users_ApproverId",
                        column: x => x.ApproverId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TravelRequestApprovals_ApproverId",
                table: "TravelRequestApprovals",
                column: "ApproverId");

            migrationBuilder.CreateIndex(
                name: "IX_TravelRequestApprovals_TravelRequestId",
                table: "TravelRequestApprovals",
                column: "TravelRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_TravelRequests_EmployeeId",
                table: "TravelRequests",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_TravelRequests_FinanceId",
                table: "TravelRequests",
                column: "FinanceId");

            migrationBuilder.CreateIndex(
                name: "IX_TravelRequests_ManagerId",
                table: "TravelRequests",
                column: "ManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_TravelRequests_ProjectManagerId",
                table: "TravelRequests",
                column: "ProjectManagerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TravelRequestApprovals");

            migrationBuilder.DropTable(
                name: "TravelRequests");
        }
    }
}
