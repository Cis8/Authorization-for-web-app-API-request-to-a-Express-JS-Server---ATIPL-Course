# Authorization for web app API request to a Express JS Server - ATIPL Course

Okta resources, created with Pulumi, will be used to ease the process of authentication of a user that is accessing from a web app and is trying to get protected resources through REST APIs.

## Analysis of the System

The system is composed as follows:
- A JS backend server developed with the Express framework;
- An Angular web-app that serves as client;
- An Okta developer cli that will serve as identity provider;
- A java program that uses Pulumi to ease the creation of Okta resources.


### Express backend JS server

The backend server is just a simple Express based Javascript server that exposes 3 REST APIs:
- `/hello`
- `/whoami`
- `/tshirt`

The server is hosted on `http://localhost:8080`

PORT describes the port on which the server gonna be hosted (in our configuration is 8080).

CORS are used since the origin of the REST API is different from from the server's one.

OktaJwtVerifier is the library that allows the server to verify if the token passed in with the REST API from the angular web app is valid.

The method authenticationRequired has the objective to actually check the user token's validity. If it is not valid, a "401 - Unauthorized" code is returned.


### Angular web-app client

#### Organization and functionalities of the application

There are three main components: AppComponent, LoginComponent, and ProtectedComponent.

##### App Component

Is the component for the home page of the site.

In the HTML file of the component, there is some text that will help the user understand where he is and what he can to do.
`ngIf` are used in the HTML files to show some tags in case the user is or is not authenticated yet.
This simple addition to the tags helps improving the design of a more responsive application. For the developer is faster and more simple to have different content showed based on the client state.

Angular offers the useful feature of service injection to allow the developer to easily reference services through a clean Injection Pattern.
In the ts file instead we have the OktaAuthStateService injected in the component's constructor so that we have access to the user's authentication state, in order to show the proper content in the client page (through the `ngIf` clause in HTML tags).


##### Login Component

LoginComponent is responsible for redirecting the user to the Okta's sign in component, in order to login him into the webapp. It also allows the user to logout (once he is logged in).

The protected component will allow the user to request for the desired resources and then show them to him. For simplicity the JSON of the request body is rawly written as text in the response filed.

In case of missing token in the REST API request (suppose it has been sent with Postman, without a valid token) the erver will respond with "401 - Unauthorized". The server will use an Okta module to check the validity of the token.

In case of non-existing resource, the server will respond with a 404 error and the response field with tell the user that the user couldn't be found.

#### Modules and architecture

The Angular application is based on Angular v14.2.0 and uses some modules to get the work done, in particular:
- angular router
- okta auth
- okta sign in widget

##### Angular router

Allows to have a better management of the routes of the site.

In particular, allowed the possibility to protect the Protected Component with OktaAuthGuard. This guard is able to redirect the user to the okta sign in widget if he is trying to access the protected route while not logged in. After a successful log in, he will be redirected to the protected component.

Moreover it allows to define the callback route for the Okta Callback Component. The utility of this component is described under the "Okta Sign In Widget" section.

##### Okta Auth

Allows to check the authentication state of the user, to properly manage the layout of the site (like showing fields that should be visible only to authenticated users) and a better route manangement (like for the OktaAuthGuard that checks for the user authentication state when he's trying to access the Protected Component).

##### Okta Sign In Widget

Is the widget that the user is redirected to when he is asked to sign in. Peculiar is that the authentication with this widget will give to the user a temporary code that has to be passed in into the Okta Callback Component in order to be exchanged for the effective token. Then the user will be considered (by the OktaAuthState service) correctly logged in. At this point the user can access the protected Component and ask for the resources exposed by the server.

##### Proxy Conf File

proxy.conf.json file allows the API request rewriting so that they'll be formatted for the Express server. Basically, the API requests are formed by the string of text written in the input box in the Protected Component, appended to the base URL `http://localhost:8080`. For example, if we request for the resource 'tshirt', the API URL link will be `http://localhost:8080/tshirt`.
Since we use this Proxy configuration, the web upp must be launched with the optional argument --proxy-config. The full command is: ng serve -o --proxy-config proxy.conf.json


### Okta developer CLI

 Will serve as identety provider for the users that will authenticate in the web client and will try to access the protected resources of the backend.
 Has libraries both for Angular and JS, so that we can easily integrate the usage of this identity provider both in our client and in our backend server.
 
 This tool let us define an application to authenticate the users subscribed to such application. Once authenticated, a token is given to the user. Such token can be used to verify if the user has succesfully signed into through Okta.
 
 Said this, we will rely on Okta to ensure a secure and safe authentication process for our web-app client and to protect our server's APIs. Moreover, we will ease the developement of our client web-app interface since we will rely on the simple Okta Sign In Widget to implement the user authentication in our client application.
 
 The Okta developer CLI also let us define users. Given them some credentials they will be able to log in into Okta (through the web-app client) and then access the protected resources exposed by the backend server.
 
 
### Pulumi for Okta resources automated creation

[Pulumi](https://www.pulumi.com/product/) is a free, open source infrastructure as code tool, and works best with the Pulumi Service to make managing infrastructure secure, reliable, and hassle-free.


The Java program with the Pulumi libraries is used to automate the process of Okta resources creation. In the App.java file we define the creation of an Okta application and an Okta user. These resources are enough to test the functioning of the whole system.
