# Authorization for web app API request to a Express JS Server - ATIPL Course

Okta resources, created with Pulumi, will be used to ease the process of authentication of a user that is accessing from a web app and is trying to get protected resources through REST APIs.

## Summary

- [Analysis of the System](#analysis-of-the-system)
  - [Short overview of the system functioning](#short-overview-of-the-system-functioning)
  - [Express backend JS server](#express-backend-js-server)
  - [Anular web-app client](#angular-web-app-client)
  - [Okta developer CLI](#okta-developer-cli)
  - [Pulumi for Okta resources automated creation](#pulumi-for-okta-resources-automated-creation)
- [Personal observations on the developed system and on the used technologies](#personal-observations-on-the-developed-system-and-on-the-used-technologies)
  - [The simplicity of offering protected APIs](#the-simplicity-of-offering-protected-apis)
  - [Final observations on the system](#final-observations-on-the-system)

## Setup

Clone the github repository with `git clone https://github.com/Cis8/Authorization-for-web-app-API-request-to-a-Express-JS-Server---ATIPL-Course`

Then, from inside the cloned repository's directory run the command `docker compose up --build`

Now you can access the web app from `localhost:4200`

To signin in the login section, use _mario.rossi.example@okta.com_ as username and _justapassword_ as password.

## Analysis of the System

The system is composed as follows:
- A JS backend server developed with the Express framework
- An Angular web-app that serves as client
- An Okta developer cli that will serve as identity provider
- A java program that uses Pulumi to ease the creation of Okta resources

### Short overview of the system functioning

- First, the user accesses the client web app
- when the user attempts to sign in, or to access the protected component page, it is redirected to the Sign in widget offered by Okta
- after having submitted the login form, the authorization server of the Okta Developer CLI verifies the correctness of the users credentials
- in case the login is successful, the user is redirected to the home page of the web-app (or to the protected page if he has been previously redirecrted while trying to access that page)
- the user can now use the protected page to send REST API requests to the server to access the protected resources (the token given back from Okta after the user logged in is attached to the header of the http request)
- the token is verified by the backend, thanks to an Okta's library. If it is valid and the desired resource is present, then is sent back to the client. Otherwise, an error message is sent as response
- the success or the failure of the procedure is finally shown to the user


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

#### Modules and architecture

The Angular application is based on Angular v14.2.0 and uses some modules to get the work done, in particular:
- angular router
- okta auth
- okta sign in widget

##### Angular router

Allows to have a better management of the routes of the site.

In particular, allowed the possibility to protect the Protected Component with OktaAuthGuard. This guard is able to redirect the user to the okta sign in widget if he is trying to access the protected route while not logged in. After a successful log in, he will be redirected to the protected component.

Moreover it allows to define the callback route for the Okta Callback Component. The utility of this component is described under the [Okta Sign In Widget](#okta-sign-in-widget) section.

##### Okta Auth

Allows to check the authentication state of the user, to properly manage the layout of the site (like showing fields that should be visible only to authenticated users) and a better route manangement (like for the OktaAuthGuard that checks for the user authentication state when he's trying to access the Protected Component).

##### Okta Sign In Widget

Is the widget that the user is redirected to when he is asked to sign in. Peculiar is that the authentication with this widget will give to the user a temporary code that has to be passed in into the Okta Callback Component in order to be exchanged for the effective token. After the exchange is successfully concluded, the user will be considered (by the OktaAuthState service) correctly logged in. At this point the user can access the protected Component and ask for the resources exposed by the server.

##### Proxy Conf File

proxy.conf.json file allows the API request rewriting so that they'll be formatted for the Express server. Basically, the API requests are formed by the string of text written in the input box in the Protected Component, appended to the base URL `http://express:8080`. For example, if we request for the resource 'tshirt', the API URL link will be `http://express:8080/tshirt`.
Since we use this Proxy configuration, the web app must be launched with the optional argument --proxy-config. The full command is: `ng serve -o --proxy-config proxy.conf.json`

#### Organization and functionalities of the application

There are three main components: AppComponent, LoginComponent, and ProtectedComponent.
Moreover an important service is noteworthy: the FormService component.

##### App Component

Is the component for the home page of the site.

In the HTML file of the component there is some text that will help the user understand where he is and what he can do.
`ngIf` are used in the HTML files to show some tags in case the user is or is not authenticated yet.
This simple addition to the tags helps improving the design of a more responsive application. For the developer is faster and more simple to have different content showed based on the client state.

Angular offers the useful feature of service injection to allow the developer to easily reference services through a clean Injection Pattern.
In the ts file instead we have the OktaAuthStateService and OktaAuth services injected in the component's constructor. So we have access to the user's authentication state and the user's information in order to show the proper content in the client page (through the `ngIf` clause in HTML tags).


##### Login Component

LoginComponent is responsible for redirecting the user to the Okta's sign in component, in order to login him into the webapp. It also allows the user to logout (only if he is already logged in). For the user credentials refer to the [Setup](#setup) section.

###### Authentication flow

An async method is used to log the user in. The OktaAuth injected service offers the method `signInWithRedirect()`. Such a method will redirect the client's page to the Okta sign in page, where the user can fill the login form with its own credentials to be logged in. At this point, a temporary code generated from the Okta authentication server is given back to the client after the user has logged in. The client is now redirected to the OktaCallbackComponent, where the temporary code (passed along with the redirect URL) is parsed and exchanged for the actual token (using the OktaAuth service). The token is then stored and will be used by the protected component to send REST APIs requests with the token attached to them.

##### Protected Component

The protected component will allow the user to request for the desired resource and then show it to him. For simplicity, the JSON of the request body is rawly written as text in the response field.

When the user tries to access the page from the navbar while not being logged in, the application will redirect him to the Okta sign in page. From there, the process is analogous to the authentication's one described in the [Authentication flow](#authentication-flow) paragraph. The only difference is that after the callback to the OktaCallbackComponent the user will be redirected to the Protected Component page (where he was before being redirected) instead of being redirected to the homepage.

In case of missing token in the REST API request (suppose it has been sent with Postman, without a valid token) the server will respond with "401 unauthorized". The server will use an Okta module to check the validity of the token.

In case of requesting for a non-existing resource, the server will respond with a 404 error and the response field will tell the user that the resource couldn't be found.

In the .ts file we have the `GetResource()` method, that is invoked when the _Submit_ button in the client interface is clicked. Such a method creates first the headers to be attached to the REST API http request sent to the server. Then reads the value of the input field, that describes the desired resource to get (and is the final part of the API request itself). Finally it calls the `GetResource()` method from the `FormService` service to actually send the REST API request to the backend server. An observable is returned from the FormService's `GetResource()` method. We subscribe to that observable with a callback whose purpose is to:
- save the JSON body of the request in a variable, in the case the request was succesfull
- set the requestState to 1 if an error occurred

The HTML file of the Protected component will show the JSON body of the request if the requestState variable is equals to 0 (was successfull), an error message otherwise (requestState is 1).

##### FormService service

It is the service that actually sends the http REST API requests to the backend server. It functioning is really simple: the REST request is of the GET type, the given headers are attached to it and the name is concatenated with the given string (representing the resource name in our case).


### Okta developer CLI

 Will serve as identety provider for the users that will authenticate in the web client and will try to access the protected resources of the backend.
 Has libraries both for Angular and JS, so that we can easily integrate the usage of this identity provider both in our client and in our backend server.
 
 This tool let us define an application to authenticate the users subscribed to such application. Once authenticated, a token is given to the user. Such token can be used to verify if the user has succesfully signed in through Okta.
 
 Said this, we will rely on Okta to ensure a secure and safe authentication process for our web-app client and to protect our server's APIs. Moreover, we will ease the developement of our client web-app interface since we will rely on the simple Okta Sign In Widget to implement the user authentication in our client application.
 
 The Okta developer CLI also let us define users. Given them some credentials they will be able to log in into Okta (through the web-app client) and then access the protected resources exposed by the backend server. By the way, users will first have to verify their email in order to activate their account.
 
 
### Pulumi for Okta resources automated creation

[Pulumi](https://www.pulumi.com/product/) is a free, open source infrastructure as code tool.

Pulumi supports many programming languages to allow developers choose the one they prefer and fits the best for every use case.

The Java program with the Pulumi libraries is used to automate the process of Okta resources creation. In the App.java file we define the creation of an Okta application and an Okta user. Those resources are enough to test the functioning of the whole system.

In the App.java file we can notice how a builder pattern usage eases the definition of the resources to be instantiated. Several optional parameters can be omitted, while only the most relevant ones for the user can be appended to the builder.

We used the `OAuthBuilder` to build an `OAuth` object, that represents a SPA application in the Okta Developer CLI (in our case represents the one attached to the Angular web app).

The `UserArgs` builder instead was used to build the User object, that represents an user in our Okta organization. After the addition of an Okta user, he still have to verify his e-mail in order to activate his Okta account.

Documentation for the OAuth builder [here](https://www.pulumi.com/registry/packages/okta/api-docs/app/oauth/).
Documentation for the User builder [here](https://www.pulumi.com/registry/packages/okta/api-docs/user/user/).

## Personal observations on the developed system and on the used technologies

### The simplicity of offering protected APIs

#### Angular, both a simple and a powerful framework for single page applications developement

The simplicity of the system is for sure noteworthy. Angular is an efficient framework that allows an incredibly fast prototyping without closing the opportunity to develop a complex and sofisticated system.
The framework helps the developer in managing the architecture of the single web page application thanks to its Components. They allow to define an independent piece of the system, respecting the Single Responsibility Principle, improving the reusability of the code, the readability and the mantainability.  
These components are composed by 4 files:
- a .ts file, where relies the typescript logic of the component
- an HTML file, where the code of the view is written
- a spec file, for unit testing
- a style file, for a custom style (for example CSS) management of the relative component  

As cited previously, Angular offers also a powerful Injection pattern to inject services inside out components' ts files. This greatly eases the dependencies management, while offering various advantages, such as improving the mantainability and readability.

To manage all the async operations that occur while communicating with the backend server, an extensive usage of promises and obsarvables has been taken. These patterns are really helpful while dealing with http requests. As soon as any async request is accomplished, the view is updated.

#### Express, a server in a bunch of lines of code

The backend server written in JS using the Express framework, despite its simplicity, is extremely compact and works flawlessly for the project's purpose. It lets developers save tons of time when they need a specific server to support the testing of another system.  
Exposing the APIs was almost immediate.

#### Okta, a secure and powerful identity provider

Okta turned out into being a solid identity provider that allowed the integration of users authentication within our client and server. The Okta Develiper CLI allows to manage applications, authorization servers and users (and much more that we didn't need to use).  
Anyway, the most notable thing is that the powerful Okta's libraries for Angular and Node allowed us to integrate the user authentication and token verification with ease and clarity.

### Final observations on the system

Nowadays, setting up such a system is eased by powerful tools such as the ones used in this project.


On the other hand, years ago:
- the client web page had to be programmed by scratch with HTML, CSS and Javascript. Angular sped up this process
- the absence of frameworks such as express required the programmer to implement the server from scratch as well. Much more time was required since all the basic functionalities, like the ones required in our case, had to be programmed from zero
- the infrastructure as code  was born some years ago. It offered us the possibility to automatize the resource creation of Okta resources. Such an aproach reduces the manual intervention needed from the user (so it can also be inserted into any build management system) and reduces the chances of errors since it is scripted. Might be not so visible the advantages of such a technology in our case, but for bigger sistems, it will for sure be crucial for an efficient and safe resource creation routine
