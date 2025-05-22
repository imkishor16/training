using System;
using System.Collections.Generic;
using WholeApplication.Models;
using WholeApplication.Services;
using WholeApplication.Repositories;
using WholeApplication.Interfaces;

namespace WholeApplication
{
    class Program
    {
        static IEmployeeService employeeService = new EmployeeService(new EmployeeRepository());

        static void Main(string[] args)
        {
            Console.WriteLine("=== Employee Management System ===");

           
            var emp1 = new Employee { Name = "Alice", Age = 30, Salary = 50000 };
            var emp2 = new Employee { Name = "Bob", Age = 40, Salary = 70000 };
            var emp3 = new Employee { Name = "Charlie", Age = 35, Salary = 60000 };

            int id1 = employeeService.AddEmployee(emp1);
            int id2 = employeeService.AddEmployee(emp2);
            int id3 = employeeService.AddEmployee(emp3);

            Console.WriteLine($"\nEmployees added with IDs: {id1}, {id2}, {id3}");

           
            Console.WriteLine("\n--- All Employees ---");
            var allEmployees = employeeService.SearchEmployee(new SearchModel());
            PrintEmployees(allEmployees);

           
            Console.WriteLine("\n--- Search by Name: 'bob' ---");
            var byName = employeeService.SearchEmployee(new SearchModel { Name = "bob" });
            PrintEmployees(byName);

            
            Console.WriteLine("\n--- Search by Age: 30 to 36 ---");
            var byAge = employeeService.SearchEmployee(new SearchModel
            {
                Age = new Range<int>(30, 36)
            });
            PrintEmployees(byAge);

           
            Console.WriteLine("\n--- Search by Salary: 55000 to 80000 ---");
            var bySalary = employeeService.SearchEmployee(new SearchModel
            {
                Salary = new Range<double>(55000, 80000)
            });
            PrintEmployees(bySalary);
        }

        static void PrintEmployees(List<Employee>? employees)
        {
            if (employees == null || employees.Count == 0)
            {
                Console.WriteLine("No employees found.");
                return;
            }

            foreach (var emp in employees)
            {
                Console.WriteLine($"Id: {emp.Id}, Name: {emp.Name}, Age: {emp.Age}, Salary: {emp.Salary}");
            }
        }
    }
}
