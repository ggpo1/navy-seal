namespace NavySeal.API.Configuration;

public class AppSettings
{
    public const string SectionName = "App";

    public string PublicFrontendUrl { get; set; } = "http://localhost:5173";

    public string PublicApiUrl { get; set; } = "http://localhost:5280";
}
