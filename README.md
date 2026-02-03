# Teachora - The Ultimate School Management App

Teachora is a modern, full-featured mobile application designed to bridge the gap between school administration, teachers, and students. Built with **React Native (Expo)** and powered by **Appwrite**, it offers a seamless, role-based experience for managing every aspect of academic life.

---

## 🏛️ Architecture & Roles

The application is divided into three distinct environments (Sides), each tailored to a specific user role.

### 👑 1. Admin Side
*The Control Center for School Operations*

The Admin portal is designed for school administrators to manage configuration, users, and global settings.

#### **Key Modules:**
*   **Dashboard**: A centralized hub displaying key metrics and quick actions.
*   **Directory Management**:
    *   **Teachers**: Onboard new teachers, view profiles, and manage assignments.
    *   **Students**: Register students, manage enrollments, and oversee profiles.
    *   **Classes**: Create and organize class sections (e.g., "Grade 10-A").
*   **Academic Configuration**:
    *   **Courses**: Define the broader curriculum (e.g., "High School Math").
    *   **Subjects**: Manage specific subjects within courses.
    *   **Academic Years**: Set up and switch between current and past academic sessions.
    *   **Schedules**: Master schedule creation for all classes and teachers.
*   **Academic Operations**:
    *   **Assignments**: Oversee assignment distribution.
    *   **Promotions**: Manage end-of-year student promotions to the next grade.

---

### 👩‍🏫 2. Teacher Side
*The Classroom Companion*

The Teacher interface focuses on day-to-day classroom management and student interaction.

#### **Key Modules:**
*   **Smart Attendance**:
    *   **Take Attendance**: Quick, list-based attendance marking for assigned classes.
    *   **Attendance History**: accurate records of student presence/absence.
*   **Schedule & Planning**:
    *   **My Schedule**: Personal weekly timetable view.
    *   **Create Schedule**: Ability to schedule extra classes or sessions.
*   **Classroom Management**:
    *   **My Classes**: Direct access to student lists for assigned sections.
    *   **Student Individual Profiles**: Deep dive into a student's academic history.
*   **Academics**:
    *   **Assessments**: Create and manage tests/exams.
    *   **Assignments**: Post homework and track submissions.
    *   **Study Vault**: Share resources and study materials.

---

### 🎓 3. Student Side
*The Personal Academic Assistant*

The Student interface is built for engagement and staying on top of academic responsibilities.

#### **Key Modules:**
*   **Personal Dashboard**:
    *   **Today's Schedule**: Real-time view of the day's classes.
    *   **Announcements**: Important updates from the school.
*   **Academic Tracking**:
    *   **Assessments**: View exam schedules and results.
    *   **Attendance**: Monitor personal attendance records.
    *   **Assignments**: View pending homework and deadlines.
*   **Resources**:
    *   **Study Vault**: Access learning materials shared by teachers.
    *   **Calendar**: View school holidays and events.
*   **Profile**: Manage personal details and blood group info.

---

## 🛠️ Technical Implementation

### **Frontend**
*   **Framework**: [React Native](https://reactnative.dev/) with [Expo SDK 52](https://expo.dev/)
*   **Language**: TypeScript
*   **Styling**: [NativeWind (TailwindCSS)](https://www.nativewind.dev/) for rapid UI development.
*   **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing.
*   **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) for global state (Auth, UI).
*   **Animations**: `react-native-reanimated` for smooth UI interactions.

### **Backend (Appwrite)**
*   **Database**: Stores Users, Schools, Classes, Attendance, etc.
*   **Authentication**: Secure email/password login with session management.
*   **Storage**: File storage for profile pictures and study materials.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (LTS)
*   Expo Go app (for testing)
*   Appwrite Project (Cloud or Self-hosted)

### Installation Guide

1.  **Clone & Install**
    ```bash
    git clone https://github.com/your-username/teacher-assistant-app.git
    cd teacher-assistant-app
    npm install
    ```

2.  **Environment Configuration**
    Create a `.env` file in the root:
    ```env
    EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
    EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
    EXPO_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
    EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
    ```

3.  **Run the Application**
    ```bash
    npx expo start
    ```

---

## 📄 License

This project is open-source under the MIT License.
