using System;

public class MergeArrays
{
    public static void Run()
    {
        int[] arr1 = { 1, 3, 5 };
        int[] arr2 = { 2, 4, 6 };
        int[] merged = new int[arr1.Length + arr2.Length];

        for (int i = 0; i < arr1.Length; i++)
            merged[i] = arr1[i];

        for (int i = 0; i < arr2.Length; i++)
            merged[arr1.Length + i] = arr2[i];

        Console.WriteLine("Merged array: " + string.Join(", ", merged));
    }
}
