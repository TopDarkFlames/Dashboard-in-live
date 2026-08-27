var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors();

var servers = new[]
{
    new Server(1, "TrueNAS", "truenas", "192.168.1.10", "Online", 28, 61, 54, "23d 04h", DateTimeOffset.UtcNow),
    new Server(2, "Desktop", "desktop", "192.168.1.20", "Online", 42, 58, 71, "8d 12h", DateTimeOffset.UtcNow),
    new Server(3, "Raspberry Pi", "raspberrypi", "192.168.1.30", "Online", 19, 37, 48, "41d 02h", DateTimeOffset.UtcNow),
    new Server(4, "Notebook", "notebook", "192.168.1.40", "Offline", 0, 0, 0, "—", DateTimeOffset.UtcNow.AddMinutes(-18))
};

var services = new[]
{
    new ServiceItem(1, "Nextcloud", "https://cloud.example.local", "Online", 23, 1),
    new ServiceItem(2, "Jellyfin", "https://media.example.local", "Online", 14, 1),
    new ServiceItem(3, "Immich", "https://photos.example.local", "Online", 31, 1),
    new ServiceItem(4, "Vaultwarden", "https://vault.example.local", "Online", 18, 2),
    new ServiceItem(5, "Grafana", "https://grafana.example.local", "Online", 11, 3),
    new ServiceItem(6, "Paperless", "https://docs.example.local", "Offline", 0, 2)
};

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", timestamp = DateTimeOffset.UtcNow }));

app.MapGet("/api/dashboard", () => Results.Ok(new
{
    serversOnline = servers.Count(s => s.Status == "Online"),
    serversTotal = servers.Length,
    servicesOnline = services.Count(s => s.Status == "Online"),
    servicesTotal = services.Length,
    averageCpu = Math.Round(servers.Where(s => s.Status == "Online").Average(s => s.CpuUsage)),
    averageMemory = Math.Round(servers.Where(s => s.Status == "Online").Average(s => s.MemoryUsage)),
    servers,
    services,
    alerts = new[]
    {
        new { id = 1, title = "Paperless está indisponível", detail = "Última verificação há 2 minutos", severity = "critical", time = "2 min" },
        new { id = 2, title = "Uso de armazenamento elevado", detail = "Desktop atingiu 71% de utilização", severity = "warning", time = "18 min" }
    }
}));

app.MapGet("/api/servers", () => Results.Ok(servers));
app.MapGet("/api/servers/{id:int}", (int id) => servers.FirstOrDefault(s => s.Id == id) is { } server ? Results.Ok(server) : Results.NotFound());
app.MapGet("/api/services", () => Results.Ok(services));

app.Run();

record Server(int Id, string Name, string Hostname, string IpAddress, string Status, int CpuUsage, int MemoryUsage, int DiskUsage, string Uptime, DateTimeOffset LastSeen);
record ServiceItem(int Id, string Name, string Url, string Status, int ResponseTime, int ServerId);

