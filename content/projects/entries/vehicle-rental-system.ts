import type { Project } from "../../types";

export const vehicleRentalSystem: Project = {
  slug: "vehicle-rental-system",
  name: "Vehicle Rental System",
  icon: "car",
  lang: "C++17 / SQLite",
  summary:
    "Full MVC rental management desktop app in C++17/Qt 6: SQLite persistence, SHA-256-hashed authentication with RBAC, reservation cost engine, and a dark-theme multi-view dashboard.",
  tags: [
    "MVC",
    "SQLite",
    "Qt 6",
    "Authentication",
  ],
  filters: ["software"],
  repo: "https://github.com/onouh/Vehicle-Rental-System",
  bullets: [
    "Architected a complete MVC desktop application in C++17 with Qt 6, separating views (login, dashboard, forms), controllers (AuthManager, RentalManager), and models (singleton DatabaseManager, entities).",
    "Implemented SHA-256 password hashing and role-based access control (Admin/Customer) over prepared SQLite statements to prevent injection, passing CodeQL review with zero vulnerabilities.",
    "Designed a three-table relational schema (Users, Vehicles, Reservations) with foreign-key constraints, automatic schema creation, and a singleton DatabaseManager exposing typed CRUD operations.",
    "Built the rental business logic: availability checks before booking, automatic rate × days cost calculation, and full reservation lifecycle tracking (active/completed/cancelled).",
  ],
};
