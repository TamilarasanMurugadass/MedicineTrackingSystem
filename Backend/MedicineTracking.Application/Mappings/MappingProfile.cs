using AutoMapper;
using MedicineTracking.Application.DTOs;
using MedicineTracking.Domain.Entities;
using MedicineTracking.Domain.Enums;

namespace MedicineTracking.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Medicine mappings
        CreateMap<Medicine, MedicineDto>()
            .ForMember(dest => dest.CreatorName, opt => opt.MapFrom(src => src.Creator.FullName))
            .ForMember(dest => dest.TotalCurrentStock, opt => opt.MapFrom(src => src.TotalCurrentStock))
            .ForMember(dest => dest.IsLowStock, opt => opt.MapFrom(src => src.IsLowStock))
            .ForMember(dest => dest.EarliestExpiry, opt => opt.MapFrom(src => src.EarliestExpiry))
            .ForMember(dest => dest.ActiveBatches, opt => opt.MapFrom(src => src.MedicineBatches.Count(b => b.IsActive && b.CurrentQuantity > 0)));

        CreateMap<CreateMedicineDto, Medicine>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

        CreateMap<UpdateMedicineDto, Medicine>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore());

        // Medicine Batch mappings
        CreateMap<MedicineBatch, MedicineBatchDto>()
            .ForMember(dest => dest.MedicineName, opt => opt.MapFrom(src => src.Medicine.Name))
            .ForMember(dest => dest.CreatorName, opt => opt.MapFrom(src => src.Creator.FullName))
            .ForMember(dest => dest.IsExpired, opt => opt.MapFrom(src => src.IsExpired))
            .ForMember(dest => dest.IsNearingExpiry, opt => opt.MapFrom(src => src.IsNearingExpiry))
            .ForMember(dest => dest.DaysToExpiry, opt => opt.MapFrom(src => src.DaysToExpiry))
            .ForMember(dest => dest.IsDepleted, opt => opt.MapFrom(src => src.IsDepleted))
            .ForMember(dest => dest.UsagePercentage, opt => opt.MapFrom(src => src.UsagePercentage));

        CreateMap<CreateMedicineBatchDto, MedicineBatch>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentQuantity, opt => opt.MapFrom(src => src.InitialQuantity))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

        CreateMap<UpdateMedicineBatchDto, MedicineBatch>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.MedicineId, opt => opt.Ignore())
            .ForMember(dest => dest.InitialQuantity, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentQuantity, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore());

        // Inventory Transaction mappings
        CreateMap<InventoryTransaction, InventoryTransactionDto>()
            .ForMember(dest => dest.BatchNumber, opt => opt.MapFrom(src => src.MedicineBatch.BatchNumber))
            .ForMember(dest => dest.MedicineName, opt => opt.MapFrom(src => src.MedicineBatch.Medicine.Name))
            .ForMember(dest => dest.TransactionTypeDisplay, opt => opt.MapFrom(src => GetTransactionTypeDisplay(src.TransactionType)))
            .ForMember(dest => dest.CreatorName, opt => opt.MapFrom(src => src.Creator.FullName))
            .ForMember(dest => dest.IsStockReduction, opt => opt.MapFrom(src => src.IsStockReduction))
            .ForMember(dest => dest.IsStockAddition, opt => opt.MapFrom(src => src.IsStockAddition));

        CreateMap<CreateInventoryTransactionDto, InventoryTransaction>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.RemainingQuantity, opt => opt.Ignore());

        // Alert mappings
        CreateMap<Alert, AlertDto>()
            .ForMember(dest => dest.MedicineName, opt => opt.MapFrom(src => src.Medicine.Name))
            .ForMember(dest => dest.BatchNumber, opt => opt.MapFrom(src => src.MedicineBatch != null ? src.MedicineBatch.BatchNumber : null))
            .ForMember(dest => dest.AlertTypeDisplay, opt => opt.MapFrom(src => src.AlertTypeDisplayName))
            .ForMember(dest => dest.ReaderName, opt => opt.MapFrom(src => src.Reader != null ? src.Reader.FullName : null))
            .ForMember(dest => dest.Severity, opt => opt.MapFrom(src => src.Severity));

        CreateMap<CreateAlertDto, Alert>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.IsRead, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
            .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.Name));

        CreateMap<CreateUserDto, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.EmailConfirmed, opt => opt.MapFrom(src => true));

        CreateMap<UpdateUserDto, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());
    }

    private static string GetTransactionTypeDisplay(TransactionType type)
    {
        return type switch
        {
            TransactionType.IN => "Stock In",
            TransactionType.OUT => "Stock Out",
            TransactionType.ADJUSTMENT => "Adjustment",
            TransactionType.EXPIRED => "Expired",
            TransactionType.DAMAGED => "Damaged",
            _ => type.ToString()
        };
    }
}