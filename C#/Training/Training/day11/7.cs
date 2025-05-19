using System;

public class RotateArray
{
    public static void Run()
    {
        int[] arr = { 10, 20, 30, 40, 50 };
        int first = arr[0];

        for (int i = 0; i < arr.Length - 1; i++)
        {
            arr[i] = arr[i + 1];
        }
        arr[arr.Length - 1] = first;

        Console.WriteLine("Rotated array: " + string.Join(", ", arr));
    }
}
