# Tony's Timetable

<!-- [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) -->

## Description
 This project is a **Timetable Management System** designed for teachers and administrators to efficiently create and manage timetables. The platform allows users to enter course and student details, enabling the automated generation of timetables. Built with React and leveraging Supabase for authentication and database management, this system is optimized for administrative use in educational institutions.



## Features

- **User Authentication:** Login and registration functionality using Supabase.
- **Course Management:** Admins can create, update, and delete course schedules.
- **Courses on Display** Admins can view the active timetable of ongoing courses.
- **Responsive Design:** This is a webpage optimized for Desktop users.

## Screenshots

#### Login Page
![Login Page](../TonysTimeTable/src/assets/LoginPage.png)

#### Registration Page
![Registration Page](../TonysTimeTable/src/assets/RegistrationPage.png)

#### Display Timetable
![TimeTable Page](../TonysTimeTable/src/assets/TimeTablePage.png)
---

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Supabase project (for authentication and database)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/your-project.git
    cd your-project
    ```

2. Install Depdencies:
    ```bash
    npm install
    ```

3. Set up your environment variables: Create a .env file in the root directory and add your Supabase credentials:
    ```bash
    REACT_APP_SUPABASE_URL=your-supabase-url
    REACT_APP_SUPABASE_KEY=your-supabase-key
    ```

### Running the Project

1. To start the development server:
    ```bash
    npm start
    ```

2. The app will be running at http://localhost:3000.

### Building for Production

1. To create a production build:
    ```bash
    npm run build
    ```

2. This will bundle the application into the build/ folder, ready for deployment.

## Usage

Provide information on how the app works, such as:

Admin: Log in to create or update courses.

## Project Structuture
* /src/assets: Contains all image assets.
* /src/components: Contains React components.
* /src/pages: Contains the different pages of the app.
* /src/styles: Contains CSS files for the page layout design.
* /src/supabaseClient.js: Configures Supabase authentication.

## Contributing
Contributions are welcome! Please follow these steps:

1. Fork the project.
2. Create a new branch (git checkout -b feature/3. YourFeature).
3. Commit your changes (git commit -m 'Add some feature').
4. Push to the branch (git push origin feature/YourFeature).
5. Open a Pull Request.

## Authors and Contact

- **Will Kang** - [juneushk@student.unimelb.edu.au](mailto:juneushk@student.unimelb.edu.au)
- **Dave Gill** - [gillsd@student.unimelb.edu.au](mailto:gillsd@student.unimelb.edu.au)
- **Michelle Gu** - [mmgu@student.unimelb.edu.au](mailto:mmgu@student.unimelb.edu.au)
- **Nick Muir** - [nmuir@student.unimelb.edu.au ](mailto:nmuir@student.unimelb.edu.au )
- **Jason Suen** - [manchits@student.unimelb.edu.au](mailto:manchits@student.unimelb.edu.au)
