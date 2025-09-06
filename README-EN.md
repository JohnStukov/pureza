# Pureza Project

This project is a web application built with React on the frontend and Appwrite as the backend. It serves as a solid foundation for creating modern web applications with authentication, user management, teams, products, and more.

## manage_users

This project is complemented by the manage_users project, which is an Appwrite function that provides a centralized API for managing user accounts within your Appwrite project. It is designed to be triggered by HTTP executions from your frontend or other services.

```bash
git clone https://github.com/JohnStukov/manage-users
```

## Main Features

*   **User Authentication:** Support for registration, login, and logout.
*   **Dashboard:** Home page for authenticated users.
*   **Settings Management:**
    *   **Users:** List, create, update, delete, and manage user status.
    *   **Teams:** List, create, update, and delete teams.
    *   **Products:** Full CRUD for product management.
    *   **Language:** Support for multiple languages (English and Spanish).
    *   **Theme:** Interface with light and dark themes.
*   **Centralized Error Handling:** A unified system for managing and displaying errors.
*   **Configuration with Environment Variables:** Use of a `.env` file for secure and flexible configuration.

## Prerequisites

*   **Node.js:** Execution environment for React.
*   **Docker:** To run the local instance of Appwrite.
*   **Appwrite CLI:** Installed on your system.

## Environment Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/JohnStukov/pureza
    cd pureza
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root of the project and add the following variables:

    ```
    REACT_APP_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
    REACT_APP_APPWRITE_PROJECT_ID=your_project_id
    REACT_APP_APPWRITE_DATABASE_ID=your_database_id
    REACT_APP_APPWRITE_PRODUCTS_COLLECTION_ID=your_products_collection_id
    REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID=your_manage_users_function_id
    ```

    **Note:** Replace `your_*` with the corresponding values from your Appwrite project.

## Appwrite Configuration

1.  **Start Appwrite:** Make sure your Appwrite instance (local or cloud) is running.

2.  **Authenticate with the Appwrite CLI:**
    ```bash
    appwrite login
    ```

3.  **Create Database and Collections:**
    Use the following Appwrite CLI commands to configure the necessary database and collections. Replace `$databaseId` with your database ID.

    *   **Products Collection (`products`):**
        ```bash
        appwrite databases createCollection --databaseId $databaseId --collectionId products --name "Products"
        appwrite databases createStringAttribute --databaseId $databaseId --collectionId products --key name --size 255 --required true
        appwrite databases createStringAttribute --databaseId $databaseId --collectionId products --key description --size 1000 --required false
        appwrite databases createFloatAttribute --databaseId $databaseId --collectionId products --key price --required true
        appwrite databases createIntegerAttribute --databaseId $databaseId --collectionId products --key stock --required true
        ```

    *   **Permissions for `products` (Example):**
        ```bash
        # Allow any user to read the products
        appwrite databases updateCollection --databaseId $databaseId --collectionId products --read "role:all"
        # Allow authenticated users to create, update, and delete products
        appwrite databases updateCollection --databaseId $databaseId --collectionId products --write "role:member"
        ```

    *   **Other Collections (POS):**
        You can adapt the previous commands to create other collections and their attributes according to your needs.

## Available Scripts

*   **`npm start`**: Starts the application in development mode.
*   **`npm run build`**: Compiles the application for production.
*   **`npm test`**: Runs the tests.
