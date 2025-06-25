# QuickBill - Invoice Generator

A full-stack MERN application for generating and managing invoices.

## Features

- User authentication and authorization with JWT
- Client management
- Invoice creation with dynamic line items
- PDF generation and download
- Email invoices to clients
- Dashboard for invoice and client management
- Responsive design for all devices

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, jsPDF
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Email**: Nodemailer

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Create `.env` file in the server directory
   - Add the following variables:
     ```
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     EMAIL_USER=your_email_address
     EMAIL_PASS=your_email_password
     ```

4. Run the application:
   ```
   npm run dev
   ```

## Project Structure

The project follows a modular structure:

- **client**: Frontend React application
  - components, pages, services, utils

- **server**: Backend Node.js application
  - controllers, routes, models, middleware, utils

## License

MIT 