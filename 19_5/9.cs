using System;

public class BullsAndCows
{
    public static void Run()
    {
        string secret = "GGGG";
        int attempts = 0;
        string guess;

        do
        {
            Console.Write("Enter your 4-letter guess: ");
            guess = Console.ReadLine().ToUpper();
            if (guess.Length != 4)
            {
                Console.WriteLine("Please enter exactly 4 letters.");
                continue;
            }

            int bulls = 0, cows = 0;
            bool[] secretUsed = new bool[4];
            bool[] guessUsed = new bool[4];

            // First pass for bulls
            for (int i = 0; i < 4; i++)
            {
                if (guess[i] == secret[i])
                {
                    bulls++;
                    secretUsed[i] = true;
                    guessUsed[i] = true;
                }
            }

            // Second pass for cows
            for (int i = 0; i < 4; i++)
            {
                if (!guessUsed[i])
                {
                    for (int j = 0; j < 4; j++)
                    {
                        if (!secretUsed[j] && guess[i] == secret[j])
                        {
                            cows++;
                            secretUsed[j] = true;
                            break;
                        }
                    }
                }
            }

            Console.WriteLine($"{bulls} Bulls, {cows} Cows");
            attempts++;
        }
        while (guess != secret);

        Console.WriteLine($"Correct! You guessed it in {attempts} attempts.");
    }
}