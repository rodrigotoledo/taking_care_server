# Taking Care System API

![Database Schema Diagram](docs/erd.png) *(Placeholder for your ER diagram)*

## Project Overview

A RESTful API for medical practice management, built with Node.js, Express, and Sequelize (PostgreSQL). The system handles:

- Patient records
- Doctor profiles
- Medical appointments
- Pathology tracking
- Notification system

## Key Features

- JWT Authentication
- Advanced data validation
- Transactional emails/SMS
- Appointment scheduling with conflict prevention
- Medical record management
- Patient-doctor relationship tracking

## Technology Stack

| Component          | Technology               |
|--------------------|--------------------------|
| Backend Framework  | Node.js + Express        |
| ORM                | Sequelize                |
| Database           | PostgreSQL               |
| Authentication     | JWT                      |
| Notifications      | FCM, Twilio, Nodemailer  |
| Validation         | Joi                      |

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL 12+
- Redis (for queues)
- AWS CLI (if using S3)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/rodrigotoledo/taking_care_server.git
cd taking_care_server
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your credentials
```

### Database Setup

1. Create databases (dev/test/prod):

```bash
npx sequelize-cli db:drop && npx sequelize-cli db:create && npx sequelize-cli db:migrate
```

2. Seed initial data (optional):

```bash
npx sequelize-cli db:seed:all
```

## License

This project is licensed under the MIT License - see LICENSE for details.

### How to Generate the ER Diagram:

1. Just run

```bash
node scripts/generate-schema.js
```

The file will be saved in root folder as `schema.json`
