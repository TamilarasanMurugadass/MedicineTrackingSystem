# Security & Enterprise Standards Improvement Plan

## Executive Summary

This document outlines the security vulnerabilities and enterprise standards gaps identified in the Medicine Tracking System backend API, along with actionable recommendations for improvement.

**Current Status:** Good fundamentals with critical security issues that need immediate attention.

---

## ✅ Current Strengths

1. **Clean Architecture** - Well-structured 4-layer design (Domain, Application, Infrastructure, API)
2. **JWT Authentication** - Token validation with issuer/audience verification
3. **Role-Based Authorization** - Proper `[Authorize]` attributes on controllers
4. **Password Policies** - Strong requirements (min 6 chars, uppercase, lowercase, digit)
5. **Structured Logging** - ILogger implementation throughout
6. **Input Validation** - Basic validation in controllers
7. **Consistent API Responses** - `ApiResponse<T>` wrapper pattern
8. **Entity Framework Core** - Proper ORM with migrations
9. **Dependency Injection** - Proper service registration
10. **Unit of Work Pattern** - Repository abstraction

---

## ❌ Critical Security Issues

### 1. **Hardcoded Secrets in appsettings.json** 🔴 CRITICAL
**Location:** `Backend/MedicineTracking.Api/appsettings.json` (Lines 3, 6)

**Issue:**
```json
"DefaultConnection": "Server=localhost;Database=MedicineTrackingDB;User=root;Password=root;"
"SecretKey": "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!"
```

**Risk:** Exposed credentials and JWT secrets in version control

**Solution:**
- Use User Secrets for development
- Use Azure Key Vault / AWS Secrets Manager for production
- Update `.gitignore` to exclude `appsettings.json`

**Implementation:**
```bash
# Development - User Secrets
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;..."
dotnet user-secrets set "JWT:SecretKey" "your-secret-key"

# Production - Environment Variables or Key Vault
```

---

### 2. **Incomplete .gitignore** 🔴 CRITICAL
**Location:** `.gitignore`

**Issue:** Configuration files with secrets are not properly excluded

**Solution:**
Add to `.gitignore`:
```gitignore
# Configuration files with secrets
appsettings.json
appsettings.*.json
!appsettings.Development.json.example

# User secrets
**/appsettings.local.json
```

---

### 3. **No Rate Limiting** 🔴 CRITICAL
**Location:** `Program.cs`, `AuthController.cs`

**Risk:** Brute force attacks on login endpoint, API abuse

**Solution:**
Install: `AspNetCoreRateLimit` or use .NET 9 built-in rate limiting

**Implementation:**
```csharp
// Program.cs
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("login", limiterOptions =>
    {
        limiterOptions.Window = TimeSpan.FromMinutes(15);
        limiterOptions.PermitLimit = 5;
        limiterOptions.QueueLimit = 0;
    });

    options.AddFixedWindowLimiter("api", limiterOptions =>
    {
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.PermitLimit = 100;
    });
});

// Apply middleware
app.UseRateLimiter();

// AuthController.cs
[HttpPost("login")]
[EnableRateLimiting("login")]
public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto loginDto)
```

---

### 4. **No CSRF Protection** 🟠 HIGH
**Location:** All controllers

**Risk:** Cross-Site Request Forgery attacks

**Solution:**
```csharp
// Program.cs
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});

// Apply to state-changing operations
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<ActionResult> CreateMedicine([FromBody] CreateMedicineDto dto)
```

---

### 5. **No Request Size Limits** 🟠 HIGH
**Location:** `Program.cs`

**Risk:** Denial of Service attacks

**Solution:**
```csharp
// Program.cs
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 10 * 1024 * 1024; // 10 MB
});

builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 10 * 1024 * 1024; // 10 MB
});

builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 10 * 1024 * 1024; // 10 MB
});
```

---

### 6. **Weak Password Requirements** 🟠 HIGH
**Location:** `Program.cs` (Lines 66-70)

**Issue:** Minimum 6 characters is too weak

**Solution:**
```csharp
options.Password.RequireDigit = true;
options.Password.RequiredLength = 12; // Increased from 6
options.Password.RequireNonAlphanumeric = true; // Changed to true
options.Password.RequireUppercase = true;
options.Password.RequireLowercase = true;
options.Password.RequiredUniqueChars = 4; // Add this
```

---

### 7. **No Account Lockout** 🟠 HIGH
**Location:** `Program.cs`, `AuthService.cs`

**Risk:** Brute force password attacks

**Solution:**
```csharp
// Program.cs - Add lockout settings
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    // ... existing password settings ...

    // Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})

// AuthService.cs - Check lockout
public async Task<LoginResponseDto?> LoginAsync(LoginDto loginDto)
{
    var user = await _userManager.FindByEmailAsync(loginDto.Email);
    if (user == null || !user.IsActive)
        return null;

    // Check if locked out
    if (await _userManager.IsLockedOutAsync(user))
    {
        throw new InvalidOperationException("Account is locked due to multiple failed login attempts");
    }

    var passwordValid = await _userManager.CheckPasswordAsync(user, loginDto.Password);
    if (!passwordValid)
    {
        await _userManager.AccessFailedAsync(user); // Track failed attempt
        return null;
    }

    await _userManager.ResetAccessFailedCountAsync(user); // Reset on success

    // ... rest of login logic
}
```

---

### 8. **No Security Headers** 🟠 HIGH
**Location:** `Program.cs`

**Risk:** XSS, Clickjacking, MIME sniffing attacks

**Solution:**
```csharp
// Create Middleware/SecurityHeadersMiddleware.cs
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Add("X-Frame-Options", "DENY");
        context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
        context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
        context.Response.Headers.Add("Content-Security-Policy", "default-src 'self'");
        context.Response.Headers.Add("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

        // HSTS (only in production)
        if (!context.Request.Host.Host.Contains("localhost"))
        {
            context.Response.Headers.Add("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        }

        await _next(context);
    }
}

// Program.cs
app.UseMiddleware<SecurityHeadersMiddleware>();
```

---

### 9. **No Input Sanitization** 🟡 MEDIUM
**Location:** All controllers

**Risk:** XSS, SQL Injection (mitigated by EF Core)

**Solution:**
```csharp
// Install: HtmlSanitizer NuGet package
// Create Middleware/InputSanitizationMiddleware.cs

using Ganss.Xss;

public class InputSanitizationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly HtmlSanitizer _sanitizer;

    public InputSanitizationMiddleware(RequestDelegate next)
    {
        _next = next;
        _sanitizer = new HtmlSanitizer();
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Sanitize request body for POST/PUT requests
        if (context.Request.Method == "POST" || context.Request.Method == "PUT")
        {
            context.Request.EnableBuffering();
            // Implement sanitization logic
        }

        await _next(context);
    }
}
```

---

### 10. **Console.WriteLine in Production** 🟡 MEDIUM
**Location:** `MedicinesController.cs` (Lines 152, 171)

**Issue:** Security information leak, poor logging practice

**Solution:**
```csharp
// Remove these lines:
Console.WriteLine("Current User ID: " + currentUserId);
Console.WriteLine("Exception: " + ex.Message);

// Already have proper logging:
_logger.LogError(ex, "Error creating medicine {MedicineName}", createMedicineDto.Name);
```

---

## 📋 Enterprise Standards Missing

### 1. **Health Checks** 🔵 RECOMMENDED
**Implementation:**
```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddDbContextCheck<MedicineTrackingDbContext>()
    .AddUrlGroup(new Uri("https://external-api.com"), name: "external-api");

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
```

---

### 2. **API Versioning** 🔵 RECOMMENDED
**Implementation:**
```csharp
// Install: Asp.Versioning.Mvc
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});

// Controllers
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("1.0")]
public class MedicinesController : ControllerBase
```

---

### 3. **Request/Response Compression** 🔵 RECOMMENDED
**Implementation:**
```csharp
// Program.cs
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
    options.Providers.Add<BrotliCompressionProvider>();
});

app.UseResponseCompression();
```

---

### 4. **Distributed Caching (Redis)** 🔵 RECOMMENDED
**Implementation:**
```csharp
// Install: Microsoft.Extensions.Caching.StackExchangeRedis
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "MedicineTracking_";
});
```

---

### 5. **Circuit Breaker (Polly)** 🔵 RECOMMENDED
**Implementation:**
```csharp
// Install: Microsoft.Extensions.Http.Polly
builder.Services.AddHttpClient("ExternalAPI")
    .AddTransientHttpErrorPolicy(policy =>
        policy.CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)));
```

---

### 6. **OpenTelemetry/APM** 🔵 RECOMMENDED
**Implementation:**
```csharp
// Install: OpenTelemetry packages
builder.Services.AddOpenTelemetry()
    .WithTracing(builder => builder
        .AddAspNetCoreInstrumentation()
        .AddEntityFrameworkCoreInstrumentation()
        .AddConsoleExporter());
```

---

### 7. **Data Encryption at Rest** 🟡 OPTIONAL
**Implementation:**
- Use database-level encryption (MySQL Transparent Data Encryption)
- Encrypt sensitive fields before storing (e.g., with AES)

---

### 8. **Audit Trail Middleware** 🔵 RECOMMENDED
**Implementation:**
```csharp
public class AuditMiddleware
{
    private readonly RequestDelegate _next;

    public async Task InvokeAsync(HttpContext context, MedicineTrackingDbContext dbContext)
    {
        // Log all requests to AuditLog table
        var auditLog = new AuditLog
        {
            UserId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            Action = $"{context.Request.Method} {context.Request.Path}",
            Timestamp = DateTime.UtcNow,
            IpAddress = context.Connection.RemoteIpAddress?.ToString()
        };

        await dbContext.AuditLogs.AddAsync(auditLog);
        await dbContext.SaveChangesAsync();

        await _next(context);
    }
}
```

---

### 9. **Enhanced API Documentation** 🟡 OPTIONAL
**Implementation:**
```csharp
// Program.cs
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Medicine Tracking API",
        Version = "v1",
        Description = "Enterprise medicine tracking and inventory management system",
        Contact = new OpenApiContact
        {
            Name = "Support Team",
            Email = "support@hospital.com"
        }
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath);
});
```

---

### 10. **Container Support (Docker)** 🔵 RECOMMENDED
**Implementation:**
```dockerfile
# Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["MedicineTracking.Api/MedicineTracking.Api.csproj", "MedicineTracking.Api/"]
RUN dotnet restore "MedicineTracking.Api/MedicineTracking.Api.csproj"
COPY . .
WORKDIR "/src/MedicineTracking.Api"
RUN dotnet build "MedicineTracking.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MedicineTracking.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MedicineTracking.Api.dll"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "5000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=${DB_CONNECTION_STRING}
      - JWT__SecretKey=${JWT_SECRET}
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: MedicineTrackingDB
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```

---

## 🔧 Implementation Priority

### Phase 1: Immediate (Security Critical) - Week 1
Priority: 🔴 CRITICAL

1. ✅ Move secrets to User Secrets (dev) and environment variables (prod)
2. ✅ Update `.gitignore` to exclude configuration files
3. ✅ Implement rate limiting on login endpoint
4. ✅ Add account lockout after failed attempts
5. ✅ Remove `Console.WriteLine` statements
6. ✅ Add security headers middleware
7. ✅ Increase password minimum length to 12

**Estimated Time:** 8-12 hours

---

### Phase 2: High Priority (Security Hardening) - Week 2
Priority: 🟠 HIGH

8. ✅ Implement CSRF tokens for state-changing operations
9. ✅ Add request validation and input sanitization
10. ✅ Add request size limits
11. ✅ Implement comprehensive error handling
12. ✅ Add structured logging enhancements

**Estimated Time:** 12-16 hours

---

### Phase 3: Medium Priority (Enterprise Features) - Week 3-4
Priority: 🔵 RECOMMENDED

13. ✅ Add health checks endpoint
14. ✅ Implement API versioning
15. ✅ Add response compression
16. ✅ Setup distributed caching (Redis)
17. ✅ Implement circuit breakers (Polly)
18. ✅ Add audit trail middleware
19. ✅ Container support (Docker)

**Estimated Time:** 20-24 hours

---

### Phase 4: Advanced (Monitoring & Optimization) - Week 5-6
Priority: 🟡 OPTIONAL

20. ✅ Setup OpenTelemetry/APM
21. ✅ Implement data encryption at rest
22. ✅ Enhanced API documentation
23. ✅ Performance profiling and optimization
24. ✅ Load testing and stress testing

**Estimated Time:** 16-20 hours

---

## 📊 Security Checklist

### Authentication & Authorization
- [x] JWT token validation with issuer/audience
- [x] Role-based authorization
- [ ] Account lockout after failed attempts
- [ ] Rate limiting on authentication endpoints
- [ ] Password strength requirements (12+ chars)
- [ ] Multi-factor authentication (future)

### Data Protection
- [ ] Secrets management (User Secrets/Key Vault)
- [ ] HTTPS enforcement
- [ ] Data encryption at rest
- [ ] Sensitive data masking in logs
- [ ] SQL injection prevention (using EF Core ✓)

### Input Validation
- [x] Basic validation in controllers
- [ ] Input sanitization middleware
- [ ] Request size limits
- [ ] File upload validation (if applicable)

### API Security
- [ ] CORS configuration (environment-specific ✓)
- [ ] CSRF protection
- [ ] Security headers
- [ ] Rate limiting
- [ ] API versioning

### Monitoring & Logging
- [x] Structured logging
- [ ] Audit trail
- [ ] Health checks
- [ ] Application Performance Monitoring
- [ ] Security event logging

### Infrastructure
- [ ] Container security
- [ ] Secrets in environment variables
- [ ] Production configuration separate from dev
- [ ] Database connection pooling
- [ ] Distributed caching

---

## 📚 Additional Resources

### Security Best Practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Microsoft Security Best Practices](https://learn.microsoft.com/en-us/aspnet/core/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

### .NET Security
- [ASP.NET Core Security Documentation](https://learn.microsoft.com/en-us/aspnet/core/security/)
- [Identity Framework](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)
- [Data Protection](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/introduction)

### Enterprise Patterns
- [Cloud Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/)
- [Microservices Architecture](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-07 | Initial security audit and improvement plan |

---

## 📝 Notes

- This document should be reviewed and updated quarterly
- Security implementations should be tested in development before production deployment
- All changes should go through code review
- Update this document as items are completed
- Run security scanning tools (OWASP ZAP, SonarQube) after implementation

---

## 🔧 MySQL Cloud Database Migration Fix

### Issue: Key Length Error with utf8mb4 Encoding
**Error Message:** "Specified key was too long; max key length is 767 bytes"

**Root Cause:**
MySQL has a 767-byte index limit. ASP.NET Identity tables use `varchar(255)` or `varchar(256)` fields with `utf8mb4` encoding, which requires 4 bytes per character. This results in keys of 1020+ bytes (255 × 4), exceeding the limit.

**Solution Applied:**
Updated `MedicineTrackingDbContext.cs` to configure all ASP.NET Identity string key fields with `HasMaxLength(128)`:
- IdentityRole: Id, Name, NormalizedName, ConcurrencyStamp
- User: Id, Email, NormalizedEmail, UserName, NormalizedUserName, ConcurrencyStamp, SecurityStamp, FirstName, LastName
- All related Identity tables (UserRole, UserClaim, UserLogin, RoleClaim, UserToken)

This reduces the maximum key size to 512 bytes (128 × 4), well within MySQL's 767-byte limit.

### Steps to Deploy to Cloud Database

1. **Clean the Cloud Database** (if partial tables exist):
   ```sql
   DROP TABLE IF EXISTS `__EFMigrationsHistory`;
   DROP TABLE IF EXISTS `AspNetRoles`;
   ```

2. **Apply the Migration**:
   ```bash
   cd Backend/MedicineTracking.Api
   dotnet ef database update
   ```

3. **Verify Tables Created**:
   - Check that all 16 tables are created successfully
   - Verify Identity tables use varchar(128) for key columns

### Files Modified
- `Backend/MedicineTracking.Infrastructure/Data/MedicineTrackingDbContext.cs`
- Created new migration: `InitialMigration`

---

**Document Owner:** Tamil's Team
**Last Updated:** October 8, 2025
**Next Review:** January 7, 2026
