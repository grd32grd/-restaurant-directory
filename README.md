README for My Restaurant Directory

App Link: https://damp-forest-16844.herokuapp.com/ (deployment process not complete yet, that's to say app functionality isn't complete when using this link )
- Deployed using Terraform

How to Install The Necessary Dependencies using NPM:
- On the command line, enter the following commands to download the dependencies
    "npm i pug",
    "npm i express",
    "npm i connect-mongodb-session",
    "npm i express-session",
    "npm i mongodb"

- Once that is done, you should see a node_modules directory as well as a package-lock.json file.

How to Run The Server:
- On the command, enter the following command, "node database-initializer.js", to initialize the database that will contain all session, user, and order data.
- Then, enter the following command, "node server.js", to get the server running. You will then get the port number logged on the console. Enter the url below to access the home page.
    " localhost: 'PORT NUMBER' " (replace 'PORT NUMBER' with the port number)

Program Notes:
- You can simulate another 'session' by opening the page in an incognito tab.

Design Aspects:
- MongoDB database is stored in the cloud.
- Uses Terraform to deploy app.
- Uses DOM model to create certain HTML elements in client JS files.
- Incomporates RESTful design.
- Utilizes asynchronous javascript and XML.
- Makes use of mongoDB to store session, user, and order data.
- Utilizes express routes to handle requests.
- Pug templates used for the views.