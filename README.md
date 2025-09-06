# Proyecto Pureza

Este proyecto es una aplicación web construida con React en el frontend y Appwrite como backend. Sirve como una base sólida para crear aplicaciones web modernas con funcionalidades de autenticación, gestión de usuarios, equipos, productos y más.

## manage_users

Este proyecto se complementa con el proyecto manage_users, es una función de Appwrite que proporciona una API centralizada para gestionar cuentas de usuario dentro de tu proyecto de Appwrite. Está diseñada para ser activada mediante ejecuciones HTTP desde tu frontend u otros servicios.


```bash
git clone https://github.com/JohnStukov/manage-users
```

## Características Principales

*   **Autenticación de Usuarios:** Soporte para registro, inicio de sesión y cierre de sesión.
*   **Panel de Control (Dashboard):** Página de inicio para usuarios autenticados.
*   **Gestión de Ajustes:**
    *   **Usuarios:** Listar, crear, actualizar, eliminar y gestionar el estado de los usuarios.
    *   **Equipos:** Listar, crear, actualizar y eliminar equipos.
    *   **Productos:** CRUD completo para la gestión de productos.
    *   **Idioma:** Soporte para múltiples idiomas (inglés y español).
    *   **Tema:** Interfaz con temas claro y oscuro.
*   **Manejo de Errores Centralizado:** Un sistema unificado para gestionar y mostrar errores.
*   **Configuración con Variables de Entorno:** Uso de un archivo `.env` para una configuración segura y flexible.

## Requisitos Previos

*   **Node.js:** Entorno de ejecución para React.
*   **Docker:** Para ejecutar la instancia local de Appwrite.
*   **Appwrite CLI:** Instalado en tu sistema.

## Configuración del Entorno

1.  **Clonar el Repositorio:**
    ```bash
    git clone https://github.com/JohnStukov/pureza
    cd pureza
    ```

2.  **Instalar Dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables:
    
    ```
    REACT_APP_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
    REACT_APP_APPWRITE_PROJECT_ID=tu_project_id
    REACT_APP_APPWRITE_DATABASE_ID=tu_database_id
    REACT_APP_APPWRITE_PRODUCTS_COLLECTION_ID=tu_products_collection_id
    REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID=tu_manage_users_function_id
    ```

    **Nota:** Reemplaza `tu_*` con los valores correspondientes de tu proyecto Appwrite.

## Configuración de Appwrite

1.  **Iniciar Appwrite:** Asegúrate de que tu instancia de Appwrite (local o en la nube) esté en ejecución.

2.  **Autenticación en la CLI de Appwrite:**
    ```bash
    appwrite login
    ```

3.  **Crear Base de Datos y Colecciones:**
    Usa los siguientes comandos de la CLI de Appwrite para configurar la base de datos y las colecciones necesarias. Reemplaza `$databaseId` con el ID de tu base de datos.

    *   **Colección de Productos (`products`):**
        ```bash
        appwrite databases createCollection --databaseId $databaseId --collectionId products --name "Products"
        appwrite databases createStringAttribute --databaseId $databaseId --collectionId products --key name --size 255 --required true
        appwrite databases createStringAttribute --databaseId $databaseId --collectionId products --key description --size 1000 --required false
        appwrite databases createFloatAttribute --databaseId $databaseId --collectionId products --key price --required true
        appwrite databases createIntegerAttribute --databaseId $databaseId --collectionId products --key stock --required true
        ```

    *   **Permisos para `products` (Ejemplo):**
        ```bash
        # Permite a cualquier usuario leer los productos
        appwrite databases updateCollection --databaseId $databaseId --collectionId products --read "role:all"
        # Permite a los usuarios autenticados crear, actualizar y eliminar productos
        appwrite databases updateCollection --databaseId $databaseId --collectionId products --write "role:member"
        ```

    *   **Otras Colecciones (POS):**
        Puedes adaptar los comandos anteriores para crear otras colecciones y sus atributos según tus necesidades.

## Scripts Disponibles

*   **`npm start`**: Inicia la aplicación en modo de desarrollo.
*   **`npm run build`**: Compila la aplicación para producción.
*   **`npm test`**: Ejecuta las pruebas.