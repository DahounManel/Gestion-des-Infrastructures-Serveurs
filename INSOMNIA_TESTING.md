# Insomnia Testing Guide

This document is a comprehensive step-by-step guide to testing every part of the Rack & Component Management API using Insomnia.

## Phase 1: Environment Setup in Insomnia
To avoid pasting your URL and Token repeatedly:
1. In Insomnia, click the **Environment Dropdown** (top left, usually says "Base Environment") and click **Manage Environments**.
2. Add a sub-environment (e.g., "Local API").
3. Paste the following JSON:
   ```json
   {
     "base_url": "http://localhost:3000/api",
     "token": ""
   }
   ```
4. Select this environment to make it active.
5. *For all routes that require authentication, go to the **Auth** tab in Insomnia, choose **Bearer Token**, and enter `{{ _.token }}`.*

---

## Phase 2: Authentication

### 1. Login as Superior User (Admin)
- **Method:** POST
- **URL:** `{{ _.base_url }}/auth/login`
- **Body (JSON):**
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Action:** Send request. Copy the `token` string from the response and paste it into your Insomnia environment variable `"token": "..."`.

---

## Phase 3: Racks (CRUD Testing)

### 2. Create a Rack
- **Method:** POST
- **URL:** `{{ _.base_url }}/racks`
- **Body (JSON):**
  ```json
  {
    "name": "Server Rack Alpha",
    "location": "Room 101, Row A",
    "description": "Main networking rack containing primary switches."
  }
  ```
- **Action:** Send. Should return `201 Created` with the new rack (ID 1).

### 3. Update the Rack
- **Method:** PUT
- **URL:** `{{ _.base_url }}/racks/1`
- **Body (JSON):**
  ```json
  {
    "location": "Room 102, Row B"
  }
  ```
- **Action:** Send. Expect `200 OK`. The location updates, while the name remains unchanged.

### 4. Get All Racks
- **Method:** GET
- **URL:** `{{ _.base_url }}/racks`
- **Action:** Send. Expect `200 OK` showing the rack in an array.

---

## Phase 4: Components (CRUD Testing)

### 5. Create a Component
- **Method:** POST
- **URL:** `{{ _.base_url }}/components`
- **Body (JSON):**
  ```json
  {
    "rack_id": 1,
    "name": "Cisco Switch WS-C2960",
    "type": "Network Switch",
    "serial_number": "FOC12345678",
    "pdf_path": "./files/cisco_manual.pdf",
    "description": "Primary switch for network layer"
  }
  ```
- **Action:** Send. Expect `201 Created` with the component (ID 1).
- **Test Error:** Try creating with `"rack_id": 9999` to see the `400 Bad Request` schema validation.

### 6. Update the Component
- **Method:** PUT
- **URL:** `{{ _.base_url }}/components/1`
- **Body (JSON):**
  ```json
  {
    "serial_number": "FOC-UPDATED-888"
  }
  ```
- **Action:** Send. Expect `200 OK`. 

### 7. Get All Components (with Filter)
- **Method:** GET
- **URL:** `{{ _.base_url }}/components?rack_id=1`
- **Action:** Send. Expect `200 OK` with your new component array.

### 8. Get Single Rack (Nested Components check)
- **Method:** GET
- **URL:** `{{ _.base_url }}/racks/1`
- **Action:** Send. Expect `200 OK`. You should see the rack details alongside a `components: [ ... ]` nested field containing the Cisco Switch.

---

## Phase 5: Testing PDF Serving

### 9. Get Component PDF (File Not Found Demo)
- **Method:** GET
- **URL:** `{{ _.base_url }}/components/1/pdf`
- **Action:** Send. Expect `404 Not Found` with message: `"PDF file not found on server."` because `./files/cisco_manual.pdf` doesn't physically exist on your disk yet.
- **How to fix and test `200 OK`:** Create a `files` folder in the project (`some weird api/files`), drop a real PDF in there named `cisco_manual.pdf`, and hit Send again. Insomnia will stream and open/download the PDF cleanly.

---

## Phase 6: Role Restrictions (Regular User Testing)

### 10. Login as Regular User
- **Method:** POST
- **URL:** `{{ _.base_url }}/auth/login`
- **Body (JSON):**
  ```json
  {
    "username": "user",
    "password": "user123"
  }
  ```
- **Action:** Send. Copy this new token into the Insomnia environment `"token"` box.

### 11. Test Restriction (403 Forbidden)
- **Method:** POST
- **URL:** `{{ _.base_url }}/racks`
- **Body (JSON):** *Any JSON*
- **Action:** Send. Because you are a 'regular' user, you will get a `403 Forbidden` rejecting you from modifying hardware.

### 12. Test Approval (200 OK)
- **Method:** GET
- **URL:** `{{ _.base_url }}/racks`
- **Action:** Send. You will get `200 OK` back because regular users *can* read endpoints natively.

---

## Phase 7: Cascading Deletion

*Re-login as Admin (Action #1) and update the token environment variable so you have permission to delete.*

### 13. Delete the Rack
- **Method:** DELETE
- **URL:** `{{ _.base_url }}/racks/1`
- **Action:** Send. Expect `200 OK` successfully deleting "Server Rack Alpha".
- **Cascading Test:** Immediately run a `GET {{ _.base_url }}/components` command. You will see that the Cisco Switch component was **automatically destroyed** by the SQLite cascading foreign key, returning an empty array.
