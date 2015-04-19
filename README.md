# angular-oauth-interceptor
Angular module that intercepts all http requests and adds the oauth bearer header. If requests fails due to forbidden access then tries to get the token and relaunches the request.

To configure it just add "username" and "password" keys to the sessionStorage object. You also need to set token endpoint url contants named URL_TOKEN and set a session service object that define getToken() function to retrieve the new token.
