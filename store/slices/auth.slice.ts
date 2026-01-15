import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Query } from "react-native-appwrite";
import { authService } from "../../services/appwrite/auth.service";
import { COLLECTIONS } from "../../services/appwrite/collections";
import { databaseService } from "../../services/appwrite/database.service";
import { studentService } from "../../services/student.service";
import { userService } from "../../services/user.service";
import { User, UserPayload } from "../../types/user.type";

/* ---------- STATE TYPE ---------- */

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  role: User["role"] | null;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  role: null,
  error: null,
};

export const signUp = createAsyncThunk(
  "auth/signUp",
  async (
    payload: {
      email: string;
      password: string;
      name: string;
      role: User["role"];
      institutionId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await authService.signUp(payload);
      const account = await authService.getCurrentAccount();
      if (!account) throw new Error("No session after signup");
      const res = await databaseService.list<User>(
        COLLECTIONS.USERS,
        [Query.equal("userId", account!.$id)]
      );

      return res.documents[0];
    } catch (err) {
      return rejectWithValue((err as Error).message || "Signup failed");
    }
  }
);


/* ---------- ASYNC THUNKS ---------- */

// Restore session on app start
export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      const account = await authService.getCurrentAccount();
      if (!account) return null;

      // Try fetching as User (Teacher/Admin) first
      try {
        const user = await userService.get(account.$id);
        return user;
      } catch (error) {
        // If not found, try as Student
        try {
          const student = await studentService.get(account.$id);
          // Normalize student to match User interface
          // If student.user is not expanded (because of removed select), we use account details
          return {
            ...student,
            $id: student.$id,
            userId: account.$id,
            name: student.name || account.name,
            email: student.email || account.email,
            role: "STUDENT",
            institution: student.institution
          } as any as User;
        } catch (innerError) {
          console.error("Failed to restore session user", innerError);
          return rejectWithValue("Session restore failed");
        }
      }
    } catch (err) {
      return rejectWithValue("Session restore failed");
    }
  }
);

// Login
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password, type }: { email: string; password: string; type?: "student" | "teacher" },
    { rejectWithValue }
  ) => {
    try {
      // Prevent "Creation of a session is prohibited when a session is active"
      try {
        await authService.logout();
      } catch (e) {
        // Ignore if no session or failed
      }

      await authService.login(email, password);
      const account = await authService.getCurrentAccount();
      if (!account) throw new Error("No session");

      let user: User;

      if (type === "student") {
        const student = await studentService.get(account.$id);
        user = {
          ...student,
          $id: student.$id,
          userId: account.$id,
          name: student.name || account.name,
          email: student.email || account.email,
          role: "STUDENT",
          institution: student.institution
        } as any as User;
      } else {
        try {
          user = await userService.get(account.$id);
        } catch (e) {
          const student = await studentService.get(account.$id);
          user = {
            ...student,
            $id: student.$id,
            userId: account.$id,
            name: student.name || account.name,
            email: student.email || account.email,
            role: "STUDENT",
            institution: student.institution
          } as any as User;
        }
      }

      console.log("Login user data:", user);
      return user;
    } catch (err) {
      return rejectWithValue((err as Error).message || "Invalid credentials");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

// Update User Profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    { userId, data }: { userId: string; data: Partial<UserPayload> },
    { rejectWithValue }
  ) => {
    try {
      const updatedUser = await userService.update(userId, data as any);
      return updatedUser;
    } catch (err) {
      return rejectWithValue((err as Error).message || "Update failed");
    }
  }
);

/* ---------- SLICE ---------- */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Restore session
      .addCase(restoreSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log("Restored user:", action.payload);
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload;
          state.role = action.payload.role;
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload as User;
        state.role = "ADMIN";
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload as User;
        state.role = action.payload!.role;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

  },
});

export default authSlice.reducer;
