using System;
using System.Collections.Generic;

public class FrequencyCounter
{
    public static void Run()
    {
        int[] arr = { 1, 2, 2, 3, 4, 4, 4 };
        Dictionary<int, int> freq = new Dictionary<int, int>();
        if(arr.Length < 0 )
            Console.WriteLine("MT array");

        foreach (int num in arr)
        {
            if (freq.ContainsKey(num))
                freq[num]++;
            else
                freq[num] = 1;
        }

        foreach (var pair in freq)
        {
            Console.WriteLine($"{pair.Key} occurs {pair.Value} times");
        }
    }
}
