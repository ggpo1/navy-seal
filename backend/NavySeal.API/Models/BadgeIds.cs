namespace NavySeal.API.Models;

public static class BadgeIds
{
    public const string FirstSeal = "first_seal";
    public const string Seals5 = "seals_5";
    public const string Seals25 = "seals_25";
    public const string FirstLegendary = "first_legendary";
    public const string Legendary10 = "legendary_10";
    public const string Comments100 = "comments_100";
    public const string Ratings50 = "ratings_50";
    public const string Commenter25 = "commenter_25";
    public const string Critic50 = "critic_50";
    public const string PopularSeal = "popular_seal";
    public const string TopWeek = "top_week";
    public const string HallOfFame = "hall_of_fame";

    public static readonly string[] DisplayOrder =
    [
        FirstSeal,
        Seals5,
        Seals25,
        FirstLegendary,
        Legendary10,
        Comments100,
        Ratings50,
        Commenter25,
        Critic50,
        PopularSeal,
        TopWeek,
        HallOfFame,
    ];
}

public static class BadgeRules
{
    public const int TopListLimit = 50;
    public const int TopMinRatings = 1;
    public const int PopularMinRatings = 20;
    public const double PopularMinAverage = 4.5;
    public const int PopularMinRatingsForAverage = 10;

    public static bool IsPopularSeal(double averageRating, int ratingCount) =>
        ratingCount >= PopularMinRatings
        || (ratingCount >= PopularMinRatingsForAverage && averageRating >= PopularMinAverage);
}
