using System;

class LoginSystem
{
    public static void Run()
    {
        int attempts = 3;

        while (attempts > 0)
        {
            Console.Write("Enter username: ");
            string username = Console.ReadLine();

            Console.Write("Enter password: ");
            string password = Console.ReadLine();

            if (username == "Admin" && password == "pass")
            {
                Console.WriteLine("Login successful!");
                return;
            }

            attempts--;
            Console.WriteLine($"Invalid credentials. Attempts left: {attempts}");
        }

        Console.WriteLine("Invalid attempts for 3 times. Exiting....");
    }
}
