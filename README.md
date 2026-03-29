# EmpowHerHub

## Description
EmpowHerHub is a mission-driven, full-stack platform designed to safely and effectively connect Women in Tech with Mentors and Corporate Sponsors. The system streamlines the professional growth journey through a robust role-based dashboard, multi-step profile verification, skill assessments, and opportunity tracking.

Key features include:
- **Role-Based Access Control**: Different experiences for Women, Mentors, Sponsors, and Admins.
- **Profile Verification**: A secure onboarding process for all participants.
- **Opportunites Hub**: Mentors and Sponsors can post and manage jobs, funding, and mentorship openings.
- **Skills Assessment**: Integrated testing to validate expertise.
- **Real-Time Dashboards**: Personalized views for tracking progress and applications.

## Technologies Used
- **Backend**: NestJS, TypeScript, JWT (Authentication), Swagger (API Documentation).
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide Icons.
- **Database**: PostgreSQL (Neon/Cloud-ready), Prisma (Schema management & migrations).
- **Performance**: Raw SQL query execution with `pg` for high-performance data operations.

---

## Setup Instructions

Follow these steps precisely to get your local development environment running.

### 1. Clone the repository
First, clone the project from GitHub and navigate into the root directory:
```bash
git clone https://github.com/your-username/EmpowHerHub.git
cd EmpowHerHub
```

### 2. Setup the Backend (empowher-backend)

1.  **Navigate and Install Dependencies**:
    ```bash
    cd empowher-backend
    npm install
    ```

2.  **Configure Environment Variables**:
    Create a file named `.env` in the `empowher-backend` folder and add the following (update with your database credentials):
    ```env
    PORT=3000
    DATABASE_URL="postgresql://user:password@localhost:5432/empowherdb?sslmode=require"
    JWT_SECRET="your_secure_random_secret_key"
    ```

3.  **Sync Database Schema**:
    Ensure your PostgreSQL database is running, then sync the schema using Prisma:
    ```bash
    npx prisma db push
    ```

4.  **Seed the Database**:
    Initialize the database with the default administrator account and sample data:
    ```bash
    npx ts-node prisma/seed.ts
    ```

5.  **Start the Backend**:
    ```bash
    npm run start:dev
    ```
    *The API will be available at [http://localhost:3000/api/v1](http://localhost:3000/api/v1) and the Swagger docs at [http://localhost:3000/api](http://localhost:3000/api).*

### 3. Setup the Frontend (empowher-frontend)

1.  **Navigate and Install Dependencies**:
    Open a **new terminal tab**, navigate to the frontend folder, and install:
    ```bash
    cd ../empowher-frontend
    npm install
    ```

2.  **Configure Environment Variables**:
    Create a file named `.env` in the `empowher-frontend` folder:
    ```env
    VITE_API_URL="http://localhost:3000/api/v1"
    ```

3.  **Start the Frontend**:
    ```bash
    npm run dev
    ```
    *The application will be accessible at [http://localhost:5173](http://localhost:5173).*

---

## Default Administrator Account
Once you have seeded the database, you can log in as an administrator to oversee users and approve profiles:

- **Email**: `admin@empowher.com`
- **Password**: `password123`

---

## 👥 Platform Roles & Flow
1.  **Women**: Register → Complete Profile → Take Assessment → Admin Approval → Access Opportunities.
2.  **Mentors**: Register → Expertise Setup → Admin Approval → Mentor Women.
3.  **Sponsors**: Register → Post Job/Funding Opportunities → Candidate Review.
4.  **Admins**: Full platform oversight, profile verification, and data management.

## License
MIT License
