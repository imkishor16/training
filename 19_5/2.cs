using System;

public class LargestNumber
{
    static void Run()
    {
        Console.Write("Enter first number: ");
        int num1 = int.Parse(Console.ReadLine());

        Console.Write("Enter second number: ");
        int num2 = int.Parse(Console.ReadLine());

        int max = (num1 > num2) ? num1 : num2;
        Console.WriteLine($"The larger number is: {max}");
    }
}
