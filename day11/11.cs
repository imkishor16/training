using System;
using System.Linq;

public class SudokuValidator
{
    public static void Run()
    {
        int[,] board = new int[9, 9];

        Console.WriteLine("Enter the Sudoku board (9 lines, each with 9 space-separated numbers 1-9):");

        for (int i = 0; i < 9; i++)
        {
            int[] row = Console.ReadLine().Split().Select(int.Parse).ToArray();
            for (int j = 0; j < 9; j++)
            {
                board[i, j] = row[j];
            }
        }

        bool isValid = true;

        for (int i = 0; i < 9; i++)
        {
            int[] row = new int[9];
            for (int j = 0; j < 9; j++)
            {
                row[j] = board[i, j];
            }

            if (row.Distinct().Count() != 9 || row.Any(n => n < 1 || n > 9))
            {
                isValid = false;
                Console.WriteLine($"Row {i + 1} is invalid.");
            }
        }

        Console.WriteLine(isValid ? "All rows are valid." : "Some rows are invalid.");
    }
}
