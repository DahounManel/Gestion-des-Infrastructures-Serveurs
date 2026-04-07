# Rack & Component Management API

A local REST API built with Node.js, Express, and a SQLite database for managing racks and components. Handles user authentication using JWT and bcrypt, with distinct permission levels.

## Setup Instructions

1. Clone or download this project.
2. Run `npm install` to install all dependencies.
3. Ensure `.env` is set up. You can view `.env.example` for the required keys.
4. Run `npm run seed` to initialize the database and insert default users.
5. Run `npm run dev` to start the local development server (or `npm start` for production). Defaults to `http://localhost:3000`.

## Authentication Instructions

All endpoints under `/api/racks` and `/api/components` require an authorization token (JWT).
1. Send a `POST` request to `/api/auth/login` containing the `username` and `password` of an existing user.
    - `admin` / `admin123` (Superior)
    - `user` / `user123` (Regular)
2. Copy the `token` string returned in the response payload.
3. Set your headers for all subsequent requests exactly as follows:
   `Authorization: Bearer <your_copied_token>`
In Insomnia, you can use the built-in "Bearer Token" Auth tab to effortlessly pass this into the workspace.

## Roles Summary
- **Superior Users:** Can view, create, update, and delete any rack or component.
- **Regular Users:** Cannot create, update, or delete any hardware instance. Can only view records and their respective PDFs.

## API Endpoints Reference

### Authentication
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login and receive bearer token |

### Racks
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/racks` | Both | Get all racks |
| GET | `/api/racks/:id` | Both | Get single rack and nested components |
| POST | `/api/racks` | Superior | Create a new rack |
| PUT | `/api/racks/:id` | Superior | Update an existing rack |
| DELETE | `/api/racks/:id` | Superior | Delete a rack (and cascade delete its components) |

### Components
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/components` | Both | Get all components, query `?rack_id=` to filter down |
| GET | `/api/components/:id` | Both | Get single component detail |
| GET | `/api/components/:id/pdf` | Both | Streams/Downloads the component's PDF if it exists on disk |
| POST | `/api/components` | Superior | Add a new component mapped to a rack |
| PUT | `/api/components/:id` | Superior | Update an existing component |
| DELETE | `/api/components/:id` | Superior | Removes a component from the DB |

## Note on PDF Support
Stored PDFs should exist locally on the host server relative to the application's root execution context. Any manual PDF should be mapped correctly via the `pdf_path` column of its matching Component schema. Ex: `./files/something.pdf`.
