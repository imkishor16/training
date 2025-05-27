


// Design and implement a secure file access system using the Proxy Design Pattern in C#  The system should restrict access to sensitive files based on user roles.
 
// You are to create a system where:
 
// A File class represents a file that can be read.
 
// Access to files is controlled based on user roles (Admin, User, or Guest).
 
// A ProxyFile class acts as a substitute for direct access to the File class.
 
// The Proxy must enforce access control based on the user's role.
 
// Classes to Implement:
 
// IFile: An interface with a method Read().
 
// File: Implements IFile, simulates reading sensitive content.
 
// User: Contains username and role.
 
// ProxyFile: Implements IFile, holds a reference to the real File object and enforces access control.
 
// Access Control Rules:
 
// Admin: Full access to read.
 
// User: Limited access (e.g., only metadata).
 
// Guest: Access denied.
 
// Client Code:
 
// Takes user role as input.
 
// Attempts to read a file using ProxyFile.
 
// User: Alice | Role: Admin

// [Access Granted] Reading sensitive file content...
 
// User: Bob | Role: Guest

// [Access Denied] You do not have permission to read this file.

using SecureFileAccess.Repositories;
using SecureFileAccess.Services;

class Program
{
// Create a application that will read and write to a file. Please ensure the file is open and closed only once during the time of execution

    // public static void Main(string[] args)
    // {
    //     IFileHandler textFileHandler = new TextFileHandlerCreator().CreateFileHandler();
    //     textFileHandler.WriteToFile(["Hey", "what are u?"]);
    //     textFileHandler.ReadFromFile();

    //     IFileHandler csvFileHandler = new CSVFileHandlerCreator().CreateFileHandler();
    //     csvFileHandler.WriteToFile(["1, A, 123", "2,B, 234"]);
    //     csvFileHandler.ReadFromFile();
    // }

    static void Main(string[] args)
    {
        var userRepository = new UserRepository();
        var fileService = new FileService(userRepository);

        fileService.AccessFile("SecretReport.txt", "Alice");
        fileService.AccessFile("SecretReport.txt", "Bob");
        fileService.AccessFile("SecretReport.txt", "Charlie");
    }
}
