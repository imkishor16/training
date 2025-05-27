using System;
using System.Linq;

public class SudokuRowValidator
{
    public static void Run()
    {
        Console.WriteLine("Enter 9 space-separated numbers (1-9):");
        int[] row = Console.ReadLine().Split().Select(int.Parse).ToArray();

        if (row.Length != 9 || row.Any(n => n < 1 || n > 9))
        {
            Console.WriteLine("Invalid input.");
        }
        else if (row.Distinct().Count() == 9)
        {
            Console.WriteLine("Valid Sudoku row.");
        }
        else
        {
            Console.WriteLine("Invalid Sudoku row. Duplicates detected.");
        }
    }
}
