using NavySeal.API.Models;

namespace NavySeal.API.Services;

public static class SeaLionPatternGenerator
{
    public static List<PatternMark> Generate(Random rng, string pattern)
    {
        return pattern switch
        {
            "spots" => GenerateMarks(rng, rng.Next(5, 15), 4, 9),
            "speckles" => GenerateMarks(rng, rng.Next(14, 32), 2, 5),
            "patchy" => GenerateMarks(rng, rng.Next(3, 8), 10, 22),
            _ => []
        };
    }

    private static List<PatternMark> GenerateMarks(Random rng, int count, double minRadius, double maxRadius)
    {
        var marks = new List<PatternMark>(count);

        for (var i = 0; i < count; i++)
        {
            marks.Add(new PatternMark
            {
                X = Round(rng.NextDouble() * 160 - 80),
                Y = Round(rng.NextDouble() * 90 - 45),
                Radius = Round(minRadius + rng.NextDouble() * (maxRadius - minRadius))
            });
        }

        return marks;
    }

    private static double Round(double value) => Math.Round(value, 2);
}
