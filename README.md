# CampusCarpoolSystem

This repository was created for submissions to the SDSC5003 course group project in 2025.

The project includes frontend (WeChat Mini Program), backend (Java / Spring Boot), and database (MySQL). It provides complete functionality: publishing itineraries, joining itineraries, viewing personal participation records, and more.



## Table of Contents

- Project Structure

- Technical Dependencies  

- Installation and Operation
  - Prepare Environment
  - Import Database
  - Start Backend
  - Start Frontend

- API Structure Description
- File Documentation



## Project Structure

``````bash
root/
├── 5003_project_p/            # WeChat Mini Program Frontend Code
├── 5003/             # Backend service code
├── 5003.sql      # Database Structure and Initial Data
└── README.md

``````



## Technical Dependencies

**Frontend (WeChat Mini Program)**

- WeChat Mini Program Framework
- WXML / WXSS / JavaScript

**Backend (Spring Boot)**

- Java 1.8
- Spring Boot 2.7.6
- Maven 3.8.1
- MyBatis-plus 3.1.0
- Lombok

**Database**

MySQL 8.0.31

Character set: ```utf8mb4```



## Installation and Operation

1. **Prerequisites**

   Make sure the following are installed:

   - IntelliJ IDEA Professional Edition
   - 微信开发者工具
   - MySQL 8.0.31
   - Navicat or other Database Management Tools

2. **Database Import**

   - open Navicat

   - run ```5003.sql```

   This file includes tables:

   - ```user```

   - ```carpool```

   - ```participant```

   And sample data.

3. **Backend Setup**

   - open the folder ```5003``` in IntelliJ IDEA Professional Edition

   - configure database connection in ```application.yml```

   - run ```Application.java```

   - backend is now running at: ```http://127.0.0.1:7001/```

4. **Frontend Setup**

   - import  the folder ```5003_project_p``` in 微信开发者工具 and create the project

   - open ```utils/api.js``` to make sure ```BASE_URL = http://127.0.0.1:7001/ ```

   - clear cache and compile

   

## API Structure Description

| Method | Path               | Description                                                  |
| ------ | ------------------ | ------------------------------------------------------------ |
| POST   | `/user/login`      | Log in using WeChat credentials and store user info into the `user` table |
| POST   | `/carpool/publish` | Publish a new carpool trip and save it into the `carpool` table |
| GET    | `/carpool/browse`  | Display carpool listings on the homepage; supports searching by origin and destination |
| GET    | `/carpool/history` | Display all carpool records related to the logged-in user    |
| POST   | `/carpool/finish`  | Allow the carpool creator to mark a trip as finished         |
| POST   | `/carpool/join`    | Join an existing carpool; save the record into the `participant` table |

Controllers are located in:
 `5003/src/main/java/com.cityu_dg._5003/controller/`



## File Documentation

```frontend```/

``````bash
5003_project_p/
├── pages/     # Pages(login,publish,mine,detail,index)
├── utils/     # API utility files
├── app.js     # Main logic file of the Mini Program
└── *.json     # All the configuration files
``````

```backend```/

``````bash
5003/src/main/java/com.cityu_dg._5003/
├── controller/		# Handles incoming HTTP requests and delegates tasks to the service layer
├── service/	 # Manages the core business logic, executing application workflows and transactions
├── mapper/		# Defines the data access interface for CRUD operations with the database
├── entity/		# Contains the Java classes that model and map directly to the database tables
├── req/	 # Holds Data Transfer Objects (DTOs) for encapsulating data received from the client
├── resp/	 # Holds Data Transfer Objects (DTOs) for structuring the response data sent back to the client
└── utils/		# Provides general utility classes and essential configuration for the application
``````

```database```/

``````bash
5003.sql	# Database schema + sample data for testing.
``````

