using WholeApplication.Models;
using WholeApplication.Services;
using WholeApplication.Repositories;
using WholeApplication.Interfaces;

namespace WholeApplication
{
    class Program
    {
        static IAppointmentService service = new AppointmentService(new AppointmentRepository());

        static void Main(string[] args)
        {
            Console.WriteLine("=== Cardiologist Appointment Manager ===");
            bool running = true;

            while (running)
            {
                Console.WriteLine("\nChoose an option:");
                Console.WriteLine("1. Add Appointment");
                Console.WriteLine("2. Search Appointments");
                Console.WriteLine("3. Exit");
                Console.Write("Enter choice: ");
                string? choice = Console.ReadLine();

                switch (choice)
                {
                    case "1":
                        AddAppointment();
                        break;
                    case "2":
                        SearchAppointments();
                        break;
                    case "3":
                        running = false;
                        Console.WriteLine("Exiting... Goodbye!");
                        break;
                    default:
                        Console.WriteLine("Invalid choice. Please try again.");
                        break;
                }
            }
        }

        static void AddAppointment()
        {
            Console.WriteLine("\n-- Add New Appointment --");

            string name = "";
            while (string.IsNullOrWhiteSpace(name))
            {
                Console.Write("Enter patient name: ");
                name = Console.ReadLine() ?? "";
                if (string.IsNullOrWhiteSpace(name))
                    Console.WriteLine("Name cannot be empty.");
            }

            int age;
            while (true)
            {
                Console.Write("Enter patient age: ");
                if (int.TryParse(Console.ReadLine(), out age) && age >= 1 && age <= 120)
                    break;
                Console.WriteLine("Invalid age. Enter a number between 1 and 120.");
            }

            DateTime date;
            while (true)
            {
                Console.Write("Enter appointment date (yyyy-MM-dd): ");
                if (DateTime.TryParse(Console.ReadLine(), out date) && date.Date >= DateTime.Today)
                    break;
                Console.WriteLine("Invalid date. Date must be today or in the future.");
            }

            string reason = "";
            while (string.IsNullOrWhiteSpace(reason))
            {
                Console.Write("Enter reason for visit: ");
                reason = Console.ReadLine() ?? "";
                if (string.IsNullOrWhiteSpace(reason))
                    Console.WriteLine("Reason cannot be empty.");
            }

            var appointment = new Appointment
            {
                PatientName = name,
                PatientAge = age,
                AppointmentDate = date,
                Reason = reason
            };

            int id = service.AddAppointment(appointment);
            Console.WriteLine($"Appointment added successfully with ID: {id}");
        }

        static void SearchAppointments()
        {
            Console.WriteLine("\n-- Search Appointments --");

            Console.Write("Enter patient name (leave blank to skip): ");
            string? name = Console.ReadLine();
            name = string.IsNullOrWhiteSpace(name) ? null : name;

            DateTime? date = null;
            Console.Write("Enter appointment date (yyyy-MM-dd) or leave blank: ");
            string? dateInput = Console.ReadLine();
            if (!string.IsNullOrWhiteSpace(dateInput) && DateTime.TryParse(dateInput, out var parsedDate))
                date = parsedDate;

            Console.Write("Enter minimum age (leave blank to skip): ");
            string? minAgeStr = Console.ReadLine();
            Console.Write("Enter maximum age (leave blank to skip): ");
            string? maxAgeStr = Console.ReadLine();

            Range<int>? ageRange = null;
            if (int.TryParse(minAgeStr, out int minAge) && int.TryParse(maxAgeStr, out int maxAge) && minAge <= maxAge)
            {
                ageRange = new Range<int>(minAge, maxAge);
            }

            var searchModel = new AppointmentSearchModel
            {
                PatientName = name,
                AppointmentDate = date,
                AgeRange = ageRange
            };

            var results = service.SearchAppointments(searchModel);
            PrintAppointments(results);
        }

        static void PrintAppointments(List<Appointment>? appointments)
        {
            if (appointments == null || appointments.Count == 0)
            {
                Console.WriteLine("No appointments found.");
                return;
            }

            Console.WriteLine("\nMatching Appointments:");
            foreach (var a in appointments)
            {
                Console.WriteLine($"Id: {a.Id}, Name: {a.PatientName}, Age: {a.PatientAge}, Date: {a.AppointmentDate:yyyy-MM-dd}, Reason: {a.Reason}");
            }
        }
    }
}
