using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedicineTracking.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameAspNetRolesToIdentityRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoleClaims_AspNetRoles_RoleId",
                table: "RoleClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_AspNetRoles_RoleId",
                table: "UserRoles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AspNetRoles",
                table: "AspNetRoles");

            migrationBuilder.RenameTable(
                name: "AspNetRoles",
                newName: "IdentityRoles");

            migrationBuilder.AddPrimaryKey(
                name: "PK_IdentityRoles",
                table: "IdentityRoles",
                column: "Id");

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 23, 11, 31, 28, 145, DateTimeKind.Utc), new DateTime(2025, 9, 23, 11, 31, 28, 145, DateTimeKind.Utc) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 23, 11, 31, 28, 145, DateTimeKind.Utc), new DateTime(2025, 9, 23, 11, 31, 28, 145, DateTimeKind.Utc) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 23, 11, 31, 28, 145, DateTimeKind.Utc), new DateTime(2025, 9, 23, 11, 31, 28, 145, DateTimeKind.Utc) });

            migrationBuilder.AddForeignKey(
                name: "FK_RoleClaims_IdentityRoles_RoleId",
                table: "RoleClaims",
                column: "RoleId",
                principalTable: "IdentityRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_IdentityRoles_RoleId",
                table: "UserRoles",
                column: "RoleId",
                principalTable: "IdentityRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoleClaims_IdentityRoles_RoleId",
                table: "RoleClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_IdentityRoles_RoleId",
                table: "UserRoles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_IdentityRoles",
                table: "IdentityRoles");

            migrationBuilder.RenameTable(
                name: "IdentityRoles",
                newName: "AspNetRoles");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AspNetRoles",
                table: "AspNetRoles",
                column: "Id");

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 23, 11, 50, 27, 77, DateTimeKind.Utc).AddTicks(2816), new DateTime(2025, 9, 23, 11, 50, 27, 77, DateTimeKind.Utc).AddTicks(3084) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 23, 11, 50, 27, 77, DateTimeKind.Utc).AddTicks(3339), new DateTime(2025, 9, 23, 11, 50, 27, 77, DateTimeKind.Utc).AddTicks(3339) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 23, 11, 50, 27, 77, DateTimeKind.Utc).AddTicks(3343), new DateTime(2025, 9, 23, 11, 50, 27, 77, DateTimeKind.Utc).AddTicks(3344) });

            migrationBuilder.AddForeignKey(
                name: "FK_RoleClaims_AspNetRoles_RoleId",
                table: "RoleClaims",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_AspNetRoles_RoleId",
                table: "UserRoles",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
