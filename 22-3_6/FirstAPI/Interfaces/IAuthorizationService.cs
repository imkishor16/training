
namespace FirstAPI.Interfaces
{
    public interface IAuthorizationService
    {
        // IAuthorizationRequirement is a marker service with no methods, and the mechanism for tracking whether authorization is successful.
        Task<AuthorizationResult> AuthorizeAsync(ClaimsPrincipal user, object resource,
                                     IEnumerable<IAuthorizationRequirement> requirements);
        Task<AuthorizationResult> AuthorizeAsync(
                                ClaimsPrincipal user, object resource, string policyName);
    }
}