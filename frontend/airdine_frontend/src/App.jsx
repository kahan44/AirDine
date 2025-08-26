import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ActivationProvider } from "./context/ActivationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import UserDashboard from "./components/user/UserDashboard";
import UserProfile from "./components/user/UserProfile";
import RestaurantDetail from "./components/restaurant/RestaurantDetail";
import RestaurantList from "./components/restaurant/RestaurantList";
import FavoritesPage from "./components/favorites/FavoritesPage";
import OffersPage from "./components/offers/OffersPage";
import BookingPage from "./components/bookings/BookingPage";
import AdminDashboard from "./components/admin/AdminDashboard";

function App() {
    return (
        <Router>
            <AuthProvider>
                <ActivationProvider>
                    <div className="App">
                        <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route
                            path="/user/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['customer']}>
                                    <UserDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute allowedRoles={['customer']}>
                                    <UserProfile />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/restaurants"
                            element={
                                <RestaurantList />
                            }
                        />

                        <Route
                            path="/restaurants/:id"
                            element={
                                <ProtectedRoute>
                                    <RestaurantDetail />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/favorites"
                            element={
                                <ProtectedRoute allowedRoles={['customer']}>
                                    <FavoritesPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/offers"
                            element={<OffersPage />}
                        />

                        <Route
                            path="/bookings"
                            element={
                                <ProtectedRoute allowedRoles={['customer']}>
                                    <BookingPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/restaurants/:id/book"
                            element={
                                <ProtectedRoute allowedRoles={['customer']}>
                                    <RestaurantDetail />
                                </ProtectedRoute>
                            }
                        />

                        
                        <Route path="/" element={<Home />} />
                    </Routes>
                </div>
            </ActivationProvider>
        </AuthProvider>
    </Router>
    );
}

export default App;
