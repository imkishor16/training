namespace FirstAPI.Services
{
    public class AuthorizationService : IAuthorizationService
    {
        public async Task<AuthorizationResult> AuthorizeAsync(ClaimsPrincipal user, 
             object resource, IEnumerable<IAuthorizationRequirement> requirements)
        {
            // Create a tracking context from the authorization inputs.
            var authContext = _contextFactory.CreateContext(requirements, user, resource);

            // By default this returns an IEnumerable<IAuthorizationHandler> from DI.
            var handlers = await _handlers.GetHandlersAsync(authContext);

            // Invoke all handlers.
            foreach (var handler in handlers)
            {
                await handler.HandleAsync(authContext);
            }

            // Check the context, by default success is when all requirements have been met.
            return _evaluator.Evaluate(authContext);
        }
    }
}