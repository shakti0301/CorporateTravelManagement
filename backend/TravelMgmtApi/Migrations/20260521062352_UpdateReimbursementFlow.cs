using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelMgmtApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateReimbursementFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reimbursements_TravelRequests_TravelRequestId",
                table: "Reimbursements");

            migrationBuilder.AddForeignKey(
                name: "FK_Reimbursements_TravelRequests_TravelRequestId",
                table: "Reimbursements",
                column: "TravelRequestId",
                principalTable: "TravelRequests",
                principalColumn: "TravelRequestId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reimbursements_TravelRequests_TravelRequestId",
                table: "Reimbursements");

            migrationBuilder.AddForeignKey(
                name: "FK_Reimbursements_TravelRequests_TravelRequestId",
                table: "Reimbursements",
                column: "TravelRequestId",
                principalTable: "TravelRequests",
                principalColumn: "TravelRequestId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
