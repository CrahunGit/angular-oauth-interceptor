# angular-oauth-interceptor
Angular module that intercepts all http requests and adds the oauth bearer header. If requests fails due to forbidden access then tries to get the token and relaunches the request.

To configure it just add "username" and "password" keys to the sessionStorage object. Magic will do everything for you.
