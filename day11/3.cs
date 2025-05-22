using System;

public class SimpleCalculator
{
    public static void Run()
    {
        Console.Write("Enter first number: ");
        double num1 = double.Parse(Console.ReadLine());

        Console.Write("Enter second number: ");
        double num2 = double.Parse(Console.ReadLine());

        Console.Write("Enter operation (+, -, *, /): ");
        char op = Console.ReadLine()[0];

        double result = 0;

        switch (op)
        {
            case '+': result = num1 + num2; break;
            case '-': result = num1 - num2; break;
            case '*': result = num1 * num2; break;
            case '/':
                if (num2 != 0) result = num1 / num2;
                else Console.WriteLine("Cannot divide by zero.");
                break;
            default:
                Console.WriteLine("Invalid operation.");
                return;
        }

        Console.WriteLine($"Result: {result}");
    }
}
