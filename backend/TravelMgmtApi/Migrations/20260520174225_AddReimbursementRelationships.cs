using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelMgmtApi.Migrations
{
    /// <inheritdoc />
    public partial class AddReimbursementRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reimbursements_TravelRequestId",
                table: "Reimbursements");

            migrationBuilder.AddColumn<int>(
                name: "TravelRequestId1",
                table: "Reimbursements",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reimbursements_TravelRequestId",
                table: "Reimbursements",
                column: "TravelRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_Reimbursements_TravelRequestId1",
                table: "Reimbursements",
                column: "TravelRequestId1",
                unique: true,
                filter: "[TravelRequestId1] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Reimbursements_TravelRequests_TravelRequestId1",
                table: "Reimbursements",
                column: "TravelRequestId1",
                principalTable: "TravelRequests",
                principalColumn: "TravelRequestId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reimbursements_TravelRequests_TravelRequestId1",
                table: "Reimbursements");

            migrationBuilder.DropIndex(
                name: "IX_Reimbursements_TravelRequestId",
                table: "Reimbursements");

            migrationBuilder.DropIndex(
                name: "IX_Reimbursements_TravelRequestId1",
                table: "Reimbursements");

            migrationBuilder.DropColumn(
                name: "TravelRequestId1",
                table: "Reimbursements");

            migrationBuilder.CreateIndex(
                name: "IX_Reimbursements_TravelRequestId",
                table: "Reimbursements",
                column: "TravelRequestId",
                unique: true);
        }
    }
}
