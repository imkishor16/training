
// using SecureFileAccess.Interfaces;
// using SecureFileAccess.Models;
// using SecureFileAccess.Exceptions;

// namespace SecureFileAccess.Proxy
// {
//     public class ProxyFile : IFile
//     {
//         private readonly string fileName;
//         private readonly User user;

//         public ProxyFile(string fileName, User user)
//         {
//             this.fileName = fileName;
//             this.user = user;
//         }

//         public void Read()
//         {
//             switch (user.Role.ToLower())
//             {
//                 case "admin":
//                     Console.WriteLine("[Access Granted] Reading sensitive file content...");
//                     break;

//                 case "user":
//                     Console.WriteLine("[Limited Access] Viewing file metadata only.");
//                     break;

//                 case "guest":
//                     throw new AccessDeniedException("[Access Denied] You do not have permission to read this file.");

//                 default:
//                     throw new AccessDeniedException("[Error] Unknown role.");
//             }
//         }
//     }
// }



using SecureFileAccess.Interfaces;
using SecureFileAccess.Models;
using SecureFileAccess.Exceptions;
using System;
using System.Collections.Generic;

namespace SecureFileAccess.Proxy
{
    public class ProxyFile : IFile
    {
        private readonly string fileName;
        private readonly User user;

        private static readonly Dictionary<string, List<string>> FileAccessRules = new()
        {
            { "SecretReport.txt", new List<string> { "admin" } },
            { "PublicInfo.txt", new List<string> { "admin", "user" } },
            { "InternalUse.docx", new List<string> { "admin", "user" } },
            { "GuestWelcome.txt", new List<string> { "admin", "user", "guest" } }
        };

        public ProxyFile(string fileName, User user)
        {
            this.fileName = fileName;
            this.user = user;
        }

        public void Read()
        {
            if (FileAccessRules.TryGetValue(fileName, out var allowedRoles))
            {
                if (allowedRoles.Contains(user.Role.ToLower()))
                {
                    Console.WriteLine($"[{user.Role} Access Granted] {user.Username} is reading file: {fileName}");
                }
                else
                {
                    throw new AccessDeniedException($"[{user.Role} Access Denied] {user.Username} is not allowed to read: {fileName}");
                }
            }
            else
            {
                throw new AccessDeniedException($"[Error] File '{fileName}' not found in access control list.");
            }
        }
    }
}
