// You have N users, and each user can have M posts (varies per user).

// Each post has:

// A caption (string)

// A number of likes (int)

// Store this in a jagged array, where each index represents one user's list of posts.

// Display all posts grouped by user.

// No file/database needed — console input/output only.

// Example output
// Enter number of users: 2

// User 1: How many posts? 2
// Enter caption for post 1: Sunset at beach
// Enter likes: 150
// Enter caption for post 2: Coffee time
// Enter likes: 89

// User 2: How many posts? 1
// Enter caption for post 1: Hiking adventure
// Enter likes: 230

// --- Displaying Instagram Posts ---
// User 1:
// Post 1 - Caption: Sunset at beach | Likes: 150
// Post 2 - Caption: Coffee time | Likes: 89

// User 2:
// Post 1 - Caption: Hiking adventure | Likes: 230


// Test case
// | User | Number of Posts | Post Captions        | Likes      |
// | ---- | --------------- | -------------------- | ---------- |
// | 1    | 2               | "Lunch", "Road Trip" | 40, 120    |
// | 2    | 1               | "Workout"            | 75         |
// | 3    | 3               | "Book", "Tea", "Cat" | 30, 15, 60 |


// using System;

// namespace InstagramPostsApp
// {

//     struct Post
//     {
//         public string Caption;
//         public int Likes;
//     }

//     class Program
//     {
//         static void Main(string[] args)
//         {
//             Console.Write("Please enter number of users: ");
//             int numUsers = int.Parse(Console.ReadLine());


//             Post[][] userPosts = new Post[numUsers][];

//             for (int i = 0; i < numUsers; i++)
//             {
//                 Console.WriteLine($"\nUser {i + 1}: How many posts?");
//                 int numPosts = int.Parse(Console.ReadLine());

//                 userPosts[i] = new Post[numPosts];

//                 for (int j = 0; j < numPosts; j++)
//                 {
//                     Console.Write($"Please enter caption for post {j + 1}: ");
//                     string caption = Console.ReadLine();

//                     Console.Write("Please enter likes: ");
//                     int likes = int.Parse(Console.ReadLine());

//                     userPosts[i][j] = new Post { Caption = caption, Likes = likes };
//                 }
//             }


//             Console.WriteLine("\n--- Displaying Instagram Posts ---");

//             for (int i = 0; i < userPosts.Length; i++)
//             {
//                 Console.WriteLine($"User {i + 1}:");

//                 for (int j = 0; j < userPosts[i].Length; j++)
//                 {
//                     Console.WriteLine($"Post {j + 1} - Caption: {userPosts[i][j].Caption} | Likes: {userPosts[i][j].Likes}");
//                 }

//                 Console.WriteLine();
//             }

//             Console.WriteLine("Press any key to exit...");
//             Console.ReadKey();
//         }
//     }
// }




/* 
Collection Questions 

Colour Code:  

Green – Print by the application 

This is printed by the application 

Blue – Sample Input given by user 

This is printed by the application 

 

 Preparation 

Create the Employee class as below. 

class Employee 

    { 

        int id, age; 

        string name; 

        double salary; 

	 

        public Employee() 

        { 

        } 

 

        public Employee(int id, int age, string name, double salary) 

        { 

            this.id = id; 

            this.age = age; 

            this.name = name; 

            this.salary = salary; 

        } 

 

        public void TakeEmployeeDetailsFromUser() 

        { 

            Console.WriteLine("Please enter the employee ID"); 

            id = Convert.ToInt32(Console.ReadLine()); 

            Console.WriteLine("Please enter the employee name"); 

            name = Console.ReadLine(); 

            Console.WriteLine("Please enter the employee age"); 

            age = Convert.ToInt32(Console.ReadLine()); 

            Console.WriteLine("Please enter the employee salary"); 

            salary = Convert.ToDouble(Console.ReadLine()); 

        } 

 

        public override string ToString() 

        { 

            return "Employee ID : " + id + "\nName : " + name + "\nAge : " + age + "\nSalary : " + salary; 

        } 

 

        public int Id { get => id; set => id = value; } 

        public int Age { get => age; set => age = value; } 

        public string Name { get => name; set => name = value; } 

        public double Salary { get => salary; set => salary = value; } 

    } 

Easy: 

Create a C# console application which has a class with name “EmployeePromotion” that will take employee names in the order in which they are eligible for promotion.  

Example Input:  

Please enter the employee names in the order of their eligibility for promotion(Please enter blank to stop) 

Ramu 

Bimu 

Somu 

Gomu 

Vimu 

Create a collection that will hold the employee names in the same order that they are inserted. 

Hint – choose the correct collection that will preserve the input order (List) 

Use the application created for question 1 and in the same class do the following 

Given an employee name find his position in the promotion list 

Example Input:  

Please enter the employee names in the order of their eligibility for promotion 

Ramu 

Bimu 

Somu 

Gomu 

Vimu 

Please enter the name of the employee to check promotion position 

Somu 

“Somu” is the the position 3 for promotion. 

Hint – Choose the correct method that will give back the index (IndexOf) 

Use the application created for question 1 and in the same class do the following 

 The application seems to be using some excess memory for storing the name, contain the space by using only the quantity of memory that is required. 

Example Input:  

Please enter the employee names in the order of their eligibility for promotion 

Ramu 

Bimu 

Somu 

Gomu 

Vimu 

The current size of the collection is 8 

The size after removing the extra space is 5 

Hint – List multiples the memory when we add elements, ensure you use only the size that is equal to the number of elements that are present. 

Use the application created for question 1 and in the same class do the following 

The need for the list is over as all the employees are promoted. Not print all the employee names in ascending order. 

Example Input:  

Please enter the employee names in the order of their eligibility for promotion 

Ramu 

Bimu 

Somu 

Gomu 

Vimu 

Promoted employee list: 

Bimu 

Gomu 

Ramu 

Somu 

Vimu 

Medium 

Create an application that will take employee details (Use the employee class) and store it in a collection  

The collection should be able to give back the employee object if the employee id is provided. 

Hint – Use a collection that will store key-value pair. 

The ID of employee can never be null or have duplicate values. 

Use the application created for question 1. Store all the elements in the collection in a list. 

Sort the employees based on their salary.  

Hint – Implement the IComparable interface in the Employee class. 

Given an employee id find the employee and print the details. 

Hint – Use a LINQ with a where clause. 

Use the application created for question 2. Find all the employees with the given name (Name to be taken from user) 

Use the application created for question 3. Find all the employees who are elder than a given employee (Employee given by user) 

Hard 

Use the application created in Question 1 of medium.  

Display a menu to user which will enable to print all the employee details, add an employee, modify the details of an employee (all except id), print an employee details given his id and delete an employee from the collection 

Ensure the application does not break at any point. Handles all the cases with proper response 

Example – If user enters an employee id that does not exists the response should inform the user the same.  */



using System;
using System.Collections.Generic;
using System.Linq;

namespace EmployeeManagementApp
{
    class Program
    {
        static void Main()
        {
            EmployeeManager employeeManager = new EmployeeManager();
            PromotionManager promotionManager = new PromotionManager();

            while (true)
            {
              
                Console.WriteLine("\n---- Promotion Management Menu ----");
                Console.WriteLine("1. Add Employees for Promotion");
                Console.WriteLine("2. Display Promotion List");
                Console.WriteLine("3. Find Promotion Position of an Employee");
                Console.WriteLine("4. Trim Excess Memory of Promotion List");
                Console.WriteLine("5. Display Sorted Promoted List");
                Console.WriteLine("\n---- Employee Management Menu ----");
                Console.WriteLine("6. Add Employee (Full Details)");
                Console.WriteLine("7. Print All Employees");
                Console.WriteLine("8. Find Employee by ID");
                Console.WriteLine("9. Find Employees by Name");
                Console.WriteLine("10. Find Employees Elder Than Given Employee");
                Console.WriteLine("11. Modify Employee Details");
                Console.WriteLine("12. Delete Employee by ID");
                Console.WriteLine("0. Exit");
                Console.Write("Select an option: ");

                string input = Console.ReadLine();

                switch (input)
                {
                    case "1": promotionManager.CollectPromotionNames(); break;
                    case "2": promotionManager.DisplayPromotionList(); break;
                    case "3": promotionManager.FindPromotionPosition(); break;
                    case "4": promotionManager.TrimListMemory(); break;
                    case "5": promotionManager.DisplaySortedPromotedList(); break;
                    case "6": employeeManager.AddEmployee(); break;
                    case "7": employeeManager.PrintAllEmployees(); break;
                    case "8": employeeManager.FindEmployeeById(); break;
                    case "9": employeeManager.FindEmployeesByName(); break;
                    case "10": employeeManager.FindElders(); break;
                    case "11": employeeManager.ModifyEmployee(); break;
                    case "12": employeeManager.DeleteEmployee(); break;
                    case "0": return;
                    default: Console.WriteLine("Invalid option. Try again."); break;
                }
            }
        }
    }

    class PromotionManager
    {
        private List<string> promotionList = new List<string>();

        public void CollectPromotionNames()
        {
            promotionList.Clear();
            Console.WriteLine("Enter employee names in the order of eligibility (blank to stop):");

            while (true)
            {
                string name = Console.ReadLine()?.Trim();
                if (string.IsNullOrEmpty(name)) break;
                promotionList.Add(name);
            }
        }

        public void DisplayPromotionList()
        {
            Console.WriteLine("\n--- Promotion Eligibility List ---");
            for (int i = 0; i < promotionList.Count; i++)
            {
                Console.WriteLine($"{i + 1}. {promotionList[i]}");
            }
        }

        public void FindPromotionPosition()
        {
            Console.Write("Enter employee name to check position: ");
            string name = Console.ReadLine()?.Trim();

            int index = promotionList.IndexOf(name);
            if (index >= 0)
                Console.WriteLine($"{name} is at position {index + 1} for promotion.");
            else
                Console.WriteLine($"{name} is not in the promotion list.");
        }

        public void TrimListMemory()
        {
            Console.WriteLine($"Current size of the collection: {promotionList.Capacity}");
            promotionList.TrimExcess();
            Console.WriteLine($"Size after removing the extra space: {promotionList.Capacity}");
        }

        public void DisplaySortedPromotedList()
        {
            Console.WriteLine("Promoted employee list (sorted):");
            foreach (var name in promotionList.OrderBy(n => n))
            {
                Console.WriteLine(name);
            }
        }
    }

    class Employee : IComparable<Employee>
    {
        public int Id { get; set; }
        public int Age { get; set; }
        public string Name { get; set; }
        public double Salary { get; set; }

        public Employee() { }

        public Employee(int id, int age, string name, double salary)
        {
            Id = id;
            Age = age;
            Name = name;
            Salary = salary;
        }

        public void TakeEmployeeDetailsFromUser()
        {
            Console.Write("Enter ID: ");
            Id = Convert.ToInt32(Console.ReadLine());

            Console.Write("Enter Name: ");
            Name = Console.ReadLine();

            Console.Write("Enter Age: ");
            Age = Convert.ToInt32(Console.ReadLine());

            Console.Write("Enter Salary: ");
            Salary = Convert.ToDouble(Console.ReadLine());
        }

        public override string ToString()
        {
            return $"Employee ID: {Id}\nName: {Name}\nAge: {Age}\nSalary: {Salary}\n";
        }

        public int CompareTo(Employee other)
        {
            return Salary.CompareTo(other.Salary);
        }
    }

    class EmployeeManager
    {
        private Dictionary<int, Employee> employeeMap = new Dictionary<int, Employee>();

        public void AddEmployee()
        {
            Employee emp = new Employee();
            emp.TakeEmployeeDetailsFromUser();

            if (employeeMap.ContainsKey(emp.Id))
            {
                Console.WriteLine("Employee ID already exists.");
                return;
            }

            employeeMap.Add(emp.Id, emp);
            Console.WriteLine("Employee added.");
        }

        public void PrintAllEmployees()
        {
            if (employeeMap.Count == 0)
            {
                Console.WriteLine("No employees to display.");
                return;
            }

            var sortedList = employeeMap.Values.ToList();
            sortedList.Sort();

            Console.WriteLine("--- All Employees Sorted by Salary ---");
            foreach (var emp in sortedList)
                Console.WriteLine(emp);
        }

        public void FindEmployeeById()
        {
            Console.Write("Enter Employee ID: ");
            int id = int.Parse(Console.ReadLine());

            if (employeeMap.TryGetValue(id, out Employee emp))
            {
                Console.WriteLine("Employee Found:");
                Console.WriteLine(emp);
            }
            else
            {
                Console.WriteLine("Employee not found.");
            }
        }

        public void FindEmployeesByName()
        {
            Console.Write("Enter name to search: ");
            string name = Console.ReadLine();

            var matches = employeeMap.Values.Where(e => e.Name.Equals(name, StringComparison.OrdinalIgnoreCase)).ToList();

            if (matches.Count == 0)
            {
                Console.WriteLine("No employees found with that name.");
                return;
            }

            Console.WriteLine("--- Employees Found ---");
            foreach (var emp in matches)
                Console.WriteLine(emp);
        }

        public void FindElders()
        {
            Console.Write("Enter employee ID to compare age: ");
            int id = int.Parse(Console.ReadLine());

            if (!employeeMap.TryGetValue(id, out Employee target))
            {
                Console.WriteLine("Employee not found.");
                return;
            }

            var elders = employeeMap.Values.Where(e => e.Age > target.Age).ToList();

            if (elders.Count == 0)
            {
                Console.WriteLine("No employees older than the selected one.");
                return;
            }

            Console.WriteLine("--- Employees older than " + target.Name + " ---");
            foreach (var emp in elders)
                Console.WriteLine(emp);
        }

public void ModifyEmployee()
{
    Console.Write("Enter employee ID to modify: ");
    int id = int.Parse(Console.ReadLine());

    if (!employeeMap.TryGetValue(id, out Employee emp))
    {
        Console.WriteLine("Employee not found.");
        return;
    }

    Console.WriteLine("\nWhat would you like to modify?");
    Console.WriteLine("1. Name");
    Console.WriteLine("2. Age");
    Console.WriteLine("3. Salary");
    Console.Write("Enter your choice (1-3): ");

    string choice = Console.ReadLine();

    switch (choice)
    {
        case "1":
            Console.Write("Enter new name: ");
            emp.Name = Console.ReadLine();
            Console.WriteLine("Name updated.");
            break;

        case "2":
            Console.Write("Enter new age: ");
            emp.Age = int.Parse(Console.ReadLine());
            Console.WriteLine("Age updated.");
            break;

        case "3":
            Console.Write("Enter new salary: ");
            emp.Salary = double.Parse(Console.ReadLine());
            Console.WriteLine("Salary updated.");
            break;

        default:
            Console.WriteLine("Invalid choice. No changes made.");
            break;
    }
}


        public void DeleteEmployee()
        {
            Console.Write("Enter employee ID to delete: ");
            int id = int.Parse(Console.ReadLine());

            if (employeeMap.Remove(id))
            {
                Console.WriteLine("Employee removed.");
            }
            else
            {
                Console.WriteLine("Employee ID not found.");
            }
        }
    }
}




// Create a Dictionary<string, double> where the key is the product name and value is the price.
 
// Add 5 products
 
// Display all key-value pairs
 
// Search for a specific product and show its price
 
// Expected Concepts:
 
// Working with Dictionary<string, double>
 
// Searching with ContainsKey

// using System;
// using System.Collections.Generic;

// class Product
// {
//     static void Main()
//     {
//         Dictionary<string, double> products = new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase);

//         products.Add("Laptop", 55000.99);
//         products.Add("Headphones", 2999.50);
//         products.Add("Smartphone", 23000.00);
//         products.Add("Keyboard", 1500.75);
//         products.Add("Monitor", 8700.20);


//         System.Console.WriteLine("--Product List--");
//         foreach (var item in products)
//         {
//             System.Console.WriteLine($"Product: {item.Key}| Price:{item.Value}");
//         }

//         System.Console.WriteLine("\n Enter the name of the product to search: ");
//         string searchProduct = Console.ReadLine();

//         if (products.ContainsKey(searchProduct))
//         {
//             System.Console.WriteLine($"Price of {searchProduct} : {products[searchProduct]}");
//         }

//         else
//         {
//             Console.WriteLine($"{searchProduct} not found in the product list");
//         }
//     }
// }


// Is Dictionary more efficient than LINQ?