namespace NavySeal.API.Services;

public static class SeaLionNameGenerator
{
    private static readonly string[] FirstWords =
    [
        "Salty", "Brave", "Lazy", "Golden", "Sleepy", "Swift", "Chubby", "Clever",
        "Gentle", "Wild", "Tiny", "Mighty", "Bubbly", "Cozy", "Daring", "Frosty",
        "Sunny", "Stormy", "Splashy", "Wobbly", "Happy", "Curious", "Chill", "Fluffy",
        "Snappy", "Silky", "Rocky", "Sandy", "Misty", "Breezy", "Deep", "Calm",
        "Playful", "Cheeky", "Noble", "Sneaky", "Bouncy", "Shiny", "Damp", "Rusty",
        "Jolly", "Peppy", "Zippy", "Chunky", "Dizzy", "Feisty", "Giggly", "Grumpy",
        "Jazzy", "Lucky", "Mellow", "Nimble", "Perky", "Quirky", "Rowdy", "Sassy",
        "Spunky", "Tipsy", "Witty", "Zesty", "Blissful", "Dapper", "Earnest", "Fancy"
    ];

    private static readonly string[] SecondWords =
    [
        "Flipper", "Whisker", "Tide", "Reef", "Harbor", "Splash", "Bubble", "Drift",
        "Current", "Kelp", "Cove", "Squirt", "Pup", "Snout", "Bark", "Wave",
        "Shell", "Anchor", "Pearl", "Squall", "Lagoon", "Spray", "Shoal", "Fin",
        "Floater", "Diver", "Swimmer", "Lounger", "Napper", "Wiggler", "Roarer",
        "Sailor", "Captain", "Buoy", "Gull", "Paddler", "Barker", "Clapper", "Slider",
        "Surfer", "Drifter", "Cruiser", "Glider", "Spinner", "Haulout",
        "Rookery", "Sandbar", "Seabird", "Starfish", "Seashell", "Moonbeam", "Sunbeam",
        "Iceberg", "Breeze", "Ripple", "Geyser", "Mariner", "Navigator", "Castaway",
        "Deckhand", "Lookout", "Pelican", "Otter", "Walrus", "Blubber"
    ];

    public static string Generate()
    {
        var first = FirstWords[Random.Shared.Next(FirstWords.Length)];
        var second = SecondWords[Random.Shared.Next(SecondWords.Length)];
        return $"{first} {second}";
    }
}
