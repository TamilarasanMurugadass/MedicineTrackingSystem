# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["MedicineTracking.Api/MedicineTracking.Api.csproj", "MedicineTracking.Api/"]
COPY ["MedicineTracking.Application/MedicineTracking.Application.csproj", "MedicineTracking.Application/"]
COPY ["MedicineTracking.Domain/MedicineTracking.Domain.csproj", "MedicineTracking.Domain/"]
COPY ["MedicineTracking.Infrastructure/MedicineTracking.Infrastructure.csproj", "MedicineTracking.Infrastructure/"]

RUN dotnet restore "MedicineTracking.Api/MedicineTracking.Api.csproj"

# Copy all source files
COPY . .

# Build the application
WORKDIR "/src/MedicineTracking.Api"
RUN dotnet build "MedicineTracking.Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "MedicineTracking.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080

# Copy published application
COPY --from=publish /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "MedicineTracking.Api.dll"]
