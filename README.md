# Bitespeed - Identify Endpoint

This repository implements the `/identify` endpoint for the Bitespeed task. The endpoint collects contact details from shoppers and consolidates them according to the business rules.

## Endpoint Details

- **URL:** `/identify`
- **Method:** `POST`
- **Content-Type:** `application/json`
- **Request Payload Example:**
  ```json
  {
    "email": "lorraine@hillvalley.edu",
    "phoneNumber": "123456"
  }
  ```
- **Response Example:**
  ```json
  {
    "contact": {
      "primaryContactId": 1,
      "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
      "phoneNumbers": ["123456"],
      "secondaryContactIds": [2]
    }
  }
  ```

## How to Run Locally

1. **Clone the repository:**
   ```
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```
2. **Install dependencies:**
   ```
   npm install
   ```
3. **Start the server:**
   ```
   npm start
   ```
   The server will run on port 3000 by default. You can test the endpoint locally at `http://localhost:3000/identify`.

