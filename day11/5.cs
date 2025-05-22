using System;

public class DivisibleBySeven
{
    public static void Run()
    {
        int count = 0;

        for (int i = 1; i <= 10; i++)
        {
            Console.Write($"Enter number {i}: ");
            int num = int.Parse(Console.ReadLine());

            if (num % 7 == 0)
                count++;
        }

        Console.WriteLine($"{count} numbers are divisible by 7.");
    }
}
