
using System;

public class CaesarCipher
{
    public static void Run()
    {
        Console.Write("Enter a lowercase message: ");
        string input = Console.ReadLine();

        string encrypted = Encrypt(input);
        string decrypted = Decrypt(encrypted);

        Console.WriteLine($"Encrypted: {encrypted}");
        Console.WriteLine($"Decrypted: {decrypted}");
    }

    static string Encrypt(string message)
    {
        char[] encrypted = new char[message.Length];

        for (int i = 0; i < message.Length; i++)
        {
            char c = message[i];
            encrypted[i] = (char)('a' + (c - 'a' + 3) % 26);
        }

        return new string(encrypted);
    }

    static string Decrypt(string message)
    {
        char[] decrypted = new char[message.Length];

        for (int i = 0; i < message.Length; i++)
        {
            char c = message[i];
            decrypted[i] = (char)('a' + (c - 'a' - 3 + 26) % 26); // +26 handles negative wrap
        }

        return new string(decrypted);
    }
}
